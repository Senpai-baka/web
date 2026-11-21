import React, { useLayoutEffect, useRef } from 'react';
import { useMe } from '../bridge/store.js';
import { fmt } from '../lib/format.js';
import { perfilIr, cerrarSesion } from '../bridge/acciones.js';
import { Pase } from './fichaUi.jsx';

const num = v => fmt(Number(v || 0));

const SUBTITULO = {
  ficha: 'Tu ficha, estadísticas y cuenta.',
  progreso: 'Misiones, logros, maestría y títulos.',
  historial: 'Tus últimos hallazgos.',
  owner: 'Estado del bot y de la web.'
};

export default function PerfilTop({ activo, empleo }) {
  const me = useMe();
  const ops = [['ficha', 'Ficha'], ['progreso', 'Progreso'], ['historial', 'Recuerdos'], ...(me?.owner ? [['owner', 'Owner']] : [])];
  const fila = useRef(null);
  useLayoutEffect(() => {
    const el = fila.current;
    const a = el && el.querySelector('[aria-pressed="true"]');
    if (a) el.scrollLeft = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2;
  }, [activo]);
  return (
    <div className="fc-top">
      <Pase
        alias={me?.alias}
        nivel={me?.nivel}
        xp={me?.xp}
        xpSig={me?.xpSig}
        rol={empleo}
        avatar={{ yo: true, nombre: me?.alias }}
        sello={[[num(me?.monedas), 'Monedas'], [me?.prestigio || 0, 'Prestigio'], [me?.nivel ?? '—', 'Nivel']]}
      />
      <p className="fc-sub">{SUBTITULO[activo]}</p>
      <div className="fc-tabs" ref={fila} role="group" aria-label="Sección del perfil">
        {ops.map(([k, n]) => <button key={k} type="button" onClick={() => perfilIr(k)} aria-pressed={k === activo}>{n}</button>)}
      </div>
    </div>
  );
}

export const Salir = () => <button type="button" className="fc-salir" onClick={cerrarSesion}>Cerrar sesión</button>;
