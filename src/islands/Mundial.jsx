import React, { useState } from 'react';
import { fmt } from '../lib/format.js';
import { Countdown, Accion, Barra, Campo, Fila, Titulo, Vacio, filas, medalla } from './ui.jsx';
import { Emo } from './Icono.jsx';
import Cabeza from './Cabeza.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="mu-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0f1a2e" />
        <stop offset="1" stopColor="#1b2c48" />
      </linearGradient>
      <radialGradient id="mu-globo" cx=".35" cy=".3" r=".8">
        <stop offset="0" stopColor="#8fc4e8" />
        <stop offset="1" stopColor="#2c4f7c" />
      </radialGradient>
    </defs>
    <rect width="400" height="110" fill="url(#mu-fondo)" />
    <g fill="#f4efff">
      <circle cx="40" cy="22" r="1.5" /><circle cx="96" cy="48" r="1" /><circle cx="150" cy="16" r="1.4" />
      <circle cx="262" cy="20" r="1.2" /><circle cx="330" cy="46" r="1.6" /><circle cx="372" cy="18" r="1" />
    </g>
    <g className="mu-orbita">
      <ellipse cx="200" cy="82" rx="150" ry="22" fill="none" stroke="#8fc4e8" strokeOpacity=".4" strokeWidth="1.5" strokeDasharray="4 6" />
      <circle cx="350" cy="82" r="5" fill="#f0d39a" />
    </g>
    <circle cx="200" cy="82" r="46" fill="url(#mu-globo)" />
    <g fill="#91d6bd" fillOpacity=".75">
      <path d="M170 66 C176 58 190 60 196 66 C198 74 188 78 182 86 C174 82 166 74 170 66Z" />
      <path d="M212 76 C222 70 234 74 236 84 C232 92 220 94 214 88 C210 84 210 80 212 76Z" />
    </g>
    <path d="M154 90 C180 100 220 100 246 90 L246 110 L154 110Z" fill="#0f1a2e" opacity=".5" />
  </svg>
);

const ACTIVIDAD = { minar: 'Minar', talar: 'Talar', pescar: 'Pescar', hunt: 'Cazar', work: 'Trabajar' };

const premioTxt = p => (
  <>
    {`🪙 ${fmt(p.monedas)}`}
    {(p.cofres || []).map(c => (
      <React.Fragment key={c.clave || c.nombre}>{' · '}<Emo clave={'cofre_' + c.clave} nombre={c.nombre} emoji={c.emoji} /> {c.nombre} x{c.cantidad}</React.Fragment>
    ))}
  </>
);

function Tema({ d, base }) {
  return (
    <div className="bloque vidrio mu-tema">
      <div className="fila">
        <strong>{d.tema.emoji} {d.tema.nombre}</strong>
        {d.activo
          ? <span className="mu-cierra">Termina en <Countdown fin={base + d.terminaS * 1000} /></span>
          : <span className="etiq nar">Terminado</span>}
      </div>
      <p className="mut peq">{d.tema.desc}</p>
      <div className="mu-meta">
        <b>{d.pct}%</b>
        <span>{fmt(d.total)} de {fmt(d.meta)}{d.completo ? ' · Meta lograda' : ''}</span>
      </div>
      <div className="mu-pista">
        <Barra valor={d.total} max={d.meta} />
        {d.hitos.map(h => <i key={h.pct} className={h.alcanzado ? 'on' : ''} style={{ left: h.pct + '%' }} />)}
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
      <div className="mu-hitos">
        {d.hitos.map(h => (
          <div className={'mu-hito' + (h.reclamado ? ' rec' : h.alcanzado ? ' lis' : '')} key={h.pct}>
            <b>{h.pct}%</b>
            <span className="mu-estado">{h.reclamado ? 'Reclamado' : h.alcanzado ? 'Disponible' : 'Pendiente'}</span>
            <small>{premioTxt(h)}</small>
          </div>
        ))}
      </div>
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
              <strong><Emo o={m} /> {m.nombre}</strong>
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
      <div className="bloque vidrio mu-podio">
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
    <div className="lg mu">
      <Cabeza
        titulo="Evento global"
        sub="Todos aportan a una meta común y se reparten premios."
        arte={ARTE}
        cifras={[['Mis puntos', fmt(y.puntos)], ['Puesto', y.puesto ? '#' + y.puesto : '—'], ['Progreso', d.pct + '%']]}
      />
      <Tema d={d} base={base} />
      {!d.activo && <Descanso d={d} base={base} />}
      <dl className="mu-reglas">
        <div><dt>Tope diario</dt><dd>{fmt(d.topes.manual)}</dd></div>
        <div><dt>Mínimo para premio</dt><dd>{fmt(d.minimo)}</dd></div>
        {d.actividades.map(a => <div key={a.clave}><dt>{ACTIVIDAD[a.clave] || a.clave}</dt><dd>+{a.puntos}</dd></div>)}
      </dl>
      <Hitos d={d} />
      {d.activo && <Aportar d={d} />}
      <Podio d={d} />
    </div>
  );
}
