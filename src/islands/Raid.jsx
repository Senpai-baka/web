import React from 'react';
import { fmt, dur } from '../lib/format.js';
import { Cab, Cifras, Countdown, BotonListo, Vacio, medalla } from './ui.jsx';
import ArteJefe, { coloresJefe } from './ArteJefe.jsx';

const ICONO = (
  <>
    <path d="M4 4 L15 15" /><path d="M13 17 L17 13" /><path d="M16 16 L20 20" />
    <path d="M20 4 L9 15" /><path d="M11 17 L7 13" /><path d="M8 16 L4 20" />
  </>
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

function Cuerpo({ d, base }) {
  if (d.conectado === false) {
    return <div className="bloque vidrio"><p className="mut peq">El bot está reconectando. Inténtalo en unos segundos.</p></div>;
  }
  return (
    <>
      <p className="mut peq rd-intro">
        Todos atacan juntos y se reparten el botín según el daño. Puedes golpear cada {dur(d.cooldownS)}. Los admins invocan al jefe en WhatsApp con /raid start.
      </p>
      {d.raids.length
        ? d.raids.map(r => <Tarjeta key={r.id} r={r} base={base} />)
        : <Vacio>Ningún grupo tuyo tiene un jefe ahora mismo.</Vacio>}
    </>
  );
}

export default function Raid({ d, base }) {
  return (
    <>
      <Cab atras titulo="Raid" sub="Jefes mundiales de tus grupos." icono={ICONO} />
      <Cuerpo d={d} base={base} />
    </>
  );
}
