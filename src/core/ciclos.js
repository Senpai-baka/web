import { e, cambiar, gancho } from './estado.js';
import { ACC, TITULO } from './datos.js';
import { tiempo } from './acciones.js';
import { notificar, avisosActivos } from './avisos.js';
import { tickEventos, programarSondeo } from './eventos.js';
import { refrescar } from './sesion.js';
import { abrir } from './navegar.js';

let refrescandoClima = false;
let iniciado = false;

function tick() {
  if (!e.me) return;
  const ahora = Date.now();
  let listas = 0;
  let menor = Infinity;
  for (const k in ACC) {
    if (e.tot[k] === undefined) continue;
    const rest = Math.max(0, Math.ceil((e.fin[k] - ahora) / 1000));
    const lista = rest === 0;
    if (lista) listas++;
    else menor = Math.min(menor, rest);
    if (e.previa[k] === false && lista) notificar(k);
    e.previa[k] = lista;
  }
  listas += tickEventos(ahora);
  if (listas !== e.listas) cambiar({ listas });
  document.title = listas ? '(' + listas + ') Listo · Isla' : menor < Infinity ? tiempo(menor) + ' · Isla' : TITULO;
  const clima = e.me.clima;
  if (clima) {
    const fin = e.meT + clima.faltaS * 1000;
    if (ahora >= fin && !refrescandoClima && !e.ocupado) {
      refrescandoClima = true;
      setTimeout(() => { refrescar().finally(() => { refrescandoClima = false; }); }, 1500);
    }
  }
}

export function iniciarCiclos() {
  if (iniciado) return;
  iniciado = true;
  gancho.tick = tick;
  setInterval(tick, 1000);
  setInterval(() => {
    if (e.me && !e.ocupado && (!document.hidden || avisosActivos())) refrescar();
  }, 30000);
  programarSondeo();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !e.me || e.ocupado) return;
    refrescar();
    if (e.tab !== 'inicio') abrir(e.tab);
  });
  window.addEventListener('online', () => {
    if (e.me && !document.hidden) {
      refrescar();
      if (e.tab !== 'inicio') abrir(e.tab, true);
    }
  });
}
