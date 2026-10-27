import React from 'react';
import { Cab, Seg } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { htmlInventarioCuerpo, inventarioSeccion, cambiarInventario } from '../bridge/acciones.js';

const OPCIONES = [
  ['objetos', 'Objetos'],
  ['equipo', 'Equipo'],
  ['forja', 'Forja'],
];

/**
 * Primera fase de migración de Mochila:
 * React controla el encabezado y la navegación de sección. El contenido detallado
 * se conserva temporalmente desde los renderizadores probados del panel anterior,
 * de modo que las acciones existentes siguen usando sus rutas y validaciones.
 */
export default function Inventario({ d, base }) {
  const me = useMe();
  const seccion = inventarioSeccion();
  const stats = seccion === 'objetos' && d.bolsa && d.items
    ? [['Monedas', Number(me?.monedas || 0).toLocaleString('es-MX')], ['Espacios', `${d.items.length}/${d.bolsa.max}`], ['Nivel', me?.nivel ?? '—']]
    : undefined;
  const html = htmlInventarioCuerpo(d, base);

  return (
    <>
      <Cab titulo="Mochila" sub="Tus herramientas, equipo y materiales." stats={stats} />
      <Seg aria="Sección del inventario" opciones={OPCIONES} valor={seccion} onCambio={cambiarInventario} />
      <div className="inventario-contenido" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
