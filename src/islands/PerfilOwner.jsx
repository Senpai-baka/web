import React from 'react';
import { fmt, dur } from '../lib/format.js';

const K = ({ v, t }) => <div><dt>{t}</dt><dd>{v}</dd></div>;

export default function PerfilOwner({ d }) {
  const e = d.estado;
  return (
    <>
      <section className="fc-panel">
        <header className="fc-panel-t">
          <strong>
            <i className={'fc-punto' + (e.online ? ' on' : '')} aria-hidden="true" />
            {e.online ? 'Bot conectado' : 'Bot desconectado'}
          </strong>
          <span>{d.instancia.id}</span>
        </header>
        <dl className="fc-datos">
          <K v={dur(e.uptimeS)} t="Activo" />
          <K v={e.latenciaWaMs == null ? '—' : e.latenciaWaMs + ' ms'} t="WhatsApp" />
          <K v={e.latenciaDbMs == null ? '—' : e.latenciaDbMs + ' ms'} t="Base de datos" />
          <K v={e.ramMb + ' MB'} t="Memoria" />
          <K v={e.lagMs + ' ms'} t="Lag del proceso" />
          <K v={d.instancia.node} t="Node" />
        </dl>
      </section>
      {d.web.conectados && (
        <section className="fc-panel">
          <dl className="fc-datos tres">
            <K v={fmt(d.web.conectados.ahora)} t="En la web ahora" />
            <K v={fmt(d.web.conectados.quince)} t="Últimos 15 min" />
            <K v={fmt(d.web.conectados.dia)} t="Últimas 24 h" />
          </dl>
          <p className="fc-pie">Se cuentan jugadores distintos con la web abierta. Se reinicia si el servidor se reinicia.</p>
        </section>
      )}
      <section className="fc-panel">
        <dl className="fc-datos">
          <K v={fmt(d.totales.usuarios)} t="Usuarios" />
          <K v={fmt(d.totales.clanes)} t="Clanes" />
          <K v={d.web.habilitada ? 'Activa' : 'Apagada'} t="API web" />
          <K v={d.creadores} t="Creadores" />
        </dl>
        <p className="fc-pie">Datos de esta instancia. Si corres varias, abre el panel de cada una.</p>
      </section>
    </>
  );
}
