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
  const cambio = e.tab !== t;
  cambiar({ tab: t });
  try { history.replaceState(null, '', t === 'inicio' ? location.pathname : '#' + t); } catch (_) {}
  if (cambio) window.scrollTo(0, 0);
  if (t === 'inicio') return;
  return store.cargar(t, forzar);
}

export function irPerfil(seccion) {
  store.sel.perfilSel = seccion;
  delete store.cache.ficha;
  return abrir('ficha', true);
}

export function irGacha() {
  const g = e.eventos.gacha;
  const ahora = Date.now();
  const hayTrato = g && g.trato > ahora && !(g.pend > ahora) && !e.abiertas.some(a => a.fin > ahora);
  store.sel.gachaSel = hayTrato ? 'tratos' : 'invocar';
  store.sel.gachaPag = 1;
  return abrir('gacha', true);
}
