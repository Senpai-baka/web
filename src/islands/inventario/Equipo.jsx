import React, { useEffect, useState } from 'react';
import { Sec, Vacio, Accion, Titulo, Slot, Countdown } from '../ui.jsx';
import { ORDEN_RAREZA, infoRareza, colorRareza } from '../rareza.js';
import { aviso } from '../../bridge/acciones.js';
import { useMe } from '../../bridge/store.js';
import { Sprite, hojaHeroe } from '../Sprite.jsx';
import { fmt } from '../../lib/format.js';

const TIPOS = { arma: ['Arma', '🗡️'], armadura: ['Armadura', '🛡️'], amuleto: ['Amuleto', '📿'] };
const colorDe = it => colorRareza(it.rareza);
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

const ICONO_STAT = { fuerza: '⚔️', vigor: '❤️', suerte: '🍀' };
const NOMBRE_STAT = { fuerza: 'Fuerza', vigor: 'Vigor', suerte: 'Suerte' };

function Estadisticas({ d, base }) {
  const s = d.stats;
  if (!s) return null;
  const maximo = Math.max(10, ...['fuerza', 'vigor', 'suerte'].map(k => Number(s[k] || 0))) * 1.25;
  const b = d.boosts || {};
  const efectos = b.objetos || [];
  const activos = b.escudoS > 0 || b.xpS > 0 || efectos.length > 0;
  return (
    <Sec k="equipo-stats-react" titulo="Estadísticas" extra={d.clase ? `${d.clase.emoji || '⚔️'} ${d.clase.nombre}` : 'Sin clase'}>
      <div className="bloque vidrio">
        {['fuerza', 'vigor', 'suerte'].map(k => (
          <div className="stat-r" key={k}>
            <span className="si-ic">{ICONO_STAT[k]}</span>
            <div>
              <div className="fila"><span>{NOMBRE_STAT[k]}</span><b>{fmt(Number(s[k] || 0))}</b></div>
              <div className="barra"><div style={{ width: `${Math.min(100, Number(s[k] || 0) / maximo * 100)}%` }} /></div>
            </div>
          </div>
        ))}
        {d.energia && d.clase && <div className="kv"><span>Energía</span><b>{d.energia.n}/{d.energia.max}</b></div>}
        {d.bonoIngresos > 0 && <div className="kv"><span>Bono de ingresos</span><b>+{d.bonoIngresos}%</b></div>}
        {s.libres > 0 && <p className="mut peq">Tienes {s.libres} {s.libres === 1 ? 'punto libre' : 'puntos libres'}. Repártelos en Héroe.</p>}
      </div>
      {activos && (
        <div className="bloque vidrio">
          {b.escudoS > 0 && <div className="kv"><span>Escudo anti-robo</span><b><Countdown fin={base + b.escudoS * 1000} /></b></div>}
          {b.xpS > 0 && <div className="kv"><span>Boost de XP x2</span><b><Countdown fin={base + b.xpS * 1000} /></b></div>}
          {efectos.map(o => <div className="kv" key={o.clave}><span>{o.emoji} {o.nombre} · {o.efecto}</span><b><Countdown fin={base + o.restanteS * 1000} /></b></div>)}
        </div>
      )}
    </Sec>
  );
}

function Bonos({ b }) {
  const con = n => `${n > 0 ? '+' : ''}${n || 0}%`;
  const lista = [
    ['⚔️ Daño', `+${b.dano || 0}%`], ['❤️ Vida', `+${b.vida || 0}%`], ['🪙 Ingresos', `+${b.ingresos || 0}%`], ['🍀 Suerte', `+${b.suerte || 0}`],
    ['🛡️ Daño recibido', con(b.recibido)], ['💰 Botín', con(b.botin)], ['🎁 Drops', con(b.drop)]
  ];
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
  const libres = filtro === 'todo' ? Math.min(10, Math.max(0, (d.bolsa?.max || 0) - items.length)) : 0;
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
            <button key={it.id} type="button" className={`slot celda ${sel ? 'sel' : ''} ${it.rareza === 'legendaria' ? 'leg' : ''}`} style={{ '--r': colorDe(it) }} aria-label={it.etiqueta} aria-pressed={sel} onClick={() => onSel(it.id)}>
              <span className="si">{it.emoji || '🎒'}</span>
              {it.plus > 0 && <b className="mas">+{it.plus}</b>}
              {it.equipado && <i className="eq">E</i>}
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

function Encanto({ activo, d }) {
  const e = activo.encanto;
  const [abierto, setAbierto] = useState(false);
  const [elegido, setElegido] = useState('');
  const claveActual = e?.actual?.clave;
  useEffect(() => {
    setAbierto(false);
    setElegido('');
  }, [claveActual]);
  if (!e) return null;
  const opciones = (d.encantos || []).filter(x => x.clave !== claveActual);
  const visible = e.disponible && (!e.actual || abierto);
  const pieza = opciones.find(x => x.clave === elegido);
  const motivo = !pieza ? 'Elige un encantamiento.' : !e.puede ? 'Te faltan monedas o materiales.' : null;
  const costo = e.costo;
  return (
    <div className="en-sub">
      <div className="fila">
        <strong>Encantamiento</strong>
        <span className="mut peq">{e.actual ? 'Activo' : 'Sin encanto'}</span>
      </div>
      {e.actual && (
        <div className="en-activo">
          <div><strong>{e.actual.emoji} {e.actual.nombre}</strong></div>
          <b>{e.actual.efecto}</b>
        </div>
      )}
      {e.actual && e.disponible && (
        <button type="button" className="mini" aria-expanded={abierto} onClick={() => setAbierto(x => !x)}>{abierto ? 'Cerrar' : 'Cambiar encanto'}</button>
      )}
      {visible && (
        <>
          <span className="mut peq">
            {e.actual ? 'Cambiarlo cuesta lo mismo que encantar y el anterior se pierde.' : 'Las piezas épicas y legendarias aceptan un encanto. Elige uno:'}
          </span>
          <div className="en-ops" role="group" aria-label="Encantamientos">
            {opciones.map(x => (
              <button key={x.clave} type="button" className="en-op" aria-pressed={elegido === x.clave} onClick={() => setElegido(x.clave)}>
                {x.emoji} {x.nombre}<span>{x.efecto}</span>
              </button>
            ))}
          </div>
          {costo && (
            <div className="reqs" aria-label="Costo">
              <span className={`req ${(d.cartera || 0) < costo.monedas ? 'falta' : ''}`}>{fmt(costo.monedas)} monedas</span>
              {costo.mats.map(m => (
                <span key={m.clave} className={`req ${m.tienes < m.n ? 'falta' : ''}`}>{m.emoji} {m.nombre} {m.tienes}/{m.n}</span>
              ))}
            </div>
          )}
          <Accion
            cls="pri"
            ruta="/api/equipo/encantar"
            cuerpo={{ id: activo.id, encanto: elegido }}
            motivo={motivo}
            confirmar={e.actual && pieza ? `¿Cambiar a ${pieza.nombre}? Perderás ${e.actual.nombre}.` : null}
          >{pieza ? `${e.actual ? 'Cambiar a' : 'Encantar con'} ${pieza.nombre}` : 'Encantar'}</Accion>
        </>
      )}
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
        <Slot emoji={activo.emoji || '🎒'} color={colorDe(activo)} plus={activo.plus} />
        <div className="det-info">
          <div className="fila">
            <strong style={{ color: colorDe(activo) }}>{activo.etiqueta}</strong>
            {activo.equipado && <span className="etiq">Equipado</span>}
          </div>
          <p className="mut peq">{infoRareza(activo.rareza)[0]} · Nivel {activo.ilvl} · Mejora +{activo.plus || 0}</p>
          <p className="mut peq">Durabilidad: {activo.dur}/{activo.durMax}{activo.roto ? ' · roto, sin bonos' : ''}</p>
        </div>
      </div>
      {activo.clase && (
        <span className={`en-clase ${activo.clase.afin ? 'afin' : 'otra'}`}>
          {activo.clase.emoji} {activo.clase.nombre} · {activo.clase.afin ? 'afín a tu clase' : 'no es de tu clase'}
        </span>
      )}
      <p className="peq det-desc">{activo.desc}</p>
      {m ? (
        <p className="mut peq">
          Siguiente mejora: {fmt(m.monedas)} monedas · {m.hierro} hierro{m.oro ? ` · ${m.oro} oro` : ''} · {m.prob}% de éxito
          {m.piedraUtil ? ` (${m.probPiedra}% con 💎, tienes ${d.piedras || 0})` : ''}
        </p>
      ) : <p className="mut peq">Mejora al máximo (+{d.maxPlus ?? '—'}).</p>}
      {actual ? <Comparar activo={activo} actual={actual} /> : null}
      <Encanto key={activo.id} activo={activo} d={d} />
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

export default function Equipo({ d, base }) {
  const me = useMe();
  const items = Array.isArray(d.items) ? d.items : [];
  const [seleccion, setSeleccion] = useState(null);
  const activo = items.find(i => mismo(i.id, seleccion)) || items.find(i => i.equipado) || items[0] || null;
  const actual = activo && !activo.equipado ? items.find(i => i.equipado && i.tipo === activo.tipo) : null;
  const puestos = items.filter(i => i.equipado).length;
  const b = d.bonos || {};
  return (
    <>
      <div className="inv-cols">
        <div className="inv-izq">
          <Sec k="equipo-react" titulo="Bolsa" extra={`${d.bolsa?.usados ?? items.length}/${d.bolsa?.max ?? '—'}`}>
            {items.length
              ? <Bolsa d={d} items={items} activo={activo} onSel={setSeleccion} />
              : <Vacio>No tienes equipo todavía. Consigue piezas jugando o en la tienda.</Vacio>}
          </Sec>
          {activo && (
            <>
              <Titulo>Pieza seleccionada</Titulo>
              <Detalle d={d} activo={activo} actual={actual} />
            </>
          )}
        </div>
        <div className="inv-der">
          <Sec k="equipo-puesto-react" titulo="Equipado" extra={`${puestos}/${Object.keys(TIPOS).length}`}>
            <Muneco items={items} activo={activo} onSel={setSeleccion} clase={me?.clase?.clave} />
          </Sec>
          <Estadisticas d={d} base={base || Date.now()} />
          <Sec k="equipo-bonos-react" titulo="Bonos del equipo" extra="">
            <Bonos b={b} />
          </Sec>
        </div>
      </div>
      {d.reparacion?.cantidad > 0 && <Reparaciones d={d} />}
      {items.length > 0 && <Lotes d={d} />}
      {d.casa && <Hogar d={d} />}
    </>
  );
}
