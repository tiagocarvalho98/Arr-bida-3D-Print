# CRM mock — verificação de 2026-10-08

## Entrega

URL: `http://127.0.0.1:4173/crm/`. Uma entrada “Administrador demo”, sem palavra-passe real. Implementação local com clientes, encomendas, pipeline, trabalhos de execução, tarefas, catálogo, filamentos, histórico e definições.

Rita mantém conceito, design e webdesign. Marca partilhada com a homepage; layout e CSS operacionais independentes. Dados fictícios e storage separados dos formulários públicos.

## Testes executados

22 testes passaram: 6 de armazenamento, 7 de inventário, 5 de comandos, 1 de seletores e 3 de produtos públicos. Todos os módulos CRM passaram `node --check`.

Cobertura: reload, JSON inválido, versão futura, falha de escrita, reposição restrita à chave CRM, logout, revisão desatualizada noutra aba, booleanos corrompidos, reservas ligadas a trabalho encerrado, saldo físico/reservado/disponível, consumo repetido, valores negativos/NaN/fracionários, saldo insuficiente, reservas de outros trabalhos, cancelamento, falha/reimpressão, nova compra sem alterar custo histórico, consumo zero, lotes repetidos, transições, aprovação, relações, personalização QR e responsável vazio.

## Percurso real no browser

1. Entrar na demonstração e criar “Cliente QA demo” com contactos example.com.
2. Criar encomenda QR com negócio, cidade, contacto e URL, sem responsável.
3. Criar tarefa ligada; aprovar arte; passar por aprovação e produção.
4. Reservar 200 g. Tentar confirmar 9999 g: erro de saldo insuficiente, modal permanece aberto.
5. Confirmar 120 g: movimento único, custo 2400 milésimos de euro (2,40 €), reserva libertada.
6. Concluir tarefa, marcar pronto e entregue. Recarregar: encomenda entregue, tarefa concluída e configuração QR intacta.
7. Repor exemplos através da confirmação de Definições; dados QA removidos. A demo entregue conserva as fixtures iniciais.

## Browser, acessibilidade e recuperação

- Sete vistas principais testadas a 320, 390, 768 e 1440 px: sem overflow horizontal da página; tabelas/pipeline têm contentores próprios de scroll. Desktop e mobile inspecionados visualmente.
- Menu móvel abre; Escape fecha e restaura foco no botão Menu.
- Skip link mantém a rota e foca h1. Ações inline restauram foco em h1; modais restauram no acionador ou título da vista.
- Reduced-motion observado com transições de 0s.
- Sem JavaScript, mensagem útil e link de volta ao website, sem carregamento infinito.
- Recuperação testada numa instância isolada: JSON inválido oferece recuperação; cancelar preserva o texto inválido; confirmar restaura fixtures e preserva a chave externa `unrelated`.
- Nome contendo `<img src=x onerror=alert(1)>` foi mostrado literalmente, sem criar imagem ou executar código.
- Logout abre a entrada de demonstração; dados preservados.
- Homepage, três produtos e CRM revisitados: zero erros JavaScript e zero respostas HTTP >=400 observadas.

Capturas: `review-desktop.png`, `review-mobile.png`, `review-pipeline.png`.

## Revisão independente e correções

Revisor independente identificou três problemas importantes: validação de booleans/invariantes no storage, skip link confundido com rota e perda de foco em ações inline. Corrigidos e verificados. Teste ponta a ponta encontrou também responsável vazio rejeitado; campo normalizado para null, com regressão automatizada.

## Limites reais

Sem autenticação, autorização, backend, sincronização ou uso simultâneo real. Bloqueio por revisão local reduz gravações desatualizadas, mas não substitui transações de servidor. Não inserir dados reais. Peso inteiro em gramas nesta demonstração. Custo mostrado é só filamento; não é lucro ou custo total.

Sem preço comercial, pagamento, QR funcional, uploads ou envio de mensagens. O CRM não captura o formulário público. Duas contas reais e permissões ficam para a fase seguinte. Revisão visual do owner permanece pendente, sem bloquear a pré-visualização local.

Não existia grafo de código deste projeto; não foi criado nem atualizado grafo global. Documentação histórica de Graphify da agência não comprova esta implementação. Sem Git na raiz: não se afirmam commits ou worktrees.
