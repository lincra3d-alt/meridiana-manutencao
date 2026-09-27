# MAPA DO PROJETO — Manutenção Grupo Meridiana

Índice mestre para achar rápido onde mexer, sem precisar ler o projeto inteiro.
Sempre que pedir uma alteração, o assistente consulta este mapa e vai direto na seção/linha.

> Atualize este arquivo quando mover código ou criar um módulo novo.
> As linhas do `app.js` mudam conforme o código cresce; use os cabeçalhos de seção
> (`// ─── NOME ───`) como referência estável, não só o número da linha.

---

## 1. Arquivos do projeto

| Arquivo | Função |
|---|---|
| `index.html` | Página principal do painel (login, landing, modais, estrutura). Carrega `app.js?v=N` e `style.css?v=N`. |
| `app.js` | Toda a lógica do painel (4300+ linhas, dividido em seções por cabeçalho). |
| `style.css` | Todo o visual do painel. |
| `submit.html` | Formulário público de LINK (Planejado, Emergencial, ASG, Serviço e Viagem dos Carros). Escreve na fila de pendentes/recebidos do Firebase. |
| `contagem.html` | Formulário público de LINK da Contagem (cozinha Brava Club). |
| `governanca.html` | Formulário público de LINK da Governança (enxoval Costa do Sol). |
| `logos/` | Logos das unidades (`<key>.png`). |
| `serve.ps1` / `server.js` | Servidor local de teste (localhost:3000). |
| `netlify.toml` | Config do deploy (deploy é manual, arrastando a pasta no Netlify). |
| `backup/` | Backups datados antes de mudanças grandes. |
| `CLAUDE.md` | Regras obrigatórias do projeto. |
| `ROADMAP.md` / `CRONOGRAMA.md` | Histórico e planejamento. |

**Publicar mudança:** subir `?v=N` do arquivo alterado em `index.html`, arrastar a pasta no Netlify, dar Ctrl+F5.

---

## 2. Unidades / Hotéis

Definidas no array `HOTELS` em `app.js` (seção `// ─── HOTELS ───`, por volta da L138).

| key | Nome | path no Firebase | Módulos extras |
|---|---|---|---|
| `costa_sol` | Costa do Sol | `hotel_manutencao` | **Governança** |
| `brava_club` | Brava Club | `hotels/brava_club` | **Contagem** (cozinha) |
| `brava_exclusive` | Brava Exclusive | `hotels/brava_exclusive` | (padrão) |
| `vila_pitanga` | Vila Pitanga | `hotels/vila_pitanga` | (padrão) |
| `maria_maria` | Maria Maria | `hotels/maria_maria` | **Inventário** |
| `carros` | Carros (frota) | `hotels/carros` | **frota**: Serviços + Viagem |

Flags que ligam recursos por unidade (no objeto do hotel): `governanca`, `contagem`, `inventario`, `frota`, `emrgServicos`.
A unidade `carros` troca os rótulos (Planejado vira "Serviço", Emergencial vira "Viagem").

Helpers: `hotelInfo()`, `hotelPath()`, `hotelLabels()`, `isViagemRow()` (todos logo abaixo do array `HOTELS`).

---

## 3. Módulos (abas dentro de cada unidade)

Menu montado por `modulosDaUnidade(key)` / `buildModuleMenu()` / `setModule()` / `validModule()`
(seção `// ─── BUILD UI ───`, por volta da L1246 a L1296).

| Módulo | key | Onde aparece |
|---|---|---|
| Dashboard | `dash` | Todas |
| Planejados / Serviços | `plan` | Todas |
| Emergencial / Viagem | `emrg` | Todas |
| ASG | `asg` | Todas menos frota (Carros) |
| Contagem | `cont` | Só Brava Club |
| Governança | `gov` | Só Costa do Sol |
| Inventário | `inv` | Só Maria Maria |
| Gestão (links) | `gest` | Todas (guarda os LINKS públicos) |
| Relatórios | `rel` | Todas |
| Cadastros | `cad` | Todas |
| Parâmetros | `param` | Todas |

---

## 4. Índice de seções do `app.js`

Cada bloco tem um cabeçalho `// ─── NOME ───` no código. Faixa de linha é aproximada.

| Seção (cabeçalho no código) | Linha aprox. | O que faz |
|---|---|---|
| CONSTANTS | L1 | Listas base: serviços, destinos, veículos, geradores, ASG. |
| CONTAGEM (por setor) | L18 | Modelo e helpers da Contagem (Brava). |
| GOVERNANÇA (dados) | L76 | Modelo: blocos, quartos, enxoval, especiais; helpers `gov*`. |
| HOTELS | L137 | Array de unidades + helpers de unidade. |
| STATE | L177 | Variáveis globais de estado (DATA, MONTHS, activeModule, activeProfile...). |
| FIREBASE CONFIG | L191 | Chaves do Firebase. |
| FIREBASE | L202 | `initFirebase`, `listenData`, `pushToFirebase`, `scheduleSave`. |
| ID / SYNC | L341 | `genId`, `ensureIds`, `syncToSiblings`, `updateField`. |
| HELPERS | L375 | Classes/labels de prioridade, status, datas, `esc`. |
| KPIs | L460 | `computeKPIs`. |
| ÁREA ADMINISTRATIVA | L494 | Visão do grupo, entrar/sair, meses, KPIs do grupo, entrar na unidade. |
| PERFIS DE ACESSO | L526 | CRUD de perfis, permissões por unidade/módulo (`salvarPerfil`, `renderPerfil*`). |
| SENHAS | L653 | Gestão de PINs por unidade e master (só Área Admin). |
| RELATÓRIOS (impressão) | L835 | `printReport`, `relCombustivel`, `relFuncionario`. |
| REGRAS / ALERTAS (Carros) | L886 | Alertas de manutenção por KM/data (`computeAlertas`, `openRegras`). |
| CADASTROS | L1031 | Central de listas editáveis + KPIs abertos + Viagens abertas. |
| DASHBOARD + BUILD UI | L1172 | `renderDashboard`, roteamento de módulos, `buildViews`. |
| INVENTÁRIO (Maria Maria) | L1368 | Estoque: cards, transferência, entrada/saída. |
| BUILD UI / TABELAS | L1535 | Abas de mês, painéis, tabelas Plan/Emrg/ASG e suas linhas. |
| CÉLULAS EDITÁVEIS | L1728 | Células de descrição, data, número, ciclos de prioridade/status, escolha de serviço. |
| TAB / NAVIGATION | L2164 | Trocar aba, contadores, rodapé. |
| DELETE MONTH | L2193 | Excluir mês. |
| FILTERS / SORT | L2221 | Filtro e ordenação das tabelas. |
| NEW MONTH MODAL | L2284 | Criar mês novo. |
| RECORD MODAL | L2365 | Modal de novo/editar registro (`openModal`, `saveEdit`, `addRecord`). |
| HOTEL SWITCHER | L2679 | Trocar de unidade. |
| LINK PÚBLICO | L2709 | Gerar/copiar links (`getSubmitURL`, `openLinkPublico`). |
| CONTAGEM (painel) | L2760 | Tela da Contagem: ver, salvar, imprimir, gerar link. |
| GOVERNANÇA (painel) | L2969 | Tela da Governança: submenu, locais, gráficos, recebidos, link. |
| CONFIRMAR PENDENTE | L3250 | Confirmar item pendente. |
| EXPORT / LOG / LIXEIRA | L3274 | Backup, CSV, histórico de alterações, lixeira 30 dias. |
| EXPORT PDF | L3383 | Modal de exportar PDF com filtros (`openPdf`, `runPdfExport`). |
| BUSCA DE RELATÓRIO (Carros) | L3605 | Busca por data em todos os meses + prévia (`openRelBusca`, `abrirPreviaRel`). |
| PENDENTES PANEL | L3695 | Fila de recebidos dos links: aceitar/rejeitar (`renderPendentesPanel`, `acceptPendAs`). |
| INIT | L3900 | Landing, `pickHotel`, `ensureApp`. |
| CONTROLE DE ACESSO (PIN) | L3927 | PIN por unidade, `sha256`, recuperação. |
| ADMIN / SENHAS | L4082 | Trocar PIN da unidade e master pelo painel. |
| LOGIN POR CÓDIGO | L4129 | Tela de login: código, perfil (nome+senha), trocar senha no primeiro acesso, tema. |

---

## 5. Estrutura do Firebase (Realtime Database)

| Nó | Conteúdo |
|---|---|
| `config/masterPin` | Senha master (sha256). |
| `config/accessPin` | PIN de acesso geral (sha256). |
| `config/hotelPins/<key>` | PIN por unidade (sha256). |
| `config/perfis/<id>` | Perfis de acesso: `{nome, codigo(sha256), unidades, modulos, ativo, trocarSenha}`. |
| `hotel_manutencao/...` | Dados da **Costa do Sol** (months, data, log, lixeira, regras). |
| `hotels/<key>/...` | Dados das demais unidades (mesma estrutura). |
| `.../governanca` + `governancaItens` + `governancaRecebidos` | Governança (Costa do Sol). |
| `.../contagemItens` + `contagens` | Contagem (Brava Club). |
| `.../pendentes` | Fila dos links públicos aguardando o supervisor aceitar. |

**Regra de ouro da gravação:** ler o nó fresco do servidor, alterar, e dar `.set()` de volta
(evita corrida com o listener `on('value')`). Ver `pushToFirebase` e os `salvar*` dos módulos.

---

## 6. Funcionalidade → onde mexer (mapa cruzado)

Cada funcionalidade costuma tocar mais de um arquivo. Guia rápido:

| Funcionalidade | Arquivos e seções |
|---|---|
| **Governança** (Costa do Sol) | `app.js` seções GOVERNANÇA (L76 dados, L2969 painel) + `governanca.html` (link) + Firebase `governanca*`. |
| **Contagem** (Brava) | `app.js` seção CONTAGEM (L18 dados, L2760 painel) + `contagem.html` (link) + Firebase `contagem*`. |
| **Carros / Frota** | `HOTELS` (key `carros`, L138) + REGRAS/ALERTAS (L886) + BUSCA RELATÓRIO (L3605) + Viagens (`isViagemRow`, `nextViagemNum`, `kmRodado`) + `submit.html` (form de viagem). |
| **Inventário** (Maria Maria) | `app.js` seção INVENTÁRIO (L1368). |
| **Links públicos + fila** | LINK PÚBLICO (L2709) + PENDENTES PANEL (L3695) + `submit.html`/`contagem.html`/`governanca.html`. |
| **Perfis e permissões** | PERFIS (L526) + módulos (L1246) + LOGIN (L4129). |
| **Login / senhas / primeiro acesso** | LOGIN POR CÓDIGO (L4129) + CONTROLE DE ACESSO (L3927) + SENHAS (L653) + ADMIN (L4082). |
| **Relatórios / PDF / impressão** | RELATÓRIOS (L835) + EXPORT PDF (L3383) + BUSCA RELATÓRIO (L3605). |
| **Visual / cores / layout** | `style.css` (lembrar: `@media screen` vira cards; `.cont-table` precisa sobrescrever). |

---

## 7. Lembretes de manutenção

* **Backup antes de mudança grande** (regra do projeto), em `backup/`.
* **Nunca** excluir o banco por completo (regra do projeto).
* **Não** mudar layout sem pedido específico (regra do projeto).
* Chave do Firebase **não pode conter ponto** (`.`): itens da Contagem/Governança são lista `{n, q}`, não mapa pelo nome.
* Repositório GitHub é **privado** (`app.js` expõe conta técnica e config do Firebase).
* Sem hífen e sem travessão nos textos que o usuário vê.
* Após alterar `app.js`/`style.css`: subir `?v=N` em `index.html` e publicar no Netlify + Ctrl+F5.
