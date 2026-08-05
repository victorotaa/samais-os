// filtro-radar.mjs — a doutrina de prospecção (radar/filtros.json) como código executável.
//
// Vive separado porque DOIS consumidores precisam aplicar exatamente o mesmo critério:
//   · scripts/radar-licitacoes.mjs  — na captação (o que entra da varredura do PNCP);
//   · scripts/indexar-mercado.mjs   — na memória (re-aplica a doutrina ATUAL ao histórico).
//
// A consequência é a que importa: quando um filtro é recalibrado, o índice de mercado
// se limpa sozinho na próxima indexação — sem precisar varrer o PNCP de novo. Doutrina
// nova vale para trás. Se cada script tivesse a sua cópia da regra, o histórico ficaria
// preso na versão dos filtros do dia em que foi captado.

import { readFileSync } from "node:fs";

/** Minúscula + sem acento — para casar "regulação" com "regulacao". */
export const normalizar = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const escRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Casamento por PALAVRA INTEIRA. Sem isso, "samu" casa dentro de "SAMUEL" — e o radar
// oferece show de rock como oportunidade de SAMU (aconteceu na primeira captação real).
const comoRegex = (norm) => new RegExp(`(^|[^a-z0-9])${escRegex(norm)}([^a-z0-9]|$)`);

/**
 * Compila radar/filtros.json em um avaliador.
 * @param {string} caminho caminho do filtros.json
 * @returns {{filtros:object, pontuar:(texto:string)=>{score:number,termos:string[],temNucleo:boolean,motivoDescarte:string|null}, qualifica:(texto:string)=>boolean}}
 */
export function carregarFiltros(caminho) {
  const filtros = JSON.parse(readFileSync(caminho, "utf8"));

  // Dedupe por forma normalizada: "central de regulação" e "central de regulacao" são o
  // MESMO termo depois de normalizar — contá-las duas vezes infla o score. Vale entre grupos.
  const jaVisto = new Set();
  const grupos = Object.entries(filtros.termos).map(([nome, g]) => ({
    nome,
    peso: g.peso,
    termos: g.lista
      .map((t) => ({ original: t, norm: normalizar(t) }))
      .filter((t) => (jaVisto.has(t.norm) ? false : (jaVisto.add(t.norm), true)))
      .map((t) => ({ ...t, re: comoRegex(t.norm) })),
  }));

  const exAbsoluto = (filtros.excluir?.absoluto?.lista || []).map(normalizar);
  const exInicio = (filtros.excluir?.se_no_inicio?.lista || []).map(normalizar);
  const exInicioLen = filtros.excluir?.se_no_inicio?.caracteres_inicio ?? 70;
  const exCondicional = (filtros.excluir?.condicional?.lista || []).map(normalizar);
  const scoreMinimo = filtros.score_minimo ?? 5;

  /** Pontua um texto de objeto. Retorna {score, termos, temNucleo, motivoDescarte}. */
  function pontuar(texto) {
    const t = normalizar(texto);
    let score = 0;
    const termos = [];
    let temNucleo = false;
    for (const g of grupos) {
      for (const termo of g.termos) {
        if (termo.re.test(t)) {
          score += g.peso;
          termos.push(termo.original);
          if (g.nome === "nucleo") temNucleo = true;
        }
      }
    }
    const inicio = t.slice(0, exInicioLen);
    const motivoDescarte =
        exAbsoluto.find((e) => t.includes(e)) ? "absoluto"
      : exInicio.find((e) => inicio.includes(e)) ? "compra-de-bem"
      : exCondicional.find((e) => t.includes(e)) && !temNucleo ? "condicional"
      : null;
    return { score, termos, temNucleo, motivoDescarte };
  }

  /** Passa pela doutrina? (score suficiente E nenhum motivo de descarte) */
  function qualifica(texto) {
    const r = pontuar(texto);
    return !r.motivoDescarte && r.score >= scoreMinimo;
  }

  return { filtros, pontuar, qualifica, scoreMinimo, mesesVigencia, derivarPorte, avaliar };

  // ---------------------------------------------------------------------------
  // Porte e iminência — derivados, nunca digitados, e aqui pelo mesmo motivo dos
  // termos: a captação e o reprocessamento do histórico precisam chegar ao MESMO
  // número. Se cada script dividisse o valor pela vigência do seu jeito, o mesmo
  // certame teria um valor mensal na semana e outro na memória.
  // ---------------------------------------------------------------------------

  /** Meses de vigência declarados; null quando o PNCP não publica as duas datas. */
  function mesesVigencia(o) {
    if (!o?.vigencia_inicio || !o?.vigencia_fim) return null;
    const a = Date.parse(String(o.vigencia_inicio).slice(0, 10));
    const b = Date.parse(String(o.vigencia_fim).slice(0, 10));
    if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
    return Math.max(1, Math.round((b - a) / 86400000 / 30.4375));
  }

  /**
   * O PNCP publica o valor TOTAL do certame (vigência inteira, às vezes plurianual).
   * O que decide se vale a conversa é o MENSAL — comparar o total com o piso mensal
   * infla o mercado em 12× ou mais.
   * @param {object} o oportunidade mapeada
   * @param {string} hojeISO data de referência AAAA-MM-DD (para dias_para_encerramento)
   */
  function derivarPorte(o, hojeISO) {
    const meses = mesesVigencia(o);
    const usados = meses ?? (filtros.vigencia_presumida_meses ?? 12);
    const mensal = o.valor_estimado != null ? Math.round(o.valor_estimado / usados) : null;
    const diasEnc = o.encerramento_proposta
      ? Math.round((Date.parse(String(o.encerramento_proposta).slice(0, 10)) - Date.parse(hojeISO)) / 86400000)
      : null;
    return {
      vigencia_meses: meses,
      vigencia_presumida: meses == null,
      vigencia_meses_usados: usados,
      valor_mensal_estimado: mensal,
      valor_nao_publicado: o.valor_estimado == null,
      dias_para_encerramento: diasEnc,
      iminente: diasEnc != null && diasEnc >= 0 && diasEnc <= (filtros.dias_iminente ?? 15),
      encerrado: diasEnc != null && diasEnc < 0,
    };
  }

  /**
   * A decisão inteira em um lugar: passa ou não passa, e por quê.
   * @returns {{ok:boolean, motivo:string|null, score:number, termos:string[], porte:object}}
   */
  function avaliar(o, hojeISO, ufsAlvo = []) {
    const { score, termos, temNucleo, motivoDescarte } = pontuar(o.objeto || "");
    const porte = derivarPorte(o, hojeISO);
    const nao = (motivo) => ({ ok: false, motivo, score, termos: [...new Set(termos)], porte });

    if (motivoDescarte === "absoluto" || motivoDescarte === "compra-de-bem") return nao("ruido");
    if (motivoDescarte === "condicional" && !temNucleo) return nao("ruido");
    if (score < scoreMinimo) return nao("score");
    if (ufsAlvo.length && !ufsAlvo.includes(o.uf)) return nao("uf");

    // Sem valor publicado NÃO se descarta: ausência de dado não é evidência de porte
    // pequeno (Princípio da Realidade). Entra sinalizado, para conferência manual.
    const piso = filtros.valor_minimo_mensal_estimado ?? 0;
    if (porte.valor_mensal_estimado != null && piso > 0 && porte.valor_mensal_estimado < piso) {
      return nao("porte");
    }
    return { ok: true, motivo: null, score, termos: [...new Set(termos)], porte };
  }
}
