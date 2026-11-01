import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { Sec, Titulo, Campo, Accion, Cifras } from '../ui.jsx';

const COLORES = ['rojo', 'negro', 'par', 'impar', 'verde'];
const cap = k => k[0].toUpperCase() + k.slice(1);

export default function Casino({ d }) {
  const [monto, setMonto] = useState(String(d.min));
  const [num, setNum] = useState('');
  const camp = { monto };
  const mejorPago = Math.max(d.par, ...d.tragamonedas.map(s => s.x));
  return (
    <>
      <Cifras lista={[['Cartera', fmt(d.cartera)], ['Mínimo', fmt(d.min)], ['Máximo', fmt(d.max)]]} />
      <Titulo>Tu apuesta</Titulo>
      <div className="bloque vidrio">
        <Campo valor={monto} onCambio={setMonto} ph={'Apuesta (' + fmt(d.min) + ' a ' + fmt(d.max) + ')'} />
        <p className="mut peq" style={{ marginTop: 8 }}>La casa siempre gana a la larga. Juega con lo que puedas perder.</p>
      </div>
      <Titulo>Juegos</Titulo>
      <Sec k="casino-tragamonedas" titulo="Tragamonedas" extra={'hasta x' + mejorPago}>
        <p className="mut peq">{d.tragamonedas.map(s => s.emoji + ' x' + s.x).join(' · ')} · pareja x{d.par}</p>
        <div className="btns uno"><Accion ruta="/api/casino/tragamonedas" campos={camp}>Girar</Accion></div>
      </Sec>
      <Sec k="casino-moneda" titulo="Cara o cruz" extra={'paga ' + Math.round(d.moneda.pago * 100) + '%'}>
        <p className="mut peq">Pagan {Math.round(d.moneda.pago * 100)}% de tu apuesta.</p>
        <div className="btns">
          <Accion ruta="/api/casino/moneda" cuerpo={{ lado: 'cara' }} campos={camp}>🙂 Cara</Accion>
          <Accion ruta="/api/casino/moneda" cuerpo={{ lado: 'cruz' }} campos={camp}>🦅 Cruz</Accion>
        </div>
      </Sec>
      <Sec k="casino-ruleta" titulo="Ruleta" extra={'número x' + d.ruleta.numero}>
        <div className="btns">
          {COLORES.map(k => (
            <Accion key={k} ruta="/api/casino/ruleta" cuerpo={{ apuesta: k }} campos={camp}>{cap(k)} x{d.ruleta.colores[k]}</Accion>
          ))}
        </div>
        <Campo valor={num} onCambio={setNum} ph="Número del 0 al 36" />
        <div className="btns uno">
          <Accion ruta="/api/casino/ruleta" campos={{ monto, apuesta: num }}>Apostar al número x{d.ruleta.numero}</Accion>
        </div>
      </Sec>
    </>
  );
}
