import React, { useLayoutEffect, useRef } from 'react';
import { Avatar } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { fmt } from '../lib/format.js';
import { perfilIr, cerrarSesion } from '../bridge/acciones.js';

const num = v => fmt(Number(v || 0));

const SUBTITULO = {
  ficha: 'Tu ficha, estadísticas y cuenta.',
  progreso: 'Misiones, logros, maestría y títulos.',
  historial: 'Tus últimos hallazgos.',
  owner: 'Estado del bot y de la web.'
};

export default function PerfilTop({ activo, empleo }) {
  const me = useMe();
  const pct = me?.xpSig ? Math.min(100, Number(me.xp || 0) / me.xpSig * 100) : 0;
  const ops = [['ficha', 'Ficha'], ['progreso', 'Progreso'], ['historial', 'Recuerdos'], ...(me?.owner ? [['owner', 'Owner']] : [])];
  const fila = useRef(null);
  useLayoutEffect(() => {
    const el = fila.current;
    const a = el && el.querySelector('[aria-pressed="true"]');
    if (a) el.scrollLeft = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2;
  }, [activo]);
  return (
    <div className="fc-top">
      <section className="fc-pase">
        <div className="fc-id">
          <div className="fc-anillo">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="fc-pista" cx="50" cy="50" r="45" pathLength="100" />
              <circle className="fc-prog" cx="50" cy="50" r="45" pathLength="100" strokeDasharray={pct.toFixed(1) + ' 100'} />
            </svg>
            <Avatar r={{ yo: true, nombre: me?.alias }} />
          </div>
          <div className="fc-quien">
            <h1 className="pag">{me?.alias || 'Aventurero'}</h1>
            <div className="fc-rol">
              <span>Nivel {me?.nivel ?? '—'}</span>
              {empleo ? <em>{empleo}</em> : null}
            </div>
            <span className="fc-xp"><b>{num(me?.xp)}</b> de {num(me?.xpSig)} XP</span>
          </div>
        </div>
        <dl className="fc-sello">
          <div><dd>{num(me?.monedas)}</dd><dt>Monedas</dt></div>
          <div><dd>{me?.prestigio || 0}</dd><dt>Prestigio</dt></div>
          <div><dd>{me?.nivel ?? '—'}</dd><dt>Nivel</dt></div>
        </dl>
      </section>
      <p className="fc-sub">{SUBTITULO[activo]}</p>
      <div className="fc-tabs" ref={fila} role="group" aria-label="Sección del perfil">
        {ops.map(([k, n]) => <button key={k} type="button" onClick={() => perfilIr(k)} aria-pressed={k === activo}>{n}</button>)}
      </div>
    </div>
  );
}

export const Salir = () => <button type="button" className="link salir" onClick={cerrarSesion}>Cerrar sesión</button>;
