import { api, hooks } from '../lib/api.js';
import * as store from '../state/panel.js';
import { e, cambiar, gancho } from './estado.js';
import { ACC } from './datos.js';
import { aviso, anunciarRaid } from './avisos.js';
import { abrir } from './navegar.js';
import { cargarEventos, sondearAbiertas, sondeoReciente, reiniciarEventos } from './eventos.js';

let botCaidoDesde = 0;
let botAvisadoT = 0;

function vigilarBot(d) {
  if (d.bot !== false) {
    botCaidoDesde = 0;
    return;
  }
  const ahora = Date.now();
  if (!botCaidoDesde) {
    botCaidoDesde = ahora;
    return;
  }
  if (ahora - botCaidoDesde >= 45000 && ahora - botAvisadoT >= 15 * 60 * 1000) {
    botAvisadoT = ahora;
    aviso('El bot está reconectando. Algunas acciones pueden tardar.', 4000);
  }
}

const CLAVE_CACHE = 'isla_me';
const VIDA_CACHE = 12 * 60 * 60 * 1000;

function guardarCache(d, t) {
  try { localStorage.setItem(CLAVE_CACHE, JSON.stringify({ t, me: d })); } catch (_) {}
}

function leerCache() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE_CACHE) || 'null');
    return g && g.me && g.me.esperas && Date.now() - g.t < VIDA_CACHE ? g : null;
  } catch (_) {
    return null;
  }
}

function borrarCache() {
  try { localStorage.removeItem(CLAVE_CACHE); } catch (_) {}
}

export function aplicar(d, instante) {
  const t = instante || Date.now();
  vigilarBot(d);
  const fin = {};
  const tot = {};
  for (const k in ACC) {
    fin[k] = t + (d.esperas[k] || 0) * 1000;
    if (d.totales ? d.totales[k] !== undefined : true) tot[k] = d.totales ? d.totales[k] : ACC[k].tot;
  }
  cambiar({ me: d, meT: t, fin, tot });
  if (!instante) guardarCache(d, t);
  gancho.tick();
  anunciarRaid();
  cargarEventos();
  if (!sondeoReciente()) sondearAbiertas();
}

export function limpiarTabs() {
  borrarCache();
  cambiar({ me: null, listas: 0 });
  reiniciarEventos();
  store.reiniciar();
}

export function sesionCaducada() {
  cambiar({ me: null });
  store.vaciar();
  limpiarTabs();
  aviso('Tu sesión caducó. Conéctate de nuevo.');
  cambiar({ vista: 'login' });
}

export async function refrescar() {
  try {
    aplicar(await api('/api/me'));
  } catch (err) {
    if (err.estado === 401) sesionCaducada();
  }
}

export async function entrar(codigo) {
  await api('/api/auth/login', { codigo });
  e.previa = {};
  store.vaciar();
  limpiarTabs();
  aplicar(await api('/api/me'));
  cambiar({ errLogin: '', vista: 'panel' });
  abrir('inicio');
}

export async function salir() {
  try { await api('/api/auth/logout', {}); } catch (_) {}
  cambiar({ me: null });
  store.vaciar();
  e.previa = {};
  limpiarTabs();
  cambiar({ vista: 'login' });
}

let reintento = 0;

export async function arrancar() {
  clearTimeout(reintento);
  if (e.me) return;
  const guardado = leerCache();
  if (guardado) {
    aplicar(guardado.me, guardado.t);
    cambiar({ vista: 'panel' });
    abrir(location.hash.slice(1) || 'inicio');
  }
  let d;
  try {
    d = await api('/api/me');
  } catch (err) {
    if (guardado) {
      if (err && err.estado === 401) {
        limpiarTabs();
        cambiar({ vista: 'login' });
      }
      return;
    }
    if (err && err.estado === 503 && err.datos && err.datos.mantenimiento) return;
    cambiar({ vista: 'login' });
    if (err && err.estado === 401) return;
    console.error('[isla] no se pudo restaurar la sesión', err);
    cambiar({ errLogin: 'No pude conectar con Isla. Reintentando…' });
    reintento = setTimeout(arrancar, 5000);
    return;
  }
  cambiar({ errLogin: '' });
  try { aplicar(d); } catch (err) { console.error('[isla] error al pintar el panel', err); }
  if (!guardado) {
    cambiar({ vista: 'panel' });
    abrir(location.hash.slice(1) || 'inicio');
  }
}

store.hooks.aviso = (txt, ms) => aviso(txt, ms);
store.hooks.sesionCaducada = () => sesionCaducada();

let sondeoMant = 0;

function sondearMantenimiento() {
  clearTimeout(sondeoMant);
  sondeoMant = setTimeout(async () => {
    if (e.vista !== 'mantenimiento') return;
    try {
      const d = await api('/api/mantenimiento');
      if (!d.activo) {
        cambiar({ mant: null, me: null });
        return arrancar();
      }
      cambiar({ mant: d });
    } catch (_) {}
    sondearMantenimiento();
  }, 15000);
}

export function verLoginOwner() {
  clearTimeout(sondeoMant);
  cambiar({ vista: 'login' });
}

hooks.mantenimiento = d => {
  if (e.vista === 'mantenimiento') {
    cambiar({ mant: { activo: true, mensaje: d.mensaje, hasta: d.hasta } });
    return;
  }
  cambiar({ vista: 'mantenimiento', mant: { activo: true, mensaje: d.mensaje, hasta: d.hasta } });
  sondearMantenimiento();
};
