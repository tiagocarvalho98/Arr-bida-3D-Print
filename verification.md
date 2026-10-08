# Verificação — 2026-10-07

## Resultado

Pré-visualização local da homepage e de três produtos mock, com campos por produto e resumo. Workflow W14 integrado nas instruções da Rita. Não é CRM, loja transacional ou site publicado.

## Evidências

- Logótipo original e cópia: SHA256 `2DB90F92D1579DC4340B796149279DC092CE1073CBAF1E1B77783F4D60EBCAFC`.
- Node, `node Projects/arrabida-3d-print/tests/products.test.mjs`: 3 testes passaram. Cobrem campos distintos, obrigatoriedade do QR, protocolos de URL, quantidade inteira, opção inválida e produto inexistente.
- Primeiro teste antes da implementação falhou por módulo inexistente. `node --test` ficou bloqueado pelo sandbox ao criar subprocesso; execução direta funcionou.
- Browser Playwright: homepage sem overflow horizontal a 320, 390, 768 e 1440 px. Um h1, seis secções dentro de main, zero imagens quebradas e zero âncoras internas inexistentes.
- Três URLs renderizam Produto 1/2/3 e um formulário cada. ID desconhecido mostra erro recuperável, sem formulário.
- QR vazio: quatro erros nos campos obrigatórios sem defaults; foco regressa ao nome do negócio. Dados de exemplo válidos produzem resumo e transferem foco. localStorage vazio; nenhuma encomenda ou envio.
- Mobile: menu abre, Escape fecha, aria-expanded=false e foco regressa ao botão. Campos ficam numa coluna até 600 px.
- Sem JavaScript: homepage e navegação legíveis. Produto mostra instrução para ativar JavaScript, sem estado de carregamento permanente.
- Reduced-motion: duração de transição observada em 0s.
- Consola: zero erros e warnings na verificação. Homepage sem recursos externos.
- Specimen abre em `/design-system/preview/`.
- JSON de rotas válido, sem IDs de skill duplicados; fontes das duas skills operacionais existem. W14 referenciado por CLAUDE, Visual Studio, SKILLS e manual.
- Revisão independente: uma falha importante de contraste dos contornos dos campos e um detalhe no estado sem JS. Ambos corrigidos. Bordas mudadas para #777E6C; mensagem de loading escondida no modo sem JS. Computed styles confirmados após reload.

## Inspeção visual

`review-desktop.png`, `review-mobile.png`, `review-product-desktop.png`, `review-product-mobile.png`. Homepage desktop e produto mobile inspecionados visualmente. Placeholders são objetos CSS estáticos, não fotografias reais. Campo QR contém aviso de que o padrão ilustrativo não funciona.

## Limites e pendências

- A execução visual aguarda apreciação do owner. Não existe aprovação de publicação.
- Verificação de zoom por CSS não reproduz o zoom nativo do browser e produziu overflow; não é apresentada como aprovação de zoom nativo. Reflow foi verificado em viewports estreitos, incluindo 320 px.
- O mapa documental `Agente/graphify-out` e o catálogo histórico de 2026-10-03 não foram regenerados. O script `tools/catalogue-graph.py` destina-se a outro corpus; o mapa da agência requer nova extração semântica dos documentos selecionados. W14 é descoberto diretamente nos contratos e no manual. Nenhum grafo de código preexistia neste projeto novo.
- Sem contactos reais, preços, fotografias, pagamentos, CRM, autenticação, uploads ou QR funcional. Sem persistência no mock. Preço e acessos dos colaboradores a custos aguardam definição na fase funcional.
- Raiz sem Git: não foram criados commits ou worktrees. Browser integrado indisponível por ausência de node_repl; usado Playwright disponível.
