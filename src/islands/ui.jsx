import React, { useEffect, useState } from 'react';
import { useAhora } from '../core/reloj.js';
import { dur, fmt } from '../lib/format.js';
import { API } from '../lib/api.js';
import { useMe } from '../bridge/store.js';
import { publicar, aviso, irA, verJugador } from '../bridge/acciones.js';

export const MEDALLA = ['🥇', '🥈', '🥉'];
export const medalla = i => MEDALLA[i] || (i + 1) + '.';

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

export function Cab({ titulo, sub, icono, stats, atras }) {
  const me = useMe();
  const cifras = stats || (me ? [['Monedas', fmt(me.monedas)], ['Nivel', me.nivel]] : []);
  return (
    <>
      {atras && <button type="button" className="atras" onClick={() => irA('inicio')}>← Inicio</button>}
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

export function Seg({ aria, opciones, valor, onCambio }) {
  return (
    <div className="seg" role="group" aria-label={aria}>
      {opciones.map(([k, n]) => (
        <button key={k} type="button" aria-pressed={k === valor} onClick={() => onCambio(k)}>{n}</button>
      ))}
    </div>
  );
}

export { useAhora };

export function Countdown({ fin }) {
  const ahora = useAhora();
  return <b>{dur((fin - ahora) / 1000)}</b>;
}

export class Seguro extends React.Component {
  state = { fallo: null, visto: this.props.reset };
  static getDerivedStateFromError(e) { return { fallo: e }; }
  static getDerivedStateFromProps(p, s) { return p.reset !== s.visto ? { fallo: null, visto: p.reset } : null; }
  componentDidCatch(e) { console.error('[isla]', e); }
  render() {
    const { fallo } = this.state;
    if (!fallo) return this.props.children;
    return (
      <>
        <Vacio>Esta sección no se pudo mostrar. Recarga la página.</Vacio>
        <p className="mut peq" style={{ textAlign: 'center' }}>{String((fallo && fallo.message) || fallo)}</p>
      </>
    );
  }
}

export const plural = n => `${n} miembro${n === 1 ? '' : 's'}`;
export const premios = lista => lista.map((p, i) => medalla(i) + ' ' + fmt(p)).join(' · ');

export function Avatar({ r }) {
  const me = useMe();
  const [fallo, setFallo] = useState(0);
  const v = r.yo ? me?.foto : r.foto;
  const url = r.yo ? me?.fotoUrl : r.fotoUrl;
  useEffect(() => { setFallo(0); }, [v, url]);
  const inicial = (String(r.nombre || '?').trim().charAt(0) || '?').toUpperCase();
  const ref = !r.yo && r.ref ? '&ref=' + encodeURIComponent(r.ref) : '';
  return (
    <span className="rav" aria-hidden="true">
      <span>{inicial}</span>
      {v && fallo < (url ? 2 : 1) ? <img src={url && !fallo ? url : `${API}/api/foto?v=${encodeURIComponent(v)}${ref}`} alt="" decoding="async" loading="lazy" onError={() => setFallo(f => f + 1)} /> : null}
    </span>
  );
}

export function Fila({ r, extra, valor, avatar }) {
  const ver = r.pid ? () => verJugador(r.pid) : null;
  const clic = ver ? { role: 'button', tabIndex: 0, onClick: ver, onKeyDown: ev => { if (ev.key === 'Enter') ver(); }, style: { cursor: 'pointer' } } : {};
  return (
    <div className={`fil ${r.yo || r.mio ? 'yo' : ''}`} {...clic}>
      <span className="pos">{medalla(r.pos - 1)}</span>
      {avatar && <Avatar r={r} />}
      <div className="nom">
        <strong>{r.nombre}{r.yo ? ' (tú)' : r.mio ? ' (tu clan)' : ''}</strong>
        {extra && <span className="mut peq">{extra}</span>}
      </div>
      <span className="val">{valor}</span>
    </div>
  );
}

export function Slot({ emoji, cantidad, color, falta, plus }) {
  return (
    <span className={`slot${falta ? ' falta' : ''}`} style={{ '--r': color }} aria-hidden="true">
      <span className="si">{emoji || '📦'}</span>
      {cantidad !== undefined && <i className="n">{cantidad}</i>}
      {plus > 0 && <b className="mas">+{plus}</b>}
    </span>
  );
}

export function Celda({ it, sel, onSel }) {
  return (
    <button type="button" className={`it ${sel ? 'sel' : ''} ${it.apagado ? 'no' : ''}`} onClick={() => onSel(it.id)} aria-pressed={sel} aria-label={it.nombre}>
      <Slot emoji={it.emoji} cantidad={it.cantidad} color={it.color} />
      <span className="it-n">{it.nombre}</span>
      <span className="it-p">{it.etiqueta !== undefined ? it.etiqueta : fmt(it.precio)}</span>
    </button>
  );
}

export function Rejilla({ lista, sel, onSel }) {
  return (
    <div className="bolsa-g rej">
      {lista.map(it => <Celda key={it.id} it={it} sel={sel === it.id} onSel={onSel} />)}
    </div>
  );
}

export function Ficha({ color, titulo, precio, children }) {
  return (
    <div className="bloque vidrio detalle" style={{ '--r': color }}>
      <div className="fila">
        <strong style={{ color }}>{titulo}</strong>
        {precio !== undefined && <b className="it-p">{fmt(precio)}</b>}
      </div>
      {children}
    </div>
  );
}

export const Kv = ({ k, v }) => <div className="kv"><span>{k}</span><b>{v}</b></div>;

export const filas = (lista, vacio, fila) => lista.length ? lista.map(fila) : <Vacio>{vacio}</Vacio>;

const CERRADAS = new Set([
  'heroe', 'mascota', 'clan', 'coleccion', 'reliquias', 'materiales', 'lote',
  'perfil-clan-react', 'perfil-mascota-react', 'perfil-coleccion-react', 'perfil-foto', 'perfil-avisos-react',
  'h-raras', 'h-pre', 'lote-react', 'casa-react'
]);
export function Sec({ k, titulo, extra, children, abierta }) {
  return (
    <details className="sd" data-k={k} open={abierta ?? !CERRADAS.has(k)} onToggle={ev => { if (ev.currentTarget.open) CERRADAS.delete(k); else CERRADAS.add(k); }}>
      <summary><h2>{titulo}</h2><span className="ex">{extra}</span><i className="chev" /></summary>
      <div className="cuerpo">{children}</div>
    </details>
  );
}

export const Titulo = ({ children, extra }) => <div className="sec"><h2>{children}</h2>{extra}</div>;

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

export function Accion({ ruta, cuerpo, campos, confirmar, motivo, cls, children }) {
  const click = e => {
    if (motivo) return aviso(motivo);
    if (confirmar && !window.confirm(confirmar)) return;
    publicar(e.currentTarget, ruta, { ...(cuerpo || {}), ...(campos || {}) });
  };
  return (
    <button type="button" className={cls ? 'mini ' + cls : 'mini'} aria-disabled={motivo ? 'true' : undefined} onClick={click}>
      {children}
    </button>
  );
}

export const Cifras = ({ lista }) => (
  <div className="cifras">{lista.map(([k, v]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
);

export function BotonListo({ ruta, cuerpo, txt, fin = 0, bloq }) {
  const ahora = useAhora();
  const resta = fin - ahora;
  const espera = resta > 0;
  const click = e => {
    if (bloq || espera) return aviso(bloq || 'Todavía no está disponible.');
    publicar(e.currentTarget, ruta, cuerpo || {});
  };
  return (
    <button type="button" className="mini" aria-disabled={bloq || espera ? 'true' : undefined} onClick={click}>
      {bloq || (espera ? txt + ' · ' + dur(resta / 1000) : txt)}
    </button>
  );
}

export function Barra({ valor, max, cls }) {
  const w = max ? Math.min(100, valor / max * 100) : 0;
  return <div className={'barra ' + (cls || '')}><div style={{ width: w + '%' }} /></div>;
}

export const Estado = ({ nombre, v, cls }) => (
  <div className="stat"><div className="fila"><span>{nombre}</span><span>{v}%</span></div><Barra valor={v} max={100} cls={cls} /></div>
);
