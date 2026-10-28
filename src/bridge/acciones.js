import { sel, vista, fijar, notificar } from '../state/panel.js';

const puente = () => window.IslaBridge || {};

export const publicar = (boton, ruta, cuerpo) => puente().publicar?.(boton, ruta, cuerpo);
export const aviso = (txt, ms) => puente().aviso?.(txt, ms);

const en = (lista, s) => lista.includes(s);
const mas = (n, dir) => Math.max(1, n + dir);

export const buscarClan = q => fijar('clan', { clanQ: q || '' });
export const consultaClan = () => vista('clan').clanQ;

export const gachaSel = () => vista('gacha').gachaSel;
export const gachaIr = s => fijar('gacha', { gachaSel: s, gachaPag: 1 });
export const gachaPagina = dir => fijar('gacha', { gachaPag: mas(sel.gachaPag, dir) });
export const abiertasGacha = () => puente().abiertas?.() ?? [];

export const inventarioSeccion = () => vista('inventario').invSel;
export const cambiarInventario = s => en(['objetos', 'equipo', 'forja'], s) && fijar('inventario', { invSel: s });

export const ciudadSeccion = () => vista('ciudad').ciudadSel;
export const ciudadIr = s => en(['banco', 'negocios', 'casino', 'altar', 'jugadores'], s) && fijar('ciudad', { ciudadSel: s });
export const buscarJugadores = q => fijar('ciudad', { jugQ: q || '' });
export const consultaJugadores = () => vista('ciudad').jugQ;

export const tiendaSeccion = () => vista('tienda').tiendaSel;
export const tiendaIr = s => en(['tienda', 'bazar', 'mercado', 'subastas'], s) && fijar('tienda', { tiendaSel: s });
export const tiendaPagina = (k, dir) => fijar('tienda', k === 'mercado' ? { merPag: mas(sel.merPag, dir) } : { subPag: mas(sel.subPag, dir) });

export const hogarSeccion = () => vista('hogar').hogarSel;
export const hogarIr = s => en(['mascota', 'granja'], s) && fijar('hogar', { hogarSel: s });

export const perfilSeccion = () => vista('ficha').perfilSel;

export const tratoEstado = () => ({ q: vista('gacha').gtQ, mia: sel.gtMia, suya: sel.gtSuya });
export const tratoElegir = ref => fijar('gacha', { gtRef: ref, gtPm: 1, gtPs: 1, gtMia: 0, gtSuya: 0 });
export const tratoQuitar = () => fijar('gacha', { gtRef: '', gtMia: 0, gtSuya: 0 });
export const buscarTrato = q => fijar('gacha', { gtQ: q || '', gtRef: '', gtMia: 0, gtSuya: 0 });
export const tratoPagina = (k, dir) => fijar('gacha', k === 'm' ? { gtPm: mas(sel.gtPm, dir) } : { gtPs: mas(sel.gtPs, dir) });
export const tratoCarta = (lado, id) => {
  id = Number(id);
  if (lado === 'mia') sel.gtMia = sel.gtMia === id ? 0 : id; else sel.gtSuya = sel.gtSuya === id ? 0 : id;
  notificar('gacha');
};
