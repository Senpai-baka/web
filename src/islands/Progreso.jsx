import React, { useState } from 'react';
import { Seg, Accion, Vacio } from './ui.jsx';
import { fmt, dur } from '../lib/format.js';

const OPCIONES = [['misiones', 'Misiones'], ['logros', 'Logros'], ['maestria', 'Maestría'], ['titulos', 'Títulos']];
const num = v => fmt(Number(v || 0));
const pct = (v, max) => max > 0 ? Math.max(0, Math.min(100, Number(v || 0) / max * 100)) : 0;

function Barra({ valor, max }) {
  return <div className="barra" role="progressbar" aria-valuemin={0} aria-valuemax={Number(max || 0)} aria-valuenow={Number(valor || 0)}><div style={{ width: `${pct(valor, max)}%` }} /></div>;
}
function FilaLogro({ x }) {
  return <div className="fil" key={x.clave || x.nombre}>
    <span className="pt">{x.emoji || '🏆'}</span>
    <div className="nom"><strong className="largo">{x.nombre}{x.tiene ? <span className="etiq">Conseguido</span> : null}</strong><span className="mut peq">{x.desc}{x.tiene ? '' : ` · ${num(x.prog)}/${num(x.meta)}`}</span></div>
    {!x.tiene && <span className="val">{num(x.monedas)}</span>}
  </div>;
}
function Misiones({ d }) {
  const m = d?.misiones;
  if (!m) return <Vacio>No hay datos de misiones disponibles.</Vacio>;
  return <>
    <p className="pg-nota">Las misiones se renuevan en <b>{dur(m.reiniciaS)}</b>.</p>
    {(m.diarias || []).map((x, i) => <div className={`bloque vidrio pg-mision${x.hecha ? ' hecha' : ''}`} key={x.id || x.clave || `${x.texto}-${i}`}>
      <div className="pg-cab"><span className="pg-em" aria-hidden="true">{x.emoji || '🎯'}</span><strong>{x.texto}</strong>{x.hecha ? <span className="pg-ok">Hecha</span> : null}</div>
      <Barra valor={x.prog} max={x.meta}/>
      <div className="pg-pie"><span><b>{num(x.prog)}</b> de {num(x.meta)}</span><span className="pg-pago"><i>{num(x.monedas)} monedas</i><i>{num(x.xp)} XP</i></span></div>
    </div>)}
    {m.bono && <div className={`pg-bono${m.bono.hecho ? ' hecho' : ''}`}><strong>Bono por completar todas</strong><span>{num(m.bono.monedas)} monedas y {num(m.bono.xp)} XP</span><em>{m.bono.hecho ? 'Reclamado' : 'Pendiente'}</em></div>}
  </>;
}
function Logros({ d }) {
  const l = d?.logros;
  if (!l) return <Vacio>No hay datos de logros disponibles.</Vacio>;
  return <><p className="pg-nota"><b>{num(l.tengo)}</b> de {num(l.total)} logros conseguidos.</p>{(l.lista || []).length ? l.lista.map((x, i) => <FilaLogro key={x.clave || x.nombre || i} x={x}/>) : <Vacio>Aún no hay logros para mostrar.</Vacio>}</>;
}
function Maestria({ d }) {
  const m = d?.maestria;
  if (!m) return <Vacio>No hay datos de maestría disponibles.</Vacio>;
  return <><p className="pg-nota">Cada actividad suma usos y otorga bonos permanentes.</p>{(m.actividades || []).map((a, i) => <div className="bloque vidrio" key={a.clave || a.nombre || i}>
    <div className="fila"><strong>{a.emoji || '✨'} {a.nombre}</strong><span className="mut peq">Nv {num(a.nivel)}/{num(m.max)}</span></div>
    {a.sig ? <><Barra valor={Number(a.usos || 0) - Number(a.previo || 0)} max={Number(a.sig || 0) - Number(a.previo || 0)}/><div className="fila peq"><span>{num(a.usos)} / {num(a.sig)} usos</span></div></> : <p className="peq">Nivel máximo</p>}
    <p className="mut peq">+{num(a.botin)}% monedas · +{num(a.evento)}% eventos</p>
  </div>)}</>;
}
function Titulos({ d }) {
  const t = d?.titulos;
  if (!t) return <Vacio>No hay datos de títulos disponibles.</Vacio>;
  return <>
    <p className="pg-nota">Tienes <b>{num(t.cartera)}</b> monedas.</p>
    {(t.lista || []).length ? t.lista.map((x, i) => {
      const motivo = !x.tiene && !x.puede ? (x.prestigio ? `Necesitas prestigio ${x.prestigio}.` : 'Te faltan monedas.') : '';
      return <div className="fil" key={x.clave || x.nombre || i}>
        <div className="nom"><strong className="largo">{x.nombre}{x.puesto ? <span className="etiq">Equipado</span> : null}</strong></div>
        {x.tiene
          ? <Accion ruta="/api/titulos/equipar" cuerpo={x.puesto ? {} : { clave: x.clave }} confirmar={undefined}>{x.puesto ? 'Quitar' : 'Equipar'}</Accion>
          : <Accion ruta="/api/titulos/comprar" cuerpo={{ clave: x.clave }} motivo={motivo}>{x.prestigio ? `Prestigio ${x.prestigio}` : num(x.precio)}</Accion>}
      </div>;
    }) : <Vacio>No hay títulos disponibles.</Vacio>}
  </>;
}

export default function Progreso({ d = {} }) {
  const [seccion, setSeccion] = useState('misiones');
  const panel = { misiones: <Misiones d={d}/>, logros: <Logros d={d}/>, maestria: <Maestria d={d}/>, titulos: <Titulos d={d}/> }[seccion];
  return <>
    <Seg aria="Sección de progreso" opciones={OPCIONES} valor={seccion} onCambio={setSeccion}/>
    {panel}
  </>;
}
