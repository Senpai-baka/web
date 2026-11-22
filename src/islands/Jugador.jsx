import React from 'react';
import { fmt } from '../lib/format.js';
import { volverJugador, irA } from '../bridge/acciones.js';
import { Avatar, Sec, Cifras, Kv } from './ui.jsx';

const num = v => fmt(Number(v || 0));

const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5 L8 12 L15 19" /></svg>
);

export default function Jugador({ d }) {
  const pct = d.xpSig ? Math.min(100, Number(d.xp || 0) / d.xpSig * 100) : 0;
  const s = d.stats || {};
  return (
    <div className="fc jg">
      <button type="button" className="lg-atras" onClick={volverJugador}><Chevron />Volver</button>
      <section className="fc-pase">
        <div className="fc-id">
          <div className="fc-anillo">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="fc-pista" cx="50" cy="50" r="45" pathLength="100" />
              <circle className="fc-prog" cx="50" cy="50" r="45" pathLength="100" strokeDasharray={pct.toFixed(1) + ' 100'} />
            </svg>
            <Avatar r={{ ref: d.ref, nombre: d.alias, foto: d.foto, fotoUrl: d.fotoUrl, yo: !!d.yo }} />
          </div>
          <div className="fc-quien">
            <h1 className="pag">{d.alias}</h1>
            <div className="fc-rol">
              <span>Nivel {d.nivel}</span>
              {d.empleo ? <em>{d.empleo.nombre}</em> : null}
            </div>
            <span className="fc-xp"><b>{num(d.xp)}</b> de {num(d.xpSig)} XP</span>
          </div>
        </div>
        <dl className="fc-sello">
          <div><dd>{d.prestigio?.n ?? 0}/{d.prestigio?.max ?? 0}</dd><dt>Prestigio</dt></div>
          <div><dd>{d.mazmorra ? d.mazmorra : '—'}</dd><dt>Piso récord</dt></div>
          <div><dd>{d.reliquias?.n ?? 0}/{d.reliquias?.total ?? 0}</dd><dt>Reliquias</dt></div>
        </dl>
      </section>
      {d.yo && (
        <div className="jg-yo">
          <p>Así te ven los demás jugadores. Tu cartera y tu banco no se muestran.</p>
          <button type="button" className="mini" onClick={() => irA('ficha')}>Ir a mi perfil</button>
        </div>
      )}
      <div className="fc-cuerpo">
        <Sec k="jugador-atributos" titulo="Atributos" abierta>
          <Cifras lista={[['Fuerza', s.fuerza ?? 0], ['Vigor', s.vigor ?? 0], ['Suerte', s.suerte ?? 0]]} />
        </Sec>
        <Sec k="jugador-heroe" titulo="Héroe" extra={d.clase ? `${d.clase.emoji} ${d.clase.nombre}` : 'Sin clase'} abierta>
          <div className="bloque vidrio">
            {d.clase
              ? <Kv k="Clase" v={`${d.clase.emoji} ${d.clase.nombre}`} />
              : <p className="mut peq">Todavía no eligió una clase.</p>}
          </div>
        </Sec>
        <Sec k="jugador-mascota" titulo="Mascota" extra={d.mascota ? `${d.mascota.emoji} ${d.mascota.nombre}` : 'Sin mascota'} abierta>
          <div className="bloque vidrio">
            {d.mascota
              ? <><Kv k="Mascota" v={`${d.mascota.emoji} ${d.mascota.nombre}`} /><Kv k="Tipo" v={d.mascota.tipo} /><Kv k="Nivel" v={`${d.mascota.nivel}/${d.mascota.max}`} /></>
              : <p className="mut peq">No tiene mascota.</p>}
            {d.mascotaCasa ? <Kv k="En casa" v={`${d.mascotaCasa.emoji} ${d.mascotaCasa.nombre} · Nv ${d.mascotaCasa.nivel}/${d.mascotaCasa.max}`} /> : null}
          </div>
        </Sec>
        <Sec k="jugador-clan" titulo="Clan" extra={d.clan ? d.clan.nombre : 'Sin clan'} abierta>
          <div className="bloque vidrio">
            {d.clan
              ? <><Kv k="Clan" v={d.clan.nombre + (d.clan.lider ? ' · Líder' : '')} /><Kv k="Nivel del clan" v={'Nv ' + d.clan.nivel} /><Kv k="Miembros" v={`${d.clan.miembros}/${d.clan.cupo}`} /></>
              : <p className="mut peq">No pertenece a ningún clan.</p>}
          </div>
        </Sec>
        <Sec k="jugador-coleccion" titulo="Colección" abierta>
          <div className="bloque vidrio">
            <Kv k="Reliquias" v={`${d.reliquias?.n ?? 0}/${d.reliquias?.total ?? 0}`} />
            <Kv k="Hogar" v={d.hogar ? `${d.hogar.emoji} ${d.hogar.nombre}` : 'Sin hogar'} />
            <Kv k="Récord de mazmorra" v={d.mazmorra ? 'Piso ' + d.mazmorra : 'Sin explorar'} />
          </div>
        </Sec>
      </div>
    </div>
  );
}
