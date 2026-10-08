# Arrábida 3D Print — pré-visualização local

Homepage, três landing pages mock com personalização por produto e CRM de demonstração. Rita coordena conceito, design e webdesign localmente. Workflow: `Agente/workflows/W14-catalog-crm-pipeline.md` na raiz da agência.

## Executar

Na pasta deste projeto, com Python 3 instalado:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4173`. Requer servidor HTTP para os módulos JavaScript; abrir o HTML por file:// não é o modo suportado. Sem instalação npm.

## Editar

- Homepage: `index.html`.
- Produto 1, Produto 2 e Produto 3: `scripts/products.mjs`. Cada um declara o seu esquema de campos.
- Páginas: `produto.html?id=produto-1`, `produto.html?id=produto-2`, `produto.html?id=produto-3`.
- Formulários e resumo: `scripts/product-page.mjs`.
- Cores: `styles/tokens.css`; layout e placeholders: `styles/site.css`.
- Fotografias: substituir `.product-visual` e `.portfolio-placeholder` por media real, mantendo proporções e texto alternativo. Nada foi gerado por AI.
- Logótipo: `assets/logo.jpeg`, cópia intacta do original.

## Testar

```powershell
node tests/products.test.mjs
```

O comando direto evita subprocessos bloqueados pelo sandbox. Evidências visuais/funcionais em `verification.md`.

## Limites

Os formulários públicos só apresentam um resumo local; não enviam dados nem criam encomendas. Contactos e fotografias reais estão pendentes. Sem checkout, autenticação real, uploads ou QR funcional. O conteúdo mock não é um catálogo comercial final.

## CRM de demonstração

Abrir `http://127.0.0.1:4173/crm/` e clicar **Entrar na demonstração**. Conta única “Administrador demo”, sem palavra-passe. Futuramente haverá duas contas individuais, para owner e sócio. Não inserir dados reais.

Áreas: Hoje, Clientes, Pipeline, detalhe da encomenda/execução, Tarefas, Catálogo, Filamentos e Definições. Criar/editar clientes e encomendas; aprovar arte; acompanhar tarefas; reservar filamento e confirmar consumo real. Dados fictícios guardados só neste browser.

LocalStorage: `arrabida.crm.demo.v1`. SessionStorage: `arrabida.crm.demo.session.v1`. Sair não apaga os dados. Em Definições, “Repor dados de exemplo” pede confirmação e restaura apenas o CRM. Dados inválidos abrem recuperação; não são apagados automaticamente. Outra aba com versão desatualizada tem de recarregar antes de editar.

Não há backend, sincronização, segurança real de contas ou captura automática dos formulários públicos. O custo mostrado cobre apenas filamento. Peso inteiro em gramas nesta demo; custo de compra guardado em milésimos de euro e apresentado em euros.

Testes adicionais, executados da pasta deste projeto:

```powershell
node tests/crm-store.test.mjs
node tests/crm-inventory.test.mjs
node tests/crm-commands.test.mjs
node tests/crm-selectors.test.mjs
```

Código em `crm/`; evidências em [crm/verification.md](crm/verification.md).
