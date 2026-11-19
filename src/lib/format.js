export const fmt = n => Number(n).toLocaleString('es-MX');
export const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const dur = s => {
  s = Math.max(0, Math.ceil(s));
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  if (d) return d + 'd ' + h + 'h';
  if (h) return h + 'h ' + String(m).padStart(2, '0') + 'm';
  if (m) return m + 'm ' + String(s % 60).padStart(2, '0') + 's';
  return s + 's';
};
export const hace = s => s < 60 ? 'hace un momento' : s < 3600 ? 'hace ' + Math.floor(s / 60) + ' min' : s < 86400 ? 'hace ' + Math.floor(s / 3600) + ' h' : 'hace ' + Math.floor(s / 86400) + ' d';
const SUFIJO_MONTO = { k: 1e3, m: 1e6, b: 1e9 };
const MAXIMO_MONTO = 999999999999;
export function leerMonto(texto, base = 0) {
  const t = String(texto == null ? '' : texto).trim().toLowerCase();
  if (!t) return null;
  const disponible = Math.max(0, Math.floor(Number(base) || 0));
  if (['todo', 'all', 'max', 'maximo', 'máximo'].includes(t)) return disponible;
  if (['mitad', 'half', 'medio'].includes(t)) return Math.floor(disponible / 2);
  if (/^\d{1,3}(?:\.\d+)?%$/.test(t)) {
    const pct = Number(t.slice(0, -1));
    return pct > 0 && pct <= 100 ? Math.floor(disponible * pct / 100) : null;
  }
  if (!/^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?[kmb]?$/.test(t)) return null;
  const sufijo = SUFIJO_MONTO[t[t.length - 1]];
  const numero = Number((sufijo ? t.slice(0, -1) : t).replace(/,/g, ''));
  if (!Number.isFinite(numero) || (!sufijo && !Number.isInteger(numero))) return null;
  const valor = Math.floor(numero * (sufijo || 1));
  return valor > 0 && valor <= MAXIMO_MONTO ? valor : null;
}
