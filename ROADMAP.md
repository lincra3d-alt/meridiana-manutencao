# Roteiro do Sistema · Gestão de Manutenção Meridiana

## Feito
- (13/09/2026) Correcao Governanca (app.js v=86): rouparia e danificados voltaram para OS DOIS tipos (govEspeciaisDe retorna sempre GOV_ESPECIAIS) - o pedido "nem rouparia nem danificado" era sobre o grafico antigo, nao sobre remove-los. Contagem recebeu governanca__geral (1374) e danificados__geral (93) copiados do inventario. Removido o total de pecas exibido (cabecalho so mostra "X de Y locais contados"; tirado o total geral que tinha sido posto na secao Locais) porque o detalhe ja esta por bloco/quarto/item. Grafico "Total por bloco" segue removido (card de Recebidos no lugar).
- (13/09/2026) Todos os links publicos ficam na aba Gestao (app.js v=84): tirado o botao de link do cabecalho da Governanca (sobrou so Imprimir); os links Governanca Contagem e Governanca Inventario foram para gest-inner (openLinkGov), junto de geral/planejado/emergencial/asg e Contagens (Brava).
- (13/09/2026) Governanca com fila de Recebidos, como setor proprio (app.js v=83, style.css v=20). Tirado o grafico "Total por bloco"; no lugar um card de Recebidos (govRecebidosCard) igual ao do dashboard. O link governanca.html agora NAO grava direto no local: envia para hotel_manutencao/governancaRecebidos [{id,tipo,localKey,itens,total,ts,por}]. No modulo, o card abre o painel (ov-govrec / openGovRecebidos) listando os enviados por tipo, com Aceitar (grava no governanca/{tipo}/{localKey} e tira da fila), Ver itens e Recusar. Listener le governancaRecebidos -> GOV_RECEBIDOS. Mantido o grafico "Quantidades por item" (total de cada tipo de peca). Validado ponta a ponta: link -> fila -> aceite atualiza o local e limpa a fila.
- (13/09/2026) Governanca: rouparia e danificados agora SO no Inventario, nao na Contagem mensal (app.js v=82). Helper govEspeciaisDe(tipo) (inventario -> GOV_ESPECIAIS, contagem -> []); aplicado em govLocais, renderGovLocais, govChartBlocos, imprimirGov; no link governanca.html o dropdown de Bloco monta os especiais so no inventario (montarBlocos/onTipo). Contagem ficou 41 de 41 locais; Inventario 43 de 43.
- (13/09/2026) Governanca reestruturada por LOCAL (app.js v=81, style.css v=19, governanca.html reescrito). Cada contagem/inventario e guardada por local: bloco+quarto, mais Governanca (rouparia) e Danificados. Blocos/quartos pre-definidos (GOV_BLOCOS): B1 [2-10,31,32], B2 [20-30], B3 [1,11-19,41], B4 [33-40]; especiais GOV_ESPECIAIS (governanca, danificados). No banco: hotel_manutencao/governanca/{tipo}/{localKey} = {itens:[{n,q}],total,ts,por,obs} (localKey = bXX__quarto ou esp__geral); governancaItens/{contagem,inventario} = listas. Removido o modelo flat antigo (governancaRegistros). Painel: total geral + progresso (X/Y locais), grafico total por bloco, grafico qtd por item somando todos os locais, grade de blocos com chips de quarto (numero+total, dourado se contado), cards de rouparia/danificados. Modal por local (ov-govlocal) com ver/editar/adicionar/remover item. Link governanca.html agora em cascata: Tipo -> Bloco -> Quarto (troca o bloco, muda os quartos; rouparia/danificados sem quarto), grava direto no local. Seed real por quarto da planilha (41 quartos: B1 279, B2 232, B3 269, B4 218; rouparia 1374; danificados 93 com motivos na obs). Validado ponta a ponta (painel, modal, salvar, link cascata) e visual.
- (11/09/2026) Modulo Governanca no Costa do Sol (app.js v=80, style.css v=17 + governanca.html). Flag governanca:true em HOTELS. Aba Governanca entre ASG e Gestao. Submenu lateral retratil (abre no hover no PC via @media(hover:hover); botao burguer no mobile via @media(hover:none) + classe .open; a transicao so "congela" no preview sem compositacao, no navegador real anima normal). Dois tipos: Contagem (mensal) e Inventario (semestral, tem itens a mais: BERCO, TOALHA DE MESA, RODO, VASSOURA, PA). Dashboard com 2 graficos SVG: evolucao do total por registro e comparativo por item (diferenca vs registro anterior, verde/vermelho, ou quantidades quando so ha 1). Tabela editavel (bloqueia/Editar/Salvar), adicionar e remover item, imprimir, link publico. Dados no no hotel_manutencao: governancaItens/{contagem,inventario} e governancaRegistros [{id,tipo,ts,hora,itens:[{n,q}],total,por,obs}]. Seed real da planilha (22 itens enxoval, total 2447): 1 registro inventario + 1 contagem, datados 11/09/2026. Backup previo salvo em backup_costa_do_sol_pre_governanca_20260911.json. Validado ponta a ponta (app, edicao, link, graficos) e visual.
- (31/08/2026) Contagem, modo bloqueado/edicao (app.js v=78, style.css v=16): por padrao o modal abre bloqueado (inputs disabled, so botao Editar/Nova contagem/Imprimir). Botao Editar (verContagem com flag editando) libera os campos, mostra tag EDITANDO, botoes Salvar/Cancelar/Adicionar item e um X vermelho por linha (removeContagemItem, com confirm, tira o item da lista mestre e da contagem preservando as quantidades ja digitadas). Salvar rebloqueia; Cancelar rebloqueia descartando (re-render). Validado ponta a ponta (bloqueia/edita/salva/persiste) e visualmente.
- (31/08/2026) Contagem, melhorias no modal (app.js v=77, style.css v=15): coluna Qtd editavel (inputs .cont-inp) com total ao vivo e botao Salvar alteracoes (salvarContagemEdit, fresh-read+set na contagem por id); botao Adicionar item (addContagemItem: acrescenta na lista mestre contagemItens/<setor> e na contagem atual com q=0); X fixo no topo do modal (.cont-close, modal com body rolavel interno) no lugar do Fechar de baixo. Validado: editar persiste, adicionar persiste nos dois nos, X fica fixo ao rolar.
- (31/08/2026) Novo modulo Contagem no Brava Club (app.js v=76 + contagem.html). Aba Contagem entre ASG e Gestao (so no Brava Club, flag contagem:true em HOTELS). Setores: Cozinha (estruturada), Recepcao/Manutencao/Governanca (em breve). Dados no no hotels/brava_club: contagemItens/<setor> (lista de nomes) e contagens (historico [{id,setor,ts,hora,itens:[{n,q}],total,por}]). Itens guardados como lista {n,q} porque chave do Firebase nao aceita ponto (ex: Travessa ret. melamina). Link publico contagem.html?h=brava_club[&s=setor]: escolhe setor, conta (campo em branco), envia (fresh-read+set em /contagens). Botao Contagens na Gestao (reusa modal ov-link, com link-title/link-desc dinamicos). Modulo mostra cards por setor, ultima contagem, historico, tabela e impressao. Seed: lista da cozinha (87 itens) + 1a contagem datada 31/08/2026 total 1026 pecas. Validado ponta a ponta (app + link).
- (24/08/2026) Viagens da frota / Carros (app.js v=75): 1) o codigo de 4 digitos agora aparece no card de Viagens em aberto (🔑 Codigo XXXX) e no titulo do modal de edicao, para dar para consultar depois do aceite. 2) aceitar uma viagem ainda em aberto (sem KM final) nao marca mais como Concluido: mantem em Andamento ate o motorista finalizar pelo link. 3) aviso (confirm) ao aceitar corrida em aberto mostrando Viagem/Codigo e perguntando se deseja mesmo receber. Validado no banco real dos Carros.
- (21/08/2026) Correcao da criacao e edicao manual de servicos (app.js v=74): addRecord, saveEdit passam a ler os dados frescos do servidor, aplicar a mudanca e regravar so o no data (async), igual ao aceite. Antes gravavam o blob local inteiro e o listener on(value) podia sobrescrever com dado velho, perdendo o registro recem criado/editado (Planejado, Emergencial, ASG e Viagem). Validado ponta a ponta COM o listener ativo no Costa do Sol: registro persiste no servidor apos 5s (passado o debounce e o eco).
- (20/08/2026) Correcao do aceite de recebidos (app.js v=73): aceitar/recusar recebido agora le os dados frescos do servidor, altera pelo ID e regrava so o no data (async). Antes o aceite dependia de estado guardado (acceptTarget) e do blob local, e nao persistia em producao (item ficava travado em Recebidos). Botoes do modal passam o ID direto. Validado ponta a ponta no banco real: apos reler do servidor, o registro fica pend:false com o tipo escolhido.
- Anti XSS (escape dos campos vindos do público, no app e no link)
- Backup em JSON (Parâmetros) + snapshot automático local
- Lixeira: exclusões recuperáveis por 30 dias (registros, meses, rejeições)
- Bloqueio após 3 tentativas de código erradas (libera em 15 min)
- Gestão de senhas só na Área Administrativa (redefinir código das unidades + master)
- Log de alterações (Parâmetros > Histórico): ação, alvo, data/hora e origem
- PDF completo: coluna Registro (Adicionado, Concluído, Identificado por, Responsável)
- Mês criado automaticamente ao virar o mês
- Logos por unidade + logos do grupo + marca d'água no Dashboard

## Fase 1 · Segurança estrutural
FEITO (19/08/2026):
- Conta tecnica do sistema criada no Firebase Auth: sistema@meridiana.app / Adri@no3. (email/senha)
- App principal entra com essa conta (com plano B anonimo se falhar); link publico continua anonimo
- Regras publicadas: config so acessivel pela conta sistema@meridiana.app; hotel_manutencao e hotels com auth != null
- Validado em producao: login master OK, dados carregam, link publico envia, e leitura de config pelo anonimo = PERMISSION_DENIED
- Rollback das regras: {"rules":{".read":"auth != null",".write":"auth != null"}}
- Risco residual (aceito): quem abrir o codigo do app acha as credenciais da conta tecnica; eliminar 100% exigiria servidor (Cloud Functions / Blaze)

AINDA PENDENTE nesta fase:
- Blindar mais o link: enviar so para uma fila de "recebidos" (hoje o link ainda le/grava dados). Exige reescrever submit.html + regras por no.
- Habilitar Firebase Storage (para as fotos com compressao)

### Recuperacao da senha master (IMPORTANTE lembrar)
A senha master fica criptografada de mao unica, nao da para "ler" a esquecida.
Para recuperar, pelo Console do Firebase:
1. console.firebase.google.com > projeto hotel-manutencao
2. Realtime Database
3. Abrir o no config > masterPin
4. Apagar somente o masterPin (NAO apagar o config inteiro, senao apaga os codigos das unidades em hotelPins)
5. Voltar no sistema: digitar qualquer coisa no login abre a tela de unidades; clicar numa unidade faz o sistema pedir para criar uma nova senha master
6. Definir a nova na hora (nesse intervalo o sistema fica sem master)
Guardar a senha master num lugar seguro para nem precisar recuperar.

## Pendente (código, sem Console)
- (FEITO 19/08/2026) Fotos nos servicos via Cloudinary (plano free, sem cartao). Cloud: gjdetk7j, upload preset unsigned: meridiana_fotos. Upload em submit.html (campo Foto no relato), com compressao (canvas, max 1280px, jpeg 0.7); guarda so a URL em r.foto. Exibida no card (meta), em Recebidos, na aba Em Andamento e no modal de edicao (com "Remover foto"). URL validada so se comeca com https.
- Notificações (email ou WhatsApp) de recebidos e de regras de manutenção a vencer
- App instalável (PWA) — deixar por último, a pedido
- Salvar a logo carros.png

## Descartado
- Aba "Em Andamento" no link dos Carros (redundante: Finalizar viagem já mostra o carro em corrida)
