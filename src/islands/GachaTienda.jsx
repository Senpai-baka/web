import React, { useState } from 'react';
import { fmt } from '../lib/format.js';
import { tiendaCartas, filtrarTiendaCartas, gachaPagina } from '../bridge/acciones.js';
import { Vacio, Titulo, Campo, Accion } from './ui.jsx';
import { Carta, Pager } from './gachaUi.jsx';

const ORDENES = {
  nuevo: 'Recientes', antiguo: 'Antiguas', barato: 'Más baratas', caro: 'Más caras',
  valor: 'Mayor valor', nombre: 'Nombre', popular: 'Populares'
};

const Chip = ({ activo, onClick, children }) => (
  <button type="button" className="fch" aria-pressed={!!activo} onClick={onClick}>{children}</button>
);

function Filtros({ d }) {
  const f = tiendaCartas();
  const [q, setQ] = useState(f.q || '');
  const buscar = () => filtrarTiendaCartas({ ctQ: q.trim() });
  const orden = f.orden || 'nuevo';
  return (
    <div className="bloque vidrio">
      <div className="campo">
        <Campo texto corto valor={q} onCambio={setQ} ph="Buscar personaje o serie" onEnter={buscar} />
        <button type="button" className="mini" onClick={buscar}>Buscar</button>
      </div>
      <div className="filtros" role="group" aria-label="Rareza">
        <Chip activo={!f.rareza} onClick={() => filtrarTiendaCartas({ ctRareza: '' })}>Todas</Chip>
        {d.rarezas.map(r => (
          <Chip key={r.clave} activo={f.rareza === r.clave} onClick={() => filtrarTiendaCartas({ ctRareza: r.clave })}>{r.emoji} {r.nombre}</Chip>
        ))}
      </div>
      <div className="filtros" role="group" aria-label="Orden">
        {d.ordenes.map(k => (
          <Chip key={k} activo={orden === k} onClick={() => filtrarTiendaCartas({ ctOrden: k })}>{ORDENES[k] || k}</Chip>
        ))}
        <Chip activo={f.mias === '1'} onClick={() => filtrarTiendaCartas({ ctMias: f.mias === '1' ? '' : '1' })}>Solo mías</Chip>
      </div>
    </div>
  );
}

function Oferta({ c, d }) {
  return (
    <div className="bloque vidrio">
      <Carta c={c} />
      <div className="fila" style={{ marginTop: 8 }}>
        <span className="mut peq">{c.mia ? 'Es tuya' : c.vendedor ? 'Vende ' + c.vendedor : 'En venta'}</span>
        <b className="it-p">{fmt(c.precio)}</b>
      </div>
      <div className="btns uno">
        {c.mia
          ? <Accion ruta="/api/cartas/retirar" cuerpo={{ id: c.id }}>Retirar de la tienda</Accion>
          : (
            <Accion
              cls="pri"
              ruta="/api/cartas/comprar"
              cuerpo={{ id: c.id }}
              motivo={d.cartera < c.precio && 'No te alcanza con la cartera.'}
              confirmar={`¿Comprar a ${c.nombre} por ${fmt(c.precio)}?`}
            >Comprar · {fmt(c.precio)}</Accion>
          )}
      </div>
    </div>
  );
}

export default function GachaTienda({ d }) {
  const f = tiendaCartas();
  const filtrado = !!(f.q || f.rareza || f.mias);
  return (
    <>
      <p className="mut peq">
        Compra cartas que otros jugadores ponen en venta. La tienda se queda con {d.comision}% de cada venta. Para vender las tuyas, elige una en Colección.
      </p>
      <Filtros d={d} />
      <Titulo extra={<span className="mut peq">{fmt(d.total)} {d.total === 1 ? 'carta' : 'cartas'}</span>}>En venta</Titulo>
      {d.cartas.length
        ? (
          <>
            {d.cartas.map(c => <Oferta key={c.id} c={c} d={d} />)}
            {d.paginas > 1 && <Pager pagina={d.pagina} paginas={d.paginas} onDir={gachaPagina} />}
          </>
        )
        : <Vacio>{filtrado ? 'No hay cartas con esos filtros.' : 'Todavía no hay cartas en venta.'}</Vacio>}
      {d.enVenta > 0 && (
        <div className="btns uno" style={{ marginTop: 12 }}>
          <Accion
            ruta="/api/cartas/retirar_todas"
            confirmar={`¿Retirar tus ${d.enVenta} cartas de la tienda?`}
          >Retirar todas las mías ({d.enVenta})</Accion>
        </div>
      )}
    </>
  );
}

export function PanelCarta({ c }) {
  const [precio, setPrecio] = useState('');
  return (
    <div className="bloque vidrio">
      <Carta c={c} />
      <p className="mut peq" style={{ marginTop: 8 }}>
        Escribe el precio (admite 1k o 2.5m). Si ya está en venta, esto cambia su precio.
      </p>
      <Campo monto valor={precio} onCambio={setPrecio} ph="Precio de venta" />
      <div className="btns">
        <Accion cls="pri" ruta="/api/cartas/vender" cuerpo={{ id: c.id }} campos={{ precio }} motivo={!precio.trim() && 'Escribe un precio.'}>Poner en venta</Accion>
        <Accion ruta="/api/cartas/retirar" cuerpo={{ id: c.id }}>Retirar de la tienda</Accion>
      </div>
      <div className="btns uno">
        <Accion ruta="/api/cartas/favorito_agregar" cuerpo={{ id: c.id }}>⭐ Agregar a favoritos</Accion>
      </div>
    </div>
  );
}
