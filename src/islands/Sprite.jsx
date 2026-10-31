import React, { useEffect, useState } from 'react';
import { claveMonstruo } from '../lib/arteCombate.js';

// Hojas de 3 cuadros: 0 = reposo, 1 = ataque, 2 = golpeado/derrotado.
// tam = alto del sprite en unidades del viewBox (400x200); cx = centro horizontal; suelo = y del piso.
const BASE = '/img/sprites/';
const MON = (k, tam, suelo = 183, extra = {}) => ({ src: `${k}_sheet.png`, fw: 384, fh: 384, tam, cx: 300, suelo, ...extra });
const CLASE = (k, tam = 118) => ({ src: `${k}_sheet.png`, fw: 384, fh: 384, tam, cx: 80, suelo: 183 });
const HOJAS = {
  // héroes (miran a la derecha)
  heroe: { src: 'hero_sheet.png', fw: 384, fh: 384, tam: 118, cx: 80, suelo: 181 },
  mago: CLASE('mago'), ladron: CLASE('ladron'), mercader: CLASE('mercader'),
  // monstruos
  slime: { src: 'slime_sheet.png', fw: 912, fh: 912, tam: 128, cx: 300, suelo: 182 },
  murcielago: { src: 'murcielago_sheet.png', fw: 384, fh: 384, tam: 112, cx: 300, suelo: 168, vuela: true },
  golem: { src: 'golem_sheet.png', fw: 384, fh: 384, tam: 124, cx: 300, suelo: 181 },
  rata: MON('rata', 104), esqueleto: MON('esqueleto', 120), arana: MON('arana', 112), zombi: MON('zombi', 120),
  espectro: MON('espectro', 118, 176, { vuela: true }), escorpion: MON('escorpion', 108), hechicero: MON('hechicero', 126),
  dragon: MON('dragon', 126), titan: MON('titan', 116)
};

export const hojaHeroe = clase => HOJAS[clase === 'mago' || clase === 'ladron' || clase === 'mercader' ? clase : 'heroe'];
const CLAVES_SPRITE = ['slime', 'murcielago', 'golem', 'rata', 'esqueleto', 'arana', 'zombi', 'espectro', 'escorpion', 'hechicero', 'dragon', 'titan'];
export const hojaMonstruo = nombre => { const k = claveMonstruo(nombre); return CLAVES_SPRITE.includes(k) ? HOJAS[k] : null; };

// Cuadro actual según una lista de tramos [desdeMs, hastaMs, cuadro]; si no hay tramo vigente, `fijo`.
export function useCuadro(tramos, fijo = 0) {
  const [f, setF] = useState(null);
  useEffect(() => {
    const ids = [];
    tramos.forEach(([a, b, cuadro]) => {
      ids.push(setTimeout(() => setF(cuadro), a));
      ids.push(setTimeout(() => setF(null), b));
    });
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return f == null ? fijo : f;
}

export function Sprite({ hoja, cuadro }) {
  const { src, fw, fh, tam, cx, suelo } = hoja;
  const w = tam * fw / fh;
  return (
    <svg x={cx - w / 2} y={suelo - tam} width={w} height={tam} viewBox={`${cuadro * fw} 0 ${fw} ${fh}`} overflow="hidden" aria-hidden="true">
      <image href={BASE + src} width={fw * 3} height={fh} style={{ imageRendering: 'pixelated' }} />
    </svg>
  );
}
