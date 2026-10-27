// Funciones que app.js (script clásico) expone en window.IslaBridge para que las islas puedan actuar.
// Se leen en el momento de usarlas (no al importar), porque app.js se carga después de main.jsx.
const puente = () => window.IslaBridge || {};

/** POST a la API con el mismo flujo del legacy: marca el botón ocupado, muestra resultado/aviso y recarga la pestaña. */
export const publicar = (boton, ruta, cuerpo) => puente().publicar?.(boton, ruta, cuerpo);
/** Mensaje flotante (#toast). */
export const aviso = (txt, ms) => puente().aviso?.(txt, ms);
/** Búsqueda de jugadores en la pestaña Clan (guarda la consulta en app.js y recarga). */
export const buscarClan = q => puente().buscarClan?.(q);
export const consultaClan = () => puente().consultaClan?.() ?? '';

// Gacha: la sección, la página y las cartas "abiertas" (reclamables por todos) viven en app.js.
export const gachaSel = () => puente().gachaSel?.() ?? 'invocar';
export const gachaIr = s => puente().gachaIr?.(s);
export const gachaPagina = dir => puente().gachaPagina?.(dir);
export const abiertasGacha = () => puente().abiertas?.() ?? [];
/** Provisional: HTML de la sección Tratos (aún sin migrar). */
export const htmlGachaTratos = (d, base) => puente().htmlGachaTratos?.(d, base) ?? '';
