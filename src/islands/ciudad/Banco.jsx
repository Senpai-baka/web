import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { Sec, Campo, Accion, Avatar } from '../ui.jsx';
import { buscarPago, consultaPago } from '../../bridge/acciones.js';
import { Seccion, Grupo } from './comun.jsx';

function Patrimonio({ d }) {
  const pct = d.total > 0 ? Math.round(d.cartera / d.total * 100) : 0;
  return (
    <div className="bloque vidrio">
      <span className="ci-et">Patrimonio total</span>
      <span className="ci-num">{fmt(d.total)}</span>
      <div className="ci-barra" aria-hidden="true">
        <i className="car" style={{ width: pct + '%' }} />
        <i className="ban" style={{ width: 100 - pct + '%' }} />
      </div>
      <div className="ci-leg">
        <div><span className="pt car" />En cartera<b>{fmt(d.cartera)}</b></div>
        <div className="der"><span className="pt ban" />En el banco<b>{fmt(d.banco)}</b></div>
      </div>
    </div>
  );
}

function Mover({ d }) {
  const [cant, setCant] = useState('');
  const campos = { cantidad: cant };
  return (
    <Grupo titulo="Mover dinero" extra="El banco no se puede robar">
      <div className="bloque vidrio">
        <Campo valor={cant} onCambio={setCant} ph="Cantidad" />
        <div className="btns">
          <Accion cls="pri" ruta="/api/banco/depositar" campos={campos}>Depositar</Accion>
          <Accion ruta="/api/banco/retirar" campos={campos}>Retirar</Accion>
        </div>
        <div className="ci-enl">
          <Accion ruta="/api/banco/depositar" cuerpo={{ cantidad: 'todo' }} motivo={d.cartera < 1 && 'No tienes monedas en la cartera.'}>Depositar todo</Accion>
          <Accion ruta="/api/banco/retirar" cuerpo={{ cantidad: 'todo' }} motivo={d.banco < 1 && 'No tienes monedas en el banco.'}>Retirar todo</Accion>
        </div>
      </div>
    </Grupo>
  );
}

function Pagar({ d }) {
  const [q, setQ] = useState(consultaPago);
  const [ref, setRef] = useState('');
  const [cant, setCant] = useState('');
  const consulta = consultaPago();
  const buscar = () => {
    setRef('');
    buscarPago(q);
  };
  const elegido = ref ? d.resultados.find(j => j.ref === ref) : null;
  const n = Number(cant);
  const valida = Number.isFinite(n) && n >= d.pago.min;
  const neto = valida ? n - Math.max(1, Math.ceil(n * d.pago.tasa / 100)) : 0;
  const motivo = !valida ? `Indica una cantidad válida (mínimo ${fmt(d.pago.min)}).` : n > d.cartera ? 'No tienes suficientes monedas en la cartera.' : null;
  return (
    <Grupo titulo="Pagar a un jugador" extra={`Impuesto ${d.pago.tasa}%`}>
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
            <Campo valor={cant} onCambio={setCant} ph="Cantidad a pagar" />
            <span className="mut peq">{valida ? `${elegido.alias} recibe ${fmt(neto)}. ` : ''}Pago mínimo: {fmt(d.pago.min)}.</span>
            <Accion cls="pri" ruta="/api/jugadores/pagar" cuerpo={{ ref: elegido.ref }} campos={{ cantidad: cant }} motivo={motivo}>Pagar</Accion>
          </>
        ) : d.resultados.length > 0 ? (
          <div className="ci-ops">
            {d.resultados.map(j => (
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
    </Grupo>
  );
}

export default function Banco({ d }) {
  const tramos = d.impuesto.tramos.map(t => 'desde ' + fmt(t.desde) + ': ' + t.tasa + '%').join(' · ');
  return (
    <Seccion>
      <Patrimonio d={d} />
      <Mover d={d} />
      <Pagar d={d} />
      {d.impuesto.aplica && (
        <div className="ci-nota">
          Hoy pagarías <b>{fmt(d.impuesto.diario)}</b> al día. Guardar monedas en el banco no te libra de él.
        </div>
      )}
      <Sec k="banco-reglas" titulo="Cómo funciona" extra="Interés y pagos" abierta={false}>
        <p className="mut peq">
          Interés de {d.tasa}% diario (máximo {fmt(d.topeDia)} por día, hasta {d.maxDias} días acumulados).
        </p>
        <p className="mut peq" style={{ marginTop: 8 }}>Impuesto diario por tramos sobre tu patrimonio ({tramos}).</p>
        <p className="mut peq" style={{ marginTop: 8 }}>Pagar a otro jugador cobra {d.pago.tasa}% de impuesto (mínimo {fmt(d.pago.min)}).</p>
      </Sec>
    </Seccion>
  );
}
