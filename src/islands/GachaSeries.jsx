import React, { useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import {
  gachaPagina, serieEstado, buscarSeries, serieElegir, serieQuitar, serieModo,
  constelacionRef, constelacionElegir, constelacionQuitar
} from '../bridge/acciones.js';
import { publicar } from '../bridge/acciones.js';
import { Seg, Vacio, Titulo, Accion, Campo, Countdown, Kv, Barra, Cifras } from './ui.jsx';
import { Carta, Mini, ChipsRareza, Pager } from './gachaUi.jsx';

const Fila = ({ onClick, children }) => (
  <div
    className="fil"
    role="button"
    tabIndex={0}
    style={{ cursor: 'pointer' }}
    onClick={onClick}
    onKeyDown={ev => { if (ev.key === 'Enter') onClick(); }}
  >
    {children}
  </div>
);

function SerieLista({ d, q }) {
  const [texto, setTexto] = useState(q || '');
  return (
    <>
      <p className="mut peq">Busca una serie para ver tu progreso, qué cartas tienes y cuáles te faltan.</p>
      <div className="btnrow" style={{ marginBottom: 10 }}>
        <Campo texto valor={texto} onCambio={setTexto} ph="Buscar serie" onEnter={() => buscarSeries(texto.trim())} />
        <button type="button" className="mini" onClick={() => buscarSeries(texto.trim())}>Buscar</button>
      </div>
      <Titulo extra={<span className="mut peq">{fmt(d.total)} series</span>}>Series</Titulo>
      {d.series.length ? (
        <>
          <div className="bloque vidrio">
            {d.series.map(s => (
              <Fila key={s.titulo} onClick={() => serieElegir(s.titulo)}>
                <span className="pos">{s.pos}.</span>
                <div className="nom">
                  <strong>{s.titulo}</strong>
                  <span className="mut peq">{fmt(s.reclamadas)} de {fmt(s.total)} reclamadas</span>
                </div>
              </Fila>
            ))}
          </div>
          {d.paginas > 1 && <Pager pagina={d.pagina} paginas={d.paginas} onDir={gachaPagina} />}
        </>
      ) : <Vacio>No encontré ninguna serie con ese nombre.</Vacio>}
    </>
  );
}

const MODOS = [['', 'Resumen'], ['tengo', 'Tengo'], ['faltan', 'Faltan']];

function SerieDetalle({ d }) {
  const p = d.progreso;
  const l = d.lista;
  return (
    <>
      <div className="btns uno" style={{ marginBottom: 10 }}>
        <button type="button" className="mini" onClick={serieQuitar}>← Volver a las series</button>
      </div>
      <div className="bloque vidrio">
        <div className="fila"><strong>{d.titulo}</strong>{p.completa && <span className="etiq">Completa</span>}</div>
        <Cifras lista={[['Cartas', fmt(d.total)], ['Reclamadas', fmt(d.reclamadas)], ['Libres', fmt(d.libres)], ['Valor', fmt(d.valor)]]} />
        <div className="stat" style={{ marginTop: 10 }}>
          <div className="fila"><span>Tu progreso</span><span>{p.tengo}/{p.total} · {p.porcentaje}%</span></div>
          <Barra valor={p.tengo} max={p.total} />
        </div>
      </div>
      <Seg aria="Vista de la serie" opciones={MODOS} valor={l ? l.modo : ''} onCambio={serieModo} />
      {l ? (
        l.cartas.length ? (
          <>
            <div className="gc-rejilla">{l.cartas.map(c => <Mini key={c.id} c={c} />)}</div>
            {l.paginas > 1 && <Pager pagina={l.pagina} paginas={l.paginas} onDir={gachaPagina} />}
          </>
        ) : <Vacio>{l.modo === 'tengo' ? 'Aún no tienes cartas de esta serie.' : 'Ya tienes todas las cartas de esta serie.'}</Vacio>
      ) : (
        <>
          <ChipsRareza lista={d.porRareza} />
          {d.populares.length > 0 && (
            <>
              <Titulo>Más populares</Titulo>
              {d.populares.map(c => (
                <div className="bloque vidrio" key={c.id}>
                  <Carta c={c} />
                  <p className="mut peq" style={{ marginTop: 8 }}>{c.dueno ? 'Dueño: ' + c.dueno : 'Sin dueño'}</p>
                </div>
              ))}
            </>
          )}
          {d.mejoresDuenos.length > 0 && (
            <>
              <Titulo>Mejores coleccionistas de la serie</Titulo>
              <div className="bloque vidrio">
                {d.mejoresDuenos.map(o => (
                  <div className="fil" key={o.pos}>
                    <span className="pos">{o.pos}.</span>
                    <div className="nom"><strong>{o.nombre || 'Jugador'}</strong></div>
                    <span className="val">{fmt(o.cartas)} cartas</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export function GachaSeries({ d }) {
  const { ref, q } = serieEstado();
  return ref && d.titulo ? <SerieDetalle d={d} /> : <SerieLista d={d} q={q} />;
}

export function GachaFusion({ d, base }) {
  const [ids, setIds] = useState('');
  const [carta, setCarta] = useState('');
  const fusionar = e => {
    const lista = ids.split(/[\s,#]+/).filter(Boolean).map(Number);
    if (!lista.length || !lista.every(Number.isInteger)) return;
    publicar(e.currentTarget, '/api/fusion/fusionar', { ids: lista });
  };
  const elegir = (e, valor) => publicar(e.currentTarget, '/api/fusion/elegir', { carta: valor });
  return (
    <>
      <p className="mut peq">
        Fusiona varias cartas de la misma rareza para ganar una ficha de la rareza siguiente. Con la ficha eliges una carta libre. Las fichas caducan en {dur(d.vidaFichaS)}.
      </p>
      <div className="bloque vidrio">
        <Cifras lista={[['Fusiones hoy', d.hoy + '/' + d.max], ['Monedas', fmt(d.cartera)], [d.emojiEsencia + ' Esencia', fmt(d.esencia)]]} />
      </div>
      <Titulo>Recetas</Titulo>
      <div className="bloque vidrio">
        {d.tramos.map(t => (
          <Kv
            key={t.rareza.clave}
            k={<>{t.rareza.emoji} {t.cantidad} {t.rareza.nombre.toLowerCase()} → ficha {t.destino.emoji} {t.destino.nombre}</>}
            v={fmt(t.monedas) + ' · ' + d.emojiEsencia + ' ' + fmt(t.esencia)}
          />
        ))}
      </div>
      <Titulo>Fusionar</Titulo>
      <div className="bloque vidrio">
        <p className="mut peq">Escribe los ids de tus cartas separados por coma (los ves en Colección). No pueden estar en venta ni ser tu compañero activo.</p>
        <input className="txt" placeholder="Ej: 120, 455, 981" aria-label="Ids de las cartas" autoComplete="off" value={ids} onChange={ev => setIds(ev.target.value)} />
        <div className="btns uno"><button type="button" className="mini" onClick={fusionar}>Fusionar</button></div>
      </div>
      <Titulo extra={<span className="mut peq">{d.fichas.length} activa{d.fichas.length === 1 ? '' : 's'}</span>}>Tus fichas</Titulo>
      {d.fichas.length ? (
        <>
          <div className="bloque vidrio">
            {d.fichas.map((f, i) => (
              <div className="fil" key={i}>
                <span className="pos">{f.rareza.emoji}</span>
                <div className="nom"><strong>Ficha {f.rareza.nombre}</strong></div>
                <span className="val">Caduca en <Countdown fin={base + f.venceS * 1000} /></span>
              </div>
            ))}
          </div>
          <div className="bloque vidrio">
            <p className="mut peq">Canjea tu ficha más antigua por una carta libre de su rareza: al azar o por id.</p>
            <input className="txt" placeholder="Id de la carta (opcional)" aria-label="Id de la carta" autoComplete="off" value={carta} onChange={ev => setCarta(ev.target.value)} />
            <div className="btnrow">
              <button type="button" className="mini" onClick={e => elegir(e, 'azar')}>Carta al azar</button>
              <button type="button" className="mini" onClick={e => carta.trim() && elegir(e, carta.trim())}>Elegir por id</button>
            </div>
          </div>
        </>
      ) : <Vacio>No tienes fichas de fusión activas.</Vacio>}
    </>
  );
}

function ConstelacionLista({ d }) {
  return (
    <>
      <p className="mut peq">
        Completa series para ganar premios por tramos (25%, 50%, 75% y 100%). Solo cuentan las series de {d.minSerie} o más cartas.
      </p>
      <div className="bloque vidrio">
        <Cifras lista={[['Completas', d.completas], ['Por cobrar', d.porCobrar]]} />
        <div className="btns uno">
          <Accion ruta="/api/constelaciones/cobrar" motivo={!d.porCobrar && 'No hay premios esperándote ahora.'}>Cobrar premios</Accion>
        </div>
      </div>
      <Titulo>Tus series</Titulo>
      {d.series.length ? (
        <div className="bloque vidrio">
          {d.series.map(s => (
            <Fila key={s.titulo} onClick={() => constelacionElegir(s.titulo)}>
              <div className="nom">
                <strong>{s.titulo}</strong>
                <span className="mut peq">{s.tengo}/{s.total} cartas · tramo {s.nivel}/4{s.pendientes ? ' · ' + s.pendientes + ' por cobrar' : ''}</span>
              </div>
              <span className="val">{Math.round((s.tengo / s.total) * 100)}%</span>
            </Fila>
          ))}
        </div>
      ) : <Vacio>Aún no tienes cartas de series con suficientes personajes.</Vacio>}
    </>
  );
}

function ConstelacionDetalle({ d }) {
  return (
    <>
      <div className="btns uno" style={{ marginBottom: 10 }}>
        <button type="button" className="mini" onClick={constelacionQuitar}>← Volver a las constelaciones</button>
      </div>
      <div className="bloque vidrio">
        <div className="fila"><strong>{d.titulo}</strong><span className="mut peq">Tramo {d.nivel}/4</span></div>
        <div className="stat" style={{ marginTop: 10 }}>
          <div className="fila"><span>Progreso</span><span>{d.tengo}/{d.total}</span></div>
          <Barra valor={d.tengo} max={d.total} />
        </div>
        {d.elegible ? (
          <div style={{ marginTop: 10 }}>
            {d.umbrales.map((u, i) => (
              <Kv key={i} k={'Tramo ' + (i + 1)} v={u + ' cartas · ' + (d.reclamados.includes(i + 1) ? '✅ cobrado' : d.tengo >= u ? '🎁 por cobrar' : '🔒')} />
            ))}
          </div>
        ) : <p className="mut peq" style={{ marginTop: 10 }}>Esta serie es muy corta y no da premios de constelación.</p>}
      </div>
      {d.faltan.length > 0 && (
        <>
          <Titulo extra={d.masFaltan ? <span className="mut peq">y {d.masFaltan} más</span> : null}>Te faltan</Titulo>
          <div className="gc-rejilla">{d.faltan.map(c => <Mini key={c.id} c={c} />)}</div>
        </>
      )}
    </>
  );
}

export function GachaConstelaciones({ d }) {
  return constelacionRef() && d.titulo ? <ConstelacionDetalle d={d} /> : <ConstelacionLista d={d} />;
}
