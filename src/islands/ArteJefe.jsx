// Dibujo del jefe de Raid: port de PAL_JEFE + arteJefe() de public/js/app.js.
import React from 'react';

const PAL_JEFE = {
  hielo: ['#10243a', '#1d4a6b', '#7fc4ee', '#162c44', '#cfe8fb', '#bff3ff'],
  hidra: ['#10281d', '#1f5a3d', '#6fd19a', '#123324', '#9fe3bd', '#f6e27a'],
  kraken: ['#1c1236', '#4a2a6e', '#a98af0', '#231640', '#c9b6ff', '#ffd1ec'],
  otro: ['#1b1426', '#6a2a45', '#c9626f', '#1a1022', '#e8946a', '#ff8f7a']
};

const tiene = (nombre, ...palabras) => {
  const n = String(nombre).toLowerCase();
  return palabras.some(p => n.includes(p));
};

// Colores de la tarjeta (--c1/--c2). Igual que el legacy: aquí "tit" NO cuenta como hielo.
export function coloresJefe(nombre) {
  const k = tiene(nombre, 'hidra') ? 'hidra' : tiene(nombre, 'kraken') ? 'kraken' : tiene(nombre, 'hielo') ? 'hielo' : 'otro';
  return PAL_JEFE[k].slice(0, 2);
}

export default function ArteJefe({ nombre }) {
  // Igual que el legacy: el dibujo sí trata "tit" (titán) como hielo.
  const k = tiene(nombre, 'hidra') ? 'hidra' : tiene(nombre, 'kraken') ? 'kraken' : tiene(nombre, 'hielo', 'tit') ? 'hielo' : 'otro';
  const [, , aura, cu, ac, oj] = PAL_JEFE[k];

  const figuras = {
    hielo: (
      <>
        <path d="M130 190V120C130 86 160 68 200 68S270 86 270 120V190Z" fill={cu} />
        <path d="M146 92L128 40L172 76Z M254 92L272 40L228 76Z M192 70L200 28L208 70Z" fill={ac} />
        <path d="M168 120H232L224 150H176Z" fill="#0b1020" />
        <g className="rd-ojo"><path d="M168 104L188 110L168 114Z M232 104L212 110L232 114Z" fill={oj} /></g>
      </>
    ),
    hidra: (
      <>
        <ellipse cx="200" cy="176" rx="62" ry="30" fill={cu} />
        <g fill="none" stroke={cu} strokeWidth="16" strokeLinecap="round">
          <path d="M180 160C150 150 130 120 122 84" />
          <path d="M200 160V76" />
          <path d="M220 160C250 150 270 120 278 84" />
        </g>
        <g fill={cu}>
          <ellipse cx="122" cy="78" rx="19" ry="13" />
          <ellipse cx="200" cy="66" rx="20" ry="14" />
          <ellipse cx="278" cy="78" rx="19" ry="13" />
        </g>
        <g className="rd-ojo" fill={oj}>
          <circle cx="116" cy="74" r="3.5" /><circle cx="194" cy="62" r="3.5" />
          <circle cx="206" cy="62" r="3.5" /><circle cx="272" cy="74" r="3.5" />
        </g>
      </>
    ),
    kraken: (
      <>
        <path d="M140 130C140 66 170 46 200 46S260 66 260 130Z" fill={cu} />
        <g fill="none" stroke={cu} strokeWidth="13" strokeLinecap="round">
          <path d="M150 128C128 158 160 168 140 190" />
          <path d="M178 130C168 164 194 170 184 190" />
          <path d="M222 130C232 164 206 170 216 190" />
          <path d="M250 128C272 158 240 168 260 190" />
        </g>
        <g className="rd-ojo" fill={oj}><circle cx="178" cy="96" r="8" /><circle cx="222" cy="96" r="8" /></g>
      </>
    ),
    otro: (
      <>
        <path d="M138 190V128C138 92 162 74 200 74S262 92 262 128V190Z" fill={cu} />
        <path d="M150 88L128 38L170 76Z M250 88L272 38L230 76Z" fill={ac} />
        <g className="rd-ojo"><path d="M170 104L188 110L170 114Z M230 104L212 110L230 114Z" fill={oj} /></g>
      </>
    )
  };

  return (
    <svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <circle cx="200" cy="104" r="92" fill={aura} opacity=".28" />
      {figuras[k]}
      <rect y="182" width="400" height="8" fill="#0b0810" opacity=".7" />
    </svg>
  );
}
