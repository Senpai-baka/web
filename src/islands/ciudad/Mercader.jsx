import React from 'react';
import { fmt } from '../../lib/format.js';
import { Sec, Vacio, Countdown, Accion, Slot } from '../ui.jsx';
import { NEUTRO, ORO, AZUL } from '../rareza.js';
import { Seccion, Grupo } from './comun.jsx';

const TIPO = { mat: ['Material', NEUTRO], cofre: ['Cofre', ORO], item: ['Objeto', AZUL] };
const emojiDe = nombre => (String(nombre || '').match(/^\S+/) || ['📦'])[0];
const sinEmoji = nombre => String(nombre || '').replace(/^\S+\s*/, '');

function Resumen({ d }) {
  const c = d.clima;
  return (
    <div className="bloque vidrio">
      <div className="ci-fila">
        <div>
          <span className="ci-et">Tu cartera</span>
          <span className="ci-num oro">{fmt(d.cartera)}</span>
        </div>
        {c ? <div className="ci-lado">Clima<b>{c.emoji} {c.nombre}</b></div> : null}
      </div>
    </div>
  );
}

function Estado({ d, base }) {
  if (d.estado === 'ninguna') {
    return <Vacio>El mercader no tiene visitas programadas por ahora. Vuelve más tarde.</Vacio>;
  }
  if (d.estado === 'espera') {
    return (
      <div className="ci-g">
        <div className="ci-listo espera">
          <span>El mercader llega en <Countdown fin={base + d.faltaS * 1000} />. Se queda 3 horas.</span>
        </div>
      </div>
    );
  }
  return (
    <div className="ci-g">
      <div className="ci-listo">
        <span>El mercader está aquí. Se va en <Countdown fin={base + d.restaS * 1000} />.</span>
      </div>
    </div>
  );
}

function Oferta({ o, cartera }) {
  const [tipo, color] = TIPO[o.tipo] || TIPO.item;
  const motivo = o.comprada
    ? 'Ya le compraste esa oferta en esta visita.'
    : cartera < o.precio && 'No te alcanza con la cartera.';
  return (
    <div className="ci-fil">
      <Slot emoji={emojiDe(o.nombre)} color={o.comprada ? NEUTRO : color} />
      <div className="info">
        <strong>{sinEmoji(o.nombre)}</strong>
        <span className="mut peq">{tipo}{o.comprada ? ' · Comprada' : ''}</span>
      </div>
      <Accion cls={o.comprada ? undefined : 'pri'} ruta="/api/mercader/comprar" cuerpo={{ id: o.id }} motivo={motivo}>
        {o.comprada ? 'Comprada' : <>Comprar<small>{fmt(o.precio)}</small></>}
      </Accion>
    </div>
  );
}

function Demanda({ m }) {
  const n = Math.max(0, Math.min(m.tengo, m.cupo));
  const motivo = m.cupo < 1
    ? 'Ya te compró el máximo de este material en esta visita.'
    : m.tengo < 1 && `No tienes ${m.nombre}.`;
  return (
    <div className="ci-fil">
      <Slot emoji={m.emoji} cantidad={m.tengo} color={m.tengo > 0 ? ORO : NEUTRO} falta={m.tengo < 1} />
      <div className="info">
        <strong>{m.nombre}</strong>
        <span className="mut peq">Paga {fmt(m.precio)} c/u · Cupo {fmt(Math.max(0, m.cupo))}</span>
      </div>
      <Accion cls="pri" ruta="/api/mercader/vender" cuerpo={{ clave: m.clave, cantidad: n || 1 }} motivo={motivo}>
        Vender{n > 0 ? ' ' + fmt(n) : ''}<small>{n > 0 ? '+' + fmt(n * m.precio) : fmt(m.precio)}</small>
      </Accion>
    </div>
  );
}

export default function Mercader({ d, base }) {
  const activa = d.estado === 'activa';
  const ofertas = activa ? d.ofertas || [] : [];
  const demanda = activa ? d.demanda || [] : [];
  const vendible = demanda.filter(m => m.tengo > 0 && m.cupo > 0);
  const total = vendible.reduce((s, m) => s + Math.min(m.tengo, m.cupo) * m.precio, 0);
  return (
    <Seccion>
      <Resumen d={d} />
      <Estado d={d} base={base} />
      {activa && (
        <>
          <Grupo titulo="Ofertas" extra="Una compra por oferta">
            <div className="bloque vidrio ci-lista">
              {ofertas.length ? ofertas.map(o => <Oferta key={o.id} o={o} cartera={d.cartera} />) : <Vacio>No trae nada ahora.</Vacio>}
            </div>
          </Grupo>
          <Grupo titulo="Qué busca" extra={'Tope ' + fmt(d.topeVenta) + ' por material'}>
            <div className="bloque vidrio ci-lista">
              {demanda.length ? demanda.map(m => <Demanda key={m.clave} m={m} />) : <Vacio>No busca nada ahora.</Vacio>}
            </div>
            <div className="btns uno">
              <Accion cls="pri" ruta="/api/mercader/vender_todo" motivo={vendible.length < 1 && 'No tienes nada de lo que busca, o ya alcanzaste el máximo.'}>
                Vender todo lo que busca{total > 0 ? ' · ' + fmt(total) : ''}
              </Accion>
            </div>
          </Grupo>
        </>
      )}
      <Sec k="mercader-reglas" titulo="Cómo funciona" extra="Visitas y precios" abierta={false}>
        <p className="mut peq">
          El mercader pasa a veces, según el clima, y se queda 3 horas. Cada oferta se compra una sola vez por visita.
        </p>
        <p className="mut peq" style={{ marginTop: 8 }}>
          Paga más que el mercado por los materiales que busca, hasta {fmt(d.topeVenta)} de cada uno por visita. Lo que ofrece depende del clima: con clima raro trae cofre de oro.
        </p>
      </Sec>
    </Seccion>
  );
}
