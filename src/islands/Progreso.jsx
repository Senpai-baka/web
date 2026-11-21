import React, { useState } from 'react';
import { Seg, Accion, Vacio, Countdown } from './ui.jsx';
import { Marca } from './fichaUi.jsx';
import { fmt } from '../lib/format.js';

const OPCIONES = [['misiones', 'Misiones'], ['logros', 'Logros'], ['maestria', 'Maestría'], ['titulos', 'Títulos']];
const num = v => fmt(Number(v || 0));
const pct = (v, max) => max > 0 ? Math.max(0, Math.min(100, Number(v || 0) / max * 100)) : 0;

function Barra({ valor, max }) {
  return (
    <div className="fc-barra" role="progressbar" aria-valuemin={0} aria-valuemax={Number(max || 0)} aria-valuenow={Number(valor || 0)}>
      <i style={{ width: `${pct(valor, max)}%` }} />
    </div>
  );
}

function Premio({ monedas }) {
  return <span className="fc-prem">{num(monedas)}<small>monedas</small></span>;
}

function Misiones({ d, base }) {
  const m = d?.misiones;
  if (!m) return <Vacio>No hay datos de misiones disponibles.</Vacio>;
  return (
    <>
      <p className="fc-nota">Se renuevan en <Countdown fin={base + Number(m.reiniciaS || 0) * 1000} />.</p>
      <ul className="fc-lista">
        {(m.diarias || []).map((x, i) => (
          <li className={'fc-mis' + (x.hecha ? ' hecha' : '')} key={x.id || x.clave || `${x.texto}-${i}`}>
            <Marca ok={!!x.hecha} />
            <div className="fc-mis-c">
              <strong>{x.emoji || '🎯'} {x.texto}</strong>
              <Barra valor={x.prog} max={x.meta} />
              <span className="fc-mis-p"><b>{num(x.prog)}</b> de {num(x.meta)} · {num(x.xp)} XP</span>
            </div>
            <Premio monedas={x.monedas} />
          </li>
        ))}
      </ul>
      {m.bono && (
        <div className={'fc-aviso' + (m.bono.hecho ? ' hecho' : '')}>
          <p>Por completar todas: <b>{num(m.bono.monedas)}</b> monedas y <b>{num(m.bono.xp)}</b> XP · {m.bono.hecho ? 'ya reclamado' : 'pendiente'}.</p>
        </div>
      )}
    </>
  );
}

function Logros({ d }) {
  const l = d?.logros;
  if (!l) return <Vacio>No hay datos de logros disponibles.</Vacio>;
  const lista = l.lista || [];
  return (
    <>
      <p className="fc-nota"><b>{num(l.tengo)}</b> de {num(l.total)} logros conseguidos.</p>
      {lista.length ? (
        <ul className="fc-lista">
          {lista.map((x, i) => (
            <li className={'fc-f' + (x.tiene ? '' : ' pend')} key={x.clave || x.nombre || i}>
              <span className="fc-ico">{x.emoji || '🏆'}</span>
              <div className="fc-f-t">
                <strong>{x.nombre}</strong>
                <span>{x.desc}{x.tiene ? '' : ` · ${num(x.prog)}/${num(x.meta)}`}</span>
                {!x.tiene && <Barra valor={x.prog} max={x.meta} />}
              </div>
              {x.tiene ? <Marca ok /> : <Premio monedas={x.monedas} />}
            </li>
          ))}
        </ul>
      ) : <Vacio>Aún no hay logros para mostrar.</Vacio>}
    </>
  );
}

function Maestria({ d }) {
  const m = d?.maestria;
  if (!m) return <Vacio>No hay datos de maestría disponibles.</Vacio>;
  return (
    <>
      <p className="fc-nota">Cada actividad suma usos y otorga bonos permanentes.</p>
      <ul className="fc-lista">
        {(m.actividades || []).map((a, i) => (
          <li className="fc-mae" key={a.clave || a.nombre || i}>
            <div className="fc-mae-t">
              <strong>{a.emoji || '✨'} {a.nombre}</strong>
              <span>Nv {num(a.nivel)}/{num(m.max)}</span>
            </div>
            {a.sig ? (
              <>
                <Barra valor={Number(a.usos || 0) - Number(a.previo || 0)} max={Number(a.sig || 0) - Number(a.previo || 0)} />
                <span className="fc-mis-p"><b>{num(a.usos)}</b> de {num(a.sig)} usos</span>
              </>
            ) : <span className="fc-mis-p">Nivel máximo</span>}
            <p className="fc-bonos">+{num(a.botin)}% monedas · +{num(a.evento)}% eventos</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Titulos({ d }) {
  const t = d?.titulos;
  if (!t) return <Vacio>No hay datos de títulos disponibles.</Vacio>;
  const lista = t.lista || [];
  return (
    <>
      <p className="fc-nota">Cartera <b>{num(t.cartera)}</b> monedas</p>
      {lista.length ? (
        <ul className="fc-lista">
          {lista.map((x, i) => {
            const motivo = !x.tiene && !x.puede ? (x.prestigio ? `Necesitas prestigio ${x.prestigio}.` : 'Te faltan monedas.') : '';
            return (
              <li className="fc-f" key={x.clave || x.nombre || i}>
                <div className="fc-f-t">
                  <strong>{x.nombre}{x.puesto ? <em className="fc-etq">Equipado</em> : null}</strong>
                </div>
                {x.tiene
                  ? <Accion ruta="/api/titulos/equipar" cuerpo={x.puesto ? {} : { clave: x.clave }}>{x.puesto ? 'Quitar' : 'Equipar'}</Accion>
                  : <Accion ruta="/api/titulos/comprar" cuerpo={{ clave: x.clave }} motivo={motivo}>{x.prestigio ? `Prestigio ${x.prestigio}` : num(x.precio)}</Accion>}
              </li>
            );
          })}
        </ul>
      ) : <Vacio>No hay títulos disponibles.</Vacio>}
    </>
  );
}

export default function Progreso({ d = {}, base }) {
  const [seccion, setSeccion] = useState('misiones');
  const panel = {
    misiones: <Misiones d={d} base={base} />,
    logros: <Logros d={d} />,
    maestria: <Maestria d={d} />,
    titulos: <Titulos d={d} />
  }[seccion];
  return (
    <>
      <Seg aria="Sección de progreso" opciones={OPCIONES} valor={seccion} onCambio={setSeccion} />
      {panel}
    </>
  );
}
