import React from 'react';
import { fmt } from '../lib/format.js';
import { Countdown, Accion, BotonListo, Titulo, Vacio } from './ui.jsx';
import Cabeza from './Cabeza.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="en-cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b2147" />
        <stop offset=".7" stopColor="#6a4a6e" />
        <stop offset="1" stopColor="#e5b4a0" />
      </linearGradient>
    </defs>
    <rect width="400" height="110" fill="url(#en-cielo)" />
    <circle cx="290" cy="62" r="20" fill="#f0d39a" opacity=".85" />
    <path d="M0 110 V84 C60 70 120 78 200 90 C280 78 340 72 400 82 V110Z" fill="#1d1730" />
    <path d="M168 110 C176 96 192 88 200 76 C208 88 224 96 232 110Z" fill="#15101f" />
    <path d="M168 110 C150 100 120 96 80 92 L80 96 C120 100 150 106 168 110Z" fill="#15101f" />
    <path d="M232 110 C250 100 282 96 330 92 L330 96 C284 100 252 106 232 110Z" fill="#15101f" />
    <g className="en-letrero">
      <rect x="198" y="30" width="4" height="48" fill="#3a2c4a" />
      <path d="M202 36 H236 L246 43 L236 50 H202Z" fill="#e5b4a0" />
      <path d="M198 54 H166 L156 61 L166 68 H198Z" fill="#d7b5ff" />
    </g>
  </svg>
);

const RIESGO = { bajo: 'Seguro', medio: 'Arriesgado', alto: 'Muy arriesgado' };

function Escenario({ a, base }) {
  return (
    <>
      <div className="bloque vidrio en-historia">
        <div className="fila">
          <span className="en-zona">{a.emoji} {a.zona}</span>
          <span className="en-pierde">Se pierde en <Countdown fin={base + a.expiraMs} /></span>
        </div>
        <h2>{a.titulo}</h2>
        <p>{a.texto}</p>
      </div>
      <Titulo>¿Qué haces?</Titulo>
      {a.opciones.map(o => (
        <div className={'bloque vidrio en-opcion riesgo-' + o.riesgo} key={o.id}>
          <div className="fila">
            <strong>{o.emoji} {o.etiqueta}</strong>
            <span className={'etiq' + (o.riesgo === 'bajo' ? '' : ' nar')}>{RIESGO[o.riesgo] || o.riesgo}</span>
          </div>
          <div className="en-prob">
            <div className="barra"><div style={{ width: o.prob + '%' }} /></div>
            <span><b>{o.prob}%</b> de éxito · depende de tu {o.stat}</span>
          </div>
          <div className="btns uno">
            <Accion ruta="/api/encuentro/elegir" cuerpo={{ opcion: o.id }}>Elegir</Accion>
          </div>
        </div>
      ))}
    </>
  );
}

function Camino({ d, base }) {
  return (
    <div className="bloque vidrio">
      <strong>El camino está tranquilo</strong>
      <p className="mut peq">
        {d.listo
          ? 'Sal a explorar: algo se cruzará en tu camino y tendrás que decidir.'
          : 'Aún no hay nada nuevo en el camino. Vuelve en un rato.'}
      </p>
      <div className="btns uno">
        <BotonListo ruta="/api/encuentro/iniciar" txt="Salir a explorar" fin={base + d.esperaS * 1000} />
      </div>
    </div>
  );
}

export default function Encuentro({ d, base }) {
  return (
    <div className="lg en">
      <Cabeza
        titulo="Encuentros"
        sub="Decisiones en el camino: acierta y cobra monedas, XP y materiales."
        arte={ARTE}
        cifras={[['Monedas', fmt(d.cartera)], ['Aciertos', fmt(d.aciertos)], ['Racha', fmt(d.seguidos)]]}
      />
      {d.activo ? <Escenario a={d.activo} base={base} /> : <Camino d={d} base={base} />}
      {d.total === 0 && !d.activo && <Vacio>Todavía no has vivido ningún encuentro.</Vacio>}
      <dl className="en-hist">
        <div><dt>Encuentros</dt><dd>{fmt(d.total)}</dd></div>
        <div><dt>Aciertos</dt><dd>{d.total ? Math.round(d.aciertos / d.total * 100) + '%' : '—'}</dd></div>
        <div><dt>Mejor racha</dt><dd>{fmt(d.mejor)}</dd></div>
        <div><dt>Recompensa</dt><dd>x{d.escala}</dd></div>
      </dl>
    </div>
  );
}
