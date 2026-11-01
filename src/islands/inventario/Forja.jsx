import React from 'react';
import { Sec, Vacio, Accion } from '../ui.jsx';
import { fmt } from '../../lib/format.js';
import { ElixiresForja } from '../Elixires.jsx';
import { ItemIcon } from './comun.jsx';

function Receta({ r, tope }) {
  return (
    <div className="bloque vidrio">
      <div className="fila">
        <strong>{r.emoji || '🛠️'} {r.nombre}</strong>
        <span className="mut peq">Tienes {r.stock || 0}/{tope ?? '—'}</span>
      </div>
      <div className="mats" style={{ marginTop: 10 }}>
        {(r.reqs || []).map((x, i) => (
          <div className="mat" key={`${x.clave || x.nombre || i}`}>
            <ItemIcon emoji={x.emoji} />
            <span className="peq">{x.nombre ? `${x.nombre}: ` : ''}{x.tengo}/{x.necesita}</span>
          </div>
        ))}
      </div>
      <div className="btns uno">
        <Accion ruta="/api/forja/fabricar" cuerpo={{ clave: r.clave }} motivo={!r.puede ? 'Te faltan materiales o tu inventario está lleno.' : null}>Fabricar</Accion>
      </div>
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
            <div className="nom">
              <strong>{m.emoji || '📦'} {m.nombre}</strong>
              <span className="mut peq">{fmt(m.precio || 0)} monedas por unidad · tienes {fmt(m.cantidad)}</span>
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
  const objetos = d.objetos || [];
  const listos = objetos.filter(o => o.puede).length;
  const materiales = (d.materiales || []).filter(m => Number(m.cantidad) > 0);
  const recetas = d.recetas || [];
  return (
    <>
      <Sec k="forja-recetas-react" titulo="Recetas" extra={`${recetas.length} disponibles`}>
        {recetas.length
          ? <div className="lista">{recetas.map(r => <Receta key={r.clave} r={r} tope={d.tope} />)}</div>
          : <Vacio>No hay recetas disponibles por ahora.</Vacio>}
      </Sec>
      <Sec k="forja-elixires-react" titulo="Elixires y pociones" extra={`${listos} listo${listos === 1 ? '' : 's'}`}>
        <ElixiresForja lista={objetos} tope={d.topeObjetos || 10} />
      </Sec>
      <Sec k="forja-materiales-react" titulo="Vender materiales" extra={materiales.length ? `${materiales.length} tipos` : ''}>
        <Venta materiales={materiales} valor={Number(d.valorMateriales || 0)} />
      </Sec>
    </>
  );
}
