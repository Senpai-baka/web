// Pestaña Rankings: port de pintarRankings() + filaRanking() de public/js/app.js.
import React, { useState } from 'react';
import { fmt } from '../lib/format.js';
import { useMe } from '../bridge/store.js';
import { Cab, Seg, Vacio, Countdown, Fila, Kv, filas, plural, premios, medalla } from './ui.jsx';

const OPCIONES = [['monedas', 'Monedas'], ['xp', 'XP semanal'], ['clanes', 'Clanes'], ['guerra', 'Guerra']];

const ICONO = (
  <>
    <path d="M8 21 H16 M12 17 V21" />
    <path d="M7 4 H17 V10 A5 5 0 0 1 7 10 Z" />
    <path d="M7 6 H4 V8 A3 3 0 0 0 7 11 M17 6 H20 V8 A3 3 0 0 1 17 11" />
  </>
);

export default function Rankings({ d, base }) {
  const me = useMe();
  const [sel, setSel] = useState('monedas');
  const g = d.guerra;

  let cuerpo;
  if (sel === 'monedas') {
    cuerpo = filas(d.monedas, 'Aún no hay datos.', (r, i) => <Fila key={i} r={r} valor={fmt(r.valor)} />);
  } else if (sel === 'xp') {
    cuerpo = (
      <>
        <p className="mut peq" style={{ marginTop: 12 }}>
          Se reinicia en <Countdown fin={base + d.cierraXpS * 1000} />. Premios: {premios(d.premiosXp)}
        </p>
        {filas(d.xpSemana, 'Nadie ha sumado XP esta semana.', (r, i) => <Fila key={i} r={r} valor={fmt(r.valor) + ' XP'} />)}
      </>
    );
  } else if (sel === 'clanes') {
    cuerpo = filas(d.clanes, 'Aún no hay clanes.', (c, i) => (
      <Fila key={i} r={c} extra={`Nv ${c.nivel} · ${plural(c.miembros)}`} valor={fmt(c.banco)} />
    ));
  } else if (!g) {
    cuerpo = <Vacio>La guerra de clanes no está disponible.</Vacio>;
  } else {
    cuerpo = (
      <>
        <p className="mut peq" style={{ marginTop: 12 }}>
          Semana {g.semana} · cierra en <Countdown fin={base + g.cierraS * 1000} /><br />
          Premios al banco del clan: {premios(g.premios)} (mínimo {g.minPuntos} pts)
        </p>
        {g.mio
          ? <div className="bloque vidrio"><Kv k="Tu clan" v={g.mio.nombre} /><Kv k="Puesto" v={'#' + g.mio.puesto} /><Kv k="Puntos" v={fmt(g.mio.pts)} /></div>
          : <div className="aviso-i">Suma puntos para tu clan minando, talando y pescando.</div>}
        {filas(g.ranking, 'Todavía nadie ha puntuado esta semana.', (c, i) => (
          <Fila key={i} r={c} extra={plural(c.miembros)} valor={fmt(c.pts) + ' pts'} />
        ))}
        {g.ultima && g.ultima.ranking.length > 0 && (
          <p className="mut peq" style={{ marginTop: 16 }}>
            Semana anterior ({g.ultima.semana}): {g.ultima.ranking.map((r, i) => medalla(i) + ' ' + r.nombre).join(' · ')}
          </p>
        )}
      </>
    );
  }

  const lista = (sel === 'monedas' ? d.monedas : sel === 'xp' ? d.xpSemana : sel === 'clanes' ? d.clanes : g && g.ranking) || [];
  const mia = sel === 'guerra'
    ? (g && g.mio ? { pos: g.mio.puesto } : null)
    : lista.find(r => r.yo || r.mio);
  const stats = [['Tu puesto', mia ? '#' + mia.pos : '—'], ['En la lista', lista.length], ['Nivel', me ? me.nivel : '—']];

  return (
    <>
      <Cab titulo="Rankings" sub="Compara tu progreso con el resto de la isla." icono={ICONO} stats={stats} />
      <Seg aria="Tipo de ranking" opciones={OPCIONES} valor={sel} onCambio={setSel} />
      <div className="lista">{cuerpo}</div>
    </>
  );
}
