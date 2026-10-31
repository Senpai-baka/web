import React from 'react';
import { useEstado } from '../core/estado.js';
import { useMe } from '../bridge/store.js';
import { abrir } from '../core/navegar.js';
import { alternarAvisos, avisosActivos, avisosDisponibles } from '../core/avisos.js';
import Foto from './Foto.jsx';

const CAMPANA = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 17 V11 A6 6 0 0 1 18 11 V17 L20 19 H4 Z" />
    <path d="M10 21 H14" />
  </svg>
);

function Campana() {
  useEstado(s => s.avisosOn);
  if (!avisosDisponibles()) return null;
  const on = avisosActivos();
  return (
    <button className="ico" id="campana" type="button" aria-pressed={on} aria-label={on ? 'Desactivar avisos' : 'Activar avisos'} title={on ? 'Avisos activados' : 'Activar avisos'} onClick={alternarAvisos}>
      {CAMPANA}
    </button>
  );
}

export default function Cabecera({ panel }) {
  const me = useMe();
  return (
    <header className="top">
      <a className="logo" href="/" aria-label="Isla">
        <img src="/logo-favicon.png?v=3" alt="" width="48" height="48" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0 }} />
        <span className="marca">Isla</span>
      </a>
      <div className="der-top" id="top-der" hidden={!panel}>
        <Campana />
        <button className="ico perfil-b" id="top-ava" type="button" aria-label="Tu perfil" onClick={() => abrir('ficha')}>
          {me && <Foto me={me} />}
        </button>
      </div>
    </header>
  );
}
