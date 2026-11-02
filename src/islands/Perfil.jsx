import React from 'react';
import { Sec, Cifras, Accion, Countdown } from './ui.jsx';
import { fmt } from '../lib/format.js';
import Progreso from './Progreso.jsx';
import PerfilTop, { Salir } from './PerfilTop.jsx';
import PerfilHistorial from './PerfilHistorial.jsx';
import PerfilOwner from './PerfilOwner.jsx';
import FotoPerfil from './FotoPerfil.jsx';
import { perfilSeccion } from '../bridge/acciones.js';

const fmtN = v => fmt(Number(v || 0));
const plural = (n, uno, varios) => n === 1 ? uno : varios;

function Kv({ label, children }) {
  return <div className="kv"><span>{label}</span><b>{children ?? '—'}</b></div>;
}

function Pendientes({ d }) {
  const libres = d.stats?.libres || 0;
  const talentos = d.talentosLibres || 0;
  if (!libres && !talentos) return null;
  return (
    <div className="aviso-i">
      {libres > 0 && <p>🎯 Tienes {libres} {plural(libres, 'punto de atributo libre', 'puntos de atributo libres')}. Repártelos en RPG → Héroe.</p>}
      {talentos > 0 && <p>🌳 Tienes {talentos} {plural(talentos, 'punto de talento libre', 'puntos de talento libres')}. Úsalos en RPG → Héroe.</p>}
    </div>
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
        {d.mascotaCasa ? <Kv label="En casa">{d.mascotaCasa.emoji} {d.mascotaCasa.nombre} · Nv {d.mascotaCasa.nivel}/{d.mascotaCasa.max}</Kv> : null}
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

function PerfilFicha({ d, base }) {
  return (
    <>
      <Pendientes d={d} />
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

const VISTAS = { ficha: PerfilFicha, progreso: Progreso, historial: PerfilHistorial, owner: PerfilOwner };

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
