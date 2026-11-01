import React from 'react';
import { Cab, Seg } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { inventarioSeccion, cambiarInventario } from '../bridge/acciones.js';
import { fmt } from '../lib/format.js';
import Objetos from './inventario/Objetos.jsx';
import Equipo from './inventario/Equipo.jsx';
import Forja from './inventario/Forja.jsx';

const OPCIONES = [['objetos', 'Objetos'], ['equipo', 'Equipo'], ['forja', 'Forja']];

const SUBTITULO = {
  objetos: 'Cofres, herramientas, consumibles, materiales y reliquias.',
  equipo: 'Lo que llevas puesto, tu bolsa y su mantenimiento.',
  forja: 'Fabrica, prepara elixires y vende materiales.'
};

export default function Inventario({ d, base }) {
  const me = useMe();
  const seccion = inventarioSeccion();
  const monedas = fmt(Number(me?.monedas || 0));
  const stats = seccion === 'equipo' && d.bolsa
    ? [['Monedas', monedas], ['Bolsa', `${d.bolsa.usados ?? d.items?.length ?? 0}/${d.bolsa.max}`], ['Nivel', me?.nivel ?? '—']]
    : undefined;
  return (
    <div className="inventario-ui">
      <Cab titulo="Mochila" sub={SUBTITULO[seccion]} stats={stats} />
      <Seg aria="Sección del inventario" opciones={OPCIONES} valor={seccion} onCambio={cambiarInventario} />
      <div className="inventario-contenido">
        {seccion === 'objetos' ? <Objetos d={d} base={base} /> : seccion === 'equipo' ? <Equipo d={d} /> : <Forja d={d} />}
      </div>
    </div>
  );
}
