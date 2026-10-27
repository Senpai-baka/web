// Monta/actualiza "islas" de React dentro de las pestañas del panel legacy (#t-<pestaña>).
// Para revertir una pestaña: quítala de ISLAS y vuelve a pintarse con el código viejo de app.js.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Rankings from '../islands/Rankings.jsx';
import Clan from '../islands/Clan.jsx';
import Raid from '../islands/Raid.jsx';
import Mazmorra from '../islands/Mazmorra.jsx';
import Gacha from '../islands/Gacha.jsx';
import { Seguro } from '../islands/ui.jsx';

const ISLAS = { rankings: Rankings, clan: Clan, raid: Raid, mazmorra: Mazmorra, gacha: Gacha };
const raices = new Map();

export const migradas = new Set(Object.keys(ISLAS));

export function render(t, d, base) {
  const el = document.getElementById('t-' + t);
  const Isla = ISLAS[t];
  if (!el || !Isla) return false;
  let r = raices.get(t);
  if (!r || r.el !== el) {
    r = { el, root: createRoot(el) };
    raices.set(t, r);
  }
  // flushSync: app.js centra el botón activo y restaura el scroll justo después de dibujar.
  flushSync(() => r.root.render(<Seguro reset={d}><Isla d={d} base={base} /></Seguro>));
  return true;
}

export function unmount(t) {
  const r = raices.get(t);
  if (!r) return;
  r.root.unmount();
  raices.delete(t);
}
