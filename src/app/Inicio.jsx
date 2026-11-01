import React, { memo, useEffect, useRef, useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { ACC, ICONOS, ICONO_EXTRA, IC_STAT, escena } from '../core/datos.js';
import { e, useEstado } from '../core/estado.js';
import { useDeAhora } from '../core/reloj.js';
import { useMe } from '../bridge/store.js';
import { abrir, irGacha } from '../core/navegar.js';
import { jugar, tiempo } from '../core/acciones.js';
import { estadoEventos } from '../core/eventos.js';
import Svg from './Svg.jsx';
import { Ava } from './Foto.jsx';
import Decor from './Decor.jsx';

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

const Hero = memo(function Hero({ me }) {
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
});

const Hud = memo(function Hud({ me }) {
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
});

function EventoX2({ me, meT }) {
  const ev = me.evento;
  const vence = ev && ev.activo && ev.restaS > 0 ? meT + ev.restaS * 1000 : 0;
  const resta = useDeAhora(ahora => (vence > ahora ? restaMin((vence - ahora) / 1000) : ''));
  return (
    <div className="evento-x2 vidrio" id="evento-x2" hidden={!resta}>
      <div>
        <strong>🎉 Evento <span id="ev-mult">x{ev ? ev.mult : 2}</span> acaba en <span id="ev-resta">{resta}</span></strong>
        <p className="mut peq">Tus monedas valen el doble al cazar, recolectar y cobrar recompensas.</p>
      </div>
    </div>
  );
}

function RestaClima({ fin }) {
  const texto = useDeAhora(ahora => dur((fin - ahora) / 1000));
  return <b id="cc-resta">{texto}</b>;
}

function contarListas(ahora) {
  let n = 0;
  for (const k in ACC) {
    if (e.tot[k] === undefined) continue;
    if (Math.ceil((e.fin[k] - ahora) / 1000) <= 0) n++;
  }
  return n + estadoEventos(ahora).listas;
}

function Listas() {
  const n = useDeAhora(contarListas);
  return <div className="vidrio listas-t"><b>{n}</b><span>Listas ahora</span><i>Actividades disponibles</i></div>;
}

const Clima = memo(function Clima({ me, meT }) {
  const c = me.clima;
  return (
    <div className="resumen">
      <div className="clima vidrio" id="clima-card">
        <span className="em" id="cc-em" aria-hidden="true">{c ? c.emoji : ''}</span>
        <div>
          <strong id="cc-nom">{c ? c.nombre + (c.raro ? ' · raro' : '') : ''}</strong>
          <p className="mut peq" id="cc-desc">{c ? c.desc : ''}</p>
          <p className="peq">Cambia en {c ? <RestaClima fin={meT + c.faltaS * 1000} /> : <b id="cc-resta" />}, luego <span id="cc-sig">{c ? c.siguiente.emoji + ' ' + c.siguiente.nombre : ''}</span></p>
        </div>
      </div>
      <Listas />
    </div>
  );
});

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

const Tarjeta = memo(function Tarjeta({ k, a, tot, mult, ancha }) {
  const fin = useEstado(s => s.fin[k]);
  const rest = useDeAhora(ahora => Math.max(0, Math.ceil((fin - ahora) / 1000)));
  const lista = rest === 0;
  const aro = <Aro k={k} icono={ICONOS[a.ic]} prog tot={tot} rest={rest} lista={lista} />;
  const est = <p className="est"><i /><span id={'t-' + k}>{lista ? 'Listo' : tiempo(rest)}</span></p>;
  const boton = (
    <button className="accion" type="button" data-a={k} aria-disabled={String(!lista)} onClick={() => jugar(k)}>
      {lista ? a.n : 'En espera'}
    </button>
  );
  if (a.g === 'c') {
    return (
      <div className={'ticket' + (lista ? '' : ' espera')} id={'c-' + k} style={{ '--z': a.z }}>
        <div className="fondo-t"><Decor k={k} /></div>
        {aro}
        <div className="tx"><h3>{a.t}</h3>{est}<Mult k={k} mult={mult} /><p className="mut peq">{a.d}</p></div>
        {boton}
      </div>
    );
  }
  return (
    <div className={'zona' + (lista ? '' : ' espera') + (ancha ? ' ancha' : '')} id={'c-' + k} style={{ '--z': a.z }}>
      <div className="arte"><Decor k={k} /><span className="zn">{a.l}</span>{aro}</div>
      <div className="zc">{est}<Mult k={k} mult={mult} />{boton}</div>
    </div>
  );
});

const T = {
  mazmorra: { k: 'mazmorra', z: '#9fb4c8', t: 'Mazmorra', d: 'Baja piso a piso, enfrenta jefes y consigue equipo.', b: 'Entrar', i: ICONOS.hunt },
  sala: { k: 'sala', z: '#d6a76a', t: 'Sala', d: 'Mazmorra en equipo, de 2 a 5 jugadores.', b: 'Jugar en equipo', i: ICONO_EXTRA.sala },
  raid: { k: 'raid', z: '#c9626f', t: 'Raid', d: 'Jefe mundial del grupo: todos atacan juntos y se reparten el botín.', b: 'Ver jefes', i: ICONOS.raid },
  encuentro: { k: 'encuentro', z: '#e8a58e', t: 'Encuentros', d: 'Algo se cruza en tu camino: decide bien y cobra premios.', b: 'Explorar', i: ICONOS.gacha },
  gacha: { k: 'gacha', z: '#b69be0', t: 'Gacha', d: 'Invoca y colecciona personajes de anime.', b: 'Invocar', i: ICONOS.gacha },
  clan: { k: 'clan', z: '#e0b96a', t: 'Clan', d: 'Funda o únete a un clan, comparte banco y gana guerras.', b: 'Ver clan', i: ICONOS.clan },
  mundial: { k: 'mundial', z: '#8fb4d6', t: 'Evento global', d: 'Aporta materiales a la meta común y gana cofres.', b: 'Participar', i: ICONOS.mundial },
  encargos: { k: 'encargos', z: '#8fc4ad', t: 'Encargos', d: 'Entrega materiales al pueblo y cobra monedas, XP y un cofre.', b: 'Ver encargos', i: ICONO_EXTRA.encargos },
  alquimia: { k: 'alquimia', z: '#8fc4ad', t: 'Alquimia', d: 'Prepara elixires y objetos en tus calderos.', b: 'Ir al laboratorio', i: ICONOS.alquimia }
};
const GRUPOS = [
  { id: 'aventura', t: 'Aventura', s: 'Mazmorras, jefes y encuentros', items: [T.mazmorra, T.sala, T.raid, T.encuentro] },
  { id: 'comunidad', t: 'Comunidad', s: 'Cartas, clan y metas compartidas', items: [T.gacha, T.clan, T.mundial] },
  { id: 'pueblo', t: 'Pueblo', s: 'Encargos y laboratorio', items: [T.encargos, T.alquimia] }
];

function vistaTile(x, ahora) {
  const ev = estadoEventos(ahora);
  let desc = x.d;
  let boton = x.b;
  let espera = false;
  if (x.k === 'raid' && ev.raid) {
    boton = ev.raid.n === 0 ? 'Ver jefes' : ev.raid.rest === 0 ? 'Atacar' : dur(ev.raid.rest);
    espera = !ev.raid.lista;
  }
  if (x.k === 'gacha' && ev.gacha) {
    const g = ev.gacha;
    const ab = g.ab;
    desc = g.pend ? 'Tienes una carta esperando. ¡Reclámala!' : ab.length ? ab[0].por + ' invocó a ' + ab[0].carta.nombre + '. ¡Reclámala!' : g.trato ? 'Te propusieron un cambio de cartas.' : x.d;
    boton = g.pend || ab.length ? 'Reclamar' : g.trato ? 'Ver trato' : g.rest === 0 ? 'Invocar' : dur(g.rest);
    espera = !g.lista;
  }
  return [desc, boton, espera ? '1' : ''].join('\u0001');
}

function Evento({ x, ancha, desc, boton, espera, ir }) {
  return (
    <div className={'ticket evento con-arte' + (espera ? ' espera' : '') + (ancha ? ' ancha' : '')} id={'c-' + x.k} style={{ '--z': x.z }}>
      <div className="arte"><Decor k={x.k} /><span className="zn">{x.t}</span><Aro icono={x.i} /></div>
      <div className="evc">
        <p className="mut peq" id={x.k === 'raid' ? 'p-raid' : x.k === 'gacha' ? 'p-gacha' : undefined}>{desc}</p>
        <button className="accion" type="button" id={x.k === 'raid' ? 'b-raid' : x.k === 'gacha' ? 'b-gacha' : undefined} onClick={ir}>{boton}</button>
      </div>
    </div>
  );
}

const irRaid = () => abrir('raid', true);

const TileVivo = memo(function TileVivo({ x, ancha }) {
  const [desc, boton, espera] = useDeAhora(ahora => vistaTile(x, ahora)).split('\u0001');
  return <Evento x={x} ancha={ancha} desc={desc} boton={boton} espera={!!espera} ir={x.k === 'raid' ? irRaid : irGacha} />;
});

const TileFijo = memo(function TileFijo({ x, ancha }) {
  return <Evento x={x} ancha={ancha} desc={x.d} boton={x.b} espera={false} ir={() => abrir(x.k)} />;
});

const Tile = ({ x, ancha }) => (x.k === 'raid' || x.k === 'gacha' ? <TileVivo x={x} ancha={ancha} /> : <TileFijo x={x} ancha={ancha} />);

export default function Inicio() {
  const me = useMe();
  const meT = useEstado(s => s.meT);
  const tot = useEstado(s => s.tot);

  if (!me) return null;

  const visibles = Object.keys(ACC).filter(k => ACC[k].g === 'r' && tot[k] !== undefined);
  const recompensas = Object.keys(ACC).filter(k => ACC[k].g === 'c' && tot[k] !== undefined);
  const ultima = visibles.length % 2 ? visibles[visibles.length - 1] : null;
  const mult = me.clima ? me.clima.mult : {};
  const tarjeta = k => <Tarjeta key={k} k={k} a={ACC[k]} tot={tot[k]} mult={mult} ancha={k === ultima} />;

  return (
    <>
      <Hero me={me} />
      <Hud me={me} />
      <EventoX2 me={me} meT={meT} />
      <Clima me={me} meT={meT} />
      <div className="grupo"><h2>Recolectar</h2><span className="mut peq">Cada actividad tiene su espera</span></div>
      <div className="rejilla" id="rejilla">{visibles.map(tarjeta)}</div>
      <div className="grupo"><h2>Recompensas</h2><span className="mut peq">Una vez cada cierto tiempo</span></div>
      <div id="recompensas">{recompensas.map(tarjeta)}</div>
      {GRUPOS.map(g => (
        <section key={g.id} aria-label={g.t}>
          <div className="grupo"><h2>{g.t}</h2><span className="mut peq">{g.s}</span></div>
          <div className="eventos">
            {g.items.map((x, i) => <Tile key={x.k} x={x} ancha={g.items.length % 2 === 1 && i === g.items.length - 1} />)}
          </div>
        </section>
      ))}
    </>
  );
}
