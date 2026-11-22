export const NEUTRO = '#c3bbdc';

export const RAREZAS = {
  comun: ['Común', '#a9b0c4'],
  poco: ['Poco común', '#8fc4ad'],
  rara: ['Rara', '#8fb4d6'],
  epica: ['Épica', '#b69be0'],
  legendaria: ['Legendaria', '#e0b96a']
};

export const ORDEN_RAREZA = Object.keys(RAREZAS);
export const infoRareza = r => RAREZAS[r] || RAREZAS.comun;
export const colorRareza = r => infoRareza(r)[1];

export const RAREZAS_EQUIPO = {
  comun: ['Común', '#a9b0c4', '⚪'],
  raro: ['Raro', '#8fb4d6', '🔵'],
  epica: ['Épica', '#b69be0', '🟣'],
  mitica: ['Mítica', '#e0b96a', '🟡'],
  semidios: ['Semidiós', '#ee7d95', '🔱']
};

export const ORDEN_EQUIPO = Object.keys(RAREZAS_EQUIPO);
const LEGADO_EQUIPO = { poco: 'comun', rara: 'raro', epico: 'epica', legendaria: 'mitica', legendario: 'mitica' };
export const claveEquipo = it => {
  const k = typeof it === 'string' ? it : (it?.rarezaClave || it?.rareza);
  return RAREZAS_EQUIPO[k] ? k : LEGADO_EQUIPO[k] || 'comun';
};
export const infoEquipo = it => RAREZAS_EQUIPO[claveEquipo(it)];
export const colorEquipo = it => infoEquipo(it)[1];
export const rangoEquipo = it => ORDEN_EQUIPO.indexOf(claveEquipo(it));
export const altaRareza = it => rangoEquipo(it) >= ORDEN_EQUIPO.indexOf('mitica');

export const ORO = RAREZAS.legendaria[1];
export const AZUL = RAREZAS.rara[1];

export const COLOR_COFRE = { madera: RAREZAS.comun[1], plata: AZUL, oro: ORO };

export const COLOR_OBJETO = {
  elixir_fuerza: '#e8946a', elixir_suerte: '#8fc4ad', tonico_fortuna: '#e0b96a',
  elixir_furia: '#dd8591', piel_piedra: '#8fb4d6', esencia_cazador: '#b69be0',
  pocion_energia: '#e0b96a', pocion_mayor: '#dd8591', kit_reparacion: '#8fb4d6', piedra_bendicion: '#b69be0'
};

export const colorObjeto = clave => COLOR_OBJETO[clave] || NEUTRO;
