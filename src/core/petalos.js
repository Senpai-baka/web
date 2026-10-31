const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function petalos(n, modo) {
  if (reducir) return;
  const c = document.querySelector('#petalas');
  if (!c) return;
  const r = Math.random;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    const s = 10 + r() * 12;
    p.className = modo;
    p.style.cssText = modo === 'ambiente'
      ? `--l:${r() * 100}%;--s:${s}px;--d:${9 + r() * 8}s;--dl:${-r() * 14}s;--dx:${(r() - .5) * 160}px;--r:${360 + r() * 360}deg`
      : `--s:${s}px;--x:${(r() - .5) * 360}px;--y:${-140 + r() * 340}px;--r:${(r() - .5) * 720}deg;left:50%;top:62%`;
    c.appendChild(p);
    if (modo === 'estallido') setTimeout(() => p.remove(), 1500);
  }
}

export const quitarAmbiente = () => document.querySelectorAll('#petalas .ambiente').forEach(p => p.remove());
