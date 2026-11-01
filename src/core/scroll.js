import { e } from './estado.js';
import { guardarPos, hayPendiente, volcarAhora } from '../state/panel.js';

let activo = false;

export function iniciarScroll() {
  if (activo) return;
  activo = true;
  const raiz = document.documentElement;
  let id = 0;
  const fin = () => {
    id = 0;
    delete raiz.dataset.scroll;
    if (e.me && !hayPendiente(e.tab)) guardarPos(e.tab);
  };
  addEventListener('scroll', () => {
    if (!id) raiz.dataset.scroll = '1';
    else clearTimeout(id);
    id = setTimeout(fin, 160);
  }, { passive: true, capture: true });
  addEventListener('pagehide', () => {
    if (e.me && !hayPendiente(e.tab)) guardarPos(e.tab);
    volcarAhora();
  });
}
