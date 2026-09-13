// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const PRIO_CYCLE = ['ALTA','MEDIA','BAIXA'];
const ST_CYCLE   = ['INDENTIFICADO','ANDAMENTO','CONCLUIDO'];
const DEFAULT_SERVICOS = ['REPAROS','LIMPEZA','AR','LAMPADA','TV','PINTURA','INSTALAÇÃO','VIDROS','OBRA','ELETRICA','REFRIGEREÇÃO','CHUVEIRO','REFORMA','MANUTENÇÃO','TELEFONE','JARDIM'];
const CARROS_SERVICOS = ['REVISÃO','TROCA DE ÓLEO','PNEUS','FREIOS','SUSPENSÃO','ALINHAMENTO','FUNILARIA','PINTURA','ELÉTRICA','AR CONDICIONADO','BATERIA','MECÂNICA','LAVAGEM','VIDROS','ABASTECIMENTO','LICENCIAMENTO','SEGURO','MULTAS'];
const VIAGEM_DESTINOS = ['PRAIA DOS OSSOS','PRAIA DA FERRADURA','PRAIA','JOÃO FERNANDES','CENTRO','COMPRAS'];
const CARROS_FROTA = ['PARTNER','SPRINTER','Q7','RANGER','BMW','GERADOR BC','GERADOR CS'];
let SERVICOS = [...DEFAULT_SERVICOS];
let DESTINOS = [...VIAGEM_DESTINOS];
let FROTA = [...CARROS_FROTA];

// ─── HOTELS ───────────────────────────────────────────────────────────────────
const HOTELS = [
  { key: 'costa_sol',      name: 'Costa do Sol',    tag: 'Boutique Hotel',     icon: '☀',  path: 'hotel_manutencao' },
  { key: 'brava_club',     name: 'Brava Club',      tag: 'Hotel Pousada',      icon: '🌊', path: 'hotels/brava_club' },
  { key: 'brava_exclusive',name: 'Brava Exclusive', tag: 'Praia da Brava',     icon: '◆',  path: 'hotels/brava_exclusive' },
  { key: 'vila_pitanga',   name: 'Vila Pitanga',    tag: 'Ferradura',          icon: '🌿', path: 'hotels/vila_pitanga' },
  { key: 'maria_maria',    name: 'Maria Maria',     tag: 'Ferradura',          icon: '✦',  path: 'hotels/maria_maria' },
  { key: 'carros',         name: 'Carros',          tag: 'Frota / Veículos',   icon: '🚗', path: 'hotels/carros',
    labels: { plan: 'Serviços', planOne: 'Serviço', planIcon: '🔧', emrg: 'Viagem', emrgOne: 'Viagem', emrgIcon: '🚗' },
    servicos: CARROS_SERVICOS, emrgServicos: VIAGEM_DESTINOS, frota: CARROS_FROTA, areaLabel: 'Carro / Gerador' },
];
const DEFAULT_LABELS = { plan: 'Planejados', planOne: 'Planejado', planIcon: '📋', emrg: 'Emergenciais', emrgOne: 'Emergencial', emrgIcon: '⚡' };
let currentHotel = localStorage.getItem('currentHotel') || 'costa_sol';
function hotelInfo() { return HOTELS.find(h => h.key === currentHotel) || HOTELS[0]; }
function hotelPath() { return hotelInfo().path; }
function hotelLabels() { return Object.assign({}, DEFAULT_LABELS, hotelInfo().labels || {}); }
function baseServicos() { return hotelInfo().servicos || DEFAULT_SERVICOS; }
function emrgServList() { return hotelInfo().emrgServicos ? DESTINOS : null; }
function frotaList() { return hotelInfo().frota ? FROTA : null; }
function isViagemRow(r) { return !!(hotelInfo().emrgServicos && r.tipo === 'EMERGENCIAL'); }

// ─── STATE ────────────────────────────────────────────────────────────────────
let MONTHS = [], DATA = [];
let activeMonth = 0, modalTarget = null, sortDir = {}, delMonthIdx = null;
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
        const customFrota = Array.isArray(val.frota) ? val.frota : [];
        FROTA = [...new Set([...CARROS_FROTA, ...customFrota])];

        const changed = JSON.stringify(newMonths) !== JSON.stringify(MONTHS)
                     || JSON.stringify(newData)   !== JSON.stringify(DATA);

        MONTHS = newMonths;
        DATA   = newData;
        if (ensureIds()) scheduleSave();

        if (firstLoad && MONTHS.length) {
          const cur = currentMonthName();
          const idx = MONTHS.indexOf(cur);
          activeMonth = idx >= 0 ? idx : MONTHS.length - 1;
          firstLoad = false;
        }

        if (changed) buildUI();
        computeKPIs();
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
function stClass(v)   { const u = (v||'').toUpperCase(); return u.includes('CONC') ? 'st-c' : u.includes('DENT') ? 'st-i' : u.includes('AND') ? 'st-a' : 'st-d'; }
function stLabel(v)   { const u = (v||'').toUpperCase(); return u.includes('CONC') ? '✓ Concluído' : u.includes('DENT') ? '⚑ Identificado' : u.includes('AND') ? '⟳ Andamento' : v||'—'; }
function svClass(v) {
  const u = (v||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const m = {REVIS:'REVISAO',OLEO:'OLEO',PNEU:'PNEUS',FREIO:'FREIOS',SUSPEN:'SUSPENSAO',ALINH:'ALINHAMENTO',FUNIL:'FUNILARIA',BATERIA:'BATERIA',MECAN:'MECANICA',LAVAG:'LAVAGEM',ABASTE:'ABASTECIMENTO',LICENC:'LICENCIAMENTO',SEGURO:'SEGURO',MULTA:'MULTAS',REPAROS:'REPAROS',LIMPEZA:'LIMPEZA',AR:'AR',LAMPADA:'LAMPADA',TV:'TV',PINTURA:'PINTURA',INSTALACAO:'INSTALACAO',VIDROS:'VIDROS',OBRA:'OBRA',ELETRICA:'ELETRICA',REFRIGER:'REFRIGERECAO',CHUVEIRO:'CHUVEIRO',REFORMA:'REFORMA',MANUT:'MANUTENCAO',TELEFONE:'TELEFONE',JARDIM:'JARDIM'};
  const k = Object.keys(m).find(k => u.includes(k));
  return k ? `sv-${m[k]}` : 'sv-default';
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
  if (isOverdue(r)) cls += 'atrasado-row ';
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
function prioPriority(r) { const done = (r.stat||'').toUpperCase().includes('CONC'); const p = r.prio === 'ALTA' ? 0 : r.prio === 'MEDIA' ? 1 : 2; return done ? 10 + p : p; }

// ─── KPIs ─────────────────────────────────────────────────────────────────────
function computeKPIs() {
  let tot = 0, c = 0, a = 0, id = 0, plan = 0, pend = 0, od = 0;
  const m = DATA[activeMonth] || [];
  m.forEach(r => {
    tot++;
    const u = (r.stat||'').toUpperCase();
    if (u.includes('CONC')) c++;
    else if (u.includes('AND')) a++;
    else if (u.includes('DENT')) id++;
    if (r.tipo === 'PLANEJADO') plan++;
    if (r.pendente) pend++;
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
  const mName = MONTHS[activeMonth] || '—';
  badge.textContent = `${mName} · ${tot} registros` + (pend ? ` · ${pend} pendente${pend > 1 ? 's' : ''}` : '');
  badge.style.color = pend ? '#f5a623' : '';
  updatePendentesCount();
}

// ─── BUILD UI ─────────────────────────────────────────────────────────────────
function buildUI() {
  const tabsEl   = document.getElementById('tabs');
  const panelsEl = document.getElementById('panels');
  tabsEl.innerHTML = ''; panelsEl.innerHTML = '';
  if (!MONTHS.length) { document.getElementById('empty-state').style.display = 'flex'; return; }
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
}

function makeTab(month, mi) {
  const t = document.createElement('div');
  t.className = 'tab' + (mi === activeMonth ? ' active' : '');
  t.id = `tab-${mi}`;
  const pl = (DATA[mi]||[]).filter(r => r.tipo === 'PLANEJADO').length;
  const em = (DATA[mi]||[]).filter(r => r.tipo === 'EMERGENCIAL').length;
  t.innerHTML = `<div class="tab-inner" onclick="switchTab(${mi})">${month} <span class="tab-cnt" id="tab-cnt-${mi}">${pl}P · ${em}E</span></div><button class="tab-del" title="Excluir mês" onclick="askDelMonth(event,${mi})">✕</button>`;
  return t;
}

function buildPanelHTML(mi) {
  const servOpts = SERVICOS.map(s => `<option value="${s}">${s}</option>`).join('');
  const L = hotelLabels();
  return `<div class="pdf-subheader">Grupo Meridiana · Búzios/RJ</div><div class="pdf-header">${hotelInfo().name}</div><div class="print-cover-divider"></div><div class="print-cover-tag">Relatório de Manutenção · ${MONTHS[mi]} · <span class="print-gen-date"></span></div>
  <div class="sec-box planejado"><div class="sec-hdr"><div class="sec-title"><div class="sec-icon icon-plan">${L.planIcon}</div>${L.plan}<span class="sec-badge sb-plan" id="cnt-plan-${mi}">0</span></div><div class="sec-hdr-r">
    <input class="flt flt-sm" id="flt-p-${mi}-area" placeholder="Área…" oninput="filterSection(${mi},'plan')">
    <select class="flt" id="flt-p-${mi}-serv" onchange="filterSection(${mi},'plan')"><option value="">Todos serviços</option>${servOpts}</select>
    <input class="flt flt-sm" id="flt-p-${mi}-func" placeholder="Funcionário…" oninput="filterSection(${mi},'plan')">
    <input class="flt flt-date" id="flt-p-${mi}-date" type="date" title="Filtrar por data" onchange="filterSection(${mi},'plan')">
    <select class="flt" id="flt-p-${mi}-stat" onchange="filterSection(${mi},'plan')"><option value="">Todos status</option><option value="CONCLUIDO">✓ Concluído</option><option value="ANDAMENTO">⟳ Andamento</option><option value="IDENT">⚑ Identificado</option></select>
    ${hotelInfo().frota ? `<button class="btn-link-pub" onclick="openLinkPublico('PLANEJADO')" title="Link público de serviços">🔗 Link Público</button>` : ''}
    <button class="btn-add-row" onclick="openModal(${mi},'PLANEJADO')">＋ ${L.planOne}</button>
  </div></div>
  <div class="tbl-wrap"><table><thead><tr><th class="ns" style="width:32px">#</th><th onclick="srt(${mi},'plan','prio',this)">Prioridade <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','area',this)">Área <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','serv',this)">Serviço <span class="sort-ic">⇅</span></th><th>Descrição</th><th onclick="srt(${mi},'plan','stat',this)">Status <span class="sort-ic">⇅</span></th><th>Funcionários</th><th onclick="srt(${mi},'plan','dtid',this)">Data Ident. <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','ini',this)">Início <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'plan','fim',this)">Prazo/Fim <span class="sort-ic">⇅</span></th><th class="ns" style="width:32px"></th></tr></thead><tbody id="tbody-plan-${mi}"></tbody></table></div></div>
  <div class="sec-box emergencial"><div class="sec-hdr"><div class="sec-title"><div class="sec-icon icon-emrg">${L.emrgIcon}</div>${L.emrg}<span class="sec-badge sb-emrg" id="cnt-emrg-${mi}">0</span></div><div class="sec-hdr-r">
    <div class="sw"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="search" id="flt-e-${mi}-q" placeholder="Buscar…" oninput="filterSection(${mi},'emrg')"></div>
    <input class="flt flt-sm" id="flt-e-${mi}-area" placeholder="Área…" oninput="filterSection(${mi},'emrg')">
    <select class="flt" id="flt-e-${mi}-serv" onchange="filterSection(${mi},'emrg')"><option value="">Todos serviços</option>${servOpts}</select>
    <input class="flt flt-sm" id="flt-e-${mi}-func" placeholder="Funcionário…" oninput="filterSection(${mi},'emrg')">
    <input class="flt flt-date" id="flt-e-${mi}-date" type="date" title="Filtrar por data" onchange="filterSection(${mi},'emrg')">
    <select class="flt" id="flt-e-${mi}-stat" onchange="filterSection(${mi},'emrg')"><option value="">Todos</option><option value="CONCLUIDO">✓ Concluído</option><option value="ANDAMENTO">⟳ Andamento</option><option value="IDENT">⚑ Identificado</option></select>
    ${hotelInfo().emrgServicos ? `<button class="btn-add-row" onclick="openDestinos()" title="Gerenciar destinos da viagem">⚙ Destinos</button>` : ''}
    <button class="btn-link-pub" onclick="openLinkPublico()" title="Link público de lançamento">🔗 Link Público</button>
    <button class="btn-add-row" onclick="openModal(${mi},'EMERGENCIAL')">＋ ${L.emrgOne}</button>
  </div></div>
  <div class="tbl-wrap"><table><thead><tr><th class="ns" style="width:32px">#</th><th onclick="srt(${mi},'emrg','area',this)">Área <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'emrg','serv',this)">Serviço <span class="sort-ic">⇅</span></th><th>Descrição</th><th onclick="srt(${mi},'emrg','stat',this)">Status <span class="sort-ic">⇅</span></th><th>Funcionários</th><th onclick="srt(${mi},'emrg','dtid',this)">Data Ident. <span class="sort-ic">⇅</span></th><th onclick="srt(${mi},'emrg','ini',this)">Data <span class="sort-ic">⇅</span></th><th class="ns" style="width:32px"></th></tr></thead><tbody id="tbody-emrg-${mi}"></tbody></table></div></div>`;
}

function renderBothTables(mi) { renderPlan(mi); renderEmrg(mi); updateTabCnt(mi); }

function isClosedMonth(mi) { return mi < MONTHS.length - 1; }

function sepRow(colspan, label) {
  const tr = document.createElement('tr');
  tr.className = 'sep-row';
  tr.innerHTML = `<td colspan="${colspan}" style="padding:8px 12px;background:linear-gradient(90deg,rgba(46,160,67,.08),transparent);border-top:1px solid rgba(46,160,67,.25);border-bottom:1px solid rgba(46,160,67,.15);font-size:10.5px;font-weight:600;letter-spacing:.8px;color:#3fb950;text-transform:uppercase">✓ ${label}</td>`;
  return tr;
}

function renderRows(mi, rows, tbody, makeFn, colspan) {
  let inserted = false;
  const closed = isClosedMonth(mi);
  rows.forEach((r, i) => {
    if (closed && !inserted && isConc(r)) {
      tbody.appendChild(sepRow(colspan, 'Concluídos no mês'));
      inserted = true;
    }
    const gi = DATA[mi].indexOf(r);
    tbody.appendChild(makeFn(mi, gi, r, i + 1));
  });
}

function renderPlan(mi) {
  if (!DATA[mi]) return;
  const rows  = DATA[mi].filter(r => r.tipo === 'PLANEJADO').sort((a,b) => prioPriority(a) - prioPriority(b));
  const tbody = document.getElementById(`tbody-plan-${mi}`);
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!rows.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="11">Nenhum serviço planejado</td></tr>'; document.getElementById(`cnt-plan-${mi}`).textContent = '0'; return; }
  renderRows(mi, rows, tbody, makePlanRow, 11);
  document.getElementById(`cnt-plan-${mi}`).textContent = rows.length;
}

function renderEmrg(mi) {
  if (!DATA[mi]) return;
  const rows  = DATA[mi].filter(r => r.tipo === 'EMERGENCIAL').sort((a,b) => { const d = prioPriority(a) - prioPriority(b); return d || dateCmp(b.ini, a.ini); });
  const tbody = document.getElementById(`tbody-emrg-${mi}`);
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!rows.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="9">Nenhum serviço emergencial</td></tr>'; document.getElementById(`cnt-emrg-${mi}`).textContent = '0'; return; }
  renderRows(mi, rows, tbody, makeEmrgRow, 9);
  document.getElementById(`cnt-emrg-${mi}`).textContent = rows.length;
}

function dateCmp(a, b) { const pa = pd(a), pb = pd(b); if (!pa && !pb) return 0; if (!pa) return 1; if (!pb) return -1; return pa - pb; }
function pd(s) { if (!s) return null; const p = s.split('/'); if (p.length === 3) return new Date(p[2], p[1]-1, p[0]); if (s.includes('-')) return new Date(s); return null; }

function descCell(mi, gi, val) {
  const td   = document.createElement('td');
  td.style.padding = '0';
  const wrap = document.createElement('div');
  wrap.className = 'desc-wrap';
  const inp  = document.createElement('input');
  inp.className = 'ci';
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
  inp.type  = 'date';
  inp.value = toISO(val);
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
  ptd.querySelector('.prio').onclick = () => cyclePrio(mi, gi, tr, ptd);
  tr.appendChild(ptd);
  tr.appendChild(eCell(r.area, v => updateField(mi, gi, 'area', v)));
  const sv = document.createElement('td'); sv.className = 'sv-cell';
  sv.innerHTML = `<span class="sv ${svClass(r.serv)}">${r.serv||'—'}</span>`;
  sv.querySelector('.sv').onclick = () => nextServ(mi, gi, sv);
  tr.appendChild(sv);
  tr.appendChild(descCell(mi, gi, r.desc));
  const stTd = document.createElement('td'); stTd.className = 'st-cell';
  stTd.innerHTML = `<span class="st ${stClass(r.stat)}">${stLabel(r.stat)}</span>`;
  stTd.querySelector('.st').onclick = () => cycleSt(mi, gi, tr, stTd);
  tr.appendChild(stTd);
  tr.appendChild(eCell(r.func, v => updateField(mi, gi, 'func', v)));
  tr.appendChild(dateCell(r.dtid, v => updateField(mi, gi, 'dtid', v)));
  tr.appendChild(dateCell(r.ini,  v => updateField(mi, gi, 'ini',  v)));
  const fimTd = dateCell(r.fim, v => updateField(mi, gi, 'fim', v));
  if (isOverdue(r)) { const t = document.createElement('span'); t.className = 'overdue-tag'; t.textContent = '⚠ ATRASADO'; fimTd.appendChild(t); }
  tr.appendChild(fimTd);
  const dt = document.createElement('td');
  dt.className = 'act-cell';
  const confBtn = r.pendente ? `<button class="btn-confirm" title="Confirmar lançamento pendente">✓</button>` : '';
  dt.innerHTML = `${confBtn}<button class="conv" title="Mover para ${hotelLabels().emrgOne}">⇄</button><button class="del">✕</button>`;
  if (r.pendente) dt.querySelector('.btn-confirm').onclick = () => askConfirmPend(mi, gi);
  dt.querySelector('.conv').onclick = () => openConvert(mi, gi);
  dt.querySelector('.del').onclick  = () => confirmDeleteRow(mi, gi);
  tr.appendChild(dt);
  const planLabels = ['', 'Prioridade', 'Área', 'Serviço', 'Descrição', 'Status', 'Funcionários', 'Data Ident.', 'Início', 'Prazo/Fim', ''];
  [...tr.children].forEach((td, i) => { if (planLabels[i]) td.dataset.label = planLabels[i]; });
  addRowHover(tr);
  return tr;
}

function makeEmrgRow(mi, gi, r, num) {
  const tr = document.createElement('tr');
  tr.className = rowClass(r);
  tr.dataset.gi = gi;
  const n = document.createElement('td'); n.className = 'td-n'; n.textContent = num; tr.appendChild(n);
  tr.appendChild(eCell(r.area, v => updateField(mi, gi, 'area', v)));
  const sv = document.createElement('td'); sv.className = 'sv-cell';
  sv.innerHTML = `<span class="sv ${svClass(r.serv)}">${r.serv||'—'}</span>`;
  sv.querySelector('.sv').onclick = () => nextServ(mi, gi, sv);
  tr.appendChild(sv);
  tr.appendChild(descCell(mi, gi, r.desc));
  const stTd = document.createElement('td'); stTd.className = 'st-cell';
  stTd.innerHTML = `<span class="st ${stClass(r.stat)}">${stLabel(r.stat)}</span>`;
  stTd.querySelector('.st').onclick = () => cycleSt(mi, gi, tr, stTd);
  tr.appendChild(stTd);
  tr.appendChild(eCell(r.func, v => updateField(mi, gi, 'func', v)));
  tr.appendChild(dateCell(r.dtid, v => updateField(mi, gi, 'dtid', v)));
  tr.appendChild(dateCell(r.ini,  v => updateField(mi, gi, 'ini',  v)));
  const dt = document.createElement('td');
  dt.className = 'act-cell';
  const confBtn = r.pendente ? `<button class="btn-confirm" title="Confirmar lançamento pendente">✓</button>` : '';
  dt.innerHTML = `${confBtn}<button class="conv" title="Mover para ${hotelLabels().planOne}">⇄</button><button class="del">✕</button>`;
  if (r.pendente) dt.querySelector('.btn-confirm').onclick = () => askConfirmPend(mi, gi);
  dt.querySelector('.conv').onclick = () => openConvert(mi, gi);
  dt.querySelector('.del').onclick  = () => confirmDeleteRow(mi, gi);
  tr.appendChild(dt);
  const emrgLabels = ['', 'Área', 'Serviço', 'Descrição', 'Status', 'Funcionários', 'Data Ident.', 'Data', ''];
  [...tr.children].forEach((td, i) => { if (emrgLabels[i]) td.dataset.label = emrgLabels[i]; });
  addRowHover(tr);
  return tr;
}

function deleteRow(mi, gi) {
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
  const cur = (DATA[mi][gi].stat||'').toUpperCase();
  const idx  = ST_CYCLE.findIndex(s => cur.includes(s.substring(0, 4)));
  const next = ST_CYCLE[(idx + 1) % 3];
  DATA[mi][gi].stat = next;
  const sp = stTd.querySelector('.st');
  sp.className  = `st ${stClass(next)}`;
  sp.textContent = stLabel(next);
  tr.className = rowClass(DATA[mi][gi]);
  const months = syncToSiblings(DATA[mi][gi].id, mi, gi, { stat: next });
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
  const list = isViagem ? DESTINOS : SERVICOS;
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
  activeMonth = mi;
  document.querySelectorAll('.tab').forEach((t, i)   => t.classList.toggle('active', i === mi));
  document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i === mi));
  updateFooter(mi);
  computeKPIs();
}

function updateTabCnt(mi) {
  const el = document.getElementById(`tab-cnt-${mi}`);
  if (!el) return;
  const pl = (DATA[mi]||[]).filter(r => r.tipo === 'PLANEJADO').length;
  const em = (DATA[mi]||[]).filter(r => r.tipo === 'EMERGENCIAL').length;
  el.textContent = `${pl}P · ${em}E`;
}

function updateFooter(mi) {
  const m  = DATA[mi] || [];
  const ok = m.filter(r => (r.stat||'').toUpperCase().includes('CONC')).length;
  document.getElementById('ftr').textContent = `${MONTHS[mi]} · ${m.length} registros · ${ok} concluídos`;
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
  const p = sec === 'plan' ? `flt-p-${mi}` : `flt-e-${mi}`;
  const area = normStr(document.getElementById(`${p}-area`)?.value || '');
  const serv = normStr(document.getElementById(`${p}-serv`)?.value || '');
  const func = normStr(document.getElementById(`${p}-func`)?.value || '');
  const date = document.getElementById(`${p}-date`)?.value || '';
  const stat = normStr(document.getElementById(`${p}-stat`)?.value || '');
  const q    = normStr(document.getElementById(`${p}-q`)?.value || '');
  const tbodyId = sec === 'plan' ? `tbody-plan-${mi}` : `tbody-emrg-${mi}`;
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
    let show = true;
    if (area && !tarea.includes(area)) show = false;
    if (serv && !tserv.includes(serv)) show = false;
    if (func && !tfunc.includes(func)) show = false;
    if (date && !matchDate(tdtid, date) && !matchDate(tini, date)) show = false;
    if (stat && !tstat.includes(stat)) show = false;
    if (q && ![tarea, tdesc, tfunc, tserv, tstat].join(' ').includes(q)) show = false;
    tr.style.display = show ? '' : 'none';
  });
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
  return DATA[mi].filter(r => !(r.stat||'').toUpperCase().includes('CONC'));
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
  const L = hotelLabels();
  const sel = document.getElementById('m-tipo');
  sel.value = tipo;
  sel.querySelector('option[value="PLANEJADO"]').textContent = `${L.planIcon} ${L.planOne}`;
  sel.querySelector('option[value="EMERGENCIAL"]').textContent = `${L.emrgIcon} ${L.emrgOne}`;
  ['m-area','m-desc','m-func','m-ini','m-fim'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('m-dtid').value = new Date().toISOString().split('T')[0];
  onTipoChange();
  if (frotaList()) document.getElementById('m-area-sel').selectedIndex = 0;
  const ss = document.getElementById('m-serv');
  ss.value = [...ss.options].some(o => o.value === 'REPAROS') ? 'REPAROS' : (ss.options[0] ? ss.options[0].value : '');
  document.getElementById('m-stat').value = 'INDENTIFICADO';
  document.getElementById('ov').classList.add('show');
}
function onTipoChange() {
  const tipo = document.getElementById('m-tipo').value;
  const L = hotelLabels();
  document.getElementById('mod-title').textContent = tipo === 'PLANEJADO' ? `${L.planIcon} Novo ${L.planOne}` : `${L.emrgIcon} Novo ${L.emrgOne}`;
  document.getElementById('m-fim-row').style.display = tipo === 'PLANEJADO' ? '' : 'none';

  // Quarto/Área  →  seletor Carro/Gerador nas unidades com frota
  const frota   = frotaList();
  const areaInp = document.getElementById('m-area');
  const areaSel = document.getElementById('m-area-sel');
  const areaLbl = document.getElementById('m-area-lbl');
  if (frota) {
    if (areaLbl) areaLbl.textContent = hotelInfo().areaLabel || 'Carro / Gerador';
    areaInp.style.display = 'none';
    areaSel.style.display = '';
    fillFrotaSelect(areaSel);
  } else {
    if (areaLbl) areaLbl.textContent = 'Quarto / Área';
    areaInp.style.display = '';
    areaSel.style.display = 'none';
  }

  // Serviço  →  Destino na Viagem
  const destinos = (tipo === 'EMERGENCIAL') ? emrgServList() : null;
  const servList = destinos || SERVICOS;
  const servLbl = document.querySelector('#m-serv').previousElementSibling;
  if (servLbl) servLbl.textContent = destinos ? 'Destino' : 'Serviço';
  document.getElementById('m-serv').innerHTML = servList.map(s => `<option value="${s}">${s}</option>`).join('');

  // Prioridade sempre normal
  const prioLbl = document.querySelector('#m-prio-row label');
  if (prioLbl) prioLbl.textContent = 'Prioridade';
  document.getElementById('m-prio').innerHTML = `<option value="ALTA">🔴 Alta</option><option value="MEDIA" selected>🟠 Média</option><option value="BAIXA">🔵 Baixa</option>`;
}

function fillFrotaSelect(sel, current) {
  sel.innerHTML = FROTA.map(v => `<option value="${v}">${v}</option>`).join('') +
    `<option value="__ADD__">➕ Adicionar veículo / gerador…</option>`;
  if (current && FROTA.includes(current)) sel.value = current;
}

function onAreaSelChange() {
  const sel = document.getElementById('m-area-sel');
  if (sel.value !== '__ADD__') return;
  const nome = (prompt('Nome do novo veículo / gerador:') || '').trim().toUpperCase().normalize('NFC');
  if (nome && !FROTA.includes(nome)) {
    FROTA.push(nome);
    saveFrota();
  }
  fillFrotaSelect(sel, nome || FROTA[0]);
  sel.value = nome && FROTA.includes(nome) ? nome : FROTA[0];
}

function saveFrota() {
  if (!db) return;
  const custom = FROTA.filter(v => !CARROS_FROTA.includes(v));
  db.ref(`${hotelPath()}/frota`).set(custom.length ? custom : null);
}
function ovClose(e) {
  if (!e || e.target === document.getElementById('ov')) { document.getElementById('ov').classList.remove('show'); modalTarget = null; }
}
function addRecord() {
  if (modalTarget === null) return;
  if (!Array.isArray(DATA[modalTarget])) DATA[modalTarget] = [];
  const tipo = document.getElementById('m-tipo').value;
  DATA[modalTarget].unshift({
    id:    genId(),
    tipo,
    prio:  document.getElementById('m-prio').value,
    area:  frotaList() ? document.getElementById('m-area-sel').value : document.getElementById('m-area').value,
    serv:  document.getElementById('m-serv').value,
    desc:  document.getElementById('m-desc').value,
    stat:  document.getElementById('m-stat').value,
    func:  document.getElementById('m-func').value,
    dtid:  document.getElementById('m-dtid').value,
    ini:   document.getElementById('m-ini').value,
    fim:   tipo === 'PLANEJADO' ? document.getElementById('m-fim').value : '',
  });
  renderBothTables(modalTarget);
  computeKPIs();
  document.getElementById('ov').classList.remove('show');
  modalTarget = null;
  pushToFirebase();
}

// ─── HOTEL SWITCHER ───────────────────────────────────────────────────────────
function updateHotelLabel() {
  const el  = document.getElementById('hotel-name');
  const btn = document.getElementById('hotel-name-btn');
  if (el)  el.textContent  = hotelInfo().name;
  if (btn) btn.textContent = hotelInfo().name;
  document.title = `Gestão de Manutenção · ${hotelInfo().name}`;
}
function buildHotelSelector() { updateHotelLabel(); }
function switchHotel(key) {
  if (key === currentHotel) return;
  if (!HOTELS.find(h => h.key === key)) return;
  clearTimeout(saveDebounce);
  currentHotel = key;
  localStorage.setItem('currentHotel', key);
  MONTHS = []; DATA = []; SERVICOS = [...baseServicos()]; DESTINOS = [...VIAGEM_DESTINOS]; FROTA = [...CARROS_FROTA];
  activeMonth = 0;
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
  const t = tipo === 'PLANEJADO' ? '&t=plan' : '';
  return `${base}?h=${currentHotel}${t}`;
}
function openLinkPublico(tipo) {
  const url = getSubmitURL(tipo);
  document.getElementById('link-url').textContent = url;
  document.getElementById('qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(url)}`;
  document.getElementById('ov-link').classList.add('show');
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

function openPdf() {
  const grid = document.getElementById('pdf-serv');
  grid.innerHTML = SERVICOS.map(s =>
    `<label class="pdf-chk"><input type="checkbox" value="${s}" checked> ${s}</label>`
  ).join('');
  ['pdf-func','pdf-area'].forEach(id => document.getElementById(id).value = '');
  ['pdf-tipo','pdf-stat','pdf-prio','pdf-serv'].forEach(id => {
    document.querySelectorAll(`#${id} input`).forEach(c => c.checked = true);
  });
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

  document.querySelectorAll('.panel').forEach((p, i) => { p.style.display = i === activeMonth ? 'flex' : 'none'; });
  const title = document.title;
  document.title = `Manutenção · ${MONTHS[activeMonth]} · ${hotelInfo().name}`;
  document.body.classList.add('printing');

  closePdf();
  setTimeout(() => {
    window.print();
    document.title = title;
    document.body.classList.remove('printing');
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
  const allPend = [];
  DATA.forEach((month, mi) => {
    (month || []).forEach((r, gi) => { if (r.pendente) allPend.push({ mi, gi, r }); });
  });

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
          <div class="pend-item-area">${r.area || '—'}</div>
          <div class="pend-item-month">Mês: ${MONTHS[mi] || '—'}</div>
        </div>
        <span class="prio ${prioClass(r.prio || 'MEDIA')}">${prioLabel(r.prio || 'MEDIA')}</span>
      </div>
      <div class="pend-item-meta">
        <span class="sv ${svClass(r.serv)}">${r.serv || '—'}</span>
        ${r.func ? `<span style="font-size:10.5px;color:var(--muted)">👤 ${r.func}</span>` : ''}
        ${r.dtid ? `<span style="font-size:10.5px;color:var(--muted)">📅 ${r.dtid}</span>` : ''}
      </div>
      ${r.desc ? `<div class="pend-item-desc">${r.desc}</div>` : ''}
      <div class="pend-item-actions">
        <button class="pend-btn-confirm" onclick="confirmFromPanel(${mi},${gi})">✓ Confirmar</button>
        <button class="pend-btn-reject" onclick="rejectFromPanel(${mi},${gi})">✕ Rejeitar</button>
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

function rejectFromPanel(mi, gi) {
  const item = document.getElementById(`pend-item-${mi}-${gi}`);
  if (item) item.classList.add('removing');
  setTimeout(() => {
    DATA[mi].splice(gi, 1);
    renderBothTables(mi);
    computeKPIs();
    pushToFirebase();
    renderPendentesPanel();
  }, 220);
}

function updatePendentesCount() {
  let total = 0;
  DATA.forEach(m => (m || []).forEach(r => { if (r.pendente) total++; }));
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
  grid.innerHTML = HOTELS.map(h =>
    `<div class="lp-card${h.key === currentHotel ? ' active' : ''}" onclick="pickHotel('${h.key}')">
       <div class="lp-card-icon">${h.icon}</div>
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
    document.getElementById('landing').classList.add('hidden');
    buildHotelSelector();
    initFirebase(FIREBASE_CFG);
  });
}

// ─── CONTROLE DE ACESSO (PIN) ───────────────────────────────────────────────────
let pinState = null;

function ensureApp() {
  if (firebase.apps.length === 0) firebase.initializeApp(FIREBASE_CFG);
  db = firebase.database();
  if (!authReady && firebase.auth) {
    authReady = firebase.auth().signInAnonymously()
      .catch(e => { console.error('Falha no login anônimo:', e); });
  }
  return db;
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function unlockedThisSession(key) {
  return sessionStorage.getItem('mtnc_master') === '1'
      || sessionStorage.getItem('mtnc_unlocked_' + key) === '1';
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

function backToLanding() {
  clearTimeout(saveDebounce);
  if (activeRef) { try { activeRef.off(); } catch(e){} activeRef = null; }
  MONTHS = []; DATA = []; SERVICOS = [...DEFAULT_SERVICOS];
  activeMonth = 0;
  document.getElementById('tabs').innerHTML = '';
  document.getElementById('panels').innerHTML = '';
  document.getElementById('empty-state').style.display = 'none';
  buildLanding();
  document.getElementById('landing').classList.remove('hidden');
}

(function init() {
  document.getElementById('setup-screen').classList.add('hidden');
  buildLanding();
})();
