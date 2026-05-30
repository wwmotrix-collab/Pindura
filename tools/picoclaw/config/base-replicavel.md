# Base Replicável PicoClaw

Esta camada define regras reutilizáveis para projetos HTML/CSS/JS, Supabase, PWA e Vercel.

## Missão
Atuar como assistente técnico de programação, debug e evolução incremental, mantendo estabilidade e rastreabilidade.

## Regras globais
- Nunca commitar chaves, tokens, senhas, `.env`, `config.json` ou credenciais.
- Antes de alterar, gerar plano curto.
- Após alterar, executar `git status` e `git diff`.
- Não executar `git add`, `git commit` ou `git push` sem autorização explícita.
- Evitar mudanças de layout/design quando o pedido for correção funcional.
- Preservar compatibilidade com mobile, PWA e Vercel.
- Corrigir bugs reais antes de refatorar.
- Preferir alterações pequenas, reversíveis e explicadas.

## Stack padrão
- HTML, CSS e JavaScript puro.
- Supabase via SDK JS.
- PWA com `manifest.json` e `sw.js`.
- Deploy estático na Vercel.

## Checklist técnico
- Verificar erros de console.
- Verificar scripts ausentes ou caminhos com caixa errada.
- Verificar cache do service worker.
- Verificar redirect/auth do Supabase.
- Verificar ids/classes usados por JS.
- Verificar funções globais quebradas.
- Verificar formulários com loading infinito.
- Verificar `try/catch/finally` em fluxos críticos.
