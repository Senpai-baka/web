import React, { useState } from 'react';
import { Sec, Vacio, Accion, Titulo } from '../ui.jsx';
import { aviso } from '../../bridge/acciones.js';
import { useMe } from '../../bridge/store.js';
import { Sprite, hojaHeroe } from '../Sprite.jsx';
import { fmt } from '../../lib/format.js';

const TIPOS = { arma: ['Arma', '🗡️'], armadura: ['Armadura', '🛡️'], amuleto: ['Amuleto', '📿'] };
const RAREZAS = {
  comun: ['Común', '#a9b0c4'], poco: ['Poco común', '#8fc4ad'], rara: ['Rara', '#8fb4d6'],
  epica: ['Épica', '#b69be0'], legendaria: ['Legendaria', '#e0b96a']
};
const ORDEN_RAREZA = Object.keys(RAREZAS);
const infoRareza = r => RAREZAS[r] || RAREZAS.comun;
const colorDe = it => infoRareza(it.rareza)[1];
const mismo = (a, b) => String(a) === String(b);

function Heroe({ clase }) {
  const hoja = hojaHeroe(clase);
  return (
    <svg className="pj-svg" viewBox="14 56 132 132" aria-hidden="true">
      <Sprite hoja={hoja} cuadro={0} />
    </svg>
  );
}

const AREAS = { arma: 'arma', armadura: 'armadura', amuleto: 'amuleto' };

function Muneco({ items, activo, onSel, clase }) {
  return (
    <div className="muneco pj vidrio">
      {Object.entries(TIPOS).map(([tipo, [nombre, emoji]]) => {
        const it = items.find(i => i.equipado && i.tipo === tipo);
        const sel = !!it && mismo(it.id, activo?.id);
        return (
          <div className="hueco" key={tipo} style={{ gridArea: AREAS[tipo] }}>
            {it ? (
              <button type="button" className={`slot celda ${sel ? 'sel' : ''}`} style={{ '--r': colorDe(it) }} onClick={() => onSel(it.id)} aria-label={it.etiqueta} aria-pressed={sel}>
                <span className="si">{it.emoji || emoji}</span>
                {it.plus > 0 && <b className="mas">+{it.plus}</b>}
                <i className="eq">E</i>
              </button>
            ) : <div className="slot vacio"><span className="si">{emoji}</span></div>}
            <span>{nombre}</span>
          </div>
        );
      })}
      <div className="pj-hero" style={{ gridArea: 'hero' }}>
        <Heroe clase={clase} />
      </div>
    </div>
  );
}

function Bonos({ b }) {
  const lista = [['⚔️ Daño', `+${b.dano || 0}%`], ['❤️ Vida', `+${b.vida || 0}%`], ['🪙 Ingresos', `+${b.ingresos || 0}%`], ['🍀 Suerte', `+${b.suerte || 0}`]];
  return (
    <div className="bonos">
      {lista.map(([n, v]) => <div key={n}><span>{n}</span><b>{v}</b></div>)}
    </div>
  );
}

function Bolsa({ d, items, activo, onSel }) {
  const [filtro, setFiltro] = useState('todo');
  const filtros = [
    ['todo', 'Todo', items.length],
    ...Object.entries(TIPOS).map(([k, [n]]) => [k, n, items.filter(i => i.tipo === k).length])
  ];
  const vistos = filtro === 'todo' ? items : items.filter(i => i.tipo === filtro);
  const libres = filtro === 'todo' ? Math.min(4, Math.max(0, (d.bolsa?.max || 0) - items.length)) : 0;
  return (
    <>
      <div className="filtros" role="group" aria-label="Filtrar equipo">
        {filtros.map(([k, nombre, n]) => (
          <button key={k} type="button" className="fch" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{nombre}<i>{n}</i></button>
        ))}
      </div>
      <div className="bolsa-g rej">
        {vistos.map(it => {
          const sel = mismo(it.id, activo?.id);
          return (
            <button key={it.id} type="button" className={`it ${sel ? 'sel' : ''}`} aria-label={it.etiqueta} aria-pressed={sel} onClick={() => onSel(it.id)}>
              <span className={`slot ${it.rareza === 'legendaria' ? 'leg' : ''}`} style={{ '--r': colorDe(it) }} aria-hidden="true">
                <span className="si">{it.emoji || '🎒'}</span>
                {it.plus > 0 && <b className="mas">+{it.plus}</b>}
                {it.equipado && <i className="eq">E</i>}
              </span>
              <span className="it-n">{it.etiqueta}</span>
            </button>
          );
        })}
        {Array.from({ length: libres }, (_, i) => <div className="slot vacio" key={`vacio-${i}`} />)}
      </div>
    </>
  );
}

function Comparar({ activo, actual }) {
  const fila = (nombre, a, b, fa = a, fb = b) => {
    const sube = Number(a) > Number(b);
    const baja = Number(a) < Number(b);
    return (
      <div className={`cmp-f ${sube ? 'sube' : baja ? 'baja' : ''}`} key={nombre}>
        <span>{nombre}</span><b>{fa}</b><i aria-hidden="true">{sube ? '▲' : baja ? '▼' : '='}</i><span className="mut">{fb}</span>
      </div>
    );
  };
  return (
    <div className="cmp">
      <p className="mut peq">Comparado con lo que llevas puesto ({actual.etiqueta})</p>
      {fila('Nivel', activo.ilvl, actual.ilvl)}
      {fila('Mejora', activo.plus || 0, actual.plus || 0, `+${activo.plus || 0}`, `+${actual.plus || 0}`)}
      {fila('Rareza', ORDEN_RAREZA.indexOf(activo.rareza), ORDEN_RAREZA.indexOf(actual.rareza), infoRareza(activo.rareza)[0], infoRareza(actual.rareza)[0])}
      {fila('Durabilidad', activo.dur, actual.dur, `${activo.dur}/${activo.durMax}`, `${actual.dur}/${actual.durMax}`)}
    </div>
  );
}

function Detalle({ d, activo, actual }) {
  const m = activo.mejora;
  const motivoMejora = !m?.puede ? 'Te faltan monedas o materiales.' : null;
  const motivoPiedra = !(d.piedras > 0)
    ? 'No tienes Piedra de bendición. Fabrícala en Forja.'
    : !m?.piedraUtil ? 'Esta mejora ya tiene 100% de éxito: guarda la piedra.' : motivoMejora;
  return (
    <div className="bloque vidrio detalle" style={{ '--r': colorDe(activo) }}>
      <div className="det-cab">
        <span className="slot" style={{ '--r': colorDe(activo) }} aria-hidden="true">
          <span className="si">{activo.emoji || '🎒'}</span>
          {activo.plus > 0 && <b className="mas">+{activo.plus}</b>}
        </span>
        <div className="det-info">
          <div className="fila">
            <strong style={{ color: colorDe(activo) }}>{activo.etiqueta}</strong>
            {activo.equipado && <span className="etiq">Equipado</span>}
          </div>
          <p className="mut peq">{infoRareza(activo.rareza)[0]} · Nivel {activo.ilvl} · Mejora +{activo.plus || 0}</p>
          <p className="mut peq">Durabilidad: {activo.dur}/{activo.durMax}{activo.roto ? ' · roto, sin bonos' : ''}</p>
        </div>
      </div>
      <p className="peq det-desc">{activo.desc}</p>
      {m ? (
        <p className="mut peq">
          Siguiente mejora: {fmt(m.monedas)} monedas · {m.hierro} hierro{m.oro ? ` · ${m.oro} oro` : ''} · {m.prob}% de éxito
          {m.piedraUtil ? ` (${m.probPiedra}% con 💎, tienes ${d.piedras || 0})` : ''}
        </p>
      ) : <p className="mut peq">Mejora al máximo (+{d.maxPlus ?? '—'}).</p>}
      {actual ? <Comparar activo={activo} actual={actual} /> : null}
      <div className="btns">
        {activo.equipado
          ? <Accion ruta="/api/equipo/desequipar" cuerpo={{ tipo: activo.tipo }}>Quitar</Accion>
          : <Accion ruta="/api/equipo/equipar" cuerpo={{ id: activo.id }}>Equipar</Accion>}
        {m
          ? <Accion ruta="/api/equipo/mejorar" cuerpo={{ id: activo.id }} motivo={motivoMejora}>Mejorar +{(activo.plus || 0) + 1}</Accion>
          : <button className="mini" type="button" aria-disabled="true" onClick={() => aviso('Esta pieza ya alcanzó su mejora máxima.')}>Al máximo</button>}
        {m && <Accion ruta="/api/equipo/mejorar" cuerpo={{ id: activo.id, piedra: true }} motivo={motivoPiedra}>💎 Con piedra · {m.probPiedra}%</Accion>}
        {activo.reparar && <Accion ruta="/api/equipo/reparar" cuerpo={{ id: activo.id }} motivo={!activo.reparar.puede ? 'Te faltan monedas.' : null}>Reparar {fmt(activo.reparar.monedas)}</Accion>}
        <Accion ruta="/api/equipo/desmontar" cuerpo={{ id: activo.id }} confirmar={`¿Desmontar este equipo? Recibirás ${activo.desmonte}.`}>Desmontar</Accion>
        <Accion ruta="/api/equipo/vender" cuerpo={{ id: activo.id }} confirmar={`¿Vender este equipo por ${fmt(activo.precio)} monedas?`}>Vender {fmt(activo.precio)}</Accion>
      </div>
    </div>
  );
}

function Reparaciones({ d }) {
  const r = d.reparacion;
  return (
    <Sec k="reparar-react" titulo="Reparaciones" extra={`${r.cantidad} piezas dañadas`}>
      <p className="mut peq">El equipo se desgasta al cazar y en la mazmorra; si llega a 0 deja de dar bonos.</p>
      <div className="btns">
        <Accion ruta="/api/equipo/reparar" cuerpo={{ todo: true }} motivo={!r.puede ? 'Te faltan monedas.' : null}>Reparar todo · {fmt(r.total)}</Accion>
        <Accion
          ruta="/api/objetos/usar" cuerpo={{ clave: 'kit_reparacion' }}
          motivo={!(d.kits > 0) ? 'No tienes Kits de reparación. Fabrícalos en Forja.' : !d.kitUtil ? 'Tu equipo puesto no necesita reparación.' : null}
        >🧰 Kit ({d.kits || 0}) · gratis</Accion>
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>El kit repara solo lo que llevas puesto.</p>
    </Sec>
  );
}

function Lotes({ d }) {
  const [rarezaVenta, setRarezaVenta] = useState(d.rarezas?.[0]?.clave || 'comun');
  const [rarezaDesm, setRarezaDesm] = useState(d.rarezas?.[0]?.clave || 'comun');
  const rarezas = d.rarezas || [];
  const lote = d.lotes?.[rarezaDesm];
  const hay = lote ? lote.cantidad > 0 : true;
  const plural = lote?.cantidad === 1 ? 'objeto' : 'objetos';
  const opciones = rarezas.map(r => <option key={r.clave} value={r.clave}>{r.emoji} {r.nombre}</option>);
  return (
    <Sec k="lote-react" titulo="Gestión en lote" extra="Vender o desmontar">
      <div className="bloque vidrio">
        <strong>Venta en lote</strong>
        <p className="mut peq">Vende todo el equipo que no llevas puesto hasta la rareza elegida.</p>
        <select className="txt" aria-label="Rareza máxima para vender" value={rarezaVenta} onChange={e => setRarezaVenta(e.target.value)}>{opciones}</select>
        <div className="btns uno">
          <Accion ruta="/api/equipo/vender-hasta" cuerpo={{ rareza: rarezaVenta }} confirmar="¿Vender en lote? No se puede deshacer.">Vender en lote</Accion>
        </div>
      </div>
      <div className="bloque vidrio">
        <strong>Desmontar en lote</strong>
        <p className="mut peq">Desmonta todo el equipo que no llevas puesto hasta la rareza elegida y recibe sus materiales.</p>
        <select className="txt" aria-label="Rareza máxima para desmontar" value={rarezaDesm} onChange={e => setRarezaDesm(e.target.value)}>{opciones}</select>
        {lote && (
          <p className="mut peq" style={{ marginTop: 8 }}>
            {lote.cantidad > 0 ? `${lote.cantidad} ${plural} · recibirás ${lote.desmonte}` : 'No hay equipo para desmontar con ese filtro.'}
          </p>
        )}
        <div className="btns uno">
          <Accion
            ruta="/api/equipo/desmontar-hasta" cuerpo={{ rareza: rarezaDesm }}
            motivo={!hay ? 'No hay equipo para desmontar con ese filtro.' : null}
            confirmar={lote ? `¿Desmontar ${lote.cantidad} ${plural}? Recibirás ${lote.desmonte}. No se puede deshacer.` : '¿Desmontar en lote? No se puede deshacer.'}
          >Desmontar en lote</Accion>
        </div>
      </div>
    </Sec>
  );
}

function Hogar({ d }) {
  const c = d.casa;
  const s = c.siguiente;
  return (
    <Sec k="casa-react" titulo="Tu hogar" extra={`${c.emoji} ${c.nombre}`}>
      <div className="bloque vidrio">
        <div className="fila"><strong>{c.emoji} {c.nombre}</strong><span className="mut peq">Nv {c.nivel}/{c.max}</span></div>
        <p className="mut peq">{c.perks.parcelas} parcelas · +{c.perks.bolsa} de bolsa · +{c.perks.ofertas} ofertas · +{c.perks.ingresos}% ingresos</p>
        {s ? (
          <>
            <p className="mut peq">Siguiente: {s.emoji} {s.nombre} · {fmt(s.costo)} monedas</p>
            <p className="mut peq">+{s.perks.parcelas} parcelas · +{s.perks.bolsa} bolsa · +{s.perks.ofertas} ofertas · +{s.perks.ingresos}% ingresos</p>
            <div className="btns uno">
              <Accion ruta="/api/casa/mejorar" cuerpo={{}} motivo={(d.cartera || 0) < s.costo ? 'Te faltan monedas.' : null}>Mejorar hogar</Accion>
            </div>
          </>
        ) : <p className="mut peq">Tu hogar está al máximo.</p>}
      </div>
    </Sec>
  );
}

export default function Equipo({ d }) {
  const me = useMe();
  const items = Array.isArray(d.items) ? d.items : [];
  const [seleccion, setSeleccion] = useState(null);
  const elegir = id => setSeleccion(s => (mismo(s, id) ? null : id));
  const activo = items.find(i => mismo(i.id, seleccion)) || null;
  const actual = activo && !activo.equipado ? items.find(i => i.equipado && i.tipo === activo.tipo) : null;
  const b = d.bonos || {};
  return (
    <>
      <Muneco items={items} activo={activo} onSel={elegir} clase={me?.clase?.clave} />
      <Bonos b={b} />
      <Titulo extra={<span className="ex">{d.bolsa?.usados ?? items.length}/{d.bolsa?.max ?? '—'}</span>}>Tu equipo</Titulo>
      {items.length
        ? <Bolsa d={d} items={items} activo={activo} onSel={elegir} />
        : <Vacio>No tienes equipo todavía. Consigue piezas jugando o en la tienda.</Vacio>}
      {activo && <Detalle d={d} activo={activo} actual={actual} />}
      {d.reparacion?.cantidad > 0 && <Reparaciones d={d} />}
      {items.length > 0 && <Lotes d={d} />}
      {d.casa && <Hogar d={d} />}
    </>
  );
}
