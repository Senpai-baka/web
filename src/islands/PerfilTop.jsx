import React from 'react';
import { useMe } from '../bridge/store.js';
import { fmt } from '../lib/format.js';
import { perfilIr, cerrarSesion } from '../bridge/acciones.js';

const num = v => fmt(Number(v || 0));

export default function PerfilTop({ activo }) {
  const me = useMe();
  const pct = me?.xpSig ? Math.min(100, Number(me.xp || 0) / me.xpSig * 100) : 0;
  const ops = [['ficha', 'Ficha'], ['heroe', 'Héroe'], ['progreso', 'Progreso'], ['historial', 'Recuerdos'], ...(me?.owner ? [['owner', 'Owner']] : [])];
  return (
    <>
      <section className="perfil">
        <div className="hero-in">
          <div className="quien">
            <h1>{me?.alias || 'Aventurero'}</h1>
            <span className="peq mut">Nivel {me?.nivel ?? '—'}</span>
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
