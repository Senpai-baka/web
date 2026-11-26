import React from 'react';
import { useEstado } from '../core/estado.js';
import { abrir } from '../core/navegar.js';

const MENSAJE = 'La economía está bloqueada porque no hay ningún bot en el grupo donde estás.';
const NUMERO = '524444470387';
const ENLACE = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent('Hola, mi economía en Isla está bloqueada por no haber ningún bot en mi grupo.');

export default function Bloqueo() {
  const texto = useEstado(s => (s.me && s.me.mensajeBloqueo) || '');

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
        <div className="blq-acciones">
          <a className="btn" href={ENLACE} target="_blank" rel="noopener noreferrer">Contactar al dev</a>
          <button className="btn2" type="button" onClick={() => abrir('ficha')}>Ir a mi perfil</button>
        </div>
        <p className="blq-pie mut peq">Dev: +{NUMERO}</p>
      </div>
    </section>
  );
}
