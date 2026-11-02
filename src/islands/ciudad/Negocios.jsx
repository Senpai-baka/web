import React from 'react';
import { fmt } from '../../lib/format.js';
import { Accion, Barra, Slot } from '../ui.jsx';
import { NEUTRO, ORO } from '../rareza.js';
import { Seccion, Grupo } from './comun.jsx';

function Cobro({ d, propios }) {
  const capTotal = propios.reduce((s, n) => s + n.tasa * d.capHoras, 0);
  return (
    <div className="bloque vidrio">
      <div className="ci-fila">
        <div>
          <span className="ci-et">Listo para cobrar</span>
          <span className="ci-num">{fmt(d.pendienteTotal)}</span>
        </div>
        <div className="ci-lado">Cartera<b>{fmt(d.cartera)}</b></div>
      </div>
      {propios.length > 0 && <Barra valor={d.pendienteTotal} max={capTotal} />}
      <span className="mut peq">Acumulan hasta {d.capHoras} horas. Cobra antes de que se llenen.</span>
      <Accion cls="pri" ruta="/api/negocios/cobrar" motivo={d.pendienteTotal < 1 && 'Todavía no han producido nada.'}>Cobrar todo · {fmt(d.pendienteTotal)}</Accion>
    </div>
  );
}

function Propio({ n, capHoras }) {
  return (
    <div className="bloque vidrio">
      <div className="ci-fil">
        <Slot emoji={n.emoji} color={ORO} />
        <div className="info">
          <strong>{n.nombre}</strong>
          <span className="mut peq">Nivel {n.nivel} de {n.max} · {fmt(n.tasa)} por hora</span>
        </div>
      </div>
      <Barra valor={n.pendiente} max={n.tasa * capHoras} />
      <div className="ci-meta"><span>Pendiente</span><b>{fmt(n.pendiente)}</b></div>
      {n.costoMejora === null
        ? <Accion motivo="Ya está al máximo.">Nivel máximo</Accion>
        : <Accion ruta="/api/negocios/mejorar" cuerpo={{ clave: n.clave }} motivo={!n.puede && 'Te faltan monedas.'}>Mejorar · {fmt(n.costoMejora)}</Accion>}
    </div>
  );
}

function Libre({ n }) {
  return (
    <div className="ci-fil">
      <Slot emoji={n.emoji} color={n.puede ? ORO : NEUTRO} />
      <div className="info">
        <strong>{n.nombre}</strong>
        <span className="mut peq">{fmt(n.tasa)} por hora</span>
      </div>
      <Accion cls="pri" ruta="/api/negocios/comprar" cuerpo={{ clave: n.clave }} motivo={!n.puede && 'Te faltan monedas.'}>
        Comprar<small>{fmt(n.precio)}</small>
      </Accion>
    </div>
  );
}

export default function Negocios({ d }) {
  const propios = d.negocios.filter(n => n.tiene);
  const libres = d.negocios.filter(n => !n.tiene);
  return (
    <Seccion>
      <Cobro d={d} propios={propios} />
      {propios.length > 0 && (
        <Grupo titulo="Tus negocios" extra={propios.length + ' de ' + d.negocios.length}>
          {propios.map(n => <Propio key={n.clave} n={n} capHoras={d.capHoras} />)}
        </Grupo>
      )}
      {libres.length > 0 && (
        <Grupo titulo="Para comprar" extra={libres.length + (libres.length === 1 ? ' disponible' : ' disponibles')}>
          <div className="bloque vidrio ci-lista">
            {libres.map(n => <Libre key={n.clave} n={n} />)}
          </div>
        </Grupo>
      )}
    </Seccion>
  );
}
