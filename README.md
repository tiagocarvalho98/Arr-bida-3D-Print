# Arrábida 3D Print — pré-visualização local

Homepage, três landing pages mock com personalização por produto e CRM em transição para Supabase. Rita coordena conceito, design e webdesign localmente. Workflow: `Agente/workflows/W14-catalog-crm-pipeline.md` na raiz da agência.

## Executar

Na pasta deste projeto, com Python 3 instalado:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4173`. Requer servidor HTTP para os módulos JavaScript; abrir o HTML por file:// não é o modo suportado. Sem instalação npm para abrir o website; os testes de BD usam npm ci.

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

## CRM — transição para Supabase

Abrir `http://127.0.0.1:4173/crm/`. A página apresenta o estado de preparação, sem login demo nem carregamento automático de exemplos. Os dados antigos do browser ficam isolados; não são importados para a BD.

A migration inicial prepara clientes, catálogo, encomendas, pipeline, tarefas, orçamentos com vários filamentos, stock e histórico. **Ainda não aplicada remotamente.** Auth e comandos de escrita transacionais são o próximo passo; a UI de operação está temporariamente desativada durante esta transição.

Detalhes, permissões e sequência de integração: [supabase/README.md](supabase/README.md). Os exemplos existentes no código ficam apenas para testes de regressão e referência da integração.

Para testar a migration num PostgreSQL isolado:

```powershell
npm ci
node tests/database.test.mjs
```

Os restantes testes continuam em `tests/*.test.mjs`. Não há chaves secretas ou password de BD no código.