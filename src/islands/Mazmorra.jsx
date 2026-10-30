import React, { useEffect, useRef } from 'react';
import { fmt } from '../lib/format.js';
import { arteMonstruo, arteHeroe, colorMonstruo, nombreLimpio } from '../lib/arteCombate.js';
import { Cab, Countdown, Accion } from './ui.jsx';

const ICONO = (
  <>
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" />
    <path d="M12 1 V5 M12 19 V23 M1 12 H5 M19 12 H23" />
  </>
);

const t = v => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));
const pct = (v, max) => (max ? Math.round(v / max * 100) : 0);

export function Escena({ nombre, jefe, clase, buff, hp, hpMax, ehp, ehpMax, u }) {
  const pH = pct(hp, hpMax), pE = pct(ehp, ehpMax);
  const golpeE = u && u.dano > 0, golpeH = u && u.recibido > 0;
  return (
    <div className={`cb-arena ${jefe ? 'jefe' : ''}`} style={{ '--z': colorMonstruo(nombre) }}>
      <svg viewBox="0 0 400 200" aria-hidden="true">
        <rect y="176" width="400" height="24" fill="#0b0810" opacity=".75" />
        <rect y="176" width="400" height="1.5" fill="#fff" opacity=".08" />
        <g className={`cb-her ${u && u.hab ? 'cast' : ''} ${golpeH ? 'golpeado' : ''}`} dangerouslySetInnerHTML={{ __html: arteHeroe(clase, buff) }} />
        <g className={`cb-mon ${golpeE ? 'golpeado' : ''}`} dangerouslySetInnerHTML={{ __html: arteMonstruo(nombre, jefe) }} />
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

function Amenaza({ m }) {
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
    <div className="cb-run">
      {r.mazmorra && <span>{r.mazmorra.emoji} <b>{r.mazmorra.nombre}</b></span>}
      <span>📍 Piso <b>{r.piso}</b>{r.seguro && <> <em className="etiq">Asegurada</em></>}</span>
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

function Tier({ d, t, base }) {
  const e = t.entrada;
  const espera = d.esperaS > 0;
  const motivo = t.bloqueada ? `Se desbloquea en el nivel ${t.nivelMin}.` : espera ? 'Tus heridas siguen frescas.' : '';
  const entrar = (extra, txt) => <Accion ruta="/api/mazmorra/entrar" cuerpo={{ mazmorra: t.clave, ...extra }} motivo={motivo}>{txt}</Accion>;
  return (
    <div className="bloque vidrio">
      <div className="fila">
        <strong>{t.emoji} {t.nombre}</strong>
        <span className={'etiq ' + (t.bloqueada ? 'nar' : '')}>{t.bloqueada ? '🔒 Nv ' + t.nivelMin : 'Nv ' + t.nivelMin + '+'}</span>
      </div>
      <p className="mut peq">{t.desc}</p>
      <p className="peq">
        👹 Monstruos {t.desfase[0] === t.desfase[1] ? `+${t.desfase[0]}` : `+${t.desfase[0]} a +${t.desfase[1]}`} niveles sobre ti · ⭐ {t.elite}% élite · 🎁 x{t.recompensa}
      </p>
      {t.check ? <p className="peq">💾 Guardado: piso {t.check}{t.record > t.check ? ` · Récord: piso ${t.record}` : ''}</p> : null}
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
        <div className="bloque vidrio">
          <strong>🕳️ Elige tu mazmorra</strong>
          <p className="mut peq">
            Cada piso genera enemigos distintos, de tu nivel o más fuertes. Los jefes aparecen cada {d.jefeCada} pisos y siempre sueltan equipo.
            Si caes pierdes el {d.perdida}% de las monedas reunidas; conservas equipo y cofres. Puedes volver a entrar cada {d.esperaTotalMin} minutos.
          </p>
          {d.esperaS > 0 && <p className="peq">Podrás entrar en <Countdown fin={base + d.esperaS * 1000} /></p>}
          <p className="mut peq" style={{ marginTop: 8 }}>El seguro evita perder monedas y retroceder al caer.</p>
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
          ? log.map((l, i) => <p key={i} className={i === log.length - 1 ? 'nuevo' : ''}>{t(l)}</p>)
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
  const resumen = (
    <p className="peq mut" style={{ marginTop: 8 }}>
      Cartera: <b>{fmt(d.cartera)}</b> · Récord: piso <b>{d.record}</b> · Pociones: <b>{d.pociones}</b>
    </p>
  );
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
          <div className="btns uno"><button type="button" className="mini" data-ir="sala">Ir a la sala</button></div>
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
    <>
      <Cab atras titulo="Mazmorra" sub="Baja piso a piso, enfrenta jefes y consigue equipo." icono={ICONO} />
      <Cuerpo d={d} base={base} />
    </>
  );
}
