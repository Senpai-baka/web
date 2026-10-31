import { api } from '../lib/api.js';
import * as store from '../state/panel.js';
import { e, cambiar } from './estado.js';
import { avisarGacha, avisosActivos } from './avisos.js';
import { abrir, dibujar } from './navegar.js';

let sondeando = false;
let ultimoSondeo = 0;
let cargando = false;
let gachaVencida = false;
const vistas = new Set();

export const sondeoReciente = () => Date.now() - ultimoSondeo <= 20000;

export function reiniciarEventos() {
  vistas.clear();
  cambiar({ eventos: {}, eventosT: 0, abiertas: [] });
}

export async function cargarEventos(forzar) {
  if (!e.me || cargando || (!forzar && Date.now() - e.eventosT < 10000)) return;
  cargando = true;
  try {
    const [g, r] = await Promise.all([api('/api/gacha').catch(() => null), api('/api/raid').catch(() => null)]);
    const base = Date.now();
    const eventos = { ...e.eventos };
    if (g) eventos.gacha = { fin: base + g.esperaS * 1000, pend: g.pendiente ? base + g.pendiente.restaS * 1000 : 0, trato: g.trato ? base + g.trato.restaS * 1000 : 0 };
    if (r) {
      const vivos = (r.raids || []).filter(x => !x.dormido);
      eventos.raid = { n: vivos.length, fin: vivos.length ? Math.min(...vivos.map(x => base + x.esperaS * 1000)) : 0 };
    }
    gachaVencida = false;
    cambiar({ eventos, eventosT: Date.now() });
  } finally {
    cargando = false;
  }
}

export async function sondearAbiertas() {
  if (!e.me || sondeando) return;
  sondeando = true;
  ultimoSondeo = Date.now();
  try {
    const d = await api('/api/gacha/abiertas');
    const base = Date.now();
    const nuevas = d.abiertas.map(a => ({ id: a.id, carta: a.carta, por: a.por, fin: base + a.restaS * 1000 }));
    const cambio = nuevas.map(a => a.id).join() !== e.abiertas.map(a => a.id).join();
    cambiar({ abiertas: nuevas });
    for (const a of nuevas) {
      if (vistas.has(a.id)) continue;
      vistas.add(a.id);
      avisarGacha('🎴 ' + a.por + ' invocó a ' + a.carta.nombre + '. ¡Reclámala antes que otro!', 'isla-gacha-' + a.id);
    }
    for (const p of d.perdidas) avisarGacha('😬 ' + p.por + ' te ganó a ' + p.nombre + '.', 'isla-gacha-perdida-' + p.nombre);
    if (d.perdidas.length) {
      cargarEventos(true);
      if (e.tab === 'gacha') {
        delete store.cache.gacha;
        abrir('gacha', true);
        return;
      }
    }
    if (cambio && e.tab === 'gacha' && store.sel.gachaSel === 'invocar') dibujar('gacha');
  } catch (_) {
  } finally {
    sondeando = false;
  }
}

export function programarSondeo() {
  const ms = document.hidden ? 30000 : e.tab === 'gacha' ? 6000 : 15000;
  setTimeout(() => {
    if (e.me && !e.ocupado && !e.publicando && (!document.hidden || avisosActivos())) sondearAbiertas();
    programarSondeo();
  }, ms);
}

export function estadoEventos(ahora) {
  const g = e.eventos.gacha;
  const r = e.eventos.raid;
  let gacha = null;
  let raid = null;
  if (g) {
    const pend = g.pend > ahora;
    const trato = g.trato > ahora;
    const ab = e.abiertas.filter(a => a.fin > ahora);
    const rest = Math.max(0, Math.ceil((g.fin - ahora) / 1000));
    gacha = { pend, trato, ab, rest, lista: pend || trato || ab.length > 0 || rest === 0 };
  }
  if (r) {
    const rest = Math.max(0, Math.ceil((r.fin - ahora) / 1000));
    raid = { n: r.n, rest, lista: r.n > 0 && rest === 0 };
  }
  return { gacha, raid, listas: (gacha && gacha.lista ? 1 : 0) + (raid && raid.lista ? 1 : 0) };
}

export function vigilarGacha(fin) {
  e.finGacha = fin;
}

export function tickEventos(ahora) {
  const g = e.eventos.gacha;
  const est = estadoEventos(ahora);
  if (g && est.gacha) {
    if (est.gacha.ab.length !== e.abiertas.length) {
      cambiar({ abiertas: est.gacha.ab });
      if (e.tab === 'gacha' && store.sel.gachaSel === 'invocar') dibujar('gacha');
    }
    if (((g.pend && !est.gacha.pend) || (g.trato && !est.gacha.trato)) && !gachaVencida) {
      gachaVencida = true;
      cargarEventos(true);
    }
  }
  if (e.finGacha && e.tab === 'gacha' && ahora >= e.finGacha && !e.ocupado && !e.publicando) {
    e.finGacha = 0;
    delete store.cache.gacha;
    abrir('gacha', true);
  }
  return est.listas;
}
