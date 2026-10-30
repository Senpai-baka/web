import React from 'react';
import { createRoot } from 'react-dom/client';
import Rankings from '../islands/Rankings.jsx';
import Clan from '../islands/Clan.jsx';
import Raid from '../islands/Raid.jsx';
import Mazmorra from '../islands/Mazmorra.jsx';
import Sala from '../islands/Sala.jsx';
import Gacha from '../islands/Gacha.jsx';
import Inventario from '../islands/Inventario.jsx';
import Perfil from '../islands/Perfil.jsx';
import Ciudad from '../islands/Ciudad.jsx';
import Tienda from '../islands/Tienda.jsx';
import Hogar from '../islands/Hogar.jsx';
import TabHost from '../islands/TabHost.jsx';

const ISLAS = { rankings: Rankings, clan: Clan, raid: Raid, mazmorra: Mazmorra, sala: Sala, gacha: Gacha, inventario: Inventario, ficha: Perfil, ciudad: Ciudad, tienda: Tienda, hogar: Hogar };

export function montarIslas() {
  for (const [t, Isla] of Object.entries(ISLAS)) {
    const el = document.getElementById('t-' + t);
    if (el) createRoot(el).render(<TabHost t={t} Isla={Isla} />);
  }
}
