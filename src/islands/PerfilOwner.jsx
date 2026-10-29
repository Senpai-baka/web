import React from 'react';
import { fmt, dur } from '../lib/format.js';

const K = ({ v, t }) => <div><b>{v}</b><span>{t}</span></div>;

export default function PerfilOwner({ d }) {
  const e = d.estado;
  return (
    <>
      <div className="bloque vidrio">
        <div className="fila">
          <strong>{e.online ? '🟢 Bot conectado' : '🔴 Bot desconectado'}</strong>
          <span className="mut peq">{d.instancia.id}</span>
        </div>
        <div className="kpis">
          <K v={dur(e.uptimeS)} t="Activo" />
          <K v={e.latenciaWaMs == null ? '—' : e.latenciaWaMs + ' ms'} t="WhatsApp" />
          <K v={e.latenciaDbMs == null ? '—' : e.latenciaDbMs + ' ms'} t="Base de datos" />
          <K v={e.ramMb + ' MB'} t="Memoria" />
          <K v={e.lagMs + ' ms'} t="Lag del proceso" />
          <K v={d.instancia.node} t="Node" />
        </div>
      </div>
      {d.web.conectados && (
        <div className="bloque vidrio">
          <div className="kpis">
            <K v={fmt(d.web.conectados.ahora)} t="En la web ahora" />
            <K v={fmt(d.web.conectados.quince)} t="Últimos 15 min" />
            <K v={fmt(d.web.conectados.dia)} t="Últimas 24 h" />
          </div>
          <p className="mut peq" style={{ marginTop: 10 }}>Se cuentan jugadores distintos con la web abierta. Se reinicia si el servidor se reinicia.</p>
        </div>
      )}
      <div className="bloque vidrio">
        <div className="kpis">
          <K v={fmt(d.totales.usuarios)} t="Usuarios" />
          <K v={fmt(d.totales.clanes)} t="Clanes" />
          <K v={d.web.habilitada ? 'Activa' : 'Apagada'} t="API web" />
          <K v={d.creadores} t="Creadores" />
        </div>
        <p className="mut peq" style={{ marginTop: 10 }}>Datos de esta instancia. Si corres varias, abre el panel de cada una.</p>
      </div>
    </>
  );
}
