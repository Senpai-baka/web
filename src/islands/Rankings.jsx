import React, { useEffect, useState } from 'react';
import { fmt } from '../lib/format.js';
import { api } from '../lib/api.js';
import { verJugador } from '../bridge/acciones.js';
import { Sec, Vacio, Countdown, Kv, Avatar, plural } from './ui.jsx';

const OPCIONES = [
  ['monedas', 'Monedas'],
  ['xp', 'XP semanal'],
  ['temporada', 'Temporada'],
  ['clanes', 'Clanes'],
  ['mazmorra', 'Mazmorras'],
  ['guerra', 'Guerra']
];

const corto = n => new Intl.NumberFormat('es-MX', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const PARTES = [
  ['arena', 'Arena', 'a'],
  ['constelaciones', 'Constelaciones', 'c'],
  ['riqueza', 'Riqueza', 'r']
];

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

function Pin() {
  return (
    <svg className="rk-pin" viewBox="0 0 24 24" role="img" aria-label="Top 1 de la semana pasada">
      <title>Top 1 de la semana pasada</title>
      <path d="M9 3 H15 L14 9 L18 13 H13 V21 L12 22 L11 21 V13 H6 L10 9 Z" fill="currentColor" />
    </svg>
  );
}

function Nombre({ e }) {
  return (
    <strong className="rk-n">
      <span>{e.nombre}</span>
      {e.yo && <em>tú</em>}
      {e.mio && <em>tu clan</em>}
      {e.pin && <Pin />}
    </strong>
  );
}

function abrir(e) {
  if (!e.pid) return {};
  const ir = () => verJugador(e.pid);
  return { role: 'button', tabIndex: 0, onClick: ir, onKeyDown: ev => { if (ev.key === 'Enter') ir(); } };
}

function Podio({ lista }) {
  const orden = [lista[1], lista[0], lista[2]].filter(Boolean);
  return (
    <ol className="rk-podio" data-n={orden.length}>
      {orden.map(e => (
        <li key={e.pos} className={'rk-p rk-p' + e.pos + (e.yo || e.mio ? ' yo' : '')}>
          <div className="rk-p-quien" {...abrir(e)}>
            <Avatar r={e} />
            <Nombre e={e} />
            <b className="rk-p-v">{e.corto}</b>
            {e.premio && <span className="rk-p-pr">{e.premio}</span>}
          </div>
          <div className="rk-plinto" aria-label={'Puesto ' + e.pos}><span>{e.pos}</span></div>
        </li>
      ))}
    </ol>
  );
}

function Marea({ lista, max }) {
  return (
    <ol className="rk-lista">
      {lista.map(e => {
        const partes = e.partes;
        return (
          <li key={e.pos} className={'rk-f' + (e.yo || e.mio ? ' yo' : '')} {...abrir(e)}>
            <span className="rk-pos">{e.pos}</span>
            <Avatar r={e} />
            <div className="rk-f-t">
              <Nombre e={e} />
              {e.extra && <span className="rk-ex">{e.extra}</span>}
              <span className="rk-barra" aria-hidden="true">
                {partes
                  ? partes.map(([k, v]) => <i key={k} className={'rk-s-' + k} style={{ width: (max ? v / max * 100 : 0) + '%' }} />)
                  : <i className="rk-s-v" style={{ width: (max ? Math.max(2, e.valor / max * 100) : 0) + '%' }} />}
              </span>
            </div>
            <b className="rk-v">{e.texto}</b>
          </li>
        );
      })}
    </ol>
  );
}

function Posicion({ mia, lista, unidad, sujeto }) {
  if (!mia) {
    return (
      <div className="rk-yo vacia">
        <div className="rk-yo-n"><span>—</span></div>
        <p>{sujeto === 'clan' ? 'Tu clan aún no aparece en esta lista.' : 'Aún no apareces en esta lista.'}</p>
      </div>
    );
  }
  const i = lista.findIndex(e => e.pos === mia.pos);
  const delante = i > 0 ? lista[i - 1] : null;
  const detras = i >= 0 && i < lista.length - 1 ? lista[i + 1] : null;
  let frase;
  if (i < 0) frase = 'Estás fuera del top ' + lista.length + '.';
  else if (delante) frase = <>Te faltan <b>{fmt(Math.max(0, delante.valor - mia.valor))}</b> {unidad} para alcanzar a <b>{delante.nombre}</b>.</>;
  else if (detras) frase = <>Vas primero, con <b>{fmt(Math.max(0, mia.valor - detras.valor))}</b> {unidad} de ventaja sobre <b>{detras.nombre}</b>.</>;
  else frase = 'Vas primero.';
  return (
    <div className="rk-yo">
      <div className="rk-yo-n"><small>Puesto</small><span>{mia.pos}</span></div>
      <p>{frase}</p>
    </div>
  );
}

function Leyenda({ hayPin }) {
  if (!hayPin) return null;
  return (
    <ul className="rk-ley">
      {hayPin && <li><Pin />Top 1 de la semana pasada</li>}
    </ul>
  );
}

function Pie({ children }) {
  return children ? <p className="rk-pie">{children}</p> : null;
}

function Cuerpo({ info, k }) {
  const { lista, vacio, max } = info;
  if (!lista.length) return <Vacio>{vacio}</Vacio>;
  const resto = lista.slice(3);
  return (
    <div key={k} className="rk-cuerpo">
      <Podio lista={lista.slice(0, 3)} />
      {resto.length > 0 && <Marea lista={resto} max={max} />}
    </div>
  );
}

function infoTemporada(est) {
  const t = est.datos;
  if (!t) return { cargando: true, error: est.error, lista: [], vacio: '', max: 0 };
  const lista = t.top.map(r => ({
    ...r,
    valor: r.total,
    texto: fmt(r.total) + ' pts',
    corto: corto(r.total) + ' pts',
    partes: PARTES.map(([k]) => [k, r[k]]),
    premio: null
  }));
  t.premios.slice(0, 3).forEach((p, i) => { if (lista[i]) lista[i].premio = t.emojiEsencia + ' ' + fmt(p.esencia); });
  return {
    t,
    lista,
    vacio: 'Todavía nadie tiene puntos.',
    max: Math.max(1, ...lista.slice(3).map(e => e.valor)),
    mia: t.mio.puesto ? { pos: t.mio.puesto, valor: t.mio.total } : null,
    unidad: 'puntos',
    partes: true
  };
}

function Reglas({ t }) {
  const R = t.reglas;
  const principales = t.premios.slice(0, 3);
  const resto = t.premios.slice(3);
  return (
    <>
      <Sec k="rk-reglas" titulo="Cómo sumar puntos" extra="" abierta={false}>
        <div className="bloque vidrio">
          <Kv k="⚔️ Arena" v={`${R.arena.victoria} victoria · ${R.arena.empate} empate · ${R.arena.derrota} derrota`} />
          <Kv k="🌌 Constelaciones" v={`${R.constelacion.porNivel} por nivel · ${R.constelacion.completa} por serie completa`} />
          <Kv k="💰 Riqueza" v={`1 por cada ${fmt(R.riqueza.porPunto)} (máx. ${R.riqueza.tope})`} />
        </div>
      </Sec>
      <Sec k="rk-premios" titulo="Premios de la temporada" extra="" abierta={false}>
        <div className="bloque vidrio">
          {principales.map(p => (
            <div className="fila peq" key={p.pos}>
              <strong>Puesto {p.pos}</strong>
              <span>{t.emojiEsencia} {fmt(p.esencia)}{p.titulo ? ` y el título ${p.titulo.nombre}` : ''}</span>
            </div>
          ))}
          {resto.length > 0 && (
            <div className="fila peq">
              <strong>Puestos 4 a {3 + resto.length}</strong>
              <span>{t.emojiEsencia} {fmt(resto[0].esencia)} cada uno</span>
            </div>
          )}
        </div>
      </Sec>
    </>
  );
}

function Resumen({ t }) {
  const m = t.mio;
  const total = Math.max(1, m.total);
  return (
    <div className="rk-mix">
      <p className="rk-mix-t">Tus <b>{fmt(m.total)}</b> puntos vienen de:</p>
      <div className="rk-mix-b" aria-hidden="true">
        {PARTES.map(([k]) => <i key={k} className={'rk-s-' + k} style={{ width: m[k] / total * 100 + '%' }} />)}
      </div>
      <ul>
        {PARTES.map(([k, n]) => <li key={k}><i className={'rk-s-' + k} /><span>{n}</span><b>{fmt(m[k])}</b></li>)}
      </ul>
    </div>
  );
}

export default function Rankings({ d, base }) {
  const [sel, setSel] = useState('monedas');
  const [tier, setTier] = useState(null);
  const est = useTemporada(sel === 'temporada', d);
  const g = d.guerra;
  const mz = d.mazmorras || [];
  const actual = mz.find(x => x.clave === tier) || mz[0] || null;
  const hayPin = !!d.pinTop && d.monedas.some(r => r.pin);

  const adaptar = (lista, texto, cortoFn, premios, extra) => lista.map((r, i) => ({
    ...r,
    texto: texto(r),
    corto: cortoFn(r),
    extra: extra ? extra(r) : null,
    premio: premios && premios[i] != null ? corto(premios[i]) : null
  }));
  const tope = lista => Math.max(1, ...lista.slice(3).map(e => e.valor));

  let info;
  let contexto;
  let pie = null;
  let cabeza = null;

  if (sel === 'monedas') {
    const lista = adaptar(d.monedas, r => fmt(r.valor), r => corto(r.valor));
    info = { lista, vacio: 'Aún no hay datos.', max: tope(lista), mia: lista.find(r => r.yo), unidad: 'monedas' };
    contexto = 'Quién tiene más monedas en la cartera ahora mismo.';
  } else if (sel === 'xp') {
    const lista = adaptar(d.xpSemana, r => fmt(r.valor) + ' XP', r => corto(r.valor) + ' XP', d.premiosXp);
    info = { lista, vacio: 'Nadie ha sumado XP esta semana.', max: tope(lista), mia: lista.find(r => r.yo), unidad: 'XP' };
    contexto = <>Se reinicia en <Countdown fin={base + d.cierraXpS * 1000} />. Los tres primeros cobran premio.</>;
  } else if (sel === 'temporada') {
    info = infoTemporada(est);
    const t = info.t;
    contexto = t ? <>Temporada {t.n}, termina en <Countdown fin={est.t + t.restanteS * 1000} />. Al cerrar solo se reinician los puntos.</> : 'Puntos por arena, constelaciones y riqueza.';
    cabeza = t ? <Resumen t={t} /> : null;
    if (t && t.anterior && t.anterior.ganadores.length > 0) {
      pie = <>Ganaron la temporada {t.anterior.temporada}: {t.anterior.ganadores.map(x => x.nombre + ' (' + fmt(x.puntos) + ' pts)').join(', ')}.</>;
    }
  } else if (sel === 'clanes') {
    const lista = adaptar(d.clanes.map(c => ({ ...c, valor: c.banco })), r => fmt(r.valor), r => corto(r.valor), null, r => `Nivel ${r.nivel}, ${plural(r.miembros)}`);
    info = { lista, vacio: 'Aún no hay clanes.', max: tope(lista), mia: lista.find(r => r.mio), unidad: 'monedas', sujeto: 'clan' };
    contexto = 'Los clanes con más monedas en su banco.';
  } else if (sel === 'mazmorra') {
    if (!actual) {
      info = { lista: [], vacio: 'No hay mazmorras disponibles.', max: 0 };
    } else {
      const lista = adaptar(actual.ranking, r => 'Piso ' + fmt(r.valor), r => 'Piso ' + fmt(r.valor));
      info = { lista, vacio: 'Nadie ha registrado un piso aquí todavía.', max: tope(lista), mia: lista.find(r => r.yo), unidad: 'pisos' };
    }
    contexto = actual
      ? `Niveles ${actual.nivelMax == null ? actual.nivelMin + ' en adelante' : actual.nivelMin + ' a ' + actual.nivelMax}. Gana el piso más alto; si empatan, quien llegó primero.${actual.mio > 0 ? ' Tu récord es el piso ' + fmt(actual.mio) + '.' : ''}`
      : '';
  } else if (!g) {
    info = { lista: [], vacio: 'La guerra de clanes no está disponible.', max: 0 };
    contexto = '';
  } else {
    const lista = adaptar(g.ranking.map(c => ({ ...c, valor: c.pts })), r => fmt(r.valor) + ' pts', r => corto(r.valor) + ' pts', g.premios, r => plural(r.miembros));
    const mia = g.mio ? (lista.find(r => r.mio) || { pos: g.mio.puesto, valor: g.mio.pts }) : null;
    info = { lista, vacio: 'Todavía nadie ha puntuado esta semana.', max: tope(lista), mia, unidad: 'puntos', sujeto: 'clan' };
    contexto = <>Semana {g.semana}, cierra en <Countdown fin={base + g.cierraS * 1000} />. El premio va al banco del clan y se necesitan {g.minPuntos} puntos.</>;
    if (g.ultima && g.ultima.ranking.length > 0) pie = <>Semana {g.ultima.semana}: ganó {g.ultima.ranking.slice(0, 3).map(r => r.nombre).join(', ')}.</>;
    if (!g.mio) pie = <>{pie} Suma puntos para tu clan minando, talando y pescando.</>;
  }

  const cargando = info.cargando;
  const estructura = sel === 'temporada';

  return (
    <div className="rk">
      <header className="rk-cab">
        <h1 className="pag">Rankings</h1>
        {contexto ? <p>{contexto}</p> : null}
      </header>

      <div className="rk-tabs" role="group" aria-label="Tipo de ranking">
        {OPCIONES.map(([k, n]) => (
          <button key={k} type="button" aria-pressed={k === sel} onClick={() => setSel(k)}>{n}</button>
        ))}
      </div>

      {sel === 'mazmorra' && mz.length > 0 && (
        <div className="rk-chips" role="group" aria-label="Mazmorra">
          {mz.map(x => (
            <button key={x.clave} type="button" aria-pressed={actual && x.clave === actual.clave} onClick={() => setTier(x.clave)}>
              <span aria-hidden="true">{x.emoji}</span> {x.nombre}
            </button>
          ))}
        </div>
      )}

      {cargando ? <Vacio>{info.error || 'Cargando la temporada…'}</Vacio> : (
        <>
          {info.lista.length > 0 && <Posicion mia={info.mia} lista={info.lista} unidad={info.unidad} sujeto={info.sujeto} />}
          {cabeza}
          <Cuerpo info={info} k={sel + (actual ? actual.clave : '')} />
          {info.lista.length > 0 && <Leyenda hayPin={sel === 'monedas' && hayPin} />}
          {estructura && info.t && <Reglas t={info.t} />}
          <Pie>{pie}</Pie>
        </>
      )}
    </div>
  );
}
