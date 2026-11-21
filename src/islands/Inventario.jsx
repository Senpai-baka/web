import React from 'react';
import { useMe } from '../bridge/store.js';
import { inventarioSeccion, cambiarInventario } from '../bridge/acciones.js';
import Objetos from './inventario/Objetos.jsx';
import Equipo from './inventario/Equipo.jsx';
import Forja from './inventario/Forja.jsx';
import PerfilHeroe from './PerfilHeroe.jsx';

const OPCIONES = [
  ['equipo', 'Equipo', <path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6Z" />],
  ['heroe', 'Héroe', <><path d="M5 14 A7 7 0 0 1 19 14 V19 H5Z" /><path d="M12 7 V13" /><path d="M9 14 H15" /></>],
  ['objetos', 'Mochila', <><path d="M9 6 V5 A3 3 0 0 1 15 5 V6" /><path d="M5 10 A4 4 0 0 1 9 6 H15 A4 4 0 0 1 19 10 V20 H5 Z" /><path d="M9 14 H15 V17 H9 Z" /></>],
  ['forja', 'Forja', <><path d="M3 8 H17 C17 11 14 12 12 12 V15 H15 V18 H7 V15 H10 V12 C7 12 5 10 3 8Z" /><path d="M17 8 H21" /></>]
];

const SUBTITULO = {
  objetos: 'Cofres, herramientas, consumibles, materiales y reliquias en tu mochila.',
  equipo: 'Lo que llevas puesto, tu bolsa y su mantenimiento.',
  heroe: 'Clase, atributos, talentos y expediciones.',
  forja: 'Fabrica, prepara elixires y vende materiales.'
};

function Bolsa({ b, items }) {
  const usados = b.usados ?? items ?? 0;
  const cel = Math.min(24, Math.max(1, b.max));
  const llenas = Math.min(cel, Math.round(usados / b.max * cel));
  const casi = usados >= b.max * 0.9;
  return (
    <div className={'iv-bolsa' + (casi ? ' lleno' : '')}>
      <div className="iv-pips" aria-hidden="true">
        {Array.from({ length: cel }, (_, i) => <i key={i} className={i < llenas ? 'on' : ''} style={{ animationDelay: i * 25 + 'ms' }} />)}
      </div>
      <span>Bolsa <b>{usados}</b> de {b.max}</span>
    </div>
  );
}

export default function Inventario({ d, base }) {
  const me = useMe();
  const seccion = OPCIONES.some(o => o[0] === inventarioSeccion()) ? inventarioSeccion() : 'equipo';
  return (
    <div className="inventario-ui iv">
      <header className="iv-cab">
        <div className="iv-tit">
          <h1 className="pag">RPG</h1>
          <p>{SUBTITULO[seccion]}</p>
        </div>
        <div className="iv-nv"><small>Nivel</small><b>{me?.nivel ?? '—'}</b></div>
      </header>
      {seccion === 'equipo' && d.bolsa ? <Bolsa b={d.bolsa} items={d.items?.length} /> : null}
      <div className="iv-riel" role="group" aria-label="Sección del RPG">
        {OPCIONES.map(([k, n, ic]) => (
          <button key={k} type="button" aria-pressed={k === seccion} onClick={() => cambiarInventario(k)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ic}</svg>
            <span>{n}</span>
          </button>
        ))}
      </div>
      <div className="inventario-contenido iv-cuerpo" key={seccion}>
        {seccion === 'objetos' ? <Objetos d={d} base={base} /> : seccion === 'equipo' ? <Equipo d={d} base={base} /> : seccion === 'heroe' ? <PerfilHeroe d={d} base={base} /> : <Forja d={d} />}
      </div>
    </div>
  );
}
