import React from 'react';
import { fmt } from '../lib/format.js';
import { volverJugador, irA } from '../bridge/acciones.js';
import { Cab, Sec, Cifras, Kv } from './ui.jsx';

const ICONO = (
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21" />
  </>
);

const num = v => fmt(Number(v || 0));

export default function Jugador({ d }) {
  const pct = d.xpSig ? Math.min(100, d.xp / d.xpSig * 100) : 0;
  const s = d.stats;
  return (
    <>
      <button type="button" className="atras" onClick={volverJugador}>← Volver</button>
      <Cab
        titulo={d.alias}
        sub={d.empleo ? `${d.empleo.emoji} ${d.empleo.nombre}` : 'Jugador de Isla'}
        icono={ICONO}
        stats={[['Nivel', d.nivel], ['Prestigio', `${d.prestigio.n}/${d.prestigio.max}`], ['Mazmorra', d.mazmorra ? 'Piso ' + d.mazmorra : '—']]}
      />
      <section className="perfil">
        <div className="hero-in">
          <div className="quien">
            <h1>{d.alias}</h1>
            <span className="peq mut">Nivel {d.nivel}</span>
            <div className="xpb"><div style={{ width: pct + '%' }} /></div>
            <span className="peq mut">{num(d.xp)} / {num(d.xpSig)} XP</span>
          </div>
        </div>
      </section>
      {d.yo && (
        <div className="bloque vidrio">
          <p className="peq">Así te ven los demás jugadores. Tu cartera y tu banco no se muestran.</p>
          <div className="btns uno"><button type="button" className="mini" onClick={() => irA('ficha')}>Ir a mi perfil</button></div>
        </div>
      )}
      <Sec k="jugador-atributos" titulo="Atributos">
        <Cifras lista={[['Fuerza', s.fuerza], ['Vigor', s.vigor], ['Suerte', s.suerte]]} />
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
          <Kv k="Reliquias" v={`${d.reliquias.n}/${d.reliquias.total}`} />
          <Kv k="Hogar" v={d.hogar ? `${d.hogar.emoji} ${d.hogar.nombre}` : 'Sin hogar'} />
          <Kv k="Récord de mazmorra" v={d.mazmorra ? 'Piso ' + d.mazmorra : 'Sin explorar'} />
        </div>
      </Sec>
    </>
  );
}
