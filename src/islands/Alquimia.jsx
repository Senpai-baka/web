import React, { useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { Countdown, Accion, Barra, Titulo, Vacio, Seg } from './ui.jsx';
import { Emo } from './Icono.jsx';
import Cabeza from './Cabeza.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="aq-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#16221f" />
        <stop offset="1" stopColor="#23353a" />
      </linearGradient>
      <radialGradient id="aq-luz" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#91d6bd" stopOpacity=".5" />
        <stop offset="1" stopColor="#91d6bd" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="110" fill="url(#aq-fondo)" />
    <circle cx="200" cy="70" r="70" fill="url(#aq-luz)" />
    <rect x="0" y="92" width="400" height="18" fill="#0f1a18" />
    <rect x="0" y="92" width="400" height="2" fill="#91d6bd" opacity=".25" />
    <g className="aq-frasco">
      <path d="M62 92 V70 L52 52 H80 L70 70 V92Z" fill="#91d6bd" fillOpacity=".28" stroke="#91d6bd" strokeOpacity=".6" strokeWidth="1.5" />
      <rect x="56" y="46" width="20" height="6" rx="2" fill="#91d6bd" fillOpacity=".5" />
    </g>
    <g className="aq-frasco">
      <path d="M170 92 C150 92 148 66 160 56 V40 H188 V56 C200 66 198 92 178 92Z" fill="#d7b5ff" fillOpacity=".3" stroke="#d7b5ff" strokeOpacity=".65" strokeWidth="1.5" />
      <rect x="158" y="34" width="32" height="6" rx="2" fill="#d7b5ff" fillOpacity=".5" />
      <circle className="aq-burbuja b1" cx="170" cy="76" r="3" fill="#f4efff" />
      <circle className="aq-burbuja b2" cx="178" cy="80" r="2" fill="#f4efff" />
      <circle className="aq-burbuja b3" cx="164" cy="82" r="2.5" fill="#f4efff" />
    </g>
    <g className="aq-frasco">
      <path d="M262 92 V60 H250 V44 H288 V60 H276 V92Z" fill="#f0d39a" fillOpacity=".26" stroke="#f0d39a" strokeOpacity=".6" strokeWidth="1.5" />
      <rect x="248" y="38" width="42" height="6" rx="2" fill="#f0d39a" fillOpacity=".45" />
    </g>
    <g className="aq-frasco">
      <path d="M338 92 C318 92 316 70 326 62 L330 50 H350 L354 62 C364 70 362 92 342 92Z" fill="#e5b4a0" fillOpacity=".26" stroke="#e5b4a0" strokeOpacity=".6" strokeWidth="1.5" />
      <rect x="328" y="44" width="24" height="6" rx="2" fill="#e5b4a0" fillOpacity=".45" />
      <circle className="aq-burbuja b2" cx="338" cy="80" r="2.5" fill="#f4efff" />
    </g>
  </svg>
);

const ACTIVIDADES = [['mina', 'Mina'], ['pesca', 'Pesca'], ['tala', 'Tala'], ['trabajo', 'Trabajo'], ['caza', 'Caza']];

function Nivel({ d }) {
  const base = d.xpBase;
  const meta = d.xpSig;
  return (
    <div className="bloque vidrio aq-nivel">
      <div className="aq-nv">
        <b>{d.nivel}</b>
        <small>{d.max ? 'Máximo' : 'Nivel'}</small>
      </div>
      <div className="aq-nv-d">
        <div className="fila"><strong>Experiencia</strong><span className="mut peq">{fmt(d.xp)} XP</span></div>
        {!d.max && <Barra valor={d.xp - base} max={meta - base} />}
        {!d.max && <p className="mut peq">{fmt(meta - d.xp)} XP para el nivel {d.nivel + 1}</p>}
        <p className="aq-chips">
          <span>✨ {d.perfectaPct}% de preparación perfecta</span>
          <span>⏱️ -{d.reduccionPct}% de tiempo</span>
        </p>
      </div>
    </div>
  );
}

function Calderos({ d, base }) {
  const listos = d.calderos.filter(c => c.lista).length;
  const proximo = d.calderos.filter(c => !c.lista).map(c => c.listoS);
  const motivo = !d.calderos.length
    ? 'No tienes nada en los calderos.'
    : !listos ? `Aún no hay nada listo. Falta ${dur(Math.min(...proximo))}.` : '';
  return (
    <>
      <Titulo extra={<span className="mut peq">{d.slots - d.libres}/{d.slots} en uso</span>}>Calderos</Titulo>
      <div className="aq-calderos">
        {d.calderos.map(c => (
          <div className={'aq-caldero' + (c.lista ? ' lista' : '')} key={c.idx}>
            <span className="aq-em"><Emo o={c} /></span>
            <strong>{c.nombre}</strong>
            {c.lista ? <span className="etiq">Lista</span> : <Countdown fin={base + c.listoS * 1000} />}
          </div>
        ))}
        {Array.from({ length: d.libres }, (_, i) => (
          <div className="aq-caldero libre" key={'libre' + i}>
            <span className="aq-em">⚗️</span>
            <strong>Caldero libre</strong>
          </div>
        ))}
      </div>
      <div className="btns uno">
        <Accion ruta="/api/alquimia/recoger" motivo={motivo}>
          Recoger{listos > 1 ? ` (${listos})` : ''}
        </Accion>
      </div>
    </>
  );
}

function Receta({ r, libres }) {
  const falta = [
    ...r.hierbas.filter(h => h.tengo < h.necesita).map(h => `${h.necesita - h.tengo} ${h.nombre.toLowerCase()}`),
    ...r.mats.filter(m => m.tengo < m.necesita).map(m => `${m.necesita - m.tengo} ${m.nombre.toLowerCase()}`)
  ];
  const motivo = r.bloqueada
    ? `Necesitas nivel ${r.nivel} de alquimia.`
    : !libres ? 'Tus calderos están ocupados.'
      : falta.length ? `Te faltan ${falta.join(', ')}.` : '';
  return (
    <div className={'bloque vidrio aq-receta' + (r.bloqueada ? ' bloq' : '')}>
      <div className="fila">
        <strong><Emo o={r} /> {r.nombre}</strong>
        <span className="aq-tiempo">{r.bloqueada ? `Nivel ${r.nivel}` : dur(r.s)}</span>
      </div>
      <p className="mut peq">{r.desc}</p>
      <div className="reqs">
        {[...r.hierbas, ...r.mats].map(x => (
          <span key={x.clave} className={'req' + (x.tengo < x.necesita ? ' falta' : '')}>
            <Emo o={x} /> {fmt(x.tengo)}/{fmt(x.necesita)}
          </span>
        ))}
        {r.costo > 0 && <span className="req">🪙 {fmt(r.costo)}</span>}
      </div>
      <p className="mut peq">+{fmt(r.xp)} XP de alquimia</p>
      <div className="btns uno">
        <Accion ruta="/api/alquimia/preparar" cuerpo={{ receta: r.clave }} motivo={motivo}>Preparar</Accion>
      </div>
    </div>
  );
}

function Objeto({ o, actividad }) {
  const reloj = o.clave === 'reloj_arena';
  const motivo = !o.cantidad ? 'No tienes este objeto. Prepáralo en un caldero.' : '';
  const cuerpo = reloj ? { clave: o.clave, actividad } : { clave: o.clave };
  return (
    <div className="bloque vidrio">
      <div className="fila">
        <strong><Emo o={o} /> {o.nombre}</strong>
        <span className="mut peq">{o.cantidad}/{o.max}</span>
      </div>
      <p className="mut peq">{o.desc}</p>
      <div className="btns uno">
        <Accion ruta="/api/alquimia/usar" cuerpo={cuerpo} motivo={motivo}>Usar</Accion>
      </div>
    </div>
  );
}

function Preparaciones({ d }) {
  const [actividad, setActividad] = useState('mina');
  const hay = d.objetos.some(o => o.clave === 'reloj_arena');
  return (
    <>
      <Titulo>Objetos de alquimia</Titulo>
      {hay && (
        <>
          <p className="mut peq">El reloj de arena reinicia la espera de la actividad que elijas.</p>
          <Seg aria="Actividad del reloj de arena" opciones={ACTIVIDADES} valor={actividad} onCambio={setActividad} />
        </>
      )}
      {d.objetos.map(o => <Objeto key={o.clave} o={o} actividad={actividad} />)}
    </>
  );
}

export default function Alquimia({ d, base }) {
  const hierbas = d.hierbas.filter(h => h.cantidad > 0);
  return (
    <div className="aq">
      <Cabeza
        titulo="Alquimia"
        sub="Mezcla hierbas y materiales para crear elixires y objetos útiles."
        arte={ARTE}
        cifras={[['Monedas', fmt(d.cartera)], ['Nivel', d.nivel], ['Calderos libres', `${d.libres}/${d.slots}`]]}
      />
      <Nivel d={d} />
      <Calderos d={d} base={base} />
      <Titulo>Hierbas</Titulo>
      {hierbas.length
        ? <div className="aq-hierbas">{hierbas.map(h => <span key={h.clave || h.nombre}><Emo o={h} /> <b>{fmt(h.cantidad)}</b> {h.nombre}</span>)}</div>
        : <Vacio>Aún no tienes hierbas. Se encuentran al recolectar.</Vacio>}
      <Titulo>Recetas</Titulo>
      {d.recetas.map(r => <Receta key={r.clave} r={r} libres={d.libres} />)}
      <Preparaciones d={d} />
      <p className="aq-total">{fmt(d.total)} preparaciones en total</p>
    </div>
  );
}
