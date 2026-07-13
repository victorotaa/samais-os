# Roadmap Samais-OS

Atualizado em 13/07/2026. A ordem considera valor operacional, dependências e risco.

## P0 — Governança e fonte de verdade

### 1. Normalizar o fluxo Git

**Objetivo:** tornar `main` a branch padrão e protegida; remover a dependência da
branch encerrada `claude/samais-os-setup-58a63q`.

**Pronto quando:** branch padrão = `main`; proteção exige PR, aprovação e CI;
autoexclusão de branches incorporadas ativa; branch antiga excluída.

### 2. Recuperar a taxonomia de gestão

**Dependência:** fonte real `taxonomia-e-contexto` no Drive, arquivo equivalente no
`jarvis-os` ou conteúdo ditado por Ota.

**Pronto quando:** as três categorias, a razão para não colapsá-las e exemplos de uso
substituírem o stub em `doutrina/taxonomia-gestao.md`, com fonte identificada.

## P1 — Dados que movem decisão

### 3. Atualizar Belém

Confirmar headcount, CCT-PA e premissas de dimensionamento. Manter fatos citáveis em
`fatos.md` e análise interna em `interpretacao.md`.

**Pronto quando:** `status.json` tiver data, score, próximo passo e valor coerentes
com as fontes; build verde.

### 4. Qualificar as quatro frentes em radar

Ordem inicial: Taboão da Serra → SESAP-RN → Avaré → Paraguai/SEME. Executar o
protocolo municipal sem transformar premissa em fato.

**Pronto quando:** cada frente tiver `fatos.md`, `interpretacao.md`, score justificado,
gatilho e próximo passo acionável; onde não houver dado, registrar “a levantar”.

### 5. Instituir relatório semanal

Gerar `relatorios/AAAA-SS.md` com mudanças, decisões necessárias, bloqueios e próximos
passos, derivado apenas do estado versionado.

**Pronto quando:** houver rotina semanal com responsável e primeiro relatório
operacional após esta auditoria.

## P2 — Cockpit privado

### 6. Confirmar o deploy e o acesso

Validar o projeto Vercel ou o servidor interno, confirmar autenticação obrigatória e
testar o redeploy da `main`. Nunca publicar `data.json` sem controle de acesso.

**Pronto quando:** URL privada validada por usuário autorizado e negada a usuário não
autorizado; atualização da `main` refletida no cockpit.

## P3 — Expansão controlada

### 7. Triar conteúdo do `jarvis-os`

Classificar o que é específico da Samais e deve ser proposto para migração. Nada é
movido ou removido sem aprovação explícita de Ota.

### 8. Prototipar a Camada 0 do agente

Somente leitura, sob demanda, sem hospedagem permanente e com fronteira física entre
conteúdo factual e interpretação confidencial.

**Dependência:** P0 concluído e corpus operacional minimamente atualizado.

## Fora de escopo por enquanto

- escrita direta pelo cockpit;
- publicação automática em canais externos;
- envio de `interpretacao.md` a modelos externos;
- hospedagem permanente antes de infraestrutura dedicada aprovada.
