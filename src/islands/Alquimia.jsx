import React, { useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { Cab, Cifras, Countdown, Accion, BotonListo, Barra, Titulo, Vacio, Seg } from './ui.jsx';

const ICONO = (
  <>
    <path d="M9 3 H15" />
    <path d="M10 3 V9 L4.5 19 A2 2 0 0 0 6.3 21 H17.7 A2 2 0 0 0 19.5 19 L14 9 V3" />
    <path d="M7.5 15 H16.5" />
  </>
);

const ACTIVIDADES = [['mina', 'Mina'], ['pesca', 'Pesca'], ['tala', 'Tala'], ['trabajo', 'Trabajo'], ['caza', 'Caza']];

function Nivel({ d }) {
  const base = d.xpBase;
  const meta = d.xpSig;
  return (
    <div className="bloque vidrio">
      <div className="fila">
        <strong>⚗️ Alquimia nivel {d.nivel}{d.max ? ' (máximo)' : ''}</strong>
        <span className="mut peq">{fmt(d.xp)} XP</span>
      </div>
      {!d.max && <Barra valor={d.xp - base} max={meta - base} />}
      {!d.max && <p className="mut peq">{fmt(meta - d.xp)} XP para el nivel {d.nivel + 1}.</p>}
      <p className="mut peq">✨ {d.perfectaPct}% de preparación perfecta · ⏱️ -{d.reduccionPct}% de tiempo</p>
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
      {d.calderos.length
        ? d.calderos.map(c => (
          <div className="bloque vidrio" key={c.idx}>
            <div className="fila">
              <strong>{c.emoji} {c.nombre}</strong>
              {c.lista ? <span className="etiq">✅ Lista</span> : <Countdown fin={base + c.listoS * 1000} />}
            </div>
          </div>
        ))
        : <Vacio>Tus calderos están vacíos.</Vacio>}
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
    <div className="bloque vidrio">
      <div className="fila">
        <strong>{r.emoji} {r.nombre}</strong>
        <span className="mut peq">{r.bloqueada ? `Nivel ${r.nivel}` : dur(r.s)}</span>
      </div>
      <p className="mut peq">{r.desc}</p>
      <p className="peq">
        {[...r.hierbas, ...r.mats].map(x => (
          <span key={x.clave} className={'etiq' + (x.tengo < x.necesita ? ' nar' : '')}>
            {x.emoji} {fmt(x.tengo)}/{fmt(x.necesita)}
          </span>
        ))}
        {r.costo > 0 && <span className="etiq">🪙 {fmt(r.costo)}</span>}
      </p>
      <div className="fila peq">
        <span className="mut">+{fmt(r.xp)} XP de alquimia</span>
      </div>
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
        <strong>{o.emoji} {o.nombre}</strong>
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
    <>
      <Cab
        atras
        titulo="Alquimia"
        sub="Mezcla hierbas y materiales para crear elixires y objetos útiles."
        icono={ICONO}
        stats={[['Monedas', fmt(d.cartera)], ['Nivel', d.nivel], ['Libres', `${d.libres}/${d.slots}`]]}
      />
      <Nivel d={d} />
      <Calderos d={d} base={base} />
      <Titulo>Hierbas</Titulo>
      {hierbas.length
        ? <Cifras lista={hierbas.map(h => [h.nombre, `${h.emoji} ${fmt(h.cantidad)}`])} />
        : <Vacio>Aún no tienes hierbas. Se encuentran al recolectar.</Vacio>}
      <Titulo>Recetas</Titulo>
      {d.recetas.map(r => <Receta key={r.clave} r={r} libres={d.libres} />)}
      <Preparaciones d={d} />
      <Cifras lista={[['Preparaciones', fmt(d.total)]]} />
    </>
  );
}
