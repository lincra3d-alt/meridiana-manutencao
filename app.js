// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const PRIO_CYCLE = ['ALTA','MEDIA','BAIXA'];
const ST_CYCLE   = ['INDENTIFICADO','ANDAMENTO','CONCLUIDO'];
const DEFAULT_SERVICOS = ['REPAROS','LIMPEZA','AR','LAMPADA','TV','PINTURA','INSTALAÇÃO','VIDROS','OBRA','ELETRICA','REFRIGEREÇÃO','CHUVEIRO','REFORMA','MANUTENÇÃO','TELEFONE','JARDIM'];
const CARROS_SERVICOS = ['REVISÃO','TROCA DE ÓLEO','PNEUS','FREIOS','SUSPENSÃO','ALINHAMENTO','FUNILARIA','PINTURA','ELÉTRICA','AR CONDICIONADO','BATERIA','MECÂNICA','LAVAGEM','VIDROS','ABASTECIMENTO','LICENCIAMENTO','SEGURO','MULTAS'];
const VIAGEM_DESTINOS = ['PRAIA DOS OSSOS','PRAIA DA FERRADURA','PRAIA','JOÃO FERNANDES','CENTRO','COMPRAS'];
const CARROS_VEICULOS  = ['PARTNER','SPRINTER','Q7','RANGER','BMW'];
const CARROS_GERADORES = ['GERADOR BC','GERADOR CS'];
let SERVICOS = [...DEFAULT_SERVICOS];
let DESTINOS = [...VIAGEM_DESTINOS];
let VEICULOS  = [...CARROS_VEICULOS];
let GERADORES = [...CARROS_GERADORES];
const ASG_SERVICOS = ['LIMPEZA','ARRUMAÇÃO','LAVANDERIA','JARDIM','LIXO','PISCINA','ÁREA COMUM','BANHEIROS','VIDROS','ROÇAGEM','DEDETIZAÇÃO','MANUTENÇÃO'];
let ASGSERV = [...ASG_SERVICOS];
let REGRAS = [];

// ─── CONTAGEM (por setor) ─────────────────────────────────────────────────────
const CONTAGEM_SETORES = [
  { k: 'cozinha',    l: 'Cozinha',    ic: '🍽' },
  { k: 'recepcao',   l: 'Recepção',   ic: '🛎' },
  { k: 'manutencao', l: 'Manutenção', ic: '🔧' },
  { k: 'governanca', l: 'Governança', ic: '🧺' },
];
// Lista padrao da Cozinha (Brava Club). Serve de reserva caso o banco esteja vazio.
const COZINHA_ITENS_DEFAULT = [
  'Xícara de café (preta)','Pires de café (preto)','Xícara de café (branca)','Pires de café (branco)',
  'Xícara de café (Oxford)','Pires de café (Oxford)','Xícara de chá (Schmidt)','Pires de chá (Schmidt)',
  'Xícara de chá (Oxford)','Pires de chá (Oxford)','Prato de sobremesa','Prato de sopa',
  'Prato fundo Ceviche','Prato fundo Salada','Prato liso branco (diversos)','Prato preto','Prato azul',
  'Prato de plástico amarelo','Prato de madeira redondo de pizza','Bowl bege de plástico','Bowl de louça branco',
  'Bowl antigo','Bowl antigo pequeno','Ramekin médio','Ramekin pequeno','Ramekin grande','Açucareiro porta sachê',
  'Molheira pequena','Prato quadrado grande','Prato quadrado pequeno','Prato quadrado boleado',
  'Travessa retangular','Travessa ret. melamina','Travessa retangular estreita','Taça de sorvete de vidro',
  'Taça banana Split','Boleira de vidro','Travessa oval grande','Travessa de vidro','Travessa de vidro pequena',
  'Travessa de vidro com pé','Prato vidro decorado peq','Jarra de vidro','Saladeiras diversas de vidro','Tulipa',
  'Taça de vinho branco','Taça de vinho tinto','Taça de espumante','Copo suco café da manhã','Copo Preto (Dubai)',
  'Taça de coquetel','Copo de Whisky','Taça Gin Tônica (Borgonha)','Balde dourado','Bowl dourado',
  'Pegador dourado com garra','Pegador de gelo dourado','Pegador dourado meia garra','Pegador dourado longo',
  'Colher dourada','Concha dourada','Escumadeira dourada','Bandeja retangular preta','Bandeja redonda Preta',
  'Bandeja redonda de aço','Balde de gelo de aço','Balde de gelo de acrílico','Balde de gelo pequeno',
  'Pegador de gelo de aço','Pegador liso de aço','Colher arroz (Buffet) aço','Pegador de aço com garra',
  'Bailarina de aço','Colher de sobremesa','Colher de sopa','Garfo de sobremesa','Faca de sobremesa',
  'Garfo de mesa','Faca de mesa','Colher de chá','Colher de cafezinho','Pote quadrado peq vidro','Cinzeiro',
  'Fruteira vidro','Bomboneira peq','Pote musse com palha','Pote musse tapa vidro',
];
let CONTAGEM_ITENS = {};  // { setor: [nomes...] } vindo do banco
let CONTAGENS = [];       // historico: [{ id, setor, ts, itens:{nome:qtd}, total, por }]
function contagemItensDe(setor) {
  const custom = CONTAGEM_ITENS && CONTAGEM_ITENS[setor];
  if (Array.isArray(custom) && custom.length) return custom;
  if (setor === 'cozinha') return COZINHA_ITENS_DEFAULT;
  return [];
}
function setorLabel(k) { const s = CONTAGEM_SETORES.find(x => x.k === k); return s ? s.l : k; }
function ultimaContagem(setor) {
  return CONTAGENS.filter(c => c.setor === setor).sort((a, b) => (b.ts || 0) - (a.ts || 0))[0] || null;
}
function contagemTotal(c) {
  if (!c) return 0;
  if (typeof c.total === 'number') return c.total;
  return (Array.isArray(c.itens) ? c.itens : []).reduce((s, x) => s + (Number(x && x.q) || 0), 0);
}
// Quantidade de um item (por nome) numa contagem. itens = [{ n: nome, q: qtd }]
function contagemQtd(c, nome) {
  if (!c || !Array.isArray(c.itens)) return '';
  const it = c.itens.find(x => x && x.n === nome);
  return it ? it.q : '';
}
function fmtDataHora(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── GOVERNANÇA (Costa do Sol) ────────────────────────────────────────────────
// Contagem (mensal) e Inventário (semestral): mesma estrutura, o inventário tem itens a mais.
const GOV_ENXOVAL = [
  'T. ROSTO','T. BANHO','T. PISO','T. PRAIA','SAIA CASAL','SAIA SOLTEIRO','LENÇOL CASAL','LENÇOL SOLTEIRO',
  'COLCHA PIQUET C','COLCHA PIQUET S','PESEIRA CASAL','PESEIRA SOLTEIRO','CAPA DE TRAV.','FRONHAS PIQUET',
  'FRONHAS ALGODÃO','TRAVESSEIRO','ALMOFADAS','MANTA SOLTEIRO','EDREDOM CASAL','MANTA CASAL','ROUPÃO','EDREDOM SOLTEIRO',
];
const GOV_INVENTARIO_EXTRA = ['BERÇO','TOALHA DE MESA','RODO','VASSOURA','PÁ'];
const GOV_TIPOS = [
  { k: 'contagem',   l: 'Contagem',   ic: '📋', cad: 'mensal',    gen: 'f' },
  { k: 'inventario', l: 'Inventário', ic: '📦', cad: 'semestral', gen: 'm' },
];
function govItensDefault(tipo) {
  if (tipo === 'inventario') return [...GOV_ENXOVAL, ...GOV_INVENTARIO_EXTRA];
  return [...GOV_ENXOVAL];
}
// Blocos e quartos pré-definidos + locais especiais (rouparia e danificados)
const GOV_BLOCOS = [
  { k: 'b1', nome: 'Bloco 1', quartos: ['2','3','4','5','6','7','8','9','10','31','32'] },
  { k: 'b2', nome: 'Bloco 2', quartos: ['20','21','22','23','24','25','26','27','28','29','30'] },
  { k: 'b3', nome: 'Bloco 3', quartos: ['1','11','12','13','14','15','16','17','18','19','41'] },
  { k: 'b4', nome: 'Bloco 4', quartos: ['33','34','35','36','37','38','39','40'] },
];
const GOV_ESPECIAIS = [
  { k: 'governanca',  nome: 'Governança (rouparia)', ic: '🧺' },
  { k: 'danificados', nome: 'Danificados',           ic: '⚠' },
];
let GOV_ITENS = {};       // { contagem: [nomes], inventario: [nomes] }
let GOV_DADOS = {};       // { contagem: { localKey: {itens:[{n,q}],total,ts,por,obs} }, inventario: {...} }
let GOV_RECEBIDOS = [];   // fila do link aguardando confirmação: [{ id, tipo, localKey, itens, total, ts, por }]
let govView = 'contagem'; // submenu ativo
function govRecebidosDe(tipo) { return GOV_RECEBIDOS.filter(r => r && r.tipo === tipo).sort((a, b) => (b.ts || 0) - (a.ts || 0)); }
function govItensDe(tipo) {
  const custom = GOV_ITENS && GOV_ITENS[tipo];
  if (Array.isArray(custom) && custom.length) return custom;
  return govItensDefault(tipo);
}
function govTipo(k) { return GOV_TIPOS.find(x => x.k === k) || GOV_TIPOS[0]; }
function govTipoLabel(k) { return govTipo(k).l; }
// Rouparia e Danificados existem nos dois tipos (contagem e inventário)
function govEspeciaisDe(tipo) { return GOV_ESPECIAIS; }
function govLocais(tipo) {
  const arr = [];
  GOV_BLOCOS.forEach(b => b.quartos.forEach(q => arr.push(b.k + '__' + q)));
  govEspeciaisDe(tipo).forEach(e => arr.push(e.k + '__geral'));
  return arr;
}
function govLocalRec(tipo, localKey) { const d = GOV_DADOS && GOV_DADOS[tipo]; return (d && d[localKey]) || null; }
function govLocalQtd(rec, nome) { if (!rec || !Array.isArray(rec.itens)) return ''; const it = rec.itens.find(x => x && x.n === nome); return it ? it.q : ''; }
function govLocalTotal(rec) { if (!rec) return 0; if (typeof rec.total === 'number') return rec.total; return (Array.isArray(rec.itens) ? rec.itens : []).reduce((s, x) => s + (Number(x && x.q) || 0), 0); }
function govLocalEspecial(localKey) { return GOV_ESPECIAIS.find(e => localKey === e.k + '__geral'); }
function govLocalLabel(localKey) {
  const esp = govLocalEspecial(localKey); if (esp) return esp.nome;
  const [bk, qt] = localKey.split('__'); const b = GOV_BLOCOS.find(x => x.k === bk);
  return b ? (b.nome + ' · Quarto ' + qt) : localKey;
}
function govTotalGeral(tipo) { const d = GOV_DADOS[tipo] || {}; return Object.keys(d).reduce((s, k) => s + govLocalTotal(d[k]), 0); }
function govBlocoTotal(tipo, bk) { const d = GOV_DADOS[tipo] || {}; return Object.keys(d).filter(k => k.startsWith(bk + '__')).reduce((s, k) => s + govLocalTotal(d[k]), 0); }
function govAggItens(tipo) { const d = GOV_DADOS[tipo] || {}; const map = {}; Object.keys(d).forEach(k => (d[k].itens || []).forEach(it => { if (it && it.n) map[it.n] = (map[it.n] || 0) + (Number(it.q) || 0); })); return map; }
function govContados(tipo) { const d = GOV_DADOS[tipo] || {}; return govLocais(tipo).filter(k => d[k]).length; }

// ─── HOTELS ───────────────────────────────────────────────────────────────────
const HOTELS = [
  { key: 'costa_sol',      name: 'Costa do Sol',    tag: 'Boutique Hotel',     icon: '☀',  path: 'hotel_manutencao', governanca: true },
  { key: 'brava_club',     name: 'Brava Club',      tag: 'Hotel Pousada',      icon: '🌊', path: 'hotels/brava_club', contagem: true },
  { key: 'brava_exclusive',name: 'Brava Exclusive', tag: 'Praia da Brava',     icon: '◆',  path: 'hotels/brava_exclusive' },
  { key: 'vila_pitanga',   name: 'Vila Pitanga',    tag: 'Ferradura',          icon: '🌿', path: 'hotels/vila_pitanga' },
  { key: 'maria_maria',    name: 'Maria Maria',     tag: 'Ferradura',          icon: '✦',  path: 'hotels/maria_maria', inventario: true },
  { key: 'carros',         name: 'Carros',          tag: 'Frota / Veículos',   icon: '🚗', path: 'hotels/carros',
    labels: { plan: 'Serviços', planOne: 'Serviço', planIcon: '🔧', emrg: 'Viagem', emrgOne: 'Viagem', emrgIcon: '🚗' },
    servicos: CARROS_SERVICOS, emrgServicos: VIAGEM_DESTINOS, frota: true, veiculos: CARROS_VEICULOS, geradores: CARROS_GERADORES },
];
const DEFAULT_LABELS = { plan: 'Planejados', planOne: 'Planejado', planIcon: '📋', emrg: 'Emergenciais', emrgOne: 'Emergencial', emrgIcon: '⚡' };
let currentHotel = localStorage.getItem('currentHotel') || 'costa_sol';
function hotelInfo() { return HOTELS.find(h => h.key === currentHotel) || HOTELS[0]; }
function logoSrc(key) { return 'logos/' + (key || currentHotel) + '.png'; }
function hotelPath() { return hotelInfo().path; }
function hotelLabels() { return Object.assign({}, DEFAULT_LABELS, hotelInfo().labels || {}); }
function baseServicos() { return hotelInfo().servicos || DEFAULT_SERVICOS; }
function emrgServList() { return hotelInfo().emrgServicos ? DESTINOS : null; }
function automotorList() { return [...VEICULOS, ...GERADORES]; }
function isViagemRow(r) { return !!(hotelInfo().emrgServicos && r.tipo === 'EMERGENCIAL'); }
function nowHM() { const d = new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
async function checkMaster(senha) {
  ensureApp();
  const ms = await db.ref('config/masterPin').once('value');
  return !!ms.val() && (await sha256(senha)) === ms.val();
}
function pad3(n) { return String(n || 0).padStart(3, '0'); }
function genCode() { return String(1000 + Math.floor(Math.random() * 9000)); }
function nextViagemNum() {
  let max = 0;
  DATA.forEach(m => (m || []).forEach(r => { if (r.tipo === 'EMERGENCIAL' && typeof r.num === 'number' && r.num > max) max = r.num; }));
  return max + 1;
}
function kmRodado(r) {
  const a = parseFloat(r.kmIni), b = parseFloat(r.kmFim);
  return (isFinite(a) && isFinite(b) && b >= a) ? (b - a) : '';
}
function fmtBRL(n) { return 'R$ ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// ─── STATE ────────────────────────────────────────────────────────────────────
let MONTHS = [], DATA = [], INVENTARIO = [], LIXEIRA = [], LOG = [];
let activeMonth = 0, modalTarget = null, sortDir = {}, delMonthIdx = null, activeModule = 'dash', editTarget = null;
// Perfil ativo da sessão (null = master/diretoria, vê tudo). { nome, unidades:[keys], modulos:{ key:[mods] } }
let activeProfile = null;
let db = null, saveDebounce = null, activeRef = null, firstLoad = true, authReady = null;
function currentMonthName() {
  const d = new Date();
  return `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
}
let delRowTarget = { mi: null, gi: null };
let descTarget = { mi: null, gi: null };
let convertTarget = { mi: null, gi: null };

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const FIREBASE_CFG = {
  apiKey: "AIzaSyD5iD_RrPkfSW4_cgMbysEFKDpDh5_4i80",
  authDomain: "hotel-manutencao.firebaseapp.com",
  databaseURL: "https://hotel-manutencao-default-rtdb.firebaseio.com",
  projectId: "hotel-manutencao",
  storageBucket: "hotel-manutencao.firebasestorage.app",
  messagingSenderId: "368535658005",
  appId: "1:368535658005:web:5759f188a29710f7db781c"
};

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
function initFirebase(cfg) {
  try {
    ensureApp();
    document.getElementById('setup-screen').classList.add('hidden');
    setSyncStatus('syncing', 'Sincronizando…');
    Promise.resolve(authReady).then(() => listenData());
  } catch(e) {
    setSyncStatus('error', 'Erro de conexão');
    console.error(e);
    alert('Erro ao conectar: ' + e.message);
  }
}

function setSyncStatus(state, txt) {
  const dot   = document.getElementById('sync-dot');
  const label = document.getElementById('sync-txt');
  dot.className = 'sync-dot' + (state === 'ok' ? '' : state === 'syncing' ? ' syncing' : ' error');
  label.textContent = txt;
}

function listenData() {
  if (activeRef) { try { activeRef.off(); } catch(e){} activeRef = null; }
  firstLoad = true;
  const base = hotelPath();
  db.ref(`${base}/meta/initialized`).once('value')
    .then(snap => {
      if (!snap.val()) {
        db.ref(`${base}/meta/initialized`).set(true);
      }
      activeRef = db.ref(base);
      activeRef.on('value', snap => {
        const val = snap.val() || {};
        const newMonths = Array.isArray(val.months) ? val.months : [];
        const newData   = Array.isArray(val.data)
          ? val.data.map(m => Array.isArray(m) ? m : [])
          : [];
        while (newData.length < newMonths.length) newData.push([]);

        const customServicos = Array.isArray(val.servicos) ? val.servicos : [];
        SERVICOS = [...new Set([...baseServicos(), ...customServicos])];
        const customDest = Array.isArray(val.destinos) ? val.destinos : [];
        DESTINOS = [...new Set([...VIAGEM_DESTINOS, ...customDest])];
        const customVei = Array.isArray(val.veiculos) ? val.veiculos : [];
        VEICULOS = [...new Set([...CARROS_VEICULOS, ...customVei])];
        const customGer = Array.isArray(val.geradores) ? val.geradores : [];
        GERADORES = [...new Set([...CARROS_GERADORES, ...customGer])];
        const customAsg = Array.isArray(val.asgServicos) ? val.asgServicos : [];
        ASGSERV = [...new Set([...ASG_SERVICOS, ...customAsg])];
        REGRAS = Array.isArray(val.regras) ? val.regras : [];
        const newInv = Array.isArray(val.inventario) ? val.inventario : [];
        const corte = Date.now() - 30 * 86400000;
        const newLix = (Array.isArray(val.lixeira) ? val.lixeira : []).filter(x => !x.excluidoEm || x.excluidoEm >= corte);
        const newContItens = (val.contagemItens && typeof val.contagemItens === 'object' && !Array.isArray(val.contagemItens)) ? val.contagemItens : {};
        const newContagens = Array.isArray(val.contagens) ? val.contagens : [];
        const newGovItens = (val.governancaItens && typeof val.governancaItens === 'object' && !Array.isArray(val.governancaItens)) ? val.governancaItens : {};
        const newGovDados = (val.governanca && typeof val.governanca === 'object' && !Array.isArray(val.governanca)) ? val.governanca : {};
        const newGovRec = Array.isArray(val.governancaRecebidos) ? val.governancaRecebidos : [];

        const changed = JSON.stringify(newMonths) !== JSON.stringify(MONTHS)
                     || JSON.stringify(newData)   !== JSON.stringify(DATA)
                     || JSON.stringify(newInv)    !== JSON.stringify(INVENTARIO)
                     || JSON.stringify(newLix)    !== JSON.stringify(LIXEIRA)
                     || JSON.stringify(newContItens)  !== JSON.stringify(CONTAGEM_ITENS)
                     || JSON.stringify(newContagens)  !== JSON.stringify(CONTAGENS)
                     || JSON.stringify(newGovItens)   !== JSON.stringify(GOV_ITENS)
                     || JSON.stringify(newGovDados)   !== JSON.stringify(GOV_DADOS)
                     || JSON.stringify(newGovRec)     !== JSON.stringify(GOV_RECEBIDOS);
        INVENTARIO = newInv;
        CONTAGEM_ITENS = newContItens;
        CONTAGENS = newContagens;
        GOV_ITENS = newGovItens;
        GOV_DADOS = newGovDados;
        GOV_RECEBIDOS = newGovRec;
        const lixPurged = newLix.length !== (Array.isArray(val.lixeira) ? val.lixeira : []).length;
        LIXEIRA = newLix;
        LOG = Array.isArray(val.log) ? val.log : [];

        MONTHS = newMonths;
        DATA   = newData;
        if (ensureIds()) scheduleSave();
        const createdMonth = ensureCurrentMonth();

        if (firstLoad && MONTHS.length) {
          const cur = currentMonthName();
          const idx = MONTHS.indexOf(cur);
          activeMonth = idx >= 0 ? idx : MONTHS.length - 1;
          firstLoad = false;
        }
        if (createdMonth) { activeMonth = MONTHS.indexOf(currentMonthName()); pushToFirebase(); }

        if (changed || createdMonth) buildUI();
        computeKPIs();
        // snapshot local de segurança (última versão carregada por unidade)
        if (MONTHS.length && DATA.length) {
          try { localStorage.setItem('mtnc_bkp_' + currentHotel, JSON.stringify({ ts: Date.now(), months: MONTHS, data: DATA, inventario: INVENTARIO })); } catch (e) {}
        }
        if (lixPurged) saveLixeira();
        if (MONTHS.length) updateFooter(activeMonth);
        setSyncStatus('ok', '● Online · ' + new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}));
        document.getElementById('loading-bar').classList.add('hidden');
        updateServSelect();
      });
    })
    .catch(err => {
      setSyncStatus('error', 'Erro de conexão');
      console.error(err);
    });
}

function pushToFirebase() {
  if (!db) return;
  if (!MONTHS.length || !DATA.length) {
    console.warn('[push] BLOQUEADO: MONTHS ou DATA vazios — recusando sobrescrever Firebase');
    setSyncStatus('error', 'Save bloqueado (vazio)');
    return;
  }
  clearTimeout(saveDebounce);
  setSyncStatus('syncing', 'Salvando…');
  db.ref(hotelPath()).update({
    months: MONTHS,
    data:   DATA,
  }).then(() => {
    setSyncStatus('ok', '● Salvo · ' + new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}));
    const sp = document.getElementById('sp');
    sp.classList.add('show');
    setTimeout(() => sp.classList.remove('show'), 2800);
  }).catch(e => {
    setSyncStatus('error', 'Erro ao salvar');
    console.error(e);
  });
}

function scheduleSave() {
  clearTimeout(saveDebounce);
  setSyncStatus('syncing', 'Aguardando…');
  saveDebounce = setTimeout(pushToFirebase, 1500);
}

// ─── ID / SYNC ────────────────────────────────────────────────────────────────
function genId() { return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function ensureIds() {
  let changed = false;
  DATA.forEach(m => m.forEach(r => { if (!r.id) { r.id = genId(); changed = true; } }));
  return changed;
}

function isConc(r) { return (r.stat||'').toUpperCase().includes('CONC'); }

function syncToSiblings(id, mi, gi, changes) {
  if (!id) return [];
  const affected = new Set();
  for (let m = 0; m < DATA.length; m++) {
    if (!DATA[m]) continue;
    for (let i = 0; i < DATA[m].length; i++) {
      if (m === mi && i === gi) continue;
      const other = DATA[m][i];
      if (other.id === id && !isConc(other)) {
        Object.assign(other, changes);
        affected.add(m);
      }
    }
  }
  return [...affected];
}

function updateField(mi, gi, field, value) {
  DATA[mi][gi][field] = value;
  const months = syncToSiblings(DATA[mi][gi].id, mi, gi, { [field]: value });
  months.forEach(m => renderBothTables(m));
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function prioClass(v) { return v === 'ALTA' ? 'p-alta' : v === 'MEDIA' ? 'p-media' : 'p-baixa'; }
function prioLabel(v) { return v === 'ALTA' ? '● ALTA' : v === 'MEDIA' ? '● MÉDIA' : '● BAIXA'; }
function fmtDT(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function metaRightCell(r) {
  const td = document.createElement('td');
  td.className = 'meta-cell';
  const line = (cls, label, val) => `<div class="mr-line ${cls}"><span class="mr-lbl">${label}</span><span class="mr-val">${val}</span></div>`;
  const lines = [];
  if (r.confMant && !isConc(r)) lines.push('<div class="mr-line mr-conf"><span class="mr-lbl">✓ Manutentor concluiu</span><span class="mr-val">conferir</span></div>');
  if (r.ts) lines.push(line('', '🕐 Adicionado', fmtDT(r.ts)));
  if (isConc(r) && r.tsFim) lines.push(line('mr-ok', '✓ Concluído', fmtDT(r.tsFim)));
  lines.push(line('', '🔎 Identificado', esc(r.ident) || '—'));
  lines.push(line('', '👤 Responsável', esc(r.func) || '—'));
  if (r.foto && /^https:\/\//.test(r.foto)) lines.push(`<a href="${esc(r.foto)}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><img class="card-foto" src="${esc(r.foto)}" alt="foto"></a>`);
  td.innerHTML = lines.join('');
  return td;
}
function stClass(v)   { const u = (v||'').toUpperCase(); return u.includes('CONC') ? 'st-c' : u.includes('DENT') ? 'st-i' : u.includes('AND') ? 'st-a' : 'st-d'; }
function stLabel(v)   { const u = (v||'').toUpperCase(); return u.includes('CONC') ? '✓ Concluído' : u.includes('DENT') ? '⚑ Identificado' : u.includes('AND') ? '⟳ Andamento' : v||'—'; }
function svClass(v) {
  const u = (v||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const m = {REVIS:'REVISAO',OLEO:'OLEO',PNEU:'PNEUS',FREIO:'FREIOS',SUSPEN:'SUSPENSAO',ALINH:'ALINHAMENTO',FUNIL:'FUNILARIA',BATERIA:'BATERIA',MECAN:'MECANICA',LAVAG:'LAVAGEM',ABASTE:'ABASTECIMENTO',LICENC:'LICENCIAMENTO',SEGURO:'SEGURO',MULTA:'MULTAS',REPAROS:'REPAROS',LIMPEZA:'LIMPEZA',AR:'AR',LAMPADA:'LAMPADA',TV:'TV',PINTURA:'PINTURA',INSTALACAO:'INSTALACAO',VIDROS:'VIDROS',OBRA:'OBRA',ELETRICA:'ELETRICA',REFRIGER:'REFRIGERECAO',CHUVEIRO:'CHUVEIRO',REFORMA:'REFORMA',MANUT:'MANUTENCAO',TELEFONE:'TELEFONE',JARDIM:'JARDIM'};
  const k = Object.keys(m).find(k => u.includes(k));
  return k ? `sv-${m[k]}` : 'sv-default';
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function isOverdue(r) {
  if (isConc(r)) return false;
  const d = pd(r.fim);
  if (!d) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return d < today;
}
function rowClass(r) {
  const done = (r.stat||'').toUpperCase().includes('CONC');
  let cls = r.pendente ? 'pendente-row ' : '';
  if (done) cls += 'done-row ';
  if (isOverdue(r)) cls += 'atrasado-row ';
  if (isViagemRow(r) && !(r.kmFim === 0 || r.kmFim)) cls += 'viagem-aberta ';
  if (r.prio === 'ALTA' && !done) cls += 'alta-row';
  else if (r.prio === 'MEDIA' && !done) cls += 'media-row';
  return cls.trim();
}
function toISO(s) {
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const p = s.split('/');
  if (p.length === 3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
  return '';
}
function fmtBR(s) {
  if (!s) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
}
function prioPriority(r) {
  const s = (r.stat || '').toUpperCase();
  const p = r.prio === 'ALTA' ? 0 : r.prio === 'MEDIA' ? 1 : 2;
  let g;
  if (s.includes('CONC')) g = 2;        // concluídos por último
  else if (s.includes('ANDAM')) g = 0;  // em andamento no topo
  else g = 1;                           // identificado / pendente
  return g * 10 + p;                    // dentro do grupo: prioridade crescente
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────
function computeKPIs() {
  let tot = 0, c = 0, a = 0, id = 0, plan = 0, pend = 0, od = 0;
  const m = DATA[activeMonth] || [];
  m.forEach(r => {
    if (r.pendente) { pend++; return; }
    tot++;
    const u = (r.stat||'').toUpperCase();
    if (u.includes('CONC')) c++;
    else if (u.includes('AND')) a++;
    else if (u.includes('DENT')) id++;
    if (r.tipo === 'PLANEJADO') plan++;
    if (isOverdue(r)) od++;
  });
  document.getElementById('kt').textContent = tot;
  document.getElementById('kc').textContent = c;
  document.getElementById('kc-p').textContent = tot ? Math.round(c / tot * 100) + '% do mês' : '';
  document.getElementById('ka').textContent = a;
  document.getElementById('ki').textContent = id;
  document.getElementById('kp').textContent = plan;
  const koEl = document.getElementById('ko');
  if (koEl) koEl.textContent = od;
  const kpLbl = document.getElementById('kp-lbl');
  if (kpLbl) kpLbl.textContent = hotelLabels().plan;
  const badge = document.getElementById('hdr-badge');
  if (badge) {
    const mName = MONTHS[activeMonth] || '—';
    badge.textContent = `${mName} · ${tot} registros` + (pend ? ` · ${pend} pendente${pend > 1 ? 's' : ''}` : '');
    badge.style.color = pend ? '#f5a623' : '';
  }
  updatePendentesCount();
  renderDashboard();
}

// ─── ÁREA ADMINISTRATIVA (visão do grupo) ───────────────────────────────────────
let adminData = {}, adminMonths = [];
function openAdminPin() {
  document.getElementById('admin-pin-inp').value = '';
  document.getElementById('admin-pin-err').textContent = '';
  document.getElementById('ov-admin-pin').classList.add('show');
  setTimeout(() => document.getElementById('admin-pin-inp').focus(), 120);
}
function closeAdminPin() { document.getElementById('ov-admin-pin').classList.remove('show'); }

async function enterAdminArea() {
  const inp = document.getElementById('admin-pin-inp');
  const err = document.getElementById('admin-pin-err');
  const senha = inp.value.trim();
  if (!senha) return;
  try {
    ensureApp();
    if (authReady) await authReady;
    if (!(await checkMaster(senha))) { err.textContent = 'Senha master incorreta.'; inp.value = ''; inp.focus(); return; }
  } catch (e) { console.error(e); err.textContent = 'Erro ao validar. Tente novamente.'; return; }
  sessionStorage.setItem('mtnc_master', '1');
  closeAdminPin();
  // esconde login e seleção de unidade para a Área Admin não ficar atrás deles
  hideLogin();
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('admin-screen').classList.add('show');
  await loadAdminData();
  buildAdminMonths();
  renderAdmin();
}
function closeAdminArea() { document.getElementById('admin-screen').classList.remove('show'); showLogin(); }

// ─── PERFIS DE ACESSO (só Área Administrativa) ──────────────────────────────────
let PERFIS = {};
async function openPerfis() {
  ensureApp(); if (authReady) await authReady;
  try { PERFIS = (await db.ref('config/perfis').once('value')).val() || {}; }
  catch (e) { console.error(e); PERFIS = {}; }
  renderPerfisList();
  document.getElementById('ov-perfis').classList.add('show');
}
function closePerfis() { document.getElementById('ov-perfis').classList.remove('show'); }
function renderPerfisList() {
  const ids = Object.keys(PERFIS);
  const rows = ids.length ? ids.map(id => {
    const p = PERFIS[id] || {};
    const un = (p.unidades || []).map(k => { const h = HOTELS.find(x => x.key === k); return h ? h.name : k; }).join(', ') || 'nenhuma';
    return `<div class="perfil-row">
      <div style="flex:1;min-width:0"><div class="perfil-nome">${esc(p.nome || '(sem nome)')}${p.ativo === false ? ' <span class="perfil-off">inativo</span>' : ''}${p.trocarSenha ? ' <span class="perfil-prov">senha provisória</span>' : ''}</div><div class="perfil-un">${esc(un)}</div></div>
      <div class="perfil-acts">
        <button class="btn btn-ghost btn-xs" onclick="togglePerfilAtivo('${id}')">${p.ativo === false ? 'Ativar' : 'Desativar'}</button>
        <button class="btn btn-ghost btn-xs" onclick="openPerfilEditor('${id}')">Editar</button>
        <button class="btn btn-ghost btn-xs" onclick="deletePerfil('${id}')">Excluir</button>
      </div></div>`;
  }).join('') : '<p class="modview-note">Nenhum perfil criado ainda.</p>';
  document.getElementById('perfis-body').innerHTML = `
    <h3>👥 Perfis de acesso</h3>
    <p class="modview-note">Cada perfil tem um usuário e senha e vê só as unidades e módulos liberados. Na tela de login, a pessoa clica em "Entrar com usuário e senha". A diretoria (senha master) continua vendo tudo.</p>
    <div style="margin:14px 0"><button class="btn btn-gold btn-xs" onclick="openPerfilEditor('')">➕ Novo perfil</button></div>
    <div class="perfil-list">${rows}</div>`;
}
let perfilEdit = null;
function openPerfilEditor(id) {
  const p = id ? (PERFIS[id] || {}) : { nome: '', unidades: [], modulos: {}, ativo: true };
  perfilEdit = {
    id: id || ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)),
    novo: !id,
    nome: p.nome || '',
    codigoNovo: '',
    unidades: [...(p.unidades || [])],
    modulos: JSON.parse(JSON.stringify(p.modulos || {})),
    ativo: p.ativo !== false,
  };
  renderPerfilEditor();
}
function perfilCaptura() {
  if (!perfilEdit) return;
  const n = document.getElementById('perfil-nome'); if (n) perfilEdit.nome = n.value;
  const c = document.getElementById('perfil-codigo'); if (c) perfilEdit.codigoNovo = c.value;
}
function renderPerfilEditor() {
  const st = perfilEdit;
  const uchecks = HOTELS.map(h => `<label class="perfil-uchk"><input type="checkbox" ${st.unidades.includes(h.key) ? 'checked' : ''} onchange="perfilToggleUnidade('${h.key}',this.checked)"> ${h.icon} ${esc(h.name)}</label>`).join('');
  const modBlocks = st.unidades.map(key => {
    const h = HOTELS.find(x => x.key === key);
    const mods = modulosDaUnidade(key);
    const sel = st.modulos[key] || [];
    const checks = mods.map(m => `<label class="perfil-mchk"><input type="checkbox" ${sel.includes(m.k) ? 'checked' : ''} onchange="perfilToggleMod('${key}','${m.k}',this.checked)"> ${m.lbl}</label>`).join('');
    return `<div class="perfil-modblock"><div class="perfil-modblock-h"><b>${esc(h ? h.name : key)}</b><button class="btn btn-ghost btn-xs" onclick="perfilAplicarTodas('${key}')" title="Copiar estes módulos para as outras unidades">⇊ aplicar a todas</button></div><div class="perfil-mchks">${checks}</div></div>`;
  }).join('');
  document.getElementById('perfis-body').innerHTML = `
    <h3>${st.novo ? 'Novo perfil' : 'Editar perfil'}</h3>
    <div class="mrow"><label>Nome de usuário (login)</label><input class="minput" id="perfil-nome" value="${esc(st.nome)}" placeholder="Ex: Robson"></div>
    <div class="mrow"><label>Senha ${st.novo ? '' : '(em branco = manter a atual)'}</label><input class="minput" id="perfil-codigo" type="text" value="${esc(st.codigoNovo)}" placeholder="${st.novo ? 'defina uma senha' : '••••••'}" autocomplete="off"></div>
    <div class="perfil-sec">Unidades que este perfil acessa</div>
    <div class="perfil-uchks">${uchecks}</div>
    ${st.unidades.length ? `<div class="perfil-sec">Módulos liberados por unidade <span class="perfil-hint">(marcado = pode ver/mexer)</span></div>${modBlocks}` : '<p class="modview-note">Selecione ao menos uma unidade para escolher os módulos.</p>'}
    <div class="mactions" style="margin-top:16px">
      <button class="btn btn-ghost btn-xs" onclick="renderPerfisList()">← Voltar</button>
      <button class="btn btn-gold btn-xs" onclick="salvarPerfil()">💾 Salvar perfil</button>
    </div>`;
}
function perfilToggleUnidade(key, on) {
  perfilCaptura();
  const st = perfilEdit;
  if (on) { if (!st.unidades.includes(key)) st.unidades.push(key); if (!st.modulos[key]) st.modulos[key] = modulosDaUnidade(key).map(m => m.k); }
  else { st.unidades = st.unidades.filter(k => k !== key); delete st.modulos[key]; }
  renderPerfilEditor();
}
function perfilToggleMod(key, mod, on) {
  const st = perfilEdit;
  if (!st.modulos[key]) st.modulos[key] = [];
  if (on) { if (!st.modulos[key].includes(mod)) st.modulos[key].push(mod); }
  else st.modulos[key] = st.modulos[key].filter(m => m !== mod);
}
function perfilAplicarTodas(fromKey) {
  perfilCaptura();
  const st = perfilEdit;
  const src = st.modulos[fromKey] || [];
  st.unidades.forEach(k => { if (k === fromKey) return; const avail = modulosDaUnidade(k).map(m => m.k); st.modulos[k] = src.filter(m => avail.includes(m)); });
  renderPerfilEditor();
}
async function salvarPerfil() {
  perfilCaptura();
  const st = perfilEdit;
  const nome = (st.nome || '').trim();
  if (!nome) { alert('Informe o nome de usuário.'); return; }
  const dup = Object.keys(PERFIS).some(pid => pid !== st.id && ((PERFIS[pid].nome || '').trim().toLowerCase() === nome.toLowerCase()));
  if (dup) { alert('Já existe um perfil com esse nome de usuário. Escolha outro.'); return; }
  if (!st.unidades.length) { alert('Selecione ao menos uma unidade.'); return; }
  const existing = PERFIS[st.id];
  let codigoHash = existing ? existing.codigo : null;
  const codVal = (st.codigoNovo || '').trim();
  if (codVal) { if (codVal.length < 4) { alert('O código deve ter ao menos 4 caracteres.'); return; } codigoHash = await sha256(codVal); }
  if (!codigoHash) { alert('Defina um código de acesso para o perfil.'); return; }
  const rec = { nome, codigo: codigoHash, unidades: st.unidades.slice(), modulos: {}, ativo: st.ativo !== false, criadoEm: existing ? (existing.criadoEm || Date.now()) : Date.now() };
  // Senha definida/redefinida agora = provisória: o funcionário troca no 1o acesso.
  rec.trocarSenha = codVal ? true : (existing ? existing.trocarSenha === true : true);
  st.unidades.forEach(k => { rec.modulos[k] = (st.modulos[k] || []).slice(); });
  try {
    await db.ref('config/perfis/' + st.id).set(rec);
    PERFIS[st.id] = rec;
    logAction('Salvou perfil de acesso', nome);
    renderPerfisList();
  } catch (e) { console.error(e); alert('Não foi possível salvar o perfil.'); }
}
async function togglePerfilAtivo(id) {
  const p = PERFIS[id]; if (!p) return;
  const novo = p.ativo === false;
  try { await db.ref('config/perfis/' + id + '/ativo').set(novo); p.ativo = novo; renderPerfisList(); }
  catch (e) { console.error(e); alert('Não foi possível alterar.'); }
}
async function deletePerfil(id) {
  const p = PERFIS[id];
  if (!confirm('Excluir o perfil "' + (p ? p.nome : '') + '"? A pessoa perde o acesso por esse código.')) return;
  try { await db.ref('config/perfis/' + id).remove(); delete PERFIS[id]; logAction('Excluiu perfil de acesso', p ? p.nome : id); renderPerfisList(); }
  catch (e) { console.error(e); alert('Não foi possível excluir.'); }
}

// ─── SENHAS (gestão só na Área Administrativa) ──────────────────────────────────
function openAdminPins() {
  const box = document.getElementById('adminpins-list');
  box.innerHTML = HOTELS.map(h =>
    `<div class="lix-item"><div style="flex:1"><div class="lix-item-t">${h.icon} ${esc(h.name)}</div><div class="lix-item-d">Definir novo código de acesso</div></div><div class="lix-acts"><input class="minput" id="apin-${h.key}" type="text" inputmode="text" placeholder="novo código" style="width:130px;margin:0"><button class="btn btn-gold btn-xs" onclick="setUnitPin('${h.key}')">Salvar</button></div></div>`
  ).join('');
  ['am-cur', 'am-new', 'am-conf'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('adminpins-msg').textContent = '';
  document.getElementById('ov-admin-pins').classList.add('show');
}
function closeAdminPins() { document.getElementById('ov-admin-pins').classList.remove('show'); }
function apinMsg(t, ok) { const m = document.getElementById('adminpins-msg'); m.textContent = t; m.style.color = ok ? 'var(--ok2)' : 'var(--red2)'; }
async function setUnitPin(key) {
  const inp = document.getElementById('apin-' + key);
  const v = (inp.value || '').trim();
  if (v.length < 4) { apinMsg('O código deve ter ao menos 4 caracteres.', false); return; }
  try {
    ensureApp(); if (authReady) await authReady;
    await db.ref('config/hotelPins/' + key).set(await sha256(v));
    inp.value = '';
    apinMsg('Código atualizado com sucesso.', true);
  } catch (e) { console.error(e); apinMsg('Erro ao salvar. Tente novamente.', false); }
}
async function setMasterPin() {
  const cur = document.getElementById('am-cur').value.trim();
  const np  = document.getElementById('am-new').value.trim();
  const nc  = document.getElementById('am-conf').value.trim();
  try {
    ensureApp(); if (authReady) await authReady;
    const ms = await db.ref('config/masterPin').once('value');
    if (ms.val() && (await sha256(cur)) !== ms.val()) { apinMsg('Senha master atual incorreta.', false); return; }
    if (np.length < 4) { apinMsg('A nova senha master deve ter ao menos 4 caracteres.', false); return; }
    if (np !== nc) { apinMsg('As senhas não conferem.', false); return; }
    await db.ref('config/masterPin').set(await sha256(np));
    ['am-cur', 'am-new', 'am-conf'].forEach(id => document.getElementById(id).value = '');
    apinMsg('Senha master atualizada com sucesso.', true);
  } catch (e) { console.error(e); apinMsg('Erro ao salvar. Tente novamente.', false); }
}

async function loadAdminData() {
  document.getElementById('admin-body').innerHTML = '<div style="padding:70px;text-align:center;color:var(--muted)">Carregando dados do grupo…</div>';
  const results = await Promise.all(HOTELS.map(h => db.ref(h.path).once('value').then(s => s.val() || {}).catch(() => ({}))));
  adminData = {};
  HOTELS.forEach((h, i) => { adminData[h.key] = results[i]; });
}

function admMonthVal(name) { const p = (name || '').split(' '); return (parseInt(p[1]) || 0) * 12 + MONTHS_PT.indexOf(p[0]); }
function buildAdminMonths() {
  const set = new Set();
  Object.values(adminData).forEach(v => (Array.isArray(v.months) ? v.months : []).forEach(m => set.add(m)));
  adminMonths = [...set].sort((a, b) => admMonthVal(a) - admMonthVal(b));
  const sel = document.getElementById('admin-month');
  sel.innerHTML = adminMonths.map(m => `<option value="${m}">${m}</option>`).join('');
  const cur = currentMonthName();
  sel.value = adminMonths.includes(cur) ? cur : (adminMonths[adminMonths.length - 1] || '');
}

function renderAdmin() {
  const body = document.getElementById('admin-body');
  const monthName = document.getElementById('admin-month').value;
  if (!monthName) { body.innerHTML = '<div style="padding:70px;text-align:center;color:var(--muted)">Nenhum mês com dados.</div>'; return; }
  const per = HOTELS.map(h => {
    const v = adminData[h.key] || {};
    const months = Array.isArray(v.months) ? v.months : [];
    const idx = months.indexOf(monthName);
    const recs = (idx >= 0 && Array.isArray(v.data) && Array.isArray(v.data[idx])) ? v.data[idx] : [];
    const conf = recs.filter(r => !r.pendente);
    const pend = recs.filter(r => r.pendente).length;
    const stc = k => conf.filter(r => (r.stat || '').toUpperCase().includes(k)).length;
    const over = conf.filter(r => isOverdue(r)).length;
    let fuel = 0, litros = 0, km = 0;
    if (h.frota) conf.forEach(r => { fuel += parseFloat(r.abValor) || 0; litros += parseFloat(r.abLitros) || 0; if (r.tipo === 'EMERGENCIAL') { const k = kmRodado(r); if (k !== '') km += k; } });
    const tp = { plan: { t: 0, c: 0 }, emrg: { t: 0, c: 0 }, asg: { t: 0, c: 0 } };
    conf.forEach(r => {
      const kk = r.tipo === 'PLANEJADO' ? 'plan' : r.tipo === 'EMERGENCIAL' ? 'emrg' : r.tipo === 'ASG' ? 'asg' : null;
      if (kk) { tp[kk].t++; if ((r.stat || '').toUpperCase().includes('CONC')) tp[kk].c++; }
    });
    return { h, total: conf.length, conc: stc('CONC'), and: stc('AND'), ident: stc('DENT'), over, pend, fuel, litros, km, tp };
  });
  const g = per.reduce((a, p) => ({ total: a.total + p.total, conc: a.conc + p.conc, and: a.and + p.and, ident: a.ident + p.ident, over: a.over + p.over, pend: a.pend + p.pend, fuel: a.fuel + p.fuel, litros: a.litros + p.litros, km: a.km + p.km }), { total: 0, conc: 0, and: 0, ident: 0, over: 0, pend: 0, fuel: 0, litros: 0, km: 0 });
  const gtp = per.reduce((a, p) => ({
    plan: { t: a.plan.t + p.tp.plan.t, c: a.plan.c + p.tp.plan.c },
    emrg: { t: a.emrg.t + p.tp.emrg.t, c: a.emrg.c + p.tp.emrg.c },
    asg:  { t: a.asg.t + p.tp.asg.t,   c: a.asg.c + p.tp.asg.c },
  }), { plan: { t: 0, c: 0 }, emrg: { t: 0, c: 0 }, asg: { t: 0, c: 0 } });
  const gp = g.total ? Math.round(g.conc / g.total * 100) : 0;
  const pctOf = o => o.t ? Math.round(o.c / o.t * 100) : 0;

  const kpis = `
    <div class="kpi tot" onclick="openAdminKpi('tot')" style="cursor:pointer"><div class="kpi-lbl">Total do Grupo</div><div class="kpi-val">${g.total}</div><div class="kpi-sub">${gp}% concluído</div></div>
    <div class="kpi plan" onclick="openAdminKpi('plan')" style="cursor:pointer"><div class="kpi-lbl">📋 Planejados</div><div class="kpi-val">${gtp.plan.t}</div><div class="kpi-sub">${gtp.plan.c} concluídos · ${pctOf(gtp.plan)}%</div></div>
    <div class="kpi" onclick="openAdminKpi('emrg')" style="cursor:pointer"><div class="kpi-lbl">⚡ Emergenciais</div><div class="kpi-val" style="color:var(--orange2)">${gtp.emrg.t}</div><div class="kpi-sub">${gtp.emrg.c} concluídos · ${pctOf(gtp.emrg)}%</div></div>
    <div class="kpi ok" onclick="openAdminKpi('asg')" style="cursor:pointer"><div class="kpi-lbl">🧹 ASG</div><div class="kpi-val">${gtp.asg.t}</div><div class="kpi-sub">${gtp.asg.c} concluídos · ${pctOf(gtp.asg)}%</div></div>
    <div class="kpi info" onclick="openAdminKpi('and')" style="cursor:pointer"><div class="kpi-lbl">Em Andamento</div><div class="kpi-val">${g.and}</div><div class="kpi-sub">em execução</div></div>
    <div class="kpi over" onclick="openAdminKpi('over')" style="cursor:pointer"><div class="kpi-lbl">Atrasados</div><div class="kpi-val">${g.over}</div><div class="kpi-sub">prazo vencido</div></div>
    <div class="kpi" onclick="openAdminKpi('pend')" style="cursor:pointer"><div class="kpi-lbl">Pendentes</div><div class="kpi-val" style="color:#f5a623">${g.pend}</div><div class="kpi-sub">recebidos</div></div>
    <div class="kpi"><div class="kpi-lbl">Combustível (Frota)</div><div class="kpi-val" style="font-size:21px;color:var(--ok2)">${fmtBRL(g.fuel)}</div><div class="kpi-sub">${g.km.toLocaleString('pt-BR')} km</div></div>`;

  const units = per.map(p => {
    const pct = p.total ? Math.round(p.conc / p.total * 100) : 0;
    return `<div class="admin-unit" onclick="adminEnterUnit('${p.h.key}')">
      <div class="admin-unit-hd"><span class="admin-unit-ic">${p.h.icon}</span>${p.h.name}</div>
      <div class="admin-unit-big">${p.total}<span class="admin-unit-big-lbl">serviços no mês</span></div>
      <div class="dbar" style="margin-top:11px"><div class="dbar-fill" style="width:${pct}%"></div></div>
      <div class="admin-unit-row"><span style="color:var(--ok2)">✓ ${p.conc} (${pct}%)</span><span style="color:var(--info2)">⟳ ${p.and}</span><span style="color:var(--warn2)">⚑ ${p.ident}</span></div>
      <div class="admin-unit-row"><span style="color:var(--red2)">⚠ ${p.over} atrasados</span><span style="color:#f5a623">📥 ${p.pend} pendentes</span></div>
      ${p.h.frota ? `<div class="admin-unit-row"><span style="color:var(--ok2)">⛽ ${fmtBRL(p.fuel)}</span><span style="color:var(--gold2)">🛣 ${p.km.toLocaleString('pt-BR')} km</span></div>` : ''}
    </div>`;
  }).join('');

  const cmp = [...per].sort((a, b) => {
    const pa = a.total ? a.conc / a.total : 0, pb = b.total ? b.conc / b.total : 0; return pb - pa;
  }).map(p => {
    const pct = p.total ? Math.round(p.conc / p.total * 100) : 0;
    return `<div class="cmp-row"><span class="cmp-name">${p.h.name}</span><div class="cmp-bar"><div class="cmp-fill" style="width:${pct}%"></div></div><span class="cmp-val">${pct}%</span></div>`;
  }).join('');

  const carrosD = adminData['carros'] || {};
  const frotaAlertas = computeAlertas(Array.isArray(carrosD.regras) ? carrosD.regras : [], Array.isArray(carrosD.data) ? carrosD.data : []);
  const alertHtml = frotaAlertas.length
    ? frotaAlertas.map(a => `<div class="alert-card ${a.status === 'vencido' ? 'alert-venc' : 'alert-perto'}"><div class="alert-hd"><span class="alert-veic">🚗 ${a.r.veiculo}</span><span class="alert-badge">${a.status === 'vencido' ? 'VENCIDO' : 'A VENCER'}</span></div><div class="alert-serv">${a.r.serv}</div><div class="alert-msg">${a.msg}</div></div>`).join('')
    : '<div class="modview-note">Nenhuma manutenção a vencer na frota.</div>';

  body.innerHTML = `
    <div class="admin-sec-title">Resumo do Grupo · ${monthName}</div>
    <div class="admin-kpis">${kpis}</div>
    <div class="admin-sec-title">Por unidade (clique para entrar)</div>
    <div class="admin-units">${units}</div>
    <div class="admin-sec-title">🔧 Manutenção da frota (Carros)</div>
    <div class="admin-units">${alertHtml}</div>
    <div class="admin-sec-title">Comparativo · % concluído por unidade</div>
    <div class="admin-compare">${cmp}</div>`;
}
function adminEnterUnit(key) { closeAndamento(); closeAdminArea(); pickHotel(key); }

function openAdminKpi(kind) {
  const monthName = document.getElementById('admin-month').value;
  const items = [];
  HOTELS.forEach(h => {
    const v = adminData[h.key] || {};
    const months = Array.isArray(v.months) ? v.months : [];
    const idx = months.indexOf(monthName);
    const recs = (idx >= 0 && Array.isArray(v.data) && Array.isArray(v.data[idx])) ? v.data[idx] : [];
    recs.forEach(r => {
      const pend = !!r.pendente;
      const has = k => (r.stat || '').toUpperCase().includes(k);
      let ok = false;
      if (kind === 'tot') ok = !pend;
      else if (kind === 'conc') ok = !pend && has('CONC');
      else if (kind === 'plan') ok = !pend && r.tipo === 'PLANEJADO';
      else if (kind === 'emrg') ok = !pend && r.tipo === 'EMERGENCIAL';
      else if (kind === 'asg') ok = !pend && r.tipo === 'ASG';
      else if (kind === 'and') ok = !pend && has('AND');
      else if (kind === 'over') ok = !pend && isOverdue(r);
      else if (kind === 'pend') ok = pend;
      if (ok) items.push({ h, r });
    });
  });
  const titles = { tot: 'Todos os serviços', conc: 'Concluídos', plan: 'Planejados', emrg: 'Emergenciais', asg: 'Serviços ASG', and: 'Em andamento', over: 'Atrasados', pend: 'Pendentes (recebidos)' };
  document.getElementById('and-title').textContent = `${titles[kind] || 'Serviços'} · Grupo (${items.length})`;
  const grid = document.getElementById('and-grid');
  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:44px">Nenhum serviço neste filtro.</div>`;
  } else {
    grid.innerHTML = items.map(({ h, r }) => {
      const isFrota = !!h.frota;
      const ti = r.tipo === 'PLANEJADO' ? { cls: 'and-plan', lbl: isFrota ? 'Serviço' : 'Planejado' }
               : r.tipo === 'EMERGENCIAL' ? { cls: 'and-emrg', lbl: isFrota ? 'Viagem' : 'Emergencial' }
               : { cls: 'and-asg', lbl: 'ASG' };
      const dt = r.ini || r.dtid;
      return `<div class="and-card ${ti.cls}" onclick="adminEnterUnit('${h.key}')">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><span class="and-tag">${ti.lbl}</span><span style="font-size:10px;color:var(--gold2);font-weight:700;white-space:nowrap">${h.name}</span></div>
        <div class="and-area">${r.area || '—'}</div>
        <div class="and-serv"><span class="sv ${svClass(r.serv)}">${r.serv || '—'}</span></div>
        ${r.desc ? `<div class="and-desc">${r.desc}</div>` : ''}
        <div class="and-meta">${r.func ? '👤 ' + r.func : ''}${dt ? (r.func ? '<br>' : '') + '📅 ' + fmtBR(toISO(dt)) : ''}</div>
      </div>`;
    }).join('');
  }
  document.getElementById('ov-andamento').classList.add('show');
}

// ─── RELATÓRIOS (impressão formatada) ───────────────────────────────────────────
function printReport(title, html) {
  const el = document.getElementById('report-print');
  if (!el) return;
  const now = new Date();
  el.innerHTML = `<div class="rep-doc-head"><div class="rep-doc-h1">${hotelInfo().name}</div><div class="rep-doc-h2">${title} · ${MONTHS[activeMonth] || ''}</div><div class="rep-doc-h3">Grupo Meridiana · Búzios/RJ · Emitido em ${now.toLocaleDateString('pt-BR')}</div></div>${html}`;
  const t = document.title;
  document.title = `${title} · ${MONTHS[activeMonth] || ''} · ${hotelInfo().name}`;
  document.body.classList.add('report-mode');
  setTimeout(() => { window.print(); document.body.classList.remove('report-mode'); document.title = t; }, 150);
}

function relCombustivel() {
  const m = (DATA[activeMonth] || []).filter(r => !r.pendente);
  const agg = {};
  m.forEach(r => {
    const v = r.area || '—';
    const lit = parseFloat(r.abLitros) || 0, val = parseFloat(r.abValor) || 0;
    const isVg = r.tipo === 'EMERGENCIAL';
    if (!lit && !val && !isVg) return;
    if (!agg[v]) agg[v] = { trips: 0, litros: 0, valor: 0, km: 0 };
    if (isVg) { agg[v].trips++; const k = kmRodado(r); if (k !== '') agg[v].km += k; }
    agg[v].litros += lit; agg[v].valor += val;
  });
  const keys = Object.keys(agg).sort();
  const tt = { trips: 0, litros: 0, valor: 0, km: 0 };
  const body = keys.map(v => {
    const a = agg[v]; tt.trips += a.trips; tt.litros += a.litros; tt.valor += a.valor; tt.km += a.km;
    return `<tr><td>${v}</td><td>${a.trips}</td><td>${a.km.toLocaleString('pt-BR')}</td><td>${a.litros.toLocaleString('pt-BR')}</td><td>${fmtBRL(a.valor)}</td></tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:#888">Nenhuma viagem no mês.</td></tr>`;
  const html = `<table class="rep-doc-table"><thead><tr><th>Veículo</th><th>Viagens</th><th>KM rodado</th><th>Litros</th><th>Valor</th></tr></thead><tbody>${body}<tr class="rep-doc-total"><td>TOTAL</td><td>${tt.trips}</td><td>${tt.km.toLocaleString('pt-BR')}</td><td>${tt.litros.toLocaleString('pt-BR')}</td><td>${fmtBRL(tt.valor)}</td></tr></tbody></table>`;
  printReport('Combustível por veículo', html);
}

function relFuncionario() {
  const isFrota = !!hotelInfo().frota;
  const m = (DATA[activeMonth] || []).filter(r => !r.pendente);
  const agg = {};
  m.forEach(r => {
    const f = (r.func || '').trim().toUpperCase() || '(SEM RESPONSÁVEL)';
    if (!agg[f]) agg[f] = { total: 0, conc: 0 };
    agg[f].total++;
    if ((r.stat || '').toUpperCase().includes('CONC')) agg[f].conc++;
  });
  const keys = Object.keys(agg).sort((a, b) => agg[b].total - agg[a].total);
  const body = keys.map(f => `<tr><td>${f}</td><td>${agg[f].total}</td><td>${agg[f].conc}</td></tr>`).join('')
    || `<tr><td colspan="3" style="text-align:center;color:#888">Nenhum serviço no mês.</td></tr>`;
  const html = `<table class="rep-doc-table"><thead><tr><th>${isFrota ? 'Motorista' : 'Funcionário'}</th><th>Serviços</th><th>Concluídos</th></tr></thead><tbody>${body}</tbody></table>`;
  printReport(isFrota ? 'Por motorista' : 'Por funcionário', html);
}

// ─── REGRAS / ALERTAS DE MANUTENÇÃO (Carros) ────────────────────────────────────
function currentOdometer(veiculo, dataArr) {
  let mx = 0;
  (dataArr || DATA).forEach(mm => (Array.isArray(mm) ? mm : []).forEach(r => {
    if (r.tipo === 'EMERGENCIAL' && r.area === veiculo) {
      const a = parseFloat(r.kmFim), b = parseFloat(r.kmIni);
      if (isFinite(a) && a > mx) mx = a;
      if (isFinite(b) && b > mx) mx = b;
    }
  }));
  return mx;
}
function computeAlertas(regras, dataArr) {
  regras = regras || REGRAS;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const out = [];
  regras.forEach(r => {
    const odom = currentOdometer(r.veiculo, dataArr);
    let vencido = false, perto = false; const msgs = [];
    if (r.km && r.baseKm !== '' && r.baseKm != null) {
      const nextKm = Number(r.baseKm) + Number(r.km);
      const falta = nextKm - odom;
      if (falta <= 0) { vencido = true; msgs.push(`passou ${(-falta).toLocaleString('pt-BR')} km`); }
      else if (falta <= 500) { perto = true; msgs.push(`faltam ${falta.toLocaleString('pt-BR')} km`); }
    }
    if (r.meses && r.baseData) {
      const d = new Date(toISO(r.baseData) + 'T00:00:00'); d.setMonth(d.getMonth() + Number(r.meses));
      const dd = Math.round((d - today) / 86400000);
      if (dd < 0) { vencido = true; msgs.push(`prazo passou há ${-dd} dia(s)`); }
      else if (dd <= 15) { perto = true; msgs.push(`prazo em ${dd} dia(s)`); }
    }
    if (r.vence) {
      const d = new Date(toISO(r.vence) + 'T00:00:00');
      const dd = Math.round((d - today) / 86400000);
      if (dd < 0) { vencido = true; msgs.push(`vencido há ${-dd} dia(s)`); }
      else if (dd <= 15) { perto = true; msgs.push(`vence em ${dd} dia(s)`); }
    }
    if (vencido || perto) out.push({ r, status: vencido ? 'vencido' : 'perto', msg: msgs.join(' · ') });
  });
  out.sort((a, b) => (a.status === 'vencido' ? 0 : 1) - (b.status === 'vencido' ? 0 : 1));
  return out;
}
function saveRegras() { if (!db) return; db.ref(`${hotelPath()}/regras`).set(REGRAS.length ? REGRAS : null); }

let regEditId = null;
function openRegras() {
  const sel = document.getElementById('reg-veiculo');
  sel.innerHTML = [...VEICULOS, ...GERADORES].map(v => `<option value="${v}">${v}</option>`).join('');
  const it = document.getElementById('reg-item');
  it.innerHTML = SERVICOS.map(s => `<option value="${s}">${s}</option>`).join('');
  regEditId = null;
  resetRegForm();
  renderRegras();
  document.getElementById('ov-regras').classList.add('show');
}
function resetRegForm() {
  ['reg-km', 'reg-meses', 'reg-basekm', 'reg-basedata', 'reg-vence'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  const b = document.getElementById('reg-add-btn'); if (b) b.textContent = '＋ Adicionar regra';
  regEditId = null;
}
function editRegra(id) {
  const r = REGRAS.find(x => x.id === id); if (!r) return;
  regEditId = id;
  document.getElementById('reg-veiculo').value = r.veiculo;
  const it = document.getElementById('reg-item');
  if ([...it.options].some(o => o.value === r.serv)) it.value = r.serv;
  document.getElementById('reg-km').value = r.km || '';
  document.getElementById('reg-meses').value = r.meses || '';
  document.getElementById('reg-basekm').value = (r.baseKm !== '' && r.baseKm != null) ? r.baseKm : '';
  document.getElementById('reg-basedata').value = r.baseData ? toISO(r.baseData) : '';
  document.getElementById('reg-vence').value = r.vence ? toISO(r.vence) : '';
  const b = document.getElementById('reg-add-btn'); if (b) b.textContent = '💾 Salvar alterações';
}
function closeRegras() { document.getElementById('ov-regras').classList.remove('show'); }
function renderRegras() {
  const v = document.getElementById('reg-veiculo').value;
  const el = document.getElementById('reg-list');
  if (!el) return;
  const rules = REGRAS.filter(r => r.veiculo === v);
  if (!rules.length) { el.innerHTML = '<div class="modview-note">Nenhuma regra cadastrada para este veículo.</div>'; return; }
  el.innerHTML = rules.map(r => {
    const bits = [];
    const parts = [];
    if (r.km) parts.push(`${Number(r.km).toLocaleString('pt-BR')} km`);
    if (r.meses) parts.push(`${r.meses} meses`);
    if (parts.length) {
      let t = `A cada ${parts.join(' ou ')}`;
      if (r.baseData) t += ' · última: ' + fmtBR(toISO(r.baseData));
      if (r.baseKm !== '' && r.baseKm != null) t += ' / ' + Number(r.baseKm).toLocaleString('pt-BR') + ' km';
      bits.push(t);
    }
    if (r.vence) bits.push(`Vence em <b>${fmtBR(toISO(r.vence))}</b>`);
    const info = bits.length ? bits.join(' · ') : '—';
    return `<div class="reg-item"><div style="flex:1"><div class="reg-item-t">${r.serv}</div><div class="reg-item-d">${info}</div></div><div class="reg-item-actions"><button class="reg-edit" onclick="editRegra('${r.id}')">✏ Editar</button><button class="reg-renew" onclick="renovarRegra('${r.id}')">✓ Renovar</button><button class="btn-cad-del" onclick="removeRegra('${r.id}')">✕</button></div></div>`;
  }).join('');
}
function submitRegra() {
  const v = document.getElementById('reg-veiculo').value;
  const serv = document.getElementById('reg-item').value;
  if (!v || !serv) { alert('Selecione o veículo e o serviço.'); return; }
  const data = {
    veiculo: v, serv,
    km: document.getElementById('reg-km').value,
    meses: document.getElementById('reg-meses').value,
    baseKm: document.getElementById('reg-basekm').value,
    baseData: document.getElementById('reg-basedata').value,
    vence: document.getElementById('reg-vence').value
  };
  if (!data.km && !data.meses && !data.vence) { alert('Informe pelo menos um: intervalo de km, meses ou data de vencimento.'); return; }
  if (regEditId) { const r = REGRAS.find(x => x.id === regEditId); if (r) Object.assign(r, data); }
  else { REGRAS.push(Object.assign({ id: genId() }, data)); }
  saveRegras();
  renderRegras();
  computeKPIs();
  resetRegForm();
}
function removeRegra(id) { REGRAS = REGRAS.filter(r => r.id !== id); saveRegras(); renderRegras(); computeKPIs(); }
function renovarRegra(id) {
  const r = REGRAS.find(x => x.id === id); if (!r) return;
  if (r.km || r.meses) {
    r.baseData = new Date().toISOString().split('T')[0];
    r.baseKm = String(currentOdometer(r.veiculo));
  }
  if (r.vence) { const d = new Date(toISO(r.vence) + 'T00:00:00'); d.setFullYear(d.getFullYear() + 1); r.vence = d.toISOString().split('T')[0]; }
  saveRegras(); renderRegras(); computeKPIs();
}

function openAlertas() {
  const list = computeAlertas();
  const grid = document.getElementById('alert-list');
  document.getElementById('alert-title').textContent = `🔧 Manutenções a vencer (${list.length})`;
  if (!list.length) {
    grid.innerHTML = '<div class="modview-note" style="padding:24px;text-align:center">Nenhuma manutenção a vencer. Tudo em dia! ✓</div>';
  } else {
    grid.innerHTML = list.map(a => `<div class="alert-card ${a.status === 'vencido' ? 'alert-venc' : 'alert-perto'}">
      <div class="alert-hd"><span class="alert-veic">🚗 ${a.r.veiculo}</span><span class="alert-badge">${a.status === 'vencido' ? 'VENCIDO' : 'A VENCER'}</span></div>
      <div class="alert-serv">${a.r.serv}</div>
      <div class="alert-msg">${a.msg}</div>
      <button class="reg-renew" style="margin-top:10px" onclick="renovarRegra('${a.r.id}');openAlertas()">✓ Renovar (feito hoje)</button>
    </div>`).join('');
  }
  document.getElementById('ov-alertas').classList.add('show');
}
function closeAlertas() { document.getElementById('ov-alertas').classList.remove('show'); }

// ─── CADASTROS (central de listas) ──────────────────────────────────────────────
let cadKey = null;
function saveList(node, arr, base) {
  if (!db) return;
  const custom = arr.filter(v => !base.includes(v));
  db.ref(`${hotelPath()}/${node}`).set(custom.length ? custom : null);
}
function cadGet() {
  switch (cadKey) {
    case 'servicos':  return { list: SERVICOS,  base: baseServicos(),   title: hotelInfo().frota ? 'Serviços (Automotor)' : 'Serviços' };
    case 'asg':       return { list: ASGSERV,   base: ASG_SERVICOS,     title: 'Serviços ASG' };
    case 'veiculos':  return { list: VEICULOS,  base: CARROS_VEICULOS,  title: 'Veículos' };
    case 'geradores': return { list: GERADORES, base: CARROS_GERADORES, title: 'Geradores' };
    case 'destinos':  return { list: DESTINOS,  base: VIAGEM_DESTINOS,  title: 'Destinos (Viagem)' };
    default: return null;
  }
}
function setCadList(arr) {
  switch (cadKey) {
    case 'servicos':  SERVICOS = arr; break;
    case 'asg':       ASGSERV = arr; break;
    case 'veiculos':  VEICULOS = arr; break;
    case 'geradores': GERADORES = arr; break;
    case 'destinos':  DESTINOS = arr; break;
  }
}
function persistCad() {
  switch (cadKey) {
    case 'servicos':  saveCustomServicos(); updateServSelect(); break;
    case 'asg':       saveList('asgServicos', ASGSERV, ASG_SERVICOS); break;
    case 'veiculos':  saveList('veiculos', VEICULOS, CARROS_VEICULOS); break;
    case 'geradores': saveList('geradores', GERADORES, CARROS_GERADORES); break;
    case 'destinos':  saveList('destinos', DESTINOS, VIAGEM_DESTINOS); break;
  }
}
function openCad(key) {
  cadKey = key;
  const g = cadGet(); if (!g) return;
  document.getElementById('cad-title').textContent = `⚙ ${g.title}`;
  document.getElementById('cad-new').value = '';
  renderCadList();
  document.getElementById('ov-cad').classList.add('show');
}
function closeCad() { document.getElementById('ov-cad').classList.remove('show'); }
function renderCadList() {
  const g = cadGet(); if (!g) return;
  document.getElementById('cad-list').innerHTML = g.list.map(s => {
    const isBase = g.base.includes(s);
    return `<div class="serv-item"><span class="sv ${svClass(s)}">${s}</span>${isBase ? '' : `<button class="serv-del" onclick="removeCad('${s.replace(/'/g, "\\'")}')">✕</button>`}</div>`;
  }).join('');
}
function addCad() {
  const inp = document.getElementById('cad-new');
  const val = inp.value.trim().toUpperCase().normalize('NFC');
  const g = cadGet();
  if (!g || !val) { inp.value = ''; return; }
  if (!g.list.includes(val)) { g.list.push(val); persistCad(); }
  inp.value = ''; inp.focus();
  renderCadList();
}
function removeCad(name) {
  const g = cadGet(); if (!g) return;
  if (g.base.includes(name)) return;
  setCadList(g.list.filter(s => s !== name));
  persistCad();
  renderCadList();
}

function openAndamento() { openKpi('and'); }
function openKpi(kind) {
  const isFrotaK = !!hotelInfo().frota;
  const st = (r, k) => (r.stat || '').toUpperCase().includes(k);
  const preds = {
    tot:   { f: () => true,                 t: 'Todos os serviços do mês', ic: '📋' },
    conc:  { f: r => st(r, 'CONC'),         t: 'Serviços concluídos',      ic: '✓' },
    and:   { f: r => st(r, 'AND'),          t: 'Serviços em andamento',    ic: '⟳' },
    ident: { f: r => st(r, 'DENT'),         t: 'Serviços identificados',   ic: '⚑' },
    plan:  { f: r => r.tipo === 'PLANEJADO', t: isFrotaK ? 'Serviços' : 'Serviços planejados', ic: '📋' },
    over:  { f: r => isOverdue(r),          t: 'Serviços atrasados',       ic: '⚠' },
    aberta:{ f: r => r.tipo === 'EMERGENCIAL' && !(r.kmFim === 0 || r.kmFim), t: 'Viagens em aberto (sem KM final)', ic: '🚗' },
  };
  const p = preds[kind] || preds.tot;
  const grid = document.getElementById('and-grid');
  const rows = [];
  (DATA[activeMonth] || []).forEach((r, gi) => { if (!r.pendente && p.f(r)) rows.push({ r, gi }); });
  document.getElementById('and-title').textContent = `${p.ic} ${p.t} (${rows.length})`;
  if (!rows.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:44px">Nenhum serviço neste filtro.</div>`;
  } else {
    const isFrota = !!hotelInfo().frota;
    const tipoInfo = t => t === 'PLANEJADO' ? { cls: 'and-plan', lbl: isFrota ? 'Serviço' : 'Planejado' }
                        : t === 'EMERGENCIAL' ? { cls: 'and-emrg', lbl: isFrota ? 'Viagem' : 'Emergencial' }
                        : { cls: 'and-asg', lbl: 'ASG' };
    grid.innerHTML = rows.map(({ r, gi }) => {
      const ti = tipoInfo(r.tipo);
      const dt = r.ini || r.dtid;
      return `<div class="and-card ${ti.cls}" onclick="editFromAndamento(${activeMonth},${gi})">
        <div class="and-tag">${ti.lbl}</div>
        <div class="and-area">${r.area || '—'}</div>
        <div class="and-serv"><span class="sv ${svClass(r.serv)}">${r.serv || '—'}</span></div>
        ${r.desc ? `<div class="and-desc">${r.desc}</div>` : ''}
        <div class="and-meta">${r.func ? '👤 ' + r.func : ''}${dt ? (r.func ? '<br>' : '') + '📅 ' + fmtBR(toISO(dt)) : ''}</div>
      </div>`;
    }).join('');
  }
  document.getElementById('ov-andamento').classList.add('show');
}
function closeAndamento() { document.getElementById('ov-andamento').classList.remove('show'); }
function editFromAndamento(mi, gi) { closeAndamento(); openEditRecord(mi, gi); }

function openViagensAbertas() {
  const grid = document.getElementById('and-grid');
  const items = [];
  DATA.forEach((mm, mi) => (Array.isArray(mm) ? mm : []).forEach((r, gi) => {
    if (r.tipo === 'EMERGENCIAL' && !(r.kmFim === 0 || r.kmFim)) items.push({ mi, gi, r });
  }));
  document.getElementById('and-title').textContent = `🚗 Viagens em aberto (${items.length})`;
  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:44px">Nenhuma viagem em aberto.</div>`;
  } else {
    grid.innerHTML = items.map(({ mi, gi, r }) => {
      const dt = r.ini || r.dtid;
      return `<div class="and-card and-emrg" onclick="editFromAndamento(${mi},${gi})">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><span class="and-tag">Viagem${r.num ? ' ' + pad3(r.num) : ''}</span><span style="font-size:10px;color:var(--gold2);font-weight:700;white-space:nowrap">${MONTHS[mi] || ''}</span></div>
        <div class="and-area">${r.area || '—'}</div>
        <div class="and-serv"><span class="sv ${svClass(r.serv)}">${r.serv || '—'}</span></div>
        <div class="and-meta">${r.func ? '👤 ' + r.func : 'sem motorista'}${r.kmIni ? ' · KM ini ' + r.kmIni : ''}${dt ? '<br>📅 ' + fmtBR(toISO(dt)) : ''}</div>
        ${r.codigo ? `<div style="margin-top:7px;font-size:12px;color:var(--gold2);font-weight:700;letter-spacing:1px">🔑 Código ${esc(r.codigo)}</div>` : ''}
      </div>`;
    }).join('');
  }
  document.getElementById('ov-andamento').classList.add('show');
}
function delFromEdit() {
  if (!editTarget) return;
  const { mi, gi } = editTarget;
  document.getElementById('ov').classList.remove('show');
  editTarget = null; modalTarget = null;
  confirmDeleteRow(mi, gi);
}

function renderDashboard() {
  const el = document.getElementById('dash-body');
  if (!el) return;
  const all = DATA[activeMonth] || [];
  const m = all.filter(r => !r.pendente);
  const pend = all.filter(r => r.pendente).length;
  const isFrota = !!hotelInfo().frota;
  const stc = (arr, key) => arr.filter(r => (r.stat||'').toUpperCase().includes(key)).length;
  const modCard = (icon, name, arr) => {
    const tot = arr.length, conc = stc(arr, 'CONC'), and = stc(arr, 'AND'), idt = tot - conc - and;
    const pct = tot ? Math.round(conc / tot * 100) : 0;
    return `<div class="dcard"><div class="dcard-hd"><span class="dcard-ic">${icon}</span>${name}</div>
      <div class="dcard-big">${tot}</div>
      <div class="dbar"><div class="dbar-fill" style="width:${pct}%"></div></div>
      <div class="dcard-sub">${conc} concluídos (${pct}%) · ${and} andamento · ${idt} identificados</div></div>`;
  };
  let cards = '';
  if (isFrota) {
    cards += modCard('🔧', 'Serviços', m.filter(r => r.tipo === 'PLANEJADO'));
    cards += modCard('🚗', 'Viagem', m.filter(r => r.tipo === 'EMERGENCIAL'));
  } else {
    cards += modCard('📋', 'Planejados', m.filter(r => r.tipo === 'PLANEJADO'));
    cards += modCard('⚡', 'Emergencial', m.filter(r => r.tipo === 'EMERGENCIAL'));
    cards += modCard('🧹', 'ASG', m.filter(r => r.tipo === 'ASG'));
  }
  const tot = m.length, conc = stc(m, 'CONC'), and = stc(m, 'AND'), idt = tot - conc - and;
  const pc = tot ? (conc / tot * 100) : 0, pa = tot ? (and / tot * 100) : 0;
  cards += `<div class="dcard"><div class="dcard-hd">Status do mês</div>
    <div class="donut" style="background:conic-gradient(var(--ok2) 0 ${pc}%,var(--info2) ${pc}% ${pc + pa}%,var(--warn2) ${pc + pa}% 100%)"><div class="donut-hole">${Math.round(pc)}%</div></div>
    <div class="dlegend"><span><i style="background:var(--ok2)"></i>Concluídos ${conc}</span><span><i style="background:var(--info2)"></i>Andamento ${and}</span><span><i style="background:var(--warn2)"></i>Identificados ${idt}</span></div></div>`;
  const pendTotal = DATA.reduce((s, mm) => s + (Array.isArray(mm) ? mm.filter(r => r.pendente).length : 0), 0);
  cards += `<div class="dcard dcard-click" onclick="openPendentesPanel()"><div class="dcard-hd">📥 Recebidos</div><div class="dcard-big" style="color:#f5a623">${pendTotal}</div><div class="dcard-sub">aguardando confirmação · clique para ver</div></div>`;
  if (isFrota) {
    const abertas = DATA.reduce((s, mm) => s + (Array.isArray(mm) ? mm.filter(r => r.tipo === 'EMERGENCIAL' && !(r.kmFim === 0 || r.kmFim)).length : 0), 0);
    cards += `<div class="dcard dcard-click" onclick="openViagensAbertas()"><div class="dcard-hd">🚗 Viagens em aberto</div><div class="dcard-big" style="color:var(--info2)">${abertas}</div><div class="dcard-sub">sem KM final (todos os meses) · clique para ver</div></div>`;
    const alertas = computeAlertas();
    const av = alertas.filter(a => a.status === 'vencido').length;
    cards += `<div class="dcard dcard-click" onclick="openAlertas()"><div class="dcard-hd">🔧 Manutenções a vencer</div><div class="dcard-big" style="color:${av ? 'var(--red2)' : (alertas.length ? '#f5a623' : 'var(--ok2)')}">${alertas.length}</div><div class="dcard-sub">${av ? av + ' vencida(s) · ' : ''}clique para ver</div></div>`;
  }
  if (isFrota) {
    let tv = 0, tl = 0, tk = 0;
    const fuel = {}, perVeic = {};
    m.forEach(r => {
      const val = parseFloat(r.abValor) || 0, lit = parseFloat(r.abLitros) || 0;
      if (val || lit) {
        const a = r.area || '—';
        if (!fuel[a]) fuel[a] = { valor: 0, litros: 0 };
        fuel[a].valor += val; fuel[a].litros += lit;
        tv += val; tl += lit;
      }
    });
    m.filter(r => r.tipo === 'EMERGENCIAL').forEach(r => {
      const k = kmRodado(r); if (k !== '') tk += k;
      const v = r.area || '—';
      if (!perVeic[v]) perVeic[v] = { km: 0, trips: 0 };
      perVeic[v].trips++;
      if (k !== '') perVeic[v].km += k;
    });
    const fkeys = Object.keys(fuel).sort((a, b) => fuel[b].valor - fuel[a].valor);
    const flist = fkeys.length
      ? fkeys.map(a => `<div class="veic-row"><span class="veic-name">🚗 ${a}<span class="veic-sub">${fuel[a].litros ? fuel[a].litros.toLocaleString('pt-BR') + ' litros' : ''}</span></span><span class="veic-km" style="color:var(--ok2);font-size:15px">${fmtBRL(fuel[a].valor)}</span></div>`).join('')
      : '<div class="dcard-sub" style="margin-top:8px">Nenhum abastecimento lançado neste mês.</div>';
    cards += `<div class="dcard dcard-wide"><div class="dcard-hd">⛽ Combustível</div><div class="dcard-big" style="color:var(--ok2)">${fmtBRL(tv)}</div><div class="dcard-sub">${tl.toLocaleString('pt-BR')} litros no mês</div><div class="veic-list" style="margin-top:12px">${flist}</div></div>`;
    const veics = Object.keys(perVeic).sort((a, b) => perVeic[b].km - perVeic[a].km);
    if (veics.length) {
      const list = veics.map(v => `<div class="veic-row"><span class="veic-name">🚗 ${v}<span class="veic-sub">${perVeic[v].trips} viagem${perVeic[v].trips > 1 ? 's' : ''}</span></span><span class="veic-km">${perVeic[v].km.toLocaleString('pt-BR')} km</span></div>`).join('');
      cards += `<div class="dcard dcard-wide"><div class="dcard-hd">🚗 KM por veículo</div><div class="veic-list">${list}</div></div>`;
    }
  }
  const vd = document.getElementById('view-dash');
  if (vd) vd.style.setProperty('--dash-wm', `url('logos/${currentHotel}.png')`);
  el.innerHTML = cards;
}

// ─── BUILD UI ─────────────────────────────────────────────────────────────────
function validModule(k) {
  // Perfil ativo: só os módulos liberados; se pedir outro, cai no primeiro liberado.
  const lib = modulosLiberados(currentHotel);
  if (lib) return lib.includes(k) ? k : (lib[0] || 'dash');
  // Sem perfil (master): regras por capacidade da unidade.
  if (k === 'asg' && hotelInfo().frota) return 'dash';
  if (k === 'gest' && hotelInfo().frota) return 'dash';
  if (k === 'cont' && !hotelInfo().contagem) return 'dash';
  if (k === 'gov' && !hotelInfo().governanca) return 'dash';
  if (k === 'inv' && !hotelInfo().inventario) return 'dash';
  return k;
}

// Lista de módulos que uma unidade tem (usado no menu e na tela de perfis)
function modulosDaUnidade(key) {
  const h = HOTELS.find(x => x.key === key) || {};
  const mods = [{ k: 'dash', lbl: 'Dashboard' }];
  if (h.frota) mods.push({ k: 'plan', lbl: 'Serviços' }, { k: 'emrg', lbl: 'Viagem' });
  else {
    mods.push({ k: 'plan', lbl: 'Planejados' }, { k: 'emrg', lbl: 'Emergencial' }, { k: 'asg', lbl: 'ASG' });
    if (h.contagem) mods.push({ k: 'cont', lbl: 'Contagem' });
    if (h.governanca) mods.push({ k: 'gov', lbl: 'Governança' });
    mods.push({ k: 'gest', lbl: 'Gestão' });
  }
  if (h.inventario) mods.push({ k: 'inv', lbl: 'Inventário' });
  mods.push({ k: 'rel', lbl: 'Relatórios' }, { k: 'cad', lbl: 'Cadastros' }, { k: 'param', lbl: 'Parâmetros' });
  return mods;
}
// Módulos liberados para o perfil ativo na unidade atual (null = sem restrição)
function modulosLiberados(key) {
  if (!activeProfile) return null;
  const arr = (activeProfile.modulos && activeProfile.modulos[key]) || [];
  return Array.isArray(arr) ? arr : [];
}
function buildModuleMenu() {
  let mods = modulosDaUnidade(currentHotel);
  const lib = modulosLiberados(currentHotel);
  if (lib) {
    mods = mods.filter(m => lib.includes(m.k));
    if (!mods.length) mods = modulosDaUnidade(currentHotel).slice(0, 1); // pelo menos o Dashboard
  }
  const el = document.getElementById('mod-menu');
  if (el) el.innerHTML = mods.map(m => `<button class="modtab${m.k === activeModule ? ' active' : ''}" data-mod="${m.k}" onclick="setModule('${m.k}')">${m.lbl}</button>`).join('');
}

function setModule(key) {
  activeModule = validModule(key);
  document.body.dataset.mod = activeModule;
  document.querySelectorAll('#mod-menu .modtab').forEach(b => b.classList.toggle('active', b.dataset.mod === activeModule));
}

function buildViews() {
  const isFrota = !!hotelInfo().frota;
  const rel = document.getElementById('rel-inner');
  const L = hotelLabels();
  if (rel) rel.innerHTML = `
    <h2 class="modview-title">Relatórios</h2>
    <div class="rep-bars">
      <button class="rep-bar" onclick="openPdf()"><div class="rep-bar-t">Relatório de Serviços · Todos</div><div class="rep-bar-d">Todos os serviços do mês. Abre a tela de filtros.</div></button>
      <button class="rep-bar" onclick="openPdf('PLANEJADO')"><div class="rep-bar-t">${isFrota ? 'Serviços' : 'Serviços Planejados'}</div><div class="rep-bar-d">Só ${isFrota ? 'os serviços de manutenção' : 'os serviços planejados'} do mês.</div></button>
      <button class="rep-bar" onclick="openPdf('EMERGENCIAL')"><div class="rep-bar-t">${isFrota ? 'Viagem' : 'Emergenciais'}</div><div class="rep-bar-d">Só ${isFrota ? 'as viagens' : 'os serviços emergenciais'} do mês.</div></button>
      ${isFrota ? '' : `<button class="rep-bar" onclick="openPdf('ASG')"><div class="rep-bar-t">Serviços ASG</div><div class="rep-bar-d">Só os serviços ASG do mês.</div></button>`}
      ${isFrota ? `<button class="rep-bar" onclick="relCombustivel()"><div class="rep-bar-t">Combustível por veículo</div><div class="rep-bar-d">Litros, valor e KM rodado de cada veículo no mês.</div></button>` : ''}
      <button class="rep-bar" onclick="relFuncionario()"><div class="rep-bar-t">${isFrota ? 'Por motorista' : 'Por funcionário'}</div><div class="rep-bar-d">Total de serviços e concluídos por pessoa.</div></button>
      <button class="rep-bar rep-bar-alt" onclick="exportCSV()"><div class="rep-bar-t">Exportar CSV</div><div class="rep-bar-d">Planilha do mês para Excel.</div></button>
    </div>`;
  const cad = document.getElementById('cad-inner');
  if (cad) {
    const cats = isFrota
      ? [{ k: 'servicos', l: 'Serviços (Automotor)' }, { k: 'veiculos', l: 'Veículos' }, { k: 'geradores', l: 'Geradores' }, { k: 'destinos', l: 'Destinos (Viagem)' }]
      : [{ k: 'servicos', l: 'Serviços' }, { k: 'asg', l: 'Serviços ASG' }];
    cad.innerHTML = `
      <h2 class="modview-title">Cadastros</h2>
      <p class="modview-note">Gerencie as listas usadas nos serviços desta unidade. Os itens padrão não podem ser removidos.</p>
      <div class="rep-bars">
        ${cats.map(c => `<button class="rep-bar" onclick="openCad('${c.k}')"><div class="rep-bar-t">${c.l}</div><div class="rep-bar-d">Adicionar ou remover itens.</div></button>`).join('')}
      </div>`;
  }
  const par = document.getElementById('param-inner');
  if (par) par.innerHTML = `
    <h2 class="modview-title">Parâmetros</h2>
    <div class="modview-actions">
      ${isFrota ? `<button class="btn btn-ghost" onclick="openRegras()">🔧 Regras de manutenção</button>` : ''}
      ${hotelInfo().inventario ? `<button class="btn btn-ghost" onclick="openInvAdd()">📦 Adicionar item de inventário</button>` : ''}
      <button class="btn btn-ghost" onclick="downloadBackup()">💾 Baixar backup (JSON)</button>
      <button class="btn btn-ghost" onclick="openLixeira()">🗑 Lixeira</button>
      <button class="btn btn-ghost" onclick="openHistorico()">📋 Histórico</button>
      <button class="btn btn-ghost" onclick="saveAll()">💾 Salvar agora</button>
      <button class="btn btn-ghost" onclick="lockApp()">🔒 Bloquear acesso</button>
    </div>
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--gold2);margin:20px 0 10px;letter-spacing:.5px">Meses</h3>
    <div class="cad-months">${MONTHS.length ? MONTHS.map((m, i) => `<div class="cad-month-row"><span>${m} · ${(DATA[i] || []).filter(r => !r.pendente).length} registros</span><button class="btn-cad-del" onclick="askDelMonth(event,${i})">✕ Excluir</button></div>`).join('') : '<div class="modview-note">Nenhum mês criado.</div>'}</div>`;
  if (hotelInfo().inventario) renderInventario();
  const gest = document.getElementById('gest-inner');
  if (gest && !isFrota) {
    gest.innerHTML = `
      <h2 class="modview-title">Gestão · Links Públicos</h2>
      <p class="modview-note">Compartilhe estes links (ou o QR Code) com as equipes. Tudo que for enviado aparece em <b>Recebidos</b> para a supervisão aceitar e classificar.</p>
      <div class="rep-bars" style="margin-top:16px">
        <button class="rep-bar" onclick="openLinkPublico('GERAL')"><div class="rep-bar-t">🔗 Link geral · Setores</div><div class="rep-bar-d">Para Recepção e demais setores. Quem envia escolhe o setor e descreve o problema; a supervisão classifica (Planejado, Emergencial ou ASG) ao aceitar.</div></button>
        <button class="rep-bar" onclick="openLinkPublico('PLANEJADO')"><div class="rep-bar-t">🔗 ${L.plan}</div><div class="rep-bar-d">Link direto para lançar serviços planejados.</div></button>
        <button class="rep-bar" onclick="openLinkPublico()"><div class="rep-bar-t">🔗 ${L.emrg}</div><div class="rep-bar-d">Link direto para lançar serviços emergenciais.</div></button>
        <button class="rep-bar" onclick="openLinkPublico('ASG')"><div class="rep-bar-t">🔗 Serviços ASG</div><div class="rep-bar-d">Link direto para lançar serviços ASG.</div></button>
        ${hotelInfo().contagem ? `<button class="rep-bar" onclick="openLinkContagem()"><div class="rep-bar-t">📋 Contagens</div><div class="rep-bar-d">Link para a equipe fazer a contagem de itens. Quem abre escolhe o setor e envia. O resultado aparece no módulo Contagem.</div></button>` : ''}
        ${hotelInfo().governanca ? `<button class="rep-bar" onclick="openLinkGov('contagem')"><div class="rep-bar-t">🧺 Governança · Contagem (mensal)</div><div class="rep-bar-d">Link para a equipe contar o enxoval por bloco e quarto. Cai nos Recebidos da Governança.</div></button>
        <button class="rep-bar" onclick="openLinkGov('inventario')"><div class="rep-bar-t">🧺 Governança · Inventário (semestral)</div><div class="rep-bar-d">Link do inventário completo (quartos, rouparia e danificados).</div></button>` : ''}
      </div>`;
  }
  if (hotelInfo().contagem) renderContagemView();
  if (hotelInfo().governanca) renderGovernanca();
}

// ─── INVENTÁRIO (somente Maria Maria) ───────────────────────────────────────────
function invLow(it) {
  const m = parseFloat(it.min), q = parseFloat(it.qtd);
  return isFinite(m) && isFinite(q) && q < m;
}
function saveInventario() {
  if (!db) return;
  db.ref(`${hotelPath()}/inventario`).set(INVENTARIO.length ? INVENTARIO : null);
}
let invQuery = '';
function invSearch(v) { invQuery = v; renderInventario(); }
function invCardHTML(it) {
  const lo = invLow(it);
  const tags = [];
  if (it.categoria) tags.push(`<span class="inv-cat">${esc(it.categoria)}</span>`);
  if (it.min !== '' && it.min != null) tags.push(`<span class="inv-min">mínimo ${esc(it.min)}</span>`);
  if (lo) tags.push(`<span class="inv-low-tag">⚠ repor</span>`);
  return `<div class="inv-card${lo ? ' inv-low' : ''}">
    <div class="inv-card-main inv-clickable" onclick="openInvTransfer('${it.id}')" title="Clique para registrar transferência para outra unidade">
      <div class="inv-card-name">${esc(it.nome) || '—'}</div>
      ${tags.length ? `<div class="inv-card-tags">${tags.join('')}</div>` : ''}
      ${it.obs ? `<div class="inv-card-obs">${esc(it.obs)}</div>` : ''}
    </div>
    <div class="inv-qty">
      <button class="inv-step" onclick="invStep('${it.id}',-1)" title="Diminuir">−</button>
      <input class="inv-qty-inp" type="number" inputmode="numeric" value="${(it.qtd === 0 || it.qtd) ? it.qtd : 0}" onchange="invSetQty('${it.id}',this.value)">
      <button class="inv-step" onclick="invStep('${it.id}',1)" title="Aumentar">＋</button>
      <button class="inv-del" onclick="removeInvItem('${it.id}')" title="Remover item">✕</button>
    </div>
  </div>`;
}
function invTransfCardHTML(it) {
  return `<div class="inv-card inv-transf">
    <div class="inv-card-main">
      <div class="inv-card-name">${esc(it.nome) || '—'}</div>
      <div class="inv-card-tags"><span class="inv-transf-tag">↗ ${esc(it.transfDest) || '—'}</span>${it.transfData ? `<span class="inv-min">${fmtBR(toISO(it.transfData))}</span>` : ''}<span class="inv-min">qtd ${(it.qtd === 0 || it.qtd) ? esc(it.qtd) : 0}</span></div>
      ${it.obs ? `<div class="inv-card-obs">${esc(it.obs)}</div>` : ''}
    </div>
    <div class="inv-qty">
      <button class="inv-return" onclick="invReturn('${it.id}')" title="Retornar ao estoque">↩ Retornar</button>
      <button class="inv-del" onclick="removeInvItem('${it.id}')" title="Remover item">✕</button>
    </div>
  </div>`;
}
function renderInventario() {
  const el = document.getElementById('inv-inner');
  if (!el) return;
  const q = normStr(invQuery);
  const match = it => !q || normStr([it.nome, it.categoria, it.obs].join(' ')).includes(q);
  const active = INVENTARIO.filter(it => !it.transferido && match(it));
  const transf = INVENTARIO.filter(it => it.transferido && match(it));
  const emEstoque = INVENTARIO.filter(it => !it.transferido).length;
  const lowAll = INVENTARIO.filter(it => !it.transferido && invLow(it)).length;
  const keepFocus = document.activeElement && document.activeElement.id === 'inv-search';

  let html = `<h2 class="modview-title">Inventário</h2>
    <p class="modview-note">Estoque da unidade ${hotelInfo().name}. Cadastre novos itens em Parâmetros › Adicionar item de inventário. Clique em um item para registrar a transferência para outra unidade.</p>
    <div class="inv-toolbar">
      <div class="sw"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search" id="inv-search" placeholder="Buscar item…" value="${(invQuery || '').replace(/"/g, '&quot;')}" oninput="invSearch(this.value)"></div>
      <div class="inv-summary"><span class="inv-total">${emEstoque} em estoque</span>${lowAll ? `<span class="inv-low-badge">⚠ ${lowAll} abaixo do mínimo</span>` : ''}</div>
    </div>`;

  if (!INVENTARIO.length) {
    html += `<div class="modview-note" style="margin-top:18px">Nenhum item cadastrado ainda. Adicione o primeiro em Parâmetros.</div>`;
  } else {
    if (!active.length) {
      html += `<div class="modview-note" style="margin-top:16px">Nenhum item ${q ? 'encontrado na busca' : 'em estoque'}.</div>`;
    } else {
      const groups = {};
      active.forEach(it => { const c = it.categoria || 'Sem categoria'; (groups[c] = groups[c] || []).push(it); });
      Object.keys(groups).sort((a, b) => a.localeCompare(b, 'pt')).forEach(cat => {
        html += `<div class="inv-cat-group"><div class="inv-cat-head">${cat}<span class="inv-cat-count">${groups[cat].length}</span></div><div class="inv-list">`;
        html += groups[cat].map(invCardHTML).join('');
        html += `</div></div>`;
      });
    }
    if (transf.length) {
      html += `<div class="inv-sep">↗ Itens transferidos</div><div class="inv-list">`;
      html += transf.map(invTransfCardHTML).join('');
      html += `</div>`;
    }
  }
  el.innerHTML = html;
  if (keepFocus) { const s = document.getElementById('inv-search'); if (s) { s.focus(); const n = s.value.length; s.setSelectionRange(n, n); } }
}
let invTransfTarget = null;
function openInvTransfer(id) {
  const it = INVENTARIO.find(x => x.id === id);
  if (!it) return;
  invTransfTarget = id;
  document.getElementById('inv-transf-name').textContent = `${it.nome}${(it.qtd === 0 || it.qtd) ? ' · qtd ' + it.qtd : ''}`;
  const sel = document.getElementById('inv-transf-unit');
  sel.innerHTML = HOTELS.filter(h => h.key !== currentHotel).map(h => `<option value="${h.name}">${h.name}</option>`).join('');
  document.getElementById('inv-transf-other').value = '';
  document.getElementById('inv-transf-data').value = new Date().toISOString().split('T')[0];
  document.getElementById('ov-inv-transf').classList.add('show');
}
function closeInvTransfer() { document.getElementById('ov-inv-transf').classList.remove('show'); invTransfTarget = null; }
function submitInvTransfer() {
  const it = INVENTARIO.find(x => x.id === invTransfTarget);
  if (!it) { closeInvTransfer(); return; }
  const other = document.getElementById('inv-transf-other').value.trim();
  const dest = other || document.getElementById('inv-transf-unit').value;
  if (!dest) { alert('Selecione a unidade de destino.'); return; }
  it.transferido = true;
  it.transfDest = dest;
  it.transfData = document.getElementById('inv-transf-data').value || new Date().toISOString().split('T')[0];
  saveInventario();
  renderInventario();
  closeInvTransfer();
}
function invReturn(id) {
  const it = INVENTARIO.find(x => x.id === id);
  if (!it) return;
  delete it.transferido; delete it.transfDest; delete it.transfData;
  saveInventario();
  renderInventario();
}
function invStep(id, delta) {
  const it = INVENTARIO.find(x => x.id === id);
  if (!it) return;
  it.qtd = Math.max(0, (parseFloat(it.qtd) || 0) + delta);
  saveInventario();
  renderInventario();
}
function invSetQty(id, val) {
  const it = INVENTARIO.find(x => x.id === id);
  if (!it) return;
  const n = parseFloat(val);
  it.qtd = isFinite(n) && n >= 0 ? n : 0;
  saveInventario();
  renderInventario();
}
function removeInvItem(id) {
  const it = INVENTARIO.find(x => x.id === id);
  if (!it) return;
  if (!confirm(`Remover "${it.nome}" do inventário?`)) return;
  INVENTARIO = INVENTARIO.filter(x => x.id !== id);
  saveInventario();
  renderInventario();
}
function openInvAdd() {
  ['inv-nome', 'inv-cat', 'inv-obs'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('inv-qtd').value = '0';
  document.getElementById('inv-minimo').value = '';
  document.getElementById('ov-inv').classList.add('show');
  setTimeout(() => document.getElementById('inv-nome').focus(), 60);
}
function closeInvAdd() { document.getElementById('ov-inv').classList.remove('show'); }
function submitInvItem() {
  const nome = document.getElementById('inv-nome').value.trim();
  if (!nome) { alert('Informe o nome do item.'); return; }
  const qtd = parseFloat(document.getElementById('inv-qtd').value);
  const min = document.getElementById('inv-minimo').value.trim();
  INVENTARIO.push({
    id: genId(),
    nome,
    categoria: document.getElementById('inv-cat').value.trim(),
    qtd: isFinite(qtd) && qtd >= 0 ? qtd : 0,
    min: min === '' ? '' : (parseFloat(min) || 0),
    obs: document.getElementById('inv-obs').value.trim()
  });
  saveInventario();
  renderInventario();
  closeInvAdd();
}

function buildUI() {
  const tabsEl   = document.getElementById('tabs');
  const panelsEl = document.getElementById('panels');
  tabsEl.innerHTML = ''; panelsEl.innerHTML = '';
  buildModuleMenu();
  buildViews();
  setModule(validModule(activeModule));
  const ms0 = document.getElementById('month-select');
  if (!MONTHS.length) { document.getElementById('empty-state').style.display = 'flex'; if (ms0) ms0.innerHTML = ''; return; }
  document.getElementById('empty-state').style.display = 'none';
  MONTHS.forEach((month, mi) => {
    tabsEl.appendChild(makeTab(month, mi));
    const p = document.createElement('div');
    p.className = 'panel' + (mi === activeMonth ? ' active' : '');
    p.id = `panel-${mi}`;
    p.innerHTML = buildPanelHTML(mi);
    panelsEl.appendChild(p);
    renderBothTables(mi);
  });
  const ms = document.getElementById('month-select');
  if (ms) {
    const order = MONTHS.map((m, i) => ({ m, i })).sort((a, b) => admMonthVal(b.m) - admMonthVal(a.m));
    ms.innerHTML = order.map(o => `<option value="${o.i}">${o.m}</option>`).join('');
    ms.value = activeMonth;
  }
}

function makeTab(month, mi) {
  const t = document.createElement('div');
  t.className = 'tab' + (mi === activeMonth ? ' active' : '');
  t.id = `tab-${mi}`;
  const pl = (DATA[mi]||[]).filter(r => r.tipo === 'PLANEJADO' && !r.pendente).length;
  const em = (DATA[mi]||[]).filter(r => r.tipo === 'EMERGENCIAL' && !r.pendente).length;
  const asg = (DATA[mi]||[]).filter(r => r.tipo === 'ASG' && !r.pendente).length;
  t.innerHTML = `<div class="tab-inner" onclick="switchTab(${mi})">${month} <span class="tab-cnt" id="tab-cnt-${mi}">${pl}P · ${em}E${asg ? ' · ' + asg + 'A' : ''}</span></div><button class="tab-del" title="Excluir mês" onclick="askDelMonth(event,${mi})">✕</button>`;
  return t;
}

function buildPanelHTML(mi) {
  const servOpts = SERVICOS.map(s => `<option value="${s}">${s}</option>`).join('');
  const asgOpts  = ASGSERV.map(s => `<option value="${s}">${s}</option>`).join('');
  const L = hotelLabels();
  const isFrota = !!hotelInfo().frota;
  const destOpts = DESTINOS.map(s => `<option value="${s}">${s}</option>`).join('');
  const emrgAreaPh = isFrota ? 'Carro…' : 'Área…';
  const emrgFuncPh = isFrota ? 'Motorista…' : 'Funcionário…';
  const emrgServOpts = isFrota ? `<option value="">Todos destinos</option>${destOpts}` : `<option value="">Todos serviços</option>${SERVICOS.map(s => `<option value="${s}">${s}</option>`).join('')}`;
  const asgThead = `<th class="ns" style="width:32px">#</th><th onclick="srt(${mi},'asg','prio',this)">Prioridade <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'asg','area',this)">Área <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'asg','serv',this)">Serviço <span class="sort-ic">⇅</span></th><th>Descrição</th><th onclick="srt(${mi},'asg','stat',this)">Status <span class="sort-ic">⇅</span></th><th>Funcionários</th><th onclick="srt(${mi},'asg','dtid',this)">Data Ident. <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'asg','ini',this)">Data <span class="sort-ic">⇅</span></th><th class="hist-col">Registro</th><th class="ns" style="width:32px"></th>`;
  const emrgThead = isFrota
    ? `<th class="ns" style="width:44px">Nº</th><th onclick="srt(${mi},'emrg','area',this)">Carro <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'emrg','serv',this)">Destino <span class="sort-ic">⇅</span></th><th>Descrição</th><th onclick="srt(${mi},'emrg','stat',this)">Status <span class="sort-ic">⇅</span></th><th>Motorista</th><th onclick="srt(${mi},'emrg','dtid',this)">Data Ident. <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'emrg','ini',this)">Data <span class="sort-ic">⇅</span></th><th>Horário</th><th>KM Ini</th><th>KM Fim</th><th>Rodado</th><th>PAX</th><th>Litros</th><th>Valor</th><th class="hist-col">Registro</th><th class="ns" style="width:32px"></th>`
    : `<th class="ns" style="width:32px">#</th><th onclick="srt(${mi},'emrg','area',this)">Área <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'emrg','serv',this)">Serviço <span class="sort-ic">⇅</span></th><th>Descrição</th><th onclick="srt(${mi},'emrg','stat',this)">Status <span class="sort-ic">⇅</span></th><th>Funcionários</th><th onclick="srt(${mi},'emrg','dtid',this)">Data Ident. <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'emrg','ini',this)">Data <span class="sort-ic">⇅</span></th><th class="hist-col">Registro</th><th class="ns" style="width:32px"></th>`;
  return `<div class="pdf-logo-wrap"><img class="pdf-logo" src="logos/${currentHotel}.png" alt="" onerror="this.closest('.pdf-logo-wrap').remove()"></div><div class="pdf-subheader">Grupo Meridiana · Búzios/RJ</div><div class="pdf-header">${hotelInfo().name}</div><div class="print-cover-divider"></div><div class="print-cover-tag">Relatório de Manutenção · ${MONTHS[mi]} · <span class="print-gen-date"></span></div>
  <div class="sec-box planejado"><div class="sec-hdr"><div class="sec-title"><div class="sec-icon icon-plan">${L.planIcon}</div>${L.plan}<span class="sec-badge sb-plan" id="cnt-plan-${mi}">0</span></div><div class="sec-hdr-r">
    <div class="sw"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search" id="flt-p-${mi}-q" placeholder="Buscar…" oninput="filterSection(${mi},'plan')"></div>
    <input class="flt flt-sm" id="flt-p-${mi}-area" placeholder="Área…" oninput="filterSection(${mi},'plan')">
    <select class="flt" id="flt-p-${mi}-serv" onchange="filterSection(${mi},'plan')"><option value="">Todos serviços</option>${servOpts}</select>
    <input class="flt flt-sm" id="flt-p-${mi}-func" placeholder="Funcionário…" oninput="filterSection(${mi},'plan')">
    <input class="flt flt-date" id="flt-p-${mi}-date" type="date" title="Filtrar por data" onchange="filterSection(${mi},'plan')">
    <select class="flt" id="flt-p-${mi}-stat" onchange="filterSection(${mi},'plan')"><option value="">Todos status</option><option value="CONCLUIDO">✓ Concluído</option><option value="ANDAMENTO">⟳ Andamento</option><option value="IDENT">⚑ Identificado</option></select>
    <button class="btn-clear-flt" onclick="clearFilters(${mi},'plan')" title="Limpar filtros">✕ Limpar</button>
    ${hotelInfo().frota ? `<button class="btn-link-pub" onclick="openLinkPublico('PLANEJADO')" title="Link público de serviços">🔗 Link Público</button>` : ''}
    <button class="btn-add-row" onclick="openModal(${mi},'PLANEJADO')">＋ ${L.planOne}</button>
  </div></div>
  <div class="tbl-wrap"><table><thead><tr><th class="ns" style="width:32px">#</th><th onclick="srt(${mi},'plan','prio',this)">Prioridade <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','area',this)">${isFrota ? 'Automotor' : 'Área'} <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','serv',this)">Serviço <span class="sort-ic">⇅</span></th><th>Descrição</th><th onclick="srt(${mi},'plan','stat',this)">Status <span class="sort-ic">⇅</span></th><th>Funcionários</th><th onclick="srt(${mi},'plan','dtid',this)">Data Ident. <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','ini',this)">Início <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','fim',this)">Prazo/Fim <span class="sort-ic">⇅</span></th><th class="hist-col">Registro</th><th class="ns" style="width:32px"></th></tr></thead><tbody id="tbody-plan-${mi}"></tbody></table></div></div>
  <div class="sec-box emergencial"><div class="sec-hdr"><div class="sec-title"><div class="sec-icon icon-emrg">${L.emrgIcon}</div>${L.emrg}<span class="sec-badge sb-emrg" id="cnt-emrg-${mi}">0</span>${isFrota ? `<span class="fuel-badge" id="fuel-${mi}"></span>` : ''}</div><div class="sec-hdr-r">
    <div class="sw"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search" id="flt-e-${mi}-q" placeholder="Buscar…" oninput="filterSection(${mi},'emrg')"></div>
    <input class="flt flt-sm" id="flt-e-${mi}-area" placeholder="${emrgAreaPh}" oninput="filterSection(${mi},'emrg')">
    <select class="flt" id="flt-e-${mi}-serv" onchange="filterSection(${mi},'emrg')">${emrgServOpts}</select>
    <input class="flt flt-sm" id="flt-e-${mi}-func" placeholder="${emrgFuncPh}" oninput="filterSection(${mi},'emrg')">
    <input class="flt flt-date" id="flt-e-${mi}-date" type="date" title="Filtrar por data" onchange="filterSection(${mi},'emrg')">
    <select class="flt" id="flt-e-${mi}-stat" onchange="filterSection(${mi},'emrg')"><option value="">Todos</option><option value="CONCLUIDO">✓ Concluído</option><option value="ANDAMENTO">⟳ Andamento</option><option value="IDENT">⚑ Identificado</option></select>
    <button class="btn-clear-flt" onclick="clearFilters(${mi},'emrg')" title="Limpar filtros">✕ Limpar</button>
    ${hotelInfo().emrgServicos ? `<button class="btn-link-pub" onclick="openDestinos()" title="Gerenciar destinos da viagem">⚙ Destinos</button>` : ''}
    ${isFrota ? `<button class="btn-link-pub" onclick="openLinkPublico()" title="Link público de lançamento">🔗 Link Público</button>` : ''}
    <button class="btn-add-row" onclick="openModal(${mi},'EMERGENCIAL')">＋ ${L.emrgOne}</button>
  </div></div>
  <div class="tbl-wrap"><table><thead><tr>${emrgThead}</tr></thead><tbody id="tbody-emrg-${mi}"></tbody></table></div></div>
  ${isFrota ? '' : `<div class="sec-box asg"><div class="sec-hdr"><div class="sec-title"><div class="sec-icon icon-asg">🧹</div>Serviços ASG<span class="sec-badge sb-asg" id="cnt-asg-${mi}">0</span></div><div class="sec-hdr-r">
    <div class="sw"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search" id="flt-a-${mi}-q" placeholder="Buscar…" oninput="filterSection(${mi},'asg')"></div>
    <input class="flt flt-sm" id="flt-a-${mi}-area" placeholder="Área…" oninput="filterSection(${mi},'asg')">
    <select class="flt" id="flt-a-${mi}-serv" onchange="filterSection(${mi},'asg')"><option value="">Todos serviços</option>${asgOpts}</select>
    <input class="flt flt-sm" id="flt-a-${mi}-func" placeholder="Funcionário…" oninput="filterSection(${mi},'asg')">
    <input class="flt flt-date" id="flt-a-${mi}-date" type="date" title="Filtrar por data" onchange="filterSection(${mi},'asg')">
    <select class="flt" id="flt-a-${mi}-stat" onchange="filterSection(${mi},'asg')"><option value="">Todos status</option><option value="CONCLUIDO">✓ Concluído</option><option value="ANDAMENTO">⟳ Andamento</option><option value="IDENT">⚑ Identificado</option></select>
    <button class="btn-clear-flt" onclick="clearFilters(${mi},'asg')" title="Limpar filtros">✕ Limpar</button>
    <button class="btn-add-row" onclick="openModal(${mi},'ASG')">＋ ASG</button>
  </div></div>
  <div class="tbl-wrap"><table><thead><tr>${asgThead}</tr></thead><tbody id="tbody-asg-${mi}"></tbody></table></div></div>`}`;
}

function renderBothTables(mi) { renderPlan(mi); renderEmrg(mi); if (!hotelInfo().frota) renderASG(mi); updateTabCnt(mi); }

function isClosedMonth(mi) { return mi < MONTHS.length - 1; }

function sepRow(colspan, label) {
  const tr = document.createElement('tr');
  tr.className = 'sep-row';
  tr.innerHTML = `<td colspan="${colspan}" style="padding:8px 12px;background:linear-gradient(90deg,rgba(46,160,67,.08),transparent);border-top:1px solid rgba(46,160,67,.25);border-bottom:1px solid rgba(46,160,67,.15);font-size:10.5px;font-weight:600;letter-spacing:.8px;color:#3fb950;text-transform:uppercase">✓ ${label}</td>`;
  return tr;
}

function renderRows(mi, rows, tbody, makeFn, colspan) {
  let inserted = false;
  rows.forEach((r, i) => {
    if (!inserted && isConc(r)) {
      tbody.appendChild(sepRow(colspan, 'Concluídos no mês'));
      inserted = true;
    }
    const gi = DATA[mi].indexOf(r);
    tbody.appendChild(makeFn(mi, gi, r, i + 1));
  });
}

function renderASG(mi) {
  if (!DATA[mi]) return;
  const tbody = document.getElementById(`tbody-asg-${mi}`);
  if (!tbody) return;
  const rows = DATA[mi].filter(r => r.tipo === 'ASG' && !r.pendente).sort((a,b) => { const d = prioPriority(a) - prioPriority(b); return d || dateCmp(b.ini, a.ini); });
  tbody.innerHTML = '';
  const cnt = document.getElementById(`cnt-asg-${mi}`);
  if (!rows.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="10">Nenhum serviço ASG</td></tr>'; if (cnt) cnt.textContent = '0'; return; }
  renderRows(mi, rows, tbody, makeASGRow, 10);
  if (cnt) cnt.textContent = rows.length;
}

function makeASGRow(mi, gi, r, num) {
  const tr = document.createElement('tr');
  tr.className = rowClass(r);
  tr.dataset.gi = gi;
  const n = document.createElement('td'); n.className = 'td-n'; n.textContent = num; tr.appendChild(n);
  const ptd = document.createElement('td'); ptd.className = 'prio-cell';
  ptd.innerHTML = `<span class="prio ${prioClass(r.prio)}">${prioLabel(r.prio)}</span>`;
  tr.appendChild(ptd);
  const areaTd = eCell(r.area, v => updateField(mi, gi, 'area', v)); areaTd.classList.add('area-cell'); tr.appendChild(areaTd);
  const sv = document.createElement('td'); sv.className = 'sv-cell';
  sv.innerHTML = `<span class="sv ${svClass(r.serv)}">${esc(r.serv)||'—'}</span>`;
  tr.appendChild(sv);
  tr.appendChild(descCell(mi, gi, r.desc));
  const stTd = document.createElement('td'); stTd.className = 'st-cell';
  stTd.innerHTML = `<span class="st ${stClass(r.stat)}">${stLabel(r.stat)}</span>`;
  tr.appendChild(stTd);
  const funcTd = eCell(r.func, v => updateField(mi, gi, 'func', v)); funcTd.classList.add('func-cell'); tr.appendChild(funcTd);
  tr.appendChild(dateCell(r.dtid, v => updateField(mi, gi, 'dtid', v)));
  const iniTd = dateCell(r.ini, v => updateField(mi, gi, 'ini', v)); iniTd.classList.add('ini-cell'); iniTd.dataset.d = r.ini ? fmtBR(toISO(r.ini)) : ''; tr.appendChild(iniTd);
  tr.appendChild(metaRightCell(r));
  const dt = document.createElement('td'); dt.className = 'act-cell';
  const confBtn = r.pendente ? `<button class="btn-confirm" title="Confirmar lançamento pendente">✓</button>` : '';
  dt.innerHTML = `${confBtn}<button class="del">✕</button>`;
  if (r.pendente) dt.querySelector('.btn-confirm').onclick = () => askConfirmPend(mi, gi);
  dt.querySelector('.del').onclick = () => confirmDeleteRow(mi, gi);
  tr.appendChild(dt);
  const asgLabels = ['', 'Prioridade', 'Área', 'Serviço', 'Descrição', 'Status', 'Funcionários', 'Data Ident.', 'Data', ''];
  [...tr.children].forEach((td, i) => { if (asgLabels[i]) td.dataset.label = asgLabels[i]; });
  tr.style.cursor = 'pointer';
  tr.addEventListener('click', e => { if (e.target.closest('.act-cell') || e.target.closest('.desc-expand')) return; openEditRecord(mi, gi); });
  addRowHover(tr);
  return tr;
}

function renderPlan(mi) {
  if (!DATA[mi]) return;
  const rows  = DATA[mi].filter(r => r.tipo === 'PLANEJADO' && !r.pendente).sort((a,b) => { const d = prioPriority(a) - prioPriority(b); return d || dateCmp(b.ini, a.ini); });
  const tbody = document.getElementById(`tbody-plan-${mi}`);
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!rows.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="11">Nenhum serviço planejado</td></tr>'; document.getElementById(`cnt-plan-${mi}`).textContent = '0'; return; }
  renderRows(mi, rows, tbody, makePlanRow, 11);
  document.getElementById(`cnt-plan-${mi}`).textContent = rows.length;
}

function renderEmrg(mi) {
  if (!DATA[mi]) return;
  const rows  = DATA[mi].filter(r => r.tipo === 'EMERGENCIAL' && !r.pendente).sort((a,b) => { const d = prioPriority(a) - prioPriority(b); return d || dateCmp(b.ini, a.ini); });
  const tbody = document.getElementById(`tbody-emrg-${mi}`);
  if (!tbody) return;
  tbody.innerHTML = '';
  const isFrota = !!hotelInfo().frota;
  const cspan = isFrota ? 16 : 9;
  if (isFrota) {
    const conf = (DATA[mi] || []).filter(r => r.tipo === 'EMERGENCIAL' && !r.pendente);
    let tv = 0, tl = 0;
    conf.forEach(r => { tv += parseFloat(r.abValor) || 0; tl += parseFloat(r.abLitros) || 0; });
    const fb = document.getElementById(`fuel-${mi}`);
    if (fb) fb.textContent = (tv || tl) ? `⛽ ${fmtBRL(tv)}${tl ? ' · ' + tl.toLocaleString('pt-BR') + ' L' : ''}` : '';
  }
  if (!rows.length) { tbody.innerHTML = `<tr class="empty-row"><td colspan="${cspan}">${isFrota ? 'Nenhuma viagem' : 'Nenhum serviço emergencial'}</td></tr>`; document.getElementById(`cnt-emrg-${mi}`).textContent = '0'; return; }
  renderRows(mi, rows, tbody, makeEmrgRow, cspan);
  document.getElementById(`cnt-emrg-${mi}`).textContent = rows.length;
}

function dateCmp(a, b) { const pa = pd(a), pb = pd(b); if (!pa && !pb) return 0; if (!pa) return 1; if (!pb) return -1; return pa - pb; }
function pd(s) { if (!s) return null; const p = s.split('/'); if (p.length === 3) return new Date(p[2], p[1]-1, p[0]); if (s.includes('-')) return new Date(s); return null; }

function descCell(mi, gi, val) {
  const td   = document.createElement('td');
  td.className = 'desc-cell';
  td.dataset.desc = val || '';
  td.style.padding = '0';
  const wrap = document.createElement('div');
  wrap.className = 'desc-wrap';
  const inp  = document.createElement('input');
  inp.className = 'ci';
  inp.readOnly = true; inp.style.pointerEvents = 'none';
  inp.value = val || '';
  inp.placeholder = 'Descreva…';
  inp.onchange = e => { updateField(mi, gi, 'desc', e.target.value); scheduleSave(); };
  const btn  = document.createElement('button');
  btn.className = 'desc-expand';
  btn.title = 'Ver texto completo';
  btn.textContent = '⤢';
  btn.onclick = e => { e.stopPropagation(); openDesc(mi, gi); };
  wrap.appendChild(inp);
  wrap.appendChild(btn);
  td.appendChild(wrap);
  return td;
}

function eCell(val, cb, wide = false) {
  const td  = document.createElement('td');
  const inp = document.createElement('input');
  inp.className = 'ci';
  inp.readOnly = true; inp.style.pointerEvents = 'none';
  inp.value     = val || '';
  inp.placeholder = '—';
  if (wide) inp.style.minWidth = '220px';
  inp.onchange = e => { cb(e.target.value); scheduleSave(); };
  td.appendChild(inp);
  return td;
}

function dateCell(val, cb) {
  const td  = document.createElement('td');
  const inp = document.createElement('input');
  inp.className = 'ci ci-date';
  inp.readOnly = true; inp.style.pointerEvents = 'none';
  inp.type  = 'date';
  inp.value = toISO(val);
  inp.onchange = e => { cb(e.target.value); scheduleSave(); };
  td.appendChild(inp);
  return td;
}

function numCell(val, cb) {
  const td  = document.createElement('td');
  const inp = document.createElement('input');
  inp.className = 'ci';
  inp.readOnly = true; inp.style.pointerEvents = 'none';
  inp.type = 'number';
  inp.inputMode = 'numeric';
  inp.value = (val === 0 || val) ? val : '';
  inp.placeholder = '—';
  inp.onchange = e => { cb(e.target.value); scheduleSave(); };
  td.appendChild(inp);
  return td;
}

function addRowHover(tr) {
  const btns = () => tr.querySelectorAll('.del,.conv,.desc-expand');
  tr.addEventListener('mouseenter', () => btns().forEach(b => b.style.opacity = '1'));
  tr.addEventListener('mouseleave', () => btns().forEach(b => b.style.opacity = '0'));
}

function makePlanRow(mi, gi, r, num) {
  const tr = document.createElement('tr');
  tr.className = rowClass(r);
  tr.dataset.gi = gi;
  const n = document.createElement('td'); n.className = 'td-n'; n.textContent = num; tr.appendChild(n);
  const ptd = document.createElement('td'); ptd.className = 'prio-cell';
  ptd.innerHTML = `<span class="prio ${prioClass(r.prio)}">${prioLabel(r.prio)}</span>`;
  tr.appendChild(ptd);
  const areaTd = eCell(r.area, v => updateField(mi, gi, 'area', v)); areaTd.classList.add('area-cell'); tr.appendChild(areaTd);
  const sv = document.createElement('td'); sv.className = 'sv-cell';
  sv.innerHTML = `<span class="sv ${svClass(r.serv)}">${esc(r.serv)||'—'}</span>`;
  tr.appendChild(sv);
  tr.appendChild(descCell(mi, gi, r.desc));
  const stTd = document.createElement('td'); stTd.className = 'st-cell';
  stTd.innerHTML = `<span class="st ${stClass(r.stat)}">${stLabel(r.stat)}</span>`;
  tr.appendChild(stTd);
  const funcTd = eCell(r.func, v => updateField(mi, gi, 'func', v)); funcTd.classList.add('func-cell'); tr.appendChild(funcTd);
  tr.appendChild(dateCell(r.dtid, v => updateField(mi, gi, 'dtid', v)));
  const iniTd = dateCell(r.ini, v => updateField(mi, gi, 'ini', v)); iniTd.classList.add('ini-cell'); iniTd.dataset.d = r.ini ? fmtBR(toISO(r.ini)) : ''; tr.appendChild(iniTd);
  const fimTd = dateCell(r.fim, v => updateField(mi, gi, 'fim', v)); fimTd.classList.add('fim-cell'); fimTd.dataset.d = r.fim ? fmtBR(toISO(r.fim)) : '';
  if (isOverdue(r)) { const t = document.createElement('span'); t.className = 'overdue-tag'; t.textContent = '⚠ ATRASADO'; fimTd.appendChild(t); }
  tr.appendChild(fimTd);
  tr.appendChild(metaRightCell(r));
  const dt = document.createElement('td');
  dt.className = 'act-cell';
  const confBtn = r.pendente ? `<button class="btn-confirm" title="Confirmar lançamento pendente">✓</button>` : '';
  dt.innerHTML = `${confBtn}<button class="conv" title="Mover para ${hotelLabels().emrgOne}">⇄</button><button class="del">✕</button>`;
  if (r.pendente) dt.querySelector('.btn-confirm').onclick = () => askConfirmPend(mi, gi);
  dt.querySelector('.conv').onclick = () => openConvert(mi, gi);
  dt.querySelector('.del').onclick  = () => confirmDeleteRow(mi, gi);
  tr.appendChild(dt);
  const planLabels = ['', 'Prioridade', hotelInfo().frota ? 'Automotor' : 'Área', 'Serviço', 'Descrição', 'Status', 'Funcionários', 'Data Ident.', 'Início', 'Prazo/Fim', ''];
  [...tr.children].forEach((td, i) => { if (planLabels[i]) td.dataset.label = planLabels[i]; });
  tr.style.cursor = 'pointer';
  tr.addEventListener('click', e => { if (e.target.closest('.act-cell') || e.target.closest('.desc-expand')) return; openEditRecord(mi, gi); });
  addRowHover(tr);
  return tr;
}

function appendViagemCells(tr, mi, gi, r) {
  tr.appendChild(numCell(r.kmIni, v => { updateField(mi, gi, 'kmIni', v); refreshRodado(tr, mi, gi); }));
  tr.appendChild(numCell(r.kmFim, v => { updateField(mi, gi, 'kmFim', v); refreshRodado(tr, mi, gi); tr.className = rowClass(DATA[mi][gi]); }));
  const rod = document.createElement('td'); rod.className = 'rod-cell';
  const val = kmRodado(r);
  rod.innerHTML = `<span class="rod-val">${val === '' ? '—' : val}</span>`;
  tr.appendChild(rod);
  tr.appendChild(numCell(r.pax, v => updateField(mi, gi, 'pax', v)));
  tr.appendChild(numCell(r.abLitros, v => updateField(mi, gi, 'abLitros', v)));
  tr.appendChild(numCell(r.abValor, v => updateField(mi, gi, 'abValor', v)));
}
function refreshRodado(tr, mi, gi) {
  const span = tr.querySelector('.rod-val');
  if (!span) return;
  const val = kmRodado(DATA[mi][gi]);
  span.textContent = val === '' ? '—' : val;
}

function makeEmrgRow(mi, gi, r, num) {
  const tr = document.createElement('tr');
  tr.className = rowClass(r);
  tr.dataset.gi = gi;
  const n = document.createElement('td'); n.className = 'td-n';
  n.textContent = (hotelInfo().frota && r.num) ? pad3(r.num) : num;
  if (hotelInfo().frota && r.num) n.title = 'Viagem';
  tr.appendChild(n);
  const areaTd = eCell(r.area, v => updateField(mi, gi, 'area', v)); areaTd.classList.add('area-cell'); tr.appendChild(areaTd);
  const sv = document.createElement('td'); sv.className = 'sv-cell';
  sv.innerHTML = `<span class="sv ${svClass(r.serv)}">${esc(r.serv)||'—'}</span>`;
  tr.appendChild(sv);
  tr.appendChild(descCell(mi, gi, r.desc));
  const stTd = document.createElement('td'); stTd.className = 'st-cell';
  stTd.innerHTML = `<span class="st ${stClass(r.stat)}">${stLabel(r.stat)}</span>`;
  tr.appendChild(stTd);
  const funcTd = eCell(r.func, v => updateField(mi, gi, 'func', v)); funcTd.classList.add('func-cell'); tr.appendChild(funcTd);
  tr.appendChild(dateCell(r.dtid, v => updateField(mi, gi, 'dtid', v)));
  const iniTd = dateCell(r.ini, v => updateField(mi, gi, 'ini', v)); iniTd.classList.add('ini-cell'); iniTd.dataset.d = r.ini ? fmtBR(toISO(r.ini)) : ''; tr.appendChild(iniTd);
  if (isViagemRow(r)) {
    const hc = document.createElement('td'); hc.className = 'rod-cell';
    hc.textContent = (r.hIni || '—') + (r.hFim ? ' → ' + r.hFim : '');
    tr.appendChild(hc);
    appendViagemCells(tr, mi, gi, r);
  }
  tr.appendChild(metaRightCell(r));
  const dt = document.createElement('td');
  dt.className = 'act-cell';
  const confBtn = r.pendente ? `<button class="btn-confirm" title="Confirmar lançamento pendente">✓</button>` : '';
  dt.innerHTML = `${confBtn}<button class="conv" title="Mover para ${hotelLabels().planOne}">⇄</button><button class="del">✕</button>`;
  if (r.pendente) dt.querySelector('.btn-confirm').onclick = () => askConfirmPend(mi, gi);
  dt.querySelector('.conv').onclick = () => openConvert(mi, gi);
  dt.querySelector('.del').onclick  = () => confirmDeleteRow(mi, gi);
  tr.appendChild(dt);
  const emrgLabels = isViagemRow(r)
    ? ['', 'Carro', 'Destino', 'Descrição', 'Status', 'Motorista', 'Data Ident.', 'Data', 'Horário', 'KM Ini', 'KM Fim', 'Rodado', 'PAX', 'Litros', 'Valor', '']
    : ['', 'Área', 'Serviço', 'Descrição', 'Status', 'Funcionários', 'Data Ident.', 'Data', ''];
  [...tr.children].forEach((td, i) => { if (emrgLabels[i]) td.dataset.label = emrgLabels[i]; });
  tr.style.cursor = 'pointer';
  tr.addEventListener('click', e => { if (e.target.closest('.act-cell') || e.target.closest('.desc-expand')) return; openEditRecord(mi, gi); });
  addRowHover(tr);
  return tr;
}

function deleteRow(mi, gi) {
  const rec = DATA[mi][gi];
  if (rec) { trashPush({ tipo: 'registro', mesNome: MONTHS[mi] || '', rec: JSON.parse(JSON.stringify(rec)), motivo: 'excluido' }); logAction('Excluiu', alvoRec(rec)); }
  DATA[mi].splice(gi, 1);
  renderBothTables(mi);
  computeKPIs();
  pushToFirebase();
}

function confirmDeleteRow(mi, gi) {
  delRowTarget = { mi, gi };
  const r = DATA[mi][gi];
  document.getElementById('del-row-info').textContent = `${r.area || '—'} · ${r.serv || '—'}`;
  const d = r.desc || '';
  document.getElementById('del-row-desc').textContent = d.length > 90 ? d.substring(0, 90) + '…' : d || '—';
  document.getElementById('ov-del-row').classList.add('show');
}
function closeDelRow() {
  document.getElementById('ov-del-row').classList.remove('show');
  delRowTarget = { mi: null, gi: null };
}
function confirmDelRowAction() {
  if (delRowTarget.mi === null) return;
  deleteRow(delRowTarget.mi, delRowTarget.gi);
  closeDelRow();
}

function openConvert(mi, gi) {
  convertTarget = { mi, gi };
  const r = DATA[mi][gi];
  const L = hotelLabels();
  document.getElementById('conv-info').textContent = `${r.area || '—'} · ${r.serv || '—'}`;
  document.getElementById('conv-detail').textContent = r.tipo === 'PLANEJADO'
    ? `Mover de ${L.planOne} → ${L.emrgOne}`
    : `Mover de ${L.emrgOne} → ${L.planOne}`;
  document.getElementById('ov-convert').classList.add('show');
}
function closeConvert() {
  document.getElementById('ov-convert').classList.remove('show');
  convertTarget = { mi: null, gi: null };
}
function confirmConvert() {
  if (convertTarget.mi === null) return;
  const { mi, gi } = convertTarget;
  const cur = DATA[mi][gi].tipo;
  DATA[mi][gi].tipo = cur === 'PLANEJADO' ? 'EMERGENCIAL' : 'PLANEJADO';
  if (DATA[mi][gi].tipo === 'EMERGENCIAL') DATA[mi][gi].fim = '';
  renderBothTables(mi);
  computeKPIs();
  pushToFirebase();
  closeConvert();
}

function openDesc(mi, gi) {
  descTarget = { mi, gi };
  const r = DATA[mi][gi];
  document.getElementById('desc-modal-title').textContent = `Descrição · ${r.area || 'Registro'} · ${r.serv || ''}`;
  document.getElementById('desc-area').value = r.desc || '';
  document.getElementById('ov-desc').classList.add('show');
  setTimeout(() => document.getElementById('desc-area').focus(), 100);
}
function closeDesc(e) {
  if (e && e.target !== document.getElementById('ov-desc')) return;
  document.getElementById('ov-desc').classList.remove('show');
  descTarget = { mi: null, gi: null };
}
function closeDescBtn() {
  document.getElementById('ov-desc').classList.remove('show');
  descTarget = { mi: null, gi: null };
}
function saveDesc() {
  if (descTarget.mi === null) return;
  updateField(descTarget.mi, descTarget.gi, 'desc', document.getElementById('desc-area').value);
  renderBothTables(descTarget.mi);
  scheduleSave();
  closeDescBtn();
}

function openServicos() {
  renderServicosModal();
  document.getElementById('new-serv-inp').value = '';
  document.getElementById('ov-servicos').classList.add('show');
}
function closeServicos() {
  document.getElementById('ov-servicos').classList.remove('show');
}
function renderServicosModal() {
  document.getElementById('serv-list').innerHTML = SERVICOS.map(s => {
    const isDef = baseServicos().includes(s);
    return `<div class="serv-item"><span class="sv ${svClass(s)}">${s}</span>${isDef ? '' : `<button class="serv-del" onclick="removeServico('${s}')">✕</button>`}</div>`;
  }).join('');
}
function addNewServico() {
  const inp = document.getElementById('new-serv-inp');
  const val = inp.value.trim().toUpperCase().normalize('NFC');
  if (!val || SERVICOS.includes(val)) { inp.value = ''; return; }
  SERVICOS.push(val);
  saveCustomServicos();
  renderServicosModal();
  updateServSelect();
  inp.value = '';
  inp.focus();
}
function removeServico(name) {
  if (baseServicos().includes(name)) return;
  SERVICOS = SERVICOS.filter(s => s !== name);
  saveCustomServicos();
  renderServicosModal();
  updateServSelect();
}
function saveCustomServicos() {
  if (!db) return;
  const custom = SERVICOS.filter(s => !baseServicos().includes(s));
  db.ref(`${hotelPath()}/servicos`).set(custom.length ? custom : null);
}
function openDestinos() {
  renderDestinosModal();
  document.getElementById('new-dest-inp').value = '';
  document.getElementById('ov-destinos').classList.add('show');
}
function closeDestinos() {
  document.getElementById('ov-destinos').classList.remove('show');
}
function renderDestinosModal() {
  document.getElementById('dest-list').innerHTML = DESTINOS.map(s => {
    const isDef = VIAGEM_DESTINOS.includes(s);
    return `<div class="serv-item"><span class="sv ${svClass(s)}">${s}</span>${isDef ? '' : `<button class="serv-del" onclick="removeDestino('${s.replace(/'/g, "\\'")}')">✕</button>`}</div>`;
  }).join('');
}
function addNewDestino() {
  const inp = document.getElementById('new-dest-inp');
  const val = inp.value.trim().toUpperCase().normalize('NFC');
  if (!val || DESTINOS.includes(val)) { inp.value = ''; return; }
  DESTINOS.push(val);
  saveCustomDestinos();
  renderDestinosModal();
  inp.value = '';
  inp.focus();
}
function removeDestino(name) {
  if (VIAGEM_DESTINOS.includes(name)) return;
  DESTINOS = DESTINOS.filter(s => s !== name);
  saveCustomDestinos();
  renderDestinosModal();
}
function saveCustomDestinos() {
  if (!db) return;
  const custom = DESTINOS.filter(s => !VIAGEM_DESTINOS.includes(s));
  db.ref(`${hotelPath()}/destinos`).set(custom.length ? custom : null);
}

function updateServSelect() {
  const sel = document.getElementById('m-serv');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = SERVICOS.map(s => `<option value="${s}">${s}</option>`).join('');
  if (SERVICOS.includes(cur)) sel.value = cur;
}

function cyclePrio(mi, gi, tr, ptd) {
  const next = PRIO_CYCLE[(PRIO_CYCLE.indexOf(DATA[mi][gi].prio || 'BAIXA') + 1) % 3];
  updateField(mi, gi, 'prio', next);
  tr.className = rowClass(DATA[mi][gi]);
  const sp = ptd.querySelector('.prio');
  sp.className  = `prio ${prioClass(next)}`;
  sp.textContent = prioLabel(next);
  scheduleSave();
}

function cycleSt(mi, gi, tr, stTd) {
  const cycle = isViagemRow(DATA[mi][gi]) ? ['ANDAMENTO','CONCLUIDO'] : ST_CYCLE;
  const cur = (DATA[mi][gi].stat||'').toUpperCase();
  const idx  = cycle.findIndex(s => cur.includes(s.substring(0, 4)));
  const next = cycle[(idx + 1) % cycle.length];
  DATA[mi][gi].stat = next;
  const concNow = next === 'CONCLUIDO';
  if (concNow) { DATA[mi][gi].tsFim = Date.now(); delete DATA[mi][gi].confMant; } else delete DATA[mi][gi].tsFim;
  if (!DATA[mi][gi].ts) DATA[mi][gi].ts = Date.now();
  const sp = stTd.querySelector('.st');
  sp.className  = `st ${stClass(next)}`;
  sp.textContent = stLabel(next);
  tr.className = rowClass(DATA[mi][gi]);
  logAction('Status → ' + stLabel(next).replace(/^[^ ]+ /, ''), alvoRec(DATA[mi][gi]));
  const months = syncToSiblings(DATA[mi][gi].id, mi, gi, { stat: next, tsFim: DATA[mi][gi].tsFim });
  months.forEach(m => renderBothTables(m));
  if (next === 'CONCLUIDO') renderBothTables(mi);
  computeKPIs();
  scheduleSave();
}

let servPickTarget = { mi: null, gi: null, svtd: null, newServ: null };

function nextServ(mi, gi, svtd) {
  openServPick(mi, gi, svtd);
}

function openServPick(mi, gi, svtd) {
  servPickTarget = { mi, gi, svtd, newServ: null };
  const r = DATA[mi][gi];
  const isViagem = isViagemRow(r);
  const isAsg = r.tipo === 'ASG';
  const list = isViagem ? DESTINOS : isAsg ? ASGSERV : SERVICOS;
  const cur = r.serv || '';
  const titleEl = document.querySelector('#ov-serv-pick h3');
  if (titleEl) titleEl.textContent = isViagem ? 'Alterar Destino' : 'Alterar Serviço';
  const createRow = document.getElementById('sp-create-row');
  if (createRow) createRow.style.display = isViagem ? 'none' : 'flex';
  const curEl = document.getElementById('sp-current');
  curEl.className = `sv ${svClass(cur)}`;
  curEl.textContent = cur || '—';
  document.getElementById('sp-confirm').style.display = 'none';
  document.getElementById('sp-actions').style.display = 'flex';

  const grid = document.getElementById('sp-grid');
  grid.innerHTML = list.map(s => {
    const isCur = s === cur;
    return `<button class="sp-item sv ${svClass(s)}${isCur ? ' sp-item-cur' : ''}" onclick="pickServ('${s.replace(/'/g, "\\'")}')" ${isCur ? 'disabled' : ''}>${s}${isCur ? ' ✓' : ''}</button>`;
  }).join('');

  document.getElementById('ov-serv-pick').classList.add('show');
}

function pickServ(name) {
  servPickTarget.newServ = name;
  const newEl = document.getElementById('sp-new-name');
  newEl.className = `sv ${svClass(name)}`;
  newEl.textContent = name;
  document.getElementById('sp-confirm').style.display = 'block';
  document.getElementById('sp-actions').style.display = 'none';
}

function cancelServPick() {
  servPickTarget.newServ = null;
  document.getElementById('sp-confirm').style.display = 'none';
  document.getElementById('sp-actions').style.display = 'flex';
}

function confirmServPick() {
  const { mi, gi, svtd, newServ } = servPickTarget;
  if (mi === null || !newServ) return;
  updateField(mi, gi, 'serv', newServ);
  const sp = svtd.querySelector('.sv');
  sp.className   = `sv ${svClass(newServ)}`;
  sp.textContent = newServ;
  scheduleSave();
  closeServPick();
}

function addServFromPick() {
  const inp = document.getElementById('sp-new-inp');
  const val = inp.value.trim().toUpperCase().normalize('NFC');
  if (!val) return;
  if (!SERVICOS.includes(val)) {
    SERVICOS.push(val);
    saveCustomServicos();
    updateServSelect();
  }
  inp.value = '';
  pickServ(val);
}

function closeServPick() {
  document.getElementById('ov-serv-pick').classList.remove('show');
  servPickTarget = { mi: null, gi: null, svtd: null, newServ: null };
}

// ─── TAB / NAVIGATION ─────────────────────────────────────────────────────────
function switchTab(mi) {
  mi = parseInt(mi);
  if (isNaN(mi)) return;
  activeMonth = mi;
  document.querySelectorAll('.tab').forEach((t, i)   => t.classList.toggle('active', i === mi));
  document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i === mi));
  const ms = document.getElementById('month-select'); if (ms) ms.value = mi;
  updateFooter(mi);
  computeKPIs();
}

function updateTabCnt(mi) {
  const el = document.getElementById(`tab-cnt-${mi}`);
  if (!el) return;
  const pl = (DATA[mi]||[]).filter(r => r.tipo === 'PLANEJADO' && !r.pendente).length;
  const em = (DATA[mi]||[]).filter(r => r.tipo === 'EMERGENCIAL' && !r.pendente).length;
  const asg = (DATA[mi]||[]).filter(r => r.tipo === 'ASG' && !r.pendente).length;
  el.textContent = `${pl}P · ${em}E${asg ? ' · ' + asg + 'A' : ''}`;
}

function updateFooter(mi) {
  const f = document.getElementById('ftr');
  if (!f) return;
  const m  = (DATA[mi] || []).filter(r => !r.pendente);
  const ok = m.filter(r => (r.stat||'').toUpperCase().includes('CONC')).length;
  f.textContent = `${MONTHS[mi]} · ${m.length} registros · ${ok} concluídos`;
}

// ─── DELETE MONTH ─────────────────────────────────────────────────────────────
function askDelMonth(e, mi) {
  e.stopPropagation();
  delMonthIdx = mi;
  const name  = MONTHS[mi];
  const total = (DATA[mi]||[]).length;
  document.getElementById('del-month-name').textContent   = name;
  document.getElementById('del-month-detail').textContent = total > 0
    ? `⚠ ${total} registro${total > 1 ? 's' : ''} ser${total > 1 ? 'ão' : 'á'} perdido${total > 1 ? 's' : ''} permanentemente.`
    : 'Este mês está vazio (0 registros).';
  document.getElementById('ov-del-month').classList.add('show');
}
function closeDelMonth() { document.getElementById('ov-del-month').classList.remove('show'); delMonthIdx = null; }
function confirmDelMonth() {
  if (delMonthIdx === null) return;
  const mi = delMonthIdx;
  trashPush({ tipo: 'mes', mesNome: MONTHS[mi] || '', data: JSON.parse(JSON.stringify(DATA[mi] || [])) });
  logAction('Excluiu mês', MONTHS[mi] || '');
  MONTHS.splice(mi, 1);
  DATA.splice(mi, 1);
  closeDelMonth();
  activeMonth = Math.min(activeMonth, Math.max(0, MONTHS.length - 1));
  buildUI();
  if (MONTHS.length) switchTab(activeMonth);
  computeKPIs();
  pushToFirebase();
}

// ─── FILTERS / SORT ───────────────────────────────────────────────────────────
function normStr(s) { return (s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
function matchDate(fieldVal, filterISO) {
  if (!filterISO) return true;
  const fDate = new Date(filterISO + 'T00:00:00');
  const dDate = pd(fieldVal);
  if (!dDate) return false;
  return fDate.getFullYear() === dDate.getFullYear() && fDate.getMonth() === dDate.getMonth() && fDate.getDate() === dDate.getDate();
}
function filterSection(mi, sec) {
  const p = sec === 'plan' ? `flt-p-${mi}` : sec === 'asg' ? `flt-a-${mi}` : `flt-e-${mi}`;
  const area = normStr(document.getElementById(`${p}-area`)?.value || '');
  const serv = normStr(document.getElementById(`${p}-serv`)?.value || '');
  const func = normStr(document.getElementById(`${p}-func`)?.value || '');
  const date = document.getElementById(`${p}-date`)?.value || '';
  const stat = normStr(document.getElementById(`${p}-stat`)?.value || '');
  const q    = normStr(document.getElementById(`${p}-q`)?.value || '');
  const tbodyId = sec === 'plan' ? `tbody-plan-${mi}` : sec === 'asg' ? `tbody-asg-${mi}` : `tbody-emrg-${mi}`;
  document.querySelectorAll(`#${tbodyId} tr`).forEach(tr => {
    if (tr.classList.contains('empty-row') || tr.classList.contains('sep-row')) return;
    const inps  = [...tr.querySelectorAll('input.ci')];
    const tarea = normStr(inps[0]?.value);
    const tdesc = normStr(inps[1]?.value);
    const tfunc = normStr(inps[2]?.value);
    const tdtid = inps[3]?.value || '';
    const tini  = inps[4]?.value || '';
    const tserv = normStr(tr.querySelector('.sv')?.textContent);
    const tstat = normStr(tr.querySelector('.st')?.textContent);
    const tnum  = normStr(tr.querySelector('.td-n')?.textContent);
    let show = true;
    if (area && !tarea.includes(area)) show = false;
    if (serv && !tserv.includes(serv)) show = false;
    if (func && !tfunc.includes(func)) show = false;
    if (date && !matchDate(tdtid, date) && !matchDate(tini, date)) show = false;
    if (stat && !tstat.includes(stat)) show = false;
    if (q && ![tnum, tarea, tdesc, tfunc, tserv, tstat].join(' ').includes(q)) show = false;
    tr.style.display = show ? '' : 'none';
  });
}
function clearFilters(mi, sec) {
  const p = sec === 'plan' ? `flt-p-${mi}` : sec === 'asg' ? `flt-a-${mi}` : `flt-e-${mi}`;
  ['q', 'area', 'serv', 'func', 'date', 'stat'].forEach(k => {
    const el = document.getElementById(`${p}-${k}`);
    if (!el) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = '';
  });
  filterSection(mi, sec);
}
function srt(mi, sec, field, th) {
  const key = `${mi}-${sec}-${field}`;
  const asc = sortDir[key] !== 'asc';
  sortDir[key] = asc ? 'asc' : 'desc';
  document.querySelectorAll(`#panel-${mi} thead th .sort-ic`).forEach(ic => ic.textContent = '⇅');
  const ic = th.querySelector('.sort-ic');
  if (ic) ic.textContent = asc ? '↑' : '↓';
  DATA[mi].sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'PLANEJADO' ? -1 : 1;
    const av = (a[field]||'').toLowerCase(), bv = (b[field]||'').toLowerCase();
    return asc ? av.localeCompare(bv, 'pt') : bv.localeCompare(av, 'pt');
  });
  renderBothTables(mi);
}

// ─── NEW MONTH MODAL ──────────────────────────────────────────────────────────
function openNewMonth() {
  const now = new Date();
  document.getElementById('nm-picker').value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const pending = getPendingRows(activeMonth);
  const box     = document.getElementById('nm-pending-box');
  const hint    = document.getElementById('nm-empty-hint');
  const txt     = document.getElementById('nm-pending-txt');
  const chk     = document.getElementById('nm-transfer-chk');
  if (pending.length && MONTHS.length) {
    const idnt = pending.filter(r => (r.stat||'').toUpperCase().includes('DENT')).length;
    const andd = pending.filter(r => (r.stat||'').toUpperCase().includes('AND')).length;
    const parts = [];
    if (idnt) parts.push(`${idnt} identificado${idnt > 1 ? 's' : ''}`);
    if (andd) parts.push(`${andd} em andamento`);
    txt.textContent = `${parts.join(' e ')} no mês atual`;
    box.style.display = 'block';
    hint.style.display = 'none';
    chk.checked = true;
  } else {
    box.style.display = 'none';
    hint.style.display = '';
  }

  document.getElementById('ov-month').classList.add('show');
  setTimeout(() => document.getElementById('nm-picker').focus(), 120);
}

function getPendingRows(mi) {
  if (!DATA[mi]) return [];
  // Não transfere para o novo mês os que estão em Recebidos (pendente) nem os concluídos.
  return DATA[mi].filter(r => !(r.stat||'').toUpperCase().includes('CONC') && !r.pendente);
}
// Cria automaticamente o mês atual (dia 01 em diante) se ainda não existir.
// Transfere os pendentes do mês mais recente. Retorna true se criou.
function ensureCurrentMonth() {
  const name = currentMonthName();
  if (MONTHS.includes(name)) return false;
  let pending = [];
  if (MONTHS.length) {
    let lastIdx = 0, lastVal = -Infinity;
    MONTHS.forEach((m, i) => { const v = admMonthVal(m); if (v > lastVal) { lastVal = v; lastIdx = i; } });
    pending = getPendingRows(lastIdx);
  }
  MONTHS.push(name);
  DATA.push(pending.map(r => Object.assign({}, r)));
  return true;
}
function closeNewMonth(e) {
  if (!e || e.target === document.getElementById('ov-month')) document.getElementById('ov-month').classList.remove('show');
}
function confirmNewMonth() {
  const val = document.getElementById('nm-picker').value;
  if (!val) return;
  const [year, month] = val.split('-');
  const name = `${MONTHS_PT[parseInt(month) - 1]} ${year}`;
  if (MONTHS.includes(name)) { alert(`O mês "${name}" já existe.`); return; }

  const transfer = document.getElementById('nm-transfer-chk').checked;
  const sourceMi = activeMonth;
  const pending  = transfer ? getPendingRows(sourceMi) : [];

  MONTHS.push(name);
  DATA.push(pending.map(r => Object.assign({}, r)));
  const mi = MONTHS.length - 1;
  document.getElementById('empty-state').style.display = 'none';
  const t = makeTab(name, mi);
  document.getElementById('tabs').appendChild(t);
  const p = document.createElement('div');
  p.className = 'panel';
  p.id = `panel-${mi}`;
  p.innerHTML = buildPanelHTML(mi);
  document.getElementById('panels').appendChild(p);
  renderBothTables(mi);
  document.getElementById('ov-month').classList.remove('show');
  switchTab(mi);
  computeKPIs();
  pushToFirebase();
}

// ─── RECORD MODAL ─────────────────────────────────────────────────────────────
function openModal(mi, tipo) {
  modalTarget = mi;
  editTarget = null;
  const L = hotelLabels();
  const sel = document.getElementById('m-tipo');
  sel.value = tipo;
  sel.querySelector('option[value="PLANEJADO"]').textContent = `${L.planIcon} ${L.planOne}`;
  sel.querySelector('option[value="EMERGENCIAL"]').textContent = `${L.emrgIcon} ${L.emrgOne}`;
  const asgOpt = sel.querySelector('option[value="ASG"]');
  if (asgOpt) asgOpt.style.display = hotelInfo().frota ? 'none' : '';
  ['m-area','m-desc','m-func','m-ident','m-fim','m-kmini','m-kmfim','m-pax','m-litros','m-valor','m-abast'].forEach(id => document.getElementById(id).value = '');
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('m-dtid').value = hoje;
  document.getElementById('m-ini').value = hoje;
  editFotoRemove = false;
  const _fr = document.getElementById('m-foto-row'); if (_fr) _fr.style.display = 'none';
  onTipoChange();
  if (hotelInfo().frota) document.getElementById('m-area-sel').selectedIndex = 0;
  const ss = document.getElementById('m-serv');
  ss.value = [...ss.options].some(o => o.value === 'REPAROS') ? 'REPAROS' : (ss.options[0] ? ss.options[0].value : '');
  const viagemModal = (tipo === 'EMERGENCIAL') && !!hotelInfo().frota;
  document.getElementById('m-stat').value = viagemModal ? 'ANDAMENTO' : 'INDENTIFICADO';
  document.getElementById('m-save-btn').textContent = 'Adicionar';
  document.getElementById('m-del-btn').style.display = 'none';
  document.getElementById('ov').classList.add('show');
}
function onTipoChange() {
  const tipo = document.getElementById('m-tipo').value;
  const L = hotelLabels();
  document.getElementById('mod-title').textContent = tipo === 'PLANEJADO' ? `${L.planIcon} Novo ${L.planOne}` : tipo === 'ASG' ? '🧹 Novo Serviço ASG' : `${L.emrgIcon} Novo ${L.emrgOne}`;
  document.getElementById('m-fim-row').style.display = tipo === 'PLANEJADO' ? '' : 'none';

  const viagemModal = (tipo === 'EMERGENCIAL') && !!hotelInfo().frota;

  // Quarto/Área  →  seletor de Veículo (viagem) ou Automotor (serviços) nas unidades com frota
  const isFrota = !!hotelInfo().frota;
  const areaInp = document.getElementById('m-area');
  const areaSel = document.getElementById('m-area-sel');
  const areaLbl = document.getElementById('m-area-lbl');
  if (isFrota) {
    if (areaLbl) areaLbl.textContent = viagemModal ? 'Veículo' : 'Automotor';
    areaInp.style.display = 'none';
    areaSel.style.display = '';
    fillAutoSelect(areaSel, viagemModal ? VEICULOS : automotorList());
  } else {
    if (areaLbl) areaLbl.textContent = 'Quarto / Área';
    areaInp.style.display = '';
    areaSel.style.display = 'none';
  }

  // Serviço  →  Destino na Viagem
  const servLbl = document.querySelector('#m-serv').previousElementSibling;
  if (servLbl) servLbl.textContent = (tipo === 'EMERGENCIAL' && emrgServList()) ? 'Destino' : 'Serviço';
  fillServSelect();

  // Prioridade sempre normal
  const prioLbl = document.querySelector('#m-prio-row label');
  if (prioLbl) prioLbl.textContent = 'Prioridade';
  document.getElementById('m-prio').innerHTML = `<option value="ALTA">🔴 Alta</option><option value="MEDIA" selected>🟠 Média</option><option value="BAIXA">🔵 Baixa</option>`;

  // Status: na Viagem só Andamento e Concluído
  const statSel = document.getElementById('m-stat');
  statSel.innerHTML = viagemModal
    ? `<option value="ANDAMENTO">⟳ Em Andamento</option><option value="CONCLUIDO">✓ Concluído</option>`
    : `<option value="INDENTIFICADO">⚑ Identificado</option><option value="ANDAMENTO">⟳ Em Andamento</option><option value="CONCLUIDO">✓ Concluído</option>`;

  // Campos extras da Viagem (Carros): KM, PAX, Abastecimento e Motorista
  const frotaU = !!hotelInfo().frota;
  ['m-kmini-row','m-kmfim-row','m-pax-row'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = viagemModal ? '' : 'none';
  });
  ['m-litros-row','m-valor-row','m-abast-row'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = frotaU ? '' : 'none';
  });
  const funcLbl = document.getElementById('m-func-lbl');
  if (funcLbl) funcLbl.textContent = viagemModal ? 'Motorista' : 'Funcionários';
}

function fillAutoSelect(sel, list, current) {
  sel.innerHTML = list.map(v => `<option value="${v}">${v}</option>`).join('') +
    `<option value="__ADD__">➕ Adicionar (admin)…</option>`;
  if (current && list.includes(current)) sel.value = current;
}

function fillServSelect(current) {
  const tipo = document.getElementById('m-tipo').value;
  let servList;
  if (tipo === 'ASG') servList = ASGSERV;
  else { const destinos = (tipo === 'EMERGENCIAL') ? emrgServList() : null; servList = destinos || SERVICOS; }
  const sel = document.getElementById('m-serv');
  sel.innerHTML = servList.map(s => `<option value="${s}">${s}</option>`).join('') +
    `<option value="__ADD__">➕ Adicionar (admin)…</option>`;
  if (current && servList.includes(current)) sel.value = current;
}

async function onAreaSelChange() {
  const sel = document.getElementById('m-area-sel');
  if (sel.value !== '__ADD__') return;
  sel.selectedIndex = 0;
  const viagemModal = (document.getElementById('m-tipo').value === 'EMERGENCIAL') && !!hotelInfo().frota;
  const nome = (prompt('Novo automotor:') || '').trim().toUpperCase().normalize('NFC');
  if (!nome) return;
  const senha = (prompt('Senha master (admin):') || '').trim();
  if (!senha) return;
  if (!(await checkMaster(senha))) { alert('Senha master incorreta.'); return; }
  if (!VEICULOS.includes(nome) && !GERADORES.includes(nome)) {
    VEICULOS.push(nome);
    db.ref(`${hotelPath()}/veiculos`).set(VEICULOS.filter(v => !CARROS_VEICULOS.includes(v)));
  }
  fillAutoSelect(sel, viagemModal ? VEICULOS : automotorList(), nome);
}

async function onServSelChange() {
  const sel = document.getElementById('m-serv');
  if (sel.value !== '__ADD__') return;
  sel.selectedIndex = 0;
  const tipo = document.getElementById('m-tipo').value;
  const isDest = (tipo === 'EMERGENCIAL') && !!hotelInfo().emrgServicos;
  const isAsg = tipo === 'ASG';
  const nome = (prompt(isDest ? 'Novo destino:' : 'Novo serviço:') || '').trim().toUpperCase().normalize('NFC');
  if (!nome) return;
  const senha = (prompt('Senha master (admin):') || '').trim();
  if (!senha) return;
  if (!(await checkMaster(senha))) { alert('Senha master incorreta.'); return; }
  if (isDest) {
    if (!DESTINOS.includes(nome)) { DESTINOS.push(nome); db.ref(`${hotelPath()}/destinos`).set(DESTINOS.filter(s => !VIAGEM_DESTINOS.includes(s))); }
  } else if (isAsg) {
    if (!ASGSERV.includes(nome)) { ASGSERV.push(nome); db.ref(`${hotelPath()}/asgServicos`).set(ASGSERV.filter(s => !ASG_SERVICOS.includes(s))); }
  } else {
    if (!SERVICOS.includes(nome)) { SERVICOS.push(nome); saveCustomServicos(); }
  }
  fillServSelect(nome);
}
function ovClose(e) {
  if (!e || e.target === document.getElementById('ov')) { document.getElementById('ov').classList.remove('show'); modalTarget = null; editTarget = null; }
}
let editFotoRemove = false;
function removeEditFoto() {
  editFotoRemove = true;
  const fv = document.getElementById('m-foto-view');
  if (fv) fv.innerHTML = '<span class="modview-note">Foto será removida ao salvar.</span>';
}
function openEditRecord(mi, gi) {
  const r = DATA[mi][gi];
  if (!r) return;
  editFotoRemove = false;
  const fr = document.getElementById('m-foto-row'), fv = document.getElementById('m-foto-view');
  if (fr && fv) {
    if (r.foto && /^https:\/\//.test(r.foto)) {
      fr.style.display = '';
      fv.innerHTML = `<a href="${esc(r.foto)}" target="_blank" rel="noopener"><img class="modal-foto" src="${esc(r.foto)}" alt="foto"></a> <button type="button" class="btn btn-ghost btn-xs" onclick="removeEditFoto()">Remover foto</button>`;
    } else { fr.style.display = 'none'; fv.innerHTML = ''; }
  }
  editTarget = { mi, gi };
  modalTarget = mi;
  const L = hotelLabels();
  const sel = document.getElementById('m-tipo');
  sel.value = r.tipo;
  sel.querySelector('option[value="PLANEJADO"]').textContent = `${L.planIcon} ${L.planOne}`;
  sel.querySelector('option[value="EMERGENCIAL"]').textContent = `${L.emrgIcon} ${L.emrgOne}`;
  const asgOpt = sel.querySelector('option[value="ASG"]');
  if (asgOpt) asgOpt.style.display = hotelInfo().frota ? 'none' : '';
  onTipoChange();
  if (hotelInfo().frota) { const s = document.getElementById('m-area-sel'); if ([...s.options].some(o => o.value === r.area)) s.value = r.area; }
  else document.getElementById('m-area').value = r.area || '';
  const ss = document.getElementById('m-serv'); if ([...ss.options].some(o => o.value === r.serv)) ss.value = r.serv;
  document.getElementById('m-desc').value  = r.desc || '';
  document.getElementById('m-prio').value  = r.prio || 'MEDIA';
  document.getElementById('m-func').value  = r.func || '';
  document.getElementById('m-ident').value = r.ident || '';
  document.getElementById('m-dtid').value  = toISO(r.dtid);
  document.getElementById('m-ini').value   = toISO(r.ini);
  document.getElementById('m-fim').value   = toISO(r.fim);
  const stv = (r.stat || '').toUpperCase();
  const statSel = document.getElementById('m-stat'); if ([...statSel.options].some(o => o.value === stv)) statSel.value = stv;
  document.getElementById('m-kmini').value  = r.kmIni || '';
  document.getElementById('m-kmfim').value  = r.kmFim || '';
  document.getElementById('m-pax').value    = r.pax || '';
  document.getElementById('m-litros').value = r.abLitros || '';
  document.getElementById('m-valor').value  = r.abValor || '';
  document.getElementById('m-abast').value  = r.abast || '';
  document.getElementById('mod-title').textContent = '✏ Editar / Confirmar'
    + (hotelInfo().frota && r.tipo === 'EMERGENCIAL' && r.codigo ? ' · 🔑 Código ' + r.codigo : '');
  document.getElementById('m-save-btn').textContent = 'Salvar';
  document.getElementById('m-del-btn').style.display = '';
  document.getElementById('ov').classList.add('show');
}

function submitRecord() { if (editTarget) saveEdit(); else addRecord(); }

async function saveEdit() {
  if (!editTarget) return;
  const { mi, gi } = editTarget;
  const alvo = (DATA[mi] && DATA[mi][gi]) ? DATA[mi][gi] : null;
  if (!alvo || !alvo.id) { editTarget = null; document.getElementById('ov').classList.remove('show'); return; }
  const editId = alvo.id;
  // aplica as alterações do formulário em um registro (usado no dado fresco do servidor)
  const removeFoto = editFotoRemove;
  function aplicar(r) {
    const tipo = document.getElementById('m-tipo').value;
    r.tipo = tipo;
    r.prio = document.getElementById('m-prio').value;
    r.area = hotelInfo().frota ? document.getElementById('m-area-sel').value : document.getElementById('m-area').value;
    r.serv = document.getElementById('m-serv').value;
    r.desc = document.getElementById('m-desc').value;
    const wasConc = (r.stat || '').toUpperCase().includes('CONC');
    r.stat = document.getElementById('m-stat').value;
    const isConcNow = (r.stat || '').toUpperCase().includes('CONC');
    if (isConcNow && !wasConc) r.tsFim = Date.now();
    else if (!isConcNow && wasConc) delete r.tsFim;
    if (isConcNow) delete r.confMant;
    if (removeFoto) delete r.foto;
    if (!r.ts) r.ts = Date.now();
    r.func = document.getElementById('m-func').value;
    r.ident = document.getElementById('m-ident').value;
    r.dtid = document.getElementById('m-dtid').value;
    r.ini  = document.getElementById('m-ini').value;
    r.fim  = tipo === 'PLANEJADO' ? document.getElementById('m-fim').value : '';
    if (hotelInfo().frota) {
      r.abLitros = document.getElementById('m-litros').value;
      r.abValor  = document.getElementById('m-valor').value;
      r.abast    = document.getElementById('m-abast').value;
      if (tipo === 'EMERGENCIAL') {
        r.kmIni = document.getElementById('m-kmini').value;
        r.kmFim = document.getElementById('m-kmfim').value;
        r.pax   = document.getElementById('m-pax').value;
        if (!r.num) r.num = nextViagemNum();
        if (!r.codigo) r.codigo = genCode();
      }
    }
    return tipo;
  }
  document.getElementById('ov').classList.remove('show');
  editTarget = null;
  modalTarget = null;
  try {
    const snap = await db.ref(hotelPath() + '/data').once('value');
    const data = normalizeData(snap.val());
    let found = null, foundMi = mi;
    data.forEach((m, i) => m.forEach(r => { if (r && r.id === editId) { found = r; foundMi = i; } }));
    if (!found) { alert('Este registro não está mais disponível. Ele pode ter sido movido ou excluído.'); return; }
    const tipo = aplicar(found);
    await db.ref(hotelPath() + '/data').set(data);
    DATA = data; while (DATA.length < MONTHS.length) DATA.push([]);
    logAction('Editou', alvoRec(found));
    activeMonth = foundMi;
    buildUI();
    switchTab(foundMi);
    computeKPIs();
  } catch (e) {
    console.error('Falha ao salvar edição', e);
    alert('Não foi possível salvar a edição. Verifique a conexão e tente de novo.');
  }
}

async function addRecord() {
  if (modalTarget === null) return;
  const mi = modalTarget;
  const tipo = document.getElementById('m-tipo').value;
  const rec = {
    id:    genId(),
    tipo,
    prio:  document.getElementById('m-prio').value,
    area:  hotelInfo().frota ? document.getElementById('m-area-sel').value : document.getElementById('m-area').value,
    serv:  document.getElementById('m-serv').value,
    desc:  document.getElementById('m-desc').value,
    stat:  document.getElementById('m-stat').value,
    func:  document.getElementById('m-func').value,
    ident: document.getElementById('m-ident').value,
    dtid:  document.getElementById('m-dtid').value,
    ini:   document.getElementById('m-ini').value,
    fim:   tipo === 'PLANEJADO' ? document.getElementById('m-fim').value : '',
    ts:    Date.now(),
  };
  if ((rec.stat || '').toUpperCase().includes('CONC')) rec.tsFim = Date.now();
  if (hotelInfo().frota) {
    rec.abLitros = document.getElementById('m-litros').value;
    rec.abValor  = document.getElementById('m-valor').value;
    rec.abast    = document.getElementById('m-abast').value;
    if (tipo === 'EMERGENCIAL') {
      rec.num    = nextViagemNum();
      rec.codigo = genCode();
      rec.kmIni  = document.getElementById('m-kmini').value;
      rec.kmFim  = document.getElementById('m-kmfim').value;
      rec.pax    = document.getElementById('m-pax').value;
      rec.hIni   = nowHM();
      if (rec.kmFim) rec.hFim = nowHM();
    }
  }
  // fecha o modal já (feedback imediato)
  document.getElementById('ov').classList.remove('show');
  modalTarget = null;
  try {
    // grava lendo o estado fresco do servidor, para não perder o registro numa corrida do listener
    const snap = await db.ref(hotelPath() + '/data').once('value');
    const data = normalizeData(snap.val());
    while (data.length <= mi) data.push([]);
    data[mi].unshift(rec);
    await db.ref(hotelPath() + '/data').set(data);
    DATA = data; while (DATA.length < MONTHS.length) DATA.push([]);
    logAction('Criou ' + tipo, alvoRec(rec));
    activeMonth = mi;
    buildUI();
    switchTab(mi);
    const modByTipo = tipo === 'PLANEJADO' ? 'plan' : tipo === 'ASG' ? 'asg' : 'emrg';
    setModule(modByTipo);
    computeKPIs();
  } catch (e) {
    console.error('Falha ao criar registro', e);
    alert('Não foi possível salvar o registro. Verifique a conexão e tente de novo.');
  }
}

// ─── HOTEL SWITCHER ───────────────────────────────────────────────────────────
function updateHotelLabel() {
  const el  = document.getElementById('hotel-name');
  const btn = document.getElementById('hotel-name-btn');
  if (el)  el.textContent  = hotelInfo().name;
  if (btn) btn.textContent = hotelInfo().name;
  const hl = document.getElementById('hdr-logo');
  if (hl) { hl.style.display = ''; hl.onerror = () => { hl.style.display = 'none'; }; hl.src = logoSrc(); }
  document.title = `Gestão de Manutenção · ${hotelInfo().name}`;
  document.body.classList.toggle('unit-carros', !!hotelInfo().frota);
}
function buildHotelSelector() { updateHotelLabel(); }
function switchHotel(key) {
  if (key === currentHotel) return;
  if (!HOTELS.find(h => h.key === key)) return;
  clearTimeout(saveDebounce);
  currentHotel = key;
  localStorage.setItem('currentHotel', key);
  MONTHS = []; DATA = []; INVENTARIO = []; LIXEIRA = []; LOG = []; SERVICOS = [...baseServicos()]; DESTINOS = [...VIAGEM_DESTINOS]; VEICULOS = [...CARROS_VEICULOS]; GERADORES = [...CARROS_GERADORES]; ASGSERV = [...ASG_SERVICOS]; REGRAS = []; CONTAGEM_ITENS = {}; CONTAGENS = []; GOV_ITENS = {}; GOV_DADOS = {}; GOV_RECEBIDOS = [];
  activeMonth = 0;
  activeModule = 'dash';
  document.getElementById('tabs').innerHTML = '';
  document.getElementById('panels').innerHTML = '';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('loading-bar').classList.remove('hidden');
  updateHotelLabel();
  setSyncStatus('syncing', 'Carregando ' + hotelInfo().name + '…');
  listenData();
}

// ─── LINK PÚBLICO ─────────────────────────────────────────────────────────────
function getSubmitURL(tipo) {
  const base = window.location.href.replace(/[^/]*(\?.*)?$/, 'submit.html');
  const t = tipo === 'PLANEJADO' ? '&t=plan' : tipo === 'ASG' ? '&t=asg' : tipo === 'GERAL' ? '&t=geral' : '';
  return `${base}?h=${currentHotel}${t}`;
}
let linkTipo = null;
function setLinkQR(url) {
  document.getElementById('link-url').textContent = url;
  document.getElementById('qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(url)}`;
}
function openLinkPublico(tipo) {
  linkTipo = tipo;
  const t = document.getElementById('link-title');
  if (t) t.textContent = '🔗 Link Público de Lançamento';
  const d = document.getElementById('link-desc');
  if (d) d.textContent = 'Compartilhe este link ou QR Code com as equipes. Os serviços enviados aparecem em Recebidos e precisam ser confirmados pela supervisão.';
  const carRow = document.getElementById('link-car-row');
  const isViagemLink = tipo !== 'PLANEJADO' && !!hotelInfo().frota;
  if (carRow) {
    if (isViagemLink) {
      carRow.style.display = '';
      document.getElementById('link-car').innerHTML =
        `<option value="">Link geral (motorista escolhe o veículo)</option>` +
        VEICULOS.map(v => `<option value="${v}">${v}</option>`).join('');
      document.getElementById('link-car').value = '';
    } else {
      carRow.style.display = 'none';
    }
  }
  setLinkQR(getSubmitURL(tipo));
  document.getElementById('ov-link').classList.add('show');
}
function onLinkCarChange() {
  const car = document.getElementById('link-car').value;
  let url = getSubmitURL(linkTipo);
  if (car) url += '&car=' + encodeURIComponent(car);
  setLinkQR(url);
}
function closeLink() { document.getElementById('ov-link').classList.remove('show'); }
function copiarLink() {
  const url = document.getElementById('link-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    const sp = document.getElementById('sp');
    sp.classList.add('show');
    sp.querySelector(':last-child') ? null : null;
    setTimeout(() => sp.classList.remove('show'), 2000);
  }).catch(() => alert('Link: ' + url));
}
function abrirLink() { window.open(document.getElementById('link-url').textContent, '_blank'); }

// ─── CONTAGEM ─────────────────────────────────────────────────────────────────
function renderContagemView() {
  const el = document.getElementById('cont-inner');
  if (!el) return;
  const cards = CONTAGEM_SETORES.map(s => {
    const itens = contagemItensDe(s.k);
    const ativo = itens.length > 0;
    const ult = ultimaContagem(s.k);
    const sub = !ativo ? 'Em breve · setor ainda não estruturado'
      : ult ? `Última contagem: ${fmtDataHora(ult.ts)} · ${contagemTotal(ult)} peças`
            : `${itens.length} itens cadastrados · nenhuma contagem ainda`;
    return `<button class="rep-bar" ${ativo ? `onclick="openContagemSetor('${s.k}')"` : 'disabled style="opacity:.45;cursor:default"'}>
      <div class="rep-bar-t">${s.ic} ${s.l}</div>
      <div class="rep-bar-d">${sub}</div></button>`;
  }).join('');
  el.innerHTML = `
    <h2 class="modview-title">Contagem por setor</h2>
    <p class="modview-note">Contagem de itens de cada setor. Para uma nova contagem, gere o link em <b>Gestão › Contagens</b> ou clique no setor abaixo. O histórico fica guardado com data e hora.</p>
    <div class="rep-bars" style="margin-top:16px">${cards}</div>`;
}

function openContagemSetor(setor) {
  const ult = ultimaContagem(setor);
  if (ult) { verContagem(ult.id, setor); return; }
  const body = document.getElementById('contagem-body');
  const itens = contagemItensDe(setor);
  body.innerHTML = `
    <h3>${setorLabel(setor)} · Contagem</h3>
    <p class="modview-note">Ainda não há contagem registrada para este setor. São ${itens.length} itens cadastrados.</p>
    <div style="display:flex;gap:8px;margin:14px 0;flex-wrap:wrap">
      <button class="btn btn-gold btn-xs" onclick="openLinkContagem('${setor}')">🔗 Gerar link para contar</button>
    </div>`;
  document.getElementById('ov-contagem').classList.add('show');
}

function verContagem(id, setor, editando) {
  const c = CONTAGENS.find(x => x.id === id);
  if (!c) return;
  editando = !!editando;
  setor = setor || c.setor;
  const itens = contagemItensDe(setor);
  const total = contagemTotal(c);
  const linhas = itens.map((nome, idx) => {
    const q = contagemQtd(c, nome);
    const delBtn = editando ? `<button class="cont-del" title="Remover item" onclick="removeContagemItem('${setor}','${esc(c.id)}',${idx})">✕</button>` : '';
    return `<tr><td><div class="cont-item-cell">${delBtn}<span>${esc(nome)}</span></div></td><td class="cont-q"><input type="number" inputmode="numeric" min="0" step="1" class="cont-inp" data-idx="${idx}" value="${q === '' ? '' : esc(String(q))}" ${editando ? 'oninput="recalcContagemTotal()"' : 'disabled'}></td></tr>`;
  }).join('');
  const hist = CONTAGENS.filter(x => x.setor === setor).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const histList = hist.map(h => `<button class="rep-bar${h.id === c.id ? ' rep-bar-alt' : ''}" onclick="verContagem('${esc(h.id)}','${setor}')"><div class="rep-bar-t">${fmtDataHora(h.ts)}${h.por ? ' · ' + esc(h.por) : ''}</div><div class="rep-bar-d">${contagemTotal(h)} peças</div></button>`).join('');
  const ic = CONTAGEM_SETORES.find(s => s.k === setor)?.ic || '';
  const acoes = editando
    ? `<button class="btn btn-gold btn-xs" onclick="salvarContagemEdit('${esc(c.id)}','${setor}')">💾 Salvar</button>
       <button class="btn btn-ghost btn-xs" onclick="verContagem('${esc(c.id)}','${setor}',false)">✖ Cancelar</button>
       <button class="btn btn-ghost btn-xs" onclick="addContagemItem('${setor}','${esc(c.id)}')">➕ Adicionar item</button>`
    : `<button class="btn btn-gold btn-xs" onclick="verContagem('${esc(c.id)}','${setor}',true)">✏ Editar</button>
       <button class="btn btn-ghost btn-xs" onclick="openLinkContagem('${setor}')">🔗 Nova contagem (link)</button>
       <button class="btn btn-ghost btn-xs" onclick="imprimirContagem('${esc(c.id)}','${setor}')">🖨 Imprimir</button>`;
  const hint = editando
    ? 'Modo edição. Corrija as quantidades, adicione ou remova itens e clique em Salvar. Cancelar descarta as mudanças.'
    : 'Contagem bloqueada. Clique em Editar para corrigir quantidades ou mexer nos itens.';
  const body = document.getElementById('contagem-body');
  body.innerHTML = `
    <h3>${ic} ${setorLabel(setor)} · Contagem${editando ? ' <span class="cont-edit-tag">editando</span>' : ''}</h3>
    <p style="font-size:11.5px;color:var(--muted)">Contagem de <b>${fmtDataHora(c.ts)}</b>${c.por ? ' · por <b>' + esc(c.por) + '</b>' : ''} · Total <b id="cont-total-live">${total}</b> peças</p>
    <p class="cont-hint">${hint}</p>
    <div style="display:flex;gap:8px;margin:12px 0;flex-wrap:wrap">${acoes}</div>
    <table class="cont-table${editando ? ' editando' : ''}"><thead><tr><th>Item</th><th class="cont-q">Qtd</th></tr></thead>
      <tbody>${linhas}</tbody></table>
    <h4 class="cont-h4">Histórico de contagens</h4>
    <div class="rep-bars">${histList}</div>`;
  document.getElementById('ov-contagem').classList.add('show');
}
function closeContagem() { document.getElementById('ov-contagem').classList.remove('show'); }

function recalcContagemTotal() {
  let t = 0;
  document.querySelectorAll('#contagem-body .cont-inp').forEach(i => { t += parseInt(i.value, 10) || 0; });
  const el = document.getElementById('cont-total-live');
  if (el) el.textContent = t;
}

// Salva as quantidades editadas de volta na contagem (leitura fresca + gravação).
async function salvarContagemEdit(id, setor) {
  const itensList = contagemItensDe(setor);
  const inputs = [...document.querySelectorAll('#contagem-body .cont-inp')];
  const novos = []; let total = 0;
  inputs.forEach(inp => {
    const nome = itensList[+inp.dataset.idx];
    if (nome == null) return;
    const v = (inp.value || '').trim();
    const n = v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0);
    novos.push({ n: nome, q: n }); total += n;
  });
  try {
    const ref = db.ref(hotelPath() + '/contagens');
    const snap = await ref.once('value');
    const arr = Array.isArray(snap.val()) ? snap.val() : [];
    const rec = arr.find(x => x && x.id === id);
    if (!rec) { alert('Esta contagem não está mais disponível.'); return; }
    rec.itens = novos; rec.total = total; rec.editadoEm = Date.now();
    await ref.set(arr);
    CONTAGENS = arr;
    logAction('Editou contagem', setorLabel(setor) + ' · ' + total + ' peças');
    verContagem(id, setor, false); // salvou: volta a bloquear
  } catch (e) { console.error(e); alert('Não foi possível salvar. Verifique a conexão e tente de novo.'); }
}

// Adiciona um novo item na lista do setor e na contagem atual.
async function addContagemItem(setor, id) {
  const nome = (prompt('Nome do novo item da ' + setorLabel(setor) + ':') || '').trim();
  if (!nome) return;
  const base = hotelPath();
  const lista = contagemItensDe(setor).slice();
  if (lista.some(n => n.toLowerCase() === nome.toLowerCase())) { alert('Esse item já existe na lista.'); return; }
  try {
    lista.push(nome);
    await db.ref(base + '/contagemItens/' + setor).set(lista);
    CONTAGEM_ITENS[setor] = lista;
    const ref = db.ref(base + '/contagens');
    const snap = await ref.once('value');
    const arr = Array.isArray(snap.val()) ? snap.val() : [];
    const rec = arr.find(x => x && x.id === id);
    if (rec) {
      if (!Array.isArray(rec.itens)) rec.itens = [];
      if (!rec.itens.some(x => x && x.n === nome)) rec.itens.push({ n: nome, q: 0 });
      await ref.set(arr);
      CONTAGENS = arr;
    }
    logAction('Adicionou item de contagem', setorLabel(setor) + ' · ' + nome);
    verContagem(id, setor, true); // segue em modo edição
  } catch (e) { console.error(e); alert('Não foi possível adicionar o item.'); }
}

// Remove um item da lista do setor e da contagem atual (com confirmação).
async function removeContagemItem(setor, id, idx) {
  const lista = contagemItensDe(setor).slice();
  const nome = lista[idx];
  if (nome == null) return;
  if (!confirm('Remover o item "' + nome + '" da lista da ' + setorLabel(setor) + '? Ele sai desta contagem e das próximas.')) return;
  try {
    const base = hotelPath();
    // 1) salva primeiro as quantidades que ja estao na tela, para nao perder edições
    const inputs = [...document.querySelectorAll('#contagem-body .cont-inp')];
    const qAtual = {};
    inputs.forEach(inp => { const nm = lista[+inp.dataset.idx]; if (nm != null) { const v = (inp.value || '').trim(); qAtual[nm] = v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0); } });
    // 2) nova lista sem o item
    const novaLista = lista.filter((_, i) => i !== idx);
    await db.ref(base + '/contagemItens/' + setor).set(novaLista);
    CONTAGEM_ITENS[setor] = novaLista;
    // 3) atualiza a contagem: mantem as quantidades da tela, sem o item removido
    const ref = db.ref(base + '/contagens');
    const snap = await ref.once('value');
    const arr = Array.isArray(snap.val()) ? snap.val() : [];
    const rec = arr.find(x => x && x.id === id);
    if (rec) {
      let total = 0;
      rec.itens = novaLista.map(nm => { const q = (nm in qAtual) ? qAtual[nm] : (contagemQtd(rec, nm) || 0); total += Number(q) || 0; return { n: nm, q: Number(q) || 0 }; });
      rec.total = total; rec.editadoEm = Date.now();
      await ref.set(arr);
      CONTAGENS = arr;
    }
    logAction('Removeu item de contagem', setorLabel(setor) + ' · ' + nome);
    verContagem(id, setor, true);
  } catch (e) { console.error(e); alert('Não foi possível remover o item.'); }
}

function imprimirContagem(id, setor) {
  const c = CONTAGENS.find(x => x.id === id);
  if (!c) return;
  setor = setor || c.setor;
  const itens = contagemItensDe(setor);
  const total = contagemTotal(c);
  const linhas = itens.map(nome => {
    const q = contagemQtd(c, nome);
    return `<tr><td>${esc(nome)}</td><td style="text-align:right">${q === '' ? '' : esc(String(q))}</td></tr>`;
  }).join('');
  const w = window.open('', '_blank');
  if (!w) { alert('Permita pop-ups para imprimir.'); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Contagem ${setorLabel(setor)}</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:28px}h1{font-size:18px;margin:0 0 2px}
    .sub{color:#555;font-size:12px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ccc;padding:5px 8px;text-align:left}th{background:#f2f2f2}
    tfoot td{font-weight:bold;background:#f7f7f7}</style></head><body>
    <h1>Contagem · ${esc(hotelInfo().name)} · ${esc(setorLabel(setor))}</h1>
    <div class="sub">${fmtDataHora(c.ts)}${c.por ? ' · ' + esc(c.por) : ''} · Total ${total} peças</div>
    <table><thead><tr><th>Item</th><th style="text-align:right">Qtd</th></tr></thead>
    <tbody>${linhas}</tbody><tfoot><tr><td>Total</td><td style="text-align:right">${total}</td></tr></tfoot></table>
    </body></html>`);
  w.document.close();
  setTimeout(() => { try { w.print(); } catch (e) {} }, 300);
}

function getContagemURL(setor) {
  const base = window.location.href.replace(/[^/]*(\?.*)?$/, 'contagem.html');
  return `${base}?h=${currentHotel}${setor ? '&s=' + setor : ''}`;
}
function openLinkContagem(setor) {
  linkTipo = null;
  const carRow = document.getElementById('link-car-row');
  if (carRow) carRow.style.display = 'none';
  const t = document.getElementById('link-title');
  if (t) t.textContent = '📋 Link de Contagem';
  const d = document.getElementById('link-desc');
  if (d) d.textContent = 'Compartilhe este link ou QR Code com a equipe. Quem abrir escolhe o setor, conta os itens e envia. O resultado aparece no módulo Contagem.';
  setLinkQR(getContagemURL(setor));
  document.getElementById('ov-contagem') && document.getElementById('ov-contagem').classList.remove('show');
  document.getElementById('ov-link').classList.add('show');
}

// ─── GOVERNANÇA (Costa do Sol) ────────────────────────────────────────────────
function renderGovernanca() {
  const el = document.getElementById('gov-inner');
  if (!el) return;
  const nav = GOV_TIPOS.map(t => `<button class="gov-nav-item${t.k === govView ? ' active' : ''}" data-gv="${t.k}" onclick="setGovView('${t.k}')"><span class="gov-nav-ic">${t.ic}</span><span class="gov-nav-lbl">${t.l}<small>${t.cad}</small></span></button>`).join('');
  el.innerHTML = `<div class="gov-wrap">
    <aside class="gov-side" id="gov-side">
      <button class="gov-side-burger" onclick="govToggleSide()" title="Abrir menu">☰</button>
      <div class="gov-side-items">${nav}</div>
    </aside>
    <div class="gov-main" id="gov-main"></div>
  </div>`;
  renderGovMain();
}
function setGovView(tipo) {
  govView = tipo;
  document.querySelectorAll('#gov-side .gov-nav-item').forEach(b => b.classList.toggle('active', b.dataset.gv === tipo));
  const s = document.getElementById('gov-side'); if (s) s.classList.remove('open');
  renderGovMain();
}
function govToggleSide() { const s = document.getElementById('gov-side'); if (s) s.classList.toggle('open'); }

function renderGovMain() {
  const tipo = govView;
  const el = document.getElementById('gov-main');
  if (!el) return;
  const t = govTipo(tipo);
  const contados = govContados(tipo), totalLocais = govLocais(tipo).length;
  const header = `<div class="gov-head">
    <div><h2 class="modview-title" style="margin:0">${t.ic} ${t.l} <span class="gov-cad">${t.cad}</span></h2>
    <p class="gov-sub">${contados} de ${totalLocais} locais contados</p></div>
    <div class="gov-head-btns">
      <button class="btn btn-ghost btn-xs" onclick="imprimirGov('${tipo}')">🖨 Imprimir</button>
    </div></div>`;
  const charts = `<div class="gov-charts">${govRecebidosCard(tipo)}${govChartItens(tipo)}</div>`;
  el.innerHTML = header + charts + renderGovLocais(tipo);
}
// Card de Recebidos (fila do link aguardando confirmação), no lugar do gráfico por bloco
function govRecebidosCard(tipo) {
  const n = govRecebidosDe(tipo).length;
  return `<button class="gov-rec-card${n ? ' tem' : ''}" onclick="openGovRecebidos('${tipo}')">
    <div class="gov-rec-hd">📥 Recebidos</div>
    <div class="gov-rec-big">${n}</div>
    <div class="gov-rec-sub">${n ? 'aguardando confirmação · clique para ver' : 'nada aguardando · o que a equipe enviar pelo link aparece aqui'}</div>
  </button>`;
}

// Grade de blocos com quartos + locais especiais
function renderGovLocais(tipo) {
  const d = GOV_DADOS[tipo] || {};
  const blocos = GOV_BLOCOS.map(b => {
    const chips = b.quartos.map(q => {
      const lk = b.k + '__' + q, rec = d[lk], cont = !!rec;
      return `<button class="gov-quarto${cont ? ' feito' : ''}" onclick="openGovLocal('${tipo}','${lk}',false)"><span class="gov-q-n">${q}</span></button>`;
    }).join('');
    const feitos = b.quartos.filter(q => d[b.k + '__' + q]).length;
    return `<div class="gov-bloco"><div class="gov-bloco-h"><b>${b.nome}</b><span>${feitos}/${b.quartos.length} quartos · ${govBlocoTotal(tipo, b.k)} peças</span></div><div class="gov-quartos">${chips}</div></div>`;
  }).join('');
  const esp = govEspeciaisDe(tipo).map(e => {
    const lk = e.k + '__geral', rec = d[lk];
    return `<button class="gov-esp${rec ? ' feito' : ''}${e.k === 'danificados' ? ' dan' : ''}" onclick="openGovLocal('${tipo}','${lk}',false)"><span class="gov-esp-ic">${e.ic}</span><span class="gov-esp-n">${e.nome}</span><span class="gov-esp-t">${rec ? govLocalTotal(rec) + ' peças' : 'não contado'}</span></button>`;
  }).join('');
  return `<h4 class="cont-h4">Locais</h4><div class="gov-blocos">${blocos}</div>${esp ? `<div class="gov-esps">${esp}</div>` : ''}`;
}

// Gráfico: total por bloco (e locais especiais)
function govChartBlocos(tipo) {
  const items = GOV_BLOCOS.map(b => ({ l: b.nome.replace('Bloco ', 'B'), v: govBlocoTotal(tipo, b.k) }));
  govEspeciaisDe(tipo).forEach(e => { const rec = govLocalRec(tipo, e.k + '__geral'); items.push({ l: e.k === 'governanca' ? 'Roup.' : 'Danif.', v: rec ? govLocalTotal(rec) : 0 }); });
  const max = Math.max(1, ...items.map(x => x.v));
  const n = items.length, slot = 68, W = Math.max(300, n * slot + 20), H = 190, pad = 30, bw = Math.min(42, slot - 24);
  const bars = items.map((it, i) => {
    const cx = 14 + i * slot + slot / 2, h = (it.v / max) * (H - pad - 26), y = H - pad - h;
    return `<rect x="${cx - bw / 2}" y="${y}" width="${bw}" height="${Math.max(1, h)}" rx="4" fill="url(#govgrad)"></rect>
      <text x="${cx}" y="${y - 6}" text-anchor="middle" class="gc-val">${it.v}</text>
      <text x="${cx}" y="${H - pad + 15}" text-anchor="middle" class="gc-lbl">${esc(it.l)}</text>`;
  }).join('');
  return `<div class="gov-card"><div class="gov-card-t">Total por bloco</div>
    <div class="gov-svg-wrap"><svg viewBox="0 0 ${W} ${H}" class="gov-svg" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="govgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ddb84e"/><stop offset="1" stop-color="#a87f2a"/></linearGradient></defs>
      <line x1="10" y1="${H - 30}" x2="${W - 6}" y2="${H - 30}" stroke="var(--border2)" stroke-width="1"/>
      ${bars}</svg></div></div>`;
}
// Gráfico: quantidade por item somando todos os locais
function govChartItens(tipo) {
  const agg = govAggItens(tipo);
  const arr = Object.keys(agg).map(n => ({ n, q: agg[n] })).filter(x => x.q > 0).sort((a, b) => b.q - a.q).slice(0, 14);
  if (!arr.length) return `<div class="gov-card"><div class="gov-card-t">Quantidades por item</div><p class="cont-hint">Nenhum local contado ainda.</p></div>`;
  const max = Math.max(1, ...arr.map(x => x.q));
  const rows = arr.map(x => `<div class="gov-delta-row"><span class="gov-delta-n">${esc(x.n)}</span><span class="gov-delta-bar"><span class="gov-delta-fill up" style="width:${x.q / max * 100}%"></span></span><span class="gov-delta-v">${x.q}</span></div>`).join('');
  return `<div class="gov-card"><div class="gov-card-t">Quantidades por item <span class="gov-card-note">todos os locais</span></div>${rows}</div>`;
}

// ── Modal de um local (bloco+quarto, rouparia ou danificados) ──
let govModal = { tipo: null, localKey: null };
function openGovLocal(tipo, localKey, editando) {
  govModal = { tipo, localKey };
  const rec = govLocalRec(tipo, localKey);
  const itens = govItensDe(tipo);
  const total = govLocalTotal(rec);
  const linhas = itens.map((nome, idx) => {
    const q = rec ? govLocalQtd(rec, nome) : '';
    const del = editando ? `<button class="cont-del" title="Remover item" onclick="removeGovItemLocal(${idx})">✕</button>` : '';
    return `<tr><td><div class="cont-item-cell">${del}<span>${esc(nome)}</span></div></td><td class="cont-q"><input type="number" inputmode="numeric" min="0" step="1" class="govloc-inp" data-idx="${idx}" value="${q === '' ? '' : esc(String(q))}" ${editando ? 'oninput="recalcGovLocalTotal()"' : 'disabled'}></td></tr>`;
  }).join('');
  const acoes = editando
    ? `<button class="btn btn-gold btn-xs" onclick="salvarGovLocal()">💾 Salvar</button>
       <button class="btn btn-ghost btn-xs" onclick="openGovLocal('${tipo}','${esc(localKey)}',false)">✖ Cancelar</button>
       <button class="btn btn-ghost btn-xs" onclick="addGovItemLocal()">➕ Adicionar item</button>`
    : `<button class="btn btn-gold btn-xs" onclick="openGovLocal('${tipo}','${esc(localKey)}',true)">✏ Editar</button>`;
  const sub = rec ? 'atualizado ' + fmtDataHora(rec.ts) + (rec.por ? ' · por ' + esc(rec.por) : '') : 'ainda não contado';
  const body = document.getElementById('govlocal-body');
  body.innerHTML = `
    <h3>${esc(govLocalLabel(localKey))}${editando ? ' <span class="cont-edit-tag">editando</span>' : ''}</h3>
    <p style="font-size:11.5px;color:var(--muted)">${govTipoLabel(tipo)} · ${sub} · Total <b id="govloc-total-live">${total}</b></p>
    ${rec && rec.obs ? `<p class="cont-hint">Obs: ${esc(rec.obs)}</p>` : ''}
    <div style="display:flex;gap:8px;margin:10px 0 12px;flex-wrap:wrap">${acoes}</div>
    <table class="cont-table${editando ? ' editando' : ''}"><thead><tr><th>Item</th><th class="cont-q">Qtd</th></tr></thead><tbody>${linhas}</tbody></table>`;
  document.getElementById('ov-govlocal').classList.add('show');
}
function closeGovLocal() { document.getElementById('ov-govlocal').classList.remove('show'); }
function recalcGovLocalTotal() {
  let t = 0;
  document.querySelectorAll('#govlocal-body .govloc-inp').forEach(i => { t += parseInt(i.value, 10) || 0; });
  const el = document.getElementById('govloc-total-live'); if (el) el.textContent = t;
}
// captura as quantidades digitadas no modal, na memória (para não perder ao adicionar/remover item)
function govLocalCapturaMemoria() {
  const { tipo, localKey } = govModal;
  const lista = govItensDe(tipo);
  const inputs = [...document.querySelectorAll('#govlocal-body .govloc-inp')];
  const cur = govLocalRec(tipo, localKey) || {};
  const itens = []; let total = 0;
  inputs.forEach(inp => { const nm = lista[+inp.dataset.idx]; if (nm != null) { const v = (inp.value || '').trim(); const q = v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0); itens.push({ n: nm, q }); total += q; } });
  if (!GOV_DADOS[tipo]) GOV_DADOS[tipo] = {};
  GOV_DADOS[tipo][localKey] = Object.assign({}, cur, { itens, total });
  return { itens, total };
}
async function salvarGovLocal() {
  const { tipo, localKey } = govModal; if (!tipo || !localKey) return;
  const lista = govItensDe(tipo);
  const inputs = [...document.querySelectorAll('#govlocal-body .govloc-inp')];
  const itens = []; let total = 0;
  inputs.forEach(inp => { const nome = lista[+inp.dataset.idx]; if (nome == null) return; const v = (inp.value || '').trim(); const q = v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0); itens.push({ n: nome, q }); total += q; });
  try {
    const cur = govLocalRec(tipo, localKey) || {};
    const rec = { itens, total, ts: Date.now(), por: cur.por || 'Supervisão' };
    if (cur.obs) rec.obs = cur.obs;
    await db.ref(hotelPath() + '/governanca/' + tipo + '/' + localKey).set(rec);
    if (!GOV_DADOS[tipo]) GOV_DADOS[tipo] = {}; GOV_DADOS[tipo][localKey] = rec;
    logAction('Editou Governança', govTipoLabel(tipo) + ' · ' + govLocalLabel(localKey) + ' · ' + total + ' peças');
    openGovLocal(tipo, localKey, false);
    renderGovMain();
  } catch (e) { console.error(e); alert('Não foi possível salvar. Verifique a conexão e tente de novo.'); }
}
async function addGovItemLocal() {
  const { tipo, localKey } = govModal;
  const nome = (prompt('Nome do novo item (' + govTipoLabel(tipo) + '):') || '').trim();
  if (!nome) return;
  const lista = govItensDe(tipo).slice();
  if (lista.some(n => n.toLowerCase() === nome.toLowerCase())) { alert('Esse item já existe na lista.'); return; }
  try {
    govLocalCapturaMemoria();               // guarda o que já foi digitado
    lista.push(nome);
    await db.ref(hotelPath() + '/governancaItens/' + tipo).set(lista); GOV_ITENS[tipo] = lista;
    const rec = GOV_DADOS[tipo][localKey]; if (rec) { if (!Array.isArray(rec.itens)) rec.itens = []; rec.itens.push({ n: nome, q: 0 }); }
    logAction('Adicionou item Governança', govTipoLabel(tipo) + ' · ' + nome);
    openGovLocal(tipo, localKey, true);
  } catch (e) { console.error(e); alert('Não foi possível adicionar o item.'); }
}
async function removeGovItemLocal(idx) {
  const { tipo, localKey } = govModal;
  const lista = govItensDe(tipo).slice(); const nome = lista[idx]; if (nome == null) return;
  if (!confirm('Remover o item "' + nome + '" da ' + govTipoLabel(tipo) + '? Ele sai de todos os locais.')) return;
  try {
    govLocalCapturaMemoria();
    const novaLista = lista.filter((_, i) => i !== idx);
    await db.ref(hotelPath() + '/governancaItens/' + tipo).set(novaLista); GOV_ITENS[tipo] = novaLista;
    const rec = GOV_DADOS[tipo][localKey]; if (rec && Array.isArray(rec.itens)) { rec.itens = rec.itens.filter(x => x && x.n !== nome); rec.total = rec.itens.reduce((s, x) => s + (Number(x.q) || 0), 0); }
    logAction('Removeu item Governança', govTipoLabel(tipo) + ' · ' + nome);
    openGovLocal(tipo, localKey, true);
  } catch (e) { console.error(e); alert('Não foi possível remover o item.'); }
}

function imprimirGov(tipo) {
  const t = govTipo(tipo);
  const itens = govItensDe(tipo); const agg = govAggItens(tipo);
  const linhasItens = itens.map(n => `<tr><td>${esc(n)}</td><td style="text-align:right">${agg[n] || 0}</td></tr>`).join('');
  const linhasBloco = GOV_BLOCOS.map(b => `<tr><td>${esc(b.nome)}</td><td style="text-align:right">${govBlocoTotal(tipo, b.k)}</td></tr>`).join('')
    + govEspeciaisDe(tipo).map(e => { const rec = govLocalRec(tipo, e.k + '__geral'); return `<tr><td>${esc(e.nome)}</td><td style="text-align:right">${rec ? govLocalTotal(rec) : 0}</td></tr>`; }).join('');
  const totalGeral = govTotalGeral(tipo);
  const w = window.open('', '_blank'); if (!w) { alert('Permita pop-ups para imprimir.'); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(t.l)} Governança</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:28px}h1{font-size:18px;margin:0 0 2px}h2{font-size:13px;margin:18px 0 6px}.sub{color:#555;font-size:12px;margin-bottom:8px}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}th,td{border:1px solid #ccc;padding:5px 8px;text-align:left}th{background:#f2f2f2}tfoot td{font-weight:bold;background:#f7f7f7}</style></head><body>
    <h1>Governança · ${esc(hotelInfo().name)} · ${esc(t.l)} (${esc(t.cad)})</h1>
    <div class="sub">Total geral ${totalGeral} peças · impresso em ${fmtDataHora(Date.now())}</div>
    <h2>Total por local</h2>
    <table><thead><tr><th>Local</th><th style="text-align:right">Peças</th></tr></thead><tbody>${linhasBloco}</tbody><tfoot><tr><td>Total geral</td><td style="text-align:right">${totalGeral}</td></tr></tfoot></table>
    <h2>Total por item (todos os locais)</h2>
    <table><thead><tr><th>Item</th><th style="text-align:right">Qtd</th></tr></thead><tbody>${linhasItens}</tbody></table>
    </body></html>`);
  w.document.close(); setTimeout(() => { try { w.print(); } catch (e) {} }, 300);
}
function getGovURL(tipo) {
  const base = window.location.href.replace(/[^/]*(\?.*)?$/, 'governanca.html');
  return `${base}?h=${currentHotel}${tipo ? '&tp=' + tipo : ''}`;
}
function openLinkGov(tipo) {
  linkTipo = null;
  const carRow = document.getElementById('link-car-row'); if (carRow) carRow.style.display = 'none';
  const t = document.getElementById('link-title'); if (t) t.textContent = '📋 Link de ' + govTipoLabel(tipo);
  const d = document.getElementById('link-desc'); if (d) d.textContent = 'Compartilhe com a equipe da governança. Quem abrir escolhe contagem ou inventário, o bloco e o quarto, conta os itens e envia.';
  setLinkQR(getGovURL(tipo));
  document.getElementById('ov-link').classList.add('show');
}

// ── Recebidos da Governança (fila do link → supervisão aceita) ──
function govRecebidoDif(r) {
  const cur = govLocalRec(r.tipo, r.localKey);
  if (!cur) return ' · local ainda sem contagem';
  const d = (r.total || 0) - govLocalTotal(cur);
  if (d === 0) return ' · igual ao atual';
  return d > 0 ? ` · +${d} vs atual` : ` · ${d} vs atual`;
}
function openGovRecebidos(tipo) {
  const recs = govRecebidosDe(tipo);
  const t = govTipo(tipo);
  const lista = recs.length ? recs.map(r => `<div class="gov-rec-item">
      <div class="gov-rec-item-top"><b>${esc(govLocalLabel(r.localKey))}</b><span>${fmtDataHora(r.ts)}${r.por ? ' · ' + esc(r.por) : ''}</span></div>
      <div class="gov-rec-item-sub">${r.total} peças${govRecebidoDif(r)}</div>
      <div class="gov-rec-item-btns">
        <button class="btn btn-gold btn-xs" onclick="aceitarGovRecebido('${tipo}','${esc(r.id)}')">✓ Aceitar</button>
        <button class="btn btn-ghost btn-xs" onclick="verGovRecebido('${tipo}','${esc(r.id)}')">👁 Ver itens</button>
        <button class="btn btn-ghost btn-xs" onclick="recusarGovRecebido('${tipo}','${esc(r.id)}')">✕ Recusar</button>
      </div></div>`).join('') : `<p class="cont-hint">Nenhum recebido aguardando em ${esc(t.l.toLowerCase())}. O que a equipe enviar pelo link aparece aqui.</p>`;
  document.getElementById('govrec-body').innerHTML = `<h3>📥 Recebidos · ${t.l}</h3>
    <p style="font-size:11.5px;color:var(--muted)">Contagens enviadas pela equipe pelo link. Aceite para atualizar o local, ou recuse.</p>
    ${lista}`;
  document.getElementById('ov-govrec').classList.add('show');
}
function closeGovRec() { document.getElementById('ov-govrec').classList.remove('show'); }
function verGovRecebido(tipo, id) {
  const r = GOV_RECEBIDOS.find(x => x && x.id === id); if (!r) return;
  const itens = govItensDe(tipo);
  const linhas = itens.map(nome => { const it = (r.itens || []).find(x => x && x.n === nome); const q = it ? it.q : ''; return `<tr><td>${esc(nome)}</td><td class="cont-q">${q === '' ? '—' : esc(String(q))}</td></tr>`; }).join('');
  document.getElementById('govrec-body').innerHTML = `<h3>${esc(govLocalLabel(r.localKey))} · recebido</h3>
    <p style="font-size:11.5px;color:var(--muted)">${fmtDataHora(r.ts)}${r.por ? ' · por ' + esc(r.por) : ''} · Total <b>${r.total}</b></p>
    <div style="display:flex;gap:8px;margin:10px 0 12px;flex-wrap:wrap">
      <button class="btn btn-gold btn-xs" onclick="aceitarGovRecebido('${tipo}','${esc(r.id)}')">✓ Aceitar</button>
      <button class="btn btn-ghost btn-xs" onclick="openGovRecebidos('${tipo}')">← Voltar</button>
      <button class="btn btn-ghost btn-xs" onclick="recusarGovRecebido('${tipo}','${esc(r.id)}')">✕ Recusar</button>
    </div>
    <table class="cont-table"><thead><tr><th>Item</th><th class="cont-q">Qtd</th></tr></thead><tbody>${linhas}</tbody></table>`;
}
async function aceitarGovRecebido(tipo, id) {
  const r = GOV_RECEBIDOS.find(x => x && x.id === id); if (!r) { openGovRecebidos(tipo); return; }
  try {
    const rec = { itens: r.itens || [], total: r.total || 0, ts: Date.now(), por: r.por || 'Equipe' };
    await db.ref(hotelPath() + '/governanca/' + tipo + '/' + r.localKey).set(rec);
    if (!GOV_DADOS[tipo]) GOV_DADOS[tipo] = {}; GOV_DADOS[tipo][r.localKey] = rec;
    const ref = db.ref(hotelPath() + '/governancaRecebidos');
    const snap = await ref.once('value'); let arr = Array.isArray(snap.val()) ? snap.val() : [];
    arr = arr.filter(x => x && x.id !== id);
    await ref.set(arr); GOV_RECEBIDOS = arr;
    logAction('Aceitou recebido Governança', govTipoLabel(tipo) + ' · ' + govLocalLabel(r.localKey) + ' · ' + rec.total + ' peças');
    renderGovMain(); openGovRecebidos(tipo);
  } catch (e) { console.error(e); alert('Não foi possível aceitar. Tente de novo.'); }
}
async function recusarGovRecebido(tipo, id) {
  const r = GOV_RECEBIDOS.find(x => x && x.id === id);
  if (!confirm('Recusar este recebido? Ele será descartado.')) return;
  try {
    const ref = db.ref(hotelPath() + '/governancaRecebidos');
    const snap = await ref.once('value'); let arr = Array.isArray(snap.val()) ? snap.val() : [];
    arr = arr.filter(x => x && x.id !== id);
    await ref.set(arr); GOV_RECEBIDOS = arr;
    if (r) logAction('Recusou recebido Governança', govTipoLabel(tipo) + ' · ' + govLocalLabel(r.localKey));
    renderGovMain(); openGovRecebidos(tipo);
  } catch (e) { console.error(e); alert('Não foi possível recusar. Tente de novo.'); }
}

// ─── CONFIRMAR PENDENTE ───────────────────────────────────────────────────────
let confPendTarget = { mi: null, gi: null };
function askConfirmPend(mi, gi) {
  confPendTarget = { mi, gi };
  const r = DATA[mi][gi];
  document.getElementById('conf-pend-info').textContent = `${r.area || '—'} · ${r.serv || '—'}`;
  const d = r.desc || '';
  document.getElementById('conf-pend-desc').textContent = d.length > 90 ? d.substring(0, 90) + '…' : d || '—';
  document.getElementById('ov-conf-pend').classList.add('show');
}
function closeConfirmPend() {
  document.getElementById('ov-conf-pend').classList.remove('show');
  confPendTarget = { mi: null, gi: null };
}
function confirmConfirmPend() {
  if (confPendTarget.mi === null) return;
  const { mi, gi } = confPendTarget;
  delete DATA[mi][gi].pendente;
  renderBothTables(mi);
  computeKPIs();
  pushToFirebase();
  closeConfirmPend();
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
function saveAll() { pushToFirebase(); }

// ─── LOG DE ALTERAÇÕES ──────────────────────────────────────────────────────────
function logOrigem() { return sessionStorage.getItem('mtnc_master') === '1' ? 'Diretoria' : hotelInfo().name; }
function saveLog() { if (!db) return; db.ref(`${hotelPath()}/log`).set(LOG.length ? LOG : null); }
function logAction(acao, alvo) {
  if (!db) return;
  LOG.unshift({ ts: Date.now(), acao: acao || '', alvo: alvo || '', origem: logOrigem() });
  if (LOG.length > 500) LOG.length = 500;
  saveLog();
}
function alvoRec(r) { return `${(r && r.area) || '—'} · ${(r && r.serv) || '—'}`; }
function openHistorico() { renderHistorico(); document.getElementById('ov-log').classList.add('show'); }
function closeHistorico() { document.getElementById('ov-log').classList.remove('show'); }
function renderHistorico() {
  const el = document.getElementById('log-list');
  if (!el) return;
  if (!LOG.length) { el.innerHTML = '<div class="modview-note" style="padding:24px;text-align:center">Sem registros ainda. As ações passam a ser registradas a partir de agora.</div>'; return; }
  el.innerHTML = LOG.map(l =>
    `<div class="log-item"><div class="log-when">${fmtDT(l.ts)}</div><div class="log-main"><span class="log-acao">${esc(l.acao)}</span> ${esc(l.alvo)}</div><div class="log-origem">${esc(l.origem)}</div></div>`
  ).join('');
}

// ─── LIXEIRA (exclusões recuperáveis por 30 dias) ───────────────────────────────
function saveLixeira() { if (!db) return; db.ref(`${hotelPath()}/lixeira`).set(LIXEIRA.length ? LIXEIRA : null); }
function trashPush(entry) {
  entry.id = genId();
  entry.excluidoEm = Date.now();
  LIXEIRA.unshift(entry);
  saveLixeira();
}
function openLixeira() {
  renderLixeira();
  document.getElementById('ov-lixeira').classList.add('show');
}
function closeLixeira() { document.getElementById('ov-lixeira').classList.remove('show'); }
function renderLixeira() {
  const el = document.getElementById('lix-list');
  if (!el) return;
  if (!LIXEIRA.length) { el.innerHTML = '<div class="modview-note" style="padding:24px;text-align:center">Lixeira vazia. Itens excluídos ficam aqui por 30 dias.</div>'; return; }
  el.innerHTML = LIXEIRA.map(x => {
    const quando = fmtDT(x.excluidoEm);
    if (x.tipo === 'mes') {
      const n = (x.data || []).length;
      return `<div class="lix-item"><div style="flex:1"><div class="lix-item-t">📅 Mês ${esc(x.mesNome)}</div><div class="lix-item-d">${n} registro(s) · excluído ${quando}</div></div><div class="lix-acts"><button class="reg-edit" onclick="restoreLixeira('${x.id}')">↩ Restaurar</button><button class="btn-cad-del" onclick="purgeLixeira('${x.id}')">✕</button></div></div>`;
    }
    const r = x.rec || {};
    const tag = x.motivo === 'rejeitado' ? 'rejeitado' : 'excluído';
    return `<div class="lix-item"><div style="flex:1"><div class="lix-item-t">${esc(r.area) || '—'} · ${esc(r.serv) || '—'}</div><div class="lix-item-d">${esc(x.mesNome) || '—'} · ${tag} ${quando}${r.desc ? ' · ' + esc(r.desc).slice(0, 60) : ''}</div></div><div class="lix-acts"><button class="reg-edit" onclick="restoreLixeira('${x.id}')">↩ Restaurar</button><button class="btn-cad-del" onclick="purgeLixeira('${x.id}')">✕</button></div></div>`;
  }).join('');
}
function restoreLixeira(id) {
  const x = LIXEIRA.find(e => e.id === id);
  if (!x) return;
  if (x.tipo === 'mes') {
    let mi = MONTHS.indexOf(x.mesNome);
    if (mi < 0) { MONTHS.push(x.mesNome); DATA.push(x.data || []); }
    else { DATA[mi] = (DATA[mi] || []).concat(x.data || []); }
  } else {
    let mi = MONTHS.indexOf(x.mesNome);
    if (mi < 0) mi = activeMonth >= 0 && MONTHS.length ? activeMonth : (MONTHS.length - 1);
    if (mi < 0) { alert('Não há mês para restaurar este registro. Crie um mês primeiro.'); return; }
    if (!Array.isArray(DATA[mi])) DATA[mi] = [];
    DATA[mi].unshift(x.rec);
  }
  logAction('Restaurou da lixeira', x.tipo === 'mes' ? ('mês ' + x.mesNome) : alvoRec(x.rec));
  LIXEIRA = LIXEIRA.filter(e => e.id !== id);
  saveLixeira();
  buildUI();
  computeKPIs();
  pushToFirebase();
  renderLixeira();
}
function purgeLixeira(id) {
  const x = LIXEIRA.find(e => e.id === id);
  if (!x) return;
  if (!confirm('Excluir definitivamente? Esta ação não pode ser desfeita.')) return;
  LIXEIRA = LIXEIRA.filter(e => e.id !== id);
  saveLixeira();
  renderLixeira();
}

function downloadBackup() {
  const payload = {
    unidade: hotelInfo().name,
    key: currentHotel,
    exportadoEm: new Date().toISOString(),
    months: MONTHS,
    data: DATA,
    inventario: INVENTARIO
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = `backup_${currentHotel}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

function exportCSV() {
  const m   = DATA[activeMonth] || [];
  const hdr = ['TIPO','PRIORIDADE','ÁREA','SERVIÇO','DESCRIÇÃO','STATUS','FUNCIONÁRIOS','DATA IDENT.','INÍCIO','FIM'];
  const csv = [hdr, ...m.map(r => [r.tipo,r.prio,r.area,r.serv,r.desc,r.stat,r.func,r.dtid,r.ini,r.fim])]
    .map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob(['﻿' + csv], {type:'text/csv;charset=utf-8;'}));
  a.download = `${MONTHS[activeMonth].replace(/\//g,'-')}.csv`;
  a.click();
}

function openPdf(preTipo) {
  const L = hotelLabels();
  const isFrota = !!hotelInfo().frota;
  document.getElementById('pdf-tipo').innerHTML =
    `<label class="pdf-chk"><input type="checkbox" value="PLANEJADO" checked> ${L.planIcon} ${L.plan}</label>` +
    `<label class="pdf-chk"><input type="checkbox" value="EMERGENCIAL" checked> ${L.emrgIcon} ${L.emrg}</label>` +
    (isFrota ? '' : `<label class="pdf-chk"><input type="checkbox" value="ASG" checked> 🧹 Serviços ASG</label>`);
  let servList;
  if (isFrota) {
    if (preTipo === 'EMERGENCIAL') servList = DESTINOS;
    else if (preTipo === 'PLANEJADO') servList = SERVICOS;
    else servList = [...new Set([...SERVICOS, ...DESTINOS])];
  } else {
    if (preTipo === 'ASG') servList = ASGSERV;
    else if (preTipo === 'PLANEJADO' || preTipo === 'EMERGENCIAL') servList = SERVICOS;
    else servList = [...new Set([...SERVICOS, ...ASGSERV])];
  }
  const grid = document.getElementById('pdf-serv');
  grid.innerHTML = servList.map(s =>
    `<label class="pdf-chk"><input type="checkbox" value="${s}" checked> ${s}</label>`
  ).join('');
  const fLbl = document.getElementById('pdf-func').previousElementSibling;
  if (fLbl) fLbl.textContent = isFrota ? 'Motorista (contém)' : 'Funcionário (contém)';
  const aLbl = document.getElementById('pdf-area').previousElementSibling;
  if (aLbl) aLbl.textContent = isFrota ? 'Carro (contém)' : 'Área (contém)';
  ['pdf-func','pdf-area'].forEach(id => document.getElementById(id).value = '');
  ['pdf-tipo','pdf-stat','pdf-prio','pdf-serv'].forEach(id => {
    document.querySelectorAll(`#${id} input`).forEach(c => c.checked = true);
  });
  if (preTipo) document.querySelectorAll('#pdf-tipo input').forEach(c => c.checked = c.value === preTipo);
  const sec = document.getElementById('pdf-tipo-section');
  const title = document.getElementById('pdf-title');
  if (preTipo) {
    if (sec) sec.style.display = 'none';
    const nome = preTipo === 'PLANEJADO' ? (isFrota ? 'Serviços' : 'Serviços Planejados')
               : preTipo === 'EMERGENCIAL' ? (isFrota ? 'Viagem' : 'Emergenciais')
               : preTipo === 'ASG' ? 'Serviços ASG' : 'Serviços';
    if (title) title.textContent = `📄 Relatório · ${nome}`;
  } else {
    if (sec) sec.style.display = '';
    if (title) title.textContent = '📄 Exportar PDF';
  }
  document.getElementById('ov-pdf').classList.add('show');
}

function closePdf() { document.getElementById('ov-pdf').classList.remove('show'); }

function pdfSetAll(groupId, val) {
  document.querySelectorAll(`#${groupId} input`).forEach(c => c.checked = val);
}

function getCheckedValues(groupId) {
  return [...document.querySelectorAll(`#${groupId} input:checked`)].map(c => c.value);
}

function canonStat(stat) {
  const u = (stat||'').toString().trim().toUpperCase();
  if (u.indexOf('CONC') !== -1) return 'CONCLUIDO';
  if (u.indexOf('DENT') !== -1) return 'INDENTIFICADO'; // pega tanto 'IDENTIFICADO' quanto o typo 'INDENTIFICADO'
  if (u.indexOf('AND')  !== -1) return 'ANDAMENTO';
  return null;
}
function canonTipo(tipo) {
  const u = (tipo||'').toString().trim().toUpperCase();
  if (u.indexOf('PLAN') !== -1) return 'PLANEJADO';
  if (u.indexOf('EMER') !== -1) return 'EMERGENCIAL';
  if (u.indexOf('ASG')  !== -1) return 'ASG';
  return null;
}
function canonPrio(prio) {
  const u = (prio||'').toString().trim().toUpperCase();
  if (u.indexOf('ALTA')  !== -1) return 'ALTA';
  if (u.indexOf('MED')   !== -1) return 'MEDIA';
  if (u.indexOf('BAIX')  !== -1) return 'BAIXA';
  return null;
}

function inDateRange(val, de, ate) {
  if (!de && !ate) return true;
  const d = pd(val);
  if (!d) return false;
  if (de) { const dDe = new Date(de + 'T00:00:00'); if (d < dDe) return false; }
  if (ate){ const dAte = new Date(ate + 'T23:59:59'); if (d > dAte) return false; }
  return true;
}

function runPdfExport() {
  const allCounts = {
    'pdf-tipo': document.querySelectorAll('#pdf-tipo input').length,
    'pdf-stat': document.querySelectorAll('#pdf-stat input').length,
    'pdf-prio': document.querySelectorAll('#pdf-prio input').length,
    'pdf-serv': document.querySelectorAll('#pdf-serv input').length,
  };
  const tiposSel = getCheckedValues('pdf-tipo');
  const statsSel = getCheckedValues('pdf-stat');
  const priosSel = getCheckedValues('pdf-prio');
  const servsSel = getCheckedValues('pdf-serv');
  const func  = (document.getElementById('pdf-func').value || '').trim().toUpperCase();
  const area  = (document.getElementById('pdf-area').value || '').trim().toUpperCase();

  if (!tiposSel.length || !statsSel.length || !priosSel.length || !servsSel.length) {
    alert('Selecione ao menos uma opção em Tipo, Status, Prioridade e Serviços.');
    return;
  }

  // "todos marcados" = sem filtro nessa dimensão (mais tolerante a dados antigos)
  const allTipos = tiposSel.length === allCounts['pdf-tipo'];
  const allStats = statsSel.length === allCounts['pdf-stat'];
  const allPrios = priosSel.length === allCounts['pdf-prio'];
  const allServs = servsSel.length === allCounts['pdf-serv'];
  const norm = v => (v||'').toString().trim().toUpperCase();

  const matches = r => {
    if (!allTipos) {
      const t = canonTipo(r.tipo);
      if (!t || !tiposSel.includes(t)) return false;
    }
    if (!allStats) {
      const s = canonStat(r.stat);
      if (!s || !statsSel.includes(s)) return false;
    }
    if (!allPrios) {
      const p = canonPrio(r.prio);
      if (!p || !priosSel.includes(p)) return false;
    }
    if (!allServs && !servsSel.includes(norm(r.serv))) return false;
    if (func && !norm(r.func).includes(func)) return false;
    if (area && !norm(r.area).includes(area)) return false;
    return true;
  };

  const panel = document.getElementById(`panel-${activeMonth}`);
  if (!panel) return;
  const hidden = [];
  panel.querySelectorAll('tbody tr[data-gi]').forEach(tr => {
    const prevDisplay = tr.style.display;
    const gi = parseInt(tr.dataset.gi);
    const r  = DATA[activeMonth][gi];
    if (!r || !matches(r)) {
      hidden.push([tr, prevDisplay]);
      tr.style.display = 'none';
    } else if (prevDisplay === 'none') {
      // estava oculto por filtro da UI — força mostrar no PDF
      hidden.push([tr, prevDisplay]);
      tr.style.display = '';
    }
  });

  // esconde seções vazias
  const secsHidden = [];
  panel.querySelectorAll('.sec-box').forEach(sec => {
    const visible = [...sec.querySelectorAll('tbody tr')].some(tr =>
      !tr.classList.contains('sep-row') && !tr.classList.contains('empty-row') && tr.style.display !== 'none'
    );
    if (!visible) {
      secsHidden.push([sec, sec.style.display]);
      sec.style.display = 'none';
    }
  });

  // troca inputs por spans para texto quebrar linha no relatório
  const swaps = [];
  panel.querySelectorAll('input.ci').forEach(inp => {
    const span = document.createElement('span');
    span.className = 'print-text';
    span.textContent = inp.type === 'date' ? fmtBR(inp.value) : (inp.value || '');
    inp.parentNode.insertBefore(span, inp);
    swaps.push(span);
  });

  // sumário executivo dos registros filtrados (não-ocultos)
  const visibles = [];
  panel.querySelectorAll('tbody tr[data-gi]').forEach(tr => {
    if (tr.style.display === 'none') return;
    const gi = parseInt(tr.dataset.gi);
    const r = DATA[activeMonth][gi];
    if (r) visibles.push(r);
  });
  const countConc  = visibles.filter(r => canonStat(r.stat) === 'CONCLUIDO').length;
  const countAnd   = visibles.filter(r => canonStat(r.stat) === 'ANDAMENTO').length;
  const countIdent = visibles.filter(r => canonStat(r.stat) === 'INDENTIFICADO').length;
  const countAlta  = visibles.filter(r => canonPrio(r.prio) === 'ALTA').length;
  const summary = document.createElement('div');
  summary.className = 'print-summary';
  summary.innerHTML = `
    <div class="print-stat"><div class="print-stat-val">${visibles.length}</div><div class="print-stat-lbl">Total</div></div>
    <div class="print-stat"><div class="print-stat-val">${countIdent}</div><div class="print-stat-lbl">Identificados</div></div>
    <div class="print-stat"><div class="print-stat-val">${countAnd}</div><div class="print-stat-lbl">Em Andamento</div></div>
    <div class="print-stat"><div class="print-stat-val">${countConc}</div><div class="print-stat-lbl">Concluídos</div></div>
    <div class="print-stat"><div class="print-stat-val">${countAlta}</div><div class="print-stat-lbl">Alta Prioridade</div></div>
  `;
  const dateEl = panel.querySelector('.print-gen-date');
  if (dateEl) dateEl.textContent = `Emitido em ${new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'})}`;
  const coverTag = panel.querySelector('.print-cover-tag');
  if (coverTag) coverTag.parentNode.insertBefore(summary, coverTag.nextSibling);
  else panel.insertBefore(summary, panel.firstChild);

  const panelsEl = document.getElementById('panels');
  const prevPanelsDisp = panelsEl.style.display;
  panelsEl.style.display = 'block';
  document.querySelectorAll('.panel').forEach((p, i) => { p.style.display = i === activeMonth ? 'flex' : 'none'; });
  const title = document.title;
  document.title = `Manutenção · ${MONTHS[activeMonth]} · ${hotelInfo().name}`;
  document.body.classList.add('printing');

  closePdf();
  setTimeout(() => {
    window.print();
    document.title = title;
    document.body.classList.remove('printing');
    panelsEl.style.display = prevPanelsDisp;
    document.querySelectorAll('.panel').forEach((p, i) => {
      p.style.display = '';
      if (i === activeMonth) p.classList.add('active'); else p.classList.remove('active');
    });
    hidden.forEach(([tr, d]) => tr.style.display = d);
    secsHidden.forEach(([sec, d]) => sec.style.display = d);
    swaps.forEach(s => s.remove());
    summary.remove();
  }, 200);
}

// ─── PENDENTES PANEL ──────────────────────────────────────────────────────────
function togglePendentesPanel() {
  const panel = document.getElementById('pendentes-panel');
  if (panel.classList.contains('open')) closePendentesPanel();
  else openPendentesPanel();
}

function openPendentesPanel() {
  renderPendentesPanel();
  document.getElementById('pendentes-panel').classList.add('open');
  document.getElementById('pend-overlay').classList.add('show');
}

function closePendentesPanel() {
  document.getElementById('pendentes-panel').classList.remove('open');
  document.getElementById('pend-overlay').classList.remove('show');
}

function renderPendentesPanel() {
  const list = document.getElementById('pend-list');
  // Dedup por id: o mesmo recebido pode ter cópias em vários meses (transferência antiga);
  // mostra uma vez só, preferindo o mês mais recente.
  const byId = {};
  DATA.forEach((month, mi) => {
    (month || []).forEach((r, gi) => {
      if (!r.pendente) return;
      const key = r.id || (mi + '-' + gi);
      if (!byId[key] || mi >= byId[key].mi) byId[key] = { mi, gi, r };
    });
  });
  const allPend = Object.values(byId);

  const hdrCnt = document.getElementById('pend-hdr-cnt');
  if (hdrCnt) hdrCnt.textContent = allPend.length;

  if (!allPend.length) {
    list.innerHTML = `<div class="pend-empty">
      <div class="pend-empty-icon">📭</div>
      <div class="pend-empty-txt">Nenhum serviço pendente</div>
      <div class="pend-empty-sub">Os serviços enviados pelo link público aparecerão aqui para confirmação.</div>
    </div>`;
    return;
  }

  list.innerHTML = '';
  allPend.forEach(({ mi, gi, r }) => {
    const card = document.createElement('div');
    card.className = 'pend-item';
    card.id = `pend-item-${mi}-${gi}`;
    card.innerHTML = `
      <div class="pend-item-top">
        <div>
          <div class="pend-item-area">${esc(r.area) || '—'}</div>
          <div class="pend-item-month">Mês: ${esc(MONTHS[mi]) || '—'}</div>
        </div>
        <span class="prio ${prioClass(r.prio || 'MEDIA')}">${prioLabel(r.prio || 'MEDIA')}</span>
      </div>
      <div class="pend-item-meta">
        ${r.setor ? `<span class="pend-setor">🏷 ${esc(r.setor)}</span>` : ''}
        ${r.confMant ? `<span class="pend-conf">✓ Manutentor concluiu · conferir</span>` : ''}
        <span class="st ${stClass(r.stat)}">${stLabel(r.stat)}</span>
        <span class="sv ${svClass(r.serv)}">${esc(r.serv) || '—'}</span>
        ${r.ident ? `<span style="font-size:10.5px;color:var(--muted)">🔎 Identificado por ${esc(r.ident)}</span>` : ''}
        ${r.func ? `<span style="font-size:10.5px;color:var(--muted)">👤 Responsável ${esc(r.func)}</span>` : ''}
        ${r.dtid ? `<span style="font-size:10.5px;color:var(--muted)">📅 ${esc(r.dtid)}</span>` : ''}
        ${r.codigo ? `<span style="font-size:10.5px;color:var(--gold2);font-weight:600">🔑 Código ${esc(r.codigo)}</span>` : ''}
      </div>
      ${r.desc ? `<div class="pend-item-desc">${esc(r.desc)}</div>` : ''}
      ${(r.foto && /^https:\/\//.test(r.foto)) ? `<a href="${esc(r.foto)}" target="_blank" rel="noopener"><img class="pend-foto" src="${esc(r.foto)}" alt="foto"></a>` : ''}
      <div class="pend-item-actions">
        <button class="pend-btn-confirm" onclick="openAcceptPend('${esc(r.id)}')">✓ Aceitar</button>
        <button class="pend-btn-reject" onclick="rejectFromPanel('${esc(r.id)}')">✕ Rejeitar</button>
      </div>`;
    list.appendChild(card);
  });
}

function confirmFromPanel(mi, gi) {
  const item = document.getElementById(`pend-item-${mi}-${gi}`);
  if (item) item.classList.add('removing');
  delete DATA[mi][gi].pendente;
  renderBothTables(mi);
  computeKPIs();
  pushToFirebase();
  setTimeout(() => renderPendentesPanel(), 220);
}

let acceptTarget = { id: null };
// Localiza o recebido pendente pelo ID (robusto a mudança de posição na lista).
function findPendById(id) {
  let found = null;
  DATA.forEach((m, mi) => { if (!Array.isArray(m)) return; m.forEach((r, gi) => { if (r && r.id === id && r.pendente) { if (!found || mi >= found.mi) found = { mi, gi, r }; } }); });
  return found;
}
// Normaliza o array de dados vindo do servidor (garante linhas de mês como arrays).
function normalizeData(val) {
  const data = Array.isArray(val) ? val : [];
  return data.map(m => (Array.isArray(m) ? m : []));
}
function openAcceptPend(id) {
  const f = findPendById(id);
  if (!f) return;
  acceptTarget = { id };
  const r = f.r;
  const L = hotelLabels();
  document.getElementById('accept-info').textContent = `${r.setor ? r.setor + ' · ' : ''}${r.area || '—'} · ${r.serv || '—'}`;
  document.getElementById('accept-desc').textContent = r.desc || '—';
  const isFrota = !!hotelInfo().frota;
  const btns = [
    { t: 'PLANEJADO', lbl: `${L.planIcon} ${L.plan}` },
    { t: 'EMERGENCIAL', lbl: `${L.emrgIcon} ${L.emrg}` },
  ];
  if (!isFrota) btns.push({ t: 'ASG', lbl: '🧹 Serviços ASG' });
  // Passa o ID direto no clique: não depende de nenhum estado guardado sobreviver ao tempo do modal.
  document.getElementById('accept-opts').innerHTML = btns.map(b =>
    `<button class="btn btn-gold btn-xs" style="flex:1;min-width:120px" onclick="acceptPendAs('${b.t}','${esc(id)}')">${b.lbl}</button>`
  ).join('');
  document.getElementById('ov-accept').classList.add('show');
}
function closeAccept() { document.getElementById('ov-accept').classList.remove('show'); acceptTarget = { id: null }; }
// Aceite robusto: lê os dados frescos do servidor, altera pelo ID e regrava só o nó data.
async function acceptPendAs(tipo, id) {
  id = id || acceptTarget.id;
  closeAccept();
  if (!id) return;
  try {
    const snap = await db.ref(hotelPath() + '/data').once('value');
    const data = normalizeData(snap.val());
    let target = null; // cópia pendente do mês mais recente
    data.forEach((m, mi) => m.forEach(r => { if (r && r.id === id && r.pendente) { if (!target || mi >= target.mi) target = { mi, r }; } }));
    if (!target) { alert('Este recebido não está mais disponível. Ele pode já ter sido aceito ou recusado.'); renderPendentesPanel(); return; }
    const r = target.r;
    // Viagem da frota ainda em aberto (sem KM final): avisa e mantém em andamento ao aceitar.
    const viagemAberta = !!hotelInfo().frota && tipo === 'EMERGENCIAL' && !(r.kmFim === 0 || r.kmFim);
    if (viagemAberta) {
      const info = 'Viagem ' + (r.num ? pad3(r.num) : '') + (r.codigo ? ' · Código ' + r.codigo : '');
      const ok = confirm('Esta corrida ainda está em aberto, sem KM final.\n' + info + '\n\nDeseja mesmo recebê-la? Ela vai continuar em aberto até o motorista finalizar pelo link.');
      if (!ok) { renderPendentesPanel(); return; }
    }
    r.tipo = tipo;
    // Emergencial e ASG entram já como Concluído ao serem aceitos; Planejado fica Identificado.
    if (viagemAberta) { r.stat = 'ANDAMENTO'; }
    else if (tipo === 'EMERGENCIAL' || tipo === 'ASG') { r.stat = 'CONCLUIDO'; r.tsFim = Date.now(); delete r.confMant; }
    else if (!r.stat || !(r.stat || '').toUpperCase().match(/CONC|AND|DENT/)) r.stat = 'INDENTIFICADO';
    if (!r.ts) r.ts = Date.now();
    delete r.pendente;
    delete r.setor;
    // remove cópias duplicadas ainda pendentes com o mesmo id (em qualquer mês)
    data.forEach(m => { for (let i = m.length - 1; i >= 0; i--) { if (m[i] && m[i] !== r && m[i].id === id && m[i].pendente) m.splice(i, 1); } });
    await db.ref(hotelPath() + '/data').set(data);
    // sincroniza a memória local com o que acabou de ser gravado
    DATA = data; while (DATA.length < MONTHS.length) DATA.push([]);
    logAction('Aceitou recebido → ' + tipo, alvoRec(r));
    activeMonth = target.mi;
    buildUI();
    switchTab(target.mi);
    const modByTipo = tipo === 'PLANEJADO' ? 'plan' : tipo === 'ASG' ? 'asg' : 'emrg';
    setModule(modByTipo);
    renderPendentesPanel();
    computeKPIs();
  } catch (e) {
    console.error('Falha ao aceitar recebido', e);
    alert('Não foi possível salvar o aceite. Verifique a conexão e tente de novo.');
  }
}

// Rejeição robusta: lê os dados frescos do servidor, remove pelo ID e regrava.
async function rejectFromPanel(id) {
  if (!id) return;
  try {
    const snap = await db.ref(hotelPath() + '/data').once('value');
    const data = normalizeData(snap.val());
    let alvo = null;
    data.forEach((m, mi) => m.forEach(r => { if (r && r.id === id && r.pendente && !alvo) alvo = { mi, r }; }));
    if (alvo) {
      trashPush({ tipo: 'registro', mesNome: MONTHS[alvo.mi] || '', rec: JSON.parse(JSON.stringify(alvo.r)), motivo: 'rejeitado' });
      logAction('Rejeitou recebido', alvoRec(alvo.r));
    }
    // remove o recebido e todas as cópias pendentes com o mesmo id
    data.forEach(m => { for (let i = m.length - 1; i >= 0; i--) { if (m[i] && m[i].id === id && m[i].pendente) m.splice(i, 1); } });
    await db.ref(hotelPath() + '/data').set(data);
    DATA = data; while (DATA.length < MONTHS.length) DATA.push([]);
    buildUI();
    computeKPIs();
    renderPendentesPanel();
  } catch (e) {
    console.error('Falha ao rejeitar recebido', e);
    alert('Não foi possível recusar o recebido. Tente de novo.');
  }
}

function updatePendentesCount() {
  const ids = new Set();
  DATA.forEach((m, mi) => (m || []).forEach((r, gi) => { if (r.pendente) ids.add(r.id || (mi + '-' + gi)); }));
  const total = ids.size;
  const badge = document.getElementById('pend-count-badge');
  const btn   = document.getElementById('btn-pendentes');
  if (badge) { badge.textContent = total; badge.classList.toggle('show', total > 0); }
  if (btn)   btn.classList.toggle('has-pending', total > 0);
  const hdrCnt = document.getElementById('pend-hdr-cnt');
  if (hdrCnt) hdrCnt.textContent = total;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function buildLanding() {
  const grid = document.getElementById('lp-grid');
  if (!grid) return;
  const lista = activeProfile ? HOTELS.filter(h => (activeProfile.unidades || []).includes(h.key)) : HOTELS;
  grid.innerHTML = lista.map(h =>
    `<div class="lp-card${h.key === currentHotel ? ' active' : ''}" onclick="pickHotel('${h.key}')">
       <div class="lp-card-icon"><img class="lp-logo-img" src="logos/${h.key}.png" alt="" onerror="this.remove()"><span class="lp-emoji">${h.icon}</span></div>
       <div class="lp-card-name">${h.name}</div>
       <div class="lp-card-tag">${h.tag}</div>
     </div>`
  ).join('');
}

function pickHotel(key) {
  if (!HOTELS.find(h => h.key === key)) return;
  currentHotel = key;
  localStorage.setItem('currentHotel', key);
  ensureAccess(currentHotel).then(ok => {
    if (!ok) return;
    activeModule = 'dash';
    document.getElementById('landing').classList.add('hidden');
    buildHotelSelector();
    initFirebase(FIREBASE_CFG);
  });
}

// ─── CONTROLE DE ACESSO (PIN) ───────────────────────────────────────────────────
let pinState = null;

const APP_ACCOUNT = { email: 'sistema@meridiana.app', pass: 'Adri@no3.' };
function ensureApp() {
  if (firebase.apps.length === 0) firebase.initializeApp(FIREBASE_CFG);
  db = firebase.database();
  if (!authReady && firebase.auth) {
    // App entra com a conta técnica (dá acesso às configs protegidas);
    // plano B: se falhar por qualquer motivo, ainda conecta anônimo para não travar.
    authReady = firebase.auth().signInWithEmailAndPassword(APP_ACCOUNT.email, APP_ACCOUNT.pass)
      .catch(e => {
        console.error('Falha no login da conta do sistema, tentando anônimo:', e);
        return firebase.auth().signInAnonymously().catch(err => console.error('Falha no login anônimo:', err));
      });
  }
  return db;
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function unlockedThisSession(key) {
  return sessionStorage.getItem('mtnc_master') === '1'
      || sessionStorage.getItem('mtnc_unlocked_' + key) === '1'
      || !!(activeProfile && (activeProfile.unidades || []).includes(key));
}

async function ensureAccess(key) {
  if (unlockedThisSession(key)) return true;
  ensureApp();
  if (authReady) await authReady;
  if (firebase.auth && !firebase.auth().currentUser) {
    alert('Não foi possível autenticar no Firebase.\n\nProvavelmente o login anônimo não está ativado.\n\nNo Console do Firebase: Authentication → Sign-in method → Anônimo → Ativar. Depois recarregue a página.');
    return false;
  }
  let masterHash = null, unitHash = null;
  try {
    const [ms, us] = await Promise.all([
      db.ref('config/masterPin').once('value'),
      db.ref('config/hotelPins/' + key).once('value'),
    ]);
    masterHash = ms.val();
    unitHash   = us.val();
  } catch (e) { console.error(e); }
  return new Promise(resolve => openPinScreen({ key, masterHash, unitHash, resolve }));
}

function openPinScreen(st) {
  st.recover = false;
  if (!st.masterHash)      st.mode = 'createMaster';
  else if (st.unitHash)    st.mode = 'unlockUnit';
  else                     st.mode = 'createUnit';
  pinState = st;
  document.getElementById('pin-screen').classList.add('show');
  renderPinScreen();
}

function renderPinScreen() {
  const st  = pinState;
  const sub = document.getElementById('pin-sub');
  const p1  = document.getElementById('pin-1');
  const p2  = document.getElementById('pin-2');
  const btn = document.getElementById('pin-btn');
  const alt = document.getElementById('pin-alt');
  p1.value = ''; p2.value = '';
  document.getElementById('pin-err').textContent = '';
  if (st.recover) {
    sub.textContent = 'Recuperação de acesso · senha master (admin)';
    p1.placeholder = 'Senha master';
    p2.style.display = 'none';
    btn.textContent = 'Entrar como admin';
    alt.style.display = ''; alt.textContent = '← Voltar';
  } else if (st.mode === 'createMaster') {
    sub.textContent = 'Configuração inicial: defina a SENHA MASTER (admin)';
    p1.placeholder = 'Senha master';
    p2.style.display = ''; p2.placeholder = 'Confirmar senha master';
    btn.textContent = 'Criar senha master';
    alt.style.display = 'none';
  } else if (st.mode === 'createUnit') {
    sub.textContent = `Defina a senha da unidade ${hotelInfo().name}`;
    p1.placeholder = 'Nova senha da unidade';
    p2.style.display = ''; p2.placeholder = 'Confirmar senha';
    btn.textContent = 'Criar senha';
    alt.style.display = ''; alt.textContent = 'Entrar como admin (senha master)';
  } else {
    sub.textContent = `Senha da unidade ${hotelInfo().name}`;
    p1.placeholder = 'Senha da unidade';
    p2.style.display = 'none';
    btn.textContent = 'Entrar';
    alt.style.display = ''; alt.textContent = 'Esqueci minha senha';
  }
  setTimeout(() => p1.focus(), 60);
}

function pinToggleRecover() {
  if (!pinState || pinState.mode === 'createMaster') return;
  pinState.recover = !pinState.recover;
  renderPinScreen();
}

async function submitPin() {
  const v1  = document.getElementById('pin-1').value.trim();
  const err = document.getElementById('pin-err');
  const st  = pinState;
  if (v1.length < 4) { err.textContent = 'A senha deve ter ao menos 4 dígitos.'; return; }
  const hash = await sha256(v1);

  if (st.recover) {
    if (hash === st.masterHash) { sessionStorage.setItem('mtnc_master', '1'); finishUnlock(true); }
    else { err.textContent = 'Senha master incorreta.'; document.getElementById('pin-1').value = ''; document.getElementById('pin-1').focus(); }
    return;
  }

  if (st.mode === 'createMaster') {
    const v2 = document.getElementById('pin-2').value.trim();
    if (v1 !== v2) { err.textContent = 'As senhas não conferem.'; return; }
    await db.ref('config/masterPin').set(hash);
    sessionStorage.setItem('mtnc_master', '1');
    finishUnlock(true);
    return;
  }

  if (st.mode === 'createUnit') {
    const v2 = document.getElementById('pin-2').value.trim();
    if (v1 !== v2) { err.textContent = 'As senhas não conferem.'; return; }
    await db.ref('config/hotelPins/' + st.key).set(hash);
    sessionStorage.setItem('mtnc_unlocked_' + st.key, '1');
    finishUnlock(true);
    return;
  }

  if (hash === st.unitHash) { sessionStorage.setItem('mtnc_unlocked_' + st.key, '1'); finishUnlock(true); return; }
  if (hash === st.masterHash) { sessionStorage.setItem('mtnc_master', '1'); finishUnlock(true); return; }
  err.textContent = 'Senha da unidade incorreta. Use "Esqueci minha senha" para entrar como admin.';
  document.getElementById('pin-1').value = '';
  document.getElementById('pin-1').focus();
}

function finishUnlock(ok) {
  document.getElementById('pin-screen').classList.remove('show');
  const r = pinState ? pinState.resolve : null;
  pinState = null;
  if (r) r(ok);
}

function pinCancel() { finishUnlock(false); }

function lockApp() {
  Object.keys(sessionStorage).forEach(k => { if (k.indexOf('mtnc_') === 0) sessionStorage.removeItem(k); });
  backToLanding();
}

// ─── ADMIN / SENHAS ─────────────────────────────────────────────────────────────
function openAdmin() {
  ['adm-unit-master','adm-unit-new','adm-unit-confirm','adm-mst-cur','adm-mst-new','adm-mst-confirm'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('adm-unit-name').textContent = hotelInfo().name;
  admMsg('', '');
  document.getElementById('ov-admin').classList.add('show');
}
function closeAdmin() { document.getElementById('ov-admin').classList.remove('show'); }
function admMsg(text, type) {
  const el = document.getElementById('adm-msg');
  el.textContent = text;
  el.className = 'adm-msg' + (text ? ' show ' + type : '');
}

async function adminChangeUnitPin() {
  const master = document.getElementById('adm-unit-master').value.trim();
  const np     = document.getElementById('adm-unit-new').value.trim();
  const nc     = document.getElementById('adm-unit-confirm').value.trim();
  ensureApp();
  const ms = await db.ref('config/masterPin').once('value');
  if (!ms.val()) { admMsg('Senha master ainda não configurada.', 'err'); return; }
  if (await sha256(master) !== ms.val()) { admMsg('Senha master incorreta.', 'err'); return; }
  if (np.length < 4) { admMsg('O PIN deve ter ao menos 4 dígitos.', 'err'); return; }
  if (np !== nc) { admMsg('Os PINs não conferem.', 'err'); return; }
  await db.ref('config/hotelPins/' + currentHotel).set(await sha256(np));
  sessionStorage.setItem('mtnc_unlocked_' + currentHotel, '1');
  admMsg(`PIN da unidade ${hotelInfo().name} atualizado com sucesso.`, 'ok');
  ['adm-unit-master','adm-unit-new','adm-unit-confirm'].forEach(id => document.getElementById(id).value = '');
}

async function adminChangeMaster() {
  const cur = document.getElementById('adm-mst-cur').value.trim();
  const np  = document.getElementById('adm-mst-new').value.trim();
  const nc  = document.getElementById('adm-mst-confirm').value.trim();
  ensureApp();
  const ms = await db.ref('config/masterPin').once('value');
  if (!ms.val()) { admMsg('Senha master ainda não configurada.', 'err'); return; }
  if (await sha256(cur) !== ms.val()) { admMsg('Senha master atual incorreta.', 'err'); return; }
  if (np.length < 4) { admMsg('A nova senha deve ter ao menos 4 dígitos.', 'err'); return; }
  if (np !== nc) { admMsg('As senhas não conferem.', 'err'); return; }
  await db.ref('config/masterPin').set(await sha256(np));
  admMsg('Senha master atualizada com sucesso.', 'ok');
  ['adm-mst-cur','adm-mst-new','adm-mst-confirm'].forEach(id => document.getElementById(id).value = '');
}

// ─── LOGIN POR CÓDIGO (primeira tela) ───────────────────────────────────────────
const LOGIN_MAX = 3, LOGIN_LOCK_MS = 15 * 60000;
function loginLockRemaining() {
  const until = parseInt(localStorage.getItem('mtnc_login_lock') || '0');
  const rem = until - Date.now();
  return rem > 0 ? rem : 0;
}
function applyLoginLock() {
  const inp = document.getElementById('login-code');
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('login-err');
  const rem = loginLockRemaining();
  if (rem > 0) {
    const min = Math.ceil(rem / 60000);
    if (inp) inp.disabled = true;
    if (btn) btn.disabled = true;
    err.textContent = `Muitas tentativas. Acesso bloqueado. Contate a diretoria (libera em ${min} min).`;
    return true;
  }
  if (inp) inp.disabled = false;
  if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
  return false;
}
function showLogin() {
  const l = document.getElementById('login-screen');
  if (!l) return;
  const inp = document.getElementById('login-code');
  if (inp) inp.value = '';
  ['login-user', 'login-pass', 'login-nova', 'login-nova2'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('login-err').textContent = '';
  const pe = document.getElementById('login-perfil-err'); if (pe) pe.textContent = '';
  profileTrocar = null;
  setLoginMode('code');
  l.classList.add('show');
  if (!applyLoginLock()) setTimeout(() => { if (inp) inp.focus(); }, 80);
}
function hideLogin() {
  const l = document.getElementById('login-screen');
  if (l) l.classList.remove('show');
}
function showUnitWelcome(key) {
  const w = document.getElementById('unit-welcome');
  if (!w) return;
  const img = document.getElementById('uw-logo');
  const nm  = document.getElementById('uw-name');
  const info = HOTELS.find(h => h.key === key) || {};
  if (nm) nm.textContent = info.name || '';
  if (img) { img.style.display = ''; img.onerror = () => { img.style.display = 'none'; }; img.src = logoSrc(key); }
  w.classList.add('show');
  setTimeout(() => {
    w.classList.add('fade');
    setTimeout(() => { w.classList.remove('show'); w.classList.remove('fade'); }, 450);
  }, 1300);
}
let profileTrocar = null; // { pid, mp } perfil que precisa definir a senha no 1o acesso
function setLoginMode(mode) {
  const views = { code: 'login-view-code', perfil: 'login-view-perfil', trocar: 'login-view-trocar' };
  Object.values(views).forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
  const target = document.getElementById(views[mode] || views.code); if (target) target.style.display = '';
  ['login-err', 'login-perfil-err', 'login-trocar-err'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = ''; });
  const focusId = mode === 'perfil' ? 'login-user' : mode === 'trocar' ? 'login-nova' : 'login-code';
  setTimeout(() => { const e = document.getElementById(focusId); if (e) e.focus(); }, 50);
}
async function submitTrocarSenha() {
  const n1 = (document.getElementById('login-nova').value || '').trim();
  const n2 = (document.getElementById('login-nova2').value || '').trim();
  const err = document.getElementById('login-trocar-err');
  if (n1.length < 4) { err.textContent = 'A senha deve ter ao menos 4 caracteres.'; return; }
  if (n1 !== n2) { err.textContent = 'As senhas não conferem.'; return; }
  if (!profileTrocar) { setLoginMode('perfil'); return; }
  const btn = document.getElementById('login-trocar-btn'); btn.disabled = true; btn.textContent = 'Salvando…';
  try {
    ensureApp(); if (authReady) await authReady;
    const hash = await sha256(n1);
    await db.ref('config/perfis/' + profileTrocar.pid).update({ codigo: hash, trocarSenha: false });
    const mp = Object.assign({}, profileTrocar.mp, { codigo: hash, trocarSenha: false });
    profileTrocar = null;
    entrarComPerfil(mp);
  } catch (e) { console.error(e); err.textContent = 'Não foi possível salvar. Tente de novo.'; }
  finally { btn.disabled = false; btn.textContent = 'Salvar e entrar'; }
}
// Entra com um perfil já validado (uma unidade → direto; várias → seleção filtrada).
function entrarComPerfil(mp) {
  const unidades = (mp.unidades || []).filter(k => HOTELS.find(h => h.key === k));
  if (!unidades.length) return { erro: 'Este perfil não tem unidade liberada. Fale com a diretoria.' };
  localStorage.removeItem('mtnc_login_fails'); localStorage.removeItem('mtnc_login_lock');
  activeProfile = { nome: mp.nome || 'Perfil', unidades, modulos: mp.modulos || {} };
  sessionStorage.setItem('mtnc_profile', JSON.stringify(activeProfile));
  if (unidades.length === 1) {
    const key = unidades[0];
    currentHotel = key; localStorage.setItem('currentHotel', key);
    activeModule = (modulosLiberados(key) || ['dash'])[0] || 'dash';
    hideLogin();
    document.getElementById('landing').classList.add('hidden');
    showUnitWelcome(key);
    buildHotelSelector();
    initFirebase(FIREBASE_CFG);
  } else {
    hideLogin();
    buildLanding();
    document.getElementById('landing').classList.remove('hidden');
  }
  return { ok: true };
}
async function submitProfileLogin() {
  const uinp = document.getElementById('login-user');
  const pinp = document.getElementById('login-pass');
  const err = document.getElementById('login-perfil-err');
  const btn = document.getElementById('login-perfil-btn');
  const user = (uinp.value || '').trim();
  const pass = (pinp.value || '').trim();
  if (!user || !pass) { err.textContent = 'Informe usuário e senha.'; return; }
  if (loginLockRemaining() > 0) { applyLoginLock(); return; }
  err.textContent = '';
  btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    ensureApp();
    if (authReady) await authReady;
    if (firebase.auth && !firebase.auth().currentUser) { err.textContent = 'Não foi possível autenticar. Tente novamente.'; return; }
    const hash = await sha256(pass);
    const perfis = (await db.ref('config/perfis').once('value')).val() || {};
    let mp = null, mpid = null;
    for (const pid in perfis) {
      const p = perfis[pid];
      if (p && p.ativo !== false && (p.nome || '').trim().toLowerCase() === user.toLowerCase() && p.codigo === hash) { mp = p; mpid = pid; break; }
    }
    if (mp) {
      localStorage.removeItem('mtnc_login_fails'); localStorage.removeItem('mtnc_login_lock');
      // Primeiro acesso: senha provisória → obriga a definir a própria senha.
      if (mp.trocarSenha === true) {
        profileTrocar = { pid: mpid, mp };
        pinp.value = '';
        setLoginMode('trocar');
        return;
      }
      const r = entrarComPerfil(mp);
      if (r.erro) { err.textContent = r.erro; pinp.value = ''; }
      return;
    }
    const fails = (parseInt(localStorage.getItem('mtnc_login_fails') || '0') + 1);
    localStorage.setItem('mtnc_login_fails', String(fails));
    pinp.value = '';
    if (fails >= LOGIN_MAX) {
      localStorage.setItem('mtnc_login_lock', String(Date.now() + LOGIN_LOCK_MS));
      localStorage.removeItem('mtnc_login_fails');
      applyLoginLock();
    } else {
      err.textContent = `Usuário ou senha incorretos. Tentativa ${fails} de ${LOGIN_MAX}.`;
      pinp.focus();
    }
  } catch (e) {
    console.error(e);
    err.textContent = 'Erro ao validar. Tente novamente.';
  } finally {
    btn.textContent = 'Entrar';
    if (loginLockRemaining() > 0) applyLoginLock(); else btn.disabled = false;
  }
}
async function submitLoginCode() {
  const inp = document.getElementById('login-code');
  const err = document.getElementById('login-err');
  const btn = document.getElementById('login-btn');
  const code = (inp.value || '').trim();
  if (!code) return;
  if (loginLockRemaining() > 0) { applyLoginLock(); return; }
  err.textContent = '';
  btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    ensureApp();
    if (authReady) await authReady;
    if (firebase.auth && !firebase.auth().currentUser) {
      err.textContent = 'Não foi possível autenticar. Tente novamente.';
      return;
    }
    const hash = await sha256(code);
    const ms = await db.ref('config/masterPin').once('value');
    const masterHash = ms.val();
    // Sem master configurada ainda: cai na seleção de unidade (configuração inicial).
    if (!masterHash) {
      hideLogin();
      buildLanding();
      document.getElementById('landing').classList.remove('hidden');
      return;
    }
    // Senha master → todas as unidades (como hoje).
    if (hash === masterHash) {
      localStorage.removeItem('mtnc_login_fails'); localStorage.removeItem('mtnc_login_lock');
      sessionStorage.setItem('mtnc_master', '1');
      hideLogin();
      buildLanding();
      document.getElementById('landing').classList.remove('hidden');
      return;
    }
    // Código de unidade → entra direto só naquela unidade.
    const pinsSnap = await db.ref('config/hotelPins').once('value');
    const pins = pinsSnap.val() || {};
    let foundKey = null;
    for (const h of HOTELS) { if (pins[h.key] && pins[h.key] === hash) { foundKey = h.key; break; } }
    if (foundKey) {
      localStorage.removeItem('mtnc_login_fails'); localStorage.removeItem('mtnc_login_lock');
      sessionStorage.setItem('mtnc_unlocked_' + foundKey, '1');
      currentHotel = foundKey;
      localStorage.setItem('currentHotel', foundKey);
      activeModule = 'dash';
      hideLogin();
      document.getElementById('landing').classList.add('hidden');
      showUnitWelcome(foundKey);
      buildHotelSelector();
      initFirebase(FIREBASE_CFG);
      return;
    }
    const fails = (parseInt(localStorage.getItem('mtnc_login_fails') || '0') + 1);
    localStorage.setItem('mtnc_login_fails', String(fails));
    inp.value = '';
    if (fails >= LOGIN_MAX) {
      localStorage.setItem('mtnc_login_lock', String(Date.now() + LOGIN_LOCK_MS));
      localStorage.removeItem('mtnc_login_fails');
      applyLoginLock();
    } else {
      err.textContent = `Código incorreto. Tentativa ${fails} de ${LOGIN_MAX}.`;
      inp.focus();
    }
  } catch (e) {
    console.error(e);
    err.textContent = 'Erro ao validar. Tente novamente.';
  } finally {
    btn.textContent = 'Entrar';
    if (loginLockRemaining() > 0) applyLoginLock(); else btn.disabled = false;
  }
}

function backToLanding() {
  clearTimeout(saveDebounce);
  if (activeRef) { try { activeRef.off(); } catch(e){} activeRef = null; }
  MONTHS = []; DATA = []; SERVICOS = [...DEFAULT_SERVICOS];
  activeMonth = 0;
  document.getElementById('tabs').innerHTML = '';
  document.getElementById('panels').innerHTML = '';
  document.getElementById('empty-state').style.display = 'none';
  // "Trocar unidade" sempre volta para o login. A lista com todas as unidades
  // só reaparece ao digitar a senha master. Limpa a sessão para exigir novo acesso.
  activeProfile = null;
  Object.keys(sessionStorage).forEach(k => { if (k.indexOf('mtnc_') === 0) sessionStorage.removeItem(k); });
  document.getElementById('landing').classList.add('hidden');
  showLogin();
}

function applyTheme(t) {
  document.body.classList.toggle('light', t === 'light');
  const b = document.getElementById('theme-btn');
  if (b) b.textContent = t === 'light' ? '☀' : '🌙';
}
function toggleTheme() {
  const next = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

(function init() {
  applyTheme(localStorage.getItem('theme') || 'dark');
  document.getElementById('setup-screen').classList.add('hidden');
  buildLanding();
  document.getElementById('landing').classList.add('hidden');
  showLogin();
})();
