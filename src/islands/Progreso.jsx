import React, { useState } from 'react';
import { Cab, Seg, Accion, Vacio } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { fmt } from '../lib/format.js';
import { perfilIr } from '../bridge/acciones.js';

const OPCIONES = [['misiones', 'Misiones'], ['logros', 'Logros'], ['maestria', 'Maestría'], ['titulos', 'Títulos']];
const num = v => fmt(Number(v || 0));
const pct = (v, max) => max > 0 ? Math.max(0, Math.min(100, Number(v || 0) / max * 100)) : 0;

function Barra({ valor, max }) {
  return <div className="barra" role="progressbar" aria-valuemin={0} aria-valuemax={Number(max || 0)} aria-valuenow={Number(valor || 0)}><div style={{ width: `${pct(valor, max)}%` }} /></div>;
}
function FilaLogro({ x }) {
  return <div className="fil" key={x.clave || x.nombre}>
    <span className="pt">{x.emoji || '🏆'}</span>
    <div className="nom"><strong className="largo">{x.tiene ? '✅' : '🔒'} {x.nombre}</strong><span className="mut peq">{x.desc}{x.tiene ? '' : ` · ${num(x.prog)}/${num(x.meta)}`}</span></div>
    {!x.tiene && <span className="val">🎁 {num(x.monedas)}</span>}
  </div>;
}
function Misiones({ d }) {
  const m = d?.misiones;
  if (!m) return <Vacio>No hay datos de misiones disponibles.</Vacio>;
  return <>
    <p className="mut peq" style={{ marginTop: 12 }}>Las misiones se renuevan según el temporizador del servidor. Tiempo restante: {num(m.reiniciaS)} s.</p>
    {(m.diarias || []).map((x, i) => <div className="bloque vidrio" key={x.id || x.clave || `${x.texto}-${i}`}>
      <div className="fila"><strong>{x.hecha ? '✅' : '⬜'} {x.emoji || '🎯'} {x.texto}</strong></div>
      <Barra valor={x.prog} max={x.meta}/>
      <div className="fila peq"><span>{num(x.prog)} / {num(x.meta)}</span><span className="mut">🎁 {num(x.monedas)} monedas · {num(x.xp)} XP</span></div>
    </div>)}
    {m.bono && <div className="aviso-i">🌟 Bono por completar todas: {num(m.bono.monedas)} monedas y {num(m.bono.xp)} XP · {m.bono.hecho ? 'ya reclamado' : 'pendiente'}</div>}
  </>;
}
function Logros({ d }) {
  const l = d?.logros;
  if (!l) return <Vacio>No hay datos de logros disponibles.</Vacio>;
  return <><p className="mut peq" style={{ marginTop: 12 }}>{num(l.tengo)} de {num(l.total)} logros conseguidos.</p>{(l.lista || []).length ? l.lista.map((x, i) => <FilaLogro key={x.clave || x.nombre || i} x={x}/>) : <Vacio>Aún no hay logros para mostrar.</Vacio>}</>;
}
function Maestria({ d }) {
  const m = d?.maestria;
  if (!m) return <Vacio>No hay datos de maestría disponibles.</Vacio>;
  return <><p className="mut peq" style={{ marginTop: 12 }}>Cada actividad suma usos y otorga bonos permanentes.</p>{(m.actividades || []).map((a, i) => <div className="bloque vidrio" key={a.clave || a.nombre || i}>
    <div className="fila"><strong>{a.emoji || '✨'} {a.nombre}</strong><span className="mut peq">Nv {num(a.nivel)}/{num(m.max)}</span></div>
    {a.sig ? <><Barra valor={Number(a.usos || 0) - Number(a.previo || 0)} max={Number(a.sig || 0) - Number(a.previo || 0)}/><div className="fila peq"><span>{num(a.usos)} / {num(a.sig)} usos</span></div></> : <p className="peq">Nivel máximo</p>}
    <p className="mut peq">+{num(a.botin)}% monedas · +{num(a.evento)}% eventos</p>
  </div>)}</>;
}
function Titulos({ d }) {
  const t = d?.titulos;
  if (!t) return <Vacio>No hay datos de títulos disponibles.</Vacio>;
  return <>
    <div className="cartera">Cartera <b>{num(t.cartera)}</b> monedas</div>
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

export default function Progreso({ d = {}, base }) {
  const [seccion, setSeccion] = useState('misiones');
  const me = useMe();
  const xpPct = me?.xpSig ? pct(me.xp, me.xpSig) : 0;
  const alias = me?.alias || 'Aventurero';
  const nivel = me?.nivel ?? '—';
  const panel = { misiones: <Misiones d={d}/>, logros: <Logros d={d}/>, maestria: <Maestria d={d}/>, titulos: <Titulos d={d}/> }[seccion];
  return <>
    <section className="perfil"><div className="hero-in"><div className="quien"><h1>{alias}</h1><span className="peq mut">Nivel {nivel}</span><div className="xpb"><div style={{ width: `${xpPct}%` }}/></div><span className="peq mut">{num(me?.xp)} / {num(me?.xpSig)} XP</span></div></div></section>
    <div className="seg" role="group" aria-label="Sección del perfil">
      {[['ficha','Ficha'],['heroe','Héroe'],['progreso','Progreso'],['historial','Recuerdos'],...(me?.owner ? [['owner','Owner']] : [])].map(([key, label]) => <button key={key} type="button" onClick={() => perfilIr(key)} aria-pressed={key === 'progreso'}>{label}</button>)}
    </div>
    <Cab titulo="Progreso" sub="Misiones, logros, maestría y títulos." stats={[["Nivel", nivel], ["XP", num(me?.xp)], ["Monedas", num(me?.monedas)]]}/>
    <Seg aria="Sección de progreso" opciones={OPCIONES} valor={seccion} onCambio={setSeccion}/>
    {panel}
  </>;
}
