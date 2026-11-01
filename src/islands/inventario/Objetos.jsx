import React, { useMemo, useState } from 'react';
import { Vacio, Accion, Countdown, Titulo } from '../ui.jsx';
import { cambiarInventario } from '../../bridge/acciones.js';
import { fmt } from '../../lib/format.js';
import { EfectosActivos, COLOR_OBJETO } from '../Elixires.jsx';

const FILTROS = [
  ['todo', 'Todo'], ['herramientas', 'Herramientas'], ['consumibles', 'Consumibles'],
  ['elixires', 'Elixires'], ['materiales', 'Materiales'], ['reliquias', 'Reliquias']
];
const COLOR_COFRE = { madera: '#a9b0c4', plata: '#8fb4d6', oro: '#e0b96a' };
const NEUTRO = '#c3bbdc';

function Filtro({ valor, onCambio, cantidades }) {
  const visibles = FILTROS.filter(([k]) => k === 'todo' || k === 'elixires' || cantidades[k] > 0);
  return (
    <div className="filtros" role="group" aria-label="Filtrar objetos">
      {visibles.map(([k, nombre]) => (
        <button key={k} type="button" className="fch" aria-pressed={valor === k} onClick={() => onCambio(k)}>
          {nombre}{k !== 'todo' && <i>{cantidades[k]}</i>}
        </button>
      ))}
    </div>
  );
}

function Celda({ it, sel, onSel }) {
  return (
    <button type="button" className={`it ${sel ? 'sel' : ''} ${it.apagado ? 'no' : ''}`} onClick={() => onSel(it.id)} aria-pressed={sel} aria-label={it.nombre}>
      <span className="slot" style={{ '--r': it.color }} aria-hidden="true">
        <span className="si">{it.emoji || '📦'}</span>
        {it.cantidad !== undefined && <i className="n">{it.cantidad}</i>}
      </span>
      <span className="it-n">{it.nombre}</span>
    </button>
  );
}

function Ficha({ it, children }) {
  return (
    <div className="bloque vidrio detalle" style={{ '--r': it.color }}>
      <div className="det-cab">
        <span className="slot" style={{ '--r': it.color }} aria-hidden="true">
          <span className="si">{it.emoji || '📦'}</span>
        </span>
        <div className="det-info">
          <div className="fila">
            <strong style={{ color: it.color }}>{it.nombre}</strong>
            {it.cantidad !== undefined && <span className="etiq">x{it.cantidad}</span>}
          </div>
          <p className="mut peq">{it.sub}</p>
        </div>
      </div>
      {it.desc && <p className="peq det-desc">{it.desc}</p>}
      {children}
    </div>
  );
}

function VerHerramienta({ h }) {
  const m = h.mejora;
  const pct = Math.min(100, h.usos / Math.max(1, h.usosMax) * 100);
  return (
    <>
      {h.usos > 0 ? (
        <>
          <div className="barra nar"><div style={{ width: `${pct}%` }} /></div>
          <div className="fila peq">
            <span>{h.usos} uso{h.usos === 1 ? '' : 's'} restante{h.usos === 1 ? '' : 's'}</span>
            <span className="mut">{h.repuestos ? `${h.repuestos} de repuesto` : 'Sin repuestos'}</span>
          </div>
        </>
      ) : h.repuestos > 0 ? (
        <p className="peq" style={{ marginTop: 8 }}>Se estrenará una nueva en tu próximo uso ({h.repuestos} en reserva · {h.usosMax} usos).</p>
      ) : (
        <p className="mut peq" style={{ marginTop: 8 }}>Sin herramienta. Compra una en /shop o fabrícala con /craft.</p>
      )}
      {m ? (
        <>
          <p className="costo mut peq">
            Nv {m.siguiente.nivel}: x{m.siguiente.mult} · {m.siguiente.usosMax} usos<br />
            Costo: {fmt(m.monedas)} monedas · {m.mats.map(x => `${x.emoji} ${x.tengo}/${x.necesita}`).join(' ')}
          </p>
          <div className="btns uno">
            <Accion ruta="/api/herramientas/mejorar" cuerpo={{ clave: h.clave }} motivo={!m.puede ? 'Te faltan monedas o materiales.' : null}>Mejorar</Accion>
          </div>
        </>
      ) : <p className="mut peq" style={{ marginTop: 10 }}>Nivel máximo alcanzado.</p>}
    </>
  );
}

function VerCofre({ c, max }) {
  const n = Math.min(c.cantidad, max);
  return (
    <div className="btnrow">
      <Accion ruta="/api/cofres/abrir" cuerpo={{ tipo: c.clave, n: 1 }} motivo={c.cantidad < 1 ? 'No tienes cofres de este tipo.' : null}>Abrir</Accion>
      <Accion ruta="/api/cofres/abrir" cuerpo={{ tipo: c.clave, n }} motivo={c.cantidad < 2 ? 'Necesitas al menos 2 para abrir varios.' : null}>Abrir varios (x{n})</Accion>
    </div>
  );
}

function VerElixir({ o }) {
  return (
    <div className="btns uno">
      {o.uso.pasivo
        ? <button type="button" className="mini" onClick={() => cambiarInventario('equipo')}>Ir a Equipo</button>
        : <Accion ruta="/api/objetos/usar" cuerpo={{ clave: o.clave }} motivo={o.uso.motivo}>Usar</Accion>}
    </div>
  );
}

function VerMaterial({ valor }) {
  return (
    <>
      <p className="mut peq" style={{ marginTop: 8 }}>Valor aproximado de todos tus materiales: {fmt(valor)} monedas.</p>
      <div className="btns uno">
        <button type="button" className="mini" onClick={() => cambiarInventario('forja')}>Vender en la Forja</button>
      </div>
    </>
  );
}

export default function Objetos({ d, base }) {
  const [filtro, setFiltro] = useState('todo');
  const [seleccion, setSeleccion] = useState(null);

  const piezas = useMemo(() => {
    const cofres = d.cofres || [];
    const herramientas = d.herramientas || [];
    const consumibles = d.consumibles || [];
    const elixires = (d.objetos || []).filter(o => o.cantidad > 0);
    const materiales = d.materiales || [];
    const reliquias = d.reliquias || [];
    const tengoRel = reliquias.filter(r => r.tiene).length;
    const maxCofres = d.cofresMax || 1;
    return [
      ...cofres.map(c => ({
        id: `cofres:${c.clave}`, grupo: 'cofres', emoji: c.emoji, nombre: c.nombre, cantidad: c.cantidad,
        color: COLOR_COFRE[c.clave] || NEUTRO,
        sub: `${fmt(c.monedas[0])}–${fmt(c.monedas[1])} monedas, materiales y más`,
        desc: `Puedes abrir hasta ${maxCofres} a la vez.`,
        ver: () => <VerCofre c={c} max={maxCofres} />
      })),
      ...herramientas.map(h => ({
        id: `herramientas:${h.clave}`, grupo: 'herramientas', emoji: h.emoji, nombre: h.nombre, cantidad: undefined,
        color: NEUTRO, apagado: !h.activa,
        sub: `Nv ${h.nivel}/${h.nivelMax} · x${h.mult} · se usa en ${h.usoEn}`,
        ver: () => <VerHerramienta h={h} />
      })),
      ...consumibles.map(c => ({
        id: `consumibles:${c.clave || c.nombre}`, grupo: 'consumibles', emoji: c.emoji, nombre: c.nombre, cantidad: c.cantidad,
        color: '#8fb4d6', sub: `Consumible · máximo ${d.tope || 0} de cada uno`, desc: c.desc,
        ver: () => c.activoS > 0
          ? <p className="peq" style={{ marginTop: 10 }}>Activo <Countdown fin={base + c.activoS * 1000} /></p>
          : null
      })),
      ...elixires.map(o => ({
        id: `elixires:${o.clave}`, grupo: 'elixires', emoji: o.emoji, nombre: o.nombre, cantidad: o.cantidad,
        color: COLOR_OBJETO[o.clave] || NEUTRO,
        sub: `${o.efecto}${o.duracionS ? ` · ${o.duracionS / 3600} h` : ''}${o.activoS > 0 ? ' · ✓ Activo' : ''}`,
        desc: o.desc,
        ver: () => <VerElixir o={o} />
      })),
      ...materiales.map(m => ({
        id: `materiales:${m.clave}`, grupo: 'materiales', emoji: m.emoji, nombre: m.nombre, cantidad: fmt(m.cantidad),
        color: NEUTRO, sub: 'Material', desc: 'Sirve para fabricar y mejorar. También puedes venderlo en la Forja.',
        ver: () => <VerMaterial valor={d.valorMateriales || 0} />
      })),
      ...reliquias.map(r => ({
        id: `reliquias:${r.clave || r.nombre}`, grupo: 'reliquias', emoji: r.emoji, nombre: r.nombre, cantidad: undefined,
        color: '#e0b96a', apagado: !r.tiene,
        sub: r.tiene ? 'Reliquia · en tu colección' : 'Reliquia · aún no la tienes',
        desc: `Colección: ${tengoRel}/${reliquias.length}. Bono de ingresos por reliquias: +${d.bonoReliquias || 0}%. Solo salen de los cofres.`,
        ver: () => null
      }))
    ];
  }, [d, base]);

  const cantidades = useMemo(() => {
    const r = {};
    piezas.forEach(p => { r[p.grupo] = (r[p.grupo] || 0) + 1; });
    return r;
  }, [piezas]);

  const elegir = id => setSeleccion(x => (x === id ? null : id));
  const items = piezas.filter(p => p.grupo !== 'cofres');
  const cofres = piezas.filter(p => p.grupo === 'cofres');
  const visibles = filtro === 'todo' ? items : items.filter(p => p.grupo === filtro);
  const activoItem = visibles.find(p => p.id === seleccion) || null;
  const activoCofre = cofres.find(p => p.id === seleccion) || null;

  return (
    <>
      <EfectosActivos lista={d.efectos} base={base} />
      <Filtro valor={filtro} onCambio={setFiltro} cantidades={cantidades} />
      {visibles.length ? (
        <div className="bolsa-g rej">
          {visibles.map(p => <Celda key={p.id} it={p} sel={seleccion === p.id} onSel={elegir} />)}
        </div>
      ) : <Vacio>{filtro === 'elixires' ? 'Aún no tienes elixires ni pociones. Fabrícalos en la Forja.' : 'No tienes objetos todavía. Juega y explora para conseguirlos.'}</Vacio>}
      {activoItem && <Ficha it={activoItem}>{activoItem.ver()}</Ficha>}
      {cofres.length > 0 && (
        <>
          <Titulo extra={<span className="ex">hasta {d.cofresMax || 1} a la vez</span>}>Cofres</Titulo>
          <div className="bolsa-g rej">
            {cofres.map(p => <Celda key={p.id} it={p} sel={seleccion === p.id} onSel={elegir} />)}
          </div>
          {activoCofre && <Ficha it={activoCofre}>{activoCofre.ver()}</Ficha>}
        </>
      )}
    </>
  );
}
