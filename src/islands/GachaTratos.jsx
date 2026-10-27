// Gacha → Tratos: port de pintarGachaTratos() + parCartas() + pagerGt() de public/js/app.js.
import React, { useState } from 'react';
import { dur } from '../lib/format.js';
import { tratoEstado, tratoElegir, tratoQuitar, buscarTrato, tratoCarta, tratoPagina } from '../bridge/acciones.js';
import { Vacio, Countdown, Titulo, Campo, Accion } from './ui.jsx';
import { Carta, MiniSel, Pager } from './gachaUi.jsx';

const Par = ({ a, b, tA, tB }) => (
  <div className="gt-par">
    <div><p className="mut peq">{tA}</p><Carta c={a} /></div>
    <span className="gt-flecha" aria-hidden="true">⇄</span>
    <div><p className="mut peq">{tB}</p><Carta c={b} /></div>
  </div>
);

const Caduca = ({ s, base }) => <span className="mut peq">caduca en <Countdown fin={base + s * 1000} /></span>;

// Propuestas pendientes: la que te hicieron y la que enviaste.
function Pendientes({ d, base }) {
  const r = d.recibido;
  const e = d.enviado;
  return (
    <>
      {r && (
        <>
          <Titulo extra={<Caduca s={r.restaS} base={base} />}>Propuesta recibida</Titulo>
          <div className="bloque vidrio">
            <p className="peq"><b>{r.alias}</b> quiere cambiar contigo.</p>
            <Par a={r.ofrece} b={r.pide} tA="Recibes" tB="Entregas" />
            <div className="btnrow" style={{ marginTop: 12 }}>
              <Accion ruta="/api/gacha/aceptar">Aceptar cambio</Accion>
              <Accion ruta="/api/gacha/rechazar">Rechazar</Accion>
            </div>
          </div>
        </>
      )}
      {e && (
        <>
          <Titulo extra={<Caduca s={e.restaS} base={base} />}>Propuesta enviada</Titulo>
          <div className="bloque vidrio">
            <p className="peq">Esperando respuesta de <b>{e.alias}</b>.</p>
            <Par a={e.ofrece} b={e.pide} tA="Entregas" tB="Recibes" />
            <div className="btns uno"><Accion ruta="/api/gacha/cancelar">Cancelar propuesta</Accion></div>
          </div>
        </>
      )}
    </>
  );
}

// Cuadrícula de cartas de uno de los dos jugadores, con su paginador.
function Cartas({ lado, grupo, marcada, vacio }) {
  const k = lado === 'mia' ? 'm' : 's';
  if (!grupo.cartas.length) return <Vacio>{vacio}</Vacio>;
  return (
    <>
      <div className="gc-rejilla">
        {grupo.cartas.map(c => <MiniSel key={c.id} c={c} activa={marcada === c.id} onClick={() => tratoCarta(lado, c.id)} />)}
      </div>
      {grupo.paginas > 1 && <Pager pagina={grupo.pagina} paginas={grupo.paginas} onDir={dir => tratoPagina(k, dir)} margen={8} etiqueta="" />}
    </>
  );
}

// Con un jugador elegido: marcar una carta tuya y una suya para proponer cambio, o regalar la tuya.
function Objetivo({ d, o, mia: idMia, suya: idSuya }) {
  const mia = o.mias.cartas.find(c => c.id === idMia) || null;
  const suya = o.suyas.cartas.find(c => c.id === idSuya) || null;
  const sinMia = 'Elige una carta tuya.';
  const sinAmbas = 'Elige una carta tuya y una de ' + o.alias + '.';
  return (
    <>
      <div className="bloque vidrio">
        <div className="fila"><strong>Trato con {o.alias}</strong><button type="button" className="mini" onClick={tratoQuitar}>Cambiar</button></div>
        <p className="mut peq">Elige una carta tuya y una suya para proponer un cambio, o regala la tuya.</p>
      </div>

      <Titulo>Tus cartas</Titulo>
      <Cartas lado="mia" grupo={o.mias} marcada={idMia} vacio="No tienes cartas para ofrecer." />
      <Titulo>{'Cartas de ' + o.alias}</Titulo>
      <Cartas lado="suya" grupo={o.suyas} marcada={idSuya} vacio="Todavía no tiene cartas." />

      <p className="peq" style={{ marginTop: 12 }}>
        Tu carta: <b>{idMia ? '#' + idMia + (mia ? ' ' + mia.nombre : '') : 'sin elegir'}</b>
        {' · '}De {o.alias}: <b>{idSuya ? '#' + idSuya + (suya ? ' ' + suya.nombre : '') : 'sin elegir'}</b>
      </p>
      <div className="btns">
        <Accion ruta="/api/gacha/proponer" cuerpo={{ ref: o.ref, mia: idMia, suya: idSuya }} motivo={(!idMia || !idSuya) && sinAmbas}>Proponer cambio</Accion>
        <Accion
          ruta="/api/gacha/regalar"
          cuerpo={{ ref: o.ref, id: idMia }}
          motivo={!idMia && sinMia}
          confirmar={idMia ? `¿Regalar ${mia ? mia.nombre : 'esta carta'} a ${o.alias}? No se puede deshacer.` : undefined}
        >Regalar mi carta</Accion>
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>{o.alias} tiene {dur(d.ventanaS)} para aceptar o rechazar la propuesta.</p>
    </>
  );
}

// Sin jugador elegido: buscar a quién proponerle un trato.
function Buscar({ d, consulta }) {
  const [q, setQ] = useState(consulta);
  const buscar = () => buscarTrato(q);
  return (
    <>
      <Titulo>Nuevo trato</Titulo>
      <p className="mut peq">Busca a otro jugador para cambiar o regalarle una carta.</p>
      <div className="campo" style={{ marginTop: 6 }}>
        <Campo texto corto valor={q} onCambio={setQ} ph="Buscar jugador por nombre" onEnter={buscar} />
        <button type="button" className="mini" onClick={buscar}>Buscar</button>
      </div>
      {d.resultados.length
        ? (
          <div className="bloque vidrio">
            {d.resultados.map(j => (
              <div className="fil" key={j.ref}>
                <div className="nom"><strong>{j.alias}</strong></div>
                <button type="button" className="mini" onClick={() => tratoElegir(j.ref)}>Elegir</button>
              </div>
            ))}
          </div>
        )
        : consulta && <Vacio>No encontré a nadie con ese nombre.</Vacio>}
    </>
  );
}

export default function GachaTratos({ d, base }) {
  const { q, mia, suya } = tratoEstado();
  return (
    <>
      <Pendientes d={d} base={base} />
      {d.objetivo ? <Objetivo d={d} o={d.objetivo} mia={mia} suya={suya} /> : <Buscar d={d} consulta={q} />}
    </>
  );
}
