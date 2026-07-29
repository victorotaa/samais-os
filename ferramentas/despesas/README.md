# Prestação de Contas — despesas de viagem e sede

Ferramenta para lançar despesas (com foto do comprovante), fechar o mês e gerar o
**PDF de prestação de contas** que sustenta o pedido de reembolso.

> **Persistência real.** Os lançamentos e as fotos ficam gravados no aparelho
> (IndexedDB) — fechar a aba, recarregar ou reiniciar o celular **não** apaga nada.

## Como funciona (arquitetura em uma frase)

**Local-first:** cada pessoa lança no próprio aparelho; nada vai para servidor; no
fechamento, os exports em JSON são **consolidados** por quem monta a prestação.

Consequências honestas dessa escolha:
- ✅ Custo zero, sem infra, privado por construção (dado financeiro não sai do aparelho).
- ✅ Funciona offline (instalável como app).
- ⚠️ **Não sincroniza sozinho entre aparelhos.** Cada aparelho tem sua base — a união
  acontece na importação. Se você lança no celular e no computador, exporte de um e
  importe no outro.
- ⚠️ Limpar os dados do navegador / trocar de aparelho **apaga o histórico**.
  **Exporte o backup com regularidade** (Ajustes → Exportar JSON).

## Uso

1. **Ajustes → seu nome.** Define quem é o responsável dos lançamentos (é quem recebe o
   reembolso). Passo único.
2. **Lançar.** Valor, data, frente (Viagem / Predial-Sede), categoria, descrição e a
   **foto do canhoto** (a câmera abre direto no celular). A imagem é comprimida antes de
   salvar. "Reembolsável" já vem marcado conforme a forma de pagamento — cartão
   corporativo desmarca sozinho.
3. **Despesas.** Lista do mês com filtros (frente, status, responsável). Toque num
   lançamento para **editar**, **alternar status** (pendente ↔ reembolsado) ou **excluir**.
4. **Fechamento.** Escolha o mês → totais por categoria, total do período e **quanto há a
   reembolsar por pessoa**. Botões:
   - **Gerar PDF da prestação** — abre a impressão do navegador; escolha "Salvar como PDF".
     Inclui o anexo com os comprovantes (desmarcável).
   - **Marcar mês como reembolsado** — baixa os pendentes depois que o dinheiro entrou.

## Consolidar a equipe (2–3 pessoas)

1. Cada pessoa: **Ajustes → Exportar JSON** (deixe marcado "incluir imagens").
2. Quem monta a prestação: **Ajustes → Importar JSON**, um arquivo por vez.
3. A importação **soma sem duplicar** — reimportar o mesmo arquivo não cria cópias
   (dedupe por `id`; em conflito, vence a versão editada mais recentemente).
4. Gere o PDF no **Fechamento** com "Todos os responsáveis" — o relatório sai com o
   quanto cabe a cada pessoa.

## Rodar / instalar

**Local (computador):**
```bash
npx --yes serve ferramentas/despesas     # abra o endereço mostrado
```
> Abrir por `file://` não é confiável (o navegador restringe armazenamento). Sirva por HTTP.

**No celular (recomendado):** publique a pasta e abra o endereço no celular →
menu do navegador → **"Adicionar à tela de início"**. Vira app, abre em tela cheia e
funciona offline.

**Publicar (Vercel, privado):** crie um projeto separado apontando para esta pasta —
sem build, saída estática — e ative **Deployment Protection → Vercel Authentication**.
Os dados continuam no aparelho de cada um; o que é publicado é só o aplicativo.

## Dados

O formato dos lançamentos está em [`despesa.schema.json`](despesa.schema.json) —
valores em **centavos** (inteiro, sem erro de arredondamento), datas ISO, `id` estável
para deduplicação. É o mesmo contrato do export/import, o que permite, no futuro,
ingerir esses dados no OS (`transversais/financeiro/`) ou num backend, sem migração de formato.

## Limites conhecidos (do MVP)

- Sem OCR do comprovante — a foto é anexada, os campos são digitados. (OCR exigiria
  modelo/API paga; ficou fora da política de custo zero.)
- Sem sincronização automática entre aparelhos (ver acima).
- Sem múltiplas moedas — tudo em BRL.
