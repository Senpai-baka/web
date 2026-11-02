import React from 'react';
import { ciudadSeccion, ciudadIr } from '../bridge/acciones.js';
import { Cab, Seg } from './ui.jsx';
import Banco from './ciudad/Banco.jsx';
import Negocios from './ciudad/Negocios.jsx';
import Casino from './ciudad/Casino.jsx';
import Altar from './ciudad/Altar.jsx';
import Jugadores from './ciudad/Jugadores.jsx';

const SECCIONES = [['banco', 'Banco'], ['negocios', 'Negocios'], ['casino', 'Casino'], ['altar', 'Altar'], ['jugadores', 'Jugadores']];

const SUBTITULO = {
  banco: 'Guarda tus monedas, haz que crezcan y paga a otros.',
  negocios: 'Compra, mejora y cobra lo que producen.',
  casino: 'Prueba tu suerte con lo que puedas perder.',
  altar: 'Reliquias con bonos permanentes de ingresos.',
  jugadores: 'Busca jugadores, mira su perfil o intenta robarles.'
};

const ICONO = (
  <>
    <path d="M4 21 V9 L10 6 V21" />
    <path d="M10 21 V4 L20 8 V21" />
    <path d="M3 21 H21" />
    <path d="M13 10 H17 M13 14 H17" />
  </>
);

const VISTAS = { banco: Banco, negocios: Negocios, casino: Casino, altar: Altar, jugadores: Jugadores };

export default function Ciudad({ d, base }) {
  const sel = ciudadSeccion();
  const Vista = VISTAS[sel] || Banco;
  return (
    <>
      <Cab titulo="Ciudad" sub={SUBTITULO[sel] || SUBTITULO.banco} icono={ICONO} />
      <Seg aria="Sección de la ciudad" opciones={SECCIONES} valor={sel} onCambio={ciudadIr} />
      <Vista d={d} base={base} />
    </>
  );
}
