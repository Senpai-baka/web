import React, { useEffect, useState } from 'react';
import { fmt } from '../lib/format.js';
import { api } from '../lib/api.js';
import { useMe } from '../bridge/store.js';
import { Cab, Seg, Vacio, Countdown, Fila, Kv, Titulo, filas, plural, premios, medalla } from './ui.jsx';

const OPCIONES = [['monedas', 'Monedas'], ['xp', 'XP semanal'], ['temporada', 'Temporada'], ['clanes', 'Clanes'], ['mazmorra', 'Mazmorras'], ['guerra', 'Guerra']];

const ICONO = (
  <>
    <path d="M8 21 H16 M12 17 V21" />
    <path d="M7 4 H17 V10 A5 5 0 0 1 7 10 Z" />
    <path d="M7 6 H4 V8 A3 3 0 0 0 7 11 M17 6 H20 V8 A3 3 0 0 1 17 11" />
  </>
);

function useTemporada(activo, d) {
  const [est, setEst] = useState({ datos: null, t: 0, error: '' });
  useEffect(() => {
    if (!activo) return undefined;
    let vivo = true;
    api('/api/temporada')
      .then(datos => { if (vivo) setEst({ datos, t: Date.now(), error: '' }); })
      .catch(e => { if (vivo) setEst(s => ({ ...s, error: s.datos ? '' : e.message })); });
    return () => { vivo = false; };
  }, [activo, d]);
  return est;
}

function Temporada({ est }) {
  const { datos: t, t: base, error } = est;
  if (!t) return <Vacio>{error || 'Cargando la temporada…'}</Vacio>;
  const R = t.reglas;
  const m = t.mio;
  const principales = t.premios.slice(0, 3);
  const resto = t.premios.slice(3);
  return (
    <>
      <p className="mut peq" style={{ marginTop: 12 }}>
        Temporada {t.n} · termina en <Countdown fin={base + t.restanteS * 1000} />. Al cerrar se reinician solo los puntos.
      </p>
      <div className="bloque vidrio">
        <Kv k="Tus puntos" v={fmt(m.total)} />
        <Kv k="⚔️ Arena" v={fmt(m.arena)} />
        <Kv k="🌌 Constelaciones" v={fmt(m.constelaciones)} />
        <Kv k="💰 Riqueza" v={fmt(m.riqueza)} />
      </div>
      <Titulo>Cómo sumar puntos</Titulo>
      <div className="bloque vidrio">
        <Kv k="⚔️ Arena" v={`${R.arena.victoria} victoria · ${R.arena.empate} empate · ${R.arena.derrota} derrota`} />
        <Kv k="🌌 Constelaciones" v={`${R.constelacion.porNivel} por nivel · ${R.constelacion.completa} por serie completa`} />
        <Kv k="💰 Riqueza" v={`1 por cada ${fmt(R.riqueza.porPunto)} (máx. ${R.riqueza.tope})`} />
      </div>
      <Titulo>Premios</Titulo>
      <div className="bloque vidrio">
        {principales.map(p => (
          <div className="fila peq" key={p.pos}>
            <strong>{medalla(p.pos - 1)}</strong>
            <span>{t.emojiEsencia} {fmt(p.esencia)}{p.titulo ? ` + título ${p.titulo.nombre}` : ''}</span>
          </div>
        ))}
        {resto.length > 0 && (
          <div className="fila peq">
            <strong>4–{3 + resto.length}</strong>
            <span>{t.emojiEsencia} {fmt(resto[0].esencia)} c/u</span>
          </div>
        )}
      </div>
      <Titulo>Top de la temporada</Titulo>
      {filas(t.top, 'Todavía nadie tiene puntos.', r => (
        <Fila
          key={r.pos}
          r={r}
          avatar
          extra={`⚔️ ${fmt(r.arena)} · 🌌 ${fmt(r.constelaciones)} · 💰 ${fmt(r.riqueza)}`}
          valor={fmt(r.total) + ' pts'}
        />
      ))}
      {t.anterior && t.anterior.ganadores.length > 0 && (
        <p className="mut peq" style={{ marginTop: 16 }}>
          Temporada {t.anterior.temporada}: {t.anterior.ganadores.map((g, i) => medalla(i) + ' ' + g.nombre + ' (' + fmt(g.puntos) + ' pts)').join(' · ')}
        </p>
      )}
    </>
  );
}

export default function Rankings({ d, base }) {
  const me = useMe();
  const [sel, setSel] = useState('monedas');
  const [tier, setTier] = useState(null);
  const est = useTemporada(sel === 'temporada', d);
  const g = d.guerra;
  const mz = d.mazmorras || [];
  const actual = mz.find(x => x.clave === tier) || mz[0] || null;
  const hayPin = !!d.pinTop && d.monedas.some(r => r.pin);

  let cuerpo;
  if (sel === 'monedas') {
    cuerpo = (
      <>
        {hayPin && <p className="mut peq" style={{ marginTop: 12 }}>📌 Top 1 de la semana pasada.</p>}
        {filas(d.monedas, 'Aún no hay datos.', (r, i) => <Fila key={i} r={r} avatar valor={fmt(r.valor)} />)}
      </>
    );
  } else if (sel === 'xp') {
    cuerpo = (
      <>
        <p className="mut peq" style={{ marginTop: 12 }}>
          Se reinicia en <Countdown fin={base + d.cierraXpS * 1000} />. Premios: {premios(d.premiosXp)}
        </p>
        {filas(d.xpSemana, 'Nadie ha sumado XP esta semana.', (r, i) => <Fila key={i} r={r} avatar valor={fmt(r.valor) + ' XP'} />)}
      </>
    );
  } else if (sel === 'temporada') {
    cuerpo = <Temporada est={est} />;
  } else if (sel === 'clanes') {
    cuerpo = filas(d.clanes, 'Aún no hay clanes.', (c, i) => (
      <Fila key={i} r={c} extra={`Nv ${c.nivel} · ${plural(c.miembros)}`} valor={fmt(c.banco)} />
    ));
  } else if (sel === 'mazmorra') {
    cuerpo = !actual ? <Vacio>No hay mazmorras disponibles.</Vacio> : (
      <>
        <Seg aria="Mazmorra" opciones={mz.map(x => [x.clave, x.emoji + ' ' + x.nombre])} valor={actual.clave} onCambio={setTier} />
        <p className="mut peq" style={{ marginTop: 12 }}>
          Niveles {actual.nivelMax == null ? actual.nivelMin + '+' : actual.nivelMin + ' a ' + actual.nivelMax}. Gana quien llegó al piso más alto; si empatan, quien lo logró primero.
          {actual.mio > 0 ? ' Tu récord: piso ' + fmt(actual.mio) + '.' : ''}
        </p>
        {filas(actual.ranking, 'Nadie ha registrado un piso aquí todavía.', (r, i) => <Fila key={i} r={r} avatar valor={'Piso ' + fmt(r.valor)} />)}
      </>
    );
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

  const tt = est.datos;
  const lista = (sel === 'monedas' ? d.monedas : sel === 'xp' ? d.xpSemana : sel === 'temporada' ? (tt ? tt.top : []) : sel === 'clanes' ? d.clanes : sel === 'mazmorra' ? (actual ? actual.ranking : []) : g && g.ranking) || [];
  const mia = sel === 'guerra'
    ? (g && g.mio ? { pos: g.mio.puesto } : null)
    : sel === 'temporada'
      ? (tt && tt.mio.puesto ? { pos: tt.mio.puesto } : null)
      : lista.find(r => r.yo || r.mio);
  const stats = sel === 'temporada'
    ? [['Tu puesto', mia ? '#' + mia.pos : '—'], ['Tus puntos', tt ? fmt(tt.mio.total) : '—'], ['Nivel', me ? me.nivel : '—']]
    : [['Tu puesto', mia ? '#' + mia.pos : '—'], ['En la lista', lista.length], ['Nivel', me ? me.nivel : '—']];

  return (
    <>
      <Cab titulo="Rankings" sub="Compara tu progreso con el resto de la isla." icono={ICONO} stats={stats} />
      <Seg aria="Tipo de ranking" opciones={OPCIONES} valor={sel} onCambio={setSel} />
      <div className="lista">{cuerpo}</div>
    </>
  );
}
