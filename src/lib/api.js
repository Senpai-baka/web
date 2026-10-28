export const API = '';

export function err(msg, estado, datos) { return Object.assign(new Error(msg), { estado, datos }); }
const espera = ms => new Promise(r => setTimeout(r, ms));
const idPeticion = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
const REINTENTABLE = new Set([502, 503, 504]);

export async function api(ruta, cuerpo) {
  const post = !!cuerpo;
  const id = post ? idPeticion() : null;
  const intentos = post ? 2 : 3;
  let ultimo = null;
  for (let i = 0; i < intentos; i++) {
    if (i) await espera(i * 900);
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), post ? 25000 : 15000);
    let r;
    try {
      r = await fetch(API + ruta, {
        method: post ? 'POST' : 'GET', credentials: 'include', signal: ctl.signal,
        headers: post ? { 'Content-Type': 'application/json', 'X-Panel': '1', 'X-Req-Id': id } : { 'Content-Type': 'application/json', 'X-Panel': '1' },
        body: post ? JSON.stringify(cuerpo) : undefined
      });
    } catch (_) {
      clearTimeout(t);
      ultimo = err('No pude conectar con Isla. Revisa tu internet o inténtalo en un momento.', 0);
      continue;
    }
    clearTimeout(t);
    if (REINTENTABLE.has(r.status) && i < intentos - 1) { ultimo = err('Isla está reiniciándose. Reintentando…', r.status); continue; }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw err(d.error || (REINTENTABLE.has(r.status) ? 'Isla está reiniciándose. Inténtalo en unos segundos.' : 'Algo salió mal. Inténtalo de nuevo.'), r.status, d);
    return d;
  }
  throw ultimo;
}
