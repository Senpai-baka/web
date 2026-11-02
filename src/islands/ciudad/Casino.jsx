import React, { useState } from 'react';
import { fmt } from '../../lib/format.js';
import { Campo, Accion } from '../ui.jsx';
import { Seccion, Grupo } from './comun.jsx';

const COLORES = ['rojo', 'negro', 'verde', 'par', 'impar'];
const cap = k => k[0].toUpperCase() + k.slice(1);

function Apuesta({ d, monto, setMonto }) {
  const atajos = [['Mínimo', d.min], ['x10', Math.min(d.max, d.min * 10)], ['x50', Math.min(d.max, d.min * 50)], ['Máximo', d.max]]
    .filter(([, v], i, l) => l.findIndex(([, w]) => w === v) === i);
  return (
    <Grupo titulo="Tu apuesta" extra={'Cartera ' + fmt(d.cartera)}>
      <div className="bloque vidrio ci-mesa">
        <Campo valor={monto} onCambio={setMonto} ph={'Apuesta (' + fmt(d.min) + ' a ' + fmt(d.max) + ')'} />
        <div className="filtros" role="group" aria-label="Apuesta rápida">
          {atajos.map(([nombre, v]) => (
            <button key={nombre} type="button" className="fch" aria-pressed={String(v) === String(monto)} onClick={() => setMonto(String(v))}>{nombre}</button>
          ))}
        </div>
        <span className="ci-pie">De {fmt(d.min)} a {fmt(d.max)} · La casa siempre gana a la larga. Juega con lo que puedas perder.</span>
      </div>
    </Grupo>
  );
}

export default function Casino({ d }) {
  const [monto, setMonto] = useState(String(d.min));
  const [num, setNum] = useState('');
  const camp = { monto };
  const mejorPago = Math.max(d.par, ...d.tragamonedas.map(s => s.x));
  const pagoMoneda = Math.round(d.moneda.pago * 100);
  return (
    <Seccion>
      <Apuesta d={d} monto={monto} setMonto={setMonto} />
      <Grupo titulo="Juegos">
        <div className="bloque vidrio">
          <div className="ci-juego"><h3>Tragamonedas</h3><span className="ci-pago">Hasta x{mejorPago}</span></div>
          <span className="mut peq">{d.tragamonedas.map(s => s.emoji + ' x' + s.x).join(' · ')} · pareja x{d.par}</span>
          <Accion cls="pri" ruta="/api/casino/tragamonedas" campos={camp}>Girar</Accion>
        </div>
        <div className="bloque vidrio">
          <div className="ci-juego"><h3>Cara o cruz</h3><span className="ci-pago">Paga {pagoMoneda}%</span></div>
          <div className="btns">
            <Accion ruta="/api/casino/moneda" cuerpo={{ lado: 'cara' }} campos={camp}>Cara</Accion>
            <Accion ruta="/api/casino/moneda" cuerpo={{ lado: 'cruz' }} campos={camp}>Cruz</Accion>
          </div>
        </div>
        <div className="bloque vidrio">
          <div className="ci-juego"><h3>Ruleta</h3><span className="ci-pago">Número x{d.ruleta.numero}</span></div>
          <div className="ci-pills">
            {COLORES.map(k => (
              <Accion key={k} ruta="/api/casino/ruleta" cuerpo={{ apuesta: k }} campos={camp}>
                <i className={'pt ' + k} aria-hidden="true" />{cap(k)} <b>x{d.ruleta.colores[k]}</b>
              </Accion>
            ))}
          </div>
          <div className="ci-apnum">
            <Campo valor={num} onCambio={setNum} ph="0 a 36" />
            <Accion ruta="/api/casino/ruleta" campos={{ monto, apuesta: num }}>Apostar al número</Accion>
          </div>
        </div>
      </Grupo>
    </Seccion>
  );
}
