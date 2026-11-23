import React, { useLayoutEffect, useRef, useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { hogarSeccion, hogarIr, publicar } from '../bridge/acciones.js';
import { Countdown, Titulo, Accion, BotonListo, Barra, Estado, Cifras, Kv } from './ui.jsx';
import { Emo } from './Icono.jsx';
import MascotaSprite from './MascotaSprite.jsx';
import Companero from './Companero.jsx';

const SECCIONES = [['mascota', 'Mascota'], ['invocacion', 'Legendarias'], ['companero', 'Compañero'], ['granja', 'Granja']];

const SUBTITULO = {
  mascota: 'Cuídala cada día para que siga dándote bonos.',
  invocacion: 'Invoca criaturas legendarias y sube su rango.',
  companero: 'Elige un personaje que crezca y pelee a tu lado.',
  granja: 'Siembra, riega y cosecha mientras no estás.'
};

const COLINAS = [
  ['#2a2f4a', 'M0 62 C60 36 110 56 170 44 C240 30 300 58 400 40 V100 H0Z'],
  ['#233a49', 'M0 74 C70 54 130 76 200 62 C270 48 330 76 400 60 V100 H0Z'],
  ['#1b3a3f', 'M0 88 C80 72 140 90 220 80 C290 70 350 90 400 78 V100 H0Z']
];

function Paisaje() {
  return (
    <svg className="hg-paisaje" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="hg-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#171225" />
          <stop offset="1" stopColor="#3d3a5e" />
        </linearGradient>
        <radialGradient id="hg-luna" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#f0d39a" stopOpacity=".55" />
          <stop offset="1" stopColor="#f0d39a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="100" fill="url(#hg-cielo)" />
      <circle cx="320" cy="30" r="34" fill="url(#hg-luna)" />
      <circle cx="320" cy="30" r="12" fill="#f0d39a" />
      {COLINAS.map(([c, p], i) => <path key={i} className="hg-colina" style={{ animationDelay: i * 120 + 'ms' }} d={p} fill={c} />)}
      <g fill="#122a2e">
        <path d="M60 84 L66 66 L72 84Z" />
        <path d="M70 86 L77 62 L84 86Z" />
        <path d="M248 80 L254 62 L260 80Z" />
        <path d="M336 82 L342 66 L348 82Z" />
      </g>
    </svg>
  );
}

function Adoptar({ d, casa }) {
  const [nombre, setNombre] = useState('');
  return (
    <>
      <Titulo>{casa ? 'Elige la mascota de casa' : 'Adopta una mascota'}</Titulo>
      <p className="mut peq">
        {casa
          ? 'Cuesta ' + fmt(d.precio) + ' monedas. Se queda en casa y no da bonos.'
          : 'Cuesta ' + fmt(d.precio) + ' monedas. Dan bonos si las cuidas: aliméntalas, acarícialas y juega con ellas.'}
      </p>
      <input
        className="txt" maxLength={16} placeholder="Nombre (opcional)" autoComplete="off" aria-label="Nombre de la mascota"
        value={nombre} onChange={e => setNombre(e.target.value)}
      />
      {d.tipos.map(t => (
        <div className="bloque vidrio" key={t.clave}>
          <div className="pet">
            <MascotaSprite tipo={t.clave} emoji={t.emoji} tam={56} />
            <div style={{ flex: 1 }}><strong>{t.nombre}</strong><p className="mut peq">{t.desc}</p></div>
          </div>
          <div className="btns uno">
            <Accion ruta={casa ? '/api/mascota/adoptar_casa' : '/api/mascota/adoptar'} cuerpo={{ tipo: t.clave }} campos={{ nombre }}>Adoptar</Accion>
          </div>
        </div>
      ))}
    </>
  );
}

function Casa({ d }) {
  const [abierto, setAbierto] = useState(false);
  const c = d.casa;
  const renombrar = e => {
    const boton = e.currentTarget;
    const n = window.prompt('Nuevo nombre (2 a 16 letras o números):', c.nombre);
    if (n && n.trim()) publicar(boton, '/api/mascota/renombrar_casa', { nombre: n.trim() });
  };
  if (!c) {
    if (!d.puedeAdoptarCasa) return null;
    return (
      <>
        <Titulo>Mascota en casa</Titulo>
        <p className="mut peq">Una segunda mascota que se queda en casa y no da bonos. Puedes cambiarla por la de aventuras cuando quieras.</p>
        {abierto
          ? <Adoptar d={d} casa />
          : <div className="btns uno"><button type="button" className="mini" onClick={() => setAbierto(true)}>Adoptar mascota de casa</button></div>}
      </>
    );
  }
  return (
    <>
      <Titulo>Mascota en casa</Titulo>
      <div className="bloque vidrio">
        <div className="pet">
          <MascotaSprite tipo={c.tipo.clave} animo={c.animo.clave} emoji={c.tipo.emoji} tam={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{c.nombre}</strong>
            {c.nombre === c.tipo.nombre ? '' : <> <span className="mut peq">({c.tipo.nombre})</span></>}
            <p className="peq">
              {c.animo.emoji} {c.animo.nombre}
              <span className="etiq nar">En casa · Sin bono</span>
            </p>
          </div>
        </div>
        <div className="stat">
          <div className="fila"><span>Nivel {c.nivel}/{c.max}</span><span>{c.xpSig ? c.xp + '/' + c.xpSig + ' XP' : 'Máximo'}</span></div>
          <Barra valor={c.xpSig ? c.xp : 1} max={c.xpSig || 1} />
        </div>
        <p className="mut peq" style={{ marginTop: 12 }}>Descansa sin hambre ni cansancio mientras está en casa.</p>
      </div>
      <div className="btns">
        <Accion ruta="/api/mascota/intercambiar" motivo={d.enExpedicion && 'No puedes cambiar de mascota durante una expedición.'}>
          {d.tiene ? 'Intercambiar' : 'Salir de aventuras'}
        </Accion>
        <button type="button" className="mini" onClick={renombrar}>Renombrar</button>
      </div>
    </>
  );
}

function Mascota({ d, base }) {
  if (!d.tiene) return <><Adoptar d={d} /><Casa d={d} /></>;
  const c = d.costos;
  const renombrar = e => {
    const boton = e.currentTarget;
    const n = window.prompt('Nuevo nombre (2 a 16 letras o números):', d.nombre);
    if (n && n.trim()) publicar(boton, '/api/mascota/renombrar', { nombre: n.trim() });
  };
  return (
    <>
      <div className="bloque vidrio hg-m">
        <div className="hg-escena">
          <MascotaSprite tipo={d.tipo.clave} animo={d.animo.clave} emoji={d.tipo.emoji} tam={96} />
        </div>
        <div className="hg-m-id">
          <h2>{d.nombre}</h2>
          {d.nombre === d.tipo.nombre ? null : <span className="mut peq">{d.tipo.nombre}</span>}
          <p className="peq">
            <span>{d.animo.emoji} {d.animo.nombre}</span>
            <span className={'etiq ' + (d.activa ? '' : 'nar')}>{d.activa ? 'Bono activo' : 'Sin bono'}</span>
          </p>
        </div>
        <div className="stat">
          <div className="fila"><span>Nivel {d.nivel} de {d.max}</span><span>{d.xpSig ? d.xp + '/' + d.xpSig + ' XP' : 'Máximo'}</span></div>
          <Barra valor={d.xpSig ? d.xp : 1} max={d.xpSig || 1} />
        </div>
        <div className="hg-medidores">
          <Estado nombre="Vida" v={d.vida} cls={d.vida < 30 ? 'nar' : ''} />
          <Estado nombre="Felicidad" v={d.fel} cls={d.fel < 25 ? 'nar' : ''} />
        </div>
        <p className={'hg-hambre' + (d.hambre ? ' ya' : '')}>
          {d.hambre ? 'Tiene hambre, aliméntala ya' : <>Le dará hambre en <Countdown fin={base + d.hambreS * 1000} /></>}
        </p>
        <p className="mut peq">{d.tipo.desc}{d.factor !== 1 ? ' · x' + d.factor + ' por su ánimo' : ''}</p>
      </div>
      <div className="btns hg-cuidados">
        <BotonListo ruta="/api/mascota/alimentar" txt={'Alimentar ' + fmt(c.comida)} fin={base + d.comidaS * 1000} />
        <BotonListo ruta="/api/mascota/acariciar" txt="Acariciar" fin={base + d.cariciaS * 1000} />
        <BotonListo ruta="/api/mascota/jugar" txt={'Jugar ' + fmt(c.juego)} fin={base + d.juegoS * 1000} />
        <BotonListo ruta="/api/mascota/curar" txt={'Curar ' + fmt(c.cura)} bloq={d.necesitaCura ? '' : 'Está sana'} />
      </div>
      <div className="btns uno"><button type="button" className="mini" onClick={renombrar}>Renombrar</button></div>
      <Casa d={d} />
    </>
  );
}

function Parcela({ c, base }) {
  return (
    <div className={'plot ' + (c.marchita ? 'mar' : c.lista ? 'ok' : '')}>
      <span className="em"><Emo o={c} /></span>
      {c.marchita ? 'Marchita' : c.lista ? 'Lista' : <Countdown fin={base + c.listoS * 1000} />}
    </div>
  );
}

function Semilla({ c, d }) {
  const motivo = !d.libres && 'No tienes parcelas libres.';
  return (
    <div className="bloque vidrio" style={{ padding: '12px 14px' }}>
      <div className="fila"><strong><Emo o={c} /> {c.nombre}</strong><span className="mut peq">{dur(c.duracionS)}</span></div>
      <p className="mut peq">Semilla {fmt(c.semilla)} → {fmt(c.valor)} monedas</p>
      <div className="btnrow">
        <Accion ruta="/api/granja/plantar" cuerpo={{ cultivo: c.clave, cantidad: 1 }} motivo={motivo}>Sembrar 1</Accion>
        <Accion ruta="/api/granja/plantar" cuerpo={{ cultivo: c.clave, cantidad: 'todo' }} motivo={motivo}>Sembrar todas</Accion>
      </div>
    </div>
  );
}

function Producto({ p, com }) {
  const total = p.cantidad + p.marchitos;
  const valor = Math.floor((p.cantidad * p.precio + p.marchitos * p.precioMarchito) * (1 - com / 100));
  return (
    <div className="bloque vidrio" style={{ padding: '12px 14px' }}>
      <div className="fila"><strong><Emo o={p} /> {p.nombre} x{total}</strong><span className="mut peq">{fmt(p.precio)} c/u</span></div>
      <p className="mut peq">
        {p.cantidad} fresco{p.cantidad === 1 ? '' : 's'}
        {p.marchitos ? ` · ${p.marchitos} marchito${p.marchitos === 1 ? '' : 's'} (${fmt(p.precioMarchito)} c/u)` : ''}
        {' · '}todo vale ~{fmt(valor)}{com ? ` tras ${com}% de comisión` : ''}
      </p>
      <div className="btnrow">
        <Accion ruta="/api/granja/vender" cuerpo={{ cultivo: p.clave, cantidad: 1 }}>Vender 1</Accion>
        <Accion ruta="/api/granja/vender" cuerpo={{ cultivo: p.clave, cantidad: 'todo' }} confirmar={`¿Vender ${total} ${p.nombre.toLowerCase()} por ${fmt(valor)}?`}>Vender todo</Accion>
      </div>
    </div>
  );
}

function Almacen({ a, cartera, com }) {
  const maximo = a.mejoraCosto === null;
  return (
    <>
      <Titulo extra={<span className="mut peq">Nv {a.nivel}/{a.nivelMax}</span>}>Almacén</Titulo>
      <div className="bloque vidrio">
        <div className="fila"><strong>📦 {a.ocupadas}/{a.capacidad}</strong><span className="mut peq">{a.libres} libres</span></div>
        <Barra valor={a.ocupadas} max={a.capacidad} />
        <p className="mut peq" style={{ marginTop: 10 }}>
          {a.libres ? 'Lo que cosechas se guarda aquí hasta que lo vendas.' : 'Está lleno: vende cosechas o mejora el almacén para seguir cosechando.'}
        </p>
        <div className="btns uno">
          {maximo
            ? <Accion motivo="Tu almacén ya está al máximo.">Almacén al máximo</Accion>
            : <Accion ruta="/api/granja/mejorar_almacen" motivo={cartera < a.mejoraCosto && 'Te faltan monedas.'} confirmar={`¿Mejorar el almacén a ${a.siguienteCapacidad} de capacidad por ${fmt(a.mejoraCosto)}?`}>Mejorar a {a.siguienteCapacidad} · {fmt(a.mejoraCosto)}</Accion>}
        </div>
      </div>
      {a.productos.length
        ? a.productos.map(p => <Producto key={p.clave} p={p} com={com} />)
        : <p className="mut peq">El almacén está vacío.</p>}
    </>
  );
}

function Ventajas({ d }) {
  const m = d.mercader;
  if (!m) return null;
  return (
    <div className="bloque vidrio">
      <div className="fila"><strong>💰 Ventajas de Mercader</strong></div>
      <Kv k="Comisión de venta" v={(d.comisionPct || 0) + '%'} />
      <Kv k="Precio de venta" v={'+' + m.precioPct + '%'} />
      <Kv k="Capacidad del almacén" v={'+' + m.almacenPct + '%'} />
      <Kv k="Las cosechas se marchitan tras" v={Math.round(d.marchitaH * 10) / 10 + ' h'} />
    </div>
  );
}

function Contrato({ x }) {
  const falta = x.cantidad - x.tengo;
  const motivo = x.hecho ? 'Ya entregaste este contrato.' : falta > 0 ? `Te faltan ${falta} frescos de ${x.nombre.toLowerCase()}.` : undefined;
  return (
    <div className="bloque vidrio" style={{ padding: '12px 14px' }}>
      <div className="fila">
        <strong>{x.urgente ? '🔥 ' : ''}<Emo o={x} /> {x.nombre} x{x.cantidad}</strong>
        <span className="mut peq">{x.hecho ? '✅ Entregado' : fmt(x.pago) + ' monedas'}</span>
      </div>
      <p className="mut peq">Tienes {x.tengo} frescos{x.urgente ? ' · Urgente: más pago y +2 de reputación' : ''}</p>
      <div className="btns uno">
        <Accion ruta="/api/granja/contrato" cuerpo={{ n: x.n }} motivo={motivo}>{x.hecho ? 'Entregado' : 'Entregar'}</Accion>
      </div>
    </div>
  );
}

function Contratos({ d, base }) {
  const c = d.contratos;
  if (!c) return <p className="mut peq" style={{ marginTop: 12 }}>Los contratos de la granja son exclusivos de la clase Mercader.</p>;
  return (
    <>
      <Titulo extra={<span className="mut peq">Se renuevan en <Countdown fin={base + c.renuevaS * 1000} /></span>}>Contratos de Mercader</Titulo>
      <div className="bloque vidrio">
        <div className="fila"><strong>{c.rango.emoji} {c.rango.nombre}</strong><span className="etiq">+{c.bonoPct}% de pago</span></div>
        <p className="mut peq">
          Reputación {fmt(c.reputacion)}
          {c.siguiente ? ` · Siguiente rango: ${c.siguiente.emoji} ${c.siguiente.nombre} con ${fmt(c.siguiente.requiere)}` : ' · Rango máximo'}
        </p>
        <p className="mut peq">Se pagan sin comisión con cultivos frescos del almacén. Los marchitos no cuentan.</p>
      </div>
      {c.lista.map(x => <Contrato key={x.n} x={x} />)}
    </>
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
        <p className="mut peq" style={{ marginTop: 10 }}>Lo que dejes más de {Math.round(d.marchitaH * 10) / 10} h tras madurar se marchita y paga la mitad.</p>
        <div className="btns">
          <Accion ruta="/api/granja/cosechar" motivo={!d.listas ? 'Aún no hay nada listo.' : d.almacen && !d.almacen.libres && 'El almacén está lleno.'}>{d.listas ? 'Cosechar (' + d.listas + ')' : 'Cosechar'}</Accion>
          {d.costoParcela !== null
            ? <Accion ruta="/api/granja/parcela">Parcela {fmt(d.costoParcela)}</Accion>
            : <Accion motivo="Ya tienes todas las parcelas extra.">Parcelas al máximo</Accion>}
        </div>
      </div>
      <Ventajas d={d} />
      <Contratos d={d} base={base} />
      {d.almacen && <Almacen a={d.almacen} cartera={d.cartera} com={d.comisionPct || 0} />}
      <Titulo>Semillas</Titulo>
      {d.catalogo.map(c => <Semilla key={c.clave} c={c} d={d} />)}
    </>
  );
}

function Legendarias({ d }) {
  const lista = [...d.criaturas].sort((a, b) => (b.activa - a.activa) || ((b.rango > 0) - (a.rango > 0)));
  const aviso = '¿Gastar ' + fmt(d.costo.monedas) + ' monedas y ' + d.costo.mats.map(m => m.necesita + ' ' + m.nombre).join(', ') + ' para invocar?';
  return (
    <>
      <Titulo>Invocación legendaria</Titulo>
      <div className="bloque vidrio">
        <Cifras lista={[['Invocaciones', d.cargas], ['Éxito', d.prob + '%'], ['Fallos', d.fallos]]} />
        <p className="mut peq" style={{ margin: '10px 0' }}>
          Ganas una invocación cada {d.cada} niveles. Cada fallo suma +{d.pityPorFallo}% de éxito, hasta +{d.pityMax}%.
        </p>
        <Kv k="Monedas" v={fmt(d.costo.monedas) + ' (tienes ' + fmt(d.cartera) + ')'} />
        {d.costo.mats.map(m => <Kv key={m.k} k={<><Emo o={m} /> {m.nombre}</>} v={m.tiene + '/' + m.necesita} />)}
      </div>
      <div className="btns uno">
        <Accion ruta="/api/invocacion/invocar" motivo={d.bloqueo || undefined} confirmar={aviso}>✨ Invocar</Accion>
      </div>
      <Titulo>Tus legendarias</Titulo>
      {lista.map(c => (
        <div className="bloque vidrio" key={c.clave}>
          <div className="pet">
            <MascotaSprite dir="legendarias" tipo={c.clave} emoji={c.emoji} animo={c.activa ? 'feliz' : c.rango > 0 ? 'normal' : 'quieta'} bloq={c.rango === 0} tam={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{c.nombre}</strong>{c.activa ? <> <span className="etiq">Activa</span></> : null}
              <p className="peq">
                {c.rango > 0
                  ? '★'.repeat(c.rango) + '☆'.repeat(d.rangoMax - c.rango) + ' · Rango ' + c.rango + '/' + d.rangoMax
                  : 'Sin invocar · ' + c.prob + '% al tener éxito'}
              </p>
              <p className="mut peq">{c.rango > 0 ? c.bonos : 'Al obtenerla: ' + c.bonos}</p>
              {c.siguiente ? <p className="mut peq">Siguiente rango: {c.siguiente}</p> : null}
            </div>
          </div>
          {c.rango > 0 && !c.activa
            ? <div className="btns uno"><Accion ruta="/api/invocacion/activar" cuerpo={{ clave: c.clave }}>Activar</Accion></div>
            : null}
        </div>
      ))}
    </>
  );
}

export default function Hogar({ d, base }) {
  const sel = SECCIONES.some(o => o[0] === hogarSeccion()) ? hogarSeccion() : 'mascota';
  const fila = useRef(null);
  useLayoutEffect(() => {
    const el = fila.current;
    const a = el && el.querySelector('[aria-pressed="true"]');
    if (a) el.scrollLeft = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2;
  }, [sel]);
  return (
    <div className="hg">
      <header className="hg-top">
        <Paisaje />
        <div className="hg-tit">
          <h1 className="pag">Mundo</h1>
          <p>{SUBTITULO[sel]}</p>
        </div>
      </header>
      <div className="hg-tabs" ref={fila} role="group" aria-label="Sección del hogar">
        {SECCIONES.map(([k, n]) => (
          <button key={k} type="button" aria-pressed={k === sel} onClick={() => hogarIr(k)}>{n}</button>
        ))}
      </div>
      <div className="hg-cuerpo" key={sel}>
        {sel === 'mascota' ? <Mascota d={d} base={base} /> : sel === 'invocacion' ? <Legendarias d={d} /> : sel === 'companero' ? <Companero d={d} /> : <Granja d={d} base={base} />}
      </div>
    </div>
  );
}
