# Governança do Samais-OS

Este repositório é a fonte de verdade operacional da Samais. Toda mudança deve ser
rastreável, revisável e reversível.

## Branches e pull requests

- `main` é a única branch estável e a branch padrão do GitHub.
- Trabalho novo usa branch curta: `codex/<tema>`, `feat/<tema>`, `fix/<tema>` ou
  `docs/<tema>`.
- Não há push direto nem force-push na `main`.
- Toda entrada na `main` passa por pull request com resumo, impacto, validação e
  pendências.
- Ota autoriza o merge. Agentes podem preparar branch e PR, mas não fazem merge por
  conta própria.
- Branch incorporada deve ser excluída depois do merge, salvo motivo documentado.

## Portões de qualidade

Antes de abrir ou atualizar um PR:

1. Respeitar a separação física `fatos.md` × `interpretacao.md`.
2. Não registrar conteúdo jurídico-tributário confidencial no repositório.
3. Rodar `node scripts/build-dashboard.mjs`.
4. Confirmar que todos os `status.json` continuam válidos.
5. Não adicionar binários de vídeo.
6. Atualizar `ROADMAP.md` quando o PR concluir, criar ou repriorizar trabalho.

## Configuração recomendada no GitHub

Aplicar à `main`:

- branch padrão: `main`;
- exigir pull request antes de merge;
- exigir aprovação de Ota;
- exigir o check `build` do workflow `build-dashboard` quando aplicável;
- bloquear force-push e exclusão;
- excluir automaticamente a branch após o merge.

Esses controles são configuração do GitHub e devem ser confirmados na interface do
repositório; este arquivo registra a política, mas não substitui a proteção técnica.

## Poder do agente

O cockpit permanece read-only. Qualquer mutação proposta por agente acontece como
diff, commit e PR. A evolução das camadas Ler → Propor → Agir segue
`transversais/tecnologia-jarvis/agente-embarcado.md` e depende de decisão explícita de
Ota.
