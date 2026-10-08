# Componentes

`.button`: ação, light e outline; foco visível, active discreto, disabled. `.product-card`: link para uma landing page real de demonstração. `.product-visual`: media substituível, sem semântica de prova real.

Menu móvel: botão, aria-expanded/controls, Escape, retorno de foco e navegação visível sem JavaScript. Formulários: labels ligados a IDs, campos obrigatórios explícitos, ajuda e erro associados, foco no primeiro erro. Resumo recebe foco e deixa de aparecer se os dados forem alterados.

Produtos configurados em `scripts/products.mjs`; campos e validação independentes da apresentação em `scripts/product-page.mjs`. Texto do utilizador inserido via textContent. Sem persistência nem submissão a servidor.

Estados: produto desconhecido, JavaScript ausente, configuração incompleta, configuração inválida e resumo válido. Confirmação diz explicitamente que nenhuma encomenda foi criada.

## CRM — 2026-10-08

Shell operacional em `crm/`: sidebar escura, conteúdo claro, métricas derivadas, tabelas, pipeline em colunas/lista e detalhe de encomenda. CSS isolado em `crm/crm.css`, partilhando tokens da marca.

Diálogos nativos com foco e Escape; erros de gravação mantêm o formulário aberto. Ações inline restauram foco no título da vista. Skip link foca o conteúdo sem alterar a rota por hash. Menu móvel acessível e reduzido a partir de 800 px. Sem animações decorativas; reduced-motion retira transições.

Uma entrada demo e armazenamento local versionado; isto não representa autenticação. Formulários públicos continuam separados. A execução visual do CRM aguarda revisão do owner.
