import React from 'react';
import { Sec, Cifras, Accion, Countdown } from './ui.jsx';
import { fmt } from '../lib/format.js';
import Progreso from './Progreso.jsx';
import PerfilTop, { Salir } from './PerfilTop.jsx';
import PerfilHeroe from './PerfilHeroe.jsx';
import PerfilHistorial from './PerfilHistorial.jsx';
import PerfilOwner from './PerfilOwner.jsx';
import FotoPerfil from './FotoPerfil.jsx';
import { perfilSeccion } from '../bridge/acciones.js';

const fmtN = v => fmt(Number(v || 0));
const porcentaje = (v, max) => max > 0 ? Math.max(0, Math.min(100, Number(v || 0) / max * 100)) : 0;
const plural = (n, uno, varios) => n === 1 ? uno : varios;

function Kv({ label, children }) {
  return <div className="kv"><span>{label}</span><b>{children ?? '—'}</b></div>;
}

function BarraStat({ nombre, valor, max }) {
  const icono = nombre === 'Fuerza' ? '⚔️' : nombre === 'Vigor' ? '❤️' : '🍀';
  const tope = max || Math.max(10, Number(valor || 0) * 1.25);
  return (
    <div className="stat-r">
      <span className="si-ic">{icono}</span>
      <div>
        <div className="fila"><span>{nombre}</span><b>{fmtN(valor)}</b></div>
        <div className="barra"><div style={{ width: `${porcentaje(valor, tope)}%` }} /></div>
      </div>
    </div>
  );
}

// ---- Bloques de la ficha, de lo más usado a lo menos usado ----

function Pendientes({ d }) {
  const libres = d.stats?.libres || 0;
  const talentos = d.talentosLibres || 0;
  if (!libres && !talentos) return null;
  return (
    <div className="aviso-i">
      {libres > 0 && <p>🎯 Tienes {libres} {plural(libres, 'punto de atributo libre', 'puntos de atributo libres')}. Repártelos en Héroe.</p>}
      {talentos > 0 && <p>🌳 Tienes {talentos} {plural(talentos, 'punto de talento libre', 'puntos de talento libres')}. Úsalos en Héroe.</p>}
    </div>
  );
}

function Atributos({ d }) {
  const s = d.stats || {};
  return (
    <Sec k="perfil-atributos-react" titulo="Atributos">
      <div className="bloque vidrio">
        <BarraStat nombre="Fuerza" valor={s.fuerza} />
        <BarraStat nombre="Vigor" valor={s.vigor} />
        <BarraStat nombre="Suerte" valor={s.suerte} />
      </div>
    </Sec>
  );
}

function Heroe({ d, base }) {
  const energia = d.energia || { n: 0, max: 0, faltaS: 0 };
  return (
    <Sec k="perfil-heroe-react" titulo="Héroe" extra={d.clase ? `${d.clase.emoji || '⚔️'} ${d.clase.nombre}` : 'Sin clase'}>
      <div className="bloque vidrio">
        {d.clase ? (
          <>
            <Kv label="Clase">{d.clase.emoji} {d.clase.nombre}</Kv>
            <p className="mut peq">{d.clase.desc}</p>
            <Kv label="Energía">{energia.n}/{energia.max}</Kv>
            {energia.n < energia.max && <Kv label="Próxima energía"><Countdown fin={base + (energia.faltaS || 0) * 1000} /></Kv>}
          </>
        ) : (
          <p className="mut peq">Sin clase todavía. Se elige desde el nivel {d.nivelClase ?? 'requerido'} en la sección Héroe.</p>
        )}
      </div>
    </Sec>
  );
}

function Activos({ d, base }) {
  const b = d.boosts || {};
  if (!(b.escudoS > 0 || b.xpS > 0 || b.objetos?.length > 0)) return null;
  return (
    <Sec k="perfil-activos-react" titulo="Activos">
      <div className="bloque vidrio">
        {b.escudoS > 0 && <Kv label="Escudo anti-robo"><Countdown fin={base + b.escudoS * 1000} /></Kv>}
        {b.xpS > 0 && <Kv label="Boost de XP x2"><Countdown fin={base + b.xpS * 1000} /></Kv>}
        {(b.objetos || []).map(o => <Kv key={o.clave} label={`${o.emoji} ${o.nombre} · ${o.efecto}`}><Countdown fin={base + o.restanteS * 1000} /></Kv>)}
      </div>
    </Sec>
  );
}

function Finanzas({ d }) {
  const p = d.prestigio;
  return (
    <Sec k="perfil-finanzas-react" titulo="Finanzas">
      <Cifras lista={[['Cartera', fmtN(d.cartera)], ['Banco', fmtN(d.banco)], ['Total', fmtN(d.total)]]} />
      <div className="bloque vidrio">
        <Kv label="Bono de ingresos">+{d.bonoIngresos || 0}%</Kv>
        <Kv label="Prestigio">{p?.n ?? 0}/{p?.max ?? 0}{p?.bono ? ` · +${p.bono}%` : ''}</Kv>
      </div>
    </Sec>
  );
}

function Clan({ d, base }) {
  const c = d.clan;
  return (
    <Sec k="perfil-clan-react" titulo="Clan" extra={c?.nombre || 'Sin clan'}>
      <div className="bloque vidrio">
        {c ? (
          <>
            <Kv label="Clan">{c.nombre}{c.lider ? ' · Líder' : ''}</Kv>
            <Kv label="Nivel del clan">Nv {c.nivel}</Kv>
            <Kv label="Miembros">{c.miembros}/{c.cupo}</Kv>
            <Kv label="Banco del clan">{fmtN(c.banco)} monedas</Kv>
            <Kv label="Bono de ingresos">+{c.bono}%</Kv>
            <Kv label="Guerra de clanes">{fmtN(c.guerra?.pts)} pts{c.guerra?.puesto ? ` · puesto ${c.guerra.puesto}` : ''}</Kv>
            {c.guerra && <Kv label="Cierra en"><Countdown fin={base + (c.guerra.cierraS || 0) * 1000} /></Kv>}
          </>
        ) : (
          <p className="mut peq">No perteneces a ningún clan. Crea uno o únete desde la sección Clan.</p>
        )}
      </div>
    </Sec>
  );
}

function Mascota({ d }) {
  const m = d.mascota;
  return (
    <Sec k="perfil-mascota-react" titulo="Mascota" extra={m ? `${m.emoji || '🐾'} ${m.nombre}` : 'Sin mascota'}>
      <div className="bloque vidrio">
        {m ? (
          <>
            <Kv label="Mascota">{m.emoji} {m.nombre}{m.activa ? '' : ' · Descansando'}</Kv>
            <Kv label="Nivel">{m.nivel}/{m.max}</Kv>
            <p className="mut peq">{m.tipo}: {m.desc}{m.activa ? '' : '. Aliméntala con /pet para reactivar su bono.'}</p>
          </>
        ) : (
          <p className="mut peq">Aún no tienes mascota. Puedes adoptar una con /pet en WhatsApp.</p>
        )}
      </div>
    </Sec>
  );
}

function Coleccion({ d }) {
  return (
    <Sec k="perfil-coleccion-react" titulo="Colección">
      <div className="bloque vidrio">
        <Kv label="Reliquias">{d.reliquias?.n ?? 0}/{d.reliquias?.total ?? 0}</Kv>
        <Kv label="Hogar">{d.hogar ? `${d.hogar.emoji || '🏠'} ${d.hogar.nombre}` : 'Sin hogar'}</Kv>
        <Kv label="Récord de mazmorra">{d.mazmorra ? `Piso ${d.mazmorra}` : 'Sin explorar'}</Kv>
      </div>
    </Sec>
  );
}

function Avisos({ d }) {
  return (
    <Sec k="perfil-avisos-react" titulo="Avisos por WhatsApp" extra={d.avisosWa ? 'Activados' : 'Apagados'}>
      <p className="mut peq">Te escribimos cuando termine una expedición o te superen en una subasta.</p>
      <div className="btns uno"><Accion ruta="/api/avisos" cuerpo={{ activo: !d.avisosWa }}>{d.avisosWa ? 'Desactivar avisos' : 'Activar avisos'}</Accion></div>
    </Sec>
  );
}

// Ficha: primero lo que cambia a diario (puntos, atributos, héroe, activos, dinero), luego tu mundo (clan, mascota, colección) y al final la cuenta.
function PerfilFicha({ d, base }) {
  return (
    <>
      <Pendientes d={d} />
      <Atributos d={d} />
      <Heroe d={d} base={base} />
      <Activos d={d} base={base} />
      <Finanzas d={d} />
      <Clan d={d} base={base} />
      <Mascota d={d} />
      <Coleccion d={d} />
      <FotoPerfil />
      <Avisos d={d} />
      <Salir />
    </>
  );
}

const VISTAS = { ficha: PerfilFicha, heroe: PerfilHeroe, progreso: Progreso, historial: PerfilHistorial, owner: PerfilOwner };

export default function Perfil({ d, base }) {
  const activo = VISTAS[perfilSeccion()] ? perfilSeccion() : 'ficha';
  const Vista = VISTAS[activo];
  const datos = d || {};
  return (
    <>
      <PerfilTop activo={activo} empleo={activo === 'ficha' ? datos.empleo?.nombre : undefined} />
      <Vista d={datos} base={base || Date.now()} />
    </>
  );
}
