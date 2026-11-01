import React, { useEffect, useState } from 'react';
import { useEstado } from '../core/estado.js';
import { verLoginOwner } from '../core/sesion.js';

const faltan = hasta => {
  const s = Math.max(0, Math.ceil((hasta - Date.now()) / 1000));
  if (s < 60) return 'menos de un minuto';
  const m = Math.ceil(s / 60);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return r ? h + ' h ' + r + ' min' : h + ' h';
};

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
      <div className="mant-escena" aria-hidden="true">
        <svg viewBox="0 0 200 160" width="220" height="176"><g transform="translate(78 78)"><g className="mant-g mant-g1"><circle r="30"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(0.0)"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(45.0)"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(90.0)"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(135.0)"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(180.0)"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(225.0)"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(270.0)"/><rect x="-5.4" y="-39.6" width="10.8" height="15.4" rx="2" transform="rotate(315.0)"/><circle r="12" className="mant-hueco"/></g></g><g transform="translate(138 108)"><g className="mant-g mant-g2"><circle r="19"/><rect x="-3.4" y="-25.1" width="6.8" height="9.7" rx="2" transform="rotate(0.0)"/><rect x="-3.4" y="-25.1" width="6.8" height="9.7" rx="2" transform="rotate(60.0)"/><rect x="-3.4" y="-25.1" width="6.8" height="9.7" rx="2" transform="rotate(120.0)"/><rect x="-3.4" y="-25.1" width="6.8" height="9.7" rx="2" transform="rotate(180.0)"/><rect x="-3.4" y="-25.1" width="6.8" height="9.7" rx="2" transform="rotate(240.0)"/><rect x="-3.4" y="-25.1" width="6.8" height="9.7" rx="2" transform="rotate(300.0)"/><circle r="8" className="mant-hueco"/></g></g><circle className="mant-chispa mant-c1" cx="160" cy="36" r="3" /><circle className="mant-chispa mant-c2" cx="30" cy="130" r="2.5" /><circle className="mant-chispa mant-c3" cx="172" cy="140" r="2" /></svg>
      </div>
      <h1>Mantenimiento<span className="mant-puntos" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></h1>
      <p className="mant-msg">{mant.mensaje || 'Estamos afinando algunos detalles. Volvemos en un momento.'}</p>
      {mant.hasta ? <p className="mut peq">Volvemos en aproximadamente {faltan(mant.hasta)}.</p> : null}
      <div className="mant-barra" aria-hidden="true"><span /></div>
      <p className="mut peq">Esta pantalla se actualiza sola cuando todo esté listo.</p>
      <button className="mant-owner" type="button" onClick={verLoginOwner}>Acceso owner</button>
    </section>
  );
}
