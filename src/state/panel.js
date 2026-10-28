// Estado del panel: qué sección/página/búsqueda hay elegida en cada pestaña, los datos cargados y la carga misma.
// Antes vivía en variables sueltas de public/js/app.js (cargado, ciudadSel, gachaSel, gtMia…).
//
// Reglas que conserva del legacy:
//  - Cambiar una sección NO repinta de inmediato: la pantalla anterior sigue visible hasta que llegan los datos nuevos.
//    Por eso cada respuesta guarda la selección con la que se pidió (`s`) y las islas leen de ahí (`vista`).
//  - Los datos duran 20 s; pasado ese tiempo, abrir la pestaña vuelve a pedirlos.
//  - Un 401 cierra la sesión; cualquier otro error es una pantalla con "Reintentar" si no hay datos, o un aviso si ya los hay.
import { useSyncExternalStore } from 'react';
import { api } from '../lib/api.js';

const SEL0 = {
  perfilSel: 'ficha', invSel: 'objetos', tiendaSel: 'tienda', merPag: 1, subPag: 1, hogarSel: 'mascota',
  ciudadSel: 'banco', jugQ: '', gachaSel: 'invocar', gachaPag: 1, gtQ: '', gtRef: '', gtPm: 1, gtPs: 1, gtMia: 0, gtSuya: 0, clanQ: '',
};
const enc = encodeURIComponent;

/** Selecciones vivas (lo que el usuario acaba de tocar). Se leen y se escriben directamente: store.sel.ciudadSel = 'casino'. */
export const sel = { ...SEL0 };
/** Datos por pestaña: { d, t (cuándo llegaron), s (selección con la que se pidieron), viejo }. */
export const cache = {};
/** Mensaje de error de la última carga fallida, solo mientras la pestaña no tiene datos. */
export const errores = {};

// Ruta de la API de cada pestaña (con las selecciones vivas en el momento de pedir).
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

/** Lo que app.js (script clásico) le pasa al store: avisos y cierre de sesión. */
export const hooks = { aviso: () => {}, sesionCaducada: () => {} };

/* ---------- suscripciones: cada pestaña se repinta solo cuando cambia lo suyo ---------- */
const versiones = {};
const subs = new Set();
let sesion = 0;
let scrollY = 0;

export const subscribe = f => { subs.add(f); return () => subs.delete(f); };
export const versionDe = t => versiones[t] || 0;
export const sesionActual = () => sesion;
export const scrollGuardado = () => scrollY;

/** Avisa a la pestaña `t` de que debe repintarse. Guarda el scroll para devolverlo tras el repintado. */
export function notificar(t) {
  scrollY = window.scrollY;
  versiones[t] = versionDe(t) + 1;
  subs.forEach(f => f());
}

/** Vista de la pestaña: la selección que corresponde a los datos que se están mostrando. */
export const vista = t => (cache[t] && cache[t].s) || sel;

/* ---------- carga ---------- */
const turno = {};

/** Pide los datos de una pestaña si hacen falta (no hay, son viejos o se fuerza). */
export async function cargar(t, forzar) {
  const c = cache[t];
  if (!forzar && c && !c.viejo && Date.now() - c.t <= 20000) return notificar(t);
  const miTurno = (turno[t] = (turno[t] || 0) + 1);
  const s = { ...sel };
  try {
    const d = await api(RUTAS[t]());
    if (miTurno !== turno[t]) return; // llegó otra petición más reciente de esta pestaña: esta ya no vale
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

/** Cambia selecciones de una pestaña y la vuelve a pedir. Equivale a "asignar variables; delete cargado.x; abrir(x, true)". */
export function fijar(t, cambios) {
  Object.assign(sel, cambios);
  return cargar(t, true);
}

/** Marca todo como viejo: la próxima vez que se abra cada pestaña se vuelve a pedir. No repinta (la pantalla actual se queda). */
export function vaciar() { for (const t in cache) cache[t].viejo = true; }

/** Cierre de sesión o cambio de cuenta: borra todo y las pestañas se montan de cero. */
export function reiniciar() {
  for (const t in cache) delete cache[t];
  for (const t in errores) delete errores[t];
  for (const t in turno) turno[t]++;
  Object.assign(sel, SEL0);
  sesion++;
  subs.forEach(f => f());
}

/** Hook para el anfitrión de una pestaña. */
export const usePestana = t => useSyncExternalStore(subscribe, () => versionDe(t) + sesion * 1e6, () => 0);
