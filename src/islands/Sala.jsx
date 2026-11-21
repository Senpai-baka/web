import React, { useEffect, useState } from 'react';
import { fmt } from '../lib/format.js';
import { cargar } from '../state/panel.js';
import { Countdown, Accion, Campo, Barra, Vacio } from './ui.jsx';
import Cabeza from './Cabeza.jsx';
import { Escena, Amenaza } from './Mazmorra.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="sl-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b1522" />
        <stop offset="1" stopColor="#2a2030" />
      </linearGradient>
      <radialGradient id="sl-fuego" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#f3b98a" stopOpacity=".6" />
        <stop offset="1" stopColor="#f3b98a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="110" fill="url(#sl-fondo)" />
    <circle className="sl-brasa" cx="200" cy="84" r="64" fill="url(#sl-fuego)" />
    <path className="sl-llama" d="M200 66 C208 78 210 84 200 92 C190 84 192 78 200 66Z" fill="#f3b98a" />
    <rect x="186" y="92" width="28" height="4" rx="2" fill="#4a3526" />
    <g fill="#0f0b14">
      <circle cx="120" cy="66" r="9" />
      <path d="M104 110 C104 86 112 78 120 78 C128 78 136 86 136 110Z" />
      <circle cx="160" cy="72" r="8" />
      <path d="M146 110 C146 90 152 83 160 83 C168 83 174 90 174 110Z" />
      <circle cx="240" cy="72" r="8" />
      <path d="M226 110 C226 90 232 83 240 83 C248 83 254 90 254 110Z" />
      <circle cx="282" cy="66" r="9" />
      <path d="M266 110 C266 86 274 78 282 78 C290 78 298 86 298 110Z" />
    </g>
  </svg>
);

const t = v => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));

const rangoNivel = m => (m.nivelMax == null ? `Nv ${m.nivelMin}+` : `Nv ${m.nivelMin}-${m.nivelMax}`);

const motivoTier = (d, m) => (d.nivel < m.nivelMin ? `Se desbloquea en el nivel ${m.nivelMin}.` : `Solo para niveles ${m.nivelMin} a ${m.nivelMax}. Tu nivel: ${d.nivel}.`);

function useSondeo(activo, ms) {
  useEffect(() => {
    if (!activo) return undefined;
    const i = setInterval(() => {
      const el = document.getElementById('t-sala');
      if (document.hidden || !el || el.hidden) return;
      cargar('sala', true);
    }, ms);
    return () => clearInterval(i);
  }, [activo, ms]);
}

function Final({ f }) {
  return (
    <div className="bloque vidrio">
      <strong>{f.titulo}</strong>
      <p className="mut peq">{f.zona}</p>
      <p className="peq">💰 {fmt(f.monedas)} · ✨ {fmt(f.xp)} XP</p>
      {f.extra.map((x, i) => <p key={i} className="peq">{x}</p>)}
      <div className="btns uno"><Accion ruta="/api/sala/descartar">Listo</Accion></div>
    </div>
  );
}

function Entrada({ d, base }) {
  const [codigo, setCodigo] = useState('');
  useSondeo(true, 8000);
  const bajo = d.nivel < d.nivelMin;
  const espera = d.esperaS > 0;
  const motivo = bajo ? `Necesitas ser nivel ${d.nivelMin}.` : espera ? 'Tus heridas siguen frescas.' : '';
  const limpio = codigo.trim().toUpperCase();
  return (
    <>
      <div className="bloque vidrio mz-intro">
        <h2>Mazmorra en equipo</h2>
        <p className="mut peq">De {d.reglas.min} a {d.reglas.max} jugadores. Cada uno actúa en su turno y el monstruo escala con el tamaño del equipo.</p>
        <ul>
          <li><b>Entrada</b><span>Al iniciar, cada jugador paga {fmt(d.entrada)}.</span></li>
          <li><b>Pociones</b><span>Hasta {d.reglas.pocionesMax} por jugador en cada sala.</span></li>
          <li><b>Botín</b><span>Solo cobra el que actúa en el piso.</span></li>
          <li><b>Niveles</b><span>Cada mazmorra admite su rango y los monstruos se adaptan al equipo.</span></li>
        </ul>
        {espera && <p className="peq">Podrás entrar en <Countdown fin={base + d.esperaS * 1000} /></p>}
      </div>
      {(d.mazmorras || []).map(m => {
        const motivoM = m.bloqueada ? motivoTier(d, m) : motivo;
        return (
          <div key={m.clave} className={'bloque vidrio mz-tier' + (m.bloqueada ? ' bloq' : '')}>
            <div className="mz-puerta" aria-hidden="true"><span>{m.bloqueada ? '🔒' : m.emoji}</span></div>
            <div className="mz-tier-d">
              <div className="fila">
                <strong>{m.nombre}</strong>
                <span className={'etiq ' + (m.bloqueada ? 'nar' : '')}>{rangoNivel(m)}</span>
              </div>
              <p className="mut peq">{m.desc}</p>
            </div>
            <ul className="mz-reglas">
              <li><b>{m.desfase[0] === m.desfase[1] ? `+${m.desfase[0]}` : `+${m.desfase[0]} a +${m.desfase[1]}`}</b><span>niveles sobre el equipo</span></li>
              <li><b>{m.elite}%</b><span>élite</span></li>
              <li><b>x{m.recompensa}</b><span>recompensa</span></li>
            </ul>
            {m.check ? <p className="mz-guardado">Guardado en el piso <b>{m.check}</b>{m.record > m.check ? ` · récord piso ${m.record}` : ''}</p> : null}
            <div className="btns">
              <Accion ruta="/api/sala/crear" cuerpo={{ publica: true, mazmorra: m.clave }} motivo={motivoM}>Sala pública · {fmt(m.entrada.normal)}</Accion>
              <Accion ruta="/api/sala/crear" cuerpo={{ publica: false, mazmorra: m.clave }} motivo={motivoM}>Sala privada · {fmt(m.entrada.normal)}</Accion>
            </div>
          </div>
        );
      })}
      <div className="bloque vidrio sl-unir">
        <h2>Unirse con código</h2>
        <div className="btns">
          <Campo texto corto valor={codigo} onCambio={setCodigo} ph="Código de 4 letras" />
          <Accion ruta="/api/sala/unir" campos={{ id: limpio }} motivo={motivo || (limpio.length < 4 && 'Escribe el código de la sala.')}>Unirme</Accion>
        </div>
      </div>
      <div className="bloque vidrio">
        <h2 className="sl-h">Salas abiertas</h2>
        {d.abiertas.length
          ? d.abiertas.map(a => (
            <div key={a.id} className="fil">
              <div className="nom">
                <strong>{a.id} · {a.lider}</strong>
                <span className="mut peq">
                  {a.mazmorra ? `${a.mazmorra.emoji} ${a.mazmorra.nombre} (${rangoNivel(a.mazmorra)}) · ` : ''}
                  {a.jugadores}/{a.max} jugadores · cierra en <Countdown fin={base + a.restaS * 1000} />
                </span>
              </div>
              <Accion ruta="/api/sala/unir" cuerpo={{ id: a.id }} motivo={a.bloqueada ? motivoTier(d, a.mazmorra) : motivo}>Unirme</Accion>
            </div>
          ))
          : <Vacio>No hay salas abiertas ahora mismo.</Vacio>}
      </div>
    </>
  );
}

function Equipo({ s, sinPocion }) {
  const sinRevivir = (s.revives.usados >= s.revives.max && `La sala ya usó sus ${s.revives.max} revivires.`) || sinPocion || '';
  return (
    <div className="rd-top">
      <h4>Equipo</h4>
      {s.miembros.map(m => (
        <div key={m.ref} className={`fil ${m.yo ? 'yo' : ''}`}>
          <span className="pos">{m.fuera ? '🚪' : m.caido ? '💀' : m.lider ? '👑' : '🛡️'}</span>
          <div className="nom">
            <strong>{m.nombre}{m.yo ? ' (tú)' : ''}</strong>
            {m.fuera
              ? <span className="mut peq">Salió de la sala</span>
              : <Barra valor={m.hp} max={m.hpMax} cls={m.hp / m.hpMax < 0.3 ? 'bajo' : ''} />}
          </div>
          {m.fuera ? null : m.caido && !m.yo
            ? <Accion ruta="/api/sala/revivir" cuerpo={{ ref: m.ref }} motivo={sinRevivir}>Revivir</Accion>
            : <span className="val">{fmt(m.hp)}/{fmt(m.hpMax)}</span>}
        </div>
      ))}
    </div>
  );
}

function Barra2({ s, base, yo }) {
  return (
    <div className="cb-run mz-run">
      {s.mazmorra && <span className="mz-sitio">{s.mazmorra.emoji} <b>{s.mazmorra.nombre}</b></span>}
      <span className="mz-piso">Piso <b>{s.piso}</b></span>
      <span>👥 <b>{s.miembros.filter(m => !m.fuera).length}</b></span>
      <span>💰 <b>{fmt(yo ? yo.botin : 0)}</b></span>
      <span>⏳ <Countdown fin={base + s.restaS * 1000} /></span>
    </div>
  );
}

function Registro({ log }) {
  const ult = (log || []).slice(-4);
  return (
    <div className="cb-log vidrio" aria-live="polite">
      {ult.length ? ult.map((l, i) => <p key={i} className={i === ult.length - 1 ? 'nuevo' : ''}>{t(l)}</p>) : <p>La expedición comienza.</p>}
    </div>
  );
}

function Salidas({ s }) {
  return (
    <div className="btns">
      <Accion ruta="/api/sala/salir" confirmar="Saldrás de la mazmorra con lo reunido hasta ahora. ¿Continuar?">Salir</Accion>
      {s.soyLider && <Accion ruta="/api/sala/cerrar" confirmar="Todo el equipo saldrá de la mazmorra. ¿Continuar?">Cerrar sala</Accion>}
    </div>
  );
}

function Lobby({ s, base }) {
  const falta = s.n < s.min && `Hacen falta al menos ${s.min} jugadores.`;
  return (
    <>
      <div className="bloque vidrio sl-sala">
        <div className="sl-codigo" aria-label={'Código de la sala ' + s.id}>
          {String(s.id).split('').map((c, i) => <b key={i}>{c}</b>)}
        </div>
        <p className="sl-comparte">Comparte este código con tu equipo.</p>
        {s.mazmorra && <p className="sl-sitio">{s.mazmorra.emoji} <b>{s.mazmorra.nombre}</b> <span className="mut">{rangoNivel(s.mazmorra)}</span></p>}
        <p className="mut peq">
          {s.publica ? 'Pública' : 'Privada'}, {s.n}/{s.max} jugadores. Cierra en <Countdown fin={base + s.restaS * 1000} />.
        </p>
      </div>
      <div className="rd-top">
        <h4>Jugadores</h4>
        {s.jugadores.map(j => (
          <div key={j.ref} className={`fil ${j.yo ? 'yo' : ''}`}>
            <span className="pos">{j.lider ? '👑' : '🛡️'}</span>
            <div className="nom"><strong>{j.nombre}{j.yo ? ' (tú)' : ''}</strong></div>
          </div>
        ))}
      </div>
      <div className="btns">
        {s.soyLider
          ? (
            <>
              <Accion ruta="/api/sala/iniciar" motivo={falta}>Iniciar</Accion>
              <Accion ruta="/api/sala/cerrar" confirmar="¿Cerrar la sala?">Cerrar sala</Accion>
            </>
          )
          : <Accion ruta="/api/sala/salir">Salir</Accion>}
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>Al iniciar, cada jugador paga la entrada de la mazmorra.</p>
    </>
  );
}

function Explorando({ s, base, yo, clase }) {
  const sg = s.siguiente;
  return (
    <>
      <Barra2 s={s} base={base} yo={yo} />
      {sg && yo && (
        <Escena nombre={sg.nombre} jefe={sg.jefe} clase={clase} buff={null}
          hp={yo.hp} hpMax={yo.hpMax} ehp={sg.hp} ehpMax={sg.hp} u={null} />
      )}
      {sg && <Amenaza m={sg} />}
      <Registro log={s.log} />
      <Equipo s={s} />
      <div className="btns" style={{ marginTop: 10 }}>
        <Accion ruta="/api/sala/pelear">⚔️ Pelear piso {s.piso + 1}</Accion>
      </div>
      <Salidas s={s} />
      <p className="mut peq" style={{ marginTop: 8 }}>Cualquiera del equipo puede iniciar el siguiente combate.</p>
    </>
  );
}

function Combate({ s, base, yo, h, pociones, clase, reglas }) {
  const c = s.combate;
  const caido = !yo || yo.caido;
  const turno = caido ? 'Estás caído. Pide que te revivan o retírate.' : !c.miTurno ? 'Todavía no es tu turno.' : '';
  const usadas = (yo && yo.pociones) || 0;
  const limite = usadas >= reglas.pocionesMax && 'Ya usaste tus pociones de esta sala.';
  const motivoPocion = turno || limite || (!pociones && 'No tienes pociones.') || (yo.hp >= yo.hpMax && 'Ya tienes la vida completa.') || '';
  const motivoAsalto = turno || (s.asalto.usado && 'El asalto ya se usó en esta partida.') || '';
  return (
    <>
      <Barra2 s={s} base={base} yo={yo} />
      {yo && (
        <Escena nombre={c.nombre} jefe={c.jefe} clase={clase} buff={yo.buff} hp={yo.hp} hpMax={yo.hpMax} ehp={c.hp} ehpMax={c.hpMax} u={null} />
      )}
      <Amenaza m={c} />
      <p className="peq" style={{ textAlign: 'center', margin: '6px 0' }}>
        {c.miTurno ? <b>🎯 Es tu turno</b> : <>🎯 Turno de <b>{c.nombreTurno}</b></>}
        {' · '}<Countdown fin={base + c.turnoRestaS * 1000} />
        {' · '}Ronda {c.ronda} · rugido en {c.rugidoEn}
      </p>
      <Registro log={s.log} />
      <div className="cb-prim">
        <Accion ruta="/api/sala/golpe" cls="cb-acc cb-golpe" motivo={turno}><b>⚔️ Golpe</b><small>Ataque básico</small></Accion>
        <Accion ruta="/api/sala/pocion" cls="cb-acc cb-poc" motivo={motivoPocion}><b>🧪 Poción</b><small>{usadas}/{reglas.pocionesMax} usadas · {pociones} en la bolsa</small></Accion>
      </div>
      {h && h.habilidades.length > 0 && (
        <div className="cb-habs">
          {h.habilidades.map(x => {
            const motivo = x.bloqueada ? 'Se desbloquea en el nivel ' + x.nivel + '.' : x.sinEnergia ? 'No tienes energía suficiente.' : turno;
            return (
              <Accion key={x.n} ruta="/api/sala/habilidad" cuerpo={{ n: x.n }} cls="cb-acc cb-hab-b" motivo={motivo}>
                <span className="cb-hn">{t(x.nombre)}</span>
                {x.bloqueada ? <span className="cb-lock">🔒 Nv {x.nivel}</span> : <span className="cb-hc">{'⚡'.repeat(x.costo)}</span>}
                <span className="cb-hd">{t(x.desc) || 'Ataque potenciado'}</span>
              </Accion>
            );
          })}
        </div>
      )}
      <div className="btns" style={{ marginTop: 8 }}>
        <Accion ruta="/api/sala/asalto" motivo={motivoAsalto}>🔥 Asalto del equipo</Accion>
      </div>
      <Equipo s={s} sinPocion={limite} />
      <Salidas s={s} />
      <p className="mut peq" style={{ marginTop: 8 }}>
        Si se agota tu turno se juega un golpe automático. Si te duermes varias veces seguidas, caes.
      </p>
    </>
  );
}

function Vista({ d, base }) {
  const s = d.sala;
  useSondeo(true, 4000);
  const yo = s.miembros.find(m => m.yo);
  const h = s.yo.heroe;
  const clase = (yo && yo.clase) || (h && h.clase);
  if (s.estado === 'lobby') return <Lobby s={s} base={base} />;
  return (
    <>
      {s.combate
        ? <Combate s={s} base={base} yo={yo} h={h} pociones={s.yo.pociones} clase={clase} reglas={d.reglas} />
        : <Explorando s={s} base={base} yo={yo} clase={clase} />}
    </>
  );
}

function Cuerpo({ d, base }) {
  const final = d.final ? <Final f={d.final} /> : null;
  if (!d.enSala) return <>{final}<Entrada d={d} base={base} /></>;
  return <>{final}<Vista d={d} base={base} /></>;
}

export default function Sala({ d, base }) {
  const s = d.sala;
  const cifras = !d.enSala
    ? [['Monedas', fmt(d.cartera)], ['Entrada', fmt(d.entrada)], ['Equipo', d.reglas.min + ' a ' + d.reglas.max]]
    : s.estado === 'lobby'
      ? [['Monedas', fmt(s.yo.cartera)], ['Jugadores', s.n + '/' + s.max], ['Mínimo', s.min]]
      : [['Monedas', fmt(s.yo.cartera)], ['Pociones', s.yo.pociones], ['Piso', s.piso]];
  return (
    <div className="mz sl">
      <Cabeza titulo="Sala" sub="Mazmorra en equipo: bajen juntos, turno a turno." arte={ARTE} cifras={cifras} />
      <Cuerpo d={d} base={base} />
    </div>
  );
}
