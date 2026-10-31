import React, { useEffect, useState } from 'react';
import { API } from '../lib/api.js';

export const inicial = d => (d.alias || '?').trim().charAt(0).toUpperCase() || '?';

export default function Foto({ me, envuelta }) {
  const [fallo, setFallo] = useState(false);
  const url = me.fotoUrl || (me.foto ? `${API}/api/foto?v=${me.foto}` : '');
  useEffect(() => { setFallo(false); }, [url]);
  return (
    <>
      {envuelta ? <span>{inicial(me)}</span> : inicial(me)}
      {url && !fallo && <img src={url} alt="" decoding="async" onError={() => setFallo(true)} />}
    </>
  );
}

export function Ava({ me, t, nv }) {
  const pct = me.xpSig ? Math.min(100, me.xp / me.xpSig * 100) : 0;
  return (
    <div className="ava" style={{ '--t': t + 'px' }}>
      <svg className="anillo" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="pista" cx="50" cy="50" r="46" />
        <circle className="nv" cx="50" cy="50" r="46" pathLength="100" strokeDasharray={pct.toFixed(1) + ' 100'} />
      </svg>
      <div className="ava-i"><Foto me={me} envuelta /></div>
      {nv && <b className="lv">{me.nivel}</b>}
    </div>
  );
}
