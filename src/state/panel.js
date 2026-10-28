import { useSyncExternalStore } from 'react';
import { api } from '../lib/api.js';

const SEL0 = {
  perfilSel: 'ficha', invSel: 'objetos', tiendaSel: 'tienda', merPag: 1, subPag: 1, hogarSel: 'mascota',
  ciudadSel: 'banco', jugQ: '', gachaSel: 'invocar', gachaPag: 1, gtQ: '', gtRef: '', gtPm: 1, gtPs: 1, gtMia: 0, gtSuya: 0, clanQ: '',
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
  clan: () => '/api/clan?q=' + enc(sel.clanQ),
};

export const hooks = { aviso: () => {}, sesionCaducada: () => {} };

const versiones = {};
const subs = new Set();
let sesion = 0;
let scrollY = 0;

export const subscribe = f => { subs.add(f); return () => subs.delete(f); };
export const versionDe = t => versiones[t] || 0;
export const sesionActual = () => sesion;
export const scrollGuardado = () => scrollY;

export function notificar(t) {
  scrollY = window.scrollY;
  versiones[t] = versionDe(t) + 1;
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
  sesion++;
  subs.forEach(f => f());
}

export const usePestana = t => useSyncExternalStore(subscribe, () => versionDe(t) + sesion * 1e6, () => 0);
