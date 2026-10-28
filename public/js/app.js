if (!window.IslaLib || !window.IslaBridge) {
  const t = document.querySelector('#toast');
  if (t) { t.hidden = false; t.textContent = 'Falta actualizar la web (main.jsx). Recarga con Ctrl+F5.'; }
  throw new Error('IslaLib/IslaBridge no definidos: despliega src/main.jsx junto con public/js/app.js');
}
const { API, api, fmt, mmss, esc, dur, hace } = window.IslaLib;
const IslaBridge = window.IslaBridge;
const { store } = IslaBridge;
const S = store.sel;
const cargado = store.cache;
IslaBridge.publicar = (b, ruta, cuerpo) => publicar(b, ruta, cuerpo);
IslaBridge.aviso = (txt, ms) => aviso(txt, ms);
IslaBridge.abiertas = () => abiertas;
store.hooks.aviso = (txt, ms) => aviso(txt, ms);
store.hooks.sesionCaducada = () => sesionCaducada();
const BOT_NUMBER = '5219633122232';
const TITULO = 'Isla · Panel';

const $ = s => document.querySelector(s);
// Los módulos React pueden reemplazar contenido de una pestaña; no escribir texto en nodos ausentes.
const setText = (selector, value) => { const el = $(selector); if (el) el.textContent = value; return el; };
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONOS = {
  mine: svg('<g transform="rotate(40 12 12)"><path d="M12 21 V9"/><path d="M3 9 C6 3 18 3 21 9"/></g>'),
  chop: svg('<g transform="rotate(-25 12 12)"><path d="M12 21 V4"/><path d="M12 4.5 H15 C18 5 20 8 20.5 12 C17.5 10.5 14.5 10.5 12 11 Z"/></g>'),
  fish: svg('<path d="M3 21 L17 5"/><path d="M17 5 Q22 9 20 14"/><circle class="boya" cx="20" cy="15.6" r="1.6"/><circle cx="7.2" cy="16.4" r="1.4"/><path d="M13 21 Q15 19.5 17 21 T21 21"/>'),
  hunt: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 1 V5 M12 19 V23 M1 12 H5 M19 12 H23"/>'),
  gift: svg('<path d="M4 11 H20 V21 H4 Z"/><path d="M3 7 H21 V11 H3 Z"/><path d="M12 7 V21"/><path d="M12 7 C12 3 8 3 8 5 C8 7 12 7 12 7 C12 7 16 7 16 5 C16 3 12 3 12 7"/>'),
  brief: svg('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8 V6.5 A1.5 1.5 0 0 1 10.5 5 H13.5 A1.5 1.5 0 0 1 15 6.5 V8"/><path d="M3 13 H21"/><rect x="10.5" y="11.5" width="3" height="3" rx=".6"/>'),
  dado: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="9" cy="15" r="1.1"/><circle cx="15" cy="15" r="1.1"/>'),
  moneda: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7 V17"/><path d="M15 9.5 C14 8.5 10 8.5 9.5 10.5 C9 12.5 15 11.5 14.5 13.5 C14 15.5 10 15.5 9 14.5"/>'),
  mask: svg('<path d="M4 8 C4 5 8 4 12 4 C16 4 20 5 20 8 V12 C20 17 16 20 12 20 C8 20 4 17 4 12 Z"/><path d="M8 11 L10.5 12 M16 11 L13.5 12"/><path d="M9 16 C10.5 17 13.5 17 15 16"/>'),
  leaf: svg('<path d="M12 21 C12 14 8 11 4 11 C4 16 7 20 12 21 Z"/><path d="M12 21 C12 14 16 9 20 9 C20 15 17 20 12 21 Z"/>'),
  raid: svg('<path d="M4 4 L15 15"/><path d="M13 17 L17 13"/><path d="M16 16 L20 20"/><path d="M20 4 L9 15"/><path d="M11 17 L7 13"/><path d="M8 16 L4 20"/>'),
  gacha: svg('<path d="M12 3 L14.5 9.5 L21 12 L14.5 14.5 L12 21 L9.5 14.5 L3 12 L9.5 9.5Z"/>'),
  clan: svg('<path d="M4 21 V9 L7 7 V4 H9 V7 H11 V4 H13 V7 H15 V4 H17 V7 L20 9 V21"/><path d="M3 21 H21"/><path d="M10 21 V15 A2 2 0 0 1 14 15 V21"/>')
};
const NAV = [
  ['inicio', 'Inicio', svg('<path d="M3 11 L12 3 L21 11"/><path d="M5 10 V20 H19 V10"/>')],
  ['inventario', 'Mochila', svg('<path d="M5 8 H19 L20 21 H4 Z"/><path d="M9 8 V6 A3 3 0 0 1 15 6 V8"/>')],
  ['tienda', 'Tienda', svg('<path d="M4 9 L6 4 H18 L20 9"/><path d="M4 9 C4 11 8 11 8 9 C8 11 12 11 12 9 C12 11 16 11 16 9 C16 11 20 11 20 9"/><path d="M5 11 V20 H19 V11"/><path d="M10 20 V15 H14 V20"/>')],
  ['hogar', 'Mundo', ICONOS.leaf],
  ['ciudad', 'Ciudad', svg('<path d="M4 21 V9 L10 6 V21"/><path d="M10 21 V4 L20 8 V21"/><path d="M3 21 H21"/><path d="M13 10 H17 M13 14 H17"/>')],
  ['rankings', 'Ranking', svg('<path d="M8 21 H16 M12 17 V21"/><path d="M7 4 H17 V10 A5 5 0 0 1 7 10 Z"/><path d="M7 6 H4 V8 A3 3 0 0 0 7 11 M17 6 H20 V8 A3 3 0 0 1 17 11"/>')]
];
const TABS = ['inicio', 'ficha', 'inventario', 'tienda', 'hogar', 'ciudad', 'rankings', 'gacha', 'raid', 'mazmorra', 'clan'];
const PADRE = { gacha: 'inicio', raid: 'inicio', mazmorra: 'inicio', clan: 'inicio' };
const ACC = {
  minar:  { l: 'Mina de cristal', n: 'Minar',  ya: 'minar',  p: 'Minaste',  v: 'Minando…',  ic: 'mine', fx: 'golpe',   tot: 2700, z: '#c3bbdc', g: 'r' },
  talar:  { l: 'Bosque profundo', n: 'Talar',  ya: 'talar',  p: 'Talaste',  v: 'Talando…',  ic: 'chop', fx: 'tala', tot: 1800, z: '#8fc4ad', g: 'r' },
  pescar: { l: 'Lago lunar', n: 'Pescar', ya: 'pescar', p: 'Pescaste', v: 'Pescando…', ic: 'fish', fx: 'pesca',  tot: 2700, z: '#8fb4d6', g: 'r' },
  cazar:  { l: 'Coto de caza', n: 'Cazar',  ya: 'cazar',  p: 'Cazaste',  v: 'Cazando…',  ic: 'hunt', fx: 'apunta', tot: 3600, z: '#e8946a', g: 'r' },
  crimen: { n: 'Arriesgar', t: 'Crimen', d: 'Arriesga tu cartera por un gran botín.', ya: 'arriesgarte', p: '', v: 'Planeando el golpe…', ic: 'mask', fx: 'sigilo', tot: 7200, z: '#c9626f', g: 'c' },
  daily:  { n: 'Reclamar', t: 'Recompensa diaria', d: 'Tu premio del día y tu racha.', ya: 'reclamar tu recompensa diaria', p: '', v: 'Abriendo regalo…', ic: 'gift', fx: 'flotar', tot: 86400, z: '#e8a58e', g: 'c' },
  work:   { n: 'Trabajar', t: 'Trabajo', d: 'Monedas según tu empleo.', ya: 'trabajar', p: '', v: 'Trabajando…', ic: 'brief', fx: 'trabajo', tot: 3600, z: '#c3bbdc', g: 'c' }
};
const RAREZA = {
  comun: ['Común', '#a9b0c4'], poco: ['Poco común', '#8fc4ad'], rara: ['Rara', '#8fb4d6'],
  epica: ['Épica', '#b69be0'], legendaria: ['Legendaria', '#e0b96a']
};
const RAR_COFRE = { madera: '#a9b0c4', plata: '#8fb4d6', oro: '#e0b96a' };
const ARTE = {
  minar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="am" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2850"/><stop offset="1" stop-color="#141019"/></linearGradient></defs><rect width="160" height="88" fill="url(#am)"/><path d="M0 88 V54 L26 32 L46 48 L76 18 L106 50 L130 34 L160 58 V88Z" fill="#1b1442"/><circle cx="34" cy="64" r="18" fill="#e8946a" opacity=".2"/><rect x="33" y="60" width="2.4" height="14" fill="#6b4a2a"/><circle cx="34.2" cy="58" r="3" fill="#ffd28a"/><path d="M92 88 L99 58 L107 88Z" fill="#c3bbdc"/><path d="M106 88 L115 46 L124 88Z" fill="#cfe6fb"/><path d="M82 88 L87 68 L93 88Z" fill="#6a9fd0"/><path d="M126 88 L131 70 L137 88Z" fill="#6fa6d8"/></svg>',
  talar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="at" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a4a46"/><stop offset="1" stop-color="#101a1a"/></linearGradient></defs><rect width="160" height="88" fill="url(#at)"/><circle cx="128" cy="24" r="10" fill="#e6f7ee" opacity=".85"/><g fill="#0f3330"><path d="M14 88 L30 40 L46 88Z"/><path d="M22 66 L30 46 L38 66Z" fill="#14403b"/><path d="M60 88 L80 28 L100 88Z"/><path d="M96 88 L112 46 L128 88Z"/><path d="M126 88 L142 52 L158 88Z"/></g><g fill="#154a44"><path d="M66 70 L80 34 L94 70Z"/><path d="M102 74 L112 52 L122 74Z"/></g><rect y="70" width="160" height="18" fill="#8fc4ad" opacity=".08"/></svg>',
  pescar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3f66"/><stop offset="1" stop-color="#141a2c"/></linearGradient></defs><rect width="160" height="88" fill="url(#ap)"/><circle cx="120" cy="22" r="9" fill="#e8f3ff" opacity=".85"/><path d="M0 50 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V88 H0Z" fill="#23304f"/><path d="M0 66 q10 5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V88 H0Z" fill="#1a2340"/><path d="M54 52 q14 -34 36 0" fill="none" stroke="#8fb4d6" stroke-width="1" stroke-dasharray="2 3" opacity=".6"/><path d="M82 28 q6 -5 12 0 q-6 5 -12 0Z M94 28 L99 24 L99 32Z" fill="#cfe8ff"/><ellipse cx="30" cy="76" rx="9" ry="2.6" fill="#2f8a6a" opacity=".7"/><path d="M142 88 V58 M148 88 V62 M136 88 V64" stroke="#2f6a58" stroke-width="2"/></svg>',
  cazar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#352a4a"/><stop offset=".7" stop-color="#c95a5a"/><stop offset="1" stop-color="#e8946a"/></linearGradient></defs><rect width="160" height="88" fill="url(#ac)"/><circle cx="104" cy="58" r="20" fill="#ffd8a0" opacity=".9"/><path d="M0 88 V62 C30 50 60 56 90 64 C120 54 140 54 160 62 V88Z" fill="#2a1634"/><path d="M0 88 V74 C40 68 80 76 160 70 V88Z" fill="#0f1a2c"/><g stroke="#0f1a2c" stroke-width="1.5" stroke-linecap="round"><path d="M12 88 L10 76 M18 88 L19 74 M124 88 L122 76 M132 88 L134 74 M142 88 L140 78"/></g><path d="M28 38 L72 24 M28 38 L24 34 M28 38 L24 42" fill="none" stroke="#fff3d6" stroke-width="1.4" stroke-linecap="round"/></svg>'
};
const IC_STAT = {
  fuerza: svg('<path d="M20 4 L9 15"/><path d="M20 4 L20 9 M20 4 L15 4"/><path d="M7 13 L11 17"/><path d="M9 15 L5 19"/>'),
  vigor: svg('<path d="M12 20 C5 14 3 11 3 8 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 21 8 C21 11 19 14 12 20Z"/>'),
  suerte: svg('<path d="M12 3 L14.5 9.5 L21 12 L14.5 14.5 L12 21 L9.5 14.5 L3 12 L9.5 9.5Z"/>')
};
const TIPOS_W = { arma: ['Arma', '🗡️'], armadura: ['Armadura', '🛡️'], amuleto: ['Amuleto', '📿'] };
function slot(emo, o = {}) {
  return `<div class="slot ${o.cls || ''}" style="--r:${o.col || 'rgba(195,187,220,.4)'}"><span class="si">${esc(emo)}</span>${o.n !== undefined ? `<b class="n">${o.n}</b>` : ''}</div>`;
}
const MEDALLA = ['🥇', '🥈', '🥉'];
const medalla = i => MEDALLA[i] || (i + 1) + '.';
const escena = u => {
  const ola = (y, a, x0) => `M${x0} ${y} q25 ${a} 50 0${' t50 0'.repeat(11)} V240 H${x0}Z`;
  return `<svg class="esc" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs>
<linearGradient id="c${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1426"/><stop offset=".45" stop-color="#4a3254"/><stop offset=".8" stop-color="#8a5670"/><stop offset="1" stop-color="#e3a083"/></linearGradient>
<radialGradient id="l${u}"><stop offset="0" stop-color="#f3c4a8" stop-opacity=".9"/><stop offset="1" stop-color="#f3c4a8" stop-opacity="0"/></radialGradient>
<linearGradient id="m${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2038"/><stop offset="1" stop-color="#100d17"/></linearGradient>
</defs>
<rect width="400" height="158" fill="url(#c${u})"/>
<g fill="#fff"><circle cx="24" cy="26" r="1.1" opacity=".8"/><circle cx="68" cy="52" r=".9" opacity=".6"/><circle cx="112" cy="20" r="1.2" opacity=".9"/><circle cx="170" cy="44" r=".8" opacity=".6"/><circle cx="206" cy="18" r="1" opacity=".8"/><circle cx="250" cy="40" r="1.2" opacity=".7"/><circle cx="352" cy="22" r="1" opacity=".7"/><circle cx="380" cy="58" r=".9" opacity=".6"/></g>
<circle cx="296" cy="112" r="64" fill="url(#l${u})"/><circle cx="296" cy="112" r="24" fill="#f3d2b8"/><g fill="#8a5670"><rect x="270" y="113" width="52" height="2.4"/><rect x="270" y="120" width="52" height="3.4"/><rect x="270" y="128" width="52" height="5"/></g>
<path d="M10 160V140H36V160ZM36 160V130H56V160ZM70 160V138H94V160ZM96 160V126H114V160ZM138 160V132H162V160ZM170 160V122H190V160ZM196 160V134H222V160ZM232 160V126H254V160ZM256 160V136H274V160ZM276 160V124H302V160ZM306 160V134H326V160ZM332 160V120H356V160ZM360 160V132H382V160ZM382 160V124H400V160Z" fill="#6b4f7a" opacity=".55"/>
<path d="M0 158V132H22V158ZM22 158V118H40V158ZM40 158V128H64V158ZM64 158V106H80V158ZM80 158V124H100V158ZM140 158V114H160V158ZM160 158V128H178V158ZM178 158V102H204V158ZM204 158V120H220V158ZM220 158V130H242V158ZM242 158V112H260V158ZM260 158V124H284V158ZM284 158V108H300V158ZM300 158V128H322V158ZM322 158V110H340V158ZM340 158V122H364V158ZM364 158V104H384V158ZM384 158V126H400V158Z" fill="#1a1426"/>
<path d="M114 158V84H124V158Z M106 158V124H132V158Z" fill="#14101d"/>
<path d="M117 84L119 58L121 84Z" fill="#14101d"/>
<circle cx="119" cy="56" r="2.2" fill="#ffd9c4"/><circle cx="119" cy="56" r="7" fill="#ffd9c4" opacity=".25"/>
<g fill="#ffd9a8" opacity=".85"><rect x="26" y="128" width="1.6" height="1.6"/><rect x="30" y="122" width="1.6" height="1.6"/><rect x="45" y="134" width="1.6" height="1.6"/><rect x="68" y="112" width="1.6" height="1.6"/><rect x="72" y="120" width="1.6" height="1.6"/><rect x="86" y="130" width="1.6" height="1.6"/><rect x="144" y="120" width="1.6" height="1.6"/><rect x="148" y="128" width="1.6" height="1.6"/><rect x="182" y="112" width="1.6" height="1.6"/><rect x="188" y="118" width="1.6" height="1.6"/><rect x="194" y="130" width="1.6" height="1.6"/><rect x="208" y="126" width="1.6" height="1.6"/><rect x="224" y="136" width="1.6" height="1.6"/><rect x="246" y="122" width="1.6" height="1.6"/><rect x="264" y="132" width="1.6" height="1.6"/><rect x="288" y="116" width="1.6" height="1.6"/><rect x="304" y="134" width="1.6" height="1.6"/><rect x="326" y="120" width="1.6" height="1.6"/><rect x="344" y="130" width="1.6" height="1.6"/><rect x="368" y="110" width="1.6" height="1.6"/><rect x="372" y="124" width="1.6" height="1.6"/><rect x="388" y="138" width="1.6" height="1.6"/><rect x="117" y="96" width="1.6" height="1.6"/><rect x="117" y="104" width="1.6" height="1.6"/><rect x="117" y="112" width="1.6" height="1.6"/><rect x="117" y="120" width="1.6" height="1.6"/><rect x="110" y="132" width="1.6" height="1.6"/><rect x="124" y="134" width="1.6" height="1.6"/></g>
<rect y="150" width="400" height="90" fill="url(#m${u})"/>
<g class="ola"><path d="${ola(178, -9, -100)}" fill="#2a2038" opacity=".75"/></g>
<g class="ola b"><path d="${ola(198, 8, -100)}" fill="#1d1628" opacity=".9"/></g>
<path d="${ola(218, -7, 0)}" fill="#100d17"/>
</svg>`;
};
const inicial = d => (d.alias || '?').trim().charAt(0).toUpperCase() || '?';
const fotoImg = d => d.foto ? `<img src="${API}/api/foto?v=${d.foto}" alt="" decoding="async" onerror="this.remove()">` : '';
function avatar(d, t, nv) {
  const pct = d.xpSig ? Math.min(100, d.xp / d.xpSig * 100) : 0;
  return `<div class="ava" style="--t:${t}px"><svg class="anillo" viewBox="0 0 100 100" aria-hidden="true"><circle class="pista" cx="50" cy="50" r="46"/><circle class="nv" cx="50" cy="50" r="46" pathLength="100" stroke-dasharray="${pct.toFixed(1)} 100"/></svg><div class="ava-i"><span>${esc(inicial(d))}</span>${fotoImg(d)}</div>${nv ? `<b class="lv">${d.nivel}</b>` : ''}</div>`;
}
const cerrados = new Set(['heroe', 'mascota', 'clan', 'coleccion', 'reliquias', 'materiales', 'lote']);
const sec = (k, t, extra, html) => `<details class="sd" data-k="${k}" ${cerrados.has(k) ? '' : 'open'}><summary><h2>${t}</h2><span class="ex">${extra || ''}</span><i class="chev"></i></summary><div class="cuerpo">${html}</div></details>`;
document.addEventListener('toggle', e => {
  const d = e.target;
  if (d.matches && d.matches('details.sd')) { if (d.open) cerrados.delete(d.dataset.k); else cerrados.add(d.dataset.k); }
}, true);
const TAB_DE = { Mochila: 'inventario', Tienda: 'tienda', Mundo: 'hogar', Ciudad: 'ciudad', Rankings: 'rankings' };
const cab = (t, s, st) => {
  const nav = NAV.find(n => n[0] === TAB_DE[t]);
  const cifrasT = st || (me ? [['Monedas', fmt(me.monedas)], ['Nivel', me.nivel]] : []);
  const fila = cifrasT.length ? `<div class="cab-st">${cifrasT.map(([n, v]) => `<div><b>${esc(String(v))}</b><span>${esc(n)}</span></div>`).join('')}</div>` : '';
  return `<div class="cabp cab-t"><div class="cab-top">${nav ? `<span class="cab-i" aria-hidden="true">${nav[2]}</span>` : ''}<div><h1 class="pag">${t}</h1>${s ? `<p class="mut">${s}</p>` : ''}</div></div>${fila}</div>`;
};
const cifras = lista => `<div class="cifras">${lista.map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('')}</div>`;
const segHtml = (aria, ops, sel, attr) => `<div class="seg" role="group" aria-label="${aria}">${ops.map(([k, n]) => `<button type="button" data-${attr}="${k}" aria-pressed="${k === sel}">${esc(n)}</button>`).join('')}</div>`;


window.addEventListener('online', () => { if (me && !document.hidden) { refrescar(); if (tabActual !== 'inicio') abrir(tabActual, true); } });

function petalos(n, modo) {
  if (reducir) return;
  const c = $('#petalas'), r = Math.random;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'), s = 10 + r() * 12;
    p.className = modo;
    p.style.cssText = modo === 'ambiente'
      ? `--l:${r() * 100}%;--s:${s}px;--d:${9 + r() * 8}s;--dl:${-r() * 14}s;--dx:${(r() - .5) * 160}px;--r:${360 + r() * 360}deg`
      : `--s:${s}px;--x:${(r() - .5) * 360}px;--y:${-140 + r() * 340}px;--r:${(r() - .5) * 720}deg;left:50%;top:62%`;
    c.appendChild(p);
    if (modo === 'estallido') setTimeout(() => p.remove(), 1500);
  }
}
const quitarAmbiente = () => document.querySelectorAll('#petalas .ambiente').forEach(p => p.remove());

let me = null, fin = {}, tot = {}, previa = {}, ocupado = false, saltar = null, enviando = false;
let tabActual = 'inicio', rankSel = 'monedas', abiertas = [], abiertasVistas = new Set(), sondeando = false, eventos = {}, eventosT = 0, cargandoEventos = false, gachaVencida = false, publicando = false, avisosOn = false, refrescandoClima = false;

function leerAvisos() { try { return localStorage.getItem('isla_avisos') === '1'; } catch (_) { return false; } }
function guardarAvisos(v) { try { localStorage.setItem('isla_avisos', v ? '1' : '0'); } catch (_) {} }
function leerProx() { try { return localStorage.getItem('isla_aviso_raid') === '1'; } catch (_) { return false; } }
let vioProx = leerProx();
function anunciarRaid() {
  if (vioProx) return;
  vioProx = true;
  try { localStorage.setItem('isla_aviso_raid', '1'); } catch (_) {}
  const msg = '👹 ¡Llegó el Raid! Ataca al jefe de tu grupo desde Inicio › Raid.';
  setTimeout(() => {
    if (document.hidden && avisosActivos()) {
      try { new Notification('Isla', { body: msg, icon: '/logo-favicon.png', tag: 'isla-raid' }); } catch (_) {}
    } else aviso(msg, 6000);
  }, 1500);
}
const avisosActivos = () => avisosOn && 'Notification' in window && Notification.permission === 'granted';
function pintarCampana() {
  const b = $('#campana');
  if (!('Notification' in window)) { b.hidden = true; return; }
  const on = avisosActivos();
  b.hidden = false;
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Desactivar avisos' : 'Activar avisos');
  b.title = on ? 'Avisos activados' : 'Activar avisos';
}
async function alternarAvisos() {
  if (avisosActivos()) { avisosOn = false; guardarAvisos(false); return pintarCampana(); }
  const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (p !== 'granted') { aviso('Los avisos están bloqueados en tu navegador.'); return pintarCampana(); }
  avisosOn = true; guardarAvisos(true); pintarCampana();
  aviso('Te avisaré cuando una acción esté lista.');
}

function vista(v) {
  const p = v === 'panel';
  $('#v-login').hidden = v !== 'login';
  $('#v-panel').hidden = !p;
  $('#top-der').hidden = !p;
  $('#nav').hidden = !p;
  $('#app').classList.toggle('con-nav', p);
  quitarAmbiente();
  if (v === 'login') { petalos(14, 'ambiente'); document.title = TITULO; }
}
function aviso(txt, ms) {
  const t = $('#toast'); if (!t) return; t.textContent = txt; t.hidden = false;
  clearTimeout(aviso.t); aviso.t = setTimeout(() => (t.hidden = true), ms || 3500);
}
function limpiarTabs() { IslaBridge.setMe(null); eventos = {}; eventosT = 0; abiertas = []; abiertasVistas.clear(); store.reiniciar(); }
function sesionCaducada() {
  me = null; store.vaciar(); limpiarTabs();
  aviso('Tu sesión caducó. Conéctate de nuevo.');
  vista('login');
}

function multChip(m) {
  if (m === undefined || m === null) return '';
  const cls = m > 1 ? 'up' : m < 1 ? 'down' : '';
  return `<span class="mx ${cls}">x${Number(m).toFixed(2)}</span>`;
}

function pintarClima(c) {
  setText('#cc-em', c.emoji);
  setText('#cc-nom', c.nombre + (c.raro ? ' · raro' : ''));
  setText('#cc-desc', c.desc);
  setText('#cc-sig', c.siguiente.emoji + ' ' + c.siguiente.nombre);
  $('#cc-resta').dataset.fin = Date.now() + c.faltaS * 1000;
  $('#lluvia').hidden = !/lluv|torment/i.test(c.nombre);
}

let botAntes = true;
let animMon = 0;
function contarMonedas(desde, hasta) {
  const el = $('#monedas'), caja = el.parentElement;
  if (!el) return;
  if (desde === null || desde === hasta || reducir) { el.textContent = fmt(hasta); return; }
  const t0 = performance.now(), id = ++animMon;
  caja.classList.remove('sube', 'baja');
  void caja.offsetWidth;
  caja.classList.add(hasta > desde ? 'sube' : 'baja');
  const paso = t => {
    if (id !== animMon) return;
    const p = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(desde + (hasta - desde) * e));
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
function aplicar(d) {
  const prevMon = me ? me.monedas : null;
  if (d.bot === false && botAntes) aviso('El bot está reconectando. Algunas acciones pueden tardar.');
  botAntes = d.bot !== false;
  me = d; IslaBridge.setMe(d); fin = {}; tot = {};
  for (const k in ACC) { fin[k] = Date.now() + (d.esperas[k] || 0) * 1000; if (d.totales ? d.totales[k] !== undefined : true) tot[k] = d.totales ? d.totales[k] : ACC[k].tot; }
  setText('#alias', d.alias);
  setText('#nivel', 'Nivel ' + d.nivel);
  setText('#xp', fmt(d.xp) + ' / ' + fmt(d.xpSig) + ' XP');
  contarMonedas(prevMon, d.monedas);
  $('#xpbar').style.width = Math.min(100, d.xp / d.xpSig * 100) + '%';
  $('#hero-ava').innerHTML = avatar(d, 84, true);
  $('#top-ava').innerHTML = esc(inicial(d)) + fotoImg(d);
  pintarHud(d);
  pintarEvento(d.evento);
  if (d.clima) pintarClima(d.clima);
  montarMultiplicadores();
  tick();
  anunciarRaid();
  cargarEventos();
  sondearAbiertas();
}
function pintarEvento(e) {
  const caja = $('#evento-x2');
  if (!e || !e.activo || !(e.restaS > 0)) { caja.hidden = true; return; }
  caja.dataset.fin = Date.now() + e.restaS * 1000;
  setText('#ev-mult', 'x' + e.mult);
  $('#ev-resta').dataset.fin = caja.dataset.fin;
  caja.hidden = false;
}
function pintarHud(d) {
  const h = $('#hud');
  if (!d.stats) { h.hidden = true; return; }
  const chip = (k, n) => `<div class="chip-s" title="${n}">${IC_STAT[k]}<b>${d.stats[k]}</b><span>${n}</span></div>`;
  const clase = d.clase ? `<div class="clase-b"><span>${esc(d.clase.emoji)}</span>${esc(d.clase.nombre)}</div>` : '';
  const en = d.energia ? `<div class="en"><span class="pips">${'<i class="pip on"></i>'.repeat(d.energia.n)}${'<i class="pip"></i>'.repeat(Math.max(0, d.energia.max - d.energia.n))}</span><span class="mut peq">Energía</span></div>` : '';
  const est = d.prestigio ? `<span class="estrella" title="Prestigio">${'★'.repeat(Math.min(d.prestigio, 10))}</span>` : '';
  h.innerHTML = clase + chip('fuerza', 'Fuerza') + chip('vigor', 'Vigor') + chip('suerte', 'Suerte') + est + en;
  h.hidden = false;
}
function tarjetaAcc(k, a) {
  const aro = `<div class="aro"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="pista" cx="32" cy="32" r="29"/><circle class="prog" id="r-${k}" cx="32" cy="32" r="29"/></svg>${ICONOS[a.ic]}</div>`;
  if (a.g === 'c') {
    return `<div class="ticket" id="c-${k}" style="--z:${a.z}">${aro}
      <div class="tx"><h3>${a.t}</h3><p class="est"><i></i><span id="t-${k}">Listo</span></p><span id="m-${k}"></span><p class="mut peq">${a.d}</p></div>
      <button class="accion" data-a="${k}">${a.n}</button></div>`;
  }
  return `<div class="zona" id="c-${k}" style="--z:${a.z}"><div class="arte">${ARTE[k]}<span class="zn">${a.l}</span>${aro}</div>
    <div class="zc"><p class="est"><i></i><span id="t-${k}">Listo</span></p><span id="m-${k}"></span>
    <button class="accion" data-a="${k}">${a.n}</button></div></div>`;
}
function montar() {
  const por = g => Object.entries(ACC).filter(([, a]) => a.g === g).map(([k, a]) => tarjetaAcc(k, a)).join('');
  $('#rejilla').innerHTML = por('r');
  $('#recompensas').innerHTML = por('c');
  $('#nav').innerHTML = '<div class="in">' + NAV.map(([k, n, ic]) => `<button type="button" data-t="${k}" ${k === 'inicio' ? 'aria-current="page"' : ''}>${ic}<span>${n}</span><i class="pt" id="pt-${k}" hidden></i></button>`).join('') + '</div>';
  const ICO_ATAJO = { inventario: NAV[1][2], tienda: NAV[2][2], hogar: NAV[3][2], ciudad: NAV[4][2], rankings: NAV[5][2], ficha: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21"/>') };
  document.querySelectorAll('[data-ic]').forEach(e => { e.innerHTML = ICO_ATAJO[e.dataset.ic] || ''; });
  $('#esc-hero').innerHTML = escena('h');
  $('#esc-login').innerHTML = escena('l');
}
function montarMultiplicadores() {
  const mult = me && me.clima ? me.clima.mult : {};
  for (const k in ACC) { const el = $('#m-' + k); if (el) el.innerHTML = multChip(mult[k]); }
}

function notificar(k) {
  const msg = 'Ya puedes ' + ACC[k].ya + '.';
  if (document.hidden || !document.hasFocus()) {
    if (avisosActivos()) {
      try { new Notification('Isla', { body: msg, icon: '/logo-favicon.png', tag: 'isla-' + k }); } catch (_) {}
    }
  } else if (tabActual !== 'inicio') {
    aviso(msg);
  }
}

function avisarGacha(msg, etiqueta) {
  if (document.hidden || !document.hasFocus()) {
    if (avisosActivos()) {
      try { new Notification('Isla · Gacha', { body: msg, icon: '/logo-favicon.png', tag: etiqueta }); } catch (_) {}
    }
  } else {
    aviso(msg, 5000);
  }
}
async function sondearAbiertas() {
  if (!me || sondeando) return;
  sondeando = true;
  try {
    const d = await api('/api/gacha/abiertas');
    const base = Date.now();
    const nuevas = d.abiertas.map(a => ({ id: a.id, carta: a.carta, por: a.por, fin: base + a.restaS * 1000 }));
    const cambio = nuevas.map(a => a.id).join() !== abiertas.map(a => a.id).join();
    abiertas = nuevas;
    for (const a of nuevas) {
      if (abiertasVistas.has(a.id)) continue;
      abiertasVistas.add(a.id);
      avisarGacha('🎴 ' + a.por + ' invocó a ' + a.carta.nombre + '. ¡Reclámala antes que otro!', 'isla-gacha-' + a.id);
    }
    for (const p of d.perdidas) avisarGacha('😬 ' + p.por + ' te ganó a ' + p.nombre + '.', 'isla-gacha-perdida-' + p.nombre);
    if (d.perdidas.length) { cargarEventos(true); if (tabActual === 'gacha') { delete cargado.gacha; abrir('gacha', true); return; } }
    if (cambio && tabActual === 'gacha' && S.gachaSel === 'invocar') dibujar('gacha');
  } catch (_) {
  } finally { sondeando = false; }
}
setInterval(() => {
  if (me && !ocupado && !publicando && (!document.hidden || avisosActivos())) sondearAbiertas();
}, 6000);

async function cargarEventos(forzar) {
  if (!me || cargandoEventos || (!forzar && Date.now() - eventosT < 10000)) return;
  cargandoEventos = true;
  try {
    const [g, r] = await Promise.all([api('/api/gacha').catch(() => null), api('/api/raid').catch(() => null)]);
    const base = Date.now();
    if (g) eventos.gacha = { fin: base + g.esperaS * 1000, pend: g.pendiente ? base + g.pendiente.restaS * 1000 : 0, trato: g.trato ? base + g.trato.restaS * 1000 : 0 };
    if (r) {
      const vivos = (r.raids || []).filter(x => !x.dormido);
      eventos.raid = { n: vivos.length, fin: vivos.length ? Math.min(...vivos.map(x => base + x.esperaS * 1000)) : 0 };
    }
    eventosT = Date.now();
    gachaVencida = false;
  } finally { cargandoEventos = false; }
}
function tickEventos(ahora) {
  let n = 0;
  const g = eventos.gacha, r = eventos.raid;
  if (g) {
    const pend = g.pend > ahora;
    const trato = g.trato > ahora;
    const ab = abiertas.filter(a => a.fin > ahora);
    if (ab.length !== abiertas.length) {
      abiertas = ab;
      if (tabActual === 'gacha' && S.gachaSel === 'invocar') dibujar('gacha');
    }
    const rest = Math.max(0, Math.ceil((g.fin - ahora) / 1000));
    const lista = pend || trato || ab.length > 0 || rest === 0;
    const p = $('#p-gacha');
    if (p) {
      if (p.dataset.base === undefined) p.dataset.base = p.textContent;
      p.textContent = pend ? 'Tienes una carta esperando. ¡Reclámala!' : ab.length ? ab[0].por + ' invocó a ' + ab[0].carta.nombre + '. ¡Reclámala!' : trato ? 'Te propusieron un cambio de cartas.' : p.dataset.base;
    }
    const cg = $('#c-gacha'); if (cg) cg.classList.toggle('espera', !lista);
    setText('#b-gacha', pend || ab.length ? 'Reclamar' : trato ? 'Ver trato' : rest === 0 ? 'Invocar' : dur(rest));
    if (lista) n++;
    if ((g.pend && !pend || g.trato && !trato) && !gachaVencida) { gachaVencida = true; cargarEventos(true); }
  }
  if (r) {
    const rest = Math.max(0, Math.ceil((r.fin - ahora) / 1000));
    const lista = r.n > 0 && rest === 0;
    const cr = $('#c-raid'); if (cr) cr.classList.toggle('espera', !lista);
    setText('#b-raid', r.n === 0 ? 'Ver jefes' : rest === 0 ? 'Atacar' : dur(rest));
    if (lista) n++;
  }
  const fin = document.querySelector('[data-gc-fin]');
  if (fin && tabActual === 'gacha' && ahora >= Number(fin.dataset.gcFin) && !ocupado && !publicando) {
    fin.removeAttribute('data-gc-fin');
    delete cargado.gacha;
    abrir('gacha', true);
  }
  return n;
}
function tick() {
  if (!me) return;
  const ahora = Date.now();
  document.querySelectorAll('button[data-listo]').forEach(b => {
    const rest = Number(b.dataset.listo) - ahora;
    b.setAttribute('aria-disabled', String(rest > 0));
    b.textContent = rest > 0 ? b.dataset.txt + ' · ' + dur(rest / 1000) : b.dataset.txt;
  });
  let listas = 0, menor = Infinity;
  for (const k in ACC) {
    const rest = Math.max(0, Math.ceil((fin[k] - ahora) / 1000)), lista = rest === 0;
    const c = $('#c-' + k);
    if (!c) continue;
    const b = c.querySelector('button');
    if (!b) continue;
    c.hidden = tot[k] === undefined;
    if (c.hidden) continue;
    c.classList.toggle('espera', !lista);
    setText('#t-' + k, lista ? 'Listo' : mmss(rest));
    b.textContent = lista ? ACC[k].n : 'En espera';
    b.setAttribute('aria-disabled', String(!lista));
    const aro = $('#r-' + k); if (aro) aro.style.strokeDashoffset = lista ? 182 : Math.round(182 * rest / tot[k]);
    if (lista) listas++; else menor = Math.min(menor, rest);
    if (previa[k] === false && lista) notificar(k);
    previa[k] = lista;
  }
  listas += tickEventos(ahora);
  const vis = [...document.querySelectorAll('#rejilla .zona:not([hidden])')];
  vis.forEach(z => z.classList.remove('ancha'));
  if (vis.length % 2) vis[vis.length - 1].classList.add('ancha');
  document.querySelectorAll('[data-fin]').forEach(e => { e.textContent = dur((Number(e.dataset.fin) - ahora) / 1000); });
  const evx = $('#evento-x2');
  if (!evx.hidden && Number(evx.dataset.fin) <= ahora) evx.hidden = true;
  document.title = listas ? '(' + listas + ') Listo · Isla' : menor < Infinity ? mmss(menor) + ' · Isla' : TITULO;
  document.querySelectorAll('[data-n-listas]').forEach(e => { e.textContent = listas; });
  const pt = $('#pt-inicio');
  if (pt) pt.hidden = !listas;
  const cf = Number($('#cc-resta').dataset.fin);
  if (cf && ahora >= cf && !refrescandoClima && !ocupado) {
    refrescandoClima = true;
    setTimeout(() => { refrescar().finally(() => { refrescandoClima = false; }); }, 1500);
  }
}
setInterval(tick, 1000);

let refrescoEnCurso = null;
async function refrescar() {
  if (refrescoEnCurso) return refrescoEnCurso;
  refrescoEnCurso = (async () => {
    try { aplicar(await api('/api/me')); }
    catch (e) { if (e.estado === 401) sesionCaducada(); }
    finally { refrescoEnCurso = null; }
  })();
  return refrescoEnCurso;
}
setInterval(() => {
  if (me && !ocupado && (!document.hidden || avisosActivos())) refrescar();
}, 30000);

function animar(k) {
  const a = ACC[k], d = $('#dib');
  d.className = 'dib ' + a.fx;
  $('#aicono').className = 'ic';
  $('#aicono').innerHTML = ICONOS[a.ic];
  setText('#acap', a.v);
  const ch = d.querySelector('.chispas');
  if (!ch.children.length) ch.innerHTML = Array.from({ length: 8 }, (_, i) => `<i style="--a:${i * 45}deg;--n:${i}"></i>`).join('');
  $('#anim').hidden = false;
}
const esperaAnim = () => new Promise(r => { saltar = r; setTimeout(r, reducir ? 300 : 1600); });
$('#anim').addEventListener('click', () => saltar && saltar());

async function jugar(k) {
  if (ocupado) return;
  const rest = Math.ceil((fin[k] - Date.now()) / 1000);
  if (rest > 0) return aviso('Aún faltan ' + mmss(rest) + ' para volver a ' + ACC[k].ya + '.');
  ocupado = true; animar(k);
  try {
    const [d] = await Promise.all([api('/api/rpg/' + k, {}), esperaAnim()]);
    $('#anim').hidden = true;
    store.vaciar();
    aplicar(d.me); mostrar(k, d.resultado);
  } catch (e) {
    $('#anim').hidden = true;
    if (e.estado === 401) sesionCaducada();
    else { aviso(e.message); refrescar(); }
  } finally { ocupado = false; }
}
function hoja(o) {
  const col = o.col || RAREZA.comun[1];
  const im = $('#h-carta');
  im.hidden = !o.imagen;
  if (o.imagen) im.src = o.imagen; else im.removeAttribute('src');
  $('#h-icono').innerHTML = o.icono || '';
  $('#halo').style.setProperty('--col', col);
  $('#halo').style.color = col;
  setText('#h-zona', o.zona || '');
  setText('#h-titulo', o.titulo);
  const rz = $('#h-rareza'); if (rz) { rz.textContent = o.rareza ? 'Rareza: ' + o.rareza : ''; rz.style.color = col; }
  const chips = $('#h-chips'); if (chips) chips.replaceChildren(...(o.chips || []).map(t => { const s = document.createElement('span'); s.textContent = t; return s; }));
  setText('#h-espera', o.pie || '');
  setText('#h-ok', o.boton || 'Volver a acciones');
  const caja = $('#hoja .hoja');
  caja.classList.toggle('mal', !!o.mal);
  caja.classList.toggle('leg', !o.mal && o.rareza === 'Legendaria');
  caja.classList.toggle('nivel', !!o.nivel);
  $('#hoja').hidden = false;
  petalos(o.mal ? 0 : o.nivel ? 60 : o.rareza === 'Legendaria' ? 44 : 26, 'estallido');
  $('#h-ok').focus();
}
function resumen(k, r) {
  const recolecta = ACC[k] ? ACC[k].g === 'r' : true;
  const rr = recolecta && r.rareza ? RAREZA[r.rareza] : null;
  const nom = rr ? rr[0] : '';
  const col = rr ? rr[1] : RAREZA.comun[1];
  const chips = [];
  if (r.monedas) chips.push((r.monedas > 0 ? '+' : '−') + fmt(Math.abs(r.monedas)) + ' monedas');
  if (r.xp) chips.push('+' + fmt(r.xp) + ' XP');
  if (r.subioNivel) chips.push('Subiste al nivel ' + r.subioNivel);
  if (r.evento) chips.push(r.evento);
  if (r.guardian && k !== 'cazar') chips.push(r.guardian.gana ? 'Derrotaste a ' + r.guardian.nombre : r.guardian.nombre + ' te hizo retroceder');
  if (r.extra) chips.push(...r.extra);
  const mal = r.monedas < 0 || !!(r.guardian && !r.guardian.gana);
  return { chips, nom, col: mal ? '#dd8591' : col, mal, nivel: !!r.subioNivel };
}
function mostrar(k, r) {
  const { chips, nom, col, mal, nivel } = resumen(k, r);
  vibra(mal ? 70 : nivel ? [20, 40, 20, 40, 30] : [18, 40, 18]);
  hoja({
    icono: ICONOS[ACC[k].ic], col, mal, nivel, rareza: nom, chips, titulo: r.titulo,
    zona: ACC[k].p ? ACC[k].p + ' en ' + r.zona : r.zona,
    pie: r.espera ? 'Podrás volver en ' + dur(r.espera) + '.' : ''
  });
}
$('#h-ok').addEventListener('click', () => { $('#hoja').hidden = true; });
$('#t-inicio').addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b) jugar(b.dataset.a); });
$('#campana').addEventListener('click', alternarAvisos);

const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
const cuenta = (s, base) => `<b data-fin="${base + s * 1000}">${dur(s)}</b>`;
const barra = (v, m, cls) => `<div class="barra ${cls || ''}"><div style="width:${m ? Math.min(100, v / m * 100) : 0}%"></div></div>`;
const vacio = txt => `<p class="vacio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18 C6 15 9 15 12 18 C15 21 18 21 21 18"/><path d="M12 15 V8"/><path d="M12 8 C10 5.5 8 5.5 6.5 6.5 M12 8 C14 5.5 16 5.5 17.5 6.5"/></svg>${txt}</p>`;
const esqueleto = () => '<div class="vacio esq" role="status" aria-busy="true" aria-label="Cargando"><div class="esq-cab"></div><div class="esq-fila"><i></i><i></i><i></i></div><div class="esq-b"></div><div class="esq-b"></div><div class="esq-b corto"></div></div>';
const chipsF = (attr, ops, sel, aria) => `<div class="filtros" role="group" aria-label="${aria}">${ops.map(([k, n, c]) => `<button type="button" class="fch" data-${attr}="${k}" aria-pressed="${k === sel}">${esc(n)}${c !== undefined ? ` <i>${c}</i>` : ''}</button>`).join('')}</div>`;
let invFiltro = 'todo', eqFiltro = 'todo';
const titulo = (t, extra) => `<div class="sec"><h2>${t}</h2>${extra || ''}</div>`;

function pintarFicha(d, base) {
  const avisos = [];
  if (d.stats.libres) avisos.push(`🎯 Tienes <b>${d.stats.libres}</b> punto${d.stats.libres === 1 ? '' : 's'} de atributo libre${d.stats.libres === 1 ? '' : 's'}. Repártelos en la sección Héroe.`);
  if (d.talentosLibres) avisos.push(`🌳 Tienes <b>${d.talentosLibres}</b> punto${d.talentosLibres === 1 ? '' : 's'} de talento libre${d.talentosLibres === 1 ? '' : 's'}. Úsalos en la sección Héroe.`);
  const heroe = d.clase
    ? kv('Clase', esc(d.clase.emoji) + ' ' + esc(d.clase.nombre)) + `<p class="mut peq" style="padding:2px 0 6px">${esc(d.clase.desc)}</p>` +
      kv('Energía', `<span class="pips">${'<i class="pip on"></i>'.repeat(d.energia.n)}${'<i class="pip"></i>'.repeat(Math.max(0, d.energia.max - d.energia.n))}</span> ${d.energia.n}/${d.energia.max}`) +
      (d.energia.n < d.energia.max ? kv('Próxima energía', cuenta(d.energia.faltaS, base)) : '')
    : `<p class="mut peq">Sin clase todavía. Se elige desde el nivel ${d.nivelClase} en la sección Héroe.</p>`;
  const m = d.mascota;
  const mascota = m
    ? kv('Mascota', esc(m.emoji) + ' ' + esc(m.nombre) + (m.activa ? '' : '<span class="etiq nar">Descansando</span>')) +
      kv('Nivel', m.nivel + '/' + m.max) + `<p class="mut peq" style="padding:2px 0 0">${esc(m.tipo)}: ${esc(m.desc)}${m.activa ? '' : '. Aliméntala con /pet para reactivar su bono.'}</p>`
    : '<p class="mut peq">Aún no tienes mascota. Adopta una con /pet en WhatsApp.</p>';
  const c = d.clan;
  const clan = c
    ? kv('Clan', esc(c.nombre) + (c.lider ? '<span class="etiq">Líder</span>' : '')) +
      kv('Nivel del clan', 'Nv ' + c.nivel) + kv('Miembros', c.miembros + '/' + c.cupo) + kv('Banco del clan', fmt(c.banco) + ' monedas') +
      kv('Bono de ingresos', '+' + c.bono + '%') +
      kv('Guerra de clanes', fmt(c.guerra.pts) + ' pts' + (c.guerra.puesto ? ' · puesto ' + c.guerra.puesto : '')) +
      kv('Cierra en', cuenta(c.guerra.cierraS, base)) +
      (c.guerra.pts < c.guerra.min ? `<p class="mut peq" style="padding-top:6px">Faltan ${fmt(c.guerra.min - c.guerra.pts)} puntos para entrar a los premios.</p>` : '')
    : '<p class="mut peq">No perteneces a ningún clan. Crea uno o únete con /clan.</p>';
  const activos = [];
  if (d.boosts.escudoS) activos.push(kv('Escudo anti-robo', cuenta(d.boosts.escudoS, base)));
  if (d.boosts.xpS) activos.push(kv('Boost de XP x2', cuenta(d.boosts.xpS, base)));
  const fin = cifras([['Cartera', fmt(d.cartera)], ['Banco', fmt(d.banco)], ['Total', fmt(d.total)]]) +
    `<div class="bloque vidrio">${kv('Bono de ingresos', '+' + d.bonoIngresos + '%')}${kv('Prestigio', d.prestigio.n + '/' + d.prestigio.max + (d.prestigio.bono ? ' · +' + d.prestigio.bono + '%' : ''))}</div>`;
  const filaStat = (k, n, v) => `<div class="stat-r"><span class="si-ic">${IC_STAT[k]}</span><div><div class="fila"><span>${n}</span><b>${v}</b></div>${barra(v, Math.max(10, v * 1.25))}</div></div>`;
  const atr = `<div class="bloque vidrio">${filaStat('fuerza', 'Fuerza', d.stats.fuerza)}${filaStat('vigor', 'Vigor', d.stats.vigor)}${filaStat('suerte', 'Suerte', d.stats.suerte)}</div>`;
  const col = `<div class="bloque vidrio">${kv('Reliquias', d.reliquias.n + '/' + d.reliquias.total)}${kv('Hogar', d.hogar ? esc(d.hogar.emoji) + ' ' + esc(d.hogar.nombre) : 'Sin hogar')}${kv('Récord de mazmorra', d.mazmorra ? 'Piso ' + d.mazmorra : 'Sin explorar')}</div>`;
  return `${avisos.length ? `<div class="aviso-i">${avisos.join('<br>')}</div>` : ''}
    ${sec('finanzas', 'Finanzas', '', fin)}
    ${sec('atributos', 'Atributos', '', atr)}
    ${activos.length ? sec('activos', 'Activos', '', `<div class="bloque vidrio">${activos.join('')}</div>`) : ''}
    ${sec('heroe', 'Héroe', d.clase ? esc(d.clase.emoji) + ' ' + esc(d.clase.nombre) : 'Sin clase', `<div class="bloque vidrio">${heroe}</div>`)}
    ${sec('mascota', 'Mascota', m ? esc(m.emoji) + ' ' + esc(m.nombre) : 'Sin mascota', `<div class="bloque vidrio">${mascota}</div>`)}
    ${sec('clan', 'Clan', c ? esc(c.nombre) : 'Sin clan', `<div class="bloque vidrio">${clan}</div>`)}
    ${sec('coleccion', 'Colección', d.reliquias.n + '/' + d.reliquias.total + ' reliquias', col)}`;
}
function cabPerfil(d) {
  const emp = d && d.empleo ? ', ' + esc(d.empleo.nombre) : '';
  const pct = me.xpSig ? Math.min(100, me.xp / me.xpSig * 100) : 0;
  return `<section class="perfil"><div class="escena">${escena('p')}</div><div class="hero-in">${avatar(me, 88, true)}<div class="quien"><h1>${esc(me.alias)}</h1><span class="peq mut">Nivel ${me.nivel}${emp}</span><div class="xpb"><div style="width:${pct}%"></div></div><span class="peq mut">${fmt(me.xp)} / ${fmt(me.xpSig)} XP</span></div></div></section>`;
}
function pintarPerfil(d, base) {
  const ops = [['ficha', 'Ficha'], ['heroe', 'Héroe'], ['progreso', 'Progreso'], ['historial', 'Recuerdos']];
  if (me && me.owner) ops.push(['owner', 'Owner']);
  const seg = segHtml('Sección del perfil', ops, S.perfilSel, 'p');
  const cuerpo = S.perfilSel === 'historial' ? pintarHistorial(d) : S.perfilSel === 'heroe' ? pintarHeroe(d, base) : S.perfilSel === 'progreso' ? pintarProgreso(d, base) : S.perfilSel === 'owner' ? pintarOwner(d, base) : pintarFicha(d, base);
  const avisos = S.perfilSel === 'ficha'
    ? `<div class="bloque vidrio"><div class="fila"><strong>🔔 Avisos por WhatsApp</strong><span class="etiq ${d.avisosWa ? '' : 'nar'}">${d.avisosWa ? 'Activados' : 'Apagados'}</span></div>
        <p class="mut peq">Te escribo cuando termine una expedición o te superen en una subasta.</p>
        <div class="btns uno">${botonPost('/api/avisos', { activo: !d.avisosWa }, d.avisosWa ? 'Desactivar avisos' : 'Activar avisos', '')}</div></div>`
    : '';
  return cabPerfil(S.perfilSel === 'ficha' ? d : null) + seg + cuerpo + avisos + '<button type="button" class="link salir" data-salir>Cerrar sesión</button>';
}

const botonPost = (ruta, cuerpo, txt, extra) => `<button type="button" class="mini" data-post="${esc(ruta)}" data-body="${esc(JSON.stringify(cuerpo))}" ${extra || ''}>${esc(txt)}</button>`;

function pintarObjetos(d, base) {
  const herr = d.herramientas.map(h => {
    const m = h.mejora;
    const mejora = m
      ? `<p class="costo mut">Nv ${m.siguiente.nivel}: x${m.siguiente.mult} · ${m.siguiente.usosMax} usos<br>Costo: ${fmt(m.monedas)} monedas · ${m.mats.map(x => esc(x.emoji) + ' ' + x.tengo + '/' + x.necesita).join(' ')}</p>
         <div class="btns uno">${botonPost('/api/herramientas/mejorar', { clave: h.clave }, 'Mejorar', `aria-disabled="${!m.puede}" data-motivo="Te faltan monedas o materiales."`)}</div>`
      : '<p class="mut peq" style="margin-top:10px">Nivel máximo alcanzado.</p>';
    return `
    <div class="herr bloque vidrio ${h.activa ? '' : 'off'}">
      <div class="cab">${slot(h.emoji, { col: '#c3bbdc' })}
        <div style="flex:1;min-width:0"><strong>${esc(h.nombre)}</strong> <span class="mut peq">Nv ${h.nivel}/${h.nivelMax} · x${h.mult}</span><br><span class="mut peq">Se usa en ${esc(h.usoEn)}</span></div>
      </div>
      ${h.usos > 0
        ? barra(h.usos, h.usosMax, 'nar') + `<div class="fila peq"><span>${h.usos} uso${h.usos === 1 ? '' : 's'} restante${h.usos === 1 ? '' : 's'}</span><span class="mut">${h.repuestos ? h.repuestos + ' de repuesto' : 'Sin repuestos'}</span></div>`
        : h.repuestos > 0
          ? `<p class="peq" style="margin-top:8px">Se estrenará una nueva en tu próximo uso <span class="mut">(${h.repuestos} en reserva · ${h.usosMax} usos)</span>.</p>`
          : `<p class="mut peq" style="margin-top:8px">Sin herramienta. Compra una en /shop o fabrícala con /craft.</p>`}
      ${mejora}
    </div>`;
  }).join('');
  const cofres = d.cofres.map(c => {
    const n = Math.min(c.cantidad, d.cofresMax);
    return `<div class="fil">${slot(c.emoji, { col: RAR_COFRE[c.clave] || '#a9b0c4', n: c.cantidad })}
      <div class="nom"><strong>${esc(c.nombre)}</strong><span class="mut peq">${fmt(c.monedas[0])}–${fmt(c.monedas[1])} monedas, materiales y más</span></div>
      </div>
      <div class="btnrow">${botonPost('/api/cofres/abrir', { tipo: c.clave, n: 1 }, 'Abrir', `aria-disabled="${c.cantidad < 1}" data-motivo="No tienes cofres de este tipo."`)}${botonPost('/api/cofres/abrir', { tipo: c.clave, n }, n >= 2 ? 'Abrir x' + n : 'Abrir varios', `aria-disabled="${c.cantidad < 2}" data-motivo="Necesitas al menos 2 para abrir varios."`)}</div>`;
  }).join('');
  const cons = d.consumibles.map(c => `
    <div class="fil">${slot(c.emoji, { col: '#8fb4d6', n: c.cantidad })}
      <div class="nom"><strong>${esc(c.nombre)}</strong><span class="mut peq">${esc(c.desc)}</span></div>
      ${c.activoS ? `<span class="val"><span class="etiq" style="margin:0">Activo ${cuenta(c.activoS, base)}</span></span>` : ''}
    </div>`).join('');
  const mats = d.materiales.length
    ? `<div class="mats">${d.materiales.map(m => `<div class="mat">${slot(m.emoji, { n: fmt(m.cantidad) })}<span class="peq">${esc(m.nombre)}</span></div>`).join('')}</div>
       <p class="mut peq" style="margin-top:10px">Valor aproximado de venta: ${fmt(d.valorMateriales)} monedas.</p>`
    : vacio('Aún no tienes materiales. Mina, tala o pesca para conseguirlos.');
  const tengo = d.reliquias.filter(r => r.tiene).length;
  const reliquias = `<div class="rel">${d.reliquias.map(r => `<span class="${r.tiene ? '' : 'no'}">${esc(r.emoji)} ${esc(r.nombre)}</span>`).join('')}</div>
    <p class="mut peq" style="margin-top:8px">Bono de ingresos por reliquias: +${d.bonoReliquias}%. Solo salen de los cofres.</p>`;
  const partes = [
    ['herramientas', 'Herramientas', sec('herramientas', 'Herramientas', '', `<div class="lista">${herr}</div>`), d.herramientas.length],
    ['cofres', 'Cofres', sec('cofres', 'Cofres', 'hasta ' + d.cofresMax + ' a la vez', `<div class="bloque vidrio">${cofres}</div>`), d.cofres.length],
    ['consumibles', 'Consumibles', sec('consumibles', 'Consumibles', 'máx. ' + d.tope + ' de cada uno', cons), d.consumibles.length],
    ['reliquias', 'Reliquias', sec('reliquias', 'Reliquias', tengo + '/' + d.reliquias.length, reliquias), d.reliquias.length],
    ['materiales', 'Materiales', sec('materiales', 'Materiales', '', mats), d.materiales.length]
  ];
  const filtro = partes.some(p => p[0] === invFiltro) ? invFiltro : 'todo';
  return chipsF('fo', [['todo', 'Todo'], ...partes.map(p => [p[0], p[1], p[3]])], filtro, 'Filtrar objetos')
    + partes.filter(p => filtro === 'todo' || p[0] === filtro).map(p => p[2]).join('');
}

const barraEstado = (nombre, v, cls) => `<div class="stat"><div class="fila"><span>${nombre}</span><span>${v}%</span></div>${barra(v, 100, cls)}</div>`;
const botonListo = (ruta, cuerpo, txt, ms, bloq) => bloq
  ? `<button type="button" class="mini" aria-disabled="true" data-bloq="${esc(bloq)}" data-post="${esc(ruta)}" data-body="${esc(JSON.stringify(cuerpo))}">${esc(bloq)}</button>`
  : `<button type="button" class="mini" data-post="${esc(ruta)}" data-body="${esc(JSON.stringify(cuerpo))}" data-txt="${esc(txt)}" data-listo="${ms}">${esc(txt)}</button>`;

function pintarMascota(d, base) {
  if (!d.tiene) {
    return `${titulo('Adopta una mascota')}
      <p class="mut peq">Cuesta ${fmt(d.precio)} monedas. Dan bonos si las cuidas: aliméntalas, acarícialas y juega con ellas.</p>
      <input class="txt" id="pet-nombre" maxlength="16" placeholder="Nombre (opcional)" autocomplete="off" aria-label="Nombre de la mascota">
      ${d.tipos.map(t => `<div class="bloque vidrio"><div class="pet"><span class="em">${esc(t.emoji)}</span><div style="flex:1"><strong>${esc(t.nombre)}</strong><p class="mut peq">${esc(t.desc)}</p></div></div>
        <div class="btns uno">${botonPost('/api/mascota/adoptar', { tipo: t.clave }, 'Adoptar', 'data-nombre="#pet-nombre"')}</div></div>`).join('')}`;
  }
  const c = d.costos;
  const hambre = d.hambre ? 'Tiene hambre, aliméntala ya' : 'Le dará hambre en ' + cuenta(d.hambreS, base);
  return `${titulo('Tu mascota')}
    <div class="bloque vidrio">
      <div class="pet"><span class="em">${esc(d.tipo.emoji)}</span>
        <div style="flex:1;min-width:0"><strong>${esc(d.nombre)}</strong>${d.nombre === d.tipo.nombre ? '' : ` <span class="mut peq">(${esc(d.tipo.nombre)})</span>`}
          <p class="peq">${esc(d.animo.emoji)} ${esc(d.animo.nombre)}<span class="etiq ${d.activa ? '' : 'nar'}">${d.activa ? 'Bono activo' : 'Sin bono'}</span></p></div>
      </div>
      <div class="stat"><div class="fila"><span>Nivel ${d.nivel}/${d.max}</span><span>${d.xpSig ? d.xp + '/' + d.xpSig + ' XP' : 'Máximo'}</span></div>${barra(d.xpSig ? d.xp : 1, d.xpSig || 1)}</div>
      ${barraEstado('Vida', d.vida, d.vida < 30 ? 'nar' : '')}
      ${barraEstado('Felicidad', d.fel, d.fel < 25 ? 'nar' : '')}
      <p class="peq" style="margin-top:12px">${hambre}</p>
      <p class="mut peq">${esc(d.tipo.desc)}${d.factor !== 1 ? ' · x' + d.factor + ' por su ánimo' : ''}</p>
    </div>
    <div class="btns">
      ${botonListo('/api/mascota/alimentar', {}, 'Alimentar ' + fmt(c.comida), base + d.comidaS * 1000)}
      ${botonListo('/api/mascota/acariciar', {}, 'Acariciar', base + d.cariciaS * 1000)}
      ${botonListo('/api/mascota/jugar', {}, 'Jugar ' + fmt(c.juego), base + d.juegoS * 1000)}
      ${botonListo('/api/mascota/curar', {}, 'Curar ' + fmt(c.cura), 0, d.necesitaCura ? '' : 'Está sana')}
    </div>
    <div class="btns uno"><button type="button" class="mini" data-renombrar="${esc(d.nombre)}">Renombrar</button></div>`;
}

function pintarGranja(d, base) {
  const parcelas = d.cultivos.map(c => `<div class="plot ${c.marchita ? 'mar' : c.lista ? 'ok' : ''}"><span class="em">${esc(c.emoji)}</span>${c.marchita ? 'Marchita' : c.lista ? 'Lista' : cuenta(c.listoS, base)}</div>`).join('') +
    '<div class="plot"><span class="em">🟫</span>Libre</div>'.repeat(d.libres);
  const catalogo = d.catalogo.map(c => `
    <div class="bloque vidrio" style="padding:12px 14px">
      <div class="fila"><strong>${esc(c.emoji)} ${esc(c.nombre)}</strong><span class="mut peq">${dur(c.duracionS)}</span></div>
      <p class="mut peq">Semilla ${fmt(c.semilla)} → ${fmt(c.valor)} monedas</p>
      <div class="btnrow">${botonPost('/api/granja/plantar', { cultivo: c.clave, cantidad: 1 }, 'Sembrar 1', `aria-disabled="${!d.libres}" data-motivo="No tienes parcelas libres."`)}${botonPost('/api/granja/plantar', { cultivo: c.clave, cantidad: 'todo' }, 'Sembrar todas', `aria-disabled="${!d.libres}" data-motivo="No tienes parcelas libres."`)}</div>
    </div>`).join('');
  return `${titulo('Tu granja', `<span class="mut peq">${d.parcelas} parcelas</span>`)}
    <div class="bloque vidrio"><div class="plots">${parcelas}</div>
      <p class="mut peq" style="margin-top:10px">Lo que dejes más de ${d.marchitaH} h tras madurar se marchita y paga la mitad.</p>
      <div class="btns">
        ${botonPost('/api/granja/cosechar', {}, d.listas ? 'Cosechar (' + d.listas + ')' : 'Cosechar', `aria-disabled="${!d.listas}" data-motivo="Aún no hay nada listo."`)}
        ${d.costoParcela !== null ? botonPost('/api/granja/parcela', {}, 'Parcela ' + fmt(d.costoParcela), '') : '<button type="button" class="mini" aria-disabled="true" data-motivo="Ya tienes todas las parcelas extra.">Parcelas al máximo</button>'}
      </div>
    </div>
    ${titulo('Semillas')}${catalogo}`;
}

const PAL_JEFE = {
  hielo: ['#10243a', '#1d4a6b', '#7fc4ee', '#162c44', '#cfe8fb', '#bff3ff'],
  hidra: ['#10281d', '#1f5a3d', '#6fd19a', '#123324', '#9fe3bd', '#f6e27a'],
  kraken: ['#1c1236', '#4a2a6e', '#a98af0', '#231640', '#c9b6ff', '#ffd1ec'],
  otro: ['#1b1426', '#6a2a45', '#c9626f', '#1a1022', '#e8946a', '#ff8f7a']
};
function arteJefe(nombre) {
  const n = String(nombre).toLowerCase();
  const k = n.includes('hidra') ? 'hidra' : n.includes('kraken') ? 'kraken' : n.includes('hielo') || n.includes('tit') ? 'hielo' : 'otro';
  const [c1, c2, aura, cu, ac, oj] = PAL_JEFE[k];
  const fig = {
    hielo: `<path d="M130 190V120C130 86 160 68 200 68S270 86 270 120V190Z" fill="${cu}"/><path d="M146 92L128 40L172 76Z M254 92L272 40L228 76Z M192 70L200 28L208 70Z" fill="${ac}"/><path d="M168 120H232L224 150H176Z" fill="#0b1020"/><g class="rd-ojo"><path d="M168 104L188 110L168 114Z M232 104L212 110L232 114Z" fill="${oj}"/></g>`,
    hidra: `<ellipse cx="200" cy="176" rx="62" ry="30" fill="${cu}"/><g fill="none" stroke="${cu}" stroke-width="16" stroke-linecap="round"><path d="M180 160C150 150 130 120 122 84"/><path d="M200 160V76"/><path d="M220 160C250 150 270 120 278 84"/></g><g fill="${cu}"><ellipse cx="122" cy="78" rx="19" ry="13"/><ellipse cx="200" cy="66" rx="20" ry="14"/><ellipse cx="278" cy="78" rx="19" ry="13"/></g><g class="rd-ojo" fill="${oj}"><circle cx="116" cy="74" r="3.5"/><circle cx="194" cy="62" r="3.5"/><circle cx="206" cy="62" r="3.5"/><circle cx="272" cy="74" r="3.5"/></g>`,
    kraken: `<path d="M140 130C140 66 170 46 200 46S260 66 260 130Z" fill="${cu}"/><g fill="none" stroke="${cu}" stroke-width="13" stroke-linecap="round"><path d="M150 128C128 158 160 168 140 190"/><path d="M178 130C168 164 194 170 184 190"/><path d="M222 130C232 164 206 170 216 190"/><path d="M250 128C272 158 240 168 260 190"/></g><g class="rd-ojo" fill="${oj}"><circle cx="178" cy="96" r="8"/><circle cx="222" cy="96" r="8"/></g>`,
    otro: `<path d="M138 190V128C138 92 162 74 200 74S262 92 262 128V190Z" fill="${cu}"/><path d="M150 88L128 38L170 76Z M250 88L272 38L230 76Z" fill="${ac}"/><g class="rd-ojo"><path d="M170 104L188 110L170 114Z M230 104L212 110L230 114Z" fill="${oj}"/></g>`
  }[k];
  return `<svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="200" cy="104" r="92" fill="${aura}" opacity=".28"/>${fig}<rect y="182" width="400" height="8" fill="#0b0810" opacity=".7"/></svg>`;
}
const cabEvento = (t, s, icono, st) => {
  const fila = st && st.length ? `<div class="cab-st">${st.map(([n, v]) => `<div><b>${esc(String(v))}</b><span>${esc(n)}</span></div>`).join('')}</div>` : '';
  return `<button type="button" class="atras" data-ir="inicio">← Inicio</button><div class="cabp cab-t"><div class="cab-top"><span class="cab-i" aria-hidden="true">${icono}</span><div><h1 class="pag">${t}</h1><p class="mut">${s}</p></div></div>${fila}</div>`;
};
const statsBase = () => me ? [['Monedas', fmt(me.monedas)], ['Nivel', me.nivel]] : [];
const pintarMazmorraTab = (d, base) => cabEvento('Mazmorra', 'Baja piso a piso, enfrenta jefes y consigue equipo.', ICONOS.hunt, statsBase()) + pintarMazmorra(d, base);
const pintarClanTab = (d, base) => cabEvento('Clan', 'Banco común, bonos y guerras de clanes.', ICONOS.clan, statsBase()) + pintarClan(d, base);
const pintarRaidTab = (d, base) => cabEvento('Raid', 'Jefes mundiales de tus grupos.', ICONOS.raid, me ? [['Monedas', fmt(me.monedas)], ['Nivel', me.nivel]] : []) + pintarRaid(d, base);
function pintarRaid(d, base) {
  if (d.conectado === false) return `<div class="bloque vidrio"><p class="mut peq">El bot está reconectando. Inténtalo en unos segundos.</p></div>`;
  const intro = `<p class="mut peq rd-intro">Todos atacan juntos y se reparten el botín según el daño. Puedes golpear cada ${dur(d.cooldownS)}. Los admins invocan al jefe en WhatsApp con /raid start.</p>`;
  if (!d.raids.length) return intro + vacio('Ningún grupo tuyo tiene un jefe ahora mismo.');
  const tarjeta = r => {
    const pct = Math.round(r.hp / r.hpMax * 100);
    const [c1, c2] = PAL_JEFE[String(r.nombre).toLowerCase().includes('hidra') ? 'hidra' : String(r.nombre).toLowerCase().includes('kraken') ? 'kraken' : String(r.nombre).toLowerCase().includes('hielo') ? 'hielo' : 'otro'];
    const bloq = r.dormido ? 'Grupo en modo nocturno' : '';
    const top = (r.top || []).length ? `<div class="rd-top"><h4>Top atacantes</h4>${r.top.map(t => `<div class="fil ${t.yo ? 'yo' : ''}"><span class="pos">${medalla(t.pos - 1)}</span><div class="nom"><strong>${esc(t.nombre)}</strong></div><span class="val">${fmt(t.daño)}</span></div>`).join('')}</div>` : '';
    return `<div class="vidrio rd" style="--c1:${c1};--c2:${c2}">
      <div class="rd-arena">${arteJefe(r.nombre)}<span class="zn">${esc(r.grupo)}</span></div>
      <div class="rd-in">
        <div class="rd-cab"><h3>${esc(r.nombre)}</h3><span class="rd-t">Se retira en ${cuenta(r.restaS, base)}</span></div>
        <div class="rd-vida">
          <div class="rd-hp ${pct < 30 ? 'bajo' : ''}"><i style="width:${pct}%"></i></div>
          <div class="fila"><span class="mut">Vida</span><span><b>${fmt(r.hp)}</b>/${fmt(r.hpMax)} · ${pct}%</span></div>
        </div>
        ${cifras([['Atacantes', fmt(r.atacantes)], ['Tu daño', fmt(r.miDaño)], ['Tu puesto', r.miPos ? '#' + r.miPos : '—']])}
        <p class="rd-bote"><span>🎁</span><span>Bote de <b>${fmt(r.bote || 0)}</b> repartido según el daño, más bonos al que más daño haga y al golpe final.</span></p>
        ${top}
        <div class="btns uno">${botonListo('/api/raid/atacar', { id: r.id }, '⚔️ Atacar', base + r.esperaS * 1000, bloq)}</div>
      </div></div>`;
  };
  return intro + d.raids.map(tarjeta).join('');
}

let cbVisto = '';
const hashStr = t => { let h = 0; for (const ch of String(t)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const PAL_MON = [
  ['#3f8f5c', '#a9e6b8', '#7fe0a0', '#fff7c2'],
  ['#6b5aa8', '#c6b8f5', '#a98af0', '#ffd1ec'],
  ['#a8553f', '#f2b69b', '#ff8f7a', '#ffe27a'],
  ['#4a6f9e', '#a9cdf5', '#7fc4ee', '#bff3ff'],
  ['#8a7f5a', '#e5dcb4', '#d6b87a', '#ff8f7a']
];
const COL_CLASE = { guerrero: ['#c9626f', '#e8d3c0'], mago: ['#7e63d6', '#e8dcff'], ladron: ['#3f8f75', '#cfeee1'], mercader: ['#c9a25a', '#fff1cf'] };

const SOMBRA = '<ellipse cx="300" cy="178" rx="42" ry="5" fill="#000" opacity=".4"/>';
const MON = {
  rata: { z: '#c9a091', svg: () => `<path d="M338 170C354 168 362 156 360 140" stroke="#d9a9a0" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M262 172C262 148 280 138 304 138C330 138 344 152 344 172Z" fill="#7a6a62"/><ellipse cx="304" cy="164" rx="26" ry="10" fill="#a99a90" opacity=".55"/><path d="M252 150C252 138 262 130 276 134C288 138 292 152 290 164L254 168Z" fill="#8a7a72"/><path d="M236 164L256 152L258 170Z" fill="#8a7a72"/><circle cx="237" cy="164" r="4" fill="#e89aa8"/><circle cx="272" cy="134" r="9" fill="#8a7a72"/><circle cx="272" cy="134" r="5" fill="#e8a9b4"/><g class="cb-ojo"><circle cx="266" cy="150" r="3.6" fill="#ff5a6a"/></g><path d="M244 166L249 176L253 168Z" fill="#fff"/><path d="M230 158L246 160M230 168L246 166" stroke="#d6cfc8" stroke-width="1.4"/><rect x="278" y="170" width="8" height="8" rx="3" fill="#6a5a52"/><rect x="316" y="170" width="8" height="8" rx="3" fill="#6a5a52"/>` },
  esqueleto: { z: '#e5dcb4', svg: (c = '#bfb591', a = '#efe8c8') => `<path d="M276 176V142C276 126 286 120 300 120S324 126 324 142V176Z" fill="${c}"/><path d="M286 138H314M286 150H314M286 162H314" stroke="${a}" stroke-width="3" opacity=".65"/><path d="M276 140L252 124" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M248 128L236 94" stroke="#7a5a3a" stroke-width="8" stroke-linecap="round"/><circle cx="300" cy="100" r="20" fill="${a}"/><rect x="288" y="112" width="24" height="11" rx="3" fill="${a}"/><circle cx="292" cy="99" r="5.5" fill="#10141a"/><circle cx="308" cy="99" r="5.5" fill="#10141a"/><g class="cb-ojo" fill="#ffcf5a"><circle cx="292" cy="99" r="2.4"/><circle cx="308" cy="99" r="2.4"/></g><path d="M292 115V122M300 115V122M308 115V122" stroke="#10141a" stroke-width="1.8"/>` },
  murcielago: { z: '#a98af0', svg: () => `<g class="cb-vuela"><path d="M300 124C280 98 248 94 228 112C244 114 250 124 248 138C262 128 276 130 286 144Z" fill="#7d68c9" opacity=".92"/><path d="M300 124C320 98 352 94 372 112C356 114 350 124 352 138C338 128 324 130 314 144Z" fill="#7d68c9" opacity=".92"/><ellipse cx="300" cy="140" rx="23" ry="30" fill="#4b3d86"/><path d="M285 116L280 96L297 110Z M315 116L320 96L303 110Z" fill="#4b3d86"/><g class="cb-ojo" fill="#ffd1ec"><circle cx="291" cy="134" r="4.5"/><circle cx="309" cy="134" r="4.5"/></g><path d="M294 152L297 162L300 152Z M300 152L303 162L306 152Z" fill="#fff"/></g>` },
  arana: { z: '#b05a9a', svg: () => `<g fill="none" stroke="#7a5a96" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${[-1, 1].map(d => `<path d="M${300 + d * 12} 146L${300 + d * 38} 108L${300 + d * 56} 176"/><path d="M${300 + d * 14} 150L${300 + d * 50} 124L${300 + d * 72} 176"/><path d="M${300 + d * 14} 155L${300 + d * 54} 142L${300 + d * 80} 176"/><path d="M${300 + d * 12} 160L${300 + d * 40} 164L${300 + d * 58} 178"/>`).join('')}</g><ellipse cx="300" cy="144" rx="26" ry="22" fill="#4a2c5a"/><path d="M300 130L292 144L300 158L308 144Z" fill="#d94a6a"/><circle cx="300" cy="166" r="14" fill="#5a3a72"/><g class="cb-ojo" fill="#ff5a8a"><circle cx="294" cy="162" r="3"/><circle cx="306" cy="162" r="3"/><circle cx="290" cy="168" r="2"/><circle cx="310" cy="168" r="2"/></g><path d="M294 175L291 182M306 175L309 182" stroke="#e8d3c0" stroke-width="2.4" stroke-linecap="round"/>` },
  zombi: { z: '#8fb07a', svg: () => `<path d="M288 176V150H298V176ZM304 176V150H314V176Z" fill="#46506a"/><path d="M280 114H322L320 156H282Z" fill="#5d6b7a"/><path d="M282 152L288 160L294 152L300 162L306 152L312 160L320 152" stroke="#10141a" stroke-width="1.5" fill="#46506a"/><path d="M284 124L252 130" stroke="#8fb07a" stroke-width="9" stroke-linecap="round"/><path d="M286 136L254 148" stroke="#8fb07a" stroke-width="9" stroke-linecap="round"/><circle cx="248" cy="130" r="6" fill="#8fb07a"/><circle cx="250" cy="149" r="6" fill="#8fb07a"/><circle cx="302" cy="98" r="18" fill="#8fb07a"/><path d="M288 88L296 80L304 88L312 80L316 92" stroke="#4a3a2a" stroke-width="3" fill="none"/><circle cx="295" cy="98" r="5.5" fill="#f3efd8"/><circle cx="309" cy="97" r="3.6" fill="#f3efd8"/><g class="cb-ojo" fill="#c42f3f"><circle cx="294" cy="98" r="2.4"/><circle cx="309" cy="97" r="1.8"/></g><path d="M294 108Q302 114 310 108" stroke="#10141a" stroke-width="3" fill="none"/><path d="M297 108V111M303 109V112M308 108V111" stroke="#f3efd8" stroke-width="1.6"/>` },
  espectro: { z: '#7fc4ee', svg: () => `<g class="cb-flota"><path d="M266 178V120C266 94 282 80 300 80S334 94 334 120V178L322 166L311 178L300 166L289 178L278 166Z" fill="#6aa0d6" opacity=".9"/><ellipse cx="300" cy="104" rx="22" ry="14" fill="#fff" opacity=".12"/><g class="cb-ojo" fill="#e8f7ff"><ellipse cx="289" cy="112" rx="5" ry="8"/><ellipse cx="311" cy="112" rx="5" ry="8"/></g><ellipse cx="300" cy="136" rx="7" ry="10" fill="#10141a" opacity=".8"/></g>` },
  slime: { z: '#7fe0a0', svg: (corona = true) => `<path d="M262 176C246 176 240 150 252 128C264 104 336 104 348 128C360 150 354 176 338 176Z" fill="#4fae6e"/><ellipse cx="282" cy="128" rx="14" ry="7" fill="#fff" opacity=".25"/>${corona ? '<path d="M278 110L282 88L292 100L300 82L308 100L318 88L322 110Z" fill="#d6b87a" stroke="#a9833a" stroke-width="2"/><circle cx="300" cy="100" r="3" fill="#ff5a6a"/>' : ''}<g class="cb-ojo" fill="#fff7c2"><circle cx="284" cy="142" r="6"/><circle cx="316" cy="142" r="6"/></g><g fill="#10141a"><circle cx="285" cy="143" r="2.6"/><circle cx="317" cy="143" r="2.6"/></g><path d="M288 158Q300 168 312 158" stroke="#10141a" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  golem: { z: '#9fb4c8', escala: 1.06, svg: () => `<path d="M274 176V146H298V176ZM302 176V146H326V176Z" fill="#6f7a86"/><path d="M262 104H338L346 152H254Z" fill="#8a95a3"/><path d="M280 112L292 132L284 150M322 112L312 128" stroke="#4a525c" stroke-width="2.5" fill="none"/><rect x="240" y="104" width="24" height="46" rx="5" fill="#7d8896"/><rect x="336" y="104" width="24" height="46" rx="5" fill="#7d8896"/><rect x="236" y="146" width="32" height="26" rx="6" fill="#8a95a3"/><rect x="332" y="146" width="32" height="26" rx="6" fill="#8a95a3"/><rect x="282" y="76" width="36" height="30" rx="5" fill="#7d8896"/><g class="cb-ojo" fill="#7ff3ff"><rect x="289" y="86" width="8" height="6" rx="1"/><rect x="303" y="86" width="8" height="6" rx="1"/></g><circle cx="270" cy="112" r="7" fill="#5f8f5a" opacity=".85"/><circle cx="326" cy="140" r="6" fill="#5f8f5a" opacity=".85"/><circle cx="292" cy="104" r="5" fill="#5f8f5a" opacity=".8"/>` },
  escorpion: { z: '#a98af0', escala: 1.14, svg: () => `<g fill="none" stroke="#3a2a5a" stroke-width="5" stroke-linecap="round"><path d="M284 168L274 178M298 170L292 180M312 170L318 180M326 168L336 178"/></g><path d="M330 158C360 156 376 122 354 98C346 90 332 92 330 102" stroke="#4d3a7a" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M326 100L338 106L330 124Z" fill="#e8d3c0"/><ellipse cx="304" cy="160" rx="36" ry="15" fill="#4d3a7a"/><path d="M290 148V172M304 146V174M318 148V172" stroke="#2c1f4a" stroke-width="2.5"/><circle cx="270" cy="160" r="13" fill="#5d4a8c"/><g class="cb-ojo" fill="#ff8f7a"><circle cx="266" cy="156" r="3"/><circle cx="274" cy="154" r="3"/></g><path d="M262 166L240 150" stroke="#5d4a8c" stroke-width="8" stroke-linecap="round"/><path d="M240 150C228 140 236 128 248 136ZM240 150C232 160 244 166 250 158Z" fill="#5d4a8c"/><path d="M268 172L250 176" stroke="#5d4a8c" stroke-width="7" stroke-linecap="round"/>` },
  hechicero: { z: '#a98af0', escala: 1.12, svg: () => `<g class="cb-flota"><path d="M338 180V92" stroke="#6a4a2a" stroke-width="5" stroke-linecap="round"/><path d="M330 84L338 74L346 84" stroke="#6a4a2a" stroke-width="4" fill="none"/><circle cx="338" cy="82" r="16" fill="#a43fd6" fill-opacity=".35" class="cb-orbe"/><circle cx="338" cy="82" r="8" fill="#e6a8ff"/><path d="M272 180L280 118C282 98 318 98 320 118L328 180L316 170L306 180L296 170L286 180Z" fill="#3a2a5a"/><path d="M280 118L274 150M320 118L326 150" stroke="#2a1c44" stroke-width="3"/><path d="M276 114C274 84 326 84 324 114L300 104Z" fill="#2a1c44"/><ellipse cx="300" cy="106" rx="14" ry="11" fill="#0b0810"/><g class="cb-ojo" fill="#e6a8ff"><circle cx="294" cy="106" r="2.8"/><circle cx="306" cy="106" r="2.8"/></g><path d="M318 128L336 120" stroke="#2a1c44" stroke-width="8" stroke-linecap="round"/><circle cx="337" cy="120" r="5" fill="#8a7a9a"/></g>` },
  dragon: { z: '#ff8f7a', escala: 1.04, svg: () => `<path d="M312 122C330 72 364 58 384 66C372 78 370 92 376 106C362 100 352 108 348 124C342 114 330 118 322 130Z" fill="#8a2f3a"/><path d="M350 150C374 150 386 168 372 178C378 166 366 160 350 162Z" fill="#a8303f"/><ellipse cx="312" cy="148" rx="42" ry="26" fill="#b0384a"/><ellipse cx="306" cy="160" rx="28" ry="13" fill="#d9a35a"/><path d="M290 166V178H302V166ZM326 166V178H338V166Z" fill="#8a2f3a"/><path d="M284 140C266 122 260 98 268 80L288 84C286 100 294 116 304 128Z" fill="#b0384a"/><path d="M262 76C250 78 242 88 240 98C252 96 262 98 270 106C282 102 290 92 288 82C282 74 270 70 262 76Z" fill="#c24455"/><path d="M280 74L292 52L288 78Z M268 72L272 52L274 76Z" fill="#e8d3c0"/><g class="cb-ojo" fill="#ffe27a"><circle cx="266" cy="86" r="3.4"/></g><path d="M244 100L252 104L256 98" stroke="#fff" stroke-width="2" fill="none"/><circle cx="246" cy="94" r="1.6" fill="#10141a"/>` },
  titan: { z: '#c9626f', escala: 0.98, svg: () => `<path d="M274 176V146H298V176ZM302 176V146H326V176Z" fill="#43224f"/><path d="M262 108C262 94 338 94 338 108L330 152H270Z" fill="#5a2f6e"/><path d="M300 108V150M284 122H316M286 136H314" stroke="#43224f" stroke-width="2.5" opacity=".7"/><path d="M262 110L238 130L240 156" stroke="#5a2f6e" stroke-width="17" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M338 110L362 130L360 156" stroke="#5a2f6e" stroke-width="17" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="240" cy="162" r="12" fill="#6c3a82"/><circle cx="360" cy="162" r="12" fill="#6c3a82"/><path d="M258 104L250 88L268 98ZM342 104L350 88L332 98Z" fill="#e8d3c0"/><path d="M282 98C282 74 318 74 318 98L314 112H286Z" fill="#6c3a82"/><path d="M284 84L268 56L292 76ZM316 84L332 56L308 76Z" fill="#e8d3c0"/><g class="cb-ojo" fill="#ffcf5a"><path d="M288 90L298 94L288 98Z M312 90L302 94L312 98Z"/></g><path d="M288 104H312" stroke="#10141a" stroke-width="3"/><path d="M291 104L294 110L297 104ZM303 104L306 110L309 104Z" fill="#fff"/>` }
};
const CLAVES_MON = [
  ['rata', /rata|🐀|\brat\b/], ['esqueleto', /esquel|💀|calavera|hueso/], ['murcielago', /murci|🦇|\bbat\b|vampir/], ['arana', /arana|🕷|spider/],
  ['zombi', /zombi|🧟/], ['espectro', /espectro|👻|fantasma/], ['slime', /slime|limo|gelatin|baba/], ['golem', /piedra|guardian|golem|🗿/],
  ['escorpion', /sombras|escorpi|🦂/], ['hechicero', /hechicer|mago|brujo|🧙/], ['dragon', /dragon|🐉|🐲/], ['titan', /titan|abismo|demonio|👹|ogro/]
];
const nombreLimpio = n => String(n).replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
const claveMonstruo = nombre => {
  const n = String(nombre).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const f = CLAVES_MON.find(([, re]) => re.test(n));
  return f ? f[0] : null;
};
const colorMonstruo = nombre => { const k = claveMonstruo(nombre); return k ? MON[k].z : PAL_MON[hashStr(nombre) % PAL_MON.length][2]; };

function arteMonstruo(nombre, jefe) {
  const k = claveMonstruo(nombre);
  let f, esc = 1.2;
  if (k) { f = MON[k].svg(); esc = MON[k].escala || 1.2; }
  else {
    const forma = hashStr(nombre) % 4;
    f = [MON.slime.svg(false), MON.murcielago.svg(), MON.esqueleto.svg(), MON.espectro.svg()][forma];
  }
  const aura = jefe ? `<defs><radialGradient id="cbAuraE"><stop offset="0" stop-color="#ff5a6a" stop-opacity=".42"/><stop offset="1" stop-color="#ff5a6a" stop-opacity="0"/></radialGradient></defs><circle cx="300" cy="130" r="96" fill="url(#cbAuraE)" class="cb-aura"/>` : '';
  const fig = `${SOMBRA}<g class="cb-idle">${f}</g>`;
  return aura + (jefe ? `<g transform="translate(300 176) scale(${esc}) translate(-300 -176)">${fig}</g>` : fig);
}

function arteHeroe(clase, buff) {
  const [c, a] = COL_CLASE[clase] || ['#8f87a8', '#ece6f3'];
  const gorro = {
    guerrero: `<path d="M64 104C64 88 96 88 96 104Z" fill="#9aa3b8"/><rect x="78" y="90" width="4" height="12" fill="${c}"/>`,
    mago: `<path d="M60 106L80 58L100 106Z" fill="${c}"/><rect x="56" y="104" width="48" height="6" rx="3" fill="${a}" opacity=".85"/>`,
    ladron: `<path d="M62 116C58 86 102 86 98 116L80 102Z" fill="${c}"/>`,
    mercader: `<rect x="60" y="97" width="40" height="6" rx="3" fill="${a}"/><path d="M68 98C68 84 92 84 92 98Z" fill="${c}"/>`
  }[clase] || `<path d="M65 104C65 90 95 90 95 104Z" fill="${c}"/>`;
  const arma = {
    guerrero: `<path d="M106 142L140 94" stroke="#d6dcea" stroke-width="6" stroke-linecap="round"/><path d="M99 137L112 148" stroke="#b08a50" stroke-width="6" stroke-linecap="round"/>`,
    mago: `<path d="M114 180V88" stroke="#8a6a4a" stroke-width="5" stroke-linecap="round"/><circle cx="114" cy="82" r="15" fill="${a}" fill-opacity=".35" class="cb-orbe"/><circle cx="114" cy="82" r="8" fill="${a}"/>`,
    ladron: `<path d="M106 146L132 124" stroke="#d6dcea" stroke-width="5" stroke-linecap="round"/><path d="M100 150L110 142" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`,
    mercader: `<ellipse cx="112" cy="158" rx="14" ry="16" fill="#5a4630"/><path d="M104 144Q112 138 120 144" stroke="${a}" stroke-width="3" fill="none"/><circle cx="112" cy="160" r="5" fill="${a}"/>`
  }[clase] || '';
  const aura = buff ? `<circle cx="80" cy="144" r="50" fill="${a}" fill-opacity=".1"/><circle cx="80" cy="144" r="50" fill="none" stroke="${a}" stroke-width="2" stroke-dasharray="6 5" class="cb-aura"/>` : '';
  return `${aura}<ellipse cx="80" cy="178" rx="32" ry="5" fill="#000" opacity=".4"/><g class="cb-idle h"><path d="M56 178C56 144 64 126 80 126S104 144 104 178Z" fill="${c}"/><path d="M70 130H90L88 142H72Z" fill="${a}" opacity=".4"/><circle cx="80" cy="110" r="15" fill="#e9cdb6"/>${gorro}<circle cx="86" cy="111" r="2" fill="#1a1020"/>${arma}</g>`;
}

function escenaCombate(o) {
  const u = o.anim && o.u ? o.u : null;
  const pH = o.hpMax ? Math.round(o.hp / o.hpMax * 100) : 0, pE = o.ehpMax ? Math.round(o.ehp / o.ehpMax * 100) : 0;
  const golpeE = u && u.dano > 0, golpeH = u && u.recibido > 0;
  const nums = u ? [
    u.hab ? `<span class="cb-hab-t">✨ ${esc(u.hab)}</span>` : '',
    u.dano > 0 ? `<span class="cb-num dano" style="left:74%;top:50%">-${fmt(u.dano)}</span>` : '',
    u.cura > 0 ? `<span class="cb-num cura" style="left:21%;top:46%">+${fmt(u.cura)}</span>` : '',
    u.recibido > 0 ? `<span class="cb-num recibe" style="left:14%;top:56%">-${fmt(u.recibido)}</span>` : ''
  ].join('') : '';
  return `<div class="cb-arena ${o.jefe ? 'jefe' : ''}" style="--z:${colorMonstruo(o.nombre)}">
    <svg viewBox="0 0 400 200" aria-hidden="true">
      <rect y="176" width="400" height="24" fill="#0b0810" opacity=".75"/><rect y="176" width="400" height="1.5" fill="#fff" opacity=".08"/>
      <g class="cb-her ${u && u.hab ? 'cast' : ''} ${golpeH ? 'golpeado' : ''}">${arteHeroe(o.clase, o.buff)}</g>
      <g class="cb-mon ${golpeE ? 'golpeado' : ''}">${arteMonstruo(o.nombre, o.jefe)}</g>
      ${golpeE ? '<path class="cb-tajo" d="M262 96L346 164" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path class="cb-tajo t2" d="M346 100L266 166" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' : ''}
    </svg>
    ${u && u.hab ? '<i class="cb-flash"></i>' : ''}
    <div class="cb-hud h"><span>Tú${o.buff ? ' 🔥' : ''}</span><div class="cb-hp tu ${pH < 30 ? 'bajo' : ''}"><i style="width:${pH}%"></i></div><b>${fmt(o.hp)}/${fmt(o.hpMax)}</b></div>
    <div class="cb-hud e"><span>${o.jefe ? '👑 ' : ''}${esc(nombreLimpio(o.nombre))}</span><div class="cb-hp ${pE < 30 ? 'bajo' : ''}"><i style="width:${pE}%"></i></div><b>${fmt(o.ehp)}/${fmt(o.ehpMax)}</b></div>
    ${nums}
  </div>`;
}

const botonAcc = (ruta, cuerpo, html, extra, cls) => `<button type="button" class="mini cb-acc ${cls || ''}" data-post="${esc(ruta)}" data-body="${esc(JSON.stringify(cuerpo))}" ${extra || ''}>${html}</button>`;

function pintarMazmorra(d, base) {
  const cab2 = `<p class="peq mut" style="margin-top:8px">Cartera: <b>${fmt(d.cartera)}</b> · Récord: piso <b>${d.record}</b> · Pociones: <b>${d.pociones}</b></p>`;
  if (d.nivel < d.nivelMin) return cab2 + `<div class="bloque vidrio"><p class="mut peq">Se desbloquea en el nivel ${d.nivelMin}. Tu nivel: ${d.nivel}.</p></div>`;
  if (!d.activo) {
    const e = d.entrada;
    const espera = d.esperaS > 0;
    const motivo = 'Tus heridas siguen frescas.';
    const b = (cuerpo, txt) => botonPost('/api/mazmorra/entrar', cuerpo, txt, `${espera ? 'aria-disabled="true"' : ''} data-motivo="${motivo}"`);
    return cab2 + `<div class="bloque vidrio"><strong>🕳️ Mazmorra</strong>
      <p class="mut peq">Baja piso a piso. Los jefes aparecen cada ${d.jefeCada} pisos y siempre sueltan equipo. Si caes pierdes el ${d.perdida}% de las monedas reunidas; conservas equipo y cofres.</p>
      ${d.check ? `<p class="peq">💾 Guardado: piso ${d.check}</p>` : ''}
      ${espera ? `<p class="peq">Podrás entrar en ${cuenta(d.esperaS, base)}</p>` : ''}
      <div class="btns">${b({}, (d.check ? 'Continuar piso ' + d.check : 'Entrar') + ' · ' + fmt(e.normal))}${b({ seguro: true }, 'Con seguro · ' + fmt(e.normal + e.seguro))}
      ${d.check ? b({ inicio: true }, 'Desde piso 1 · ' + fmt(e.inicio)) : ''}</div>
      <p class="mut peq" style="margin-top:8px">El seguro evita perder monedas y retroceder al caer.</p></div>`;
  }
  const r = d.run, s = r.siguiente, c = r.combate, h = d.heroe;
  const clase = h && h.clase;
  const barraRun = `<div class="cb-run"><span>📍 Piso <b>${r.piso}</b>${r.seguro ? ' <em class="etiq">Asegurada</em>' : ''}</span><span>💰 <b>${fmt(r.botin)}</b></span><span>🎒 <b>${r.equipo.length}</b>${r.cofres.length ? ' ' + r.cofres.join(' ') : ''}</span><span>⏳ ${r.expirada ? 'Expiró' : cuenta(r.restaS, base)}</span></div>`;
  const energia = h ? `<div class="cb-ener"><span>Energía</span>${Array.from({ length: h.energia.max }, (_, i) => `<i class="pip ${i < h.energia.n ? 'on' : ''}"></i>`).join('')}</div>` : '';

  if (c) {
    const clave = r.piso + ':' + c.turno, anim = cbVisto !== clave;
    cbVisto = clave;
    const arena = escenaCombate({ nombre: c.nombre, jefe: c.jefe, clase, buff: c.buff, hp: r.hp, hpMax: r.hpMax, ehp: c.hp, ehpMax: c.hpMax, u: c.ultimo, anim });
    const log = c.log.slice(-3).map((l, i, a) => `<p class="${i === a.length - 1 ? 'nuevo' : ''}">${esc(l)}</p>`).join('') || '<p>Elige tu primera acción.</p>';
    const habs = h ? h.habilidades.map(x => {
      const motivo = x.bloqueada ? 'Se desbloquea en el nivel ' + x.nivel + '.' : x.sinEnergia ? 'No tienes energía suficiente.' : '';
      const pips = x.bloqueada ? `<span class="cb-lock">🔒 Nv ${x.nivel}</span>` : `<span class="cb-hc">${'⚡'.repeat(x.costo)}</span>`;
      return botonAcc('/api/mazmorra/habilidad', { n: x.n }, `<span class="cb-hn">${esc(x.nombre)}</span>${pips}<span class="cb-hd">${esc(x.desc || 'Ataque potenciado')}</span>`, `${motivo ? 'aria-disabled="true"' : ''} data-motivo="${esc(motivo)}"`, 'cb-hab-b');
    }).join('') : '';
    const sinPoc = !d.pociones || r.hp >= r.hpMax;
    return cab2 + barraRun + arena + `<div class="cb-log vidrio" aria-live="polite">${log}</div>
      ${energia}
      <div class="cb-prim">
        ${botonAcc('/api/mazmorra/golpe', {}, '<b>⚔️ Golpe</b><small>Ataque básico</small>', '', 'cb-golpe')}
        ${botonAcc('/api/mazmorra/pocion', {}, `<b>🧪 Poción</b><small>${d.pociones} en la bolsa</small>`, sinPoc ? 'aria-disabled="true" data-motivo="' + (d.pociones ? 'Ya tienes la vida completa.' : 'No tienes pociones.') + '"' : '', 'cb-poc')}
      </div>
      ${habs ? `<div class="cb-habs">${habs}</div>` : ''}
      <p class="mut peq" style="margin-top:10px">No puedes salir ni descansar en pleno combate. Si caes, pierdes el ${d.perdida}% de lo reunido.</p>`;
  }

  const arena = escenaCombate({ nombre: s.nombre, jefe: s.jefe, clase, buff: null, hp: r.hp, hpMax: r.hpMax, ehp: s.hp, ehpMax: s.hp, u: null, anim: false });
  return cab2 + barraRun + arena + `${energia}
    <div class="btns">
      ${botonPost('/api/mazmorra/pelear', {}, '⚔️ Pelear', r.expirada ? 'aria-disabled="true" data-motivo="Cobra tu botín saliendo."' : '')}
      ${botonPost('/api/mazmorra/avanzar', {}, '⚡ Auto', r.expirada ? 'aria-disabled="true" data-motivo="Cobra tu botín saliendo."' : '')}
      ${botonPost('/api/mazmorra/curar', {}, 'Poción (' + d.pociones + ')', r.hp >= r.hpMax || !d.pociones ? 'aria-disabled="true" data-motivo="' + (d.pociones ? 'Ya tienes la vida completa.' : 'No tienes pociones.') + '"' : '')}
      ${botonPost('/api/mazmorra/descansar', {}, 'Posada · ' + fmt(r.posada), r.hp >= r.hpMax ? 'aria-disabled="true" data-motivo="Ya tienes la vida completa."' : '')}
      ${botonPost('/api/mazmorra/salir', {}, 'Salir y cobrar', 'data-confirmar="Saldrás con lo reunido hasta ahora. ¿Continuar?"')}
    </div>
    <p class="mut peq" style="margin-top:8px">⚔️ Pelear: tú eliges cada acción. ⚡ Auto: el combate se resuelve solo.</p>`;
}

const COL_GACHA = { mitica: '#e8946a', legendaria: '#e0b96a', epica: '#b69be0', rara: '#8fb4d6', comun: '#a9b0c4' };
const colGacha = c => COL_GACHA[c && c.clave] || COL_GACHA.comun;
const imgGacha = c => c.imagen ? `<img src="${esc(c.imagen)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : '';
const cartaGacha = c => `<div class="gc-carta" style="--c:${colGacha(c.rareza)}">
  <div class="gc-img">${imgGacha(c)}<span class="gc-em">${esc(c.rareza ? c.rareza.emoji : '🎴')}</span></div>
  <div class="gc-in"><strong>${esc(c.nombre)}</strong>${c.nombreNativo ? `<span class="mut peq">${esc(c.nombreNativo)}</span>` : ''}${c.serie ? `<span class="mut peq">${esc(c.serie)}</span>` : ''}
    <span class="peq">${c.rareza ? esc(c.rareza.emoji + ' ' + c.rareza.nombre) + ' · ' : ''}💎 ${fmt(c.valor)}</span>${c.ranking ? `<span class="mut peq">Top #${fmt(c.ranking)} · ⭐ ${fmt(c.favoritos)}</span>` : ''}</div></div>`;
const miniDe = (c, tag, attrs) => `<${tag} class="gc-mini" ${attrs} style="--c:${colGacha(c.rareza)}" title="${esc(c.nombre)}">
  <div class="gc-img">${imgGacha(c)}<span class="gc-em">${esc(c.rareza ? c.rareza.emoji : '🎴')}</span></div>
  <b>${esc(c.nombre)}</b><span class="mut">💎 ${fmt(c.valor)}</span></${tag}>`;
const miniGacha = c => miniDe(c, 'div', '');
const miniSel = (c, attr, sel) => miniDe(c, 'button', `type="button" data-${attr}="${c.id}" aria-pressed="${sel === c.id}"`);
const chipsRarezaGacha = lista => `<div class="gc-raros">${lista.map(r => `<span style="--c:${COL_GACHA[r.clave] || COL_GACHA.comun}">${esc(r.emoji)} ${esc(r.nombre)} <b>${fmt(r.n)}</b></span>`).join('')}</div>`;

function pintarGachaInvocar(d, base) {
  const p = d.pendiente;
  const pendiente = p
    ? `${titulo('Carta pendiente', `<span class="mut peq">se escapa en ${cuenta(p.restaS, base)}</span>`)}
       <div class="bloque vidrio" data-gc-fin="${base + p.restaS * 1000}">${cartaGacha(p.carta)}<p class="mut peq" style="margin-top:10px">Reclámala antes de que se acabe el tiempo. Los demás jugadores también pueden quedársela si se adelantan.</p>
       <div class="btns uno">${botonPost('/api/gacha/reclamar', { id: p.carta.id }, 'Reclamar carta')}</div></div>`
    : '';
  const mundo = d.mundo.length
    ? `${titulo('Cartas del mundo')}<div class="bloque vidrio">${d.mundo.map(r => `<div class="fil"><span class="pos">${esc(r.emoji)}</span><div class="nom"><strong>${esc(r.nombre)}</strong><span class="mut peq">${fmt(r.reclamadas)} reclamadas</span></div><span class="val">${fmt(r.libres)} libres</span></div>`).join('')}</div>`
    : '';
  const ranking = d.ranking.length
    ? `${titulo('Mayores coleccionistas')}<div class="bloque vidrio">${d.ranking.map(r => filaRanking(r, fmt(r.cartas) + ' cartas', '💎 ' + fmt(r.valor))).join('')}</div>`
    : '';
  const aviso = d.trato ? `<div class="bloque vidrio"><p class="peq">🔁 Tienes una propuesta de cambio esperando. Caduca en ${cuenta(d.trato.restaS, base)}.</p><div class="btns uno"><button type="button" class="mini" data-gs="tratos">Ver propuesta</button></div></div>` : '';
  const libres = abiertas.filter(a => a.fin > Date.now());
  const ajenas = libres.length
    ? `${titulo('Cartas por reclamar', '<span class="mut peq">¡sé el primero!</span>')}${libres.map(a => `<div class="bloque vidrio">${cartaGacha(a.carta)}<p class="mut peq" style="margin-top:8px"><b>${esc(a.por)}</b> la invocó. Se escapa en <b data-fin="${a.fin}">${dur((a.fin - Date.now()) / 1000)}</b>.</p><div class="btns uno">${botonPost('/api/gacha/reclamar', { id: a.id }, 'Reclamar carta')}</div></div>`).join('')}`
    : '';
  return `${introGacha(d)}
    ${aviso}${ajenas}${chipsRarezaGacha(d.mia.porRareza)}
    <div class="btns uno" style="margin-top:14px">${botonListo('/api/gacha/tirar', {}, '✨ Invocar', base + d.esperaS * 1000)}</div>
    ${pendiente}${mundo}${ranking}`;
}
const introGacha = d => `<p class="mut peq">Invoca personajes de anime y reclama los que te gusten. Puedes tirar cada ${dur(d.cooldownS)} y tienes ${dur(d.reclamoS)} para reclamar la carta que salga.</p>`;

function pintarGachaColeccion(d) {
  const pie = d.paginas > 1
    ? `<div class="btnrow" style="align-items:center;margin-top:12px"><button type="button" class="mini" data-gp="-1" aria-disabled="${d.pagina <= 1}">Anterior</button><span class="mut peq" style="flex:none">Página ${d.pagina} de ${d.paginas}</span><button type="button" class="mini" data-gp="1" aria-disabled="${d.pagina >= d.paginas}">Siguiente</button></div>`
    : '';
  const cuerpo = d.cartas.length
    ? `<div class="gc-rejilla">${d.cartas.map(miniGacha).join('')}</div>${pie}`
    : vacio('Aún no tienes cartas. Invoca y reclama la primera.');
  return `${chipsRarezaGacha(d.porRareza)}${titulo('Tu colección')}${cuerpo}`;
}
const parCartas = (a, b, tA, tB) => `<div class="gt-par"><div><p class="mut peq">${tA}</p>${cartaGacha(a)}</div><span class="gt-flecha" aria-hidden="true">⇄</span><div><p class="mut peq">${tB}</p>${cartaGacha(b)}</div></div>`;
const pagerGt = (k, c) => c.paginas > 1
  ? `<div class="btnrow" style="align-items:center;margin-top:8px"><button type="button" class="mini" data-gt-pg="${k}" data-dir="-1" aria-disabled="${c.pagina <= 1}">Anterior</button><span class="mut peq" style="flex:none">${c.pagina} de ${c.paginas}</span><button type="button" class="mini" data-gt-pg="${k}" data-dir="1" aria-disabled="${c.pagina >= c.paginas}">Siguiente</button></div>`
  : '';
function pintarGachaTratos(d, base) {
  let pendiente = '';
  if (d.recibido) {
    const r = d.recibido;
    pendiente += `${titulo('Propuesta recibida', `<span class="mut peq">caduca en ${cuenta(r.restaS, base)}</span>`)}
      <div class="bloque vidrio"><p class="peq"><b>${esc(r.alias)}</b> quiere cambiar contigo.</p>${parCartas(r.ofrece, r.pide, 'Recibes', 'Entregas')}
      <div class="btnrow" style="margin-top:12px">${botonPost('/api/gacha/aceptar', {}, 'Aceptar cambio')}${botonPost('/api/gacha/rechazar', {}, 'Rechazar')}</div></div>`;
  }
  if (d.enviado) {
    const e = d.enviado;
    pendiente += `${titulo('Propuesta enviada', `<span class="mut peq">caduca en ${cuenta(e.restaS, base)}</span>`)}
      <div class="bloque vidrio"><p class="peq">Esperando respuesta de <b>${esc(e.alias)}</b>.</p>${parCartas(e.ofrece, e.pide, 'Entregas', 'Recibes')}
      <div class="btns uno">${botonPost('/api/gacha/cancelar', {}, 'Cancelar propuesta')}</div></div>`;
  }

  const busca = `<div class="campo" style="margin-top:6px"><input class="txt corto" id="gt-q" data-v="gtq" type="text" maxlength="24" autocomplete="off" placeholder="Buscar jugador por nombre" aria-label="Buscar jugador" value="${esc(S.gtQ)}"><button type="button" class="mini" data-buscar="gacha">Buscar</button></div>`;
  let cuerpo;
  if (d.objetivo) {
    const o = d.objetivo;
    const mia = o.mias.cartas.find(c => c.id === S.gtMia) || null;
    const suya = o.suyas.cartas.find(c => c.id === S.gtSuya) || null;
    const resumen = `<p class="peq" style="margin-top:12px">Tu carta: <b>${S.gtMia ? '#' + S.gtMia + (mia ? ' ' + esc(mia.nombre) : '') : 'sin elegir'}</b> · De ${esc(o.alias)}: <b>${S.gtSuya ? '#' + S.gtSuya + (suya ? ' ' + esc(suya.nombre) : '') : 'sin elegir'}</b></p>`;
    const sinMia = 'Elige una carta tuya.', sinAmbas = 'Elige una carta tuya y una de ' + o.alias + '.';
    cuerpo = `<div class="bloque vidrio"><div class="fila"><strong>Trato con ${esc(o.alias)}</strong><button type="button" class="mini" data-gt-quitar>Cambiar</button></div>
      <p class="mut peq">Elige una carta tuya y una suya para proponer un cambio, o regala la tuya.</p></div>
      ${titulo('Tus cartas')}${o.mias.cartas.length ? `<div class="gc-rejilla">${o.mias.cartas.map(c => miniSel(c, 'gt-mia', S.gtMia)).join('')}</div>${pagerGt('m', o.mias)}` : vacio('No tienes cartas para ofrecer.')}
      ${titulo('Cartas de ' + esc(o.alias))}${o.suyas.cartas.length ? `<div class="gc-rejilla">${o.suyas.cartas.map(c => miniSel(c, 'gt-suya', S.gtSuya)).join('')}</div>${pagerGt('s', o.suyas)}` : vacio('Todavía no tiene cartas.')}
      ${resumen}
      <div class="btns">
        ${botonPost('/api/gacha/proponer', { ref: o.ref, mia: S.gtMia, suya: S.gtSuya }, 'Proponer cambio', !S.gtMia || !S.gtSuya ? `aria-disabled="true" data-motivo="${esc(sinAmbas)}"` : '')}
        ${botonPost('/api/gacha/regalar', { ref: o.ref, id: S.gtMia }, 'Regalar mi carta', !S.gtMia ? `aria-disabled="true" data-motivo="${esc(sinMia)}"` : `data-confirmar="¿Regalar ${esc(mia ? mia.nombre : 'esta carta')} a ${esc(o.alias)}? No se puede deshacer."`)}
      </div>
      <p class="mut peq" style="margin-top:8px">${esc(o.alias)} tiene ${dur(d.ventanaS)} para aceptar o rechazar la propuesta.</p>`;
  } else {
    const lista = d.resultados.length
      ? `<div class="bloque vidrio">${d.resultados.map(j => `<div class="fil"><div class="nom"><strong>${esc(j.alias)}</strong></div><button type="button" class="mini" data-gt-elegir="${esc(j.ref)}">Elegir</button></div>`).join('')}</div>`
      : S.gtQ ? vacio('No encontré a nadie con ese nombre.') : '';
    cuerpo = `${titulo('Nuevo trato')}<p class="mut peq">Busca a otro jugador para cambiar o regalarle una carta.</p>${busca}${lista}`;
  }
  return pendiente + cuerpo;
}
function pintarGacha(d, base) {
  const seg = segHtml('Sección del gacha', [['invocar', 'Invocar'], ['coleccion', 'Colección'], ['tratos', 'Tratos']], S.gachaSel, 'gs');
  const mia = S.gachaSel === 'coleccion' ? { total: d.total, valor: d.valor } : S.gachaSel === 'tratos' ? null : d.mia;
  return cabEvento('Gacha', 'Invoca, colecciona y cambia personajes de anime.', ICONOS.gacha, mia ? [['Cartas', fmt(mia.total)], ['Valor', fmt(mia.valor)]] : statsBase())
    + seg + (S.gachaSel === 'coleccion' ? pintarGachaColeccion(d) : S.gachaSel === 'tratos' ? pintarGachaTratos(d, base) : pintarGachaInvocar(d, base));
}

function pintarHogar(d, base) {
  const seg = `<div class="seg" role="group" aria-label="Sección del hogar">${[['mascota', 'Mascota'], ['granja', 'Granja']].map(([k, n]) => `<button type="button" data-h="${k}" aria-pressed="${k === S.hogarSel}">${n}</button>`).join('')}</div>`;
  return cab('Mundo', 'Tu mascota y tu granja.') + seg + (S.hogarSel === 'mascota' ? pintarMascota(d, base) : pintarGranja(d, base));
}

function filaRanking(r, extra, valor) {
  return `<div class="fil ${r.yo || r.mio ? 'yo' : ''}"><span class="pos">${medalla(r.pos - 1)}</span>
    <div class="nom"><strong>${esc(r.nombre)}${r.yo ? ' (tú)' : r.mio ? ' (tu clan)' : ''}</strong>${extra ? `<span class="mut peq">${extra}</span>` : ''}</div>
    <span class="val">${valor}</span></div>`;
}

function pintarRankings(d, base) {
  const opciones = [['monedas', 'Monedas'], ['xp', 'XP semanal'], ['clanes', 'Clanes'], ['guerra', 'Guerra']];
  const seg = `<div class="seg" role="group" aria-label="Tipo de ranking">${opciones.map(([k, n]) => `<button type="button" data-r="${k}" aria-pressed="${k === rankSel}">${n}</button>`).join('')}</div>`;
  let cuerpo = '';
  if (rankSel === 'monedas') {
    cuerpo = d.monedas.length ? d.monedas.map(r => filaRanking(r, '', fmt(r.valor))).join('') : vacio('Aún no hay datos.');
  } else if (rankSel === 'xp') {
    cuerpo = `<p class="mut peq" style="margin-top:12px">Se reinicia en ${cuenta(d.cierraXpS, base)}. Premios: ${d.premiosXp.map((p, i) => medalla(i) + ' ' + fmt(p)).join(' · ')}</p>` +
      (d.xpSemana.length ? d.xpSemana.map(r => filaRanking(r, '', fmt(r.valor) + ' XP')).join('') : vacio('Nadie ha sumado XP esta semana.'));
  } else if (rankSel === 'clanes') {
    cuerpo = d.clanes.length ? d.clanes.map(c => filaRanking(c, `Nv ${c.nivel} · ${c.miembros} miembro${c.miembros === 1 ? '' : 's'}`, fmt(c.banco))).join('') : vacio('Aún no hay clanes.');
  } else {
    const g = d.guerra;
    const mio = g.mio ? `<div class="bloque vidrio">${kv('Tu clan', esc(g.mio.nombre))}${kv('Puesto', '#' + g.mio.puesto)}${kv('Puntos', fmt(g.mio.pts))}</div>` : `<div class="aviso-i">Suma puntos para tu clan minando, talando y pescando.</div>`;
    cuerpo = `<p class="mut peq" style="margin-top:12px">Semana ${esc(g.semana)} · cierra en ${cuenta(g.cierraS, base)}<br>Premios al banco del clan: ${g.premios.map((p, i) => medalla(i) + ' ' + fmt(p)).join(' · ')} (mínimo ${g.minPuntos} pts)</p>` +
      mio + (g.ranking.length ? g.ranking.map(c => filaRanking(c, `${c.miembros} miembro${c.miembros === 1 ? '' : 's'}`, fmt(c.pts) + ' pts')).join('') : vacio('Todavía nadie ha puntuado esta semana.')) +
      (g.ultima && g.ultima.ranking.length ? `<p class="mut peq" style="margin-top:16px">Semana anterior (${esc(g.ultima.semana)}): ${g.ultima.ranking.map((r, i) => medalla(i) + ' ' + esc(r.nombre)).join(' · ')}</p>` : '');
  }
  const lista = rankSel === 'monedas' ? d.monedas : rankSel === 'xp' ? d.xpSemana : rankSel === 'clanes' ? d.clanes : (d.guerra && d.guerra.ranking) || [];
  const mia = rankSel === 'guerra' ? (d.guerra && d.guerra.mio ? { pos: d.guerra.mio.puesto } : null) : (lista || []).find(r => r.yo || r.mio);
  const cifrasR = [['Tu puesto', mia ? '#' + mia.pos : '—'], ['En la lista', (lista || []).length], ['Nivel', me ? me.nivel : '—']];
  return `${cab('Rankings', 'Compara tu progreso con el resto de la isla.', cifrasR)}${seg}<div class="lista">${cuerpo}</div>`;
}

function pintarHistorial(d) {
  if (!d.items.length) return vacio('Aún no hay hallazgos. Cada vez que mines, talles, pesques o cazes aparecerá aquí.');
  const icono = { minar: 'mine', talar: 'chop', pescar: 'fish', cazar: 'hunt', crimen: 'mask', daily: 'gift', work: 'brief' };
  const verbo = { minar: 'Minaste en', talar: 'Talaste en', pescar: 'Pescaste en', cazar: 'Cazaste en', crimen: 'Crimen ·', daily: 'Reclamaste ·', work: 'Trabajaste como' };
  return '<p class="mut peq" style="margin-top:14px">Tus últimos 20 hallazgos</p>' + `<div class="lista">${d.items.map(i => {
    const col = (RAREZA[i.rareza] || RAREZA.comun)[1];
    const extra = [i.evento, i.guardian ? (i.guardian.gana ? 'Derrotaste a ' + i.guardian.nombre : i.guardian.nombre + ' te hizo retroceder') : ''].filter(Boolean).map(esc).join(' · ');
    return `<div class="fil"><span class="pt">${ICONOS[icono[i.accion]] || ICONOS.mine}</span>
      <div class="nom"><strong><i class="pto" style="--c:${col}"></i>${esc(i.titulo)}</strong>
        <span class="mut peq">${esc(verbo[i.accion] || 'Actuaste en')} ${esc(i.zona)} · ${hace(i.hace)} · ${i.origen === 'web' ? 'web' : 'WhatsApp'}</span>
        ${extra ? `<span class="peq" style="color:var(--lav)">${extra}</span>` : ''}</div>
      <span class="val">${(i.monedas || 0) < 0 ? '−' : '+'}${fmt(Math.abs(i.monedas || 0))}</span></div>`;
  }).join('')}</div>`;
}

let selEq = null;
const pintarEquipo = (d, base) => {
  const b = d.bonos;
  const bonos = cifras([['Daño', '+' + b.dano + '%'], ['Vida', '+' + b.vida + '%'], ['Ingresos', '+' + b.ingresos + '%'], ['Suerte', '+' + b.suerte]]);
  if (!d.items.some(i => i.id === selEq)) { const f = d.items.find(i => i.equipado) || d.items[0]; selEq = f ? f.id : null; }
  const col = i => (RAREZA[i.rareza] || RAREZA.comun)[1];
  const celda = i => `<button type="button" class="slot celda ${i.id === selEq ? 'sel' : ''} ${i.rareza === 'legendaria' ? 'leg' : ''}" data-sel="${i.id}" style="--r:${col(i)}" aria-label="${esc(i.etiqueta)}" aria-pressed="${i.id === selEq}"><span class="si">${esc(i.emoji)}</span>${i.plus ? `<b class="mas">+${i.plus}</b>` : ''}${i.equipado ? '<i class="eq">E</i>' : ''}</button>`;
  const huecos = Object.entries(TIPOS_W).map(([t, [nom, emo]]) => {
    const it = d.items.find(i => i.equipado && i.tipo === t);
    return `<div class="hueco">${it ? celda(it) : `<div class="slot vacio"><span class="si">${emo}</span></div>`}<span>${nom}</span></div>`;
  }).join('');
  if (eqFiltro !== 'todo' && !TIPOS_W[eqFiltro]) eqFiltro = 'todo';
  const vistos = eqFiltro === 'todo' ? d.items : d.items.filter(i => i.tipo === eqFiltro);
  const vacios = eqFiltro === 'todo' ? Math.min(10, Math.max(0, d.bolsa.max - d.items.length)) : 0;
  const filtrosEq = chipsF('fe', [['todo', 'Todo', d.items.length], ...Object.entries(TIPOS_W).map(([t, [n]]) => [t, n, d.items.filter(i => i.tipo === t).length])], eqFiltro, 'Filtrar equipo');
  const bolsa = `${filtrosEq}<div class="bolsa-g">${vistos.map(celda).join('')}${'<div class="slot vacio"></div>'.repeat(vacios)}</div>${vistos.length ? '' : vacio('No tienes piezas de este tipo.')}`;
  const it = d.items.find(i => i.id === selEq);
  let detalle = '';
  if (it) {
    const [rn, c] = RAREZA[it.rareza] || RAREZA.comun;
    let comp = '';
    if (!it.equipado) {
      const eq = d.items.find(i => i.equipado && i.tipo === it.tipo);
      if (eq) {
        const ord = Object.keys(RAREZA);
        const nomR = x => (RAREZA[x.rareza] || RAREZA.comun)[0];
        const fila = (n, a, b, fa, fb) => `<div class="cmp-f ${a > b ? 'sube' : a < b ? 'baja' : ''}"><span>${n}</span><b>${fa}</b><i aria-hidden="true">${a > b ? '▲' : a < b ? '▼' : '='}</i><span class="mut">${fb}</span></div>`;
        comp = `<div class="cmp"><p class="mut peq">Frente a lo que llevas puesto (${esc(eq.etiqueta)})</p>`
          + fila('Nivel', it.ilvl, eq.ilvl, it.ilvl, eq.ilvl)
          + fila('Mejora', it.plus || 0, eq.plus || 0, '+' + (it.plus || 0), '+' + (eq.plus || 0))
          + fila('Rareza', ord.indexOf(it.rareza), ord.indexOf(eq.rareza), esc(nomR(it)), esc(nomR(eq)))
          + fila('Durabilidad', it.dur, eq.dur, it.dur + '/' + it.durMax, eq.dur + '/' + eq.durMax) + '</div>';
      } else comp = `<p class="peq" style="margin-top:8px">Tu hueco de ${esc(TIPOS_W[it.tipo] ? TIPOS_W[it.tipo][0].toLowerCase() : 'equipo')} está libre.</p>`;
    }
    const m = it.mejora;
    const costo = m ? `<p class="mut peq">Mejora: ${fmt(m.monedas)} monedas · ${m.hierro} hierro${m.oro ? ' · ' + m.oro + ' oro' : ''} · ${m.prob}% de éxito</p>` : '<p class="mut peq">Mejora al máximo (+' + d.maxPlus + ').</p>';
    const poner = it.equipado ? botonPost('/api/equipo/desequipar', { tipo: it.tipo }, 'Quitar', '') : botonPost('/api/equipo/equipar', { id: it.id }, 'Equipar', '');
    const mejorar = m
      ? botonPost('/api/equipo/mejorar', { id: it.id }, 'Mejorar +' + (it.plus + 1), `aria-disabled="${!m.puede}" data-motivo="Te faltan monedas o materiales."`)
      : '<button type="button" class="mini" aria-disabled="true" data-motivo="Ya está al máximo.">Al máximo</button>';
    detalle = `<div class="bloque vidrio detalle" style="--r:${c}">
      <div class="fila"><strong style="color:${c}">${esc(it.etiqueta)}</strong>${it.equipado ? '<span class="etiq">Equipado</span>' : ''}</div>
      <p class="peq">${esc(it.desc)}</p><p class="mut peq">${esc(rn)} · nivel ${it.ilvl}</p><p class="mut peq">Durabilidad: ${it.dur}/${it.durMax}${it.roto ? ' · roto, sin bonos' : ''}</p>${costo}${comp}
      <div class="btns">${poner}${mejorar}
        ${it.reparar ? botonPost('/api/equipo/reparar', { id: it.id }, 'Reparar ' + fmt(it.reparar.monedas), `aria-disabled="${!it.reparar.puede}" data-motivo="Te faltan monedas."`) : ''}
        ${botonPost('/api/equipo/desmontar', { id: it.id }, 'Desmontar', `data-confirmar="¿Desmontar este equipo? Recibirás ${esc(it.desmonte)}."`)}
        ${botonPost('/api/equipo/vender', { id: it.id }, 'Vender ' + fmt(it.precio), `data-confirmar="¿Vender este equipo por ${fmt(it.precio)} monedas?"`)}
      </div></div>`;
  }
  const rep = d.reparacion.cantidad
    ? `<div class="bloque vidrio"><p class="mut peq">${d.reparacion.cantidad} ${d.reparacion.cantidad === 1 ? 'pieza dañada' : 'piezas dañadas'}. El equipo se desgasta al cazar y en la mazmorra; si llega a 0 deja de dar bonos.</p>
        <div class="btns uno">${botonPost('/api/equipo/reparar', { todo: true }, 'Reparar todo ' + fmt(d.reparacion.total), `aria-disabled="${!d.reparacion.puede}" data-motivo="Te faltan monedas."`)}</div></div>`
    : '';
  const opciones = d.rarezas.map(r => `<option value="${esc(r.clave)}">${esc(r.emoji)} ${esc(r.nombre)}</option>`).join('');
  const masa = d.items.length
    ? `<div class="bloque vidrio"><p class="mut peq">Vende todo el equipo que no llevas puesto hasta la rareza elegida.</p>
        <select class="txt" id="vh-rar" aria-label="Rareza máxima">${opciones}</select>
        <div class="btns uno">${botonPost('/api/equipo/vender-hasta', {}, 'Vender en lote', `data-campos="${esc(JSON.stringify({ rareza: '#vh-rar' }))}" data-confirmar="¿Vender en lote? No se puede deshacer."`)}</div></div>`
    : '';
  const c = d.casa;
  const sig = c.siguiente
    ? `<p class="mut peq" style="margin-top:8px">Siguiente: ${esc(c.siguiente.emoji)} ${esc(c.siguiente.nombre)} · ${fmt(c.siguiente.costo)} monedas<br>+${c.siguiente.perks.parcelas} parcelas · +${c.siguiente.perks.bolsa} de bolsa · +${c.siguiente.perks.ofertas} ofertas · +${c.siguiente.perks.ingresos}% ingresos</p>
       <div class="btns uno">${botonPost('/api/casa/mejorar', {}, 'Mejorar hogar', `aria-disabled="${d.cartera < c.siguiente.costo}" data-motivo="Te faltan monedas."`)}</div>`
    : '<p class="mut peq" style="margin-top:8px">Tu hogar está al máximo.</p>';
  const casa = `<div class="bloque vidrio"><div class="fila"><strong>${esc(c.emoji)} ${esc(c.nombre)}</strong><span class="mut peq">Nv ${c.nivel}/${c.max}</span></div>
    <p class="mut peq">${c.perks.parcelas} parcelas · +${c.perks.bolsa} de bolsa · +${c.perks.ofertas} ofertas · +${c.perks.ingresos}% ingresos</p>${sig}</div>`;
  return `${sec('bonos', 'Bonos activos', '', bonos)}
    ${sec('equipo', 'Tu equipo', 'Bolsa ' + d.bolsa.usados + '/' + d.bolsa.max, `<div class="muneco vidrio">${huecos}</div>${bolsa}${detalle}`)}
    ${rep ? sec('reparar', 'Reparaciones', '', rep) : ''}
    ${masa ? sec('lote', 'Venta en lote', '', masa) : ''}
    ${masaDesmonte ? sec('desmonte', 'Desmontar en lote', '', masaDesmonte) : ''}
    ${sec('casa', 'Tu hogar', esc(c.emoji) + ' ' + esc(c.nombre), casa)}`;
};

const vTienda = (d, base) => titulo('Objetos') + d.items.map(i => {
  const lleno = i.stock >= d.tope, limite = i.limiteDia && i.usosHoy >= i.limiteDia, pobre = d.cartera < i.precio;
  const motivo = lleno ? 'Ya tienes el máximo.' : limite ? 'Llegaste al límite de hoy.' : 'Te faltan monedas.';
  const est = [];
  if (i.activoS) est.push(`<span class="etiq">Activo ${cuenta(i.activoS, base)}</span>`);
  if (i.usosRestantes) est.push(`<span class="etiq">${i.usosRestantes} usos</span>`);
  if (i.limiteDia) est.push(`<span class="mut peq">Hoy ${i.usosHoy}/${i.limiteDia}</span>`);
  const usar = i.pasivo ? '' : botonPost('/api/tienda/usar', { clave: i.clave }, 'Usar', `aria-disabled="${i.stock < 1}" data-motivo="No tienes este objeto."`);
  return `<div class="bloque vidrio"><div class="fila"><strong>${esc(i.emoji)} ${esc(i.nombre)}</strong><b>${fmt(i.precio)}</b></div>
    <p class="mut peq">${esc(i.desc)}</p>
    <p class="peq">Tienes ${i.stock}/${d.tope} ${est.join(' ')}</p>
    ${i.pasivo ? `<p class="mut peq">Se usa solo en ${esc(i.usoEn)}</p>` : ''}
    <div class="btnrow">${botonPost('/api/tienda/comprar', { clave: i.clave }, 'Comprar', `aria-disabled="${!!(lleno || limite || pobre)}" data-motivo="${esc(motivo)}"`)}${usar}</div></div>`;
}).join('');

const vBazar = (d, base) => titulo('Ofertas de hoy', `<span class="mut peq">cambian en ${cuenta(d.cambiaS, base)}</span>`) +
  d.ofertas.map(o => `<div class="fil"><div class="nom"><strong class="largo">${esc(o.nombre)}</strong><span class="mut peq">${fmt(o.precio)} monedas</span></div>
    ${botonPost('/api/bazar/comprar', { id: o.id }, o.comprada ? 'Comprada' : 'Comprar', `aria-disabled="${!!(o.comprada || d.cartera < o.precio)}" data-motivo="${esc(o.comprada ? 'Ya la compraste hoy.' : 'Te faltan monedas.')}"`)}</div>`).join('') +
  '<p class="mut peq" style="margin-top:10px">Una compra por oferta cada día. El equipo sale al nivel que tengas hoy.</p>';

const paginador = (k, d) => `<div class="btnrow" style="align-items:center"><button type="button" class="mini" data-pg="${k}" data-dir="-1" aria-disabled="${d.pagina <= 1}">Anterior</button><span class="mut peq" style="flex:none">Página ${d.pagina}</span><button type="button" class="mini" data-pg="${k}" data-dir="1" aria-disabled="${!d.hayMas}">Siguiente</button></div>`;
const opcionesVenta = d => d.vendibles.map(v => `<option value="${esc(v.clave)}">${esc(v.nombre)} (x${v.cantidad})</option>`).join('');

const vMercado = (d, base) => {
  const lleno = d.mias.length >= d.limite;
  const pub = d.vendibles.length
    ? `<div class="bloque vidrio"><select class="txt" id="mp-obj" aria-label="Objeto a vender">${opcionesVenta(d)}</select>
        <div class="campo"><input class="txt" id="mp-cant" type="number" inputmode="numeric" min="1" value="1" aria-label="Cantidad"><input class="txt" id="mp-precio" type="number" inputmode="numeric" min="1" max="${d.maxPrecio}" placeholder="Precio total" aria-label="Precio total"></div>
        <p class="mut peq" style="margin-top:8px">Comisión del ${d.comision}% al vender. Máximo ${fmt(d.maxPrecio)} monedas. Ofertas: ${d.mias.length}/${d.limite}.</p>
        <div class="btns uno">${botonPost('/api/mercado/publicar', {}, 'Publicar oferta', `data-campos="${esc(JSON.stringify({ clave: '#mp-obj', cantidad: '#mp-cant', precio: '#mp-precio' }))}" ${lleno ? 'aria-disabled="true" data-motivo="Ya tienes el máximo de ofertas."' : ''}`)}</div></div>`
    : vacio('No tienes objetos ni materiales para vender.');
  const mias = d.mias.length
    ? d.mias.map(o => `<div class="fil"><div class="nom"><strong class="largo">${esc(o.nombre)} x${o.cantidad}</strong><span class="mut peq">${fmt(o.precio)} monedas</span></div>${botonPost('/api/mercado/cancelar', { id: o.id }, 'Cancelar', '')}</div>`).join('')
    : vacio('No tienes ofertas publicadas.');
  const resto = d.ofertas.filter(o => !o.mia);
  const lista = resto.length
    ? resto.map(o => `<div class="fil"><div class="nom"><strong class="largo">${esc(o.nombre)} x${o.cantidad}</strong><span class="mut peq">${fmt(o.precio)} monedas</span></div>${botonPost('/api/mercado/comprar', { id: o.id }, 'Comprar', `aria-disabled="${d.cartera < o.precio}" data-motivo="Te faltan monedas."`)}</div>`).join('')
    : vacio('No hay ofertas de otros jugadores por ahora.');
  return `${titulo('Vender')}${pub}${titulo('Mis ofertas')}${mias}${titulo('A la venta')}${lista}${paginador('mercado', d)}`;
};

const vSubastas = (d, base) => {
  const lleno = d.mias.length >= d.limite;
  const horas = d.horas.map(h => `<option value="${h}" ${h === 6 ? 'selected' : ''}>${h} h</option>`).join('');
  const crear = d.vendibles.length
    ? `<div class="bloque vidrio"><select class="txt" id="sp-obj" aria-label="Objeto a subastar">${opcionesVenta(d)}</select>
        <div class="campo"><input class="txt" id="sp-cant" type="number" inputmode="numeric" min="1" value="1" aria-label="Cantidad"><input class="txt" id="sp-base" type="number" inputmode="numeric" min="1" max="${d.maxPrecio}" placeholder="Precio base" aria-label="Precio base"></div>
        <select class="txt" id="sp-horas" aria-label="Duración">${horas}</select>
        <p class="mut peq" style="margin-top:8px">Comisión del ${d.comision}% si se vende. Subastas: ${d.mias.length}/${d.limite}. El equipo se elige aquí también.</p>
        <div class="btns uno">${botonPost('/api/subastas/crear', {}, 'Crear subasta', `data-campos="${esc(JSON.stringify({ clave: '#sp-obj', cantidad: '#sp-cant', base: '#sp-base', horas: '#sp-horas' }))}" ${lleno ? 'aria-disabled="true" data-motivo="Ya tienes el máximo de subastas."' : ''}`)}</div></div>`
    : vacio('No tienes nada para subastar.');
  const fila = s => {
    const puja = s.puja > 0 ? 'Puja actual ' + fmt(s.puja) : 'Base ' + fmt(s.base) + ' · sin pujas';
    const acc = s.mia
      ? botonPost('/api/subastas/cancelar', { id: s.id }, 'Cancelar', `aria-disabled="${s.puja > 0}" data-motivo="Ya tiene pujas y no se puede cancelar."`)
      : s.ganando
        ? '<span class="etiq">Vas ganando</span>'
        : `<input class="txt corto" id="puja-${s.id}" type="number" inputmode="numeric" min="${s.minimo}" value="${s.minimo}" aria-label="Tu puja">${botonPost('/api/subastas/pujar', { id: s.id }, 'Pujar', `data-campos="${esc(JSON.stringify({ monto: '#puja-' + s.id }))}" aria-disabled="${d.cartera < s.minimo}" data-motivo="Te faltan monedas."`)}`;
    return `<div class="bloque vidrio"><div class="fila"><strong class="largo">${esc(s.nombre)}</strong></div>
      <p class="mut peq">${puja} · mínimo ${fmt(s.minimo)} · termina en ${cuenta(s.terminaS, base)}</p>
      <div class="btnrow" style="align-items:center">${acc}</div></div>`;
  };
  const mias = d.mias.length ? d.mias.map(fila).join('') : vacio('No tienes subastas activas.');
  const resto = d.activas.filter(s => !s.mia);
  const lista = resto.length ? resto.map(fila).join('') : vacio('No hay subastas de otros jugadores por ahora.');
  return `${titulo('Crear')}${crear}${titulo('Mis subastas')}${mias}${titulo('Activas')}${lista}${paginador('subastas', d)}`;
};

const SECCIONES_TIENDA = [['tienda', 'Tienda'], ['bazar', 'Bazar'], ['mercado', 'Mercado'], ['subastas', 'Subastas']];
function pintarTienda(d, base) {
  const seg = `<div class="seg" role="group" aria-label="Sección de la tienda">${SECCIONES_TIENDA.map(([k, n]) => `<button type="button" data-s="${k}" aria-pressed="${k === S.tiendaSel}">${n}</button>`).join('')}</div>`;
  const v = { tienda: vTienda, bazar: vBazar, mercado: vMercado, subastas: vSubastas }[S.tiendaSel];
  return cab('Tienda', 'Compra, vende y subasta con otros jugadores.', [['Cartera', fmt(d.cartera)], ['Nivel', me.nivel]]) + seg + v(d, base);
}

function pintarInventario(d, base) {
  const seg = `<div class="seg" role="group" aria-label="Sección del inventario">${[['objetos', 'Objetos'], ['equipo', 'Equipo'], ['forja', 'Forja']].map(([k, n]) => `<button type="button" data-i="${k}" aria-pressed="${k === S.invSel}">${n}</button>`).join('')}</div>`;
  return cab('Mochila', 'Tus herramientas, equipo y materiales.', S.invSel === 'objetos' && d.bolsa && d.items ? [['Monedas', fmt(me.monedas)], ['Espacios', d.items.length + '/' + d.bolsa.max], ['Nivel', me.nivel]] : undefined) + seg + (S.invSel === 'objetos' ? pintarObjetos(d, base) : S.invSel === 'forja' ? pintarForja(d) : pintarEquipo(d, base));
}

const pips = (n, m) => `<span class="pips">${'<i class="pip on"></i>'.repeat(n)}${'<i class="pip"></i>'.repeat(Math.max(0, m - n))}</span>`;
const dato = (ok, txt) => `<li class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '○'} ${txt}</li>`;

function pintarClase(d, base) {
  const c = d.clase;
  const actual = c
    ? `<div class="bloque vidrio"><div class="fila"><strong>${esc(c.emoji)} ${esc(c.nombre)}</strong><span class="mut peq">${pips(c.energia.n, c.energia.max)} ${c.energia.n}/${c.energia.max}</span></div>
        <p class="mut peq">${esc(c.desc)}</p>${c.energia.n < c.energia.max ? `<p class="peq">Próxima energía en ${cuenta(c.energia.faltaS, base)}</p>` : ''}</div>`
    : `<p class="mut peq">${d.clases.disponible ? 'Elige tu clase. Es gratis la primera vez.' : 'Se desbloquea en el nivel ' + d.clases.nivelMin + '.'}</p>`;
  const lista = d.clases.lista.map(k => {
    const habs = k.habilidades.map(h => `<div class="hab ${h.abierta ? '' : 'cerrada'}"><span>${esc(h.nombre)} <span class="mut peq">Nv ${h.nivel} · ${h.costo}⚡ · ${esc(h.efecto)}</span></span>${k.actual
      ? botonPost('/api/heroe/habilidad', { n: h.n }, h.activa ? 'Activa' : 'Usar', `${h.activa || !h.abierta ? 'aria-disabled="true"' : ''} data-motivo="${h.activa ? 'Ya está activa.' : 'Aún no la desbloqueas.'}"`)
      : ''}</div>`).join('');
    const confirma = c ? `Cambiar de clase cuesta ${fmt(d.clases.cambio)} monedas y reinicia tu energía. ¿Continuar?` : '';
    return `<div class="bloque vidrio clase ${k.actual ? 'actual' : ''}"><div class="fila"><strong>${esc(k.emoji)} ${esc(k.nombre)}</strong>${k.actual ? '<span class="etiq">Tu clase</span>' : ''}</div>
      <p class="mut peq">${esc(k.desc)}</p><div class="habs">${habs}</div>
      ${k.actual ? '' : `<div class="btns uno">${botonPost('/api/heroe/clase', { clase: k.id }, c ? 'Cambiar · ' + fmt(d.clases.cambio) : 'Elegir', `${d.clases.disponible ? '' : 'aria-disabled="true"'} data-motivo="Necesitas nivel ${d.clases.nivelMin}." ${confirma ? `data-confirmar="${esc(confirma)}"` : ''}`)}</div>`}</div>`;
  }).join('');
  return actual + `<div class="clases">${lista}</div>`;
}

function pintarTalentos(d) {
  const t = d.talentos;
  if (!d.clase) return '<p class="mut peq">Elige una clase para desbloquear talentos.</p>';
  const filas = t.lista.map(x => `<div class="tal"><span class="em">${esc(x.emoji)}</span><div><strong>${esc(x.nombre)}</strong> <span class="mut peq">${x.rango}/${x.max}</span><br><span class="mut peq">${esc(x.efecto)} por rango</span><br>${pips(x.rango, x.max)}</div>
    ${botonPost('/api/heroe/talento', { id: x.id }, '+1', `${!t.libres || x.rango >= x.max ? 'aria-disabled="true"' : ''} data-motivo="${x.rango >= x.max ? 'Ya está al máximo.' : 'No tienes puntos libres.'}"`)}</div>`).join('');
  return `<p class="peq">Puntos libres: <b>${t.libres}</b> de ${t.total} <span class="mut">(1 cada ${t.porNivel} niveles y ${t.porPrestigio} por prestigio)</span></p><div class="tals">${filas}</div>
    <div class="btns uno">${botonPost('/api/heroe/talentos-reiniciar', {}, 'Reiniciar · ' + fmt(t.reinicio), `${t.gastados ? '' : 'aria-disabled="true"'} data-motivo="No tienes talentos para reiniciar." data-confirmar="Reiniciar tus talentos cuesta ${fmt(t.reinicio)} monedas. ¿Continuar?"`)}</div>`;
}

function pintarAtributos(d) {
  const a = d.atributos;
  const filas = a.lista.map(x => `<div class="bloque vidrio"><div class="fila"><strong>${esc(x.emoji)} ${esc(x.nombre)}</strong><b>${x.valor}</b></div><p class="mut peq">${esc(x.desc)}</p>
    <div class="btnrow">${botonPost('/api/heroe/puntos', { stat: x.clave, cantidad: 1 }, '+1 punto', `${a.libres ? '' : 'aria-disabled="true"'} data-motivo="No tienes puntos libres."`)}${botonPost('/api/heroe/entrenar', { stat: x.clave }, a.entreno.lleno ? 'Tope' : 'Entrenar ' + fmt(a.entreno.costo), `${a.entreno.lleno ? 'aria-disabled="true"' : ''} data-motivo="Llegaste al tope de entrenamiento."`)}</div></div>`).join('');
  return `<p class="peq">Puntos libres: <b>${a.libres}</b> <span class="mut">(1 por nivel)</span> · Entrenamientos: ${a.entreno.n}/${a.entreno.tope}</p>${filas}`;
}

function pintarPrestigio(d) {
  const p = d.prestigio, c = p.cumple;
  const listo = c.nivel && c.monedas && c.cupo;
  return `<div class="bloque vidrio"><div class="fila"><strong>🌠 Prestigio ${p.n}/${p.max}</strong><span class="etiq">+${p.actual}% ingresos</span></div>
    <p class="mut peq">Renace con +${p.bono}% permanente en /work, /minar, /fish y /hunt. Se reinicia tu nivel, empleo y puntos. Conservas dinero, ítems y logros.</p>
    <ul class="req">${dato(c.nivel, 'Nivel ' + p.nivelReq)}${dato(c.monedas, fmt(p.costo) + ' monedas en la cartera')}${dato(c.cupo, 'Prestigio por debajo del máximo')}</ul>
    <div class="btns uno">${botonPost('/api/heroe/prestigio', {}, 'Renacer', `${listo ? '' : 'aria-disabled="true"'} data-motivo="Aún no cumples los requisitos." data-confirmar="Vas a renacer: tu nivel, empleo y puntos se reinician. ¿Continuar?"`)}</div></div>`;
}

function pintarExpedicion(d, base) {
  const e = d.expedicion;
  const curso = e.curso
    ? `<div class="bloque vidrio"><div class="fila"><strong>${esc(e.curso.emoji)} ${esc(e.curso.nombre)}</strong><span class="etiq">${e.curso.quien === 'mascota' ? 'Mascota' : 'Tú'}</span></div>
        <p class="peq">${e.curso.lista ? 'Lista para recoger.' : 'Termina en ' + cuenta(e.curso.restaS, base)}</p>
        <div class="btns uno">${botonPost('/api/heroe/expedicion-recoger', {}, 'Recoger', '')}</div></div>`
    : '';
  const lista = e.destinos.map(x => {
    const bloq = e.curso || !x.abierto;
    const motivo = e.curso ? 'Ya tienes una expedición en curso.' : 'Necesitas nivel ' + x.nivel + '.';
    return `<div class="bloque vidrio"><div class="fila"><strong>${esc(x.emoji)} ${esc(x.nombre)}</strong><span class="mut peq">${x.horas} h · Nv ${x.nivel}</span></div>
      <p class="mut peq">${fmt(x.monedas[0])}–${fmt(x.monedas[1])} monedas · ${esc(x.materiales)} · riesgo ${x.riesgo}% · reliquia ${x.reliquia}%</p>
      <div class="btnrow">${botonPost('/api/heroe/expedicion-iniciar', { destino: x.id, quien: 'yo' }, 'Ir yo · ' + fmt(x.costo), `${bloq ? 'aria-disabled="true"' : ''} data-motivo="${motivo}"`)}${botonPost('/api/heroe/expedicion-iniciar', { destino: x.id, quien: 'mascota' }, 'Mascota', `${bloq || !e.nivelMascota ? 'aria-disabled="true"' : ''} data-motivo="${e.nivelMascota ? motivo : 'Tu mascota no está disponible.'}"`)}</div></div>`;
  }).join('');
  return curso + lista;
}

function pintarHeroe(d, base) {
  return `<p class="peq mut" style="margin-top:8px">Cartera: <b>${fmt(d.cartera)}</b> monedas · Nivel ${d.nivel}</p>
    ${sec('h-clase', 'Clase y habilidades', d.clase ? esc(d.clase.nombre) : '', pintarClase(d, base))}
    ${sec('h-tal', 'Talentos', d.clase ? d.talentos.libres + ' libres' : '', pintarTalentos(d))}
    ${sec('h-atr', 'Atributos', d.atributos.libres + ' libres', pintarAtributos(d))}
    ${sec('h-exp', 'Expediciones', d.expedicion.curso ? 'En curso' : '', pintarExpedicion(d, base))}
    ${sec('h-pre', 'Prestigio', d.prestigio.n + '/' + d.prestigio.max, pintarPrestigio(d))}`;
}

function pintarOwner(d, base) {
  const e = d.estado;
  const k = (v, t) => `<div><b>${v}</b><span>${t}</span></div>`;
  return `<div class="bloque vidrio"><div class="fila"><strong>${e.online ? '🟢 Bot conectado' : '🔴 Bot desconectado'}</strong><span class="mut peq">${esc(d.instancia.id)}</span></div>
    <div class="kpis">${k(dur(e.uptimeS), 'Activo')}${k(e.latenciaWaMs == null ? '—' : e.latenciaWaMs + ' ms', 'WhatsApp')}${k(e.latenciaDbMs == null ? '—' : e.latenciaDbMs + ' ms', 'Base de datos')}${k(e.ramMb + ' MB', 'Memoria')}${k(e.lagMs + ' ms', 'Lag del proceso')}${k(esc(d.instancia.node), 'Node')}</div></div>
    <div class="bloque vidrio"><div class="kpis">${k(fmt(d.totales.usuarios), 'Usuarios')}${k(fmt(d.totales.clanes), 'Clanes')}${k(d.web.habilitada ? 'Activa' : 'Apagada', 'API web')}${k(d.creadores, 'Creadores')}</div>
    <p class="mut peq" style="margin-top:10px">Datos de esta instancia. Si corres varias, abre el panel de cada una.</p></div>`;
}

const valores = {};
let progSel = 'misiones';
const SECCIONES_CIUDAD = [['banco', 'Banco'], ['negocios', 'Negocios'], ['casino', 'Casino'], ['altar', 'Altar'], ['jugadores', 'Jugadores']];
const campo = (id, v, ph, o = {}) => `<input class="txt" id="${id}" data-v="${v}" type="${o.tipo || 'number'}" ${o.tipo === 'text' ? 'maxlength="24" autocomplete="off"' : 'inputmode="numeric" min="1"'} placeholder="${esc(ph)}" aria-label="${esc(ph)}" value="${esc(valores[v] !== undefined ? valores[v] : (o.def || ''))}">`;
const camposAttr = o => `data-campos="${esc(JSON.stringify(o))}"`;
const bloqueado = (cond, motivo) => `${cond ? 'aria-disabled="true"' : ''} data-motivo="${esc(motivo)}"`;

function pintarBanco(d) {
  const tramos = d.impuesto.tramos.map(t => 'desde ' + fmt(t.desde) + ': ' + t.tasa + '%').join(' · ');
  const imp = `<p class="mut peq" style="margin-top:8px">Impuesto diario por tramos sobre tu patrimonio (${tramos}).</p>${d.impuesto.aplica ? `<p class="peq" style="margin-top:6px">Hoy pagarías ${fmt(d.impuesto.diario)} al día. Guardar monedas en el banco no te libra de él.</p>` : ''}`;
  return `${cifras([['Cartera', fmt(d.cartera)], ['Banco', fmt(d.banco)], ['Total', fmt(d.total)]])}
    <div class="bloque vidrio"><p class="mut peq">Interés de ${d.tasa}% diario (máximo ${fmt(d.topeDia)} por día, hasta ${d.maxDias} días acumulados). Lo que está en el banco no se puede robar.</p>${imp}
      ${campo('bk-cant', 'banco', 'Cantidad')}
      <div class="btns">${botonPost('/api/banco/depositar', {}, 'Depositar', camposAttr({ cantidad: '#bk-cant' }))}${botonPost('/api/banco/retirar', {}, 'Retirar', camposAttr({ cantidad: '#bk-cant' }))}
      ${botonPost('/api/banco/depositar', { cantidad: 'todo' }, 'Depositar todo', bloqueado(d.cartera < 1, 'No tienes monedas en la cartera.'))}${botonPost('/api/banco/retirar', { cantidad: 'todo' }, 'Retirar todo', bloqueado(d.banco < 1, 'No tienes monedas en el banco.'))}</div></div>`;
}

function pintarNegocios(d) {
  const lista = d.negocios.map(n => n.tiene
    ? `<div class="bloque vidrio"><div class="fila"><strong>${esc(n.emoji)} ${esc(n.nombre)}</strong><span class="mut peq">Nv ${n.nivel}/${n.max}</span></div>
        <p class="mut peq">${fmt(n.tasa)} monedas por hora · pendiente <b>${fmt(n.pendiente)}</b></p>
        <div class="btns uno">${n.costoMejora === null ? '<button type="button" class="mini" aria-disabled="true" data-motivo="Ya está al máximo.">Nivel máximo</button>' : botonPost('/api/negocios/mejorar', { clave: n.clave }, 'Mejorar · ' + fmt(n.costoMejora), bloqueado(!n.puede, 'Te faltan monedas.'))}</div></div>`
    : `<div class="bloque vidrio"><div class="fila"><strong>${esc(n.emoji)} ${esc(n.nombre)}</strong><b>${fmt(n.precio)}</b></div>
        <p class="mut peq">Produce ${fmt(n.tasa)} monedas por hora.</p>
        <div class="btns uno">${botonPost('/api/negocios/comprar', { clave: n.clave }, 'Comprar', bloqueado(!n.puede, 'Te faltan monedas.'))}</div></div>`).join('');
  return `<div class="cartera">Cartera <b>${fmt(d.cartera)}</b> monedas</div>
    <div class="btns uno">${botonPost('/api/negocios/cobrar', {}, 'Cobrar · ' + fmt(d.pendienteTotal), bloqueado(d.pendienteTotal < 1, 'Todavía no han producido nada.'))}</div>
    <p class="mut peq" style="margin-top:8px">Acumulan hasta ${d.capHoras} horas. Cobra antes de que se llenen.</p>${lista}`;
}

function pintarCasino(d) {
  const camp = camposAttr({ monto: '#cs-monto' });
  const ruleta = ['rojo', 'negro', 'par', 'impar', 'verde'].map(k => botonPost('/api/casino/ruleta', { apuesta: k }, k[0].toUpperCase() + k.slice(1) + ' x' + d.ruleta.colores[k], camp)).join('');
  return `<div class="cartera">Cartera <b>${fmt(d.cartera)}</b> monedas</div>
    <div class="bloque vidrio">${campo('cs-monto', 'apuesta', 'Apuesta (' + fmt(d.min) + ' a ' + fmt(d.max) + ')', { def: d.min })}
      <p class="mut peq" style="margin-top:8px">La casa siempre gana a la larga. Juega con lo que puedas perder.</p></div>
    <div class="sec"><h2>Tragamonedas</h2></div>
    <div class="bloque vidrio"><p class="mut peq">${d.tragamonedas.map(s => esc(s.emoji) + ' x' + s.x).join(' · ')} · pareja x${d.par}</p>
      <div class="btns uno">${botonPost('/api/casino/tragamonedas', {}, 'Girar', camp)}</div></div>
    <div class="sec"><h2>Cara o cruz</h2></div>
    <div class="bloque vidrio"><p class="mut peq">Pagan ${Math.round(d.moneda.pago * 100)}% de tu apuesta.</p>
      <div class="btns">${botonPost('/api/casino/moneda', { lado: 'cara' }, '🙂 Cara', camp)}${botonPost('/api/casino/moneda', { lado: 'cruz' }, '🦅 Cruz', camp)}</div></div>
    <div class="sec"><h2>Ruleta</h2></div>
    <div class="bloque vidrio"><div class="btns">${ruleta}</div>
      ${campo('cs-num', 'ruletaNum', 'Número del 0 al 36')}
      <div class="btns uno">${botonPost('/api/casino/ruleta', {}, 'Apostar al número x' + d.ruleta.numero, camposAttr({ monto: '#cs-monto', apuesta: '#cs-num' }))}</div></div>`;
}

function pintarJugadores(d, base) {
  const res = d.resultados.length
    ? d.resultados.map(j => `<div class="bloque vidrio"><strong>${esc(j.alias)}</strong>
        <div class="btnrow">${botonPost('/api/jugadores/pagar', { ref: j.ref }, 'Pagar', camposAttr({ cantidad: '#jg-cant' }))}${botonPost('/api/jugadores/robar', { ref: j.ref }, 'Robar', `data-confirmar="¿Intentar robar a ${esc(j.alias)}? Si sale mal pagas una multa."`)}</div></div>`).join('')
    : S.jugQ ? vacio('No encontré jugadores con ese nombre. Solo aparecen quienes han entrado al panel.') : '';
  const espera = d.robo.esperaS > 0 ? `Podrás robar de nuevo en ${cuenta(d.robo.esperaS, base)}.` : 'Listo para robar.';
  return `<div class="cartera">Cartera <b>${fmt(d.cartera)}</b> monedas</div>
    <div class="bloque vidrio"><p class="mut peq">Busca a un jugador por su nombre del panel. Pagar cobra ${d.pago.tasa}% de impuesto (mínimo ${fmt(d.pago.min)}). Robar necesita ${fmt(d.robo.min)} en tu cartera y tiene ${d.robo.exito}% de éxito.</p>
      <p class="peq" style="margin-top:6px">${espera}${d.robo.escudo > 0 ? ' Tienes un escudo activo que se romperá si atacas.' : ''}</p>
      <div class="campo" style="margin-top:10px"><input class="txt corto" id="jg-q" data-v="jq" type="text" maxlength="24" autocomplete="off" placeholder="Nombre del jugador" aria-label="Nombre del jugador" value="${esc(S.jugQ)}"><button type="button" class="mini" data-buscar="jug">Buscar</button></div>
      ${campo('jg-cant', 'pago', 'Cantidad a pagar')}</div>${res}`;
}

function pintarCiudad(d, base) {
  const seg = segHtml('Sección de la ciudad', SECCIONES_CIUDAD, S.ciudadSel, 'c');
  const v = { banco: pintarBanco, negocios: pintarNegocios, casino: pintarCasino, altar: pintarAltar, jugadores: pintarJugadores }[S.ciudadSel];
  return cab('Ciudad', 'Banco, negocios, casino y otros jugadores.') + seg + v(d, base);
}

function pintarAltar(d) {
  const filas = d.lista.map(r => `<div class="fil"><div class="nom"><strong>${esc(r.emoji)} ${esc(r.nombre)}</strong><span class="mut peq">${r.tiene ? 'En tu colección' : fmt(d.precio) + ' monedas'}</span></div>${r.tiene ? '<span class="val">✓</span>' : botonPost('/api/altar/comprar', { clave: r.clave }, 'Comprar', `data-confirmar="¿Pagar ${fmt(d.precio)} monedas por ${esc(r.nombre)}?" ` + bloqueado(d.cartera < d.precio, 'No te alcanza con la cartera.'))}</div>`).join('');
  return `${cifras([['Cartera', fmt(d.cartera)], ['Colección', d.n + '/' + d.total], ['Bono', '+' + d.bono + '%']])}
    <div class="bloque vidrio"><p class="mut peq">Cada reliquia da un bono permanente de ingresos. El precio sube con cada una que compras${d.completo ? '' : ': la siguiente cuesta ' + fmt(d.precio)}. Se paga con la cartera.</p></div>
    <div class="lista">${filas}</div>`;
}

function pintarForja(d) {
  const mats = d.materiales.filter(m => m.cantidad > 0);
  const venta = mats.length
    ? `<div class="mats">${mats.map(m => `<div class="mat">${slot(m.emoji, { n: fmt(m.cantidad) })}<span class="peq">${esc(m.nombre)}</span></div>`).join('')}</div>
       <p class="mut peq" style="margin-top:10px">Valor aproximado: ${fmt(d.valorMateriales)} monedas.</p>
       ${mats.map(m => `<div class="fil"><div class="nom"><strong>${esc(m.emoji)} ${esc(m.nombre)}</strong><span class="mut peq">${fmt(m.precio)} c/u</span></div>${botonPost('/api/forja/vender', { material: m.clave, cantidad: 'todo' }, 'Vender ' + fmt(m.cantidad), `data-confirmar="¿Vender ${m.cantidad} ${esc(m.nombre)} por ${fmt(m.cantidad * m.precio)} monedas?"`)}</div>`).join('')}
       <div class="btns uno">${botonPost('/api/forja/vender', { material: 'todo' }, 'Vender todos los materiales', `data-confirmar="¿Vender todos tus materiales por ${fmt(d.valorMateriales)} monedas?"`)}</div>`
    : vacio('Aún no tienes materiales. Mina, tala o pesca para conseguirlos.');
  const recetas = d.recetas.map(r => `<div class="bloque vidrio"><div class="fila"><strong>${esc(r.emoji)} ${esc(r.nombre)}</strong><span class="mut peq">Tienes ${r.stock}/${d.tope}</span></div>
    <p class="peq">${r.reqs.map(x => `${esc(x.emoji)} ${x.tengo}/${x.necesita}`).join(' · ')}</p>
    <div class="btns uno">${botonPost('/api/forja/fabricar', { clave: r.clave }, 'Fabricar', bloqueado(!r.puede, 'Te faltan materiales o tu inventario está lleno.'))}</div></div>`).join('');
  return `${sec('f-rec', 'Recetas', '', recetas)}${sec('f-mat', 'Vender materiales', '', venta)}`;
}

function pintarProgreso(d, base) {
  const ops = [['misiones', 'Misiones'], ['logros', 'Logros'], ['maestria', 'Maestría'], ['titulos', 'Títulos']];
  const seg = `<div class="seg" role="group" aria-label="Sección de progreso">${ops.map(([k, n]) => `<button type="button" data-g="${k}" aria-pressed="${k === progSel}">${n}</button>`).join('')}</div>`;
  let cuerpo = '';
  if (progSel === 'misiones') {
    const m = d.misiones;
    cuerpo = `<p class="mut peq" style="margin-top:12px">Se renuevan en ${cuenta(m.reiniciaS, base)}.</p>` + m.diarias.map(x => `<div class="bloque vidrio"><div class="fila"><strong>${x.hecha ? '✅' : '⬜'} ${esc(x.emoji)} ${esc(x.texto)}</strong></div>
      ${barra(x.prog, x.meta)}<div class="fila peq"><span>${x.prog}/${x.meta}</span><span class="mut">🎁 ${fmt(x.monedas)} · ${x.xp} XP</span></div></div>`).join('') +
      `<div class="aviso-i">🌟 Bono por completar todas: ${fmt(m.bono.monedas)} monedas y ${m.bono.xp} XP · ${m.bono.hecho ? 'ya reclamado' : 'pendiente'}</div>`;
  } else if (progSel === 'logros') {
    const l = d.logros;
    cuerpo = `<p class="mut peq" style="margin-top:12px">${l.tengo} de ${l.total} logros conseguidos.</p>` + l.lista.map(x => `<div class="fil"><span class="pt">${esc(x.emoji)}</span>
      <div class="nom"><strong class="largo">${x.tiene ? '✅' : '🔒'} ${esc(x.nombre)}</strong><span class="mut peq">${esc(x.desc)}${x.tiene ? '' : ' · ' + x.prog + '/' + x.meta}</span></div>${x.tiene ? '' : `<span class="val">🎁 ${fmt(x.monedas)}</span>`}</div>`).join('');
  } else if (progSel === 'maestria') {
    cuerpo = `<p class="mut peq" style="margin-top:12px">Cada actividad suma usos y da bonos permanentes.</p>` + d.maestria.actividades.map(a => `<div class="bloque vidrio"><div class="fila"><strong>${esc(a.emoji)} ${esc(a.nombre)}</strong><span class="mut peq">Nv ${a.nivel}/${d.maestria.max}</span></div>
      ${a.sig ? barra(a.usos - a.previo, a.sig - a.previo) + `<div class="fila peq"><span>${a.usos}/${a.sig} usos</span></div>` : '<p class="peq">Nivel máximo</p>'}
      <p class="mut peq">+${a.botin}% monedas · +${a.evento}% eventos</p></div>`).join('');
  } else {
    const t = d.titulos;
    cuerpo = `<div class="cartera">Cartera <b>${fmt(t.cartera)}</b> monedas</div>` + t.lista.map(x => {
      const accion = x.tiene
        ? (x.puesto ? botonPost('/api/titulos/equipar', {}, 'Quitar', '') : botonPost('/api/titulos/equipar', { clave: x.clave }, 'Equipar', ''))
        : botonPost('/api/titulos/comprar', { clave: x.clave }, x.prestigio ? 'Prestigio ' + x.prestigio : fmt(x.precio), bloqueado(!x.puede, x.prestigio ? 'Necesitas prestigio ' + x.prestigio + '.' : 'Te faltan monedas.'));
      return `<div class="fil"><div class="nom"><strong class="largo">${esc(x.nombre)}${x.puesto ? '<span class="etiq">Puesto</span>' : ''}</strong></div>${accion}</div>`;
    }).join('');
  }
  return seg + cuerpo;
}

function pintarClan(d, base) {
  const c = d.clan;
  const busca = `<div class="campo" style="margin-top:10px"><input class="txt corto" id="cl-q" data-v="cq" type="text" maxlength="24" autocomplete="off" placeholder="Buscar jugador para invitar" aria-label="Buscar jugador" value="${esc(S.clanQ)}"><button type="button" class="mini" data-buscar="clan">Buscar</button></div>`;
  let propio = '';
  if (c) {
    const miembros = c.miembros.map(m => `<div class="fil"><div class="nom"><strong>${m.lider ? '👑 ' : ''}${esc(m.alias)}${m.yo ? ' (tú)' : ''}</strong></div>
      ${m.ref ? `${botonPost('/api/clan/traspasar', { ref: m.ref }, 'Líder', `data-confirmar="¿Traspasar el liderazgo a ${esc(m.alias)}?"`)}${botonPost('/api/clan/expulsar', { ref: m.ref }, 'Expulsar', `data-confirmar="¿Expulsar a ${esc(m.alias)}?"`)}` : ''}</div>`).join('');
    const resultados = c.lider && d.resultados.length ? d.resultados.map(j => `<div class="fil"><div class="nom"><strong>${esc(j.alias)}</strong></div>${botonPost('/api/clan/invitar', { ref: j.ref }, 'Invitar', '')}</div>`).join('') : '';
    propio = `<div class="bloque vidrio"><div class="fila"><strong>🏰 ${esc(c.nombre)}</strong><span class="mut peq">Nv ${c.nivel}/${c.max}</span></div>
      ${kv('Miembros', c.miembros.length + '/' + c.cupo)}${kv('Banco del clan', fmt(c.banco))}${kv('Bono de ingresos', '+' + c.bono + '%')}${kv('Guerra', fmt(c.guerra.pts) + ' pts' + (c.guerra.puesto ? ' · puesto ' + c.guerra.puesto : ''))}</div>
      <div class="bloque vidrio">${campo('cl-dep', 'clanDep', 'Cantidad a depositar')}
        <div class="btns uno">${botonPost('/api/clan/depositar', {}, 'Depositar al banco del clan', camposAttr({ cantidad: '#cl-dep' }))}</div></div>
      ${c.lider ? `<div class="bloque vidrio"><p class="mut peq">Mejorar al nivel ${c.nivel + 1} cuesta ${fmt(c.costoMejora)} del banco del clan (sube con el prestigio del líder). El bono de ingresos llega hasta el nivel ${c.bonoMax}; después solo crece el cupo.</p><div class="btns uno">${botonPost('/api/clan/mejorar', {}, 'Mejorar clan', bloqueado(c.banco < c.costoMejora, 'El banco del clan no alcanza.'))}</div>${busca}${resultados}</div>` : ''}
      ${sec('cl-mi', 'Miembros', c.miembros.length + '', miembros)}
      <div class="btns uno">${c.lider ? botonPost('/api/clan/disolver', { confirmar: true }, 'Disolver clan', 'data-confirmar="Se borrará el clan y se pierde el banco. ¿Continuar?"') : botonPost('/api/clan/salir', {}, 'Salir del clan', 'data-confirmar="¿Salir del clan?"')}</div>`;
  } else {
    const inv = d.invitacion
      ? `<div class="bloque vidrio"><strong>📨 Invitación a ${esc(d.invitacion.nombre)}</strong><p class="mut peq">Caduca en ${cuenta(d.invitacion.restaS, base)}.</p>
          <div class="btnrow">${botonPost('/api/clan/aceptar', {}, 'Aceptar', '')}${botonPost('/api/clan/rechazar', {}, 'Rechazar', '')}</div></div>`
      : '';
    propio = `${inv}<div class="bloque vidrio"><strong>Fundar un clan</strong><p class="mut peq">Cuesta ${fmt(d.costoFundar)} monedas. Banco común y bono de ingresos para todos.</p>
      ${campo('cl-nom', 'clanNombre', 'Nombre (3 a 16 letras o números)', { tipo: 'text' })}
      <div class="btns uno">${botonPost('/api/clan/crear', {}, 'Fundar', `${camposAttr({ nombre: '#cl-nom' })} ${bloqueado(d.cartera < d.costoFundar, 'Te faltan monedas.')}`)}</div></div>`;
  }
  const g = d.guerra;
  const top = d.top.length ? d.top.map(x => filaRanking(x, `Nv ${x.nivel} · ${x.miembros} miembro${x.miembros === 1 ? '' : 's'}`, fmt(x.banco))).join('') : vacio('Aún no hay clanes.');
  const guerra = `<p class="mut peq" style="margin-top:12px">Semana ${esc(g.semana)} · cierra en ${cuenta(g.cierraS, base)}<br>Premios al banco: ${g.premios.map((p, i) => medalla(i) + ' ' + fmt(p)).join(' · ')} (mínimo ${g.minPuntos} pts)</p>` +
    (g.ranking.length ? g.ranking.map(x => filaRanking(x, `${x.miembros} miembro${x.miembros === 1 ? '' : 's'}`, fmt(x.pts) + ' pts')).join('') : vacio('Todavía nadie ha puntuado esta semana.'));
  return `${titulo('Tu clan')}${propio}${sec('cl-guerra', 'Guerra de clanes', '', `<div class="lista">${guerra}</div>`)}${sec('cl-top', 'Top clanes', '', `<div class="lista">${top}</div>`)}`;
}

const CARGA = {
  ficha: [() => ({ historial: '/api/historial', heroe: '/api/heroe', progreso: '/api/progreso', owner: '/api/owner' }[S.perfilSel] || '/api/ficha'), pintarPerfil],
  inventario: [() => S.invSel === 'equipo' ? '/api/equipo' : S.invSel === 'forja' ? '/api/forja' : '/api/inventario', pintarInventario],
  tienda: [() => S.tiendaSel === 'mercado' ? '/api/mercado?pagina=' + merPag : S.tiendaSel === 'subastas' ? '/api/subastas?pagina=' + subPag : '/api/' + S.tiendaSel, pintarTienda],
  hogar: [() => '/api/' + S.hogarSel, pintarHogar],
  ciudad: [() => S.ciudadSel === 'jugadores' ? '/api/jugadores?q=' + encodeURIComponent(S.jugQ) : '/api/' + S.ciudadSel, pintarCiudad],
  rankings: ['/api/rankings', pintarRankings],
  gacha: [() => S.gachaSel === 'coleccion' ? '/api/gacha/coleccion?pagina=' + gachaPag : S.gachaSel === 'tratos' ? '/api/gacha/trato?q=' + encodeURIComponent(S.gtQ) + '&ref=' + encodeURIComponent(S.gtRef) + '&pm=' + S.gtPm + '&ps=' + gtPs : '/api/gacha', pintarGacha],
  raid: ['/api/raid', pintarRaidTab],
  mazmorra: ['/api/mazmorra', pintarMazmorraTab],
  clan: [() => '/api/clan?q=' + encodeURIComponent(S.clanQ), pintarClanTab]
};

function dibujar(t) { if (cargado[t]) store.notificar(t); }
async function abrir(t, forzar) {
  if (t === 'historial' || t === 'heroe') { S.perfilSel = t; t = 'ficha'; }
  if (!TABS.includes(t)) t = 'inicio';
  const cambio = tabActual !== t;
  tabActual = t;
  for (const k of TABS) $('#t-' + k).hidden = k !== t;
  for (const [k] of NAV) {
    const b = $('#nav [data-t="' + k + '"]');
    if (k === (PADRE[t] || t)) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
  try { history.replaceState(null, '', t === 'inicio' ? location.pathname : '#' + t); } catch (_) {}
  if (cambio) window.scrollTo(0, 0);
  if (t === 'inicio') return;
  return store.cargar(t, forzar);
}
$('#nav').addEventListener('click', e => { const b = e.target.closest('button[data-t]'); if (!b) return; if (b.dataset.t === tabActual) window.scrollTo({ top: 0, behavior: 'smooth' }); abrir(b.dataset.t); });
async function publicar(b, ruta, cuerpo) {
  if (publicando || ocupado) return;
  publicando = true; b.setAttribute('aria-busy', 'true');
  try {
    const d = await api(ruta, cuerpo);
    store.vaciar();
    if (d.me) aplicar(d.me);
    if (ruta.includes('/gacha') || ruta.includes('/raid')) cargarEventos(true);
    if (ruta.includes('/gacha/')) sondearAbiertas();
    if (ruta.includes('/gacha/')) { S.gtMia = 0; S.gtSuya = 0; }
    if (d.resultado) {
      const { chips, nom, col, mal, nivel } = resumen('', d.resultado);
      const ico = ruta.includes('/gacha') ? ICONOS.gacha : ruta.includes('/raid') ? ICONOS.raid : ruta.includes('/clan') ? ICONOS.clan : ruta.includes('granja') ? ICONOS.leaf : ruta.includes('mazmorra') ? ICONOS.hunt : ruta.includes('/casino') ? ICONOS.dado : ruta.includes('/jugadores') ? ICONOS.mask : ruta.includes('/banco') || ruta.includes('/negocios') ? ICONOS.moneda : ICONOS.gift;
      hoja({ icono: ico, col, mal, nivel, rareza: ruta.includes('/raid') ? '' : nom, chips, titulo: d.resultado.titulo, zona: d.resultado.zona, pie: '', boton: 'Listo', imagen: d.resultado.carta ? d.resultado.carta.imagen : null });
    } else if (d.mensaje) aviso(d.mensaje);
    await abrir(tabActual, true);
  } catch (e) {
    if (e.estado === 401) sesionCaducada(); else aviso(e.message);
  } finally { publicando = false; b.removeAttribute('aria-busy'); }
}
$('#v-panel').addEventListener('click', e => {
  if (e.target.closest('[data-reintentar]')) return abrir(tabActual, true);
  const r = e.target.closest('button[data-r]');
  if (r) { rankSel = r.dataset.r; return dibujar('rankings'); }
  const si = e.target.closest('button[data-i]');
  if (si) { S.invSel = si.dataset.i; delete cargado.inventario; return abrir('inventario', true); }
  const ss = e.target.closest('button[data-s]');
  if (ss) { S.tiendaSel = ss.dataset.s; delete cargado.tienda; return abrir('tienda', true); }
  const pg = e.target.closest('button[data-pg]');
  if (pg) {
    if (pg.getAttribute('aria-disabled') === 'true') return;
    const dir = Number(pg.dataset.dir);
    if (pg.dataset.pg === 'mercado') S.merPag = Math.max(1, S.merPag + dir); else S.subPag = Math.max(1, S.subPag + dir);
    delete cargado.tienda;
    return abrir('tienda', true);
  }
  const ir = e.target.closest('[data-ir]');
  if (ir) return abrir(ir.dataset.ir);
  if (e.target.closest('[data-ir-raid]')) return abrir('raid', true);
  if (e.target.closest('[data-ir-gacha]')) {
    const g = eventos.gacha;
    S.gachaSel = g && g.trato > Date.now() && !(g.pend > Date.now()) && !abiertas.some(a => a.fin > Date.now()) ? 'tratos' : 'invocar';
    S.gachaPag = 1;
    return abrir('gacha', true);
  }
  const ge = e.target.closest('button[data-gt-elegir]');
  if (ge) { S.gtRef = ge.dataset.gtElegir; S.gtPm = 1; S.gtPs = 1; S.gtMia = 0; S.gtSuya = 0; delete cargado.gacha; return abrir('gacha', true); }
  if (e.target.closest('[data-gt-quitar]')) { S.gtRef = ''; S.gtMia = 0; S.gtSuya = 0; delete cargado.gacha; return abrir('gacha', true); }
  const gm = e.target.closest('button[data-gt-mia]');
  if (gm) { const v = Number(gm.dataset.gtMia); S.gtMia = S.gtMia === v ? 0 : v; return dibujar('gacha'); }
  const gu = e.target.closest('button[data-gt-suya]');
  if (gu) { const v = Number(gu.dataset.gtSuya); S.gtSuya = S.gtSuya === v ? 0 : v; return dibujar('gacha'); }
  const gtp = e.target.closest('button[data-gt-pg]');
  if (gtp) {
    if (gtp.getAttribute('aria-disabled') === 'true') return;
    const dir = Number(gtp.dataset.dir);
    if (gtp.dataset.gtPg === 'm') S.gtPm = Math.max(1, S.gtPm + dir); else S.gtPs = Math.max(1, S.gtPs + dir);
    delete cargado.gacha;
    return abrir('gacha', true);
  }
  const gs = e.target.closest('button[data-gs]');
  if (gs) { S.gachaSel = gs.dataset.gs; S.gachaPag = 1; delete cargado.gacha; return abrir('gacha', true); }
  const gp = e.target.closest('button[data-gp]');
  if (gp) {
    if (gp.getAttribute('aria-disabled') === 'true') return;
    S.gachaPag = Math.max(1, S.gachaPag + Number(gp.dataset.gp));
    delete cargado.gacha;
    return abrir('gacha', true);
  }
  if (e.target.closest('[data-salir]')) return salir();
  const fo = e.target.closest('button[data-fo]');
  if (fo) { invFiltro = fo.dataset.fo; return dibujar('inventario'); }
  const fe = e.target.closest('button[data-fe]');
  if (fe) { eqFiltro = fe.dataset.fe; return dibujar('inventario'); }
  const sl = e.target.closest('button[data-sel]');
  if (sl) { selEq = Number(sl.dataset.sel); return dibujar('inventario'); }
  const pf = e.target.closest('button[data-p]');
  if (pf) { S.perfilSel = pf.dataset.p; delete cargado.ficha; return abrir('ficha', true); }
  const sc = e.target.closest('button[data-c]');
  if (sc) { S.ciudadSel = sc.dataset.c; delete cargado.ciudad; return abrir('ciudad', true); }
  const sg = e.target.closest('button[data-g]');
  if (sg) { progSel = sg.dataset.g; return dibujar('ficha'); }
  const bs = e.target.closest('button[data-buscar]');
  if (bs) {
    if (bs.dataset.buscar === 'gacha') { S.gtQ = ($('#gt-q') || {}).value || ''; S.gtRef = ''; S.gtMia = 0; S.gtSuya = 0; delete cargado.gacha; return abrir('gacha', true); }
    if (bs.dataset.buscar === 'jug') { S.jugQ = ($('#jg-q') || {}).value || ''; delete cargado.ciudad; return abrir('ciudad', true); }
    S.clanQ = ($('#cl-q') || {}).value || ''; delete cargado.clan; return abrir('clan', true);
  }
  const h = e.target.closest('button[data-h]');
  if (h) { S.hogarSel = h.dataset.h; delete cargado.hogar; return abrir('hogar', true); }
  const rn = e.target.closest('button[data-renombrar]');
  if (rn) {
    const n = window.prompt('Nuevo nombre (2 a 16 letras o números):', rn.dataset.renombrar);
    if (n && n.trim()) publicar(rn, '/api/mascota/renombrar', { nombre: n.trim() });
    return;
  }
  const b = e.target.closest('button[data-post]');
  if (!b) return;
  if (b.getAttribute('aria-disabled') === 'true') return aviso(b.dataset.motivo || b.dataset.bloq || 'Todavía no está disponible.');
  if (b.dataset.confirmar && !window.confirm(b.dataset.confirmar)) return;
  const cuerpo = JSON.parse(b.dataset.body || '{}');
  if (b.dataset.campos) {
    const campos = JSON.parse(b.dataset.campos);
    for (const k in campos) { const el = $(campos[k]); cuerpo[k] = el ? el.value : ''; }
  }
  if (b.dataset.nombre) cuerpo.nombre = ($(b.dataset.nombre) || {}).value || '';
  publicar(b, b.dataset.post, cuerpo);
});

document.addEventListener('input', e => {
  const v = e.target && e.target.dataset && e.target.dataset.v;
  if (v) valores[v] = e.target.value;
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const id = e.target && e.target.id;
  const destino = { 'jg-q': 'jug', 'cl-q': 'clan', 'gt-q': 'gacha' }[id];
  if (!destino) return;
  const b = document.querySelector('button[data-buscar="' + destino + '"]');
  if (b) b.click();
});
$('#codigo').addEventListener('input', e => {
  const l = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  e.target.value = l.length > 4 ? l.slice(0, 4) + '-' + l.slice(4) : l;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !me || ocupado) return;
  refrescar();
  if (tabActual !== 'inicio') abrir(tabActual);
});
$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  if (enviando) return;
  const codigo = $('#codigo').value.toUpperCase().replace(/[^A-Z0-9]/g, ''), b = $('#entrar'), msg = $('#err');
  msg.textContent = '';
  if (codigo.length !== 8) return (msg.textContent = 'El código tiene 8 caracteres. Revisa que lo hayas copiado completo.');
  enviando = true; b.textContent = 'Entrando…';
  try {
    await api('/api/auth/login', { codigo });
    previa = {}; store.vaciar(); limpiarTabs();
    aplicar(await api('/api/me'));
    $('#codigo').value = ''; vista('panel'); abrir('inicio');
  } catch (x) { msg.textContent = x.message; }
  finally { enviando = false; b.textContent = 'Entrar'; }
});
async function salir() {
  try { await api('/api/auth/logout', {}); } catch (_) {}
  me = null; store.vaciar(); previa = {}; limpiarTabs();
  vista('login');
}
$('#top-ava').addEventListener('click', () => abrir('ficha'));

(async function () {
  if (BOT_NUMBER) { const wa = $('#wa'); wa.href = 'https://wa.me/' + BOT_NUMBER + '?text=%2Fweb'; wa.hidden = false; }
  avisosOn = leerAvisos();
  montar();
  pintarCampana();
  try {
    aplicar(await api('/api/me'));
    vista('panel');
    abrir(location.hash.slice(1) || 'inicio');
  } catch (_) { vista('login'); }
})();

const sinMov = matchMedia('(prefers-reduced-motion: reduce)').matches;
function vibra(p) { if (!sinMov && navigator.vibrate) { try { navigator.vibrate(p); } catch (_) {} } }
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('button:not(:disabled):not([aria-disabled="true"]), .atajo');
  if (!b || !b.matches('.accion,.mini,.btn,.btn2,.atajo,.seg button,.nav button')) return;
  vibra(8);
  if (!b.matches('.accion,.mini,.btn,.btn2')) return;
  b.classList.remove('toco'); void b.offsetWidth; b.classList.add('toco');
  setTimeout(() => b.classList.remove('toco'), 500);
}, { passive: true });
