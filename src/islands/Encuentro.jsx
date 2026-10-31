import React from 'react';
import { fmt } from '../lib/format.js';
import { Cab, Cifras, Countdown, Accion, BotonListo, Titulo, Vacio } from './ui.jsx';

const ICONO = (
  <>
    <path d="M12 3 L14.5 9.5 L21 12 L14.5 14.5 L12 21 L9.5 14.5 L3 12 L9.5 9.5Z" />
  </>
);

const RIESGO = { bajo: 'Seguro', medio: 'Arriesgado', alto: 'Muy arriesgado' };

function Escenario({ a, base }) {
  return (
    <>
      <div className="bloque vidrio">
        <div className="fila">
          <strong>{a.emoji} {a.titulo}</strong>
          <span className="mut peq">{a.zona}</span>
        </div>
        <p className="peq">{a.texto}</p>
        <div className="fila peq">
          <span className="mut">Se pierde en</span>
          <Countdown fin={base + a.expiraMs} />
        </div>
      </div>
      <Titulo>¿Qué haces?</Titulo>
      {a.opciones.map(o => (
        <div className="bloque vidrio" key={o.id}>
          <div className="fila">
            <strong>{o.emoji} {o.etiqueta}</strong>
            <span className={'etiq' + (o.riesgo === 'bajo' ? '' : ' nar')}>{RIESGO[o.riesgo] || o.riesgo}</span>
          </div>
          <div className="fila peq">
            <span className="mut">Depende de tu {o.stat}</span>
            <span><b>{o.prob}%</b> de éxito</span>
          </div>
          <div className="btns uno">
            <Accion ruta="/api/encuentro/elegir" cuerpo={{ opcion: o.id }}>Elegir</Accion>
          </div>
        </div>
      ))}
    </>
  );
}

function Camino({ d, base }) {
  return (
    <div className="bloque vidrio">
      <strong>El camino está tranquilo</strong>
      <p className="mut peq">
        {d.listo
          ? 'Sal a explorar: algo se cruzará en tu camino y tendrás que decidir.'
          : 'Aún no hay nada nuevo en el camino. Vuelve en un rato.'}
      </p>
      <div className="btns uno">
        <BotonListo ruta="/api/encuentro/iniciar" txt="Salir a explorar" fin={base + d.esperaS * 1000} />
      </div>
    </div>
  );
}

export default function Encuentro({ d, base }) {
  return (
    <>
      <Cab
        atras
        titulo="Encuentros"
        sub="Decisiones en el camino: acierta y cobra monedas, XP y materiales."
        icono={ICONO}
        stats={[['Monedas', fmt(d.cartera)], ['Aciertos', fmt(d.aciertos)], ['Racha', fmt(d.seguidos)]]}
      />
      {d.activo ? <Escenario a={d.activo} base={base} /> : <Camino d={d} base={base} />}
      {d.total === 0 && !d.activo && <Vacio>Todavía no has vivido ningún encuentro.</Vacio>}
      <Cifras lista={[
        ['Encuentros', fmt(d.total)],
        ['Aciertos', d.total ? Math.round(d.aciertos / d.total * 100) + '%' : '—'],
        ['Mejor racha', fmt(d.mejor)],
        ['Recompensa x', d.escala]
      ]} />
    </>
  );
}
