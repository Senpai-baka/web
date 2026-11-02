import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { buscarJugadores, consultaJugadores, verJugador } from '../../bridge/acciones.js';
import { Sec, Vacio, Countdown, Campo, Accion, Avatar } from '../ui.jsx';
import { Seccion, Grupo } from './comun.jsx';

export default function Jugadores({ d, base }) {
  const [q, setQ] = useState(consultaJugadores);
  const buscar = () => buscarJugadores(q);
  const consulta = consultaJugadores();
  const espera = d.robo.esperaS > 0;
  return (
    <Seccion>
      <div className="ci-g">
        <div className="ci-stats">
          <div><b>{d.robo.exito}%</b><span>Éxito al robar</span></div>
          <div><b>{fmt(d.robo.min)}</b><span>Mínimo para robar</span></div>
        </div>
        <div className={'ci-listo' + (espera ? ' espera' : '')}>
          <span>
            {espera ? <>Podrás robar de nuevo en <Countdown fin={base + d.robo.esperaS * 1000} />.</> : 'Listo para robar.'}
            {d.robo.escudo > 0 ? ' Tienes un escudo activo que se romperá si atacas.' : ''}
          </span>
        </div>
      </div>
      <Grupo titulo="Buscar jugador">
        <div className="campo">
          <Campo texto corto valor={q} onCambio={setQ} ph="Nombre del jugador" onEnter={buscar} />
          <button type="button" className="mini" onClick={buscar}>Buscar</button>
        </div>
        <span className="mut peq">Solo aparecen quienes han entrado al panel.</span>
      </Grupo>
      {d.resultados.length > 0 && (
        <Grupo titulo="Resultados" extra={d.resultados.length + (d.resultados.length === 1 ? ' jugador' : ' jugadores')}>
          {d.resultados.map(j => (
            <div className="bloque vidrio" key={j.ref}>
              <div className="ci-quien">
                <Avatar r={{ nombre: j.alias }} />
                <strong>{j.alias}</strong>
              </div>
              <div className="btns">
                <button type="button" className="mini" onClick={() => verJugador(j.ref)}>Ver perfil</button>
                <Accion cls="mal" ruta="/api/jugadores/robar" cuerpo={{ ref: j.ref }} confirmar={`¿Intentar robar a ${j.alias}? Si sale mal pagas una multa.`}>Robar</Accion>
              </div>
            </div>
          ))}
        </Grupo>
      )}
      {d.resultados.length === 0 && consulta && <Vacio>No encontré jugadores con ese nombre. Solo aparecen quienes han entrado al panel.</Vacio>}
      <Sec k="jugadores-reglas" titulo="Reglas" extra="Cómo funciona el robo" abierta={false}>
        <p className="mut peq">
          Robar necesita {fmt(d.robo.min)} en tu cartera y tiene {d.robo.exito}% de éxito. Si sale mal pagas una multa.
        </p>
      </Sec>
    </Seccion>
  );
}
