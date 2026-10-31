export const BOT_NUMBER = '5219633122232';
export const TITULO = 'Isla · Panel';

export const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICONOS = {
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
  clan: svg('<path d="M4 21 V9 L7 7 V4 H9 V7 H11 V4 H13 V7 H15 V4 H17 V7 L20 9 V21"/><path d="M3 21 H21"/><path d="M10 21 V15 A2 2 0 0 1 14 15 V21"/>'),
  alquimia: svg('<path d="M9 3 H15"/><path d="M10 3 V9 L4.5 19 A2 2 0 0 0 6.3 21 H17.7 A2 2 0 0 0 19.5 19 L14 9 V3"/><path d="M7.5 15 H16.5"/>'),
  mundial: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12 H21"/><path d="M12 3 C8 7 8 17 12 21 C16 17 16 7 12 3Z"/>')
};
export const NAV = [
  ['inicio', 'Inicio', svg('<path d="M3 11 L12 3 L21 11"/><path d="M5 10 V20 H19 V10"/>')],
  ['inventario', 'Mochila', svg('<path d="M5 8 H19 L20 21 H4 Z"/><path d="M9 8 V6 A3 3 0 0 1 15 6 V8"/>')],
  ['tienda', 'Tienda', svg('<path d="M4 9 L6 4 H18 L20 9"/><path d="M4 9 C4 11 8 11 8 9 C8 11 12 11 12 9 C12 11 16 11 16 9 C16 11 20 11 20 9"/><path d="M5 11 V20 H19 V11"/><path d="M10 20 V15 H14 V20"/>')],
  ['hogar', 'Mundo', ICONOS.leaf],
  ['ciudad', 'Ciudad', svg('<path d="M4 21 V9 L10 6 V21"/><path d="M10 21 V4 L20 8 V21"/><path d="M3 21 H21"/><path d="M13 10 H17 M13 14 H17"/>')],
  ['rankings', 'Ranking', svg('<path d="M8 21 H16 M12 17 V21"/><path d="M7 4 H17 V10 A5 5 0 0 1 7 10 Z"/><path d="M7 6 H4 V8 A3 3 0 0 0 7 11 M17 6 H20 V8 A3 3 0 0 1 17 11"/>')]
];
export const TABS = [
  'inicio',
  'ficha',
  'inventario',
  'tienda',
  'hogar',
  'ciudad',
  'rankings',
  'gacha',
  'raid',
  'mazmorra',
  'sala',
  'clan',
  'encargos',
  'encuentro',
  'alquimia',
  'mundial',
  'jugador'
];
export const PADRE = { gacha: 'inicio', raid: 'inicio', mazmorra: 'inicio', sala: 'inicio', clan: 'inicio', encargos: 'inicio', encuentro: 'inicio', alquimia: 'inicio', mundial: 'inicio', jugador: 'rankings' };
export const ACC = {
  minar:  { l: 'Mina de cristal', n: 'Minar',  ya: 'minar',  p: 'Minaste',  v: 'Minando…',  ic: 'mine', fx: 'golpe',   tot: 2700, z: '#c3bbdc', g: 'r' },
  talar:  { l: 'Bosque profundo', n: 'Talar',  ya: 'talar',  p: 'Talaste',  v: 'Talando…',  ic: 'chop', fx: 'tala', tot: 1800, z: '#8fc4ad', g: 'r' },
  pescar: { l: 'Lago lunar', n: 'Pescar', ya: 'pescar', p: 'Pescaste', v: 'Pescando…', ic: 'fish', fx: 'pesca',  tot: 2700, z: '#8fb4d6', g: 'r' },
  cazar:  { l: 'Coto de caza', n: 'Cazar',  ya: 'cazar',  p: 'Cazaste',  v: 'Cazando…',  ic: 'hunt', fx: 'apunta', tot: 3600, z: '#e8946a', g: 'r' },
  crimen: { n: 'Arriesgar', t: 'Crimen', d: 'Arriesga tu cartera por un gran botín.', ya: 'arriesgarte', p: '', v: 'Planeando el golpe…', ic: 'mask', fx: 'sigilo', tot: 7200, z: '#c9626f', g: 'c' },
  daily:  { n: 'Reclamar', t: 'Recompensa diaria', d: 'Tu premio del día y tu racha.', ya: 'reclamar tu recompensa diaria', p: '', v: 'Abriendo regalo…', ic: 'gift', fx: 'flotar', tot: 86400, z: '#e8a58e', g: 'c' },
  work:   { n: 'Trabajar', t: 'Trabajo', d: 'Monedas según tu empleo.', ya: 'trabajar', p: '', v: 'Trabajando…', ic: 'brief', fx: 'trabajo', tot: 3600, z: '#c3bbdc', g: 'c' }
};
export const RAREZA = {
  comun: ['Común', '#a9b0c4'], poco: ['Poco común', '#8fc4ad'], rara: ['Rara', '#8fb4d6'],
  epica: ['Épica', '#b69be0'], legendaria: ['Legendaria', '#e0b96a']
};
export const ARTE = {
  minar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="am" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2850"/><stop offset="1" stop-color="#141019"/></linearGradient></defs><rect width="160" height="88" fill="url(#am)"/><path d="M0 88 V54 L26 32 L46 48 L76 18 L106 50 L130 34 L160 58 V88Z" fill="#1b1442"/><circle cx="34" cy="64" r="18" fill="#e8946a" opacity=".2"/><rect x="33" y="60" width="2.4" height="14" fill="#6b4a2a"/><circle cx="34.2" cy="58" r="3" fill="#ffd28a"/><path d="M92 88 L99 58 L107 88Z" fill="#c3bbdc"/><path d="M106 88 L115 46 L124 88Z" fill="#cfe6fb"/><path d="M82 88 L87 68 L93 88Z" fill="#6a9fd0"/><path d="M126 88 L131 70 L137 88Z" fill="#6fa6d8"/></svg>',
  talar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="at" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a4a46"/><stop offset="1" stop-color="#101a1a"/></linearGradient></defs><rect width="160" height="88" fill="url(#at)"/><circle cx="128" cy="24" r="10" fill="#e6f7ee" opacity=".85"/><g fill="#0f3330"><path d="M14 88 L30 40 L46 88Z"/><path d="M22 66 L30 46 L38 66Z" fill="#14403b"/><path d="M60 88 L80 28 L100 88Z"/><path d="M96 88 L112 46 L128 88Z"/><path d="M126 88 L142 52 L158 88Z"/></g><g fill="#154a44"><path d="M66 70 L80 34 L94 70Z"/><path d="M102 74 L112 52 L122 74Z"/></g><rect y="70" width="160" height="18" fill="#8fc4ad" opacity=".08"/></svg>',
  pescar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3f66"/><stop offset="1" stop-color="#141a2c"/></linearGradient></defs><rect width="160" height="88" fill="url(#ap)"/><circle cx="120" cy="22" r="9" fill="#e8f3ff" opacity=".85"/><path d="M0 50 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V88 H0Z" fill="#23304f"/><path d="M0 66 q10 5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V88 H0Z" fill="#1a2340"/><path d="M54 52 q14 -34 36 0" fill="none" stroke="#8fb4d6" stroke-width="1" stroke-dasharray="2 3" opacity=".6"/><path d="M82 28 q6 -5 12 0 q-6 5 -12 0Z M94 28 L99 24 L99 32Z" fill="#cfe8ff"/><ellipse cx="30" cy="76" rx="9" ry="2.6" fill="#2f8a6a" opacity=".7"/><path d="M142 88 V58 M148 88 V62 M136 88 V64" stroke="#2f6a58" stroke-width="2"/></svg>',
  cazar: '<svg viewBox="0 0 160 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#352a4a"/><stop offset=".7" stop-color="#c95a5a"/><stop offset="1" stop-color="#e8946a"/></linearGradient></defs><rect width="160" height="88" fill="url(#ac)"/><circle cx="104" cy="58" r="20" fill="#ffd8a0" opacity=".9"/><path d="M0 88 V62 C30 50 60 56 90 64 C120 54 140 54 160 62 V88Z" fill="#2a1634"/><path d="M0 88 V74 C40 68 80 76 160 70 V88Z" fill="#0f1a2c"/><g stroke="#0f1a2c" stroke-width="1.5" stroke-linecap="round"><path d="M12 88 L10 76 M18 88 L19 74 M124 88 L122 76 M132 88 L134 74 M142 88 L140 78"/></g><path d="M28 38 L72 24 M28 38 L24 34 M28 38 L24 42" fill="none" stroke="#fff3d6" stroke-width="1.4" stroke-linecap="round"/></svg>'
};
export const IC_STAT = {
  fuerza: svg('<path d="M20 4 L9 15"/><path d="M20 4 L20 9 M20 4 L15 4"/><path d="M7 13 L11 17"/><path d="M9 15 L5 19"/>'),
  vigor: svg('<path d="M12 20 C5 14 3 11 3 8 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 21 8 C21 11 19 14 12 20Z"/>'),
  suerte: svg('<path d="M12 3 L14.5 9.5 L21 12 L14.5 14.5 L12 21 L9.5 14.5 L3 12 L9.5 9.5Z"/>')
};
export const escena = u => {
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

export const ICONO_EXTRA = {
  sala: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20 C3 15.5 6 14 9 14 C12 14 15 15.5 15 20"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14 C19.5 14 21 15.5 21 19"/>'),
  encargos: svg('<path d="M3 8 L12 3 L21 8 V17 L12 22 L3 17 Z"/><path d="M3 8 L12 13 L21 8"/><path d="M12 13 V22"/>'),
  perfil: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21"/>')
};
