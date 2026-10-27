// Piezas de UI compartidas por las islas. Mismas clases CSS que el panel legacy (estilos.css).
import React, { useEffect, useState } from 'react';
import { dur, fmt } from '../lib/format.js';
import { useMe } from '../bridge/store.js';
import { publicar, aviso } from '../bridge/acciones.js';

export const MEDALLA = ['🥇', '🥈', '🥉'];
export const medalla = i => MEDALLA[i] || (i + 1) + '.';

/** Equivale a vacio(txt) de app.js */
export function Vacio({ children }) {
  return (
    <p className="vacio">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 18 C6 15 9 15 12 18 C15 21 18 21 21 18" />
        <path d="M12 15 V8" />
        <path d="M12 8 C10 5.5 8 5.5 6.5 6.5 M12 8 C14 5.5 16 5.5 17.5 6.5" />
      </svg>
      {children}
    </p>
  );
}

/** Equivale a cab(titulo, sub, stats) de app.js. `icono` son los hijos del <svg> del nav. */
export function Cab({ titulo, sub, icono, stats, atras }) {
  const me = useMe();
  const cifras = stats || (me ? [['Monedas', fmt(me.monedas)], ['Nivel', me.nivel]] : []);
  return (
    <>
      {atras && <button type="button" className="atras" data-ir="inicio">← Inicio</button>}
    <div className="cabp cab-t">
      <div className="cab-top">
        {icono && (
          <span className="cab-i" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icono}</svg>
          </span>
        )}
        <div>
          <h1 className="pag">{titulo}</h1>
          {sub && <p className="mut">{sub}</p>}
        </div>
      </div>
      {cifras.length > 0 && (
        <div className="cab-st">
          {cifras.map(([n, v]) => <div key={n}><b>{String(v)}</b><span>{n}</span></div>)}
        </div>
      )}
    </div>
    </>
  );
}

/** Selector segmentado (segHtml). Sin data-* para no disparar el delegado de clicks del legacy. */
export function Seg({ aria, opciones, valor, onCambio }) {
  return (
    <div className="seg" role="group" aria-label={aria}>
      {opciones.map(([k, n]) => (
        <button key={k} type="button" aria-pressed={k === valor} onClick={() => onCambio(k)}>{n}</button>
      ))}
    </div>
  );
}

/** Reemplaza cuenta(): cuenta regresiva hasta `fin` (ms epoch), sin depender del tick() global. */
export function Countdown({ fin }) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return <b>{dur((fin - ahora) / 1000)}</b>;
}

/** Si una isla falla al renderizar, muestra un aviso en vez de dejar la pestaña en blanco. */
export class Seguro extends React.Component {
  state = { fallo: false };
  static getDerivedStateFromError() { return { fallo: true }; }
  componentDidCatch(e) { console.error('[isla]', e); }
  render() {
    return this.state.fallo ? <Vacio>Esta sección no se pudo mostrar. Recarga la página.</Vacio> : this.props.children;
  }
}

/* ---------- Piezas compartidas por varias pestañas ---------- */

export const plural = n => `${n} miembro${n === 1 ? '' : 's'}`;
export const premios = lista => lista.map((p, i) => medalla(i) + ' ' + fmt(p)).join(' · ');

/** Equivale a filaRanking(r, extra, valor) de app.js */
export function Fila({ r, extra, valor }) {
  return (
    <div className={`fil ${r.yo || r.mio ? 'yo' : ''}`}>
      <span className="pos">{medalla(r.pos - 1)}</span>
      <div className="nom">
        <strong>{r.nombre}{r.yo ? ' (tú)' : r.mio ? ' (tu clan)' : ''}</strong>
        {extra && <span className="mut peq">{extra}</span>}
      </div>
      <span className="val">{valor}</span>
    </div>
  );
}

/** Equivale a kv(k, v) */
export const Kv = ({ k, v }) => <div className="kv"><span>{k}</span><b>{v}</b></div>;

/** Lista de filas, o el aviso "vacío" si no hay nada. */
export const filas = (lista, vacio, fila) => lista.length ? lista.map(fila) : <Vacio>{vacio}</Vacio>;

/** Equivale a sec(k, t, extra, html): sección plegable. El legacy ya recuerda abiertas/cerradas (evento toggle). */
const CERRADAS = new Set(['heroe', 'mascota', 'clan', 'coleccion', 'reliquias', 'materiales', 'lote']);
export function Sec({ k, titulo, extra, children }) {
  return (
    <details className="sd" data-k={k} open={!CERRADAS.has(k)}>
      <summary><h2>{titulo}</h2><span className="ex">{extra}</span><i className="chev" /></summary>
      <div className="cuerpo">{children}</div>
    </details>
  );
}

/** Equivale a titulo(t) */
export const Titulo = ({ children }) => <div className="sec"><h2>{children}</h2></div>;

/** Equivale a campo(): input de texto o número. */
export function Campo({ valor, onCambio, ph, texto, corto, onEnter }) {
  const extra = texto ? { maxLength: 24, autoComplete: 'off' } : { inputMode: 'numeric', min: 1 };
  return (
    <input
      className={corto ? 'txt corto' : 'txt'}
      type={texto ? 'text' : 'number'}
      placeholder={ph}
      aria-label={ph}
      value={valor}
      onChange={e => onCambio(e.target.value)}
      onKeyDown={onEnter ? (e => { if (e.key === 'Enter') onEnter(); }) : undefined}
      {...extra}
    />
  );
}

/**
 * Equivale a botonPost(): botón que hace POST a la API.
 *  - motivo: texto si el botón está bloqueado (como bloqueado(cond, motivo)); falso si está activo.
 *  - confirmar: pregunta antes de enviar (data-confirmar).
 *  - campos: valores extra a mezclar en el cuerpo (data-campos).
 */
export function Accion({ ruta, cuerpo, campos, confirmar, motivo, children }) {
  const click = e => {
    if (motivo) return aviso(motivo);
    if (confirmar && !window.confirm(confirmar)) return;
    publicar(e.currentTarget, ruta, { ...(cuerpo || {}), ...(campos || {}) });
  };
  return (
    <button type="button" className="mini" aria-disabled={motivo ? 'true' : undefined} onClick={click}>
      {children}
    </button>
  );
}
