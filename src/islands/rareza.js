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

export const ORO = RAREZAS.legendaria[1];
export const AZUL = RAREZAS.rara[1];

export const COLOR_COFRE = { madera: RAREZAS.comun[1], plata: AZUL, oro: ORO };

export const COLOR_OBJETO = {
  elixir_fuerza: '#e8946a', elixir_suerte: '#8fc4ad', tonico_fortuna: '#e0b96a',
  elixir_furia: '#dd8591', piel_piedra: '#8fb4d6', esencia_cazador: '#b69be0',
  pocion_energia: '#e0b96a', pocion_mayor: '#dd8591', kit_reparacion: '#8fb4d6', piedra_bendicion: '#b69be0'
};

export const colorObjeto = clave => COLOR_OBJETO[clave] || NEUTRO;
