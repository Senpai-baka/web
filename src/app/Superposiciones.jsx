import React, { useEffect, useRef } from 'react';
import { ACC, ICONOS } from '../core/datos.js';
import { useEstado } from '../core/estado.js';
import { saltarAnimacion, cerrarHoja } from '../core/acciones.js';

const CHISPAS = Array.from({ length: 8 }, (_, i) => i);

export function Animacion() {
  const k = useEstado(s => s.anim);
  const ultima = useRef('minar');
  if (k) ultima.current = k;
  const a = ACC[ultima.current];
  return (
    <div className="anim" id="anim" hidden={!k} onClick={saltarAnimacion}>
      <div className={'dib ' + a.fx} id="dib">
        <div className="chispas" aria-hidden="true">
          {CHISPAS.map(i => <i key={i} style={{ '--a': i * 45 + 'deg', '--n': i }} />)}
        </div>
        <div className="ondas" aria-hidden="true"><i /><i /></div>
        <span className="ic" id="aicono" dangerouslySetInnerHTML={{ __html: ICONOS[a.ic] }} />
      </div>
      <p className="cap" id="acap" role="status">{a.v}</p>
      <div className="barra-anim" aria-hidden="true"><i /></div>
      <p className="mut peq">Toca para saltar</p>
    </div>
  );
}

export function Hoja() {
  const h = useEstado(s => s.hoja);
  const boton = useRef(null);
  const abierta = !!(h && h.abierta);
  useEffect(() => {
    if (abierta && boton.current) boton.current.focus();
  }, [h]);
  const col = (h && h.col) || '#a9b0c4';
  const rareza = h && h.rareza ? 'Rareza: ' + h.rareza : '';
  const clase = 'hoja vidrio' + (h && h.mal ? ' mal' : '') + (h && !h.mal && h.rareza === 'Legendaria' ? ' leg' : '') + (h && h.nivel ? ' nivel' : '');
  return (
    <div className="sheet" id="hoja" hidden={!abierta} role="dialog" aria-modal="true" aria-labelledby="h-titulo">
      <div className={clase}>
        <img className="h-carta" id="h-carta" alt="" referrerPolicy="no-referrer" hidden={!(h && h.imagen)} src={(h && h.imagen) || undefined} />
        <div className="halo" id="halo" style={{ '--col': col, color: col }}>
          <span id="h-icono" dangerouslySetInnerHTML={{ __html: (h && h.icono) || '' }} />
        </div>
        <p className="mut peq" id="h-zona" style={{ margin: 0 }}>{(h && h.zona) || ''}</p>
        <h2 id="h-titulo">{h ? h.titulo : ''}</h2>
        <p className="rar" id="h-rareza" style={{ color: col }}>{rareza}</p>
        <div className="chips" id="h-chips">{h ? h.chips.map((t, i) => <span key={i}>{t}</span>) : null}</div>
        <p className="mut peq" id="h-espera">{(h && h.pie) || ''}</p>
        <button className="btn" id="h-ok" ref={boton} onClick={cerrarHoja}>{(h && h.boton) || 'Volver a acciones'}</button>
      </div>
    </div>
  );
}

export function Toast() {
  const txt = useEstado(s => s.toast);
  return <div id="toast" role="status" hidden={!txt}>{txt || ''}</div>;
}
