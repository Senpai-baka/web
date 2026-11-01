import React, { useMemo, useState } from 'react';
import { Cab, Seg, Sec, Vacio, Accion, Cifras, Countdown } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { inventarioSeccion, cambiarInventario, aviso } from '../bridge/acciones.js';
import { fmt } from '../lib/format.js';
import { Elixires, ElixiresForja, EfectosActivos } from './Elixires.jsx';

const OPCIONES = [['objetos', 'Objetos'], ['equipo', 'Equipo'], ['forja', 'Forja']];
const FILTROS = [
  ['todo', 'Todo'], ['cofres', 'Cofres'], ['herramientas', 'Herramientas'], ['consumibles', 'Consumibles'],
  ['elixires', 'Elixires'], ['materiales', 'Materiales'], ['reliquias', 'Reliquias'],
];
const rarezaCofre = { madera: '#a9b0c4', plata: '#8fb4d6', oro: '#e0b96a' };

function ItemIcon({ emoji, cantidad, color }) {
  return <span className="slot" style={{ background: color ? `${color}22` : undefined, "--r": color }} aria-hidden="true">
    <span>{emoji || '📦'}</span>{cantidad !== undefined && <i className="n">{cantidad}</i>}
  </span>;
}
function Filtro({ valor, onCambio, cantidades }) {
  return <div className="filtros" role="group" aria-label="Filtrar objetos">
    {FILTROS.filter(([key]) => key === 'todo' || key === 'elixires' || cantidades[key] > 0).map(([key, label]) =>
      <button key={key} type="button" className="fch" aria-pressed={valor === key} onClick={() => onCambio(key)}>
        {label}{key !== 'todo' && <i>{cantidades[key]}</i>}
      </button>)}
  </div>;
}
function Herramientas({ lista }) {
  if (!lista.length) return <Vacio>No tienes herramientas todavía.</Vacio>;
  return <div className="lista">{lista.map(h => {
    const m = h.mejora;
    return <div key={h.clave} className={`herr bloque vidrio ${h.activa ? '' : 'off'}`}>
      <div className="cab"><ItemIcon emoji={h.emoji} color="#c3bbdc"/><div style={{ flex: 1, minWidth: 0 }}>
        <strong>{h.nombre}</strong> <span className="mut peq">Nv {h.nivel}/{h.nivelMax} · x{h.mult}</span><br/>
        <span className="mut peq">Se usa en {h.usoEn}</span>
      </div></div>
      {h.usos > 0 ? <><div className="barra nar"><div style={{ width: `${Math.min(100, h.usos / Math.max(1, h.usosMax) * 100)}%` }}/></div>
        <div className="fila peq"><span>{h.usos} uso{h.usos === 1 ? '' : 's'} restante{h.usos === 1 ? '' : 's'}</span><span className="mut">{h.repuestos ? `${h.repuestos} de repuesto` : 'Sin repuestos'}</span></div></>
        : h.repuestos > 0 ? <p className="peq" style={{ marginTop: 8 }}>Se estrenará una nueva en tu próximo uso ({h.repuestos} en reserva · {h.usosMax} usos).</p>
        : <p className="mut peq" style={{ marginTop: 8 }}>Sin herramienta. Compra una en /shop o fabrícala con /craft.</p>}
      {m ? <><p className="costo mut">Nv {m.siguiente.nivel}: x{m.siguiente.mult} · {m.siguiente.usosMax} usos<br/>Costo: {fmt(m.monedas)} monedas · {m.mats.map(x => `${x.emoji} ${x.tengo}/${x.necesita}`).join(' ')}</p>
        <div className="btns uno"><Accion ruta="/api/herramientas/mejorar" cuerpo={{ clave: h.clave }} motivo={!m.puede ? 'Te faltan monedas o materiales.' : null}>Mejorar</Accion></div></>
        : <p className="mut peq" style={{ marginTop: 10 }}>Nivel máximo alcanzado.</p>}
    </div>;
  })}</div>;
}
function Cofres({ lista, max }) {
  if (!lista.length) return <Vacio>No tienes cofres. Puedes conseguirlos jugando y explorando.</Vacio>;
  return <div className="bloque vidrio">{lista.map(c => {
    const n = Math.min(c.cantidad, max);
    return <div key={c.clave} style={{ padding: '8px 0' }}>
      <div className="fil"><ItemIcon emoji={c.emoji} cantidad={c.cantidad} color={rarezaCofre[c.clave] || '#a9b0c4'}/>
        <div className="nom"><strong>{c.nombre}</strong><span className="mut peq">{fmt(c.monedas[0])}–{fmt(c.monedas[1])} monedas, materiales y más</span></div>
      </div>
      <div className="btnrow"><Accion ruta="/api/cofres/abrir" cuerpo={{ tipo: c.clave, n: 1 }} motivo={c.cantidad < 1 ? 'No tienes cofres de este tipo.' : null}>Abrir</Accion>
        <Accion ruta="/api/cofres/abrir" cuerpo={{ tipo: c.clave, n }} motivo={c.cantidad < 2 ? 'Necesitas al menos 2 para abrir varios.' : null}>Abrir varios (x{n})</Accion></div>
    </div>;
  })}</div>;
}
function Consumibles({ lista, tope, base }) {
  if (!lista.length) return <Vacio>No tienes consumibles.</Vacio>;
  return <div className="lista">{lista.map(c => <div className="fil" key={c.clave || c.nombre}>
    <ItemIcon emoji={c.emoji} cantidad={c.cantidad} color="#8fb4d6"/>
    <div className="nom"><strong>{c.nombre}</strong><span className="mut peq">{c.desc}</span></div>
    {c.activoS > 0 && <span className="val"><span className="etiq" style={{ margin: 0 }}>Activo <Countdown fin={base + c.activoS * 1000} /></span></span>}
  </div>)}<p className="mut peq">Máximo {tope} de cada consumible.</p></div>;
}
function Materiales({ lista, valor }) {
  if (!lista.length) return <Vacio>Aún no tienes materiales. Mina, tala o pesca para conseguirlos.</Vacio>;
  return <><div className="mats">{lista.map(m => <div className="mat" key={m.clave}><ItemIcon emoji={m.emoji} cantidad={fmt(m.cantidad)}/><span className="peq">{m.nombre}</span></div>)}</div>
    <p className="mut peq" style={{ marginTop: 10 }}>Valor aproximado de venta: {fmt(valor)} monedas.</p></>;
}
function Reliquias({ lista, bono }) {
  const tengo = lista.filter(r => r.tiene).length;
  return <><div className="rel">{lista.map(r => <span key={r.clave || r.nombre} className={r.tiene ? '' : 'no'}>{r.emoji} {r.nombre}</span>)}</div>
    <p className="mut peq" style={{ marginTop: 8 }}>Colección: {tengo}/{lista.length}. Bono de ingresos por reliquias: +{bono}%. Solo salen de los cofres.</p></>;
}
function ObjetosReact({ d, base }) {
  const [filtro, setFiltro] = useState('todo');
  // Orden: lo que abres o usas (cofres, herramientas, consumibles, elixires), luego recursos y colección.
  const partes = useMemo(() => [
    ['cofres', 'Cofres', d.cofres || [], (items) => <Cofres lista={items} max={d.cofresMax || 1}/>],
    ['herramientas', 'Herramientas', d.herramientas || [], (items) => <Herramientas lista={items}/>],
    ['consumibles', 'Consumibles', d.consumibles || [], (items) => <Consumibles lista={items} tope={d.tope || 0} base={base}/>],
    ['elixires', 'Elixires y pociones', d.objetos || [], (items) => <Elixires lista={items} tope={d.topeObjetos || 10}/>],
    ['materiales', 'Materiales', d.materiales || [], (items) => <Materiales lista={items} valor={d.valorMateriales || 0}/>],
    ['reliquias', 'Reliquias', d.reliquias || [], (items) => <Reliquias lista={items} bono={d.bonoReliquias || 0}/>],
  ], [d, base]);
  const cantidades = Object.fromEntries(partes.map(([key, , items]) => [key, key === 'elixires' ? items.filter(o => o.cantidad > 0).length : items.length]));
  const visible = partes.filter(([key]) => filtro === 'todo' || filtro === key);
  return <><EfectosActivos lista={d.efectos} base={base}/><Filtro valor={filtro} onCambio={setFiltro} cantidades={cantidades}/>
    {visible.map(([key, titulo, items, render]) => <Sec key={key + (filtro === key ? '!' : '')} k={key} abierta={filtro === key ? true : undefined} titulo={titulo} extra={key === 'cofres' ? `hasta ${d.cofresMax} a la vez` : key === 'consumibles' ? `máx. ${d.tope} de cada uno` : key === 'elixires' ? `${cantidades.elixires} de ${items.length}` : key === 'reliquias' ? `${items.filter(x => x.tiene).length}/${items.length}` : ''}>
      {render(items)}
    </Sec>)}
  </>;
}


const TIPOS_EQUIPO = { arma: ['Arma', '🗡️'], armadura: ['Armadura', '🛡️'], amuleto: ['Amuleto', '📿'] };
const RAREZAS_EQUIPO = {
  comun: ['Común', '#a9b0c4'], poco: ['Poco común', '#8fc4ad'], rara: ['Rara', '#8fb4d6'],
  epica: ['Épica', '#b69be0'], legendaria: ['Legendaria', '#e0b96a']
};
function EquipoReact({ d }) {
  const items = Array.isArray(d.items) ? d.items : [];
  const [filtro, setFiltro] = useState('todo');
  const [seleccion, setSeleccion] = useState(null);
  const [rarezaLote, setRarezaLote] = useState(d.rarezas?.[0]?.clave || 'comun');
  const [rarezaDesm, setRarezaDesm] = useState(d.rarezas?.[0]?.clave || 'comun');
  const activo = items.find(i => String(i.id) === String(seleccion)) || items.find(i => i.equipado) || items[0] || null;
  const filtros = [['todo', 'Todo', items.length], ...Object.entries(TIPOS_EQUIPO).map(([k, [n]]) => [k, n, items.filter(i => i.tipo === k).length])];
  const vistos = filtro === 'todo' ? items : items.filter(i => i.tipo === filtro);
  const color = it => (RAREZAS_EQUIPO[it.rareza] || RAREZAS_EQUIPO.comun)[1];
  const huecos = Object.entries(TIPOS_EQUIPO).map(([tipo, [nombre, emoji]]) => {
    const it = items.find(i => i.equipado && i.tipo === tipo);
    return <div className="hueco" key={tipo}>
      {it ? <button type="button" className={`slot celda ${String(it.id) === String(activo?.id) ? 'sel' : ''}`} style={{ '--r': color(it) }} onClick={() => setSeleccion(it.id)} aria-label={it.etiqueta} aria-pressed={String(it.id) === String(activo?.id)}><span className="si">{it.emoji || emoji}</span>{it.plus > 0 && <b className="mas">+{it.plus}</b>}<i className="eq">E</i></button> : <div className="slot vacio"><span className="si">{emoji}</span></div>}
      <span>{nombre}</span>
    </div>;
  });
  const m = activo?.mejora;
  const actual = activo && !activo.equipado ? items.find(i => i.equipado && i.tipo === activo.tipo) : null;
  const stat = (label, a, b, fa = a, fb = b) => <div className={`cmp-f ${Number(a) > Number(b) ? 'sube' : Number(a) < Number(b) ? 'baja' : ''}`} key={label}><span>{label}</span><b>{fa}</b><i aria-hidden="true">{Number(a) > Number(b) ? '▲' : Number(a) < Number(b) ? '▼' : '='}</i><span className="mut">{fb}</span></div>;
  const b = d.bonos || {};
  return <>
    <Cifras lista={[["Daño", `+${b.dano || 0}%`], ["Vida", `+${b.vida || 0}%`], ["Ingresos", `+${b.ingresos || 0}%`], ["Suerte", `+${b.suerte || 0}`]]}/>
    <Sec k="equipo-react" titulo="Tu equipo" extra={`Bolsa ${d.bolsa?.usados ?? items.length}/${d.bolsa?.max ?? '—'}`}>
      <div className="muneco vidrio">{huecos}</div>
      <div className="filtros" role="group" aria-label="Filtrar equipo">
        {filtros.map(([key, label, count]) => <button key={key} type="button" className="fch" aria-pressed={filtro === key} onClick={() => setFiltro(key)}>{label}<i>{count}</i></button>)}
      </div>
      {items.length ? <div className="bolsa-g">{vistos.map(it => <button key={it.id} type="button" className={`slot celda ${String(it.id) === String(activo?.id) ? 'sel' : ''} ${it.rareza === 'legendaria' ? 'leg' : ''}`} style={{ '--r': color(it) }} aria-label={it.etiqueta} aria-pressed={String(it.id) === String(activo?.id)} onClick={() => setSeleccion(it.id)}><span className="si">{it.emoji || '🎒'}</span>{it.plus > 0 && <b className="mas">+{it.plus}</b>}{it.equipado && <i className="eq">E</i>}</button>)}{filtro === 'todo' && Array.from({ length: Math.min(10, Math.max(0, (d.bolsa?.max || 0) - items.length)) }, (_, i) => <div className="slot vacio" key={`vacio-${i}`}/>)}</div> : <Vacio>No tienes equipo todavía. Consigue piezas jugando o en la tienda.</Vacio>}
      {activo && <div className="bloque vidrio detalle" style={{ '--r': color(activo) }}>
        <div className="fila"><strong style={{ color: color(activo) }}>{activo.emoji} {activo.etiqueta}</strong>{activo.equipado && <span className="etiq">Equipado</span>}</div>
        <p className="peq">{activo.desc}</p>
        <p className="mut peq">{(RAREZAS_EQUIPO[activo.rareza] || RAREZAS_EQUIPO.comun)[0]} · Nivel {activo.ilvl} · Mejora +{activo.plus || 0}</p>
        <p className="mut peq">Durabilidad: {activo.dur}/{activo.durMax}{activo.roto ? ' · roto, sin bonos' : ''}</p>
        {m ? <p className="mut peq">Siguiente mejora: {fmt(m.monedas)} monedas · {m.hierro} hierro{m.oro ? ` · ${m.oro} oro` : ''} · {m.prob}% de éxito{m.piedraUtil ? ` (${m.probPiedra}% con 💎, tienes ${d.piedras || 0})` : ''}</p> : <p className="mut peq">Mejora al máximo (+{d.maxPlus ?? '—'}).</p>}
        {actual ? <div className="cmp"><p className="mut peq">Comparado con lo que llevas puesto ({actual.etiqueta})</p>{stat('Nivel', activo.ilvl, actual.ilvl)}{stat('Mejora', activo.plus || 0, actual.plus || 0, `+${activo.plus || 0}`, `+${actual.plus || 0}`)}{stat('Rareza', Object.keys(RAREZAS_EQUIPO).indexOf(activo.rareza), Object.keys(RAREZAS_EQUIPO).indexOf(actual.rareza), (RAREZAS_EQUIPO[activo.rareza] || RAREZAS_EQUIPO.comun)[0], (RAREZAS_EQUIPO[actual.rareza] || RAREZAS_EQUIPO.comun)[0])}{stat('Durabilidad', activo.dur, actual.dur, `${activo.dur}/${activo.durMax}`, `${actual.dur}/${actual.durMax}`)}</div> : null}
        <div className="btns">
          {activo.equipado ? <Accion ruta="/api/equipo/desequipar" cuerpo={{ tipo: activo.tipo }}>Quitar</Accion> : <Accion ruta="/api/equipo/equipar" cuerpo={{ id: activo.id }}>Equipar</Accion>}
          {m ? <Accion ruta="/api/equipo/mejorar" cuerpo={{ id: activo.id }} motivo={!m.puede ? 'Te faltan monedas o materiales.' : null}>Mejorar +{(activo.plus || 0) + 1}</Accion> : <button className="mini" type="button" aria-disabled="true" onClick={() => aviso('Esta pieza ya alcanzó su mejora máxima.')}>Al máximo</button>}
          {m && <Accion ruta="/api/equipo/mejorar" cuerpo={{ id: activo.id, piedra: true }} motivo={!(d.piedras > 0) ? 'No tienes Piedra de bendición. Fabrícala en Forja.' : !m.piedraUtil ? 'Esta mejora ya tiene 100% de éxito: guarda la piedra.' : !m.puede ? 'Te faltan monedas o materiales.' : null}>💎 Con piedra · {m.probPiedra}%</Accion>}
          {activo.reparar && <Accion ruta="/api/equipo/reparar" cuerpo={{ id: activo.id }} motivo={!activo.reparar.puede ? 'Te faltan monedas.' : null}>Reparar {fmt(activo.reparar.monedas)}</Accion>}
          <Accion ruta="/api/equipo/desmontar" cuerpo={{ id: activo.id }} confirmar={`¿Desmontar este equipo? Recibirás ${activo.desmonte}.`}>Desmontar</Accion>
          <Accion ruta="/api/equipo/vender" cuerpo={{ id: activo.id }} confirmar={`¿Vender este equipo por ${fmt(activo.precio)} monedas?`}>Vender {fmt(activo.precio)}</Accion>
        </div>
      </div>}
    </Sec>
    {d.reparacion?.cantidad > 0 && <Sec k="reparar-react" titulo="Reparaciones" extra={`${d.reparacion.cantidad} piezas dañadas`}><p className="mut peq">El equipo se desgasta al cazar y en la mazmorra; si llega a 0 deja de dar bonos.</p><div className="btns"><Accion ruta="/api/equipo/reparar" cuerpo={{ todo: true }} motivo={!d.reparacion.puede ? 'Te faltan monedas.' : null}>Reparar todo · {fmt(d.reparacion.total)}</Accion><Accion ruta="/api/objetos/usar" cuerpo={{ clave: 'kit_reparacion' }} motivo={!(d.kits > 0) ? 'No tienes Kits de reparación. Fabrícalos en Forja.' : !d.kitUtil ? 'Tu equipo puesto no necesita reparación.' : null}>🧰 Kit ({d.kits || 0}) · gratis</Accion></div><p className="mut peq" style={{ marginTop: 8 }}>El kit repara solo lo que llevas puesto.</p></Sec>}
    {items.length > 0 && <Sec k="lote-react" titulo="Gestión en lote" extra="Vender o desmontar"><div className="bloque vidrio"><strong>Venta en lote</strong><p className="mut peq">Vende todo el equipo que no llevas puesto hasta la rareza elegida.</p><select className="txt" aria-label="Rareza máxima para vender" value={rarezaLote} onChange={e => setRarezaLote(e.target.value)}>{(d.rarezas || []).map(r => <option key={r.clave} value={r.clave}>{r.emoji} {r.nombre}</option>)}</select><div className="btns uno"><Accion ruta="/api/equipo/vender-hasta" cuerpo={{ rareza: rarezaLote }} confirmar="¿Vender en lote? No se puede deshacer.">Vender en lote</Accion></div></div>
    {items.length > 0 && (() => {
      const lote = d.lotes?.[rarezaDesm];
      const hay = lote ? lote.cantidad > 0 : true;
      return <div className="bloque vidrio"><strong>Desmontar en lote</strong><p className="mut peq">Desmonta todo el equipo que no llevas puesto hasta la rareza elegida y recibe sus materiales.</p>
        <select className="txt" aria-label="Rareza máxima para desmontar" value={rarezaDesm} onChange={e => setRarezaDesm(e.target.value)}>{(d.rarezas || []).map(r => <option key={r.clave} value={r.clave}>{r.emoji} {r.nombre}</option>)}</select>
        {lote && <p className="mut peq" style={{ marginTop: 8 }}>{lote.cantidad > 0 ? `${lote.cantidad} ${lote.cantidad === 1 ? 'objeto' : 'objetos'} · recibirás ${lote.desmonte}` : 'No hay equipo para desmontar con ese filtro.'}</p>}
        <div className="btns uno"><Accion ruta="/api/equipo/desmontar-hasta" cuerpo={{ rareza: rarezaDesm }} motivo={!hay ? 'No hay equipo para desmontar con ese filtro.' : null} confirmar={lote ? `¿Desmontar ${lote.cantidad} ${lote.cantidad === 1 ? 'objeto' : 'objetos'}? Recibirás ${lote.desmonte}. No se puede deshacer.` : '¿Desmontar en lote? No se puede deshacer.'}>Desmontar en lote</Accion></div></div>;
    })()}</Sec>}
    {d.casa && <Sec k="casa-react" titulo="Tu hogar" extra={`${d.casa.emoji} ${d.casa.nombre}`}><div className="bloque vidrio"><div className="fila"><strong>{d.casa.emoji} {d.casa.nombre}</strong><span className="mut peq">Nv {d.casa.nivel}/{d.casa.max}</span></div><p className="mut peq">{d.casa.perks.parcelas} parcelas · +{d.casa.perks.bolsa} de bolsa · +{d.casa.perks.ofertas} ofertas · +{d.casa.perks.ingresos}% ingresos</p>{d.casa.siguiente ? <><p className="mut peq">Siguiente: {d.casa.siguiente.emoji} {d.casa.siguiente.nombre} · {fmt(d.casa.siguiente.costo)} monedas</p><p className="mut peq">+{d.casa.siguiente.perks.parcelas} parcelas · +{d.casa.siguiente.perks.bolsa} bolsa · +{d.casa.siguiente.perks.ofertas} ofertas · +{d.casa.siguiente.perks.ingresos}% ingresos</p><div className="btns uno"><Accion ruta="/api/casa/mejorar" cuerpo={{}} motivo={(d.cartera || 0) < d.casa.siguiente.costo ? 'Te faltan monedas.' : null}>Mejorar hogar</Accion></div></> : <p className="mut peq">Tu hogar está al máximo.</p>}</div></Sec>}
  </>;
}


function ForjaReact({ d }) {
  const objetos = d.objetos || [];
  const listos = objetos.filter(o => o.puede).length;
  const materiales = (d.materiales || []).filter(m => Number(m.cantidad) > 0);
  const recetas = d.recetas || [];
  const valor = Number(d.valorMateriales || 0);
  return <>
    <Sec k="forja-recetas-react" titulo="Recetas" extra={`${recetas.length} disponibles`}>
      {recetas.length ? <div className="lista">{recetas.map(r => <div className="bloque vidrio" key={r.clave}>
        <div className="fila"><strong>{r.emoji || '🛠️'} {r.nombre}</strong><span className="mut peq">Tienes {r.stock || 0}/{d.tope ?? '—'}</span></div>
        <div className="mats" style={{ marginTop: 10 }}>{(r.reqs || []).map((x, i) => <div className="mat" key={`${x.clave || x.nombre || i}`}>
          <span className="slot" aria-hidden="true"><span>{x.emoji || '📦'}</span></span>
          <span className="peq">{x.nombre ? `${x.nombre}: ` : ''}{x.tengo}/{x.necesita}</span>
        </div>)}</div>
        <div className="btns uno"><Accion ruta="/api/forja/fabricar" cuerpo={{ clave: r.clave }} motivo={!r.puede ? 'Te faltan materiales o tu inventario está lleno.' : null}>Fabricar</Accion></div>
      </div>)}</div> : <Vacio>No hay recetas disponibles por ahora.</Vacio>}
    </Sec>
    <Sec k="forja-elixires-react" titulo="Elixires y pociones" extra={`${listos} listo${listos === 1 ? '' : 's'}`}>
      <ElixiresForja lista={objetos} tope={d.topeObjetos || 10}/>
    </Sec>
    <Sec k="forja-materiales-react" titulo="Vender materiales" extra={materiales.length ? `${materiales.length} tipos` : ''}>
      {materiales.length ? <>
        <p className="mut peq">Valor aproximado de todo: {fmt(valor)} monedas.</p>
        <div className="lista">{materiales.map(m => <div className="fil" key={m.clave}>
          <div className="nom"><strong>{m.emoji || '📦'} {m.nombre}</strong><span className="mut peq">{fmt(m.precio || 0)} monedas por unidad · tienes {fmt(m.cantidad)}</span></div>
          <Accion ruta="/api/forja/vender" cuerpo={{ material: m.clave, cantidad: 'todo' }} confirmar={`¿Vender ${m.cantidad} ${m.nombre} por ${fmt(m.cantidad * (m.precio || 0))} monedas?`}>Vender todo</Accion>
        </div>)}</div>
        <div className="btns uno"><Accion ruta="/api/forja/vender" cuerpo={{ material: 'todo' }} confirmar={`¿Vender todos tus materiales por ${fmt(valor)} monedas?`}>Vender todos los materiales</Accion></div>
      </> : <Vacio>Aún no tienes materiales. Mina, tala o pesca para conseguirlos.</Vacio>}
    </Sec>
  </>;
}

const SUBTITULO = {
  objetos: 'Cofres, herramientas, consumibles, materiales y reliquias.',
  equipo: 'Lo que llevas puesto, tu bolsa y su mantenimiento.',
  forja: 'Fabrica, prepara elixires y vende materiales.'
};

export default function Inventario({ d, base }) {
  const me = useMe();
  const seccion = inventarioSeccion();
  const monedas = fmt(Number(me?.monedas || 0));
  const stats = seccion === 'equipo' && d.bolsa
    ? [['Monedas', monedas], ['Bolsa', `${d.bolsa.usados ?? d.items?.length ?? 0}/${d.bolsa.max}`], ['Nivel', me?.nivel ?? '—']]
    : undefined;
  return <>
    <Cab titulo="Mochila" sub={SUBTITULO[seccion]} stats={stats}/>
    <Seg aria="Sección del inventario" opciones={OPCIONES} valor={seccion} onCambio={cambiarInventario}/>
    {seccion === 'objetos' ? <ObjetosReact d={d} base={base}/> : seccion === 'equipo' ? <EquipoReact d={d}/> : <ForjaReact d={d}/>}
  </>;
}
