import React from 'react';
import { Cab, Sec, Cifras, Accion, Countdown, Vacio } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { fmt } from '../lib/format.js';
import Progreso from './Progreso.jsx';
import PerfilTop, { Salir } from './PerfilTop.jsx';
import PerfilHeroe from './PerfilHeroe.jsx';
import PerfilHistorial from './PerfilHistorial.jsx';
import PerfilOwner from './PerfilOwner.jsx';
import { perfilSeccion } from '../bridge/acciones.js';

const fmtN = v => fmt(Number(v || 0));
const porcentaje = (v, max) => max > 0 ? Math.max(0, Math.min(100, Number(v || 0) / max * 100)) : 0;
function Kv({ label, children }) { return <div className="kv"><span>{label}</span><b>{children ?? '—'}</b></div>; }
function BarraStat({ nombre, valor, max }) { return <div className="stat-r"><span className="si-ic">{nombre === 'Fuerza' ? '⚔️' : nombre === 'Vigor' ? '❤️' : '🍀'}</span><div><div className="fila"><span>{nombre}</span><b>{fmtN(valor)}</b></div><div className="barra"><div style={{ width: `${porcentaje(valor, max || Math.max(10, Number(valor || 0) * 1.25))}%` }} /></div></div></div>; }
function PerfilFicha({ d, base }) {
  const me = useMe();
  const stats = d.stats || {};
  const energia = d.energia || { n: 0, max: 0, faltaS: 0 };
  const m = d.mascota;
  const c = d.clan;
  const b = d.boosts || {};
  const avisos = [];
  if (stats.libres) avisos.push(`🎯 Tienes ${stats.libres} punto${stats.libres === 1 ? '' : 's'} de atributo libre${stats.libres === 1 ? '' : 's'}. Repártelos en Héroe.`);
  if (d.talentosLibres) avisos.push(`🌳 Tienes ${d.talentosLibres} punto${d.talentosLibres === 1 ? '' : 's'} de talento libre${d.talentosLibres === 1 ? '' : 's'}. Úsalos en Héroe.`);
  const pctXp = me?.xpSig ? porcentaje(me.xp, me.xpSig) : 0;
  return <>
    <Cab titulo="Perfil" sub="Tu ficha, estadísticas y progreso." stats={[["Nivel", me?.nivel ?? d.nivel ?? '—'], ["Monedas", fmtN(d.cartera)], ["Prestigio", `${d.prestigio?.n ?? 0}/${d.prestigio?.max ?? 0}`]]}/>
    <section className="perfil"><div className="hero-in"><div className="quien"><h1>{me?.alias || 'Aventurero'}</h1><span className="peq mut">Nivel {me?.nivel ?? d.nivel ?? '—'}{d.empleo?.nombre ? ` · ${d.empleo.nombre}` : ''}</span><div className="xpb"><div style={{ width: `${pctXp}%` }} /></div><span className="peq mut">{fmtN(me?.xp)} / {fmtN(me?.xpSig)} XP</span></div></div></section>
    <div className="seg" role="group" aria-label="Sección del perfil">
      {[['ficha','Ficha'],['heroe','Héroe'],['progreso','Progreso'],['historial','Recuerdos'],...(me?.owner ? [['owner','Owner']] : [])].map(([key,label]) => <button key={key} type="button" data-p={key} aria-pressed={key === 'ficha'}>{label}</button>)}
    </div>
    {avisos.length > 0 && <div className="aviso-i">{avisos.map(x => <p key={x}>{x}</p>)}</div>}
    <Sec k="perfil-finanzas-react" titulo="Finanzas"><Cifras lista={[["Cartera", fmtN(d.cartera)], ["Banco", fmtN(d.banco)], ["Total", fmtN(d.total)]]}/><div className="bloque vidrio"><Kv label="Bono de ingresos">+{d.bonoIngresos || 0}%</Kv><Kv label="Prestigio">{d.prestigio?.n ?? 0}/{d.prestigio?.max ?? 0}{d.prestigio?.bono ? ` · +${d.prestigio.bono}%` : ''}</Kv></div></Sec>
    <Sec k="perfil-atributos-react" titulo="Atributos"><div className="bloque vidrio"><BarraStat nombre="Fuerza" valor={stats.fuerza}/><BarraStat nombre="Vigor" valor={stats.vigor}/><BarraStat nombre="Suerte" valor={stats.suerte}/></div></Sec>
    {(b.escudoS || b.xpS) && <Sec k="perfil-activos-react" titulo="Activos"><div className="bloque vidrio">{b.escudoS > 0 && <Kv label="Escudo anti-robo"><Countdown fin={base + b.escudoS * 1000}/></Kv>}{b.xpS > 0 && <Kv label="Boost de XP x2"><Countdown fin={base + b.xpS * 1000}/></Kv>}</div></Sec>}
    <Sec k="perfil-heroe-react" titulo="Héroe" extra={d.clase ? `${d.clase.emoji || '⚔️'} ${d.clase.nombre}` : 'Sin clase'}>
      <div className="bloque vidrio">{d.clase ? <><Kv label="Clase">{d.clase.emoji} {d.clase.nombre}</Kv><p className="mut peq">{d.clase.desc}</p><Kv label="Energía">{energia.n}/{energia.max}</Kv>{energia.n < energia.max && <Kv label="Próxima energía"><Countdown fin={base + (energia.faltaS || 0) * 1000}/></Kv>}</> : <p className="mut peq">Sin clase todavía. Se elige desde el nivel {d.nivelClase ?? 'requerido'} en la sección Héroe.</p>}</div>
    </Sec>
    <Sec k="perfil-mascota-react" titulo="Mascota" extra={m ? `${m.emoji || '🐾'} ${m.nombre}` : 'Sin mascota'}>
      <div className="bloque vidrio">{m ? <><Kv label="Mascota">{m.emoji} {m.nombre}{m.activa ? '' : ' · Descansando'}</Kv><Kv label="Nivel">{m.nivel}/{m.max}</Kv><p className="mut peq">{m.tipo}: {m.desc}{m.activa ? '' : '. Aliméntala con /pet para reactivar su bono.'}</p></> : <p className="mut peq">Aún no tienes mascota. Puedes adoptar una con /pet en WhatsApp.</p>}</div>
    </Sec>
    <Sec k="perfil-clan-react" titulo="Clan" extra={c?.nombre || 'Sin clan'}><div className="bloque vidrio">{c ? <><Kv label="Clan">{c.nombre}{c.lider ? ' · Líder' : ''}</Kv><Kv label="Nivel del clan">Nv {c.nivel}</Kv><Kv label="Miembros">{c.miembros}/{c.cupo}</Kv><Kv label="Banco del clan">{fmtN(c.banco)} monedas</Kv><Kv label="Bono de ingresos">+{c.bono}%</Kv><Kv label="Guerra de clanes">{fmtN(c.guerra?.pts)} pts{c.guerra?.puesto ? ` · puesto ${c.guerra.puesto}` : ''}</Kv>{c.guerra && <Kv label="Cierra en"><Countdown fin={base + (c.guerra.cierraS || 0) * 1000}/></Kv>}</> : <p className="mut peq">No perteneces a ningún clan. Crea uno o únete desde la sección Clan.</p>}</div></Sec>
    <Sec k="perfil-coleccion-react" titulo="Colección"><div className="bloque vidrio"><Kv label="Reliquias">{d.reliquias?.n ?? 0}/{d.reliquias?.total ?? 0}</Kv><Kv label="Hogar">{d.hogar ? `${d.hogar.emoji || '🏠'} ${d.hogar.nombre}` : 'Sin hogar'}</Kv><Kv label="Récord de mazmorra">{d.mazmorra ? `Piso ${d.mazmorra}` : 'Sin explorar'}</Kv></div></Sec>
    <Sec k="perfil-avisos-react" titulo="Avisos por WhatsApp" extra={d.avisosWa ? 'Activados' : 'Apagados'}><p className="mut peq">Te escribimos cuando termine una expedición o te superen en una subasta.</p><div className="btns uno"><Accion ruta="/api/avisos" cuerpo={{ activo: !d.avisosWa }}>{d.avisosWa ? 'Desactivar avisos' : 'Activar avisos'}</Accion></div></Sec>
    <button type="button" className="link salir" data-salir>Cerrar sesión</button>
  </>;
}

// Héroe, Recuerdos y Owner comparten el mismo marco (resumen + selector + "Cerrar sesión") que tenía el legacy.
const VISTAS = { heroe: PerfilHeroe, historial: PerfilHistorial, owner: PerfilOwner };

export default function Perfil({ d, base }) {
  const selected = perfilSeccion();
  if (selected === 'progreso') return <Progreso d={d || {}} base={base || Date.now()} />;
  const Vista = VISTAS[selected];
  if (Vista) {
    return (
      <>
        <PerfilTop activo={selected} />
        <Vista d={d || {}} base={base || Date.now()} />
        <Salir />
      </>
    );
  }
  return <PerfilFicha d={d || {}} base={base || Date.now()}/>;
}
