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
