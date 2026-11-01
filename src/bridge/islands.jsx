import { lazy } from 'react';

export const CARGAS = {
  rankings: () => import('../islands/Rankings.jsx'),
  clan: () => import('../islands/Clan.jsx'),
  raid: () => import('../islands/Raid.jsx'),
  mazmorra: () => import('../islands/Mazmorra.jsx'),
  sala: () => import('../islands/Sala.jsx'),
  gacha: () => import('../islands/Gacha.jsx'),
  inventario: () => import('../islands/Inventario.jsx'),
  ficha: () => import('../islands/Perfil.jsx'),
  ciudad: () => import('../islands/Ciudad.jsx'),
  tienda: () => import('../islands/Tienda.jsx'),
  hogar: () => import('../islands/Hogar.jsx'),
  encargos: () => import('../islands/Encargos.jsx'),
  encuentro: () => import('../islands/Encuentro.jsx'),
  alquimia: () => import('../islands/Alquimia.jsx'),
  mundial: () => import('../islands/Mundial.jsx'),
  jugador: () => import('../islands/Jugador.jsx')
};

export const ISLAS = Object.fromEntries(Object.entries(CARGAS).map(([k, f]) => [k, lazy(f)]));

export function precargarIslas(primera) {
  const lista = Object.entries(CARGAS);
  if (primera) lista.sort(([a], [b]) => (a === primera ? -1 : b === primera ? 1 : 0));
  const paso = () => {
    const par = lista.shift();
    if (!par) return;
    par[1]().catch(() => {}).finally(() => (window.requestIdleCallback ? requestIdleCallback(paso, { timeout: 2000 }) : setTimeout(paso, 150)));
  };
  paso();
}
