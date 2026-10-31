import { e, cambiar } from './estado.js';
import { ACC } from './datos.js';

let temporizador = 0;

export function aviso(txt, ms) {
  clearTimeout(temporizador);
  cambiar({ toast: txt });
  temporizador = setTimeout(() => cambiar({ toast: null }), ms || 3500);
}

const leer = k => {
  try { return localStorage.getItem(k) === '1'; } catch (_) { return false; }
};
const guardar = (k, v) => {
  try { localStorage.setItem(k, v ? '1' : '0'); } catch (_) {}
};

export const avisosDisponibles = () => 'Notification' in window;
export const avisosActivos = () => e.avisosOn && avisosDisponibles() && Notification.permission === 'granted';
export const iniciarAvisos = () => cambiar({ avisosOn: leer('isla_avisos') });

export async function alternarAvisos() {
  if (avisosActivos()) {
    guardar('isla_avisos', false);
    cambiar({ avisosOn: false });
    return;
  }
  const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (p !== 'granted') {
    aviso('Los avisos están bloqueados en tu navegador.');
    return;
  }
  guardar('isla_avisos', true);
  cambiar({ avisosOn: true });
  aviso('Te avisaré cuando una acción esté lista.');
}

const sinFoco = () => document.hidden || !document.hasFocus();

function lanzar(titulo, cuerpo, etiqueta) {
  try { new Notification(titulo, { body: cuerpo, icon: '/logo-favicon.png', tag: etiqueta }); } catch (_) {}
}

export function notificar(k) {
  const msg = 'Ya puedes ' + ACC[k].ya + '.';
  if (sinFoco()) {
    if (avisosActivos()) lanzar('Isla', msg, 'isla-' + k);
  } else if (e.tab !== 'inicio') aviso(msg);
}

export function avisarGacha(msg, etiqueta) {
  if (sinFoco()) {
    if (avisosActivos()) lanzar('Isla · Gacha', msg, etiqueta);
  } else aviso(msg, 5000);
}

let vioRaid = leer('isla_aviso_raid');

export function anunciarRaid() {
  if (vioRaid) return;
  vioRaid = true;
  guardar('isla_aviso_raid', true);
  const msg = '👹 ¡Llegó el Raid! Ataca al jefe de tu grupo desde Inicio › Raid.';
  setTimeout(() => {
    if (document.hidden && avisosActivos()) lanzar('Isla', msg, 'isla-raid');
    else aviso(msg, 6000);
  }, 1500);
}
