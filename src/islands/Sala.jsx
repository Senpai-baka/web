import React, { useEffect, useState } from 'react';
import { fmt } from '../lib/format.js';
import { cargar } from '../state/panel.js';
import { Cab, Countdown, Accion, Campo, Barra, Vacio } from './ui.jsx';
import { Escena } from './Mazmorra.jsx';

const ICONO = (
  <>
    <circle cx="9" cy="8" r="3.2" /><path d="M3 20 C3 15.5 6 14 9 14 C12 14 15 15.5 15 20" />
    <circle cx="17" cy="9" r="2.5" /><path d="M17 14 C19.5 14 21 15.5 21 19" />
  </>
);

const t = v => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));

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
      <p className="peq mut" style={{ marginTop: 8 }}>
        Cartera: <b>{fmt(d.cartera)}</b> · Entrada: <b>{fmt(d.entrada)}</b> por jugador
      </p>
      <div className="bloque vidrio">
        <strong>🏰 Mazmorra en equipo</strong>
        <p className="mut peq">
          De {d.reglas.min} a {d.reglas.max} jugadores. Cada uno actúa en su turno y el monstruo escala con el tamaño del equipo.
          Al iniciar, cada jugador paga la entrada.
        </p>
        {espera && <p className="peq">Podrás entrar en <Countdown fin={base + d.esperaS * 1000} /></p>}
        <div className="btns">
          <Accion ruta="/api/sala/crear" cuerpo={{ publica: true }} motivo={motivo}>Crear sala pública</Accion>
          <Accion ruta="/api/sala/crear" cuerpo={{ publica: false }} motivo={motivo}>Crear sala privada</Accion>
        </div>
      </div>
      <div className="bloque vidrio">
        <strong>🔑 Unirse con código</strong>
        <div className="btns">
          <Campo texto corto valor={codigo} onCambio={setCodigo} ph="Código de 4 letras" />
          <Accion ruta="/api/sala/unir" campos={{ id: limpio }} motivo={motivo || (limpio.length < 4 && 'Escribe el código de la sala.')}>Unirme</Accion>
        </div>
      </div>
      <div className="bloque vidrio">
        <strong>Salas abiertas</strong>
        {d.abiertas.length
          ? d.abiertas.map(a => (
            <div key={a.id} className="fil">
              <div className="nom">
                <strong>{a.id} · {a.lider}</strong>
                <span className="mut peq">{a.jugadores}/{a.max} jugadores · cierra en <Countdown fin={base + a.restaS * 1000} /></span>
              </div>
              <Accion ruta="/api/sala/unir" cuerpo={{ id: a.id }} motivo={motivo}>Unirme</Accion>
            </div>
          ))
          : <Vacio>No hay salas abiertas ahora mismo.</Vacio>}
      </div>
    </>
  );
}

function Equipo({ s }) {
  const sinRevivir = s.revives.usados >= s.revives.max && `La sala ya usó sus ${s.revives.max} revivires.`;
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
    <div className="cb-run">
      <span>📍 Piso <b>{s.piso}</b></span>
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
    <div className="bloque vidrio">
      <strong>🏰 Sala {s.id}</strong>
      <p className="mut peq">
        {s.publica ? 'Pública' : 'Privada'} · {s.n}/{s.max} jugadores · cierra en <Countdown fin={base + s.restaS * 1000} />
      </p>
      <p className="peq">Comparte el código <b>{s.id}</b> con tu equipo.</p>
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
    </div>
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

function Combate({ s, base, yo, h, pociones, clase }) {
  const c = s.combate;
  const caido = !yo || yo.caido;
  const turno = caido ? 'Estás caído. Pide que te revivan o retírate.' : !c.miTurno ? 'Todavía no es tu turno.' : '';
  const motivoPocion = turno || (!pociones && 'No tienes pociones.') || (yo.hp >= yo.hpMax && 'Ya tienes la vida completa.') || '';
  const motivoAsalto = turno || (s.asalto.usado && 'El asalto ya se usó en esta partida.') || '';
  return (
    <>
      <Barra2 s={s} base={base} yo={yo} />
      {yo && (
        <Escena nombre={c.nombre} jefe={c.jefe} clase={clase} buff={yo.buff} hp={yo.hp} hpMax={yo.hpMax} ehp={c.hp} ehpMax={c.hpMax} u={null} />
      )}
      <p className="peq" style={{ textAlign: 'center', margin: '6px 0' }}>
        {c.miTurno ? <b>🎯 Es tu turno</b> : <>🎯 Turno de <b>{c.nombreTurno}</b></>}
        {' · '}<Countdown fin={base + c.turnoRestaS * 1000} />
        {' · '}Ronda {c.ronda} · rugido en {c.rugidoEn}
      </p>
      <Registro log={s.log} />
      <div className="cb-prim">
        <Accion ruta="/api/sala/golpe" cls="cb-acc cb-golpe" motivo={turno}><b>⚔️ Golpe</b><small>Ataque básico</small></Accion>
        <Accion ruta="/api/sala/pocion" cls="cb-acc cb-poc" motivo={motivoPocion}><b>🧪 Poción</b><small>{pociones} en la bolsa</small></Accion>
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
      <Equipo s={s} />
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
      <p className="peq mut" style={{ marginTop: 8 }}>
        Cartera: <b>{fmt(s.yo.cartera)}</b> · Pociones: <b>{s.yo.pociones}</b>
      </p>
      {s.combate
        ? <Combate s={s} base={base} yo={yo} h={h} pociones={s.yo.pociones} clase={clase} />
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
  return (
    <>
      <Cab atras titulo="Sala" sub="Mazmorra en equipo: bajen juntos, turno a turno." icono={ICONO} />
      <Cuerpo d={d} base={base} />
    </>
  );
}
