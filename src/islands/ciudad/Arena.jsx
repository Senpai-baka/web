import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { buscarArena, consultaArena, actualizarCiudad } from '../../bridge/acciones.js';
import { Sec, Vacio, Countdown, Campo, Accion, Avatar, Fila, Kv } from '../ui.jsx';
import { Seccion, Grupo } from './comun.jsx';

function Record({ d, base }) {
  const m = d.mio;
  const sinCombates = !m.victorias && !m.derrotas && !m.empates;
  return (
    <div className="ci-g">
      <div className="ci-stats">
        <div><b>{fmt(m.rating)}</b><span>Tus puntos</span></div>
        <div><b>{m.puesto ? '#' + m.puesto : '—'}</b><span>Tu puesto</span></div>
      </div>
      <div className="ci-listo">
        <span>
          Temporada {d.temporada} · termina en <Countdown fin={base + d.restanteS * 1000} />.
          {sinCombates ? ' Aún no has peleado esta temporada.' : ` ${fmt(m.victorias)} victorias · ${fmt(m.derrotas)} derrotas · ${fmt(m.empates)} empates.`}
        </span>
      </div>
    </div>
  );
}

function Recibidos({ d, base }) {
  if (!d.recibidos.length) return null;
  return (
    <Grupo titulo="Te retaron" extra={d.recibidos.length + (d.recibidos.length === 1 ? ' desafío' : ' desafíos')}>
      {d.recibidos.map(x => (
        <div className="bloque vidrio" key={x.ref}>
          <div className="ci-quien">
            <Avatar r={{ nombre: x.nombre }} />
            <strong>{x.nombre}</strong>
          </div>
          <span className="mut peq">
            {x.monto ? `Apuesta de ${fmt(x.monto)} cada uno` : 'Combate amistoso'} · vence en <Countdown fin={base + x.restaS * 1000} />
          </span>
          <div className="btns">
            <Accion
              cls="pri"
              ruta="/api/arena/aceptar"
              cuerpo={{ ref: x.ref }}
              motivo={x.monto > d.cartera && 'No te alcanza para la apuesta.'}
              confirmar={x.monto ? `¿Aceptar? Cada uno arriesga ${fmt(x.monto)}.` : undefined}
            >Aceptar</Accion>
            <Accion ruta="/api/arena/rechazar" cuerpo={{ ref: x.ref }}>Rechazar</Accion>
          </div>
        </div>
      ))}
    </Grupo>
  );
}

function Enviados({ d, base }) {
  if (!d.enviados.length) return null;
  return (
    <Grupo titulo="Tus desafíos" extra={d.enviados.length + (d.enviados.length === 1 ? ' pendiente' : ' pendientes')}>
      {d.enviados.map(x => (
        <div className="bloque vidrio" key={x.ref}>
          <div className="ci-quien">
            <Avatar r={{ nombre: x.nombre }} />
            <strong>{x.nombre}</strong>
          </div>
          <span className="mut peq">
            {x.monto ? `Apuesta de ${fmt(x.monto)} cada uno` : 'Combate amistoso'} · vence en <Countdown fin={base + x.restaS * 1000} />
          </span>
          <Accion ruta="/api/arena/cancelar" cuerpo={{ ref: x.ref }}>Cancelar</Accion>
        </div>
      ))}
    </Grupo>
  );
}

function Retar({ d }) {
  const [q, setQ] = useState(consultaArena);
  const [ref, setRef] = useState('');
  const [monto, setMonto] = useState('');
  const consulta = consultaArena();
  const resultados = d.resultados || [];
  const buscar = () => {
    setRef('');
    buscarArena(q);
  };
  const elegido = ref ? resultados.find(j => j.ref === ref) : null;
  return (
    <Grupo titulo="Retar a un jugador" extra={`Apuesta de ${fmt(d.min)} a ${fmt(d.max)}`}>
      <div className="bloque vidrio">
        <div className="campo">
          <Campo texto corto valor={q} onCambio={setQ} ph="Nombre del jugador" onEnter={buscar} />
          <button type="button" className="mini" onClick={buscar}>Buscar</button>
        </div>
        {elegido ? (
          <>
            <div className="ci-pick">
              <Avatar r={{ nombre: elegido.alias }} />
              <strong>{elegido.alias}</strong>
              <button type="button" className="mini" onClick={() => setRef('')}>Cambiar</button>
            </div>
            <Campo monto valor={monto} onCambio={setMonto} ph="Apuesta opcional (1k, 50%, todo)" />
            <span className="mut peq">
              Déjala vacía para un combate amistoso. El ganador se lleva el bote menos {d.comision}% para la casa. Tiene {Math.round(d.expiraS / 60)} minutos para aceptar.
            </span>
            <Accion cls="pri" ruta="/api/arena/retar" cuerpo={{ ref: elegido.ref }} campos={{ monto }}>Retar</Accion>
          </>
        ) : resultados.length > 0 ? (
          <div className="ci-ops">
            {resultados.map(j => (
              <button type="button" className="ci-op" key={j.ref} onClick={() => setRef(j.ref)}>
                <Avatar r={{ nombre: j.alias }} />
                <strong>{j.alias}</strong>
                <span className="mut peq">Elegir</span>
              </button>
            ))}
          </div>
        ) : (
          <span className="mut peq">
            {consulta ? 'No encontré jugadores con ese nombre. ' : 'Busca por nombre. '}Solo aparecen quienes han entrado al panel.
          </span>
        )}
      </div>
      <div className="btns uno">
        <button type="button" className="mini" onClick={actualizarCiudad}>Actualizar desafíos</button>
      </div>
    </Grupo>
  );
}

export default function Arena({ d, base }) {
  return (
    <Seccion>
      <Record d={d} base={base} />
      <Recibidos d={d} base={base} />
      <Enviados d={d} base={base} />
      <Retar d={d} />
      <Grupo titulo="Top de la arena" extra={'Temporada ' + d.temporada}>
        <div className="lista">
          {d.top.length
            ? d.top.map(r => (
              <Fila key={r.pos} r={r} avatar extra={`${fmt(r.victorias)}V ${fmt(r.derrotas)}D${r.empates ? ' ' + fmt(r.empates) + 'E' : ''}`} valor={fmt(r.rating)} />
            ))
            : <Vacio>Todavía nadie ha peleado esta temporada.</Vacio>}
        </div>
      </Grupo>
      <Sec k="arena-reglas" titulo="Cómo funciona" extra="Puntos y premios" abierta={false}>
        <div className="bloque vidrio">
          {d.premios.map((p, i) => <Kv key={i} k={['🥇', '🥈', '🥉'][i] + ' Premio al cierre'} v={fmt(p)} />)}
        </div>
        <p className="mut peq" style={{ marginTop: 8 }}>
          Los combates se resuelven solos con tu nivel, fuerza, vigor y equipo. Ganar sube tus puntos, perder los baja, y vencer a alguien más fuerte suma más. Entre las mismas dos personas solo cuentan 3 combates al día.
        </p>
        <p className="mut peq" style={{ marginTop: 8 }}>
          Cada victoria, empate o derrota también suma a tu puntaje de temporada. Con apuesta, la casa se queda con {d.comision}% del bote.
        </p>
      </Sec>
    </Seccion>
  );
}
