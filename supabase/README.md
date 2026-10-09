# CRM — preparação Supabase

## Estado desta entrega

- Migration inicial sem seeds: 15 tabelas, índices, constraints e RLS.
- Testada localmente no motor PostgreSQL PGlite; Auth e roles Supabase simulados nos testes.
- **Ainda não aplicada ao projeto remoto.** TCP acessível não significa autenticação validada.
- CRM mostra um estado de preparação, sem carregar ou criar exemplos. Login e persistência Supabase ainda não ligados.
- Fixtures, store e aplicação de demonstração permanecem no código para testes e referência da futura integração; não são carregados pela página CRM. Dados antigos do browser não são importados, sobrescritos ou apagados.
- Website público e os seus produtos provisórios mantêm-se como estavam.

## Modelo

| Tabelas | Finalidade |
| --- | --- |
| profiles | Colaboradores associados a `auth.users`, ativos/inativos; papel owner/collaborator |
| clients | Ficha de cliente |
| products / order_items | Catálogo, campos configuráveis, quantidade e preço guardado na encomenda |
| orders | Encomenda, head, aceitação, etapas escolhidas e revisão para concorrência |
| jobs / tasks | Trabalhos de produção/reimpressão e tarefas por responsável |
| quotations / quotation_materials | Valor final, tempo, taxa horária e vários lotes com preços históricos |
| filament_lots / reservations / stock_movements | Entradas de filamento, reservas e consumos reais |
| project_history / processed_commands | Histórico e preparação para comandos idempotentes |
| studio_settings | Nome, EUR, Europe/Lisbon |

Valores em milli-euros (1000 = 1 EUR), gramas inteiras, instantes com fuso horário. O custo material é a soma das linhas; o custo temporal é gerado a partir de minutos e taxa horária. Orçamentar não produz movimentos nem reservas.

Todos os colaboradores ativos leem os mesmos registos. O responsável é apenas o head. Contas autenticadas sem perfil ativo não veem dados. Não há autoinscrição com acesso ao estúdio.

## Limite deliberado desta migration

As tabelas estão **sem permissões de escrita para o browser**. RLS não substitui comandos de negócio: ainda é necessário implementar transações para aceitar encomendas, saltar etapas, aprovar orçamento, reservar e confirmar consumo real.

A migration valida estrutura e relações; não é ainda uma API de operações. Não conceder INSERT/UPDATE/DELETE diretamente para contornar essa etapa. Por exemplo, a consistência entre uma encomenda em orçamento e a submissão da proposta, a imutabilidade das propostas aprovadas, os ciclos de reimpressão e os saldos concorrentes serão responsabilidade dos comandos transacionais da integração.

## Aplicação remota (próximo passo)

1. Configurar credenciais apenas no ambiente local ignorado pelo Git, ou autenticar o CLI/MCP. A URI PostgreSQL não entra no frontend.
2. Inspecionar tabelas existentes e histórico de migrations no projeto `pcduhmljvxmyuhqdspwz`; confirmar que a BD está vazia.
3. Executar o dry-run do CLI (`supabase db push --help` para opções da versão instalada), rever o SQL e aplicar a migration usando credenciais de servidor.
4. Verificar tabelas, grants, RLS e advisors no próprio Supabase. Os testes PGlite não substituem a verificação do serviço remoto.
5. Criar/convidar utilizadores através do Supabase Auth, desativar registo público e inserir os respetivos perfis por operação administrativa. Sem password partilhada e sem perfil baseado em user_metadata.
6. Implementar comandos autenticados, adapter assíncrono e login. Cada comando valida membro ativo e usa `auth.uid()` como ator, nunca o ator enviado pelo browser.
7. Usar a chave **publishable** no cliente. Não publicar service_role, secret key ou password PostgreSQL.

Antes de ativar a UI: testar locks por lote, dupla submissão, reserva concorrente, consumo real único, rejeição de revisões antigas, aprovação avançando para a etapa selecionada seguinte, tarefas concluídas no histórico e entregas na ficha do cliente. `processed_commands` deve comparar payload e ator ao reutilizar a mesma chave, dentro da mesma transação do efeito.

O CLI gerou o nome da migration. Não há seed.sql. Com Docker ativo, pode validar o ambiente Supabase completo localmente; nesta máquina Docker não estava a correr.

## Verificação local

```powershell
npm ci
node tests/database.test.mjs
Get-ChildItem tests/*.test.mjs | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { throw 'Teste falhou' } }
```

Referências oficiais: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [migrations](https://supabase.com/docs/guides/local-development/database-migrations), [funções](https://supabase.com/docs/guides/database/functions).
