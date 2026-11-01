import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { buscarJugadores, consultaJugadores, verJugador } from '../../bridge/acciones.js';
import { Sec, Vacio, Countdown, Titulo, Campo, Accion, Cifras } from '../ui.jsx';

export default function Jugadores({ d, base }) {
  const [q, setQ] = useState(consultaJugadores);
  const [pago, setPago] = useState('');
  const buscar = () => buscarJugadores(q);
  const consulta = consultaJugadores();
  return (
    <>
      <Cifras lista={[['Cartera', fmt(d.cartera)], ['Impuesto al pagar', d.pago.tasa + '%'], ['Éxito al robar', d.robo.exito + '%']]} />
      <Titulo>Buscar jugador</Titulo>
      <div className="bloque vidrio">
        <div className="campo">
          <Campo texto corto valor={q} onCambio={setQ} ph="Nombre del jugador" onEnter={buscar} />
          <button type="button" className="mini" onClick={buscar}>Buscar</button>
        </div>
        <p className="mut peq" style={{ marginTop: 8 }}>Solo aparecen quienes han entrado al panel.</p>
      </div>
      <div className="bloque vidrio">
        <p className="peq">
          {d.robo.esperaS > 0
            ? <>Podrás robar de nuevo en <Countdown fin={base + d.robo.esperaS * 1000} />.</>
            : 'Listo para robar.'}
          {d.robo.escudo > 0 ? ' Tienes un escudo activo que se romperá si atacas.' : ''}
        </p>
      </div>
      <Sec k="jugadores-reglas" titulo="Reglas" extra="Pagar y robar" abierta={false}>
        <p className="mut peq">
          Pagar cobra {d.pago.tasa}% de impuesto (mínimo {fmt(d.pago.min)}).
          Robar necesita {fmt(d.robo.min)} en tu cartera y tiene {d.robo.exito}% de éxito. Si sale mal pagas una multa.
        </p>
      </Sec>
      {d.resultados.length > 0 && (
        <>
          <Titulo>Resultados</Titulo>
          <div className="bloque vidrio">
            <Campo valor={pago} onCambio={setPago} ph="Cantidad a pagar" />
          </div>
          {d.resultados.map(j => (
            <div className="bloque vidrio" key={j.ref}>
              <strong>{j.alias}</strong>
              <div className="btnrow">
                <button type="button" className="mini" onClick={() => verJugador(j.ref)}>Ver perfil</button>
                <Accion ruta="/api/jugadores/pagar" cuerpo={{ ref: j.ref }} campos={{ cantidad: pago }}>Pagar</Accion>
                <Accion ruta="/api/jugadores/robar" cuerpo={{ ref: j.ref }} confirmar={`¿Intentar robar a ${j.alias}? Si sale mal pagas una multa.`}>Robar</Accion>
              </div>
            </div>
          ))}
        </>
      )}
      {d.resultados.length === 0 && consulta && <Vacio>No encontré jugadores con ese nombre. Solo aparecen quienes han entrado al panel.</Vacio>}
    </>
  );
}
