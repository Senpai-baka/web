import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { buscarDados, consultaDados, actualizarCiudad } from '../../bridge/acciones.js';
import { Sec, Countdown, Campo, Accion, Avatar } from '../ui.jsx';
import { Seccion, Grupo } from './comun.jsx';

function Duelo({ x, base, children }) {
  return (
    <div className="bloque vidrio">
      <div className="ci-quien">
        <Avatar r={{ nombre: x.nombre }} />
        <strong>{x.nombre}</strong>
      </div>
      <span className="mut peq">
        Apuesta de {fmt(x.monto)} cada uno · vence en <Countdown fin={base + x.restaS * 1000} />
      </span>
      {children}
    </div>
  );
}

function Recibidos({ d, base }) {
  if (!d.recibidos.length) return null;
  return (
    <Grupo titulo="Te retaron" extra={d.recibidos.length + (d.recibidos.length === 1 ? ' duelo' : ' duelos')}>
      {d.recibidos.map(x => (
        <Duelo key={x.ref} x={x} base={base}>
          <div className="btns">
            <Accion
              cls="pri"
              ruta="/api/dados/aceptar"
              cuerpo={{ ref: x.ref }}
              motivo={x.monto > d.cartera && 'No te alcanza para la apuesta.'}
              confirmar={`¿Aceptar? Cada uno arriesga ${fmt(x.monto)}.`}
            >Aceptar</Accion>
            <Accion ruta="/api/dados/rechazar" cuerpo={{ ref: x.ref }}>Rechazar</Accion>
          </div>
        </Duelo>
      ))}
    </Grupo>
  );
}

function Enviados({ d, base }) {
  if (!d.enviados.length) return null;
  return (
    <Grupo titulo="Tu duelo" extra="Esperando respuesta">
      {d.enviados.map(x => (
        <Duelo key={x.ref} x={x} base={base}>
          <Accion ruta="/api/dados/cancelar" cuerpo={{ ref: x.ref }}>Cancelar</Accion>
        </Duelo>
      ))}
    </Grupo>
  );
}

function Retar({ d }) {
  const [q, setQ] = useState(consultaDados);
  const [ref, setRef] = useState('');
  const [monto, setMonto] = useState('');
  const consulta = consultaDados();
  const resultados = d.resultados || [];
  const buscar = () => {
    setRef('');
    buscarDados(q);
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
            <Campo monto valor={monto} onCambio={setMonto} ph={`Apuesta (${fmt(d.min)} a ${fmt(d.max)})`} />
            <span className="mut peq">
              Cada uno tira dos dados y gana la suma más alta. Si empatan, se devuelven las apuestas. El ganador se lleva el bote menos {d.comision}%. Tiene {d.expiraS} segundos para aceptar.
            </span>
            <Accion cls="pri" ruta="/api/dados/retar" cuerpo={{ ref: elegido.ref }} campos={{ monto }}>Retar</Accion>
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
        <button type="button" className="mini" onClick={actualizarCiudad}>Actualizar duelos</button>
      </div>
    </Grupo>
  );
}

export default function Dados({ d, base }) {
  return (
    <Seccion>
      <div className="bloque vidrio">
        <div className="ci-fila">
          <div>
            <span className="ci-et">Tu cartera</span>
            <span className="ci-num oro">{fmt(d.cartera)}</span>
          </div>
        </div>
      </div>
      <Recibidos d={d} base={base} />
      <Enviados d={d} base={base} />
      <Retar d={d} />
      <Sec k="dados-reglas" titulo="Cómo funciona" extra="Duelo de dados" abierta={false}>
        <p className="mut peq">
          Retas a otro jugador con una apuesta de {fmt(d.min)} a {fmt(d.max)}. Si acepta, se tiran dos dados para cada uno y gana la suma más alta. Si hay empate, nadie pierde nada.
        </p>
        <p className="mut peq" style={{ marginTop: 8 }}>
          Los duelos duran {d.expiraS} segundos y solo puedes tener uno enviado a la vez. La casa se queda con {d.comision}% del bote.
        </p>
      </Sec>
    </Seccion>
  );
}
