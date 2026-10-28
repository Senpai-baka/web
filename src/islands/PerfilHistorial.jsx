import React from 'react';
import { fmt, hace } from '../lib/format.js';
import { Vacio } from './ui.jsx';

const RAREZA = { comun: '#a9b0c4', poco: '#8fc4ad', rara: '#8fb4d6', epica: '#b69be0', legendaria: '#e0b96a' };

const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const ICONOS = {
  mine: <Svg><g transform="rotate(40 12 12)"><path d="M12 21 V9" /><path d="M3 9 C6 3 18 3 21 9" /></g></Svg>,
  chop: <Svg><g transform="rotate(-25 12 12)"><path d="M12 21 V4" /><path d="M12 4.5 H15 C18 5 20 8 20.5 12 C17.5 10.5 14.5 10.5 12 11 Z" /></g></Svg>,
  fish: <Svg><path d="M3 21 L17 5" /><path d="M17 5 Q22 9 20 14" /><circle className="boya" cx="20" cy="15.6" r="1.6" /><circle cx="7.2" cy="16.4" r="1.4" /><path d="M13 21 Q15 19.5 17 21 T21 21" /></Svg>,
  hunt: <Svg><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><path d="M12 1 V5 M12 19 V23 M1 12 H5 M19 12 H23" /></Svg>,
  gift: <Svg><path d="M4 11 H20 V21 H4 Z" /><path d="M3 7 H21 V11 H3 Z" /><path d="M12 7 V21" /><path d="M12 7 C12 3 8 3 8 5 C8 7 12 7 12 7 C12 7 16 7 16 5 C16 3 12 3 12 7" /></Svg>,
  brief: <Svg><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M9 8 V6.5 A1.5 1.5 0 0 1 10.5 5 H13.5 A1.5 1.5 0 0 1 15 6.5 V8" /><path d="M3 13 H21" /><rect x="10.5" y="11.5" width="3" height="3" rx=".6" /></Svg>,
  mask: <Svg><path d="M4 8 C4 5 8 4 12 4 C16 4 20 5 20 8 V12 C20 17 16 20 12 20 C8 20 4 17 4 12 Z" /><path d="M8 11 L10.5 12 M16 11 L13.5 12" /><path d="M9 16 C10.5 17 13.5 17 15 16" /></Svg>,
};
const ICONO = { minar: 'mine', talar: 'chop', pescar: 'fish', cazar: 'hunt', crimen: 'mask', daily: 'gift', work: 'brief' };
const VERBO = { minar: 'Minaste en', talar: 'Talaste en', pescar: 'Pescaste en', cazar: 'Cazaste en', crimen: 'Crimen ·', daily: 'Reclamaste ·', work: 'Trabajaste como' };

export default function PerfilHistorial({ d }) {
  if (!d.items.length) return <Vacio>Aún no hay hallazgos. Cada vez que mines, talles, pesques o cazes aparecerá aquí.</Vacio>;
  return (
    <>
      <p className="mut peq" style={{ marginTop: 14 }}>Tus últimos 20 hallazgos</p>
      <div className="lista">
        {d.items.map((i, n) => {
          const g = i.guardian;
          const extra = [i.evento, g ? (g.gana ? 'Derrotaste a ' + g.nombre : g.nombre + ' te hizo retroceder') : ''].filter(Boolean).join(' · ');
          const monedas = i.monedas || 0;
          return (
            <div className="fil" key={n}>
              <span className="pt">{ICONOS[ICONO[i.accion]] || ICONOS.mine}</span>
              <div className="nom">
                <strong><i className="pto" style={{ '--c': RAREZA[i.rareza] || RAREZA.comun }} />{i.titulo}</strong>
                <span className="mut peq">{VERBO[i.accion] || 'Actuaste en'} {i.zona} · {hace(i.hace)} · {i.origen === 'web' ? 'web' : 'WhatsApp'}</span>
                {extra && <span className="peq" style={{ color: 'var(--lav)' }}>{extra}</span>}
              </div>
              <span className="val">{monedas < 0 ? '−' : '+'}{fmt(Math.abs(monedas))}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
