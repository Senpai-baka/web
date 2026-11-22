import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ciudadSeccion, ciudadIr } from '../bridge/acciones.js';
import { useMe } from '../bridge/store.js';
import { api } from '../lib/api.js';
import { fmt } from '../lib/format.js';
import Banco from './ciudad/Banco.jsx';
import Negocios from './ciudad/Negocios.jsx';
import Mercader from './ciudad/Mercader.jsx';
import Casino from './ciudad/Casino.jsx';
import Dados from './ciudad/Dados.jsx';
import Altar from './ciudad/Altar.jsx';
import Arena from './ciudad/Arena.jsx';
import Jugadores from './ciudad/Jugadores.jsx';

const DISTRITOS = [
  ['banco', 'Banco', <><path d="M3 10 L12 4 L21 10" /><path d="M5 10 V18 M10 10 V18 M14 10 V18 M19 10 V18" /><path d="M3 20 H21" /></>],
  ['negocios', 'Negocios', <><path d="M4 9 L6 4 H18 L20 9" /><path d="M5 9 V20 H19 V9" /><path d="M10 20 V14 H14 V20" /></>],
  ['mercader', 'Mercader', <><path d="M5 8 H19 L20 21 H4 Z" /><path d="M9 8 V6 A3 3 0 0 1 15 6 V8" /></>],
  ['casino', 'Casino', <><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1.1" /><circle cx="15" cy="9" r="1.1" /><circle cx="12" cy="12" r="1.1" /><circle cx="9" cy="15" r="1.1" /><circle cx="15" cy="15" r="1.1" /></>],
  ['dados', 'Dados', <><rect x="3" y="10" width="11" height="11" rx="2.5" /><rect x="10" y="3" width="11" height="11" rx="2.5" /><circle cx="7" cy="14" r="1" /><circle cx="10" cy="17" r="1" /><circle cx="15.5" cy="8.5" r="1" /></>],
  ['altar', 'Altar', <path d="M12 3 L14.5 9.5 L21 12 L14.5 14.5 L12 21 L9.5 14.5 L3 12 L9.5 9.5Z" />],
  ['arena', 'Arena', <><path d="M4 4 L15 15" /><path d="M13 17 L17 13" /><path d="M16 16 L20 20" /><path d="M20 4 L9 15" /><path d="M11 17 L7 13" /><path d="M8 16 L4 20" /></>],
  ['jugadores', 'Jugadores', <><circle cx="9" cy="8" r="3" /><path d="M3 20 C3 15 15 15 15 20" /><circle cx="17" cy="9" r="2.4" /><path d="M16 14 C19 14 21 16 21 19" /></>]
];

const SUBTITULO = {
  banco: 'Guarda tus monedas, haz que crezcan y paga a otros.',
  negocios: 'Compra, mejora y cobra lo que producen.',
  mercader: 'Compra ofertas y vende materiales cuando pasa de visita.',
  casino: 'Prueba tu suerte con lo que puedas perder.',
  dados: 'Rétate a un duelo de dados contra otro jugador.',
  altar: 'Reliquias con bonos permanentes de ingresos.',
  arena: 'Rétate con otros héroes, apuesta si quieres y sube en el ranking.',
  jugadores: 'Busca jugadores, mira su perfil o intenta robarles.'
};

const VISTAS = { banco: Banco, negocios: Negocios, mercader: Mercader, casino: Casino, dados: Dados, altar: Altar, arena: Arena, jugadores: Jugadores };

const EDIFICIOS = [
  [0, 34, 22], [24, 58, 18], [44, 40, 24], [70, 74, 20], [92, 46, 22], [116, 64, 26], [144, 38, 18],
  [164, 84, 24], [190, 52, 20], [212, 70, 26], [240, 44, 18], [260, 78, 22], [284, 54, 24], [310, 66, 20],
  [332, 40, 22], [356, 60, 26], [384, 36, 16]
].map(([x, h, w], i) => {
  const luces = [];
  for (let y = 10; y < h - 6; y += 11) {
    for (let cx = x + 5; cx < x + w - 5; cx += 8) {
      const clave = (i * 7 + Math.round(y) * 3 + cx) % 11;
      if (clave < 4) luces.push([cx, y, clave]);
    }
  }
  return { x, h, w, luces };
});

function Horizonte() {
  return (
    <svg className="cd-sky" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="cd-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1326" />
          <stop offset=".7" stopColor="#4a3254" />
          <stop offset="1" stopColor="#8a5670" />
        </linearGradient>
      </defs>
      <rect width="400" height="100" fill="url(#cd-cielo)" />
      {EDIFICIOS.map(b => (
        <g key={b.x}>
          <rect x={b.x} y={100 - b.h} width={b.w} height={b.h} fill="#120d1b" />
          {b.luces.map(([cx, y, c]) => (
            <rect key={cx + '-' + y} className="cd-luz" style={{ animationDelay: (c * 0.18 + (b.x % 5) * 0.12).toFixed(2) + 's' }} x={cx} y={100 - b.h + y} width="3" height="4" fill="#f0d39a" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function useEsencia(d) {
  const [esencia, setEsencia] = useState(null);
  useEffect(() => {
    let vivo = true;
    api('/api/esencia').then(r => { if (vivo) setEsencia(r); }).catch(() => {});
    return () => { vivo = false; };
  }, [d]);
  return esencia;
}

export default function Ciudad({ d, base }) {
  const me = useMe();
  const esencia = useEsencia(d);
  const sel = VISTAS[ciudadSeccion()] ? ciudadSeccion() : 'banco';
  const Vista = VISTAS[sel];
  const fila = useRef(null);
  useLayoutEffect(() => {
    const el = fila.current;
    const a = el && el.querySelector('[aria-pressed="true"]');
    if (a) el.scrollLeft = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2;
  }, [sel]);
  return (
    <div className="cd">
      <header className="cd-top">
        <Horizonte />
        <div className="cd-tit">
          <div>
            <h1 className="pag">Ciudad</h1>
            <p>{SUBTITULO[sel]}</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {esencia ? (
              <div className="cd-mano" title={`Hoy ${fmt(esencia.hoy)} de ${fmt(esencia.tope)}`}>
                <b>{esencia.emoji} {fmt(esencia.saldo)}</b><span>Esencia</span>
              </div>
            ) : null}
            {me ? <div className="cd-mano"><b>{fmt(me.monedas)}</b><span>En mano</span></div> : null}
          </div>
        </div>
      </header>

      <div className="cd-dist" ref={fila} role="group" aria-label="Sección de la ciudad">
        {DISTRITOS.map(([k, n, ic]) => (
          <button key={k} type="button" aria-pressed={k === sel} onClick={() => ciudadIr(k)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ic}</svg>
            <span>{n}</span>
          </button>
        ))}
      </div>

      <div className="cd-cuerpo" key={sel}>
        <Vista d={d} base={base} />
      </div>
    </div>
  );
}
