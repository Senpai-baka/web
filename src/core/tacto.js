const sinMov = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function vibra(p) {
  if (!sinMov && navigator.vibrate) {
    try { navigator.vibrate(p); } catch (_) {}
  }
}

let activo = false;

export function iniciarTacto() {
  if (activo) return;
  activo = true;
  document.addEventListener('pointerdown', ev => {
    const b = ev.target.closest('button:not(:disabled):not([aria-disabled="true"]), .atajo');
    if (!b || !b.matches('.accion,.mini,.btn,.btn2,.atajo,.seg button,.nav button')) return;
    vibra(8);
    if (!b.matches('.accion,.mini,.btn,.btn2')) return;
    b.classList.remove('toco');
    void b.offsetWidth;
    b.classList.add('toco');
    setTimeout(() => b.classList.remove('toco'), 500);
  }, { passive: true });
}
