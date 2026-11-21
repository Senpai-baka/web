import React from 'react';
import { Sec, Countdown } from './ui.jsx';
import { fmt } from '../lib/format.js';
import Progreso from './Progreso.jsx';
import PerfilTop, { Salir } from './PerfilTop.jsx';
import PerfilHistorial from './PerfilHistorial.jsx';
import PerfilOwner from './PerfilOwner.jsx';
import FotoPerfil from './FotoPerfil.jsx';
import { Tira } from './fichaUi.jsx';
import { perfilSeccion, aviso } from '../bridge/acciones.js';
import { api } from '../lib/api.js';

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
    <div className="fc-aviso">
      {libres > 0 && <p>Tienes <b>{libres}</b> {plural(libres, 'punto de atributo libre', 'puntos de atributo libres')}. Repártelos en RPG → Héroe.</p>}
      {talentos > 0 && <p>Tienes <b>{talentos}</b> {plural(talentos, 'punto de talento libre', 'puntos de talento libres')}. Úsalos en RPG → Héroe.</p>}
    </div>
  );
}

function Finanzas({ d }) {
  const p = d.prestigio;
  return (
    <Sec k="perfil-finanzas-react" titulo="Finanzas">
      <Tira lista={[['Cartera', fmtN(d.cartera)], ['Banco', fmtN(d.banco)], ['Total', fmtN(d.total)]]} />
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

const claveBytes = txt => {
  const b = atob((txt + '='.repeat((4 - txt.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, c => c.charCodeAt(0));
};

const pushSoportado = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

async function suscripcionActual() {
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

function Avisos() {
  const [est, setEst] = React.useState('cargando');
  const [ocupado, setOcupado] = React.useState(false);

  React.useEffect(() => {
    let vivo = true;
    (async () => {
      if (!pushSoportado()) return vivo && setEst('no');
      if (Notification.permission === 'denied') return vivo && setEst('bloqueado');
      const sub = await suscripcionActual().catch(() => null);
      if (vivo) setEst(sub && Notification.permission === 'granted' ? 'on' : 'off');
    })();
    return () => { vivo = false; };
  }, []);

  const activar = async () => {
    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') { setEst('bloqueado'); return aviso('Las notificaciones están bloqueadas en tu navegador.'); }
    const reg = await navigator.serviceWorker.ready;
    const { disponible, clave } = await api('/api/push/clave');
    if (!disponible || !clave) throw new Error('Las notificaciones no están disponibles ahora mismo.');
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: claveBytes(clave) });
    await api('/api/push/suscribir', { suscripcion: sub.toJSON() });
    setEst('on');
    aviso('Notificaciones activadas en este dispositivo.');
  };

  const desactivar = async () => {
    const sub = await suscripcionActual();
    if (sub) {
      await api('/api/push/baja', { endpoint: sub.endpoint }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
    setEst('off');
    aviso('Notificaciones desactivadas en este dispositivo.');
  };

  const click = async () => {
    if (ocupado) return;
    setOcupado(true);
    try { await (est === 'on' ? desactivar() : activar()); }
    catch (e) { aviso((e && e.message) || 'No se pudo cambiar las notificaciones.'); }
    finally { setOcupado(false); }
  };

  const extra = { on: 'Activadas', off: 'Apagadas', bloqueado: 'Bloqueadas', no: 'No disponibles', cargando: '' }[est];
  return (
    <Sec k="perfil-avisos-react" titulo="Notificaciones" extra={extra}>
      <p className="mut peq">Te avisamos cuando termine una expedición, te superen en una subasta o recibas una propuesta, aunque tengas la web cerrada.</p>
      {est === 'no' && <p className="mut peq">Tu navegador no admite notificaciones. En iPhone, instala la web en la pantalla de inicio.</p>}
      {est === 'bloqueado' && <p className="mut peq">Las bloqueaste en el navegador. Permítelas desde los ajustes del sitio y vuelve a intentarlo.</p>}
      {(est === 'on' || est === 'off' || est === 'bloqueado') && (
        <div className="btns uno">
          <button type="button" className="mini" aria-disabled={ocupado ? 'true' : undefined} onClick={click}>
            {est === 'on' ? 'Desactivar en este dispositivo' : 'Activar en este dispositivo'}
          </button>
        </div>
      )}
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
      <Avisos />
      <FotoPerfil />
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
    <div className="fc">
      <PerfilTop activo={activo} empleo={activo === 'ficha' ? datos.empleo?.nombre : undefined} />
      <div className="fc-cuerpo" key={activo}>
        <Vista d={datos} base={base || Date.now()} />
      </div>
    </div>
  );
}
