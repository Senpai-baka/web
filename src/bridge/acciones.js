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

// Inventario: estado temporal conservado por el panel legacy mientras se migran sus subsecciones.
export const inventarioSeccion = () => puente().invSel?.() ?? 'objetos';
export const cambiarInventario = s => puente().invCambiar?.(s);

// Ciudad: la sección activa y la búsqueda de jugadores viven en app.js (de ahí sale la ruta que se pide a la API).
export const ciudadSeccion = () => puente().ciudadSel?.() ?? 'banco';
export const ciudadIr = s => puente().ciudadIr?.(s);
export const buscarJugadores = q => puente().buscarJugadores?.(q);
export const consultaJugadores = () => puente().consultaJugadores?.() ?? '';

// Tienda: la sección activa y las páginas de Mercado/Subastas viven en app.js (definen la ruta que se pide a la API).
export const tiendaSeccion = () => puente().tiendaSel?.() ?? 'tienda';
export const tiendaIr = s => puente().tiendaIr?.(s);
export const tiendaPagina = (k, dir) => puente().tiendaPagina?.(k, dir);

// Hogar (Mascota y Granja): la sección activa vive en app.js (define la ruta que se pide a la API).
export const hogarSeccion = () => puente().hogarSel?.() ?? 'mascota';
export const hogarIr = s => puente().hogarIr?.(s);

// Gacha → Tratos: la búsqueda, el jugador elegido, las páginas y las cartas marcadas viven en app.js
// (definen la ruta que se pide a la API y se reinician tras cada trato publicado).
export const tratoEstado = () => puente().tratoEstado?.() ?? { q: '', mia: 0, suya: 0 };
export const tratoElegir = ref => puente().tratoElegir?.(ref);
export const tratoQuitar = () => puente().tratoQuitar?.();
export const buscarTrato = q => puente().buscarTrato?.(q);
export const tratoCarta = (lado, id) => puente().tratoCarta?.(lado, id);
export const tratoPagina = (k, dir) => puente().tratoPagina?.(k, dir);
