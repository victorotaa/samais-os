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

  return { filtros, pontuar, qualifica, scoreMinimo };
}
