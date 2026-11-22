import React, { useEffect, useRef } from 'react';
import { irA } from '../bridge/acciones.js';
import { fmt } from '../lib/format.js';
import { arteMonstruo, arteHeroe, colorMonstruo, nombreLimpio } from '../lib/arteCombate.js';
import { Countdown, Accion } from './ui.jsx';
import { conIconos } from './Icono.jsx';
import Cabeza from './Cabeza.jsx';
import { Sprite, useCuadro, hojaHeroe, hojaMonstruo } from './Sprite.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="mz-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#10141c" />
        <stop offset="1" stopColor="#1f2733" />
      </linearGradient>
      <radialGradient id="mz-llama" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#f0d39a" stopOpacity=".55" />
        <stop offset="1" stopColor="#f0d39a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="110" fill="url(#mz-fondo)" />
    <circle className="mz-llama" cx="320" cy="42" r="46" fill="url(#mz-llama)" />
    <rect x="318" y="44" width="4" height="14" fill="#6b5a46" />
    <path className="mz-fuego" d="M320 28 C326 36 328 40 320 46 C312 40 314 36 320 28Z" fill="#f0d39a" />
    <g fill="#2b3544">
      <path d="M0 110 V86 H70 V98 H140 V110Z" />
      <path d="M70 98 V74 H140 V86 H210 V98 H140 V110 H70Z" fill="#232c39" />
      <path d="M140 86 V62 H210 V74 H280 V86 H210 V98 H140Z" fill="#1c2430" />
      <path d="M210 74 V50 H280 V62 H350 V74 H280 V86 H210Z" fill="#161d27" />
    </g>
    <g fill="#9fb4c8" opacity=".22">
      <rect x="0" y="86" width="70" height="2" />
      <rect x="70" y="74" width="70" height="2" />
      <rect x="140" y="62" width="70" height="2" />
      <rect x="210" y="50" width="70" height="2" />
    </g>
  </svg>
);

const t = v => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));
const pct = (v, max) => (max ? Math.round(v / max * 100) : 0);

const AURA_JEFE = '<defs><radialGradient id="cbAuraE"><stop offset="0" stop-color="#ff5a6a" stop-opacity=".42"/><stop offset="1" stop-color="#ff5a6a" stop-opacity="0"/></radialGradient></defs><circle cx="300" cy="130" r="96" fill="url(#cbAuraE)" class="cb-aura"/>';
const SOMBRA_HEROE = '<ellipse cx="80" cy="178" rx="32" ry="5" fill="#000" opacity=".4"/>';
const SOMBRA_MON = '<ellipse cx="300" cy="178" rx="42" ry="5" fill="#000" opacity=".4"/>';

function HeroeSprite({ hoja, buff, ataca, estocada, golpeado, cae }) {
  const tramos = [];
  if (ataca) tramos.push([0, 600, 1]);
  if (golpeado) tramos.push([350, 850, 2]);
  const f = useCuadro(tramos, cae ? 2 : 0);
  return (
    <>
      {buff && (
        <>
          <circle cx="80" cy="144" r="50" fill="#e8d3c0" fillOpacity=".1" />
          <circle cx="80" cy="144" r="50" fill="none" stroke="#e8d3c0" strokeWidth="2" strokeDasharray="6 5" className="cb-aura" />
        </>
      )}
      <g dangerouslySetInnerHTML={{ __html: SOMBRA_HEROE }} />
      <g className={estocada ? 'cb-sp-estocada' : ''}>
        <g className="cb-idle h"><Sprite hoja={hoja} cuadro={f} /></g>
      </g>
    </>
  );
}

function MonstruoSprite({ hoja, jefe, ataca, golpeado, cae }) {
  const tramos = [];
  if (golpeado) tramos.push([120, 650, 2]);
  if (ataca) tramos.push([300, 950, 1]);
  const f = useCuadro(tramos, cae ? 2 : 0);
  const fig = (
    <>
      <g dangerouslySetInnerHTML={{ __html: SOMBRA_MON }} />
      <g className={ataca ? 'cb-sp-embiste' : ''}>
        <g className={hoja.vuela ? 'cb-vuela' : 'cb-idle'}><Sprite hoja={hoja} cuadro={f} /></g>
      </g>
    </>
  );
  return (
    <>
      {jefe && <g dangerouslySetInnerHTML={{ __html: AURA_JEFE }} />}
      {jefe ? <g transform="translate(300 176) scale(1.25) translate(-300 -176)">{fig}</g> : fig}
    </>
  );
}

export function Escena({ nombre, jefe, clase, buff, hp, hpMax, ehp, ehpMax, u }) {
  const pH = pct(hp, hpMax), pE = pct(ehp, ehpMax);
  const golpeE = u && u.dano > 0, golpeH = u && u.recibido > 0;
  const hojaH = hojaHeroe(clase), hojaM = hojaMonstruo(nombre);
  return (
    <div className={`cb-arena ${jefe ? 'jefe' : ''}`} style={{ '--z': colorMonstruo(nombre) }}>
      <svg viewBox="0 0 400 200" aria-hidden="true">
        <rect y="176" width="400" height="24" fill="#0b0810" opacity=".75" />
        <rect y="176" width="400" height="1.5" fill="#fff" opacity=".08" />
        <g className={`cb-her ${u && u.hab ? 'cast' : ''} ${golpeH ? 'golpeado' : ''}`}>
          {hojaH
            ? <HeroeSprite hoja={hojaH} buff={buff} ataca={golpeE || (u && u.hab)} estocada={golpeE && !u.hab} golpeado={golpeH} cae={hpMax > 0 && hp <= 0} />
            : <g dangerouslySetInnerHTML={{ __html: arteHeroe(clase, buff) }} />}
        </g>
        <g className={`cb-mon ${golpeE ? 'golpeado' : ''}`}>
          {hojaM
            ? <MonstruoSprite hoja={hojaM} jefe={jefe} ataca={golpeH} golpeado={golpeE} cae={ehpMax > 0 && ehp <= 0} />
            : <g dangerouslySetInnerHTML={{ __html: arteMonstruo(nombre, jefe) }} />}
        </g>
        {golpeE && (
          <>
            <path className="cb-tajo" d="M262 96L346 164" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            <path className="cb-tajo t2" d="M346 100L266 166" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </svg>
      {u && u.hab && <i className="cb-flash" />}
      <div className="cb-hud h">
        <span>Tú{buff ? ' 🔥' : ''}</span>
        <div className={`cb-hp tu ${pH < 30 ? 'bajo' : ''}`}><i style={{ width: pH + '%' }} /></div>
        <b>{fmt(hp)}/{fmt(hpMax)}</b>
      </div>
      <div className="cb-hud e">
        <span>{jefe ? '👑 ' : ''}{nombreLimpio(nombre)}</span>
        <div className={`cb-hp ${pE < 30 ? 'bajo' : ''}`}><i style={{ width: pE + '%' }} /></div>
        <b>{fmt(ehp)}/{fmt(ehpMax)}</b>
      </div>
      {u && (
        <>
          {u.hab && <span className="cb-hab-t">✨ {t(u.hab)}</span>}
          {u.dano > 0 && <span className="cb-num dano" style={{ left: '74%', top: '50%' }}>-{fmt(u.dano)}</span>}
          {u.cura > 0 && <span className="cb-num cura" style={{ left: '21%', top: '46%' }}>+{fmt(u.cura)}</span>}
          {u.recibido > 0 && <span className="cb-num recibe" style={{ left: '14%', top: '56%' }}>-{fmt(u.recibido)}</span>}
        </>
      )}
    </div>
  );
}

const textoPeligro = p => (p > 0 ? `+${p} nivel${p === 1 ? '' : 'es'} sobre ti` : 'de tu nivel');

export function Amenaza({ m }) {
  if (!m.nivelMon) return null;
  return (
    <p className="peq cb-amenaza" style={{ textAlign: 'center', margin: '6px 0' }}>
      {m.elite && <><em className="etiq nar">⭐ Élite</em>{' '}</>}
      Nv <b>{m.nivelMon}</b> · {textoPeligro(m.peligro)}
    </p>
  );
}

function BarraRun({ r, base }) {
  return (
    <div className="cb-run mz-run">
      {r.mazmorra && <span className="mz-sitio">{r.mazmorra.emoji} <b>{r.mazmorra.nombre}</b></span>}
      <span className="mz-piso">Piso <b>{r.piso}</b>{r.seguro && <em className="etiq">Asegurada</em>}</span>
      <span>💰 <b>{fmt(r.botin)}</b></span>
      <span>🎒 <b>{r.equipo.length}</b>{r.cofres.length ? ' ' + r.cofres.join(' ') : ''}</span>
      <span>⏳ {r.expirada ? 'Expiró' : <Countdown fin={base + r.restaS * 1000} />}</span>
    </div>
  );
}

function Energia({ h }) {
  if (!h) return null;
  return (
    <div className="cb-ener">
      <span>Energía</span>
      {Array.from({ length: h.energia.max }, (_, i) => <i key={i} className={`pip ${i < h.energia.n ? 'on' : ''}`} />)}
    </div>
  );
}

const rangoNivel = t => (t.nivelMax == null ? `Nv ${t.nivelMin}+` : `Nv ${t.nivelMin}-${t.nivelMax}`);

function Tier({ d, t, base }) {
  const e = t.entrada;
  const espera = d.esperaS > 0;
  const muyBajo = d.nivel < t.nivelMin;
  const motivoNivel = muyBajo ? `Se desbloquea en el nivel ${t.nivelMin}.` : `Solo para niveles ${t.nivelMin} a ${t.nivelMax}. Tu nivel: ${d.nivel}.`;
  const motivo = t.bloqueada ? motivoNivel : espera ? 'Tus heridas siguen frescas.' : '';
  const entrar = (extra, txt) => <Accion ruta="/api/mazmorra/entrar" cuerpo={{ mazmorra: t.clave, ...extra }} motivo={motivo}>{txt}</Accion>;
  return (
    <div className={'bloque vidrio mz-tier' + (t.bloqueada ? ' bloq' : '')}>
      <div className="mz-puerta" aria-hidden="true"><span>{t.bloqueada ? '🔒' : t.emoji}</span></div>
      <div className="mz-tier-d">
        <div className="fila">
          <strong>{t.nombre}</strong>
          <span className={'etiq ' + (t.bloqueada ? 'nar' : '')}>{rangoNivel(t)}</span>
        </div>
        <p className="mut peq">{t.desc}</p>
        {t.bloqueada && !muyBajo && <p className="peq">Ya superaste esta mazmorra. Entra a una de nivel mayor.</p>}
      </div>
      <ul className="mz-reglas">
        <li><b>{t.desfase[0] === t.desfase[1] ? `+${t.desfase[0]}` : `+${t.desfase[0]} a +${t.desfase[1]}`}</b><span>niveles sobre ti</span></li>
        <li><b>{t.elite}%</b><span>élite</span></li>
        <li><b>x{t.recompensa}</b><span>recompensa</span></li>
      </ul>
      {t.check ? <p className="mz-guardado">Guardado en el piso <b>{t.check}</b>{t.record > t.check ? ` · récord piso ${t.record}` : ''}</p> : null}
      {!t.bloqueada && espera && <p className="peq">Podrás entrar en <Countdown fin={base + d.esperaS * 1000} /></p>}
      <div className="btns">
        {entrar({}, (t.check ? 'Continuar piso ' + t.check : 'Entrar') + ' · ' + fmt(e.normal))}
        {entrar({ seguro: true }, 'Con seguro · ' + fmt(e.normal + e.seguro))}
        {t.check ? entrar({ inicio: true }, 'Desde piso 1 · ' + fmt(e.inicio)) : null}
      </div>
    </div>
  );
}

function Entrada({ d, base }) {
  const e = d.entrada;
  const espera = d.esperaS > 0;
  const motivo = espera && 'Tus heridas siguen frescas.';
  const entrar = (cuerpo, txt) => <Accion ruta="/api/mazmorra/entrar" cuerpo={cuerpo} motivo={motivo}>{txt}</Accion>;
  if (d.mazmorras && d.mazmorras.length) {
    return (
      <>
        <div className="bloque vidrio mz-intro">
          <h2>Elige tu mazmorra</h2>
          <p className="mut peq">Cada piso genera enemigos de tu nivel o más fuertes, adaptados a tu fuerza, vida y equipo.</p>
          <ul>
            <li><b>Jefes</b><span>Cada {d.jefeCada} pisos y siempre sueltan equipo.</span></li>
            <li><b>Si caes</b><span>Pierdes el {d.perdida}% de las monedas reunidas; conservas equipo y cofres.</span></li>
            <li><b>Seguro</b><span>Evita perder monedas y retroceder al caer.</span></li>
            <li><b>Reingreso</b><span>Puedes volver a entrar cada {d.esperaTotalMin} minutos.</span></li>
          </ul>
          {d.esperaS > 0 && <p className="peq">Podrás entrar en <Countdown fin={base + d.esperaS * 1000} /></p>}
        </div>
        {d.mazmorras.map(t => <Tier key={t.clave} d={d} t={t} base={base} />)}
      </>
    );
  }
  return (
    <div className="bloque vidrio">
      <strong>🕳️ Mazmorra</strong>
      <p className="mut peq">
        Baja piso a piso. Los jefes aparecen cada {d.jefeCada} pisos y siempre sueltan equipo.
        Si caes pierdes el {d.perdida}% de las monedas reunidas; conservas equipo y cofres.
      </p>
      {d.check ? <p className="peq">💾 Guardado: piso {d.check}</p> : null}
      {espera && <p className="peq">Podrás entrar en <Countdown fin={base + d.esperaS * 1000} /></p>}
      <div className="btns">
        {entrar({}, (d.check ? 'Continuar piso ' + d.check : 'Entrar') + ' · ' + fmt(e.normal))}
        {entrar({ seguro: true }, 'Con seguro · ' + fmt(e.normal + e.seguro))}
        {d.check ? entrar({ inicio: true }, 'Desde piso 1 · ' + fmt(e.inicio)) : null}
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>El seguro evita perder monedas y retroceder al caer.</p>
    </div>
  );
}

const motivoPocion = (d, r) => (!d.pociones || r.hp >= r.hpMax) && (d.pociones ? 'Ya tienes la vida completa.' : 'No tienes pociones.');

function Combate({ d, r, c, h, clase, base }) {
  const clave = r.piso + ':' + c.turno;
  const visto = useRef('');
  const anim = visto.current !== clave;
  useEffect(() => { visto.current = clave; });

  const log = c.log.slice(-3);
  const motivoP = motivoPocion(d, r);
  return (
    <>
      <BarraRun r={r} base={base} />
      <Escena key={clave + ':' + anim} nombre={c.nombre} jefe={c.jefe} clase={clase} buff={c.buff}
        hp={r.hp} hpMax={r.hpMax} ehp={c.hp} ehpMax={c.hpMax} u={anim ? c.ultimo : null} />
      <Amenaza m={c} />
      <div className="cb-log vidrio" aria-live="polite">
        {log.length
          ? log.map((l, i) => <p key={i} className={i === log.length - 1 ? 'nuevo' : ''}>{conIconos(t(l))}</p>)
          : <p>Elige tu primera acción.</p>}
      </div>
      <Energia h={h} />
      <div className="cb-prim">
        <Accion ruta="/api/mazmorra/golpe" cls="cb-acc cb-golpe"><b>⚔️ Golpe</b><small>Ataque básico</small></Accion>
        <Accion ruta="/api/mazmorra/pocion" cls="cb-acc cb-poc" motivo={motivoP}><b>🧪 Poción</b><small>{d.pociones} en la bolsa</small></Accion>
      </div>
      {h && h.habilidades.length > 0 && (
        <div className="cb-habs">
          {h.habilidades.map(x => {
            const motivo = x.bloqueada ? 'Se desbloquea en el nivel ' + x.nivel + '.' : x.sinEnergia ? 'No tienes energía suficiente.' : '';
            return (
              <Accion key={x.n} ruta="/api/mazmorra/habilidad" cuerpo={{ n: x.n }} cls="cb-acc cb-hab-b" motivo={motivo}>
                <span className="cb-hn">{t(x.nombre)}</span>
                {x.bloqueada ? <span className="cb-lock">🔒 Nv {x.nivel}</span> : <span className="cb-hc">{'⚡'.repeat(x.costo)}</span>}
                <span className="cb-hd">{t(x.desc) || 'Ataque potenciado'}</span>
              </Accion>
            );
          })}
        </div>
      )}
      <p className="mut peq" style={{ marginTop: 10 }}>
        No puedes salir ni descansar en pleno combate. Si caes, pierdes el {d.perdida}% de lo reunido.
      </p>
    </>
  );
}

function Descanso({ d, r, h, clase, base }) {
  const s = r.siguiente;
  const expirada = r.expirada && 'Cobra tu botín saliendo.';
  const llena = r.hp >= r.hpMax && 'Ya tienes la vida completa.';
  return (
    <>
      <BarraRun r={r} base={base} />
      <Escena nombre={s.nombre} jefe={s.jefe} clase={clase} buff={null}
        hp={r.hp} hpMax={r.hpMax} ehp={s.hp} ehpMax={s.hp} u={null} />
      <Amenaza m={s} />
      <Energia h={h} />
      <div className="btns">
        <Accion ruta="/api/mazmorra/pelear" motivo={expirada}>⚔️ Pelear</Accion>
        <Accion ruta="/api/mazmorra/avanzar" motivo={expirada}>⚡ Auto</Accion>
        <Accion ruta="/api/mazmorra/curar" motivo={motivoPocion(d, r)}>{'Poción (' + d.pociones + ')'}</Accion>
        <Accion ruta="/api/mazmorra/descansar" motivo={llena}>{'Posada · ' + fmt(r.posada)}</Accion>
        <Accion ruta="/api/mazmorra/salir" confirmar="Saldrás con lo reunido hasta ahora. ¿Continuar?">Salir y cobrar</Accion>
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>⚔️ Pelear: tú eliges cada acción. ⚡ Auto: el combate se resuelve solo.</p>
    </>
  );
}

function Cuerpo({ d, base }) {
  const resumen = null;
  if (d.nivel < d.nivelMin) {
    return (
      <>
        {resumen}
        <div className="bloque vidrio"><p className="mut peq">Se desbloquea en el nivel {d.nivelMin}. Tu nivel: {d.nivel}.</p></div>
      </>
    );
  }
  if (!d.activo) return <>{resumen}<Entrada d={d} base={base} /></>;
  if (d.enSala && !d.run.expirada) {
    return (
      <>
        {resumen}
        <div className="bloque vidrio">
          <strong>🏰 Estás en una sala de equipo</strong>
          <p className="mut peq">Esta expedición se juega desde el panel de sala.</p>
          <div className="btns uno"><button type="button" className="mini" onClick={() => irA('sala')}>Ir a la sala</button></div>
        </div>
      </>
    );
  }

  const r = d.run, h = d.heroe, clase = h && h.clase;
  return (
    <>
      {resumen}
      {r.combate
        ? <Combate d={d} r={r} c={r.combate} h={h} clase={clase} base={base} />
        : <Descanso d={d} r={r} h={h} clase={clase} base={base} />}
    </>
  );
}

export default function Mazmorra({ d, base }) {
  return (
    <div className="mz">
      <Cabeza titulo="Mazmorra" sub="Baja piso a piso, enfrenta jefes y consigue equipo." arte={ARTE} cifras={[['Monedas', fmt(d.cartera)], ['Récord', 'Piso ' + d.record], ['Pociones', d.pociones]]} />
      <Cuerpo d={d} base={base} />
    </div>
  );
}
