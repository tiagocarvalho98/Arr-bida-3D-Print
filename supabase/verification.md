# Verificação — 2026-10-09

- Migration criada por `supabase migration new crm_foundation`.
- `node tests/database.test.mjs`: 4/4 passaram, executando o SQL completo em PGlite. Testes começaram a falhar com a migration vazia e passaram após implementação.
- Suite `tests/*.test.mjs`: 47/47 passaram (43 existentes + 4 de BD).
- Cobertura SQL: BD sem seeds; RLS em todas as tabelas; ausência de funções SECURITY DEFINER no schema público; colaboradores veem os mesmos dados; anon, contas sem perfil e membros inativos não acedem; browser não escreve nem promove perfis; rotas inválidas/preço fixo rejeitados; várias linhas de filamento, custos históricos estáveis, sem alteração de stock; duplicados, gramas negativas e eliminação de cliente referenciado rejeitados.
- Playwright/Chromium: `/crm/` mostra preparação a 1440 e 390 px, sem overflow e sem erros JS. Nenhum pedido de app/store/fixtures/example-tasks. Browser novo não recebe seed; browser com dados antigos não os lê nem sobrescreve.
- Revisão independente: sem findings no âmbito desta preparação.
- `git diff --check`: sem erros de whitespace.

Limitações: Docker não estava a correr. Testes simulam Auth/roles; não testam PostgREST, Auth real nem o projeto remoto. DNS/TCP do host remoto respondeu; não foi usado o password, não houve consulta autenticada, aplicação de migration, importação ou eliminação de dados remotos.
