import React, { useState } from 'react';
import { fmt } from '../lib/format.js';
import { Cab, Cifras, Countdown, Accion, Barra, Campo, Fila, Titulo, Vacio, filas, medalla } from './ui.jsx';

const ICONO = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12 H21" />
    <path d="M12 3 C8 7 8 17 12 21 C16 17 16 7 12 3Z" />
  </>
);

const ACTIVIDAD = { minar: 'Minar', talar: 'Talar', pescar: 'Pescar', hunt: 'Cazar', work: 'Trabajar' };

const cofresTxt = lista => lista.map(c => `${c.emoji} ${c.nombre} x${c.cantidad}`).join(' · ');
const premioTxt = p => [`🪙 ${fmt(p.monedas)}`, cofresTxt(p.cofres)].filter(Boolean).join(' · ');

function Tema({ d, base }) {
  return (
    <div className="bloque vidrio">
      <div className="fila">
        <strong>{d.tema.emoji} {d.tema.nombre}</strong>
        {d.activo
          ? <span className="mut peq">Termina en <Countdown fin={base + d.terminaS * 1000} /></span>
          : <span className="etiq nar">Terminado</span>}
      </div>
      <p className="mut peq">{d.tema.desc}</p>
      <Barra valor={d.total} max={d.meta} />
      <div className="fila peq">
        <span>{fmt(d.total)} / {fmt(d.meta)}</span>
        <span className="mut">{d.pct}%{d.completo ? ' · ¡Meta lograda!' : ''}</span>
      </div>
    </div>
  );
}

function Descanso({ d, base }) {
  return (
    <div className="bloque vidrio">
      <strong>No hay un evento activo</strong>
      <p className="peq">El próximo empieza en <Countdown fin={base + d.proximoS * 1000} />.</p>
    </div>
  );
}

function Hitos({ d }) {
  const y = d.yo;
  const motivo = y.porReclamar || y.anteriorPendiente ? ''
    : !y.puntos ? 'Aún no participaste en este evento.'
      : !y.cumpleMinimo ? `Necesitas al menos ${fmt(d.minimo)} puntos para reclamar (llevas ${fmt(y.puntos)}).`
        : 'Aún no hay premios nuevos por reclamar.';
  return (
    <>
      <Titulo>Hitos de la comunidad</Titulo>
      {d.hitos.map(h => (
        <div className="bloque vidrio" key={h.pct}>
          <div className="fila">
            <strong>{h.pct}% de la meta</strong>
            <span className={'etiq' + (h.alcanzado ? '' : ' nar')}>
              {h.reclamado ? '✅ Reclamado' : h.alcanzado ? '🎁 Disponible' : '🔒 Pendiente'}
            </span>
          </div>
          <p className="mut peq">{premioTxt(h)}</p>
        </div>
      ))}
      <div className="btns uno">
        <Accion ruta="/api/mundial/reclamar" motivo={motivo}>
          Reclamar premios{y.porReclamar > 1 ? ` (${y.porReclamar})` : ''}
        </Accion>
      </div>
      {y.anteriorPendiente && <p className="mut peq">Tienes premios pendientes de un evento anterior.</p>}
    </>
  );
}

function Aportar({ d }) {
  const [cantidad, setCantidad] = useState('');
  const y = d.yo;
  const tienen = d.materiales.filter(m => m.tengo > 0);
  const tope = !d.activo ? 'No hay un evento activo.' : y.restanteManual <= 0 ? 'Llegaste al tope diario de aportes.' : '';
  return (
    <>
      <Titulo extra={<span className="mut peq">Hoy quedan {fmt(Math.max(0, y.restanteManual))} pts</span>}>Aportar materiales</Titulo>
      <p className="mut peq">Cada material suma puntos a la meta común. Los favoritos del evento valen el doble.</p>
      <Campo valor={cantidad} onCambio={setCantidad} ph="Cantidad (vacío = 1)" corto />
      {tienen.length
        ? tienen.map(m => (
          <div className="bloque vidrio" key={m.clave}>
            <div className="fila">
              <strong>{m.emoji} {m.nombre}</strong>
              <span className="mut peq">Tienes {fmt(m.tengo)}</span>
            </div>
            <div className="fila peq">
              <span className="mut">{fmt(m.puntos)} pts c/u</span>
              {m.favorito && <span className="etiq">⭐ Favorito x2</span>}
            </div>
            <div className="btns">
              <Accion ruta="/api/mundial/aportar" cuerpo={{ material: m.clave, cantidad: Number(cantidad) > 0 ? Number(cantidad) : 1 }} motivo={tope}>Aportar</Accion>
              <Accion ruta="/api/mundial/aportar" cuerpo={{ material: m.clave, cantidad: 'todo' }} motivo={tope}>Todo</Accion>
            </div>
          </div>
        ))
        : <Vacio>No tienes materiales para aportar.</Vacio>}
    </>
  );
}

function Podio({ d }) {
  return (
    <>
      <Titulo>Premios del top</Titulo>
      <div className="bloque vidrio">
        {d.podio.map(p => (
          <div className="fila peq" key={p.puesto}>
            <strong>{medalla(p.puesto - 1)}</strong>
            <span>{premioTxt(p)}</span>
          </div>
        ))}
      </div>
      <Titulo>Ranking del evento</Titulo>
      <div className="lista">
        {filas(d.ranking, 'Todavía nadie ha aportado.', r => <Fila key={r.pos} r={r} avatar valor={`${fmt(r.puntos)} pts`} />)}
      </div>
    </>
  );
}

export default function Mundial({ d, base }) {
  const y = d.yo;
  return (
    <>
      <Cab
        atras
        titulo="Evento global"
        sub="Todos aportan a una meta común y se reparten premios."
        icono={ICONO}
        stats={[['Mis puntos', fmt(y.puntos)], ['Puesto', y.puesto ? '#' + y.puesto : '—'], ['Progreso', d.pct + '%']]}
      />
      <Tema d={d} base={base} />
      {!d.activo && <Descanso d={d} base={base} />}
      <Cifras lista={[
        ['Tope diario', fmt(d.topes.manual)],
        ['Mínimo para premio', fmt(d.minimo)],
        ...d.actividades.map(a => [ACTIVIDAD[a.clave] || a.clave, '+' + a.puntos])
      ]} />
      <Hitos d={d} />
      {d.activo && <Aportar d={d} />}
      <Podio d={d} />
    </>
  );
}
