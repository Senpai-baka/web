import React from 'react';
import { fmt } from '../lib/format.js';
import { Countdown, Accion, Barra, Titulo, Vacio } from './ui.jsx';
import Cabeza from './Cabeza.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="eg-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a2016" />
        <stop offset="1" stopColor="#3a2b1d" />
      </linearGradient>
    </defs>
    <rect width="400" height="110" fill="url(#eg-fondo)" />
    <g fill="#4a3724">
      <rect x="0" y="0" width="400" height="6" />
      <rect x="0" y="40" width="400" height="3" opacity=".5" />
      <rect x="0" y="76" width="400" height="3" opacity=".5" />
    </g>
    <g className="eg-nota">
      <rect x="58" y="22" width="64" height="72" rx="3" fill="#f0d39a" />
      <rect x="70" y="38" width="40" height="4" fill="#7a5a2c" opacity=".6" />
      <rect x="70" y="48" width="32" height="4" fill="#7a5a2c" opacity=".6" />
      <rect x="70" y="58" width="36" height="4" fill="#7a5a2c" opacity=".6" />
      <circle cx="90" cy="26" r="4" fill="#c9626f" />
    </g>
    <g className="eg-nota n2">
      <rect x="168" y="14" width="64" height="80" rx="3" fill="#e5b4a0" />
      <rect x="180" y="34" width="40" height="4" fill="#6b3d2a" opacity=".6" />
      <rect x="180" y="44" width="28" height="4" fill="#6b3d2a" opacity=".6" />
      <path d="M182 66 l8 8 l16 -16" fill="none" stroke="#2f6a52" strokeWidth="4" strokeLinecap="round" />
      <circle cx="200" cy="18" r="4" fill="#91d6bd" />
    </g>
    <g className="eg-nota n3">
      <rect x="278" y="24" width="64" height="70" rx="3" fill="#d7b5ff" />
      <rect x="290" y="40" width="40" height="4" fill="#4a3070" opacity=".6" />
      <rect x="290" y="50" width="34" height="4" fill="#4a3070" opacity=".6" />
      <circle cx="310" cy="28" r="4" fill="#f0d39a" />
    </g>
  </svg>
);

const motivoDe = x => {
  if (x.hecho) return 'Ya entregaste este encargo hoy.';
  if (!x.puede) return `Te faltan ${fmt(x.cantidad - x.tengo)} ${x.nombre}.`;
  return '';
};

function Encargo({ x }) {
  return (
    <div className={'bloque vidrio eg-encargo' + (x.hecho ? ' hecho' : '') + (x.urgente && !x.hecho ? ' urgente' : '')}>
      <div className="eg-cab">
        <span className="eg-em" aria-hidden="true">{x.emoji}</span>
        <div className="eg-pide">
          <strong>{x.nombre}</strong>
          <span>Entrega {fmt(x.cantidad)}</span>
        </div>
        {x.urgente && !x.hecho && <span className="etiq nar">Urgente</span>}
        {x.hecho && <span className="etiq">Entregado</span>}
      </div>
      <Barra valor={Math.min(x.tengo, x.cantidad)} max={x.cantidad} />
      <div className="fila peq">
        <span>Tienes <b>{fmt(Math.min(x.tengo, x.cantidad))}</b> de {fmt(x.cantidad)}</span>
        <span className="eg-pago"><span>🪙 {fmt(x.monedas)}</span><span>✨ {fmt(x.xp)} XP</span></span>
      </div>
      <div className="btns uno">
        <Accion ruta="/api/encargos/entregar" cuerpo={{ cual: x.idx }} motivo={motivoDe(x)}>
          {x.hecho ? 'Entregado' : 'Entregar'}
        </Accion>
      </div>
    </div>
  );
}

function Resumen({ d, base }) {
  const bono = d.bonoRacha ? ` (+${d.bonoRacha}% de monedas)` : '';
  const rachaTxt = d.racha
    ? `Llevas ${fmt(d.racha)} día${d.racha === 1 ? '' : 's'} de racha${bono}.`
    : 'Completa los encargos de hoy para empezar una racha.';
  return (
    <div className="bloque vidrio eg-resumen">
      <div className="fila">
        <strong>Se renuevan en</strong>
        <Countdown fin={base + d.renuevaS * 1000} />
      </div>
      <p className="eg-racha">{rachaTxt}</p>
      <p className="mut peq">
        {d.completoHoy
          ? `Hoy completaste todos y recibiste ${d.cofre.emoji} ${d.cofre.nombre}.`
          : `Al completar los ${d.total} recibes ${d.cofre.emoji} ${d.cofre.nombre}.`}
      </p>
    </div>
  );
}

export default function Encargos({ d, base }) {
  const pendientes = d.lista.filter(x => !x.hecho);
  const listos = pendientes.filter(x => x.puede);
  const motivoTodo = !pendientes.length
    ? 'Ya entregaste todos los encargos de hoy.'
    : !listos.length ? 'No tienes materiales para ningún encargo.' : '';
  return (
    <div className="lg eg">
      <Cabeza
        titulo="Encargos"
        sub="Entrega materiales al pueblo y cobra monedas, XP y un cofre."
        arte={ARTE}
        cifras={[['Monedas', fmt(d.cartera)], ['Racha', fmt(d.racha)], ['Hoy', `${d.hechos}/${d.total}`]]}
      />
      <Resumen d={d} base={base} />
      <Titulo>Encargos de hoy</Titulo>
      {d.lista.length ? d.lista.map(x => <Encargo key={x.idx} x={x} />) : <Vacio>Hoy no hay encargos disponibles.</Vacio>}
      {d.lista.length > 1 && (
        <div className="btns uno">
          <Accion ruta="/api/encargos/entregar" cuerpo={{ cual: 'todo' }} motivo={motivoTodo}>
            Entregar todo{listos.length > 1 ? ` (${listos.length})` : ''}
          </Accion>
        </div>
      )}
      <dl className="eg-pie">
        <div><dt>Días completos</dt><dd>{fmt(d.completos)}</dd></div>
        <div><dt>Bono máximo a los</dt><dd>{d.rachaMax} días</dd></div>
      </dl>
    </div>
  );
}
