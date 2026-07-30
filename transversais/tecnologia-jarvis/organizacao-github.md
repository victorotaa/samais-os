# Organização GitHub — decisão de topologia dos repositórios

**Decisão (30/07/2026, Ota):** unificar na **propriedade**, não no código. Criar a
organização GitHub `samais` e transferir os repositórios para ela. **PEP e CoPilot
continuam repositórios próprios** — nada de monorepo.

## O que isso resolve

| Antes | Depois |
|---|---|
| 6 repos numa conta pessoal, permissão repo a repo | 1 org, times com permissão declarada |
| Acesso do programador externo repo a repo | Time `engenharia` com write onde precisa |
| Billing e administração espalhados | Um lugar |
| Time Vercel `samais` sem contraparte no GitHub | Simetria GitHub ↔ Vercel |

Transferência **preserva** issues, PRs, histórico, stars e **redireciona as URLs antigas** —
nenhum link publicado quebra, nenhum clone existente para de funcionar.

## Por que NÃO monorepo

Os três motivos, do mais duro para o mais brando:

1. **Conflito de visibilidade.** `samais-os` é público e `samais-pep` é privado. Monorepo
   tem uma visibilidade só — mergear como está **publicaria o código-fonte do PEP**, e o
   histórico do Git guarda. Se um dia for por esse caminho, a ordem é obrigatória:
   `samais-os` privado **primeiro**, merge **depois**.
2. **Ritmos diferentes.** PEP (Next.js) e CoPilot (Vite) são **produtos**, com release
   próprio. `samais-os` é **a empresa como dado** — muda quando uma frente muda, não quando
   um componente React muda. Acoplar o CI dos dois é custo sem contrapartida.
3. **Builds inúteis.** O radar commita no repo toda segunda pelo Actions. Em monorepo isso
   dispararia build do PEP e do CoPilot também — 52 builds/ano × 2 projetos por causa de um
   JSON de licitação. Tem contorno (Ignored Build Step), mas é manutenção permanente.

E o problema que o monorepo prometia resolver — deriva de identidade visual — já foi
resolvido por outro caminho: `doutrina/samais.css` é fonte única distribuída pelo build.
O que sobra de duplicação (CLAUDE.md, skills) se resolve com um script de sincronização,
não com um merge irreversível. Ver `scripts/samais-init.sh` no `samais-rota`.

## Execução — só o dono da conta pode fazer

Ações de conta, fora do alcance de qualquer agente:

1. **Criar a org:** github.com/organizations/plan → Free.
2. **Transferir cada repo:** Settings → General → Danger Zone → Transfer ownership → `samais`.
   Ordem sugerida: `samais-os`, `samais-copilot`, `samais-pep`, `samais-rota`,
   `samais-estudos`. (`ArchBrand` é outra marca — não entra.)
3. **Rever visibilidade na transferência** — é o momento natural para deixar
   `samais-os` **privado** (hoje bastidor político, interpretação estratégica e o BDI
   decomposto estão legíveis por qualquer pessoa).
4. **Times:** `diretoria` (admin) e `engenharia` (write só nos repos de produto).
5. **Reconectar a Vercel:** o time `samais` já existe; ao transferir, reautorizar o GitHub
   App da Vercel na org para os deploys continuarem.

Depois da transferência, os remotes locais continuam funcionando pelo redirecionamento, mas
vale atualizar: `git remote set-url origin git@github.com:samais/<repo>.git`.

## O que muda neste repositório

Nada estrutural. `produtos/` continua sendo **referência** — `produto.json` com os links de
acesso e o repositório real. É o vínculo, não a cópia.
