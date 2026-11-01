import React, { Suspense, useLayoutEffect } from 'react';
import { cache, errores, cargar, usePestana, sesionActual, hayPendiente, restaurarPos } from '../state/panel.js';
import { Seguro, Vacio } from './ui.jsx';

const Esqueleto = () => (
  <div className="vacio esq" role="status" aria-busy="true" aria-label="Cargando">
    <div className="esq-cab" /><div className="esq-fila"><i /><i /><i /></div>
    <div className="esq-b" /><div className="esq-b" /><div className="esq-b corto" />
  </div>
);

function ajustar(t, hayDatos) {
  const el = document.getElementById('t-' + t);
  if (!el) return;
  el.querySelectorAll('.seg').forEach(g => {
    const a = g.querySelector('[aria-pressed="true"]');
    if (a) g.scrollLeft = a.offsetLeft - (g.clientWidth - a.offsetWidth) / 2;
  });
  // Si la pestaña estaba esperando su contenido para volver a su posición, se restaura en cuanto hay datos.
  if (!el.hidden && hayDatos && hayPendiente(t)) restaurarPos(t);
}

function Ajuste({ t }) {
  useLayoutEffect(() => { ajustar(t, true); }, []);
  return null;
}

export default function TabHost({ t, Isla }) {
  usePestana(t);
  const c = cache[t];
  const error = errores[t];

  useLayoutEffect(() => { ajustar(t, !!c); });

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
  return (
    <Suspense fallback={<Esqueleto />}>
      <Seguro key={sesionActual()} reset={c.d}><Isla d={c.d} base={c.t} /></Seguro>
      <Ajuste t={t} />
    </Suspense>
  );
}
