import React, { useMemo, useState } from 'react';
import { Sec, Vacio, Accion, Cifras, Countdown, Slot } from '../ui.jsx';
import { NEUTRO, AZUL, COLOR_COFRE } from '../rareza.js';
import { cambiarInventario } from '../../bridge/acciones.js';
import { fmt } from '../../lib/format.js';
import { Elixires, EfectosActivos } from '../Elixires.jsx';

const FILTROS = [
  ['todo', 'Todo'], ['cofres', 'Cofres'], ['herramientas', 'Herramientas'], ['consumibles', 'Consumibles'],
  ['elixires', 'Elixires'], ['materiales', 'Materiales'], ['reliquias', 'Reliquias']
];

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

function Herramienta({ h }) {
  const m = h.mejora;
  const pct = Math.min(100, h.usos / Math.max(1, h.usosMax) * 100);
  return (
    <div className={`herr bloque vidrio ${h.activa ? '' : 'off'}`}>
      <div className="cab">
        <Slot emoji={h.emoji} color={NEUTRO} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{h.nombre}</strong> <span className="mut peq">Nv {h.nivel}/{h.nivelMax} · x{h.mult}</span><br />
          <span className="mut peq">Se usa en {h.usoEn}</span>
        </div>
      </div>
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
          <p className="costo mut">
            Nv {m.siguiente.nivel}: x{m.siguiente.mult} · {m.siguiente.usosMax} usos<br />
            Costo: {fmt(m.monedas)} monedas · {m.mats.map(x => `${x.emoji} ${x.tengo}/${x.necesita}`).join(' ')}
          </p>
          <div className="btns uno">
            <Accion ruta="/api/herramientas/mejorar" cuerpo={{ clave: h.clave }} motivo={!m.puede ? 'Te faltan monedas o materiales.' : null}>Mejorar</Accion>
          </div>
        </>
      ) : <p className="mut peq" style={{ marginTop: 10 }}>Nivel máximo alcanzado.</p>}
    </div>
  );
}

function Herramientas({ lista }) {
  if (!lista.length) return <Vacio>No tienes herramientas todavía.</Vacio>;
  return <div className="lista">{lista.map(h => <Herramienta key={h.clave} h={h} />)}</div>;
}

function Cofres({ lista, max }) {
  if (!lista.length) return <Vacio>No tienes cofres. Puedes conseguirlos jugando y explorando.</Vacio>;
  return (
    <div className="bloque vidrio">
      {lista.map(c => {
        const n = Math.min(c.cantidad, max);
        return (
          <div key={c.clave} style={{ padding: '8px 0' }}>
            <div className="fil">
              <Slot emoji={c.emoji} cantidad={c.cantidad} color={COLOR_COFRE[c.clave] || COLOR_COFRE.madera} />
              <div className="nom">
                <strong>{c.nombre}</strong>
                <span className="mut peq">{fmt(c.monedas[0])}–{fmt(c.monedas[1])} monedas, materiales y más</span>
              </div>
            </div>
            <div className="btnrow">
              <Accion ruta="/api/cofres/abrir" cuerpo={{ tipo: c.clave, n: 1 }} motivo={c.cantidad < 1 ? 'No tienes cofres de este tipo.' : null}>Abrir</Accion>
              <Accion ruta="/api/cofres/abrir" cuerpo={{ tipo: c.clave, n }} motivo={c.cantidad < 2 ? 'Necesitas al menos 2 para abrir varios.' : null}>Abrir varios (x{n})</Accion>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Consumibles({ lista, tope, base }) {
  if (!lista.length) return <Vacio>No tienes consumibles.</Vacio>;
  return (
    <div className="lista">
      {lista.map(c => (
        <div className="fil" key={c.clave || c.nombre}>
          <Slot emoji={c.emoji} cantidad={c.cantidad} color={AZUL} />
          <div className="nom"><strong>{c.nombre}</strong><span className="mut peq">{c.desc}</span></div>
          {c.activoS > 0 && (
            <span className="val"><span className="etiq" style={{ margin: 0 }}>Activo <Countdown fin={base + c.activoS * 1000} /></span></span>
          )}
        </div>
      ))}
      <p className="mut peq">Máximo {tope} de cada consumible.</p>
    </div>
  );
}

function Materiales({ lista, valor }) {
  if (!lista.length) return <Vacio>Aún no tienes materiales. Mina, tala o pesca para conseguirlos.</Vacio>;
  return (
    <>
      <div className="mats">
        {lista.map(m => (
          <div className="mat" key={m.clave}>
            <Slot emoji={m.emoji} cantidad={fmt(m.cantidad)} />
            <span className="peq">{m.nombre}</span>
          </div>
        ))}
      </div>
      <p className="mut peq" style={{ marginTop: 10 }}>Valor aproximado de venta: {fmt(valor)} monedas.</p>
      <div className="btns uno">
        <button type="button" className="mini" onClick={() => cambiarInventario('forja')}>Vender en la Forja</button>
      </div>
    </>
  );
}

function Reliquias({ lista, bono }) {
  const tengo = lista.filter(r => r.tiene).length;
  return (
    <>
      <div className="rel">
        {lista.map(r => <span key={r.clave || r.nombre} className={r.tiene ? '' : 'no'}>{r.emoji} {r.nombre}</span>)}
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>
        Colección: {tengo}/{lista.length}. Bono de ingresos por reliquias: +{bono}%. Solo salen de los cofres.
      </p>
    </>
  );
}

export default function Objetos({ d, base }) {
  const [filtro, setFiltro] = useState('todo');

  const secciones = useMemo(() => {
    const cofres = d.cofres || [];
    const herramientas = d.herramientas || [];
    const consumibles = d.consumibles || [];
    const elixires = d.objetos || [];
    const materiales = d.materiales || [];
    const reliquias = d.reliquias || [];
    const tengoRel = reliquias.filter(r => r.tiene).length;
    const elixiresTengo = elixires.filter(o => o.cantidad > 0).length;
    return [
      {
        k: 'cofres', titulo: 'Cofres', cuenta: cofres.length, extra: `hasta ${d.cofresMax} a la vez`,
        ver: () => <Cofres lista={cofres} max={d.cofresMax || 1} />
      },
      {
        k: 'herramientas', titulo: 'Herramientas', cuenta: herramientas.length, extra: '',
        ver: () => <Herramientas lista={herramientas} />
      },
      {
        k: 'consumibles', titulo: 'Consumibles', cuenta: consumibles.length, extra: `máx. ${d.tope} de cada uno`,
        ver: () => <Consumibles lista={consumibles} tope={d.tope || 0} base={base} />
      },
      {
        k: 'elixires', titulo: 'Elixires y pociones', cuenta: elixiresTengo, extra: `${elixiresTengo} de ${elixires.length}`,
        ver: () => <Elixires lista={elixires} tope={d.topeObjetos || 10} />
      },
      {
        k: 'materiales', titulo: 'Materiales', cuenta: materiales.length, extra: `${materiales.length} tipos`,
        ver: () => <Materiales lista={materiales} valor={d.valorMateriales || 0} />
      },
      {
        k: 'reliquias', titulo: 'Reliquias', cuenta: reliquias.length, extra: `${tengoRel}/${reliquias.length}`,
        ver: () => <Reliquias lista={reliquias} bono={d.bonoReliquias || 0} />
      }
    ];
  }, [d, base]);

  const cantidades = Object.fromEntries(secciones.map(s => [s.k, s.cuenta]));
  const visibles = secciones.filter(s => (filtro === 'todo' ? s.cuenta > 0 : s.k === filtro));
  const totalCofres = (d.cofres || []).reduce((a, c) => a + (c.cantidad || 0), 0);
  const tengoRel = (d.reliquias || []).filter(r => r.tiene).length;

  return (
    <>
      <Cifras lista={[
        ['Cofres', fmt(totalCofres)],
        ['Herramientas', (d.herramientas || []).length],
        ['Materiales', (d.materiales || []).length],
        ['Reliquias', `${tengoRel}/${(d.reliquias || []).length}`]
      ]} />
      <EfectosActivos lista={d.efectos} base={base} />
      <Filtro valor={filtro} onCambio={setFiltro} cantidades={cantidades} />
      {visibles.length ? visibles.map(s => (
        <Sec key={s.k + (filtro === s.k ? '!' : '')} k={s.k} abierta={filtro === s.k ? true : undefined} titulo={s.titulo} extra={s.extra}>
          {s.ver()}
        </Sec>
      )) : <Vacio>Tu mochila está vacía. Juega y explora para conseguir objetos.</Vacio>}
    </>
  );
}
