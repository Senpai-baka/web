import React, { useState } from 'react';
import { useEstado } from '../core/estado.js';
import { reintentarBloqueo } from '../core/sesion.js';
import { abrir } from '../core/navegar.js';
import { BOT_NUMBER } from '../core/datos.js';

const MENSAJE = 'La economía está bloqueada porque no hay ningún bot en el grupo donde estás. Agrega al bot principal o a un sub-bot a tu grupo para desbloquearla.';

export default function Bloqueo() {
  const texto = useEstado(s => (s.me && s.me.mensajeBloqueo) || '');
  const [cargando, setCargando] = useState(false);
  const [sigue, setSigue] = useState(false);

  const reintentar = async () => {
    setCargando(true);
    setSigue(false);
    const libre = await reintentarBloqueo();
    setCargando(false);
    setSigue(!libre);
  };

  return (
    <section id="v-bloqueo" role="status" aria-live="polite">
      <div className="blq-tarjeta">
        <div className="blq-escena" aria-hidden="true">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle className="blq-aro" cx="60" cy="60" r="48" />
            <rect className="blq-cuerpo" x="36" y="54" width="48" height="36" rx="8" />
            <path className="blq-arco" d="M45 54 V42 A15 15 0 0 1 75 42 V54" />
            <circle className="blq-ojo" cx="60" cy="68" r="4" />
            <path className="blq-ojo" d="M60 70 V80" />
          </svg>
        </div>
        <h1>Economía bloqueada</h1>
        <p className="blq-msg">{(texto || MENSAJE).replace(/^🔒\s*/, '')}</p>
        <p className="blq-nota">Sigues pudiendo entrar a tu perfil.</p>
        {sigue ? <p className="blq-sigue">Todavía no encuentro ningún bot en tus grupos.</p> : null}
        <div className="blq-acciones">
          <button className="btn" type="button" disabled={cargando} onClick={reintentar}>
            {cargando ? 'Comprobando…' : 'Ya lo agregué, comprobar'}
          </button>
          <button className="btn2" type="button" onClick={() => abrir('ficha')}>Ir a mi perfil</button>
        </div>
        {BOT_NUMBER ? <p className="blq-pie mut peq">Bot principal: +{BOT_NUMBER}</p> : null}
      </div>
    </section>
  );
}
