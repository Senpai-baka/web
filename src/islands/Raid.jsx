import React from 'react';
import { fmt, dur } from '../lib/format.js';
import { Cifras, Countdown, BotonListo, Vacio, Titulo, Fila, medalla } from './ui.jsx';
import Cabeza from './Cabeza.jsx';
import ArteJefe, { coloresJefe } from './ArteJefe.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="rd-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1f1018" />
        <stop offset="1" stopColor="#2a1620" />
      </linearGradient>
      <radialGradient id="rd-ojo" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#ff6b7c" stopOpacity=".55" />
        <stop offset="1" stopColor="#ff6b7c" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="110" fill="url(#rd-fondo)" />
    <circle className="rd-luna" cx="200" cy="52" r="68" fill="url(#rd-ojo)" />
    <circle cx="200" cy="52" r="30" fill="#0e0810" />
    <circle cx="200" cy="52" r="30" fill="none" stroke="#ff8a98" strokeOpacity=".7" strokeWidth="2" />
    <path d="M150 110 L162 70 L176 92 L188 62 L200 96 L212 62 L224 92 L238 70 L250 110Z" fill="#0e0810" />
    <g fill="#0e0810">
      <path d="M0 110 V84 L24 70 L46 88 L70 66 L96 90 L120 80 V110Z" />
      <path d="M400 110 V82 L376 68 L354 86 L330 64 L304 88 L280 78 V110Z" />
    </g>
  </svg>
);

function Top({ lista }) {
  return (
    <div className="rd-top">
      <h4>Top atacantes</h4>
      {lista.map((t, i) => (
        <div key={i} className={`fil ${t.yo ? 'yo' : ''}`}>
          <span className="pos">{medalla(t.pos - 1)}</span>
          <div className="nom"><strong>{t.nombre}</strong></div>
          <span className="val">{fmt(t.daño)}</span>
        </div>
      ))}
    </div>
  );
}

function Tarjeta({ r, base }) {
  const pct = Math.round(r.hp / r.hpMax * 100);
  const [c1, c2] = coloresJefe(r.nombre);
  const top = r.top || [];
  return (
    <div className="vidrio rd" style={{ '--c1': c1, '--c2': c2 }}>
      <div className="rd-arena"><ArteJefe nombre={r.nombre} /><span className="zn">{r.grupo}</span></div>
      <div className="rd-in">
        <div className="rd-cab">
          <h3>{r.nombre}</h3>
          <span className="rd-t">Se retira en <Countdown fin={base + r.restaS * 1000} /></span>
        </div>
        <div className="rd-vida">
          <div className={`rd-hp ${pct < 30 ? 'bajo' : ''}`}><i style={{ width: pct + '%' }} /></div>
          <div className="fila">
            <span className="mut">Vida</span>
            <span><b>{fmt(r.hp)}</b>/{fmt(r.hpMax)} · {pct}%</span>
          </div>
        </div>
        <Cifras lista={[['Atacantes', fmt(r.atacantes)], ['Tu daño', fmt(r.miDaño)], ['Tu puesto', r.miPos ? '#' + r.miPos : '—']]} />
        <p className="rd-bote">
          <span>🎁</span>
          <span>Bote de <b>{fmt(r.bote || 0)}</b> repartido según el daño, más bonos al que más daño haga y al golpe final.</span>
        </p>
        {top.length > 0 && <Top lista={top} />}
        <div className="btns uno">
          <BotonListo ruta="/api/raid/atacar" cuerpo={{ id: r.id }} txt="⚔️ Atacar" fin={base + r.esperaS * 1000} bloq={r.dormido ? 'Grupo en modo nocturno' : ''} />
        </div>
      </div>
    </div>
  );
}

function TopMundial({ lista }) {
  return (
    <div className="rd-top">
      <h4>Top de daño</h4>
      {lista.map(r => <Fila key={r.pos} r={r} avatar extra={fmt(r.golpes) + (r.golpes === 1 ? ' ataque' : ' ataques')} valor={fmt(r.dano)} />)}
    </div>
  );
}

function Mundial({ j, base }) {
  if (j.fase !== 'activo') {
    return (
      <div className="bloque vidrio">
        {j.fase === 'derrotado' && <strong>🏆 {j.nombre} ya fue derrotado</strong>}
        {j.fase === 'descanso' && <strong>🌙 La isla está tranquila por ahora</strong>}
        <p className="peq">El siguiente, <b>{j.siguiente}</b>, llega en <Countdown fin={base + j.proximoS * 1000} />.</p>
      </div>
    );
  }
  const pct = Math.round(j.hp / j.hpMax * 100);
  const [c1, c2] = coloresJefe(j.nombre);
  return (
    <div className="vidrio rd" style={{ '--c1': c1, '--c2': c2 }}>
      <div className="rd-arena"><ArteJefe nombre={j.nombre} /><span className="zn">Todos los grupos</span></div>
      <div className="rd-in">
        <div className="rd-cab">
          <h3>{j.nombre}</h3>
          <span className="rd-t">Se retira en <Countdown fin={base + j.restaS * 1000} /></span>
        </div>
        <div className="rd-vida">
          <div className={`rd-hp ${pct < 30 ? 'bajo' : ''}`}><i style={{ width: pct + '%' }} /></div>
          <div className="fila">
            <span className="mut">Vida</span>
            <span><b>{fmt(j.hp)}</b>/{fmt(j.hpMax)} · {pct}%</span>
          </div>
        </div>
        <Cifras lista={[['Atacantes', fmt(j.atacantes)], ['Tu daño', fmt(j.miDano)], ['Tu puesto', j.miPos ? '#' + j.miPos : '—']]} />
        <p className="rd-bote">
          <span>🎁</span>
          <span>Bote de <b>{fmt(j.bote)}</b> repartido según el daño, con bonos de {fmt(j.bonoMvp)} al que más daño haga y {fmt(j.bonoUltimo)} al golpe final, además de cofres, objetos y equipo exclusivo para los mejores. Si se retira sin caer, todos reciben un premio de consuelo.</span>
        </p>
        {j.top.length > 0 && <TopMundial lista={j.top} />}
        <div className="btns uno">
          <BotonListo ruta="/api/raid/atacar" cuerpo={{ id: 'mundial' }} txt="⚔️ Atacar" fin={base + j.esperaS * 1000} />
        </div>
      </div>
    </div>
  );
}

function Cuerpo({ d, base }) {
  const grupos = d.conectado === false
    ? <div className="bloque vidrio"><p className="mut peq">El bot está reconectando. Inténtalo en unos segundos.</p></div>
    : (
      <>
        <p className="mut peq rd-intro">
          Todos atacan juntos y se reparten el botín según el daño. Puedes golpear cada {dur(d.cooldownS)}. Los admins invocan al jefe en WhatsApp con /raid start.
        </p>
        {d.raids.length
          ? d.raids.map(r => <Tarjeta key={r.id} r={r} base={base} />)
          : <Vacio>Ningún grupo tuyo tiene un jefe ahora mismo.</Vacio>}
      </>
    );
  return (
    <>
      {d.jefe && (
        <>
          <Titulo extra={<span className="mut peq">Golpea cada {dur(d.jefe.cooldownS)}</span>}>Jefe mundial</Titulo>
          <Mundial j={d.jefe} base={base} />
          <Titulo>Jefes de tus grupos</Titulo>
        </>
      )}
      {grupos}
    </>
  );
}

export default function Raid({ d, base }) {
  return (
    <div className="lg rd-pg">
      <Cabeza
        titulo="Raid"
        sub="El jefe mundial y los jefes de tus grupos."
        arte={ARTE}
        cifras={[['Jefe mundial', d.jefe ? (d.jefe.fase === 'activo' ? 'En pie' : 'Descanso') : '—'], ['Grupos con jefe', d.raids ? d.raids.length : 0], ['Golpe cada', dur(d.cooldownS)]]}
      />
      <Cuerpo d={d} base={base} />
    </div>
  );
}
