import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { Sec, Titulo, Campo, Accion, Cifras } from '../ui.jsx';

export default function Banco({ d }) {
  const [cant, setCant] = useState('');
  const campos = { cantidad: cant };
  const tramos = d.impuesto.tramos.map(t => 'desde ' + fmt(t.desde) + ': ' + t.tasa + '%').join(' · ');
  return (
    <>
      <Cifras lista={[['Cartera', fmt(d.cartera)], ['Banco', fmt(d.banco)], ['Total', fmt(d.total)]]} />
      <Titulo>Mover dinero</Titulo>
      <div className="bloque vidrio">
        <Campo valor={cant} onCambio={setCant} ph="Cantidad" />
        <div className="btns">
          <Accion ruta="/api/banco/depositar" campos={campos}>Depositar</Accion>
          <Accion ruta="/api/banco/retirar" campos={campos}>Retirar</Accion>
          <Accion ruta="/api/banco/depositar" cuerpo={{ cantidad: 'todo' }} motivo={d.cartera < 1 && 'No tienes monedas en la cartera.'}>Depositar todo</Accion>
          <Accion ruta="/api/banco/retirar" cuerpo={{ cantidad: 'todo' }} motivo={d.banco < 1 && 'No tienes monedas en el banco.'}>Retirar todo</Accion>
        </div>
        <p className="mut peq" style={{ marginTop: 8 }}>Lo que está en el banco no se puede robar.</p>
      </div>
      {d.impuesto.aplica && (
        <div className="bloque vidrio">
          <strong>Impuesto de hoy</strong>
          <p className="peq" style={{ marginTop: 6 }}>
            Hoy pagarías {fmt(d.impuesto.diario)} al día. Guardar monedas en el banco no te libra de él.
          </p>
        </div>
      )}
      <Sec k="banco-reglas" titulo="Cómo funciona" extra="Interés e impuesto" abierta={false}>
        <p className="mut peq">
          Interés de {d.tasa}% diario (máximo {fmt(d.topeDia)} por día, hasta {d.maxDias} días acumulados).
        </p>
        <p className="mut peq" style={{ marginTop: 8 }}>Impuesto diario por tramos sobre tu patrimonio ({tramos}).</p>
      </Sec>
    </>
  );
}
