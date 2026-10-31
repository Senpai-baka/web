import { api } from '../lib/api.js';
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

export function aplicar(d) {
  vigilarBot(d);
  const fin = {};
  const tot = {};
  for (const k in ACC) {
    fin[k] = Date.now() + (d.esperas[k] || 0) * 1000;
    if (d.totales ? d.totales[k] !== undefined : true) tot[k] = d.totales ? d.totales[k] : ACC[k].tot;
  }
  cambiar({ me: d, meT: Date.now(), fin, tot });
  gancho.tick();
  anunciarRaid();
  cargarEventos();
  if (!sondeoReciente()) sondearAbiertas();
}

export function limpiarTabs() {
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
  let d;
  try {
    d = await api('/api/me');
  } catch (err) {
    cambiar({ vista: 'login' });
    if (err && err.estado === 401) return;
    console.error('[isla] no se pudo restaurar la sesión', err);
    cambiar({ errLogin: 'No pude conectar con Isla. Reintentando…' });
    reintento = setTimeout(arrancar, 5000);
    return;
  }
  cambiar({ errLogin: '' });
  try { aplicar(d); } catch (err) { console.error('[isla] error al pintar el panel', err); }
  cambiar({ vista: 'panel' });
  abrir(location.hash.slice(1) || 'inicio');
}

store.hooks.aviso = (txt, ms) => aviso(txt, ms);
store.hooks.sesionCaducada = () => sesionCaducada();
