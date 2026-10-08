# Aceitação e percurso por encomenda

2026-10-08: colaborador aceita a encomenda e escolhe Orçamento, Aprovação, Produção e/ou Pronto. Aceite e Entregue são os extremos fixos. Avanço manual só permite a etapa seguinte escolhida ou cancelamento. Por aceitar não permite iniciar o percurso.

Aceitação regista ator, data e etapas no histórico. As regras de aprovação e consumo continuam obrigatórias quando essas etapas são escolhidas, mesmo omitindo Pronto. Percursos sem produção não exigem consumo nem mostram controlos de produção.

Compatibilidade: encomendas anteriores em curso preservam a etapa e usam o percurso anterior implícito; novos pedidos e pedidos ainda em Por aceitar exigem aceitação. Nenhum reset de dados.

Pipeline geral reúne etapas usadas pelas encomendas visíveis. Filtro Encomenda mostra apenas as etapas desse percurso. Entregues permanecem fora da pipeline e na ficha do cliente.

Validação: 31 testes Node passaram (incluindo cinco novos testes de percurso). Browser isolado validou aceitar, omitir orçamento/aprovação/produção, colunas Aceite e Pronto, entrega e arquivo no cliente; projeto anterior preservado; detalhe em 390 px sem overflow. Revisão independente indisponível por limite de utilização do agente; testes e revisão local realizados.
