import { useSyncExternalStore } from 'react';

let ahora = Date.now();
let id = 0;
const subs = new Set();

const suscribir = f => {
  if (!subs.size) {
    ahora = Date.now();
    id = setInterval(() => {
      ahora = Date.now();
      subs.forEach(g => g());
    }, 1000);
  }
  subs.add(f);
  return () => {
    subs.delete(f);
    if (!subs.size) {
      clearInterval(id);
      id = 0;
    }
  };
};

export function sincronizar() {
  ahora = Date.now();
  subs.forEach(g => g());
}

export const useAhora = () => useSyncExternalStore(suscribir, () => ahora, () => ahora);

export const useDeAhora = sel => useSyncExternalStore(suscribir, () => sel(ahora), () => sel(ahora));
