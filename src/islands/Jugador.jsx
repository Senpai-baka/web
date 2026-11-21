import React from 'react';
import { fmt } from '../lib/format.js';
import { volverJugador, irA, jugadorRef } from '../bridge/acciones.js';
import { Sec, Kv } from './ui.jsx';
import { Pase, Tira } from './fichaUi.jsx';

const num = v => fmt(Number(v || 0));

const Atras = () => (
  <button type="button" className="lg-atras" onClick={volverJugador}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5 L8 12 L15 19" /></svg>
    Volver
  </button>
);

export default function Jugador({ d }) {
  const s = d.stats || {};
  const prestigio = d.prestigio || {};
  const reliquias = d.reliquias || {};
  return (
    <div className="fc fc-jug">
      <Atras />
      <Pase
        alias={d.alias}
        nivel={d.nivel}
        xp={d.xp}
        xpSig={d.xpSig}
        rol={d.empleo ? `${d.empleo.emoji} ${d.empleo.nombre}` : ''}
        avatar={{ yo: !!d.yo, nombre: d.alias, foto: d.foto, fotoUrl: d.fotoUrl, ref: jugadorRef() }}
        sello={[[d.nivel ?? '—', 'Nivel'], [`${prestigio.n ?? 0}/${prestigio.max ?? 0}`, 'Prestigio'], [d.mazmorra ? 'Piso ' + d.mazmorra : '—', 'Mazmorra']]}
      />
      {d.yo && (
        <div className="fc-aviso">
          <p>Así te ven los demás jugadores. Tu cartera y tu banco no se muestran.</p>
          <button type="button" className="mini" onClick={() => irA('ficha')}>Ir a mi perfil</button>
        </div>
      )}
      <div className="fc-cuerpo">
        <Sec k="jugador-atributos" titulo="Atributos">
          <Tira lista={[['Fuerza', num(s.fuerza)], ['Vigor', num(s.vigor)], ['Suerte', num(s.suerte)]]} />
        </Sec>
        <Sec k="jugador-heroe" titulo="Héroe" extra={d.clase ? `${d.clase.emoji} ${d.clase.nombre}` : 'Sin clase'}>
          <div className="bloque vidrio">
            {d.clase
              ? <Kv k="Clase" v={`${d.clase.emoji} ${d.clase.nombre}`} />
              : <p className="mut peq">Todavía no eligió una clase.</p>}
          </div>
        </Sec>
        <Sec k="jugador-mascota" titulo="Mascota" extra={d.mascota ? `${d.mascota.emoji} ${d.mascota.nombre}` : 'Sin mascota'}>
          <div className="bloque vidrio">
            {d.mascota
              ? <><Kv k="Mascota" v={`${d.mascota.emoji} ${d.mascota.nombre}`} /><Kv k="Tipo" v={d.mascota.tipo} /><Kv k="Nivel" v={`${d.mascota.nivel}/${d.mascota.max}`} /></>
              : <p className="mut peq">No tiene mascota.</p>}
            {d.mascotaCasa ? <Kv k="En casa" v={`${d.mascotaCasa.emoji} ${d.mascotaCasa.nombre} · Nv ${d.mascotaCasa.nivel}/${d.mascotaCasa.max}`} /> : null}
          </div>
        </Sec>
        <Sec k="jugador-clan" titulo="Clan" extra={d.clan ? d.clan.nombre : 'Sin clan'}>
          <div className="bloque vidrio">
            {d.clan
              ? <><Kv k="Clan" v={d.clan.nombre + (d.clan.lider ? ' · Líder' : '')} /><Kv k="Nivel del clan" v={'Nv ' + d.clan.nivel} /><Kv k="Miembros" v={`${d.clan.miembros}/${d.clan.cupo}`} /></>
              : <p className="mut peq">No pertenece a ningún clan.</p>}
          </div>
        </Sec>
        <Sec k="jugador-coleccion" titulo="Colección">
          <div className="bloque vidrio">
            <Kv k="Reliquias" v={`${reliquias.n ?? 0}/${reliquias.total ?? 0}`} />
            <Kv k="Hogar" v={d.hogar ? `${d.hogar.emoji} ${d.hogar.nombre}` : 'Sin hogar'} />
            <Kv k="Récord de mazmorra" v={d.mazmorra ? 'Piso ' + d.mazmorra : 'Sin explorar'} />
          </div>
        </Sec>
      </div>
    </div>
  );
}
