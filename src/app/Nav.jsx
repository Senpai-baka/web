import React from 'react';
import { NAV, PADRE } from '../core/datos.js';
import { useEstado } from '../core/estado.js';
import { abrir } from '../core/navegar.js';
import Svg from './Svg.jsx';

export default function Nav({ panel, listas }) {
  const tab = useEstado(s => s.tab);
  const activo = PADRE[tab] || tab;
  const ir = k => {
    if (k === tab) window.scrollTo({ top: 0, behavior: 'smooth' });
    abrir(k);
  };
  return (
    <nav className="nav" id="nav" aria-label="Secciones" hidden={!panel}>
      <div className="in">
        {NAV.map(([k, n, ic]) => (
          <button key={k} type="button" data-t={k} aria-current={activo === k ? 'page' : undefined} onClick={() => ir(k)}>
            <Svg html={ic} />
            <span>{n}</span>
            <i className="pt" id={'pt-' + k} hidden={k !== 'inicio' || !listas} />
          </button>
        ))}
      </div>
    </nav>
  );
}
