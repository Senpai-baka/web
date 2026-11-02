import React from 'react';
import { Sec, Vacio, Accion, Rejilla, Ficha } from '../ui.jsx';
import { NEUTRO, ORO } from '../rareza.js';
import { useElegir } from './comun.jsx';
import { fmt } from '../../lib/format.js';
import { ElixiresForja } from '../Elixires.jsx';

function Recetas({ lista, tope }) {
  const [sel, elegir] = useElegir();
  const celdas = lista.map(r => ({ id: r.clave, emoji: r.emoji || '🛠️', nombre: r.nombre, etiqueta: `${r.stock || 0}/${tope ?? '—'}`, color: r.puede ? ORO : NEUTRO, apagado: !r.puede, receta: r }));
  const activo = celdas.find(x => x.id === sel);
  const r = activo?.receta;
  return (
    <>
      <Rejilla lista={celdas} sel={sel} onSel={elegir} />
      {r && (
        <Ficha color={activo.color} titulo={`${r.emoji || '🛠️'} ${r.nombre}`}>
          <p className="peq">Tienes {r.stock || 0}/{tope ?? '—'}</p>
          <div className="reqs">
            {(r.reqs || []).map((x, i) => (
              <span className={`req${x.tengo < x.necesita ? ' falta' : ''}`} key={`${x.clave || x.nombre || i}`}>{x.emoji} {x.nombre ? `${x.nombre} ` : ''}{x.tengo}/{x.necesita}</span>
            ))}
          </div>
          <div className="btns uno">
            <Accion ruta="/api/forja/fabricar" cuerpo={{ clave: r.clave }} motivo={!r.puede ? 'Te faltan materiales o tu inventario está lleno.' : null}>Fabricar</Accion>
          </div>
        </Ficha>
      )}
    </>
  );
}

function Venta({ materiales, valor }) {
  const [sel, elegir] = useElegir();
  if (!materiales.length) return <Vacio>Aún no tienes materiales. Mina, tala o pesca para conseguirlos.</Vacio>;
  const celdas = materiales.map(m => ({ id: m.clave, emoji: m.emoji || '📦', nombre: m.nombre, cantidad: fmt(m.cantidad), precio: m.precio || 0, color: NEUTRO, mat: m }));
  const activo = celdas.find(x => x.id === sel);
  const m = activo?.mat;
  return (
    <>
      <p className="mut peq">Valor aproximado de todo: {fmt(valor)} monedas.</p>
      <Rejilla lista={celdas} sel={sel} onSel={elegir} />
      {m && (
        <Ficha color={NEUTRO} titulo={`${m.emoji || '📦'} ${m.nombre}`} precio={m.precio || 0}>
          <p className="mut peq">Precio por unidad. Tienes {fmt(m.cantidad)}.</p>
          <div className="btns uno">
            <Accion ruta="/api/forja/vender" cuerpo={{ material: m.clave, cantidad: 'todo' }} confirmar={`¿Vender ${m.cantidad} ${m.nombre} por ${fmt(m.cantidad * (m.precio || 0))} monedas?`}>Vender todo ({fmt(m.cantidad * (m.precio || 0))})</Accion>
          </div>
        </Ficha>
      )}
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
          ? <Recetas lista={recetas} tope={d.tope} />
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
