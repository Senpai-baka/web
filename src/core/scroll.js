let activo = false;

export function iniciarScroll() {
  if (activo) return;
  activo = true;
  const raiz = document.documentElement;
  let id = 0;
  const fin = () => {
    id = 0;
    delete raiz.dataset.scroll;
  };
  addEventListener('scroll', () => {
    if (!id) raiz.dataset.scroll = '1';
    else clearTimeout(id);
    id = setTimeout(fin, 160);
  }, { passive: true, capture: true });
}
