import React, { useEffect, useState } from 'react';
import { useEstado } from '../core/estado.js';

const faltan = hasta => {
  const s = Math.max(0, Math.ceil((hasta - Date.now()) / 1000));
  if (s < 60) return 'menos de un minuto';
  const m = Math.ceil(s / 60);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return r ? h + ' h ' + r + ' min' : h + ' h';
};

function Engranaje({ id, x, y, r, dientes, clase }) {
  const ancho = r * 0.36;
  const alto = r * 0.51;
  return (
    <g transform={`translate(${x} ${y})`}>
      <mask id={id} maskUnits="userSpaceOnUse" x={-r * 2} y={-r * 2} width={r * 4} height={r * 4}>
        <rect x={-r * 2} y={-r * 2} width={r * 4} height={r * 4} fill="#fff" />
        <circle r={r * 0.4} fill="#000" />
      </mask>
      <g className={'mant-g ' + clase} mask={`url(#${id})`}>
        <circle r={r} />
        {Array.from({ length: dientes }, (_, i) => (
          <rect key={i} x={-ancho / 2} y={-r * 1.32} width={ancho} height={alto} rx="2" transform={`rotate(${(i * 360) / dientes})`} />
        ))}
      </g>
    </g>
  );
}

export default function Mantenimiento() {
  const mant = useEstado(s => s.mant) || {};
  const [, tic] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tic(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const previo = document.title;
    document.title = 'Isla · Mantenimiento';
    return () => { document.title = previo; };
  }, []);

  return (
    <section id="v-mant" role="status" aria-live="polite">
      <div className="mant-tarjeta">
        <div className="mant-escena" aria-hidden="true">
          <svg viewBox="0 0 200 160" width="220" height="176">
            <Engranaje id="mant-m1" x={78} y={78} r={30} dientes={8} clase="mant-g1" />
            <Engranaje id="mant-m2" x={138} y={108} r={19} dientes={6} clase="mant-g2" />
            <circle className="mant-chispa mant-c1" cx="160" cy="36" r="3" />
            <circle className="mant-chispa mant-c2" cx="30" cy="130" r="2.5" />
            <circle className="mant-chispa mant-c3" cx="172" cy="140" r="2" />
          </svg>
        </div>
        <h1>Mantenimiento<span className="mant-puntos" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></h1>
        <p className="mant-msg">{mant.mensaje || 'Estamos afinando algunos detalles. Volvemos en un momento.'}</p>
        {mant.hasta ? <p className="mant-hasta">Volvemos en aproximadamente {faltan(mant.hasta)}.</p> : null}
        <div className="mant-barra" aria-hidden="true"><span /></div>
        <p className="mant-pie mut peq">Esta pantalla se actualiza sola cuando todo esté listo.</p>
      </div>
    </section>
  );
}
