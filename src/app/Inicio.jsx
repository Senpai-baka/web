import React, { useEffect, useRef, useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { ACC, ICONOS, ICONO_EXTRA, IC_STAT, NAV, ARTE, escena } from '../core/datos.js';
import { useEstado } from '../core/estado.js';
import { useAhora } from '../core/reloj.js';
import { useMe } from '../bridge/store.js';
import { abrir, irGacha } from '../core/navegar.js';
import { jugar, tiempo } from '../core/acciones.js';
import { estadoEventos } from '../core/eventos.js';
import Svg from './Svg.jsx';
import { Ava } from './Foto.jsx';

const ESCENA = escena('h');
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function restaMin(s) {
  const m = Math.max(1, Math.ceil(s / 60));
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? h + ' h ' + r + ' min' : h + ' h';
}

function Monedas({ valor }) {
  const [mostrado, setMostrado] = useState(valor);
  const [fx, setFx] = useState({ dir: '', n: 0 });
  const previo = useRef(null);
  useEffect(() => {
    const desde = previo.current;
    previo.current = valor;
    if (desde === null || desde === valor || reducir) {
      setMostrado(valor);
      return undefined;
    }
    let vivo = true;
    const t0 = performance.now();
    setFx(f => ({ dir: valor > desde ? 'sube' : 'baja', n: f.n + 1 }));
    const paso = t => {
      if (!vivo) return;
      const p = Math.min(1, (t - t0) / 700);
      const ease = 1 - Math.pow(1 - p, 3);
      setMostrado(Math.round(desde + (valor - desde) * ease));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    return () => { vivo = false; };
  }, [valor]);
  return (
    <div className={'bolsa ' + fx.dir} key={fx.n} title="Monedas">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7 C15 9 15 13 12 17 C9 13 9 9 12 7Z" />
      </svg>
      <span id="monedas">{fmt(mostrado)}</span>
    </div>
  );
}

function Hero({ me }) {
  const lluvia = me.clima && /lluv|torment/i.test(me.clima.nombre);
  return (
    <section className="hero" aria-label="Tu resumen">
      <div className="escena" id="esc-hero"><Svg html={ESCENA} /></div>
      <div className="lluvia" id="lluvia" hidden={!lluvia} />
      <div className="hero-in">
        <div id="hero-ava"><Ava me={me} t={84} nv /></div>
        <div className="quien">
          <h1 id="alias">{me.alias}</h1>
          <span className="peq mut" id="nivel">Nivel {me.nivel}</span>
          <div className="xpb"><div id="xpbar" style={{ width: Math.min(100, me.xp / me.xpSig * 100) + '%' }} /></div>
          <span className="peq mut" id="xp">{fmt(me.xp)} / {fmt(me.xpSig)} XP</span>
        </div>
        <Monedas valor={me.monedas} />
      </div>
    </section>
  );
}

function Hud({ me }) {
  const s = me.stats;
  if (!s) return <div className="hud vidrio" id="hud" hidden />;
  const chip = (k, n) => <div className="chip-s" title={n}><Svg html={IC_STAT[k]} /><b>{s[k]}</b><span>{n}</span></div>;
  return (
    <div className="hud vidrio" id="hud">
      {me.clase && <div className="clase-b"><span>{me.clase.emoji}</span>{me.clase.nombre}</div>}
      {chip('fuerza', 'Fuerza')}
      {chip('vigor', 'Vigor')}
      {chip('suerte', 'Suerte')}
      {me.prestigio ? <span className="estrella" title="Prestigio">{'★'.repeat(Math.min(me.prestigio, 10))}</span> : null}
      {me.energia && (
        <div className="en">
          <span className="pips">
            {Array.from({ length: me.energia.n }, (_, i) => <i key={'o' + i} className="pip on" />)}
            {Array.from({ length: Math.max(0, me.energia.max - me.energia.n) }, (_, i) => <i key={'f' + i} className="pip" />)}
          </span>
          <span className="mut peq">Energía</span>
        </div>
      )}
    </div>
  );
}

function EventoX2({ me, meT, ahora }) {
  const ev = me.evento;
  const vence = ev && ev.activo && ev.restaS > 0 ? meT + ev.restaS * 1000 : 0;
  const visible = vence > ahora;
  return (
    <div className="evento-x2 vidrio" id="evento-x2" hidden={!visible}>
      <div>
        <strong>🎉 Evento <span id="ev-mult">x{ev ? ev.mult : 2}</span> acaba en <span id="ev-resta">{visible ? restaMin((vence - ahora) / 1000) : ''}</span></strong>
        <p className="mut peq">Tus monedas valen el doble al cazar, recolectar y cobrar recompensas.</p>
      </div>
    </div>
  );
}

function Clima({ me, meT, ahora, listas }) {
  const c = me.clima;
  return (
    <div className="resumen">
      <div className="clima vidrio" id="clima-card">
        <span className="em" id="cc-em" aria-hidden="true">{c ? c.emoji : ''}</span>
        <div>
          <strong id="cc-nom">{c ? c.nombre + (c.raro ? ' · raro' : '') : ''}</strong>
          <p className="mut peq" id="cc-desc">{c ? c.desc : ''}</p>
          <p className="peq">Cambia en <b id="cc-resta">{c ? dur((meT + c.faltaS * 1000 - ahora) / 1000) : ''}</b>, luego <span id="cc-sig">{c ? c.siguiente.emoji + ' ' + c.siguiente.nombre : ''}</span></p>
        </div>
      </div>
      <div className="vidrio listas-t"><b>{listas}</b><span>Listas ahora</span><i>Actividades disponibles</i></div>
    </div>
  );
}

function Aro({ k, icono, prog, tot, rest, lista }) {
  return (
    <div className="aro" style={prog ? undefined : { color: 'var(--z)' }}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="pista" cx="32" cy="32" r="29" />
        {prog && <circle className="prog" id={'r-' + k} cx="32" cy="32" r="29" style={{ strokeDashoffset: lista ? 182 : Math.round(182 * rest / tot) }} />}
      </svg>
      <Svg html={icono} />
    </div>
  );
}

function Mult({ k, mult }) {
  const m = mult ? mult[k] : undefined;
  if (m === undefined || m === null) return <span id={'m-' + k} />;
  return <span id={'m-' + k}><span className={'mx ' + (m > 1 ? 'up' : m < 1 ? 'down' : '')}>x{Number(m).toFixed(2)}</span></span>;
}

function Tarjeta({ k, a, st, tot, mult, ancha }) {
  const aro = <Aro k={k} icono={ICONOS[a.ic]} prog tot={tot} rest={st.rest} lista={st.lista} />;
  const est = <p className="est"><i /><span id={'t-' + k}>{st.lista ? 'Listo' : tiempo(st.rest)}</span></p>;
  const boton = (
    <button className="accion" type="button" data-a={k} aria-disabled={String(!st.lista)} onClick={() => jugar(k)}>
      {st.lista ? a.n : 'En espera'}
    </button>
  );
  if (a.g === 'c') {
    return (
      <div className={'ticket' + (st.lista ? '' : ' espera')} id={'c-' + k} style={{ '--z': a.z }}>
        {aro}
        <div className="tx"><h3>{a.t}</h3>{est}<Mult k={k} mult={mult} /><p className="mut peq">{a.d}</p></div>
        {boton}
      </div>
    );
  }
  return (
    <div className={'zona' + (st.lista ? '' : ' espera') + (ancha ? ' ancha' : '')} id={'c-' + k} style={{ '--z': a.z }}>
      <div className="arte"><Svg html={ARTE[k]} /><span className="zn">{a.l}</span>{aro}</div>
      <div className="zc">{est}<Mult k={k} mult={mult} />{boton}</div>
    </div>
  );
}

const TILES = [
  { k: 'raid', z: '#c9626f', t: 'Raid', d: 'Jefe mundial del grupo: todos atacan juntos y se reparten el botín.', b: 'Ver jefes', i: ICONOS.raid },
  { k: 'gacha', z: '#b69be0', t: 'Gacha', d: 'Invoca y colecciona personajes de anime.', b: 'Invocar', i: ICONOS.gacha },
  { k: 'mazmorra', z: '#9fb4c8', t: 'Mazmorra', d: 'Baja piso a piso, enfrenta jefes y consigue equipo.', b: 'Entrar', i: ICONOS.hunt },
  { k: 'sala', z: '#d6a76a', t: 'Sala', d: 'Mazmorra en equipo, de 2 a 5 jugadores.', b: 'Jugar en equipo', i: ICONO_EXTRA.sala },
  { k: 'encargos', z: '#8fc4ad', t: 'Encargos', d: 'Entrega materiales al pueblo y cobra monedas, XP y un cofre.', b: 'Ver encargos', i: ICONO_EXTRA.encargos },
  { k: 'clan', z: '#e0b96a', t: 'Clan', d: 'Funda o únete a un clan, comparte banco y gana guerras.', b: 'Ver clan', i: ICONOS.clan },
  { k: 'encuentro', z: '#e8a58e', t: 'Encuentros', d: 'Algo se cruza en tu camino: decide bien y cobra premios.', b: 'Explorar', i: ICONOS.gacha },
  { k: 'alquimia', z: '#8fc4ad', t: 'Alquimia', d: 'Prepara elixires y objetos en tus calderos.', b: 'Ir al laboratorio', i: ICONOS.alquimia },
  { k: 'mundial', z: '#8fb4d6', t: 'Evento global', d: 'Aporta materiales a la meta común y gana cofres.', b: 'Participar', i: ICONOS.mundial }
];

function Tile({ x, ev }) {
  let desc = x.d;
  let boton = x.b;
  let espera = false;
  let ir = () => abrir(x.k);
  if (x.k === 'raid') {
    ir = () => abrir('raid', true);
    if (ev.raid) {
      boton = ev.raid.n === 0 ? 'Ver jefes' : ev.raid.rest === 0 ? 'Atacar' : dur(ev.raid.rest);
      espera = !ev.raid.lista;
    }
  }
  if (x.k === 'gacha') {
    ir = irGacha;
    const g = ev.gacha;
    if (g) {
      const ab = g.ab;
      desc = g.pend ? 'Tienes una carta esperando. ¡Reclámala!' : ab.length ? ab[0].por + ' invocó a ' + ab[0].carta.nombre + '. ¡Reclámala!' : g.trato ? 'Te propusieron un cambio de cartas.' : x.d;
      boton = g.pend || ab.length ? 'Reclamar' : g.trato ? 'Ver trato' : g.rest === 0 ? 'Invocar' : dur(g.rest);
      espera = !g.lista;
    }
  }
  return (
    <div className={'ticket evento' + (espera ? ' espera' : '')} id={'c-' + x.k} style={{ '--z': x.z }}>
      <Aro icono={x.i} />
      <div className="tx"><h3>{x.t}</h3><p className="mut peq" id={x.k === 'raid' ? 'p-raid' : x.k === 'gacha' ? 'p-gacha' : undefined}>{desc}</p></div>
      <button className="accion" type="button" id={x.k === 'raid' ? 'b-raid' : x.k === 'gacha' ? 'b-gacha' : undefined} onClick={ir}>{boton}</button>
    </div>
  );
}

const ATAJOS = [
  { k: 'inventario', z: '#c3bbdc', t: 'Mochila', s: 'Objetos, equipo y materiales', i: NAV[1][2] },
  { k: 'tienda', z: '#e8946a', t: 'Tienda', s: 'Compra, mercado y subastas', i: NAV[2][2] },
  { k: 'hogar', z: '#8fc4ad', t: 'Mundo', s: 'Mascota y granja', i: NAV[3][2] },
  { k: 'ciudad', z: '#8fb4d6', t: 'Ciudad', s: 'Banco, negocios y casino', i: NAV[4][2] },
  { k: 'rankings', z: '#e0b96a', t: 'Ranking', s: 'Mira quién va primero', i: NAV[5][2] },
  { k: 'ficha', z: '#b69be0', t: 'Perfil', s: 'Tu ficha, héroe e historial', i: ICONO_EXTRA.perfil }
];

export function calcularListas(ahora, tot, fin) {
  const est = {};
  let listas = 0;
  for (const k in ACC) {
    if (tot[k] === undefined) continue;
    const rest = Math.max(0, Math.ceil((fin[k] - ahora) / 1000));
    est[k] = { rest, lista: rest === 0 };
    if (rest === 0) listas++;
  }
  const ev = estadoEventos(ahora);
  return { est, ev, listas: listas + ev.listas };
}

export default function Inicio() {
  const me = useMe();
  const ahora = useAhora();
  const meT = useEstado(s => s.meT);
  const tot = useEstado(s => s.tot);
  const fin = useEstado(s => s.fin);
  useEstado(s => s.eventos);
  useEstado(s => s.abiertas);
  const { est, ev, listas } = calcularListas(ahora, tot, fin);

  if (!me) return null;

  const visibles = Object.keys(ACC).filter(k => ACC[k].g === 'r' && est[k]);
  const ultima = visibles.length % 2 ? visibles[visibles.length - 1] : null;
  const mult = me.clima ? me.clima.mult : {};
  const tarjeta = k => <Tarjeta key={k} k={k} a={ACC[k]} st={est[k]} tot={tot[k]} mult={mult} ancha={k === ultima} />;

  return (
    <>
      <Hero me={me} />
      <Hud me={me} />
      <EventoX2 me={me} meT={meT} ahora={ahora} />
      <Clima me={me} meT={meT} ahora={ahora} listas={listas} />
      <div className="grupo"><h2>Recolectar</h2><span className="mut peq">Cada actividad tiene su espera</span></div>
      <div className="rejilla" id="rejilla">{visibles.map(tarjeta)}</div>
      <div className="grupo"><h2>Recompensas</h2><span className="mut peq">Una vez cada cierto tiempo</span></div>
      <div id="recompensas">{Object.keys(ACC).filter(k => ACC[k].g === 'c' && est[k]).map(tarjeta)}</div>
      <div className="grupo"><h2>Eventos</h2><span className="mut peq">Jefes, gacha, mazmorra y clan</span></div>
      <div className="eventos">{TILES.map(x => <Tile key={x.k} x={x} ev={ev} />)}</div>
      <div className="grupo"><h2>Explorar</h2><span className="mut peq">Todo el panel a un toque</span></div>
      <div className="atajos">
        {ATAJOS.map(a => (
          <button key={a.k} type="button" className="atajo vidrio" style={{ '--z': a.z }} onClick={() => abrir(a.k)}>
            <span className="at-i" aria-hidden="true"><Svg html={a.i} /></span>
            <span className="at-t"><b>{a.t}</b><small>{a.s}</small></span>
          </button>
        ))}
      </div>
    </>
  );
}
