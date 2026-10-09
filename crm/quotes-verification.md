# Orçamentação e aprovação — 2026-10-08

## Fluxo
Apenas encomendas na etapa Orçamento aparecem nesta área. Clicar no título/Orçamentar abre o pop-up. Seleção de lote com stock disponível, gramas previstas, horas e minutos, custo por hora preenchido para esse orçamento e valor final independente dos custos. A estimativa cobre a encomenda completa.

Enviar para aprovação guarda snapshot de preço do filamento, duração, taxa horária, custos e valor final. Não reserva nem consome stock. Subetapa Aprovar Orçamento na área Orçamentos e na coluna Orçamento da pipeline: cliente/empresa, projeto, custos de material e tempo, valor final destacado, head e Aprovar. Aprovar regista ator/data e avança automaticamente para a próxima etapa escolhida. A transição manual genérica não permite contornar a aprovação.

Uma alteração às linhas invalida o orçamento pendente; linhas com orçamento aprovado ficam protegidas. Alterações de notas, prazo ou head preservam os valores. O orçamento aprovado permanece no detalhe do projeto e no pop-up informativo de Encomendas.

## Catálogo mock
Preços ilustrativos do CRM em domain/catalog-pricing.mjs: Produto 1 sem preço; Produto 2 15 €/unidade; Produto 3 5 €/unidade. Não são preços comerciais nem alteram as páginas públicas. Na aceitação, todas as linhas com preço definido removem a etapa Orçamento; pedidos mistos/custom mantêm a opção. Encomendas anteriores já em curso não são reclassificadas.

## Verificação
40 testes Node passaram, incluindo 8 de orçamento (cálculos, stock inalterado, aprovação obrigatória, avanço, preços fixos/mistos, valores inválidos, snapshots e edição de metadados). Browser em sessão isolada: 100 g a 20 €/kg + 90 min a 10 €/h = 2 € material + 15 € tempo; valor final 45 €. Aprovar avançou para aprovação de arte, sem movimentos adicionais. Persistência após reload, ausência da opção Orçamento para produto fixo, pop-up sem overflow a 390 px e consulta sem campos editáveis verificados. Revisão independente identificou comparação de IDs nas linhas; corrigida e coberta por teste.

Capturas quotation-approval.png e quotation-mobile.png. Dados continuam mock locais; sem autenticação real nem sincronização entre browsers.

## Vários filamentos — 2026-10-09
O pop-up permite adicionar/remover linhas de filamento, com lote e gramas por linha. Custos individuais são somados no total de materiais. Tempo e valor final continuam por orçamento. Não aceita lotes duplicados, linhas vazias ou quantidades superiores ao disponível. Orçamentos antigos com um só material continuam válidos, sem migração destrutiva. Detalhe do projeto e consulta informativa mostram a discriminação dos materiais.

43 testes Node passaram. Browser local isolado: adicionar dois lotes (100 g PLA Preto e 50 g PLA Branco), custo total 3,10 €, enviar/reabrir/recarregar, remover e voltar a adicionar linha; duas linhas persistidas, sem movimentos de stock adicionais; formulário em 390 px sem overflow. Captura multiple-filaments-mobile.png.
