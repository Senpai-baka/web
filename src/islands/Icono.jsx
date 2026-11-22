import React, { useState } from 'react';

// Carpeta pública con los PNG de objetos: public/img/items/<clave>.png
const BASE = '/img/items/';

// Claves que tienen PNG (nombre de archivo sin extensión).
const CLAVES = new Set([
  'adamantita', 'ambar', 'cana', 'carbon', 'cofre_madera', 'cofre_oro', 'cofre_plata',
  'diamante', 'elixir_fuerza', 'elixir_furia', 'elixir_suerte', 'escudo', 'esencia_cazador',
  'espada', 'estelar', 'filete', 'hacha', 'hierro', 'hongo', 'kit_reparacion', 'madera',
  'mithril', 'oro', 'perla', 'pez', 'pico', 'piedra_bendicion', 'piel_piedra', 'pocion',
  'pocion_energia', 'pocion_mayor', 'resina', 'rubi', 'tonico_fortuna'
]);

// Otras claves/nombres con las que el servidor puede llamar al mismo objeto.
const ALIAS = {
  cania: 'cana', cana_pescar: 'cana', cana_de_pescar: 'cana', cana_pesca: 'cana',
  lingote_hierro: 'hierro', lingote_oro: 'oro', lingote_mithril: 'mithril',
  rubi_rojo: 'rubi', cofre_madera_comun: 'cofre_madera',
  pocion_vida: 'pocion', pocion_menor: 'pocion', pocion_curacion: 'pocion',
  pocion_grande: 'pocion_mayor', tonico: 'tonico_fortuna', estrella: 'estelar',
  polvo_estelar: 'estelar', piedra_estelar: 'estelar', cristal_estelar: 'estelar',
  salmon: 'filete', pescado: 'pez', champinon: 'hongo', seta: 'hongo',
  tronco: 'madera', ambar_fosil: 'ambar', hacha_lenador: 'hacha', pico_minero: 'pico'
};

// Emoji de objetos sin ambigüedad (monedas, estrellas, etc. se dejan fuera a propósito).
const EMOJI = {
  '🪵': 'madera', '⛏️': 'pico', '⛏': 'pico', '🪓': 'hacha', '🎣': 'cana',
  '🐟': 'pez', '🍣': 'filete', '🍄': 'hongo', '💎': 'diamante', '🐚': 'perla', '🦪': 'perla'
};

const PALABRAS_VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una']);

const slug = txt => String(txt || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .split(' ')
  .filter(p => p && !PALABRAS_VACIAS.has(p))
  .join('_');

const valida = k => (CLAVES.has(k) ? k : ALIAS[k] && CLAVES.has(ALIAS[k]) ? ALIAS[k] : null);

// Devuelve la URL del PNG o null si ese objeto no tiene imagen.
export function iconoUrl({ clave, nombre, emoji } = {}) {
  const k = valida(slug(clave))
    || valida(String(clave || '').toLowerCase())
    || valida(slug(nombre))
    || (emoji ? valida(EMOJI[emoji] || EMOJI[String(emoji).replace(/️/g, '')]) : null);
  return k ? BASE + k + '.png' : null;
}

export const tieneIcono = o => !!iconoUrl(o);

// Imagen del objeto; si no hay PNG (o falla la carga) muestra el emoji de siempre.
export function Icono({ clave, nombre, emoji, cls = '' }) {
  const src = iconoUrl({ clave, nombre, emoji });
  const [malo, setMalo] = useState(null);
  if (!src || malo === src) return <>{emoji || ''}</>;
  return (
    <img
      className={'ico-img' + (cls ? ' ' + cls : '')}
      src={src}
      alt=""
      draggable="false"
      decoding="async"
      onError={() => setMalo(src)}
    />
  );
}

// Versión en línea para textos: <Emo o={objeto} /> reemplaza a {objeto.emoji}.
export function Emo({ o, clave, nombre, emoji }) {
  const c = clave ?? o?.clave ?? o?.k;
  const n = nombre ?? o?.nombre;
  const e = emoji ?? o?.emoji;
  return <Icono clave={c} nombre={n} emoji={e} cls="ico-i" />;
}
