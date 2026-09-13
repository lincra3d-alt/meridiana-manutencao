# Cronograma · Perfis, Área Admin e GitHub

Objetivo do dia: subir o projeto no GitHub, mover a Área Administrativa para a página principal e criar o sistema de perfis com permissões por unidade e por módulo.

Regras do projeto que valem sempre: nunca apagar o banco inteiro; fazer backup antes de mudança grande; não mexer no layout sem pedido. Sem hifen nem travessao nas copys.

## Decisões rápidas para confirmar no começo (2 min)
1. Repositório GitHub: privado (recomendado, porque o app.js tem as credenciais da conta tecnica e a config do Firebase). Confirmar a conta/organização do GitHub.
2. Como a pessoa entra com um perfil: cada perfil ganha um codigo proprio de acesso (igual aos codigos de unidade de hoje). Digitou o codigo do perfil, entra ja com as permissoes dele. (Recomendado, encaixa no modelo atual sem login individual.)
3. Permissão de módulos: por unidade (mais flexivel). Ex: Marcio no Brava so ASG e Planejado, e em outra unidade outra combinacao. Com um atalho "aplicar a todas as unidades escolhidas" para agilizar.

## Fase A · Subir no GitHub (estimativa 20 a 30 min)
1. Criar .gitignore (ignorar arquivos locais e temporarios; manter o codigo do site).
2. git init, primeiro commit com todo o projeto.
3. Criar o repositorio PRIVADO no GitHub e dar push.
4. Combinar o fluxo: como o deploy continua sendo manual no Netlify (arrastar a pasta), o GitHub serve por enquanto de historico e backup do codigo. Opcional futuro: ligar Netlify no GitHub para deploy automatico.
5. Observacao de seguranca: como o app.js expoe a conta tecnica do Firebase, o repo precisa ser privado. Se um dia for aberto, trocamos por um backend.

## Fase B · Área Administrativa na página principal (estimativa 30 a 45 min)
1. Hoje o botao Area Administrativa fica na tela de selecao de unidade. Mover para a pagina inicial (login/landing).
2. Manter a protecao por senha master para abrir a area.
3. Testar em todas as unidades para nao quebrar o fluxo de login atual.

## Fase C · Perfis e permissões (o gargalo) (estimativa 2 a 3 h)
Ideia: dentro da Area Administrativa, uma secao Perfis onde voce cria e edita perfis.

### C1. Modelo de dados (no config, junto de accessPin e hotelPins)
- config/perfis: lista de perfis. Cada perfil:
  - id, nome (ex: Marcio Supervisor)
  - codigo de acesso proprio (guardado criptografado, igual aos outros codigos)
  - unidades liberadas (lista de unidades)
  - modulos liberados por unidade (ex: brava_club: [planejado, asg])
  - ativo (liga/desliga sem apagar)
- Modulos que podem ser liberados por unidade: Dashboard, Planejados, Emergencial, ASG, Contagem (so Brava), Gestao, Relatorios, Cadastros, Parametros, Inventario (so Maria Maria). Definir quais entram na lista de permissao.

### C2. Tela de administração de perfis
- Listar perfis existentes (nome, unidades, status).
- Criar/editar perfil: nome, codigo, escolher unidades por caixas de selecao, e para cada unidade escolher os modulos por caixas de selecao. Atalho para aplicar os mesmos modulos a todas as unidades escolhidas.
- Ativar/desativar e excluir (excluir vai para a Lixeira, seguindo o padrao do sistema).
- Protegido por senha master.

### C3. Login com perfil
- Ao digitar um codigo no login, alem de testar master, accessPin e hotelPins, testar tambem os codigos dos perfis.
- Se bater com um perfil: guardar o perfil ativo da sessao e suas permissoes.

### C4. Aplicar as permissões na navegação
- Selecao de unidade: mostrar so as unidades do perfil. Se for so uma, entra direto.
- Menu de modulos (buildModuleMenu): mostrar so os modulos liberados para a unidade atual daquele perfil; esconder o resto.
- Bloqueio de rota (validModule): se tentar um modulo nao liberado, cair no primeiro modulo permitido.
- Master continua vendo tudo, em todas as unidades.

### C5. Testes
- Criar um perfil de teste (ex: Marcio: Brava com ASG e Planejado; e mais uma unidade).
- Entrar com o codigo do perfil e conferir: so aparecem as unidades e modulos certos; o resto fica oculto; nao da para burlar pela navegacao normal.
- Conferir que master e os codigos de unidade antigos continuam funcionando.

## Ordem sugerida do dia
1. Backup do banco (regra do projeto).
2. Fase A (GitHub).
3. Fase B (mover Area Administrativa).
4. Fase C (perfis), na ordem C1 a C5.
5. Deploy no Netlify (arrastar a pasta) e validar em producao.

## Riscos e observações honestas
- As permissoes de perfil sao aplicadas no lado do cliente (escondem modulos e unidades). Isso organiza o acesso e evita erro no dia a dia, mas nao e uma trava de seguranca forte: quem entende de navegador poderia tentar burlar. Para virar trava de verdade seria preciso login individual e regras no servidor (Firebase por usuario), que e um projeto maior. Fica registrado para decidir depois.
- Mexer no login e nas regras exige cuidado: testar unidade por unidade antes de publicar, para nao travar producao.
- Tudo com backup antes.
