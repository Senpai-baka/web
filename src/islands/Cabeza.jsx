import React from 'react';
import { irA } from '../bridge/acciones.js';
import { useMe } from '../bridge/store.js';
import { fmt } from '../lib/format.js';

export default function Cabeza({ titulo, sub, arte, cifras }) {
  const me = useMe();
  const lista = cifras || (me ? [['Monedas', fmt(me.monedas)], ['Nivel', me.nivel]] : []);
  return (
    <>
      <button type="button" className="lg-atras" onClick={() => irA('inicio')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5 L8 12 L15 19" /></svg>
        Inicio
      </button>
      <header className="lg-cab">
        <div className="lg-arte" aria-hidden="true">{arte}</div>
        <div className="lg-tit">
          <h1 className="pag">{titulo}</h1>
          {sub && <p>{sub}</p>}
        </div>
        {lista.length > 0 && (
          <dl className="lg-cifras">
            {lista.map(([n, v]) => <div key={n}><dt>{n}</dt><dd>{String(v)}</dd></div>)}
          </dl>
        )}
      </header>
    </>
  );
}
