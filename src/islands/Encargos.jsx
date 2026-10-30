import React from 'react';
import { fmt } from '../lib/format.js';
import { Cab, Cifras, Countdown, Accion, Barra, Titulo, Vacio } from './ui.jsx';

const ICONO = (
  <>
    <path d="M3 8 L12 3 L21 8 V17 L12 22 L3 17 Z" />
    <path d="M3 8 L12 13 L21 8" />
    <path d="M12 13 V22" />
  </>
);

const motivoDe = x => {
  if (x.hecho) return 'Ya entregaste este encargo hoy.';
  if (!x.puede) return `Te faltan ${fmt(x.cantidad - x.tengo)} ${x.nombre}.`;
  return '';
};

function Encargo({ x }) {
  return (
    <div className="bloque vidrio">
      <div className="fila">
        <strong>{x.emoji} {x.nombre} x{fmt(x.cantidad)}</strong>
        {x.urgente && !x.hecho && <span className="etiq nar">⚡ Urgente</span>}
        {x.hecho && <span className="etiq">✅ Entregado</span>}
      </div>
      <Barra valor={Math.min(x.tengo, x.cantidad)} max={x.cantidad} />
      <div className="fila peq">
        <span>{fmt(Math.min(x.tengo, x.cantidad))} / {fmt(x.cantidad)}</span>
        <span className="mut">🪙 {fmt(x.monedas)} · ✨ {fmt(x.xp)} XP</span>
      </div>
      <div className="btns uno">
        <Accion ruta="/api/encargos/entregar" cuerpo={{ cual: x.idx }} motivo={motivoDe(x)}>
          {x.hecho ? 'Entregado' : 'Entregar'}
        </Accion>
      </div>
    </div>
  );
}

function Resumen({ d, base }) {
  const bono = d.bonoRacha ? ` (+${d.bonoRacha}% de monedas)` : '';
  const rachaTxt = d.racha
    ? `Llevas ${fmt(d.racha)} día${d.racha === 1 ? '' : 's'} de racha${bono}.`
    : 'Completa los encargos de hoy para empezar una racha.';
  return (
    <div className="bloque vidrio">
      <div className="fila">
        <strong>Se renuevan en</strong>
        <Countdown fin={base + d.renuevaS * 1000} />
      </div>
      <p className="mut peq">{rachaTxt}</p>
      <p className="mut peq">
        {d.completoHoy
          ? `Hoy completaste todos y recibiste ${d.cofre.emoji} ${d.cofre.nombre}.`
          : `Al completar los ${d.total} recibes ${d.cofre.emoji} ${d.cofre.nombre}.`}
      </p>
    </div>
  );
}

export default function Encargos({ d, base }) {
  const pendientes = d.lista.filter(x => !x.hecho);
  const listos = pendientes.filter(x => x.puede);
  const motivoTodo = !pendientes.length
    ? 'Ya entregaste todos los encargos de hoy.'
    : !listos.length ? 'No tienes materiales para ningún encargo.' : '';
  return (
    <>
      <Cab
        atras
        titulo="Encargos"
        sub="Entrega materiales al pueblo y cobra monedas, XP y un cofre."
        icono={ICONO}
        stats={[['Monedas', fmt(d.cartera)], ['Racha', fmt(d.racha)], ['Hoy', `${d.hechos}/${d.total}`]]}
      />
      <Resumen d={d} base={base} />
      <Titulo>Encargos de hoy</Titulo>
      {d.lista.length ? d.lista.map(x => <Encargo key={x.idx} x={x} />) : <Vacio>Hoy no hay encargos disponibles.</Vacio>}
      {d.lista.length > 1 && (
        <div className="btns uno">
          <Accion ruta="/api/encargos/entregar" cuerpo={{ cual: 'todo' }} motivo={motivoTodo}>
            Entregar todo{listos.length > 1 ? ` (${listos.length})` : ''}
          </Accion>
        </div>
      )}
      <Cifras lista={[['Días completos', fmt(d.completos)], ['Bono máximo a los', `${d.rachaMax} días`]]} />
    </>
  );
}
