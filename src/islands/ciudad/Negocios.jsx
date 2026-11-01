import React from 'react';
import { fmt } from '../../lib/format.js';
import { Titulo, Accion, Cifras } from '../ui.jsx';

function Comprar({ n }) {
  return (
    <div className="bloque vidrio">
      <div className="fila"><strong>{n.emoji} {n.nombre}</strong><b>{fmt(n.precio)}</b></div>
      <p className="mut peq">Produce {fmt(n.tasa)} monedas por hora.</p>
      <div className="btns uno">
        <Accion ruta="/api/negocios/comprar" cuerpo={{ clave: n.clave }} motivo={!n.puede && 'Te faltan monedas.'}>Comprar</Accion>
      </div>
    </div>
  );
}

function Propio({ n }) {
  return (
    <div className="bloque vidrio">
      <div className="fila"><strong>{n.emoji} {n.nombre}</strong><span className="mut peq">Nv {n.nivel}/{n.max}</span></div>
      <p className="mut peq">{fmt(n.tasa)} monedas por hora · pendiente <b>{fmt(n.pendiente)}</b></p>
      <div className="btns uno">
        {n.costoMejora === null
          ? <Accion motivo="Ya está al máximo.">Nivel máximo</Accion>
          : <Accion ruta="/api/negocios/mejorar" cuerpo={{ clave: n.clave }} motivo={!n.puede && 'Te faltan monedas.'}>Mejorar · {fmt(n.costoMejora)}</Accion>}
      </div>
    </div>
  );
}

export default function Negocios({ d }) {
  const propios = d.negocios.filter(n => n.tiene);
  const libres = d.negocios.filter(n => !n.tiene);
  return (
    <>
      <Cifras lista={[['Cartera', fmt(d.cartera)], ['Pendiente', fmt(d.pendienteTotal)], ['Negocios', propios.length + '/' + d.negocios.length]]} />
      <div className="btns uno">
        <Accion ruta="/api/negocios/cobrar" motivo={d.pendienteTotal < 1 && 'Todavía no han producido nada.'}>Cobrar · {fmt(d.pendienteTotal)}</Accion>
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>Acumulan hasta {d.capHoras} horas. Cobra antes de que se llenen.</p>
      {propios.length > 0 && (
        <>
          <Titulo>Tus negocios</Titulo>
          {propios.map(n => <Propio key={n.clave} n={n} />)}
        </>
      )}
      {libres.length > 0 && (
        <>
          <Titulo>Para comprar</Titulo>
          {libres.map(n => <Comprar key={n.clave} n={n} />)}
        </>
      )}
    </>
  );
}
