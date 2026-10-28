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
