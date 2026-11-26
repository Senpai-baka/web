import React from 'react';
import { useEstado } from '../core/estado.js';
import { abrir } from '../core/navegar.js';

const MENSAJE = 'La economía está bloqueada porque no hay ningún bot en el grupo donde estás.';
const NUMERO = '524444470387';
const ENLACE = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent('Hola, mi economía en Isla está bloqueada por no haber ningún bot en mi grupo.');

const POLVO = [
  { x: '8%', t: '7s', d: '0s', s: 3 },
  { x: '19%', t: '9s', d: '2.4s', s: 2 },
  { x: '31%', t: '8s', d: '4.8s', s: 4 },
  { x: '44%', t: '10s', d: '1.2s', s: 2 },
  { x: '57%', t: '7.5s', d: '3.6s', s: 3 },
  { x: '69%', t: '9.5s', d: '0.6s', s: 4 },
  { x: '81%', t: '8.5s', d: '5.4s', s: 2 },
  { x: '92%', t: '7s', d: '2s', s: 3 }
];

const GEMAS = [
  { x: 60, y: 2, r: 2.6 },
  { x: 116, y: 60, r: 2 },
  { x: 60, y: 118, r: 2.6 },
  { x: 4, y: 60, r: 2 }
];

function Estado({ tono, etiqueta, valor }) {
  return (
    <li className="blq-estado" data-tono={tono}>
      <span className="blq-punto" aria-hidden="true" />
      <span className="blq-estado-txt">
        <small>{etiqueta}</small>
        <strong>{valor}</strong>
      </span>
    </li>
  );
}

export default function Bloqueo() {
  const texto = useEstado(s => (s.me && s.me.mensajeBloqueo) || '');
  const bot = useEstado(s => (s.me ? s.me.bot : undefined));
  const reconectando = bot === false;

  return (
    <section id="v-bloqueo" role="status" aria-live="polite">
      <div className="blq-tarjeta">
        <div className="blq-polvo" aria-hidden="true">
          {POLVO.map((p, i) => (
            <span key={i} style={{ '--x': p.x, '--t': p.t, '--d': p.d, '--s': p.s + 'px' }} />
          ))}
        </div>
        <div className="blq-escena" aria-hidden="true">
          <svg viewBox="0 0 120 120" width="132" height="132">
            <defs>
              <radialGradient id="blq-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#f0d39a" stopOpacity=".34" />
                <stop offset=".55" stopColor="#b79cf0" stopOpacity=".12" />
                <stop offset="1" stopColor="#b79cf0" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="blq-oro" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fbe9c2" />
                <stop offset="1" stopColor="#d9a95a" />
              </linearGradient>
            </defs>
            <circle className="blq-halo" cx="60" cy="60" r="58" fill="url(#blq-halo)" />
            <circle className="blq-aro" cx="60" cy="60" r="48" />
            <g className="blq-orbita">
              <circle className="blq-aro2" cx="60" cy="60" r="56" />
              {GEMAS.map((g, i) => (
                <circle key={i} className="blq-gema" cx={g.x} cy={g.y} r={g.r} />
              ))}
            </g>
            <g className="blq-candado">
              <path className="blq-arco" d="M45 54 V42 A15 15 0 0 1 75 42 V54" />
              <rect className="blq-cuerpo" x="36" y="54" width="48" height="36" rx="8" />
              <path className="blq-brillo" d="M43 61 H62" />
              <circle className="blq-ojo blq-llave" cx="60" cy="68" r="4" />
              <path className="blq-ojo blq-llave" d="M60 70 V80" />
            </g>
          </svg>
        </div>
        <span className="blq-etiqueta">Acceso restringido</span>
        <h1>Economía bloqueada</h1>
        <p className="blq-msg">{(texto || MENSAJE).replace(/^🔒\s*/, '')}</p>
        <ul className="blq-estados" aria-label="Estado de tu cuenta">
          <Estado tono="alerta" etiqueta="Economía" valor="Bloqueada" />
          <Estado tono="ok" etiqueta="Perfil" valor="Disponible" />
          <Estado
            tono={reconectando ? 'espera' : 'alerta'}
            etiqueta="Bot"
            valor={reconectando ? 'Reconectando' : 'No detectado'}
          />
        </ul>
        <p className="blq-nota">Sigues pudiendo entrar a tu perfil.</p>
        <div className="blq-acciones">
          <a className="btn" href={ENLACE} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12z" />
            </svg>
            <span>Contactar al dev</span>
          </a>
          <button className="btn2" type="button" onClick={() => abrir('ficha')}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6" />
            </svg>
            <span>Ir a mi perfil</span>
          </button>
        </div>
        <p className="blq-pie mut peq">Dev: +{NUMERO}</p>
      </div>
    </section>
  );
}
