import { api } from '../lib/api.js';
import { fmt, mmss, dur } from '../lib/format.js';
import * as store from '../state/panel.js';
import { e, cambiar } from './estado.js';
import { ACC, RAREZA, ICONOS } from './datos.js';
import { aviso } from './avisos.js';
import { abrir } from './navegar.js';
import { aplicar, refrescar, sesionCaducada } from './sesion.js';
import { cargarEventos, sondearAbiertas } from './eventos.js';
import { petalos } from './petalos.js';
import { vibra } from './tacto.js';

const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const tiempo = s => (s >= 3600 ? dur(s) : mmss(s));

let saltar = null;
export const saltarAnimacion = () => saltar && saltar();
const esperaAnim = () => new Promise(r => {
  saltar = r;
  setTimeout(r, reducir ? 300 : 1600);
});

export function resumen(k, r) {
  const recolecta = ACC[k] ? ACC[k].g === 'r' : true;
  const rr = recolecta && r.rareza ? RAREZA[r.rareza] : null;
  const nom = rr ? rr[0] : '';
  const col = rr ? rr[1] : RAREZA.comun[1];
  const chips = [];
  if (r.monedas) chips.push((r.monedas > 0 ? '+' : '−') + fmt(Math.abs(r.monedas)) + ' monedas');
  if (r.xp) chips.push('+' + fmt(r.xp) + ' XP');
  if (r.subioNivel) chips.push('Subiste al nivel ' + r.subioNivel);
  if (r.evento) chips.push(r.evento);
  if (r.guardian && k !== 'cazar') chips.push(r.guardian.gana ? 'Derrotaste a ' + r.guardian.nombre : r.guardian.nombre + ' te hizo retroceder');
  if (r.extra) chips.push(...r.extra);
  const mal = r.monedas < 0 || !!(r.guardian && !r.guardian.gana);
  return { chips, nom, col: mal ? '#dd8591' : col, mal, nivel: !!r.subioNivel };
}

export function mostrarHoja(o) {
  cambiar({ hoja: { ...o, abierta: true } });
  petalos(o.mal ? 0 : o.nivel ? 60 : o.rareza === 'Legendaria' ? 44 : 26, 'estallido');
}

export function cerrarHoja() {
  if (e.hoja) cambiar({ hoja: { ...e.hoja, abierta: false } });
}

function mostrar(k, r) {
  const { chips, nom, col, mal, nivel } = resumen(k, r);
  vibra(mal ? 70 : nivel ? [20, 40, 20, 40, 30] : [18, 40, 18]);
  mostrarHoja({
    icono: ICONOS[ACC[k].ic], col, mal, nivel, rareza: nom, chips, titulo: r.titulo,
    zona: ACC[k].p ? ACC[k].p + ' en ' + r.zona : r.zona,
    pie: r.espera ? 'Podrás volver en ' + dur(r.espera) + '.' : ''
  });
}

export async function jugar(k) {
  if (e.ocupado) return;
  const rest = Math.ceil((e.fin[k] - Date.now()) / 1000);
  if (rest > 0) return aviso('Aún faltan ' + tiempo(rest) + ' para volver a ' + ACC[k].ya + '.');
  cambiar({ ocupado: true, anim: k });
  try {
    const [d] = await Promise.all([api('/api/rpg/' + k, {}), esperaAnim()]);
    cambiar({ anim: null });
    store.vaciar();
    aplicar(d.me);
    mostrar(k, d.resultado);
  } catch (err) {
    cambiar({ anim: null });
    if (err.estado === 401) sesionCaducada();
    else {
      aviso(err.message);
      refrescar();
    }
  } finally {
    cambiar({ ocupado: false });
  }
}

const icono = ruta => ruta.includes('/gacha') ? ICONOS.gacha
  : ruta.includes('/raid') ? ICONOS.raid
    : ruta.includes('/clan') ? ICONOS.clan
      : ruta.includes('/alquimia') ? ICONOS.alquimia
        : ruta.includes('/mundial') ? ICONOS.mundial
          : ruta.includes('/encuentro') ? ICONOS.gacha
            : ruta.includes('granja') ? ICONOS.leaf
              : ruta.includes('mazmorra') || ruta.includes('/sala') ? ICONOS.hunt
                : ruta.includes('/casino') ? ICONOS.dado
                  : ruta.includes('/jugadores') ? ICONOS.mask
                    : ruta.includes('/banco') || ruta.includes('/negocios') ? ICONOS.moneda
                      : ICONOS.gift;

export async function publicar(b, ruta, cuerpo) {
  if (e.publicando || e.ocupado) return;
  cambiar({ publicando: true });
  if (b) b.setAttribute('aria-busy', 'true');
  try {
    const d = await api(ruta, cuerpo);
    store.vaciar();
    if (d.me) aplicar(d.me);
    if (ruta.includes('/gacha') || ruta.includes('/raid')) cargarEventos(true);
    if (ruta.includes('/gacha/')) {
      sondearAbiertas();
      store.sel.gtMia = 0;
      store.sel.gtSuya = 0;
    }
    if (d.resultado) {
      const { chips, nom, col, mal, nivel } = resumen('', d.resultado);
      mostrarHoja({
        icono: icono(ruta), col, mal, nivel, rareza: ruta.includes('/raid') ? '' : nom, chips,
        titulo: d.resultado.titulo, zona: d.resultado.zona,
        pie: d.mensaje && /\/(encuentro|alquimia|mundial)\//.test(ruta) ? d.mensaje : '',
        boton: 'Listo', imagen: d.resultado.carta ? d.resultado.carta.imagen : null
      });
    } else if (d.mensaje) aviso(d.mensaje);
    await abrir(e.tab, true);
  } catch (err) {
    if (err.estado === 401) sesionCaducada();
    else aviso(err.message);
  } finally {
    cambiar({ publicando: false });
    if (b) b.removeAttribute('aria-busy');
  }
}
