// Store mínimo para compartir `me` (el jugador) entre app.js y los componentes React.
import { useSyncExternalStore } from 'react';

let me = null;
const subs = new Set();

export const getMe = () => me;
export const subscribe = f => { subs.add(f); return () => subs.delete(f); };
export function setMe(d) { me = d; subs.forEach(f => f()); }
export const useMe = () => useSyncExternalStore(subscribe, getMe, getMe);
