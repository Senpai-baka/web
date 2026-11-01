import { useSyncExternalStore } from 'react';
import { api } from '../lib/api.js';
import { sincronizar } from '../core/reloj.js';

const SEL0 = {
  perfilSel: 'ficha', invSel: 'objetos', tiendaSel: 'tienda', merPag: 1, subPag: 1, hogarSel: 'mascota',
  ciudadSel: 'banco', jugQ: '', gachaSel: 'invocar', gachaPag: 1, gtQ: '', gtRef: '', gtPm: 1, gtPs: 1, gtMia: 0, gtSuya: 0, clanQ: '', jugRef: '', jugVolver: 'rankings',
};
const enc = encodeURIComponent;

export const sel = { ...SEL0 };
export const cache = {};
export const errores = {};

export const RUTAS = {
  ficha: () => ({ historial: '/api/historial', heroe: '/api/heroe', progreso: '/api/progreso', owner: '/api/owner' }[sel.perfilSel] || '/api/ficha'),
  inventario: () => (sel.invSel === 'equipo' ? '/api/equipo' : sel.invSel === 'forja' ? '/api/forja' : '/api/inventario'),
  tienda: () => (sel.tiendaSel === 'mercado' ? '/api/mercado?pagina=' + sel.merPag : sel.tiendaSel === 'subastas' ? '/api/subastas?pagina=' + sel.subPag : '/api/' + sel.tiendaSel),
  hogar: () => '/api/' + sel.hogarSel,
  ciudad: () => (sel.ciudadSel === 'jugadores' ? '/api/jugadores?q=' + enc(sel.jugQ) : '/api/' + sel.ciudadSel),
  rankings: () => '/api/rankings',
  gacha: () => (sel.gachaSel === 'coleccion' ? '/api/gacha/coleccion?pagina=' + sel.gachaPag
    : sel.gachaSel === 'tratos' ? '/api/gacha/trato?q=' + enc(sel.gtQ) + '&ref=' + enc(sel.gtRef) + '&pm=' + sel.gtPm + '&ps=' + sel.gtPs : '/api/gacha'),
  raid: () => '/api/raid',
  mazmorra: () => '/api/mazmorra',
  sala: () => '/api/sala',
  encargos: () => '/api/encargos',
  encuentro: () => '/api/encuentro',
  alquimia: () => '/api/alquimia',
  mundial: () => '/api/mundial',
  clan: () => '/api/clan?q=' + enc(sel.clanQ),
  jugador: () => '/api/perfil?ref=' + enc(sel.jugRef),
};

export const hooks = { aviso: () => {}, sesionCaducada: () => {} };

const versiones = {};
const subs = new Set();
let sesion = 0;

const CLAVE_POS = 'isla_pos';
const pos = (() => {
  try { return JSON.parse(sessionStorage.getItem(CLAVE_POS) || '{}') || {}; } catch (_) { return {}; }
})();
const pendientes = {};
let guardando = 0;

function volcarPos() {
  clearTimeout(guardando);
  try { sessionStorage.setItem(CLAVE_POS, JSON.stringify(pos)); } catch (_) {}
}
function persistirPos() {
  clearTimeout(guardando);
  guardando = setTimeout(volcarPos, 250);
}

export const guardarPos = (t, y = window.scrollY) => {
  pos[t] = Math.max(0, Math.round(y));
  persistirPos();
};
export const volcarAhora = volcarPos;
export const olvidarPos = t => {
  delete pos[t];
  delete pendientes[t];
  persistirPos();
};
export const hayPendiente = t => pendientes[t] !== undefined;
export const soltarPendiente = t => { delete pendientes[t]; };

export function restaurarPos(t) {
  const y = pendientes[t] !== undefined ? pendientes[t] : (pos[t] || 0);
  window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  if (Math.abs(window.scrollY - y) <= 2) delete pendientes[t];
  else pendientes[t] = y;
}

export const subscribe = f => { subs.add(f); return () => subs.delete(f); };
export const versionDe = t => versiones[t] || 0;
export const sesionActual = () => sesion;

export function notificar(t) {
  versiones[t] = versionDe(t) + 1;
  sincronizar();
  subs.forEach(f => f());
}

export const vista = t => (cache[t] && cache[t].s) || sel;

const turno = {};

export async function cargar(t, forzar) {
  const c = cache[t];
  if (!forzar && c && !c.viejo && Date.now() - c.t <= 20000) return notificar(t);
  const miTurno = (turno[t] = (turno[t] || 0) + 1);
  const s = { ...sel };
  try {
    const d = await api(RUTAS[t]());
    if (miTurno !== turno[t]) return;
    cache[t] = { d, t: Date.now(), s };
    delete errores[t];
    notificar(t);
  } catch (e) {
    if (miTurno !== turno[t]) return;
    if (e.estado === 401) return hooks.sesionCaducada();
    if (cache[t]) hooks.aviso(e.message);
    else { errores[t] = e.message; notificar(t); }
  }
}

export function fijar(t, cambios) {
  Object.assign(sel, cambios);
  return cargar(t, true);
}

export function vaciar() { for (const t in cache) cache[t].viejo = true; }

export function reiniciar() {
  for (const t in cache) delete cache[t];
  for (const t in errores) delete errores[t];
  for (const t in turno) turno[t]++;
  Object.assign(sel, SEL0);
  for (const t in pos) delete pos[t];
  for (const t in pendientes) delete pendientes[t];
  persistirPos();
  sesion++;
  subs.forEach(f => f());
}

export const usePestana = t => useSyncExternalStore(subscribe, () => versionDe(t) + sesion * 1e6, () => 0);
