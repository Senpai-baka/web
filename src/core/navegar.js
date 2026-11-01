import * as store from '../state/panel.js';
import { e, cambiar } from './estado.js';
import { TABS } from './datos.js';

export const dibujar = t => {
  if (store.cache[t]) store.notificar(t);
};

export async function abrir(t, forzar) {
  if (t === 'historial' || t === 'heroe') {
    store.sel.perfilSel = t;
    t = 'ficha';
  }
  if (!TABS.includes(t)) t = 'inicio';
  if (t === 'jugador' && !store.sel.jugRef) t = 'rankings';
  const cambio = e.tab !== t;
  if (cambio) {
    store.guardarPos(e.tab);
    store.soltarPendiente(e.tab);
  }
  cambiar({ tab: t });
  try { history.replaceState(null, '', t === 'inicio' ? location.pathname : '#' + t); } catch (_) {}
  if (t === 'inicio') return;
  return store.cargar(t, forzar);
}

export function verJugador(ref) {
  if (!ref) return undefined;
  if (e.tab !== 'jugador') store.sel.jugVolver = e.tab;
  store.sel.jugRef = ref;
  store.olvidarPos('jugador');
  delete store.cache.jugador;
  return abrir('jugador', true);
}

export const volverDeJugador = () => abrir(store.sel.jugVolver || 'rankings');

export function irPerfil(seccion) {
  store.sel.perfilSel = seccion;
  store.olvidarPos('ficha');
  delete store.cache.ficha;
  return abrir('ficha', true);
}

export function irGacha() {
  const g = e.eventos.gacha;
  const ahora = Date.now();
  const hayTrato = g && g.trato > ahora && !(g.pend > ahora) && !e.abiertas.some(a => a.fin > ahora);
  store.sel.gachaSel = hayTrato ? 'tratos' : 'invocar';
  store.sel.gachaPag = 1;
  store.olvidarPos('gacha');
  return abrir('gacha', true);
}
