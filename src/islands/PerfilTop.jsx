import React from 'react';
import { Cab } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { fmt } from '../lib/format.js';
import { perfilIr, cerrarSesion } from '../bridge/acciones.js';

const num = v => fmt(Number(v || 0));

const SUBTITULO = {
  ficha: 'Tu ficha, estadísticas y cuenta.',
  heroe: 'Clase, atributos, talentos y expediciones.',
  progreso: 'Misiones, logros, maestría y títulos.',
  historial: 'Tus últimos hallazgos.',
  owner: 'Estado del bot y de la web.'
};

// Cabecera común de todo el Perfil: siempre en el mismo orden (título, resumen, pestañas).
export default function PerfilTop({ activo, empleo }) {
  const me = useMe();
  const pct = me?.xpSig ? Math.min(100, Number(me.xp || 0) / me.xpSig * 100) : 0;
  const ops = [['ficha', 'Ficha'], ['heroe', 'Héroe'], ['progreso', 'Progreso'], ['historial', 'Recuerdos'], ...(me?.owner ? [['owner', 'Owner']] : [])];
  return (
    <>
      <Cab titulo="Perfil" sub={SUBTITULO[activo]} stats={[['Monedas', num(me?.monedas)], ['Prestigio', me?.prestigio || 0]]} />
      <section className="perfil">
        <div className="hero-in">
          <div className="quien">
            <h1>{me?.alias || 'Aventurero'}</h1>
            <span className="peq mut">Nivel {me?.nivel ?? '—'}{empleo ? ` · ${empleo}` : ''}</span>
            <div className="xpb"><div style={{ width: pct + '%' }} /></div>
            <span className="peq mut">{num(me?.xp)} / {num(me?.xpSig)} XP</span>
          </div>
        </div>
      </section>
      <div className="seg" role="group" aria-label="Sección del perfil">
        {ops.map(([k, n]) => <button key={k} type="button" onClick={() => perfilIr(k)} aria-pressed={k === activo}>{n}</button>)}
      </div>
    </>
  );
}

export const Salir = () => <button type="button" className="link salir" onClick={cerrarSesion}>Cerrar sesión</button>;
