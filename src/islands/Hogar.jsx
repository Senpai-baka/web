// Pestaña Hogar ("Mundo"): port de pintarHogar() + pintarMascota() + pintarGranja() de public/js/app.js.
import React, { useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { hogarSeccion, hogarIr, publicar } from '../bridge/acciones.js';
import { Cab, Seg, Countdown, Titulo, Accion, BotonListo, Barra, Estado } from './ui.jsx';

const SECCIONES = [['mascota', 'Mascota'], ['granja', 'Granja']];

const ICONO = (
  <>
    <path d="M12 21 C12 14 8 11 4 11 C4 16 7 20 12 21 Z" />
    <path d="M12 21 C12 14 16 9 20 9 C20 15 17 20 12 21 Z" />
  </>
);

/* ---------- Mascota ---------- */
function Adoptar({ d }) {
  const [nombre, setNombre] = useState('');
  return (
    <>
      <Titulo>Adopta una mascota</Titulo>
      <p className="mut peq">Cuesta {fmt(d.precio)} monedas. Dan bonos si las cuidas: aliméntalas, acarícialas y juega con ellas.</p>
      <input
        className="txt" maxLength={16} placeholder="Nombre (opcional)" autoComplete="off" aria-label="Nombre de la mascota"
        value={nombre} onChange={e => setNombre(e.target.value)}
      />
      {d.tipos.map(t => (
        <div className="bloque vidrio" key={t.clave}>
          <div className="pet">
            <span className="em">{t.emoji}</span>
            <div style={{ flex: 1 }}><strong>{t.nombre}</strong><p className="mut peq">{t.desc}</p></div>
          </div>
          <div className="btns uno">
            <Accion ruta="/api/mascota/adoptar" cuerpo={{ tipo: t.clave }} campos={{ nombre }}>Adoptar</Accion>
          </div>
        </div>
      ))}
    </>
  );
}

function Mascota({ d, base }) {
  if (!d.tiene) return <Adoptar d={d} />;
  const c = d.costos;
  const renombrar = e => {
    const boton = e.currentTarget;
    const n = window.prompt('Nuevo nombre (2 a 16 letras o números):', d.nombre);
    if (n && n.trim()) publicar(boton, '/api/mascota/renombrar', { nombre: n.trim() });
  };
  return (
    <>
      <Titulo>Tu mascota</Titulo>
      <div className="bloque vidrio">
        <div className="pet">
          <span className="em">{d.tipo.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{d.nombre}</strong>
            {d.nombre === d.tipo.nombre ? '' : <> <span className="mut peq">({d.tipo.nombre})</span></>}
            <p className="peq">
              {d.animo.emoji} {d.animo.nombre}
              <span className={'etiq ' + (d.activa ? '' : 'nar')}>{d.activa ? 'Bono activo' : 'Sin bono'}</span>
            </p>
          </div>
        </div>
        <div className="stat">
          <div className="fila"><span>Nivel {d.nivel}/{d.max}</span><span>{d.xpSig ? d.xp + '/' + d.xpSig + ' XP' : 'Máximo'}</span></div>
          <Barra valor={d.xpSig ? d.xp : 1} max={d.xpSig || 1} />
        </div>
        <Estado nombre="Vida" v={d.vida} cls={d.vida < 30 ? 'nar' : ''} />
        <Estado nombre="Felicidad" v={d.fel} cls={d.fel < 25 ? 'nar' : ''} />
        <p className="peq" style={{ marginTop: 12 }}>
          {d.hambre ? 'Tiene hambre, aliméntala ya' : <>Le dará hambre en <Countdown fin={base + d.hambreS * 1000} /></>}
        </p>
        <p className="mut peq">{d.tipo.desc}{d.factor !== 1 ? ' · x' + d.factor + ' por su ánimo' : ''}</p>
      </div>
      <div className="btns">
        <BotonListo ruta="/api/mascota/alimentar" txt={'Alimentar ' + fmt(c.comida)} fin={base + d.comidaS * 1000} />
        <BotonListo ruta="/api/mascota/acariciar" txt="Acariciar" fin={base + d.cariciaS * 1000} />
        <BotonListo ruta="/api/mascota/jugar" txt={'Jugar ' + fmt(c.juego)} fin={base + d.juegoS * 1000} />
        <BotonListo ruta="/api/mascota/curar" txt={'Curar ' + fmt(c.cura)} bloq={d.necesitaCura ? '' : 'Está sana'} />
      </div>
      <div className="btns uno"><button type="button" className="mini" onClick={renombrar}>Renombrar</button></div>
    </>
  );
}

/* ---------- Granja ---------- */
function Parcela({ c, base }) {
  return (
    <div className={'plot ' + (c.marchita ? 'mar' : c.lista ? 'ok' : '')}>
      <span className="em">{c.emoji}</span>
      {c.marchita ? 'Marchita' : c.lista ? 'Lista' : <Countdown fin={base + c.listoS * 1000} />}
    </div>
  );
}

function Semilla({ c, d }) {
  const motivo = !d.libres && 'No tienes parcelas libres.';
  return (
    <div className="bloque vidrio" style={{ padding: '12px 14px' }}>
      <div className="fila"><strong>{c.emoji} {c.nombre}</strong><span className="mut peq">{dur(c.duracionS)}</span></div>
      <p className="mut peq">Semilla {fmt(c.semilla)} → {fmt(c.valor)} monedas</p>
      <div className="btnrow">
        <Accion ruta="/api/granja/plantar" cuerpo={{ cultivo: c.clave, cantidad: 1 }} motivo={motivo}>Sembrar 1</Accion>
        <Accion ruta="/api/granja/plantar" cuerpo={{ cultivo: c.clave, cantidad: 'todo' }} motivo={motivo}>Sembrar todas</Accion>
      </div>
    </div>
  );
}

function Granja({ d, base }) {
  return (
    <>
      <Titulo extra={<span className="mut peq">{d.parcelas} parcelas</span>}>Tu granja</Titulo>
      <div className="bloque vidrio">
        <div className="plots">
          {d.cultivos.map((c, i) => <Parcela key={i} c={c} base={base} />)}
          {Array.from({ length: d.libres }, (_, i) => <div className="plot" key={'libre' + i}><span className="em">🟫</span>Libre</div>)}
        </div>
        <p className="mut peq" style={{ marginTop: 10 }}>Lo que dejes más de {d.marchitaH} h tras madurar se marchita y paga la mitad.</p>
        <div className="btns">
          <Accion ruta="/api/granja/cosechar" motivo={!d.listas && 'Aún no hay nada listo.'}>{d.listas ? 'Cosechar (' + d.listas + ')' : 'Cosechar'}</Accion>
          {d.costoParcela !== null
            ? <Accion ruta="/api/granja/parcela">Parcela {fmt(d.costoParcela)}</Accion>
            : <Accion motivo="Ya tienes todas las parcelas extra.">Parcelas al máximo</Accion>}
        </div>
      </div>
      <Titulo>Semillas</Titulo>
      {d.catalogo.map(c => <Semilla key={c.clave} c={c} d={d} />)}
    </>
  );
}

export default function Hogar({ d, base }) {
  const sel = hogarSeccion();
  return (
    <>
      <Cab titulo="Mundo" sub="Tu mascota y tu granja." icono={ICONO} />
      <Seg aria="Sección del hogar" opciones={SECCIONES} valor={sel} onCambio={hogarIr} />
      {sel === 'mascota' ? <Mascota d={d} base={base} /> : <Granja d={d} base={base} />}
    </>
  );
}
