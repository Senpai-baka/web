import React, { useState } from 'react';
import { fmt } from '../lib/format.js';
import { useMe } from '../bridge/store.js';
import { tiendaSeccion, tiendaIr, tiendaPagina } from '../bridge/acciones.js';
import { Cab, Seg, Vacio, Countdown, Titulo, Accion } from './ui.jsx';

const SECCIONES = [['tienda', 'Tienda'], ['bazar', 'Bazar'], ['mercado', 'Mercado'], ['subastas', 'Subastas']];

const ICONO = (
  <>
    <path d="M4 9 L6 4 H18 L20 9" />
    <path d="M4 9 C4 11 8 11 8 9 C8 11 12 11 12 9 C12 11 16 11 16 9 C16 11 20 11 20 9" />
    <path d="M5 11 V20 H19 V11" />
    <path d="M10 20 V15 H14 V20" />
  </>
);

function Objeto({ i, d, base }) {
  const lleno = i.stock >= d.tope;
  const limite = !!(i.limiteDia && i.usosHoy >= i.limiteDia);
  const pobre = d.cartera < i.precio;
  const motivo = lleno ? 'Ya tienes el máximo.' : limite ? 'Llegaste al límite de hoy.' : 'Te faltan monedas.';
  return (
    <div className="bloque vidrio">
      <div className="fila"><strong>{i.emoji} {i.nombre}</strong><b>{fmt(i.precio)}</b></div>
      <p className="mut peq">{i.desc}</p>
      <p className="peq">
        Tienes {i.stock}/{d.tope}{' '}
        {i.activoS ? <span className="etiq">Activo <Countdown fin={base + i.activoS * 1000} /></span> : null}{' '}
        {i.usosRestantes ? <span className="etiq">{i.usosRestantes} usos</span> : null}{' '}
        {i.limiteDia ? <span className="mut peq">Hoy {i.usosHoy}/{i.limiteDia}</span> : null}
      </p>
      {i.pasivo && <p className="mut peq">Se usa solo en {i.usoEn}</p>}
      <div className="btnrow">
        <Accion ruta="/api/tienda/comprar" cuerpo={{ clave: i.clave }} motivo={(lleno || limite || pobre) && motivo}>Comprar</Accion>
        {!i.pasivo && <Accion ruta="/api/tienda/usar" cuerpo={{ clave: i.clave }} motivo={i.stock < 1 && 'No tienes este objeto.'}>Usar</Accion>}
      </div>
    </div>
  );
}

function Objetos({ d, base }) {
  return (
    <>
      <Titulo>Objetos</Titulo>
      {d.items.map(i => <Objeto key={i.clave} i={i} d={d} base={base} />)}
    </>
  );
}

function Bazar({ d, base }) {
  return (
    <>
      <Titulo extra={<span className="mut peq">cambian en <Countdown fin={base + d.cambiaS * 1000} /></span>}>Ofertas de hoy</Titulo>
      {d.ofertas.map(o => (
        <div className="fil" key={o.id}>
          <div className="nom"><strong className="largo">{o.nombre}</strong><span className="mut peq">{fmt(o.precio)} monedas</span></div>
          <Accion
            ruta="/api/bazar/comprar"
            cuerpo={{ id: o.id }}
            motivo={o.comprada ? 'Ya la compraste hoy.' : d.cartera < o.precio && 'Te faltan monedas.'}
          >{o.comprada ? 'Comprada' : 'Comprar'}</Accion>
        </div>
      ))}
      <p className="mut peq" style={{ marginTop: 10 }}>Una compra por oferta cada día. El equipo sale al nivel que tengas hoy.</p>
    </>
  );
}

function Paginador({ k, d }) {
  const ir = dir => e => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') return;
    tiendaPagina(k, dir);
  };
  return (
    <div className="btnrow" style={{ alignItems: 'center' }}>
      <button type="button" className="mini" aria-disabled={d.pagina <= 1} onClick={ir(-1)}>Anterior</button>
      <span className="mut peq" style={{ flex: 'none' }}>Página {d.pagina}</span>
      <button type="button" className="mini" aria-disabled={!d.hayMas} onClick={ir(1)}>Siguiente</button>
    </div>
  );
}

const Opciones = ({ d }) => d.vendibles.map(v => <option key={v.clave} value={v.clave}>{v.nombre} (x{v.cantidad})</option>);

const Num = ({ valor, onCambio, ph, ...extra }) => (
  <input className="txt" type="number" inputMode="numeric" min="1" placeholder={ph} aria-label={ph} value={valor} onChange={e => onCambio(e.target.value)} {...extra} />
);

const objetoValido = (d, clave) => (d.vendibles.some(v => v.clave === clave) ? clave : d.vendibles[0].clave);

function FormVenta({ d }) {
  const [obj, setObj] = useState(d.vendibles[0].clave);
  const [cant, setCant] = useState('1');
  const [precio, setPrecio] = useState('');
  const lleno = d.mias.length >= d.limite;
  return (
    <div className="bloque vidrio">
      <select className="txt" aria-label="Objeto a vender" value={objetoValido(d, obj)} onChange={e => setObj(e.target.value)}><Opciones d={d} /></select>
      <div className="campo">
        <Num valor={cant} onCambio={setCant} ph="Cantidad" />
        <Num valor={precio} onCambio={setPrecio} ph="Precio total" max={d.maxPrecio} />
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>
        Comisión del {d.comision}% al vender. Máximo {fmt(d.maxPrecio)} monedas. Ofertas: {d.mias.length}/{d.limite}.
      </p>
      <div className="btns uno">
        <Accion ruta="/api/mercado/publicar" campos={{ clave: objetoValido(d, obj), cantidad: cant, precio }} motivo={lleno && 'Ya tienes el máximo de ofertas.'}>Publicar oferta</Accion>
      </div>
    </div>
  );
}

function Mercado({ d }) {
  const resto = d.ofertas.filter(o => !o.mia);
  return (
    <>
      <Titulo>Vender</Titulo>
      {d.vendibles.length
        ? <FormVenta key={d.mias.length} d={d} />
        : <Vacio>No tienes objetos ni materiales para vender.</Vacio>}

      <Titulo>Mis ofertas</Titulo>
      {d.mias.length
        ? d.mias.map(o => (
          <div className="fil" key={o.id}>
            <div className="nom"><strong className="largo">{o.nombre} x{o.cantidad}</strong><span className="mut peq">{fmt(o.precio)} monedas</span></div>
            <Accion ruta="/api/mercado/cancelar" cuerpo={{ id: o.id }}>Cancelar</Accion>
          </div>
        ))
        : <Vacio>No tienes ofertas publicadas.</Vacio>}

      <Titulo>A la venta</Titulo>
      {resto.length
        ? resto.map(o => (
          <div className="fil" key={o.id}>
            <div className="nom"><strong className="largo">{o.nombre} x{o.cantidad}</strong><span className="mut peq">{fmt(o.precio)} monedas</span></div>
            <Accion ruta="/api/mercado/comprar" cuerpo={{ id: o.id }} motivo={d.cartera < o.precio && 'Te faltan monedas.'}>Comprar</Accion>
          </div>
        ))
        : <Vacio>No hay ofertas de otros jugadores por ahora.</Vacio>}
      <Paginador k="mercado" d={d} />
    </>
  );
}

function FormSubasta({ d }) {
  const [obj, setObj] = useState(d.vendibles[0].clave);
  const [cant, setCant] = useState('1');
  const [precioBase, setPrecioBase] = useState('');
  const [horas, setHoras] = useState(String(d.horas.includes(6) ? 6 : d.horas[0]));
  const lleno = d.mias.length >= d.limite;
  return (
    <div className="bloque vidrio">
      <select className="txt" aria-label="Objeto a subastar" value={objetoValido(d, obj)} onChange={e => setObj(e.target.value)}><Opciones d={d} /></select>
      <div className="campo">
        <Num valor={cant} onCambio={setCant} ph="Cantidad" />
        <Num valor={precioBase} onCambio={setPrecioBase} ph="Precio base" max={d.maxPrecio} />
      </div>
      <select className="txt" aria-label="Duración" value={horas} onChange={e => setHoras(e.target.value)}>
        {d.horas.map(h => <option key={h} value={h}>{h} h</option>)}
      </select>
      <p className="mut peq" style={{ marginTop: 8 }}>
        Comisión del {d.comision}% si se vende. Subastas: {d.mias.length}/{d.limite}. El equipo se elige aquí también.
      </p>
      <div className="btns uno">
        <Accion ruta="/api/subastas/crear" campos={{ clave: objetoValido(d, obj), cantidad: cant, base: precioBase, horas }} motivo={lleno && 'Ya tienes el máximo de subastas.'}>Crear subasta</Accion>
      </div>
    </div>
  );
}

function Puja({ s, d }) {
  const [monto, setMonto] = useState(String(s.minimo));
  return (
    <>
      <input className="txt corto" type="number" inputMode="numeric" min={s.minimo} aria-label="Tu puja" value={monto} onChange={e => setMonto(e.target.value)} />
      <Accion ruta="/api/subastas/pujar" cuerpo={{ id: s.id }} campos={{ monto }} motivo={d.cartera < s.minimo && 'Te faltan monedas.'}>Pujar</Accion>
    </>
  );
}

function Subasta({ s, d, base }) {
  const puja = s.puja > 0 ? 'Puja actual ' + fmt(s.puja) : 'Base ' + fmt(s.base) + ' · sin pujas';
  let acc;
  if (s.mia) {
    acc = <Accion ruta="/api/subastas/cancelar" cuerpo={{ id: s.id }} motivo={s.puja > 0 && 'Ya tiene pujas y no se puede cancelar.'}>Cancelar</Accion>;
  } else if (s.ganando) {
    acc = <span className="etiq">Vas ganando</span>;
  } else {
    acc = <Puja key={s.minimo} s={s} d={d} />;
  }
  return (
    <div className="bloque vidrio">
      <div className="fila"><strong className="largo">{s.nombre}</strong></div>
      <p className="mut peq">{puja} · mínimo {fmt(s.minimo)} · termina en <Countdown fin={base + s.terminaS * 1000} /></p>
      <div className="btnrow" style={{ alignItems: 'center' }}>{acc}</div>
    </div>
  );
}

function Subastas({ d, base }) {
  const resto = d.activas.filter(s => !s.mia);
  return (
    <>
      <Titulo>Crear</Titulo>
      {d.vendibles.length
        ? <FormSubasta key={d.mias.length} d={d} />
        : <Vacio>No tienes nada para subastar.</Vacio>}

      <Titulo>Mis subastas</Titulo>
      {d.mias.length
        ? d.mias.map(s => <Subasta key={s.id} s={s} d={d} base={base} />)
        : <Vacio>No tienes subastas activas.</Vacio>}

      <Titulo>Activas</Titulo>
      {resto.length
        ? resto.map(s => <Subasta key={s.id} s={s} d={d} base={base} />)
        : <Vacio>No hay subastas de otros jugadores por ahora.</Vacio>}
      <Paginador k="subastas" d={d} />
    </>
  );
}

const VISTAS = { tienda: Objetos, bazar: Bazar, mercado: Mercado, subastas: Subastas };

export default function Tienda({ d, base }) {
  const me = useMe();
  const sel = tiendaSeccion();
  const Vista = VISTAS[sel] || Objetos;
  return (
    <>
      <Cab
        titulo="Tienda"
        sub="Compra, vende y subasta con otros jugadores."
        icono={ICONO}
        stats={[['Cartera', fmt(d.cartera)], ['Nivel', me ? me.nivel : '']]}
      />
      <Seg aria="Sección de la tienda" opciones={SECCIONES} valor={sel} onCambio={tiendaIr} />
      <Vista d={d} base={base} />
    </>
  );
}
