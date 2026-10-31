import { e, cambiar, useEstado } from '../core/estado.js';

export const getMe = () => e.me;
export const setMe = d => cambiar({ me: d });
export const useMe = () => useEstado(s => s.me);
