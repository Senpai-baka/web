import { useSyncExternalStore } from 'react';
import { sincronizar } from './reloj.js';

const subs = new Set();

export const e = {
  vista: null,
  tab: 'inicio',
  me: null,
  meT: 0,
  fin: {},
  tot: {},
  previa: {},
  ocupado: false,
  publicando: false,
  anim: null,
  hoja: null,
  toast: null,
  errLogin: '',
  eventos: {},
  eventosT: 0,
  abiertas: [],
  avisosOn: false,
  finGacha: 0,
  listas: 0
};

export const gancho = { tick() {} };

export function cambiar(c) {
  Object.assign(e, c);
  sincronizar();
  subs.forEach(f => f());
}

const suscribir = f => {
  subs.add(f);
  return () => subs.delete(f);
};

export const useEstado = sel => useSyncExternalStore(suscribir, () => sel(e), () => sel(e));
