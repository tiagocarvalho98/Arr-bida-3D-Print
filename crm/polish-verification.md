# CRM — revisão visual, 2026-10-08

Direção aprovada pelo owner: dashboard compacta, sidebar escura, superfícies claras e oliva, ícones consistentes e microinterações segundo emil-design-eng. Alterações limitadas ao CRM.

- Navegação mantém a estrutura montada e o estado recolhido da sidebar.
- Transições de vista/toast: 160 ms; abertura de modal: 200 ms. Teclado e reduced-motion sem animação de entrada.
- Browser: sete áreas em 1366×768, 1440×900, 1920×1080 e 390×844 sem overflow horizontal da página. Pipeline mantém scroll próprio.
- Verificados modal por ponteiro (1 animação), teclado (0), reduced-motion (0), fecho do menu mobile e scroll do conteúdo.
- 22 testes funcionais passaram: produtos, store, inventário, comandos e seletores.
- Revisão independente: corrigidos scroll da sidebar em janelas baixas e nome acessível do logótipo na navegação recolhida.
- Capturas: polish-1366.png, polish-1440.png, polish-1920.png, polish-390.png. Inspeção visual desktop/laptop realizada.

Continua a ser demonstração local, com dados fictícios e sem autenticação real. Publicação do código autorizada pelo owner no repositório tiagocarvalho98/Arr-bida-3D-Print; não equivale a deploy.
