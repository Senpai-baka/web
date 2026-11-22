import React from 'react';
import { Avatar } from './ui.jsx';
import { fmt } from '../lib/format.js';

const num = v => fmt(Number(v || 0));

export function Pase({ alias, nivel, xp, xpSig, rol, avatar, sello }) {
  const pct = xpSig ? Math.min(100, Number(xp || 0) / xpSig * 100) : 0;
  return (
    <section className="fc-pase">
      <div className="fc-id">
        <div className="fc-anillo">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle className="fc-pista" cx="50" cy="50" r="45" pathLength="100" />
            <circle className="fc-prog" cx="50" cy="50" r="45" pathLength="100" strokeDasharray={pct.toFixed(1) + ' 100'} />
          </svg>
          <Avatar r={avatar || { nombre: alias }} />
        </div>
        <div className="fc-quien">
          <h1 className="pag">{alias || 'Aventurero'}</h1>
          <div className="fc-rol">
            <span>Nivel {nivel ?? '—'}</span>
            {rol ? <em>{rol}</em> : null}
          </div>
          <span className="fc-xp"><b>{num(xp)}</b> de {num(xpSig)} XP</span>
        </div>
      </div>
      {sello && sello.length ? (
        <dl className="fc-sello">
          {sello.map(([v, t]) => <div key={t}><dd>{v}</dd><dt>{t}</dt></div>)}
        </dl>
      ) : null}
    </section>
  );
}

export const Tira = ({ lista }) => (
  <dl className="fc-tira">
    {lista.map(([t, v]) => <div key={t}><dd>{v}</dd><dt>{t}</dt></div>)}
  </dl>
);

export const Marca = ({ ok }) => (
  <span className={'fc-marca' + (ok ? ' ok' : '')} aria-label={ok ? 'Hecha' : 'Pendiente'} role="img">
    {ok ? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 L10 17.5 L19 7" /></svg>
    ) : null}
  </span>
);
