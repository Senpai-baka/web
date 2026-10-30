import React from 'react';
import { Vacio, Accion, Countdown, useAhora } from './ui.jsx';
import { cambiarInventario } from '../bridge/acciones.js';
import { fmt } from '../lib/format.js';

export const COLOR_OBJETO = {
  elixir_fuerza: '#e8946a', elixir_suerte: '#8fc4ad', tonico_fortuna: '#e0b96a',
  elixir_furia: '#dd8591', piel_piedra: '#8fb4d6', esencia_cazador: '#b69be0',
  pocion_energia: '#e0b96a', pocion_mayor: '#dd8591', kit_reparacion: '#8fb4d6', piedra_bendicion: '#b69be0',
};
const colorDe = clave => COLOR_OBJETO[clave] || '#c3bbdc';

const GRUPOS = [
  ['potenciadores', 'Potenciadores', 'Efectos temporales que se acumulan entre sí.'],
  ['pociones', 'Pociones', 'Efecto inmediato.'],
  ['equipo', 'Para tu equipo', 'Mantén y mejora tus piezas.'],
];

function Slot({ emoji, cantidad, color, falta }) {
  return (
    <span className={`slot${falta ? ' falta' : ''}`} style={{ '--r': color }} aria-hidden="true">
      <span className="si">{emoji}</span>
      {cantidad !== undefined && <i className="n">{cantidad}</i>}
    </span>
  );
}

const Chip = ({ color, children }) => <span className="chip-e" style={{ '--r': color }}>{children}</span>;

function BarraTiempo({ fin, total, nombre }) {
  const ahora = useAhora();
  const resta = Math.max(0, (fin - ahora) / 1000);
  const pct = total ? Math.min(100, resta / total * 100) : 0;
  return (
    <div className="barra" role="progressbar" aria-label={`Tiempo restante de ${nombre}`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.round(resta)}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EfectosActivos({ lista, base }) {
  if (!lista?.length) return null;
  return (
    <div className="efectos" role="list" aria-label="Efectos activos">
      {lista.map(e => {
        const color = colorDe(e.clave);
        const fin = base + e.restanteS * 1000;
        return (
          <div className="efecto vidrio" role="listitem" key={e.clave} style={{ '--r': color }}>
            <div className="efecto-f">
              <Slot emoji={e.emoji} color={color} />
              <div className="nom">
                <strong>{e.nombre}</strong>
                <Chip color={color}>{e.efecto}</Chip>
              </div>
              <span className="cuenta"><Countdown fin={fin} /></span>
            </div>
            <BarraTiempo fin={fin} total={e.duracionS} nombre={e.nombre} />
          </div>
        );
      })}
    </div>
  );
}

export function Elixires({ lista, tope }) {
  const mios = lista.filter(o => o.cantidad > 0);
  if (!mios.length) {
    return (
      <>
        <Vacio>Aún no tienes elixires ni pociones.<br />Fabrícalos con los materiales que juntas.</Vacio>
        <div className="btns uno"><button type="button" className="mini" onClick={() => cambiarInventario('forja')}>Ir a la Forja</button></div>
      </>
    );
  }
  return (
    <div className="lista">
      {mios.map(o => {
        const color = colorDe(o.clave);
        return (
          <div className="fil elx" key={o.clave}>
            <Slot emoji={o.emoji} cantidad={o.cantidad} color={color} />
            <div className="nom">
              <strong className="largo">{o.nombre}</strong>
              <Chip color={color}>{o.efecto}{o.duracionS ? ` · ${o.duracionS / 3600} h` : ''}</Chip>
              <span className="mut peq">{o.desc}</span>
              {o.activoS > 0 && <span className="peq act">✓ Activo</span>}
            </div>
            {o.uso.pasivo
              ? <button type="button" className="mini" onClick={() => cambiarInventario('equipo')}>Ir a Equipo</button>
              : <Accion ruta="/api/objetos/usar" cuerpo={{ clave: o.clave }} motivo={o.uso.motivo}>Usar</Accion>}
          </div>
        );
      })}
      <p className="mut peq">Máximo {tope} de cada uno. Fabrica más en la Forja.</p>
    </div>
  );
}

function Receta({ o, max }) {
  const color = colorDe(o.clave);
  const faltanMats = o.receta.some(x => x.tengo < x.necesita);
  const motivo = o.puede ? null : o.lleno ? 'Ya tienes el máximo de este objeto.' : faltanMats ? 'Te faltan materiales.' : 'No te alcanzan las monedas.';
  return (
    <div className="bloque vidrio rec" style={{ '--r': color }}>
      <div className="fila">
        <span className="rec-t"><Slot emoji={o.emoji} color={color} /><span className="nom"><strong>{o.nombre}</strong><Chip color={color}>{o.efecto}{o.duracionS ? ` · ${o.duracionS / 3600} h` : ''}</Chip></span></span>
        <span className="mut peq rec-n">Tienes {o.cantidad}/{max}</span>
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>{o.desc}</p>
      <div className="mats" style={{ marginTop: 10 }}>
        {o.receta.map(x => {
          const falta = x.tengo < x.necesita;
          return (
            <div className={`mat ${falta ? 'falta' : 'ok'}`} key={x.clave}>
              <Slot emoji={x.emoji} color={falta ? '#dd8591' : '#8fc4ad'} falta={falta} />
              <span className="peq">{x.nombre}<br /><b>{x.tengo}/{x.necesita}</b></span>
            </div>
          );
        })}
      </div>
      {o.costo > 0 && <p className="peq" style={{ marginTop: 8 }}>💰 Costo: <b>{fmt(o.costo)}</b> monedas por unidad</p>}
      <div className="btnrow">
        <Accion ruta="/api/objetos/fabricar" cuerpo={{ clave: o.clave, n: 1 }} motivo={motivo}>Fabricar</Accion>
        {o.maxFab > 1 && <Accion ruta="/api/objetos/fabricar" cuerpo={{ clave: o.clave, n: o.maxFab }}>Fabricar x{o.maxFab}</Accion>}
      </div>
    </div>
  );
}

export function ElixiresForja({ lista, tope }) {
  if (!lista.length) return <Vacio>No hay objetos disponibles por ahora.</Vacio>;
  return (
    <>
      {GRUPOS.map(([clave, titulo, sub]) => {
        const items = lista.filter(o => o.grupo === clave);
        if (!items.length) return null;
        return (
          <div key={clave}>
            <h3 className="sub-t">{titulo}<span className="mut">{sub}</span></h3>
            <div className="lista">{items.map(o => <Receta key={o.clave} o={o} max={tope} />)}</div>
          </div>
        );
      })}
    </>
  );
}
