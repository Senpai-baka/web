// Anfitrión de una pestaña: lee sus datos del store y pinta la isla (o el esqueleto / el error con "Reintentar").
// Sustituye al antiguo IslaBridge.render(): ya no hace falta que app.js empuje los datos a cada isla.
import React, { useLayoutEffect } from 'react';
import { cache, errores, cargar, usePestana, sesionActual, scrollGuardado } from '../state/panel.js';
import { Seguro, Vacio } from './ui.jsx';

const Esqueleto = () => (
  <div className="vacio esq" role="status" aria-busy="true" aria-label="Cargando">
    <div className="esq-cab" /><div className="esq-fila"><i /><i /><i /></div>
    <div className="esq-b" /><div className="esq-b" /><div className="esq-b corto" />
  </div>
);

export default function TabHost({ t, Isla }) {
  usePestana(t);
  const c = cache[t];
  const error = errores[t];

  // Tras cada repintado: centra el botón activo de los selectores y devuelve el scroll (como hacía dibujar() en app.js).
  useLayoutEffect(() => {
    const el = document.getElementById('t-' + t);
    if (!el) return;
    el.querySelectorAll('.seg').forEach(g => {
      const a = g.querySelector('[aria-pressed="true"]');
      if (a) g.scrollLeft = a.offsetLeft - (g.clientWidth - a.offsetWidth) / 2;
    });
    if (!el.hidden && c) window.scrollTo(0, scrollGuardado());
  });

  if (!c) {
    return error
      ? (
        <>
          <Vacio>{error}</Vacio>
          <button className="btn2" style={{ margin: '0 auto', display: 'block' }} type="button" onClick={() => cargar(t, true)}>Reintentar</button>
        </>
      )
      : <Esqueleto />;
  }
  // key = sesión: al cerrar sesión las islas se montan de cero (se pierden filtros y textos escritos de la cuenta anterior).
  return <Seguro key={sesionActual()} reset={c.d}><Isla d={c.d} base={c.t} /></Seguro>;
}
