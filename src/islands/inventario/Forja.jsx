import React from 'react';
import { Sec, Vacio, Accion, Titulo } from '../ui.jsx';
import { fmt } from '../../lib/format.js';
import { COLOR_OBJETO } from '../Elixires.jsx';
import { ItemIcon } from './comun.jsx';

function Requisitos({ lista, costo }) {
  return (
    <div className="reqs">
      {lista.map((x, i) => {
        const falta = Number(x.tengo) < Number(x.necesita);
        return (
          <span className={`req ${falta ? 'falta' : ''}`} key={x.clave || x.nombre || i} title={x.nombre}>
            <i>{x.emoji || x.nombre}</i>×{x.necesita}
          </span>
        );
      })}
      {costo > 0 && <span className="req">🪙×{fmt(costo)}</span>}
    </div>
  );
}

function Fila({ f }) {
  return (
    <div className="fil forja-f">
      <ItemIcon emoji={f.emoji} color={f.color} />
      <div className="nom">
        <strong>{f.nombre}</strong>
        <span className="mut peq">{f.nota}</span>
        <Requisitos lista={f.reqs} costo={f.costo} />
      </div>
      <div className="forja-b">{f.acciones}</div>
    </div>
  );
}

function Venta({ materiales, valor }) {
  if (!materiales.length) return <Vacio>Aún no tienes materiales. Mina, tala o pesca para conseguirlos.</Vacio>;
  return (
    <>
      <p className="mut peq">Valor aproximado de todo: {fmt(valor)} monedas.</p>
      <div className="lista">
        {materiales.map(m => (
          <div className="fil" key={m.clave}>
            <ItemIcon emoji={m.emoji} cantidad={fmt(m.cantidad)} />
            <div className="nom">
              <strong>{m.nombre}</strong>
              <span className="mut peq">{fmt(m.precio || 0)} monedas por unidad</span>
            </div>
            <Accion ruta="/api/forja/vender" cuerpo={{ material: m.clave, cantidad: 'todo' }} confirmar={`¿Vender ${m.cantidad} ${m.nombre} por ${fmt(m.cantidad * (m.precio || 0))} monedas?`}>Vender todo</Accion>
          </div>
        ))}
      </div>
      <div className="btns uno">
        <Accion ruta="/api/forja/vender" cuerpo={{ material: 'todo' }} confirmar={`¿Vender todos tus materiales por ${fmt(valor)} monedas?`}>Vender todos los materiales</Accion>
      </div>
    </>
  );
}

export default function Forja({ d }) {
  const tope = d.tope;
  const topeObjetos = d.topeObjetos || 10;
  const materiales = (d.materiales || []).filter(m => Number(m.cantidad) > 0);

  const recetas = (d.recetas || []).map(r => ({
    id: `r:${r.clave}`, emoji: r.emoji || '🛠️', color: '#c3bbdc', nombre: r.nombre,
    nota: `Tienes ${r.stock || 0}/${tope ?? '—'}`, reqs: r.reqs || [], costo: 0, puede: !!r.puede,
    acciones: <Accion ruta="/api/forja/fabricar" cuerpo={{ clave: r.clave }} motivo={!r.puede ? 'Te faltan materiales o tu inventario está lleno.' : null}>Fabricar</Accion>
  }));

  const elixires = (d.objetos || []).map(o => {
    const falta = (o.receta || []).some(x => x.tengo < x.necesita);
    const motivo = o.puede ? null : o.lleno ? 'Ya tienes el máximo de este objeto.' : falta ? 'Te faltan materiales.' : 'No te alcanzan las monedas.';
    return {
      id: `o:${o.clave}`, emoji: o.emoji, color: COLOR_OBJETO[o.clave] || '#c3bbdc', nombre: o.nombre,
      nota: `Tienes ${o.cantidad}/${topeObjetos}`, reqs: o.receta || [], costo: o.costo || 0, puede: !!o.puede,
      acciones: (
        <>
          <Accion ruta="/api/objetos/fabricar" cuerpo={{ clave: o.clave, n: 1 }} motivo={motivo}>Fabricar</Accion>
          {o.maxFab > 1 && <Accion ruta="/api/objetos/fabricar" cuerpo={{ clave: o.clave, n: o.maxFab }}>x{o.maxFab}</Accion>}
        </>
      )
    };
  });

  const filas = [...recetas, ...elixires].sort((a, b) => Number(b.puede) - Number(a.puede));
  const listos = filas.filter(f => f.puede).length;

  return (
    <>
      <Titulo extra={<span className="ex">{listos} lista{listos === 1 ? '' : 's'}</span>}>Qué puedes fabricar</Titulo>
      {filas.length
        ? <div className="lista">{filas.map(f => <Fila key={f.id} f={f} />)}</div>
        : <Vacio>No hay nada para fabricar por ahora.</Vacio>}
      <Sec k="forja-materiales-react" titulo="Vender materiales" extra={materiales.length ? `${materiales.length} tipos` : ''}>
        <Venta materiales={materiales} valor={Number(d.valorMateriales || 0)} />
      </Sec>
    </>
  );
}
