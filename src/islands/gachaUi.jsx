// Piezas del gacha compartidas por Invocar, Colección y (próximamente) Tratos.
// Port de COL_GACHA, imgGacha, cartaGacha, miniGacha y chipsRarezaGacha de public/js/app.js.
import React, { useState } from 'react';
import { fmt } from '../lib/format.js';

export const COL_GACHA = { mitica: '#e8946a', legendaria: '#e0b96a', epica: '#b69be0', rara: '#8fb4d6', comun: '#a9b0c4' };
export const colGacha = r => COL_GACHA[r && r.clave] || COL_GACHA.comun;

/** Imagen de la carta. Si no carga, desaparece (como el onerror="this.remove()" del legacy, pero sin tocar el DOM a mano). */
function ImgCarta({ src }) {
  const [mal, setMal] = useState(false);
  if (!src || mal) return null;
  return <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setMal(true)} />;
}

const Imagen = ({ c }) => (
  <div className="gc-img">
    <ImgCarta key={c.imagen} src={c.imagen} />
    <span className="gc-em">{c.rareza ? c.rareza.emoji : '🎴'}</span>
  </div>
);

/** Equivale a cartaGacha(c) */
export function Carta({ c }) {
  const r = c.rareza;
  return (
    <div className="gc-carta" style={{ '--c': colGacha(r) }}>
      <Imagen c={c} />
      <div className="gc-in">
        <strong>{c.nombre}</strong>
        {c.nombreNativo ? <span className="mut peq">{c.nombreNativo}</span> : null}
        {c.serie ? <span className="mut peq">{c.serie}</span> : null}
        <span className="peq">{r ? r.emoji + ' ' + r.nombre + ' · ' : ''}💎 {fmt(c.valor)}</span>
        {c.ranking ? <span className="mut peq">Top #{fmt(c.ranking)} · ⭐ {fmt(c.favoritos)}</span> : null}
      </div>
    </div>
  );
}

/** Equivale a miniGacha(c) */
export function Mini({ c }) {
  return (
    <div className="gc-mini" style={{ '--c': colGacha(c.rareza) }} title={c.nombre}>
      <Imagen c={c} />
      <b>{c.nombre}</b><span className="mut">💎 {fmt(c.valor)}</span>
    </div>
  );
}

/** Equivale a chipsRarezaGacha(lista) */
export const ChipsRareza = ({ lista }) => (
  <div className="gc-raros">
    {lista.map((r, i) => (
      <span key={r.clave || i} style={{ '--c': COL_GACHA[r.clave] || COL_GACHA.comun }}>{r.emoji} {r.nombre} <b>{fmt(r.n)}</b></span>
    ))}
  </div>
);

/** Paginador "Anterior / Página X de Y". */
export function Pager({ pagina, paginas, onDir, margen = 12, etiqueta = 'Página ' }) {
  return (
    <div className="btnrow" style={{ alignItems: 'center', marginTop: margen }}>
      <button type="button" className="mini" aria-disabled={pagina <= 1 ? 'true' : undefined} onClick={() => pagina > 1 && onDir(-1)}>Anterior</button>
      <span className="mut peq" style={{ flex: 'none' }}>{etiqueta}{pagina} de {paginas}</span>
      <button type="button" className="mini" aria-disabled={pagina >= paginas ? 'true' : undefined} onClick={() => pagina < paginas && onDir(1)}>Siguiente</button>
    </div>
  );
}
