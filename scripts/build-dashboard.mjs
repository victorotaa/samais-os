#!/usr/bin/env node
// build-dashboard.mjs — monta o pacote publicável do Samais-OS:
//   1. varre frentes/**/status.json, valida contra o schema e emite dashboard/data.json;
//   2. copia as ferramentas (ferramentas/*) para dentro de dashboard/, para que a home,
//      o cockpit e os apps sejam servidos pela MESMA URL.
//
// Node ESM, sem dependências externas (validador de schema mínimo escrito à mão).
//
// Uso:  node scripts/build-dashboard.mjs
// Falha (exit 1) se qualquer status.json for inválido contra o schema.
//
// IMPORTANTE: só o que está em dashboard/ vai ao ar. A camada confidencial
// (frentes/**/interpretacao.md, doutrina/) NUNCA é copiada para o bundle.

import { readFileSync, writeFileSync, readdirSync, statSync, cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FRENTES_DIR = join(ROOT, "frentes");
const SCHEMA_PATH = join(FRENTES_DIR, "_schema", "status.schema.json");
const OBRIG_DIR = join(ROOT, "obrigacoes");
const RADAR_SEMANAS_DIR = join(ROOT, "radar", "semanas");
const OBRIG_SCHEMA_PATH = join(OBRIG_DIR, "_schema", "obrigacao.schema.json");
const MERCADO_PATH = join(ROOT, "inteligencia", "mercado", "indice.json");
const IMPL_DIR = join(ROOT, "implantacao");
const IMPL_SCHEMA_PATH = join(IMPL_DIR, "_schema", "implantacao.schema.json");
const ROTEIRO_PATH = join(IMPL_DIR, "_schema", "roteiro-padrao.json");
const BRIEF_DIR = join(ROOT, "briefings");
const BRIEF_SCHEMA_PATH = join(BRIEF_DIR, "_schema", "briefing.schema.json");
const QUESTIONARIO_PATH = join(BRIEF_DIR, "_schema", "questionario-padrao.json");
const PRODUTOS_DIR = join(ROOT, "produtos");
const PRODUTO_SCHEMA_PATH = join(PRODUTOS_DIR, "_schema", "produto.schema.json");
const DASH_DIR = join(ROOT, "dashboard");
const OUT_PATH = join(DASH_DIR, "data.json");

// Dias antes do vencimento em que uma obrigação entra em ATENÇÃO, se não declarado.
const ALERTA_PADRAO_DIAS = 30;

// Ferramentas embarcadas no bundle: origem → destino dentro de dashboard/
const FERRAMENTAS = [
  { de: join(ROOT, "ferramentas", "despesas"), para: join(DASH_DIR, "despesas") },
  { de: join(ROOT, "ferramentas", "briefing"), para: join(DASH_DIR, "briefing") },
];

// Identidade visual canônica: doutrina/samais.css é a FONTE DE VERDADE dos tokens.
// O build a distribui para cada superfície do bundle — nenhuma página redeclara cores.
const CSS_CANONICO = join(ROOT, "doutrina", "samais.css");
const CSS_DESTINOS = [join(DASH_DIR, "samais.css"), join(DASH_DIR, "despesas", "samais.css"),
  join(DASH_DIR, "briefing", "samais.css")];

// A marca também é doutrina: o ícone de app vive em doutrina/ e é distribuído daqui, para
// que nenhuma superfície mantenha a sua própria versão (foi assim que a ferramenta de
// despesas acabou com um ícone na paleta antiga, #04060C/#D4A857).
const MARCA_ASSETS = [
  "marca-icone.svg", "marca-icone-maskable.svg",
  "marca-icone-180.png", "marca-icone-192.png", "marca-icone-512.png",
];
// Logotipos oficiais (Drive → doutrina/marca/) que o samais.css referencia por url()
// relativa. Precisam ficar AO LADO do CSS em cada superfície, senão a marca some.
const MARCA_OFICIAL = ["samais-logo-gold.svg", "samais-monograma-gold.svg"];
const MANIFESTO_OS = join(ROOT, "doutrina", "manifest-os.webmanifest");
// Toda superfície do bundle recebe marca e ícones: sem os SVGs ao lado do CSS, o
// url() relativo não resolve e a marca some justamente na página que vai para fora.
const SUPERFICIES = [DASH_DIR, join(DASH_DIR, "despesas"), join(DASH_DIR, "briefing")];

// ---------- validador de JSON Schema (subset draft-07) ----------
function validate(data, schema, path = "") {
  const errors = [];
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];

  const typeOk = (v, t) => {
    switch (t) {
      case "string": return typeof v === "string";
      case "number": return typeof v === "number";
      case "integer": return typeof v === "number" && Number.isInteger(v);
      case "boolean": return typeof v === "boolean";
      case "object": return v !== null && typeof v === "object" && !Array.isArray(v);
      case "array": return Array.isArray(v);
      case "null": return v === null;
      default: return true;
    }
  };

  if (types.length && !types.some((t) => typeOk(data, t))) {
    errors.push(`${path || "(raiz)"}: esperado tipo ${types.join("|")}, recebido ${data === null ? "null" : Array.isArray(data) ? "array" : typeof data}`);
    return errors; // sem tipo válido, não adianta checar o resto
  }

  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${path}: valor ${JSON.stringify(data)} fora do enum [${schema.enum.map((e) => JSON.stringify(e)).join(", ")}]`);
  }
  if (typeof data === "string") {
    if (schema.minLength != null && data.length < schema.minLength)
      errors.push(`${path}: string curta demais (min ${schema.minLength})`);
    if (schema.pattern && !new RegExp(schema.pattern).test(data))
      errors.push(`${path}: não casa com o padrão ${schema.pattern}`);
  }
  if (typeof data === "number") {
    if (schema.minimum != null && data < schema.minimum)
      errors.push(`${path}: ${data} < mínimo ${schema.minimum}`);
    if (schema.maximum != null && data > schema.maximum)
      errors.push(`${path}: ${data} > máximo ${schema.maximum}`);
  }
  if (typeOk(data, "object") && schema.properties) {
    for (const req of schema.required || []) {
      if (!(req in data)) errors.push(`${path}: campo obrigatório ausente: "${req}"`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in schema.properties)) errors.push(`${path}: propriedade não permitida: "${key}"`);
      }
    }
    for (const [key, sub] of Object.entries(schema.properties)) {
      if (key in data) errors.push(...validate(data[key], sub, path ? `${path}.${key}` : key));
    }
  }
  return errors;
}

// ---------- varredura das frentes ----------
function findStatusFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "_schema" || entry === "_template-frente") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...findStatusFiles(full));
    } else if (entry === "status.json") {
      found.push(full);
    }
  }
  return found;
}

const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
const files = findStatusFiles(FRENTES_DIR).sort();

const frentes = [];
const allErrors = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  let json;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    allErrors.push(`${rel}: JSON inválido — ${e.message}`);
    continue;
  }
  const errs = validate(json, schema);
  if (errs.length) {
    allErrors.push(...errs.map((e) => `${rel} → ${e}`));
    continue;
  }
  frentes.push({ ...json, _slug: rel.split("/")[1] });
}

// (a checagem de erros acontece depois das obrigações, para reportar tudo de uma vez)

// ---------- obrigações (calendário de prazos) ----------
const hojeISO = new Date().toISOString().slice(0, 10);
const diasEntre = (aISO, bISO) =>
  Math.round((Date.parse(aISO + "T00:00:00Z") - Date.parse(bISO + "T00:00:00Z")) / 86400000);

const obrigacoes = [];
if (existsSync(OBRIG_SCHEMA_PATH)) {
  const obrigSchema = JSON.parse(readFileSync(OBRIG_SCHEMA_PATH, "utf8"));
  const arquivos = readdirSync(OBRIG_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort();

  for (const arq of arquivos) {
    const full = join(OBRIG_DIR, arq);
    const rel = relative(ROOT, full);
    let json;
    try {
      json = JSON.parse(readFileSync(full, "utf8"));
    } catch (e) {
      allErrors.push(`${rel}: JSON inválido — ${e.message}`);
      continue;
    }
    const errs = validate(json, obrigSchema);
    if (errs.length) {
      allErrors.push(...errs.map((e) => `${rel} → ${e}`));
      continue;
    }
    // criticidade é DERIVADA da data — nunca digitada
    const dias = diasEntre(json.vence_em, hojeISO);
    const alerta = json.alerta_dias ?? ALERTA_PADRAO_DIAS;
    let criticidade;
    if (json.status === "arquivada") criticidade = "arquivada";
    else if (dias < 0) criticidade = "vencida";
    else if (dias <= 7) criticidade = "critica";
    else if (dias <= alerta) criticidade = "atencao";
    else criticidade = "ok";
    obrigacoes.push({ ...json, _slug: arq.replace(/\.json$/, ""), dias_restantes: dias, criticidade });
  }
}

// ---------- implantação (o que falta para cada frente contratada partir) ----------
// O roteiro é ÚNICO (roteiro-padrao.json); cada frente guarda só o estado de cada item.
// A prontidão é DERIVADA aqui — nunca digitada, pelo mesmo motivo da criticidade das
// obrigações: número que alguém digita é número que envelhece sem avisar.
let implantacao = null;
if (existsSync(ROTEIRO_PATH) && existsSync(IMPL_SCHEMA_PATH)) {
  const roteiro = JSON.parse(readFileSync(ROTEIRO_PATH, "utf8"));
  const implSchema = JSON.parse(readFileSync(IMPL_SCHEMA_PATH, "utf8"));
  const slugsValidos = new Set(frentes.map((f) => f._slug));
  const idsValidos = new Set(roteiro.blocos.flatMap((b) => b.itens.map((i) => i.id)));

  const arquivos = readdirSync(IMPL_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_")).sort();
  const porFrente = [];

  for (const arq of arquivos) {
    const full = join(IMPL_DIR, arq);
    const rel = relative(ROOT, full);
    let json;
    try { json = JSON.parse(readFileSync(full, "utf8")); }
    catch (e) { allErrors.push(`${rel}: JSON inválido — ${e.message}`); continue; }

    const errs = validate(json, implSchema);
    if (errs.length) { allErrors.push(...errs.map((e) => `${rel} → ${e}`)); continue; }

    // Integridade referencial: implantação órfã (frente que não existe) é dado morto.
    if (!slugsValidos.has(json.frente)) {
      allErrors.push(`${rel}: frente "${json.frente}" não existe em frentes/`);
      continue;
    }
    // Item de estado que não existe no roteiro = erro de digitação silencioso.
    for (const id of Object.keys(json.estados)) {
      if (!idsValidos.has(id)) allErrors.push(`${rel}: item "${id}" não existe no roteiro padrão`);
    }

    const frenteObj = frentes.find((f) => f._slug === json.frente);
    const blocos = roteiro.blocos.map((b) => {
      const itens = b.itens.map((i) => {
        const st = json.estados[i.id]?.estado ?? "pendente";
        return { ...i, critico: !!(i.critico || b.critico), estado: st, nota: json.estados[i.id]?.nota ?? null };
      });
      const contam = itens.filter((i) => i.estado !== "nao-se-aplica");
      const feitos = contam.filter((i) => i.estado === "concluido").length;
      return {
        id: b.id, nome: b.nome, critico: !!b.critico, itens,
        total: contam.length, concluidos: feitos,
        prontidao: contam.length ? Math.round((feitos / contam.length) * 100) : 100,
        bloqueados: itens.filter((i) => i.estado === "bloqueado").length,
      };
    });
    const todos = blocos.flatMap((b) => b.itens).filter((i) => i.estado !== "nao-se-aplica");
    const criticos = todos.filter((i) => i.critico);
    porFrente.push({
      frente: json.frente,
      titulo: frenteObj ? `${frenteObj.frente}/${frenteObj.uf}` : json.frente,
      situacao: json.situacao,
      responsavel: json.responsavel ?? null,
      atualizado_em: json.atualizado_em,
      prontidao: todos.length ? Math.round((todos.filter((i) => i.estado === "concluido").length / todos.length) * 100) : 0,
      prontidao_critica: criticos.length ? Math.round((criticos.filter((i) => i.estado === "concluido").length / criticos.length) * 100) : 100,
      criticos_pendentes: criticos.filter((i) => i.estado !== "concluido").length,
      bloqueados: todos.filter((i) => i.estado === "bloqueado").length,
      blocos,
    });
  }

  // menos pronto primeiro: é onde o risco mora
  porFrente.sort((a, b) => a.prontidao_critica - b.prontidao_critica || a.titulo.localeCompare(b.titulo, "pt-BR"));
  implantacao = { roteiro_versao: roteiro.versao, frentes: porFrente };
}

// ---------- briefings de levantamento ----------
// O painel é PÚBLICO. Uma resposta pode conter TAC com o MPT, salário, nome de respondente
// ou relato de óbito — então o bundle recebe o TEXTO só quando a pergunta é `publico` E a
// resposta não subiu a proteção. O resto vira "respondido · uso interno": a estrutura fica
// visível (dá para saber o que já foi levantado), o conteúdo não vaza.
let briefings = null;
if (existsSync(QUESTIONARIO_PATH) && existsSync(BRIEF_SCHEMA_PATH)) {
  const quest = JSON.parse(readFileSync(QUESTIONARIO_PATH, "utf8"));
  const briefSchema = JSON.parse(readFileSync(BRIEF_SCHEMA_PATH, "utf8"));
  const perguntaPorId = new Map();
  for (const b of quest.blocos) for (const q of b.itens ?? b.perguntas) perguntaPorId.set(q.id, { ...q, bloco: b.id });

  const NIVEL = { publico: 0, interno: 1, restrito: 2 };
  const coletados = [];

  for (const arq of readdirSync(BRIEF_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_")).sort()) {
    const full = join(BRIEF_DIR, arq);
    const rel = relative(ROOT, full);
    let json;
    try { json = JSON.parse(readFileSync(full, "utf8")); }
    catch (e) { allErrors.push(`${rel}: JSON inválido — ${e.message}`); continue; }

    const errs = validate(json, briefSchema);
    if (errs.length) { allErrors.push(...errs.map((e) => `${rel} → ${e}`)); continue; }
    for (const id of Object.keys(json.respostas)) {
      if (!perguntaPorId.has(id)) allErrors.push(`${rel}: pergunta "${id}" não existe no questionário padrão`);
    }

    const blocos = quest.blocos.map((b) => {
      const perguntasTodas = (b.itens ?? b.perguntas).map((q) => {
        const r = json.respostas[q.id];
        // "a levantar" e "não existe" TÊM registro mas NÃO são resposta — contar como
        // respondidas faria a completude mentir (foi o que aconteceu ao migrar Avaré).
        const respondida = r?.estado === "respondido";
        const sens = r?.sensibilidade_override && NIVEL[r.sensibilidade_override] > NIVEL[q.sensibilidade ?? "interno"]
          ? r.sensibilidade_override : (q.sensibilidade ?? "interno");
        const publicavel = sens === "publico";
        return {
          // `porque` NÃO viaja: cita a régua de preço por habitante, o Fator de Cobertura,
          // o fator de custo real e as lições de Avaré e Canoas — método comercial nosso,
          // e este bundle está em URL pública. Vai `para_que`, que diz para que serve a
          // resposta sem entregar como se calcula. O `porque` completo fica no repositório
          // e no dossiê (scripts/briefing-dossie.mjs), que não é publicado.
          id: q.id, pergunta: q.pergunta, para_que: q.para_que ?? null,
          essencial: !!q.essencial, novo: !!q.novo, sensibilidade: sens,
          respondida,
          estado: r?.estado ?? null,
          procedencia: r?.procedencia ?? null,
          // ⚠️ a resposta só viaja quando pode ser publicada
          resposta: respondida && publicavel ? (r.resposta ?? null) : null,
          nota: r && publicavel ? (r.nota ?? null) : null,
        };
      });
      // RESTRITO some inteiro do bundle — nem a pergunta. Mostrar "passivo trabalhista:
      // respondido" ao lado de um município nomeado já é informação, mesmo sem o texto.
      // Fica só a CONTAGEM, para o time saber que existe tratativa reservada ali.
      const perguntas = perguntasTodas.filter((q) => q.sensibilidade !== "restrito");
      const reservados = perguntasTodas.filter((q) => q.sensibilidade === "restrito").length;
      const total = perguntasTodas.length, respondidas = perguntasTodas.filter((q) => q.respondida).length;
      return { id: b.id, nome: b.nome, perguntas, reservados, total, respondidas,
               completude: total ? Math.round((respondidas / total) * 100) : 100 };
    });

    // Contagens sobre TODAS as perguntas (inclusive as reservadas): completude que ignora
    // o que existe é completude falsa.
    const todas = quest.blocos.flatMap((b) => (b.itens ?? b.perguntas)).map((q) => ({
      essencial: !!q.essencial,
      respondida: json.respostas[q.id]?.estado === "respondido",
      achado: json.respostas[q.id]?.estado === "nao-existe",
    }));
    const essenciais = todas.filter((q) => q.essencial);
    coletados.push({
      slug: json.slug, alvo: json.alvo, uf: json.uf, aplicado_em: json.aplicado_em,
      frente: json.frente ?? null,
      // respondente é dado pessoal: nunca vai ao bundle, só a existência
      tem_respondente: !!json.respondente,
      reservados: blocos.reduce((n, b) => n + b.reservados, 0),
      total: todas.length,
      respondidas: todas.filter((q) => q.respondida).length,
      completude: todas.length ? Math.round((todas.filter((q) => q.respondida).length / todas.length) * 100) : 0,
      achados: todas.filter((q) => q.achado).length,
      completude_essencial: essenciais.length
        ? Math.round((essenciais.filter((q) => q.respondida).length / essenciais.length) * 100) : 100,
      essenciais_pendentes: essenciais.filter((q) => !q.respondida).length,
      blocos,
    });
  }

  coletados.sort((a, b) => b.aplicado_em.localeCompare(a.aplicado_em));
  briefings = { questionario_versao: quest.versao, total_perguntas: perguntaPorId.size, coletados };
}

// ---------- produtos (como se acessa cada um: LP, sistema, documento) ----------
const produtos = [];
if (existsSync(PRODUTO_SCHEMA_PATH)) {
  const prodSchema = JSON.parse(readFileSync(PRODUTO_SCHEMA_PATH, "utf8"));
  for (const entry of readdirSync(PRODUTOS_DIR).sort()) {
    if (entry.startsWith("_")) continue;
    const full = join(PRODUTOS_DIR, entry, "produto.json");
    if (!existsSync(full)) continue;
    const rel = relative(ROOT, full);
    let json;
    try {
      json = JSON.parse(readFileSync(full, "utf8"));
    } catch (e) {
      allErrors.push(`${rel}: JSON inválido — ${e.message}`);
      continue;
    }
    const errs = validate(json, prodSchema);
    if (errs.length) {
      allErrors.push(...errs.map((e) => `${rel} → ${e}`));
      continue;
    }
    // `repo` fica NO ARQUIVO (é dado interno útil) mas NÃO vai ao bundle: dentro do
    // Samais-OS só entra funcionalidade que se abre, não endereço de código-fonte.
    // Sem este descarte o link vazaria pelo data.json mesmo sem aparecer na tela.
    const { repo, ...publicavel } = json;
    produtos.push({ ...publicavel, _slug: entry });
  }
  // o que dá para abrir agora vem primeiro; pendência de URL não fica no topo da home
  const verificados = (p) => p.links.filter((l) => l.url && l.procedencia === "verificado").length;
  produtos.sort((a, b) => verificados(b) - verificados(a) || a.produto.localeCompare(b.produto, "pt-BR"));
}

if (allErrors.length) {
  console.error("\n✖ Build falhou — arquivo(s) inválido(s):\n");
  for (const e of allErrors) console.error("  • " + e);
  console.error(`\n${allErrors.length} erro(s). Nenhum data.json gerado.\n`);
  process.exit(1);
}

// mais urgente primeiro
obrigacoes.sort((a, b) => a.dias_restantes - b.dias_restantes);
const ativas = obrigacoes.filter((o) => o.criticidade !== "arquivada");
const resumoObrig = {
  total: ativas.length,
  vencidas: ativas.filter((o) => o.criticidade === "vencida").length,
  criticas: ativas.filter((o) => o.criticidade === "critica").length,
  atencao: ativas.filter((o) => o.criticidade === "atencao").length,
};

// ---------- radar de licitações: expõe a semana mais recente ----------
let radar = null;
if (existsSync(RADAR_SEMANAS_DIR)) {
  const semanas = readdirSync(RADAR_SEMANAS_DIR).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
  const ultima = semanas[semanas.length - 1];
  if (ultima) {
    try {
      const pacote = JSON.parse(readFileSync(join(RADAR_SEMANAS_DIR, ultima), "utf8"));
      radar = {
        semana: pacote.semana,
        janela: pacote.janela,
        gerado_em: pacote.gerado_em,
        varridos: pacote.varridos ?? null,
        total: (pacote.oportunidades || []).length,
        // Semana com zero oportunidade não é o mesmo que radar que nunca rodou. Sem estes
        // dois campos a página não consegue dizer "o filtro derrubou tudo" e mostra
        // "captação ainda não rodou" — que é falso e manda ninguém rodar o script à toa.
        captou: true,
        descartados: pacote.descartados ?? null,
        revogadas_no_reprocessamento: pacote.revogadas_no_reprocessamento ?? null,
        reprocessado_em: pacote.reprocessado_em ?? null,
        semanas_disponiveis: semanas.map((f) => f.replace(/\.json$/, "")),
        oportunidades: pacote.oportunidades || [],
      };
    } catch (e) {
      console.warn(`⚠ radar/semanas/${ultima} ilegível: ${e.message}`);
    }
  }
}

// ---------- mercado: memória acumulada do radar (inteligencia/mercado/indice.json) ----------
// Só dado público do PNCP, já captado — nada estimado. Gerado por scripts/indexar-mercado.mjs.
let mercado = null;
if (existsSync(MERCADO_PATH)) {
  try {
    const ix = JSON.parse(readFileSync(MERCADO_PATH, "utf8"));
    mercado = {
      gerado_em: ix.gerado_em,
      aviso_valor: ix.aviso_valor,
      total_certames: ix.total_certames,
      semanas: ix.semanas,
      por_uf: ix.por_uf,
      por_modalidade: ix.por_modalidade,
      municipios_recorrentes: ix.municipios_recorrentes,
      faixa_valor_estimado: ix.faixa_valor_estimado,
      certames: ix.certames,
    };
  } catch (e) {
    console.warn(`⚠ ${relative(ROOT, MERCADO_PATH)} ilegível: ${e.message}`);
  }
}

// ordenar por score desc, depois valor desc
frentes.sort((a, b) => (b.score - a.score) || ((b.valor_contratual_mensal || 0) - (a.valor_contratual_mensal || 0)));

const pipelineMensal = frentes.reduce((s, f) => s + (f.valor_contratual_mensal || 0), 0);
const ativos = frentes.filter((f) => f.estagio === "contrato-ativo");
// "contratado" = fechado, implantação ainda não iniciada. Somar com contrato-ativo faria o
// OS reportar receita que ainda não entrou; ignorar esconderia o compromisso já assumido.
const contratados = frentes.filter((f) => f.estagio === "contratado");
const fechadoMensal = [...ativos, ...contratados].reduce((s, f) => s + (f.valor_contratual_mensal || 0), 0);
// Toda frente contratada entra aqui, TENHA OU NÃO data confirmada: "fechado e aguardando
// implantação" é fato; a data é que pode não estar fechada. Quem tem data vai primeiro e
// com contagem regressiva; quem não tem aparece como previsão a confirmar, nunca com data
// inventada para preencher a coluna.
const implantacoes = contratados
  .map((f) => ({
    frente: f.frente, uf: f.uf, slug: f._slug,
    implantacao_em: f.implantacao_em ?? null,
    dias_restantes: f.implantacao_em ? diasEntre(f.implantacao_em, hojeISO) : null,
    valor_contratual_mensal: f.valor_contratual_mensal ?? null,
  }))
  .sort((a, b) => {
    if (a.dias_restantes == null && b.dias_restantes == null) return a.frente.localeCompare(b.frente, "pt-BR");
    if (a.dias_restantes == null) return 1;
    if (b.dias_restantes == null) return -1;
    return a.dias_restantes - b.dias_restantes;
  });

const data = {
  gerado_em: new Date().toISOString().slice(0, 10),
  total_frentes: frentes.length,
  pipeline_mensal: pipelineMensal,
  pipeline_anual: pipelineMensal * 12,
  contratos_ativos: ativos.length,
  contratados: contratados.length,
  fechado_mensal: fechadoMensal,
  implantacoes,
  frentes,
  obrigacoes,
  resumo_obrigacoes: resumoObrig,
  radar,
  mercado,
  produtos,
  implantacao,
  briefings,
};

writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ ${frentes.length} frente(s) válida(s). dashboard/data.json gerado.`);
console.log(`  Pipeline mensal (soma Cenário Base): R$ ${pipelineMensal.toLocaleString("pt-BR")}`);
if (contratados.length || ativos.length) {
  console.log(`  Fechado: ${contratados.length} contratado(s) + ${ativos.length} em operação` +
    ` — R$ ${fechadoMensal.toLocaleString("pt-BR")}/mês`);
  for (const i of implantacoes) {
    console.log(`   ↳ ${i.frente}/${i.uf}: ` +
      (i.implantacao_em ? `implanta em ${i.implantacao_em} (${i.dias_restantes} dia(s))` : "implantação sem data confirmada"));
  }
}
if (resumoObrig.total) {
  const alerta = resumoObrig.vencidas + resumoObrig.criticas;
  console.log(`✓ ${resumoObrig.total} obrigação(ões) no calendário` +
    (alerta ? ` — ⚠ ${resumoObrig.vencidas} vencida(s), ${resumoObrig.criticas} crítica(s), ${resumoObrig.atencao} em atenção` : " — nenhuma crítica"));
} else {
  console.log("• calendário de obrigações vazio (ver obrigacoes/README.md para o catálogo)");
}
if (radar) {
  console.log(`✓ radar ${radar.semana}: ${radar.total} oportunidade(s) de ${radar.varridos ?? "?"} varrida(s)`);
} else {
  console.log("• radar de licitações sem captação ainda (rode: node scripts/radar-licitacoes.mjs)");
}
if (mercado) {
  const rec = mercado.municipios_recorrentes.length;
  console.log(`✓ mercado: ${mercado.total_certames} certame(s) acumulado(s) em ${mercado.semanas.length} semana(s)` +
    (rec ? ` — ${rec} município(s) recorrente(s)` : " — sem recorrência ainda"));
} else {
  console.log("• índice de mercado ausente (rode: node scripts/indexar-mercado.mjs)");
}
if (implantacao) {
  const f = implantacao.frentes;
  const crit = f.reduce((s2, x) => s2 + x.criticos_pendentes, 0);
  console.log(`✓ implantação: ${f.length} frente(s) em partida — ${crit} item(ns) crítico(s) pendente(s)`);
  for (const x of f) {
    console.log(`   ↳ ${x.titulo}: ${x.prontidao_critica}% do crítico pronto` +
      (x.bloqueados ? ` · ⚠ ${x.bloqueados} bloqueado(s)` : ""));
  }
}
if (briefings) {
  const c = briefings.coletados;
  console.log(`✓ briefings: ${c.length} levantamento(s) · questionário v${briefings.questionario_versao} (${briefings.total_perguntas} perguntas)`);
  for (const b of c) {
    console.log(`   ↳ ${b.alvo}/${b.uf}: ${b.completude}% respondido, ${b.completude_essencial}% do essencial` +
      (b.essenciais_pendentes ? ` · ${b.essenciais_pendentes} essencial(is) em aberto` : ""));
  }
}
if (produtos.length) {
  const links = produtos.flatMap((p) => p.links);
  const aConfirmar = links.filter((l) => l.procedencia === "a-confirmar").length;
  console.log(`✓ ${produtos.length} produto(s) — ${links.length - aConfirmar} link(s) verificado(s)` +
    (aConfirmar ? `, ⚠ ${aConfirmar} a confirmar` : ""));
}

// ---------- monta as ferramentas dentro do bundle ----------
for (const { de, para } of FERRAMENTAS) {
  if (!existsSync(de)) {
    console.error(`✖ Ferramenta ausente: ${relative(ROOT, de)}`);
    process.exit(1);
  }
  rmSync(para, { recursive: true, force: true });
  cpSync(de, para, { recursive: true });
  console.log(`✓ ${relative(ROOT, de)} → ${relative(ROOT, para)}`);
}
// ---------- distribui a identidade visual canônica ----------
if (!existsSync(CSS_CANONICO)) {
  console.error(`✖ Identidade visual ausente: ${relative(ROOT, CSS_CANONICO)}`);
  process.exit(1);
}
for (const destino of CSS_DESTINOS) {
  cpSync(CSS_CANONICO, destino);
  console.log(`✓ ${relative(ROOT, CSS_CANONICO)} → ${relative(ROOT, destino)}`);
}

// ---------- distribui a marca (ícones de app) e o manifesto ----------
let assetsFaltando = 0;
for (const arq of MARCA_ASSETS) {
  const de = join(ROOT, "doutrina", arq);
  if (!existsSync(de)) {
    console.warn(`⚠ ${relative(ROOT, de)} ausente — rode: node scripts/gerar-icones.mjs`);
    assetsFaltando++;
    continue;
  }
  for (const dir of SUPERFICIES) cpSync(de, join(dir, arq));
}
for (const arq of MARCA_OFICIAL) {
  const de = join(ROOT, "doutrina", "marca", arq);
  if (!existsSync(de)) {
    console.error(`✖ logotipo oficial ausente: ${relative(ROOT, de)} — a marca não renderiza sem ele.`);
    process.exit(1);
  }
  for (const dir of SUPERFICIES) cpSync(de, join(dir, arq));
}
if (!assetsFaltando) {
  console.log(`✓ marca (${MARCA_ASSETS.length + MARCA_OFICIAL.length} arquivos, logotipos oficiais incluídos)` +
    " → dashboard/, dashboard/despesas/ e dashboard/briefing/");
}

// ---------- questionário para quem RESPONDE ----------
// O formulário do ente carrega a sua própria cópia do questionário, e é a cópia que
// define o que ele vê. Sai `porque` (régua de preço, fator de cobertura, lições de
// Avaré e Canoas — método nosso) e sai `sensibilidade`, que é classificação interna:
// mostrar "restrito" ao lado de uma pergunta ensina o respondente a não responder.
// Fica `para_que`, que explica a pergunta sem entregar o cálculo.
if (existsSync(QUESTIONARIO_PATH)) {
  const q = JSON.parse(readFileSync(QUESTIONARIO_PATH, "utf8"));
  const publico = {
    versao: q.versao,
    blocos: q.blocos.map((b) => ({
      id: b.id,
      nome: b.nome,
      perguntas: (b.itens ?? b.perguntas).map((p) => {
        const { porque, sensibilidade, novo, nova, ...resto } = p;
        return resto;
      }),
    })),
  };
  const n = publico.blocos.reduce((s, b) => s + b.perguntas.length, 0);
  writeFileSync(join(DASH_DIR, "briefing", "questionario.json"), JSON.stringify(publico, null, 2) + "\n");
  console.log(`✓ questionário do respondente: ${n} pergunta(s), sem a camada interna → dashboard/briefing/questionario.json`);
}

if (existsSync(MANIFESTO_OS)) {
  cpSync(MANIFESTO_OS, join(DASH_DIR, "manifest.webmanifest"));
  console.log("✓ doutrina/manifest-os.webmanifest → dashboard/manifest.webmanifest");
} else {
  console.error("✖ manifesto do OS ausente: doutrina/manifest-os.webmanifest");
  process.exit(1);
}

// ---------- guarda final: nada confidencial pode ter entrado no bundle ----------
// O build monta o bundle; esta checagem prova que montou só o previsto. Barato de rodar,
// e é a diferença entre "acho que não vazou" e "o build falha se vazar".
// Camada confidencial + MÉTODO COMERCIAL. A segunda leva entrou depois de o campo `porque`
// do questionário publicar a régua de preço por habitante num painel aberto: a doutrina
// dizia "nada confidencial no bundle" e mesmo assim passou, porque a guarda só olhava para
// nomes de arquivo. Régua de preço, fator de cobertura e composição de BDI são o método —
// se aparecerem numa superfície que o cliente pode abrir, o build para.
const PROIBIDO = [
  /bastidor/i, /interpretacao/i, /interpretação/i, /github\.com/i,
  /m[ée]trica de ouro/i,
  /R\$\s?5,20/i,
  /\/hab\/m[êe]s/i,
  /fator de cobertura/i,
  /remunera[çc][ãa]o residual/i,
  /\bBDI\b/,
  /pre[çc]o-[âa]ncora/i,
  /teto pol[íi]tico do pre[çc]o/i,
];
const vazamentos = [];
(function varrer(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { varrer(full); continue; }
    if (!/\.(html|json|css|md|webmanifest|js)$/.test(entry)) continue;
    const texto = readFileSync(full, "utf8");
    for (const re of PROIBIDO) {
      if (re.test(texto)) vazamentos.push(`${relative(ROOT, full)} contém /${re.source}/`);
    }
  }
})(DASH_DIR);
if (vazamentos.length) {
  console.error("\n✖ Build falhou — conteúdo proibido no pacote publicável:\n");
  for (const v of vazamentos) console.error("  • " + v);
  console.error("\nO bundle vai a URL pública. Remova antes de publicar.\n");
  process.exit(1);
}
console.log("✓ guarda de confidencialidade: nenhum termo proibido no bundle.");

console.log("✓ pacote publicável montado em dashboard/ (home + cockpit + ferramentas).");
