import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { Sec, Accion, Barra, Rejilla, Ficha } from '../ui.jsx';
import { NEUTRO, ORO } from '../rareza.js';
import { Seccion, Grupo } from './comun.jsx';

function Resumen({ d }) {
  return (
    <div className="bloque vidrio">
      <div className="ci-fila">
        <div>
          <span className="ci-et">Bono de ingresos</span>
          <span className="ci-num oro">+{d.bono}%</span>
        </div>
        <div className="ci-lado">Colección<b>{d.n} de {d.total}</b></div>
      </div>
      <Barra valor={d.n} max={d.total} />
      <span className="mut peq">
        {d.completo ? 'Completaste la colección. ' : 'La siguiente reliquia cuesta ' + fmt(d.precio) + ' y se paga con la cartera. '}
        Tu cartera: {fmt(d.cartera)}.
      </span>
    </div>
  );
}

function Detalle({ r, d }) {
  if (r.tiene) {
    return (
      <Ficha color={ORO} titulo={`${r.emoji} ${r.nombre}`}>
        <p className="mut peq">En tu colección. Da un bono permanente de ingresos.</p>
      </Ficha>
    );
  }
  return (
    <Ficha color={NEUTRO} titulo={`${r.emoji} ${r.nombre}`} precio={d.precio}>
      <p className="mut peq">Bono permanente de ingresos. Aún no la tienes.</p>
      <div className="btns uno">
        <Accion
          cls="pri"
          ruta="/api/altar/comprar"
          cuerpo={{ clave: r.clave }}
          confirmar={`¿Pagar ${fmt(d.precio)} monedas por ${r.nombre}?`}
          motivo={d.cartera < d.precio && 'No te alcanza con la cartera.'}
        >Comprar</Accion>
      </div>
    </Ficha>
  );
}

export default function Altar({ d }) {
  const [sel, setSel] = useState(null);
  const elegir = id => setSel(x => (x === id ? null : id));
  const lista = d.lista.map(r => ({
    id: r.clave, emoji: r.emoji, nombre: r.nombre, color: r.tiene ? ORO : NEUTRO, apagado: !r.tiene,
    etiqueta: r.tiene ? 'Tuya' : fmt(d.precio), r
  }));
  const activo = lista.find(x => x.id === sel);
  return (
    <Seccion>
      <Resumen d={d} />
      <Grupo titulo="Reliquias" extra="Toca una para ver sus datos">
        <Rejilla lista={lista} sel={sel} onSel={elegir} />
        {activo && <Detalle r={activo.r} d={d} />}
      </Grupo>
      <Sec k="altar-reglas" titulo="Cómo funciona" extra="Precio y bonos" abierta={false}>
        <p className="mut peq">Cada reliquia da un bono permanente de ingresos. El precio sube con cada una que compras y se paga con la cartera.</p>
      </Sec>
    </Seccion>
  );
}
