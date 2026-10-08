# Tarefas, projetos e fichas de cliente — 2026-10-08

- Tarefas abertas agrupadas por utilizador e Sem responsável. Em pedido / Em curso; concluídas ficam no histórico do projeto e podem ser reabertas enquanto o projeto estiver ativo.
- Pipeline mostra apenas projetos ativos. Mudanças de etapa continuam manuais e conservam regras de aprovação/material. Entregues e cancelados ficam na ficha do cliente.
- Rota #cliente/ID mostra dados do cliente, projetos ativos e histórico, com tarefas e estado por projeto. Projetos arquivados apresentam tarefas sem ações de edição.
- Responsáveis derivados de state.users. Uma sessão demo continua a usar user-demo; suporte a vários responsáveis validado sem criar autenticação adicional. Dados existentes preservados.

Verificação: 24 testes Node passaram. Browser em sessão isolada: dois responsáveis e tarefas sem responsável; concluir remove da lista, preserva no histórico; entrega manual remove da pipeline e mantém na ficha após reload. Quatro rotas em 1366 e 390 px sem overflow da página. Captura tasks-by-owner.png usa apenas utilizadores fictícios de teste.
