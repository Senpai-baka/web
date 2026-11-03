import React, { memo, useEffect, useLayoutEffect } from 'react';
import { TABS, TITULO } from '../core/datos.js';
import { useEstado } from '../core/estado.js';
import { arrancar } from '../core/sesion.js';
import { iniciarAvisos } from '../core/avisos.js';
import { iniciarCiclos } from '../core/ciclos.js';
import { iniciarTacto } from '../core/tacto.js';
import { iniciarScroll } from '../core/scroll.js';
import { petalos, quitarAmbiente } from '../core/petalos.js';
import { ISLAS, precargarIslas } from '../bridge/islands.jsx';
import * as store from '../state/panel.js';
import TabHost from '../islands/TabHost.jsx';
import Cabecera from './Cabecera.jsx';
import Login from './Login.jsx';
import Inicio from './Inicio.jsx';
import Nav from './Nav.jsx';
import { Animacion, Hoja, Toast } from './Superposiciones.jsx';

const Pestana = memo(TabHost);

export default function App() {
  const vista = useEstado(s => s.vista);
  const tab = useEstado(s => s.tab);
  const listas = useEstado(s => s.listas);
  const panel = vista === 'panel';
  const hayMe = useEstado(s => !!s.me);

  useEffect(() => {
    iniciarAvisos();
    iniciarTacto();
    iniciarScroll();
    iniciarCiclos();
    arrancar();
  }, []);

  useEffect(() => {
    if (panel) precargarIslas(tab === 'inicio' ? null : tab);
  }, [panel]);

  useLayoutEffect(() => {
    if (!panel) return undefined;
    store.restaurarPos(tab);
    return () => {
      const el = document.getElementById('t-' + tab);
      if (el) el.classList.add('ya');
    };
  }, [tab, panel]);

  useLayoutEffect(() => {
    if (panel && hayMe && store.hayPendiente(tab)) store.restaurarPos(tab);
  }, [panel, hayMe, tab]);

  useEffect(() => {
    if (!panel || !hayMe) return undefined;
    if (navigator.connection && navigator.connection.saveData) return undefined;
    const lista = ['inventario', 'tienda', 'hogar', 'ciudad', 'rankings'];
    let vivo = true;
    let id = 0;
    const paso = () => {
      if (!vivo) return;
      const t = lista.shift();
      if (!t) return;
      if (!document.hidden && !store.cache[t] && !store.errores[t]) store.cargar(t);
      id = setTimeout(paso, 800);
    };
    id = setTimeout(paso, 2500);
    return () => { vivo = false; clearTimeout(id); };
  }, [panel, hayMe]);

  useEffect(() => {
    quitarAmbiente();
    if (vista === 'login') {
      petalos(14, 'ambiente');
      document.title = TITULO;
    }
  }, [vista]);

  return (
    <>
      <div id="petalas" aria-hidden="true" />
      <main id="app" className={panel ? 'con-nav' : undefined}>
        <Cabecera panel={panel} />
        <Login visible={vista === 'login'} />
        <section id="v-panel" hidden={!panel}>
          <div id="t-inicio" hidden={tab !== 'inicio'}>{panel && <Inicio />}</div>
          {TABS.filter(t => t !== 'inicio').map(t => (
            <div key={t} id={'t-' + t} hidden={tab !== t}>
              <Pestana t={t} Isla={ISLAS[t]} />
            </div>
          ))}
        </section>
      </main>
      <Nav panel={panel} listas={listas} />
      <Animacion />
      <Hoja />
      <Toast />
    </>
  );
}
