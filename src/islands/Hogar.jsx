import React, { useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { hogarSeccion, hogarIr, publicar } from '../bridge/acciones.js';
import { Cab, Seg, Countdown, Titulo, Accion, BotonListo, Barra, Estado, Cifras, Kv } from './ui.jsx';
import MascotaSprite from './MascotaSprite.jsx';

const SECCIONES = [['mascota', 'Mascota'], ['invocacion', 'Legendarias'], ['granja', 'Granja']];

const ICONO = (
  <>
    <path d="M12 21 C12 14 8 11 4 11 C4 16 7 20 12 21 Z" />
    <path d="M12 21 C12 14 16 9 20 9 C20 15 17 20 12 21 Z" />
  </>
);

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
      <Titulo>Tu mascota</Titulo>
      <div className="bloque vidrio">
        <div className="pet">
          <MascotaSprite tipo={d.tipo.clave} animo={d.animo.clave} emoji={d.tipo.emoji} tam={88} />
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
      <Casa d={d} />
    </>
  );
}

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

function Producto({ p }) {
  const total = p.cantidad + p.marchitos;
  const valor = p.cantidad * p.precio + p.marchitos * p.precioMarchito;
  return (
    <div className="bloque vidrio" style={{ padding: '12px 14px' }}>
      <div className="fila"><strong>{p.emoji} {p.nombre} x{total}</strong><span className="mut peq">{fmt(p.precio)} c/u</span></div>
      <p className="mut peq">
        {p.cantidad} fresco{p.cantidad === 1 ? '' : 's'}
        {p.marchitos ? ` · ${p.marchitos} marchito${p.marchitos === 1 ? '' : 's'} (${fmt(p.precioMarchito)} c/u)` : ''}
        {' · '}todo vale {fmt(valor)}
      </p>
      <div className="btnrow">
        <Accion ruta="/api/granja/vender" cuerpo={{ cultivo: p.clave, cantidad: 1 }}>Vender 1</Accion>
        <Accion ruta="/api/granja/vender" cuerpo={{ cultivo: p.clave, cantidad: 'todo' }} confirmar={`¿Vender ${total} ${p.nombre.toLowerCase()} por ${fmt(valor)}?`}>Vender todo</Accion>
      </div>
    </div>
  );
}

function Almacen({ a, cartera }) {
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
        ? a.productos.map(p => <Producto key={p.clave} p={p} />)
        : <p className="mut peq">El almacén está vacío.</p>}
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
        <p className="mut peq" style={{ marginTop: 10 }}>Lo que dejes más de {d.marchitaH} h tras madurar se marchita y paga la mitad.</p>
        <div className="btns">
          <Accion ruta="/api/granja/cosechar" motivo={!d.listas ? 'Aún no hay nada listo.' : d.almacen && !d.almacen.libres && 'El almacén está lleno.'}>{d.listas ? 'Cosechar (' + d.listas + ')' : 'Cosechar'}</Accion>
          {d.costoParcela !== null
            ? <Accion ruta="/api/granja/parcela">Parcela {fmt(d.costoParcela)}</Accion>
            : <Accion motivo="Ya tienes todas las parcelas extra.">Parcelas al máximo</Accion>}
        </div>
      </div>
      {d.almacen && <Almacen a={d.almacen} cartera={d.cartera} />}
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
        {d.costo.mats.map(m => <Kv key={m.k} k={m.emoji + ' ' + m.nombre} v={m.tiene + '/' + m.necesita} />)}
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
  const sel = hogarSeccion();
  return (
    <>
      <Cab titulo="Mundo" sub="Tu mascota, tus legendarias y tu granja." icono={ICONO} />
      <Seg aria="Sección del hogar" opciones={SECCIONES} valor={sel} onCambio={hogarIr} />
      {sel === 'mascota' ? <Mascota d={d} base={base} /> : sel === 'invocacion' ? <Legendarias d={d} /> : <Granja d={d} base={base} />}
    </>
  );
}
