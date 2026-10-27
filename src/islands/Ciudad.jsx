// Pestaña Ciudad: port de pintarCiudad() + pintarBanco/Negocios/Casino/Altar/Jugadores de public/js/app.js.
import React, { useState } from 'react';
import { fmt } from '../lib/format.js';
import { ciudadSeccion, ciudadIr, buscarJugadores, consultaJugadores } from '../bridge/acciones.js';
import { Cab, Seg, Vacio, Countdown, Titulo, Campo, Accion, Cifras } from './ui.jsx';

const SECCIONES = [['banco', 'Banco'], ['negocios', 'Negocios'], ['casino', 'Casino'], ['altar', 'Altar'], ['jugadores', 'Jugadores']];

const ICONO = (
  <>
    <path d="M4 21 V9 L10 6 V21" />
    <path d="M10 21 V4 L20 8 V21" />
    <path d="M3 21 H21" />
    <path d="M13 10 H17 M13 14 H17" />
  </>
);

const Cartera = ({ d }) => <div className="cartera">Cartera <b>{fmt(d.cartera)}</b> monedas</div>;

/* ---------- Banco ---------- */
function Banco({ d }) {
  const [cant, setCant] = useState('');
  const campos = { cantidad: cant };
  const tramos = d.impuesto.tramos.map(t => 'desde ' + fmt(t.desde) + ': ' + t.tasa + '%').join(' · ');
  return (
    <>
      <Cifras lista={[['Cartera', fmt(d.cartera)], ['Banco', fmt(d.banco)], ['Total', fmt(d.total)]]} />
      <div className="bloque vidrio">
        <p className="mut peq">
          Interés de {d.tasa}% diario (máximo {fmt(d.topeDia)} por día, hasta {d.maxDias} días acumulados). Lo que está en el banco no se puede robar.
        </p>
        <p className="mut peq" style={{ marginTop: 8 }}>Impuesto diario por tramos sobre tu patrimonio ({tramos}).</p>
        {d.impuesto.aplica && (
          <p className="peq" style={{ marginTop: 6 }}>
            Hoy pagarías {fmt(d.impuesto.diario)} al día. Guardar monedas en el banco no te libra de él.
          </p>
        )}
        <Campo valor={cant} onCambio={setCant} ph="Cantidad" />
        <div className="btns">
          <Accion ruta="/api/banco/depositar" campos={campos}>Depositar</Accion>
          <Accion ruta="/api/banco/retirar" campos={campos}>Retirar</Accion>
          <Accion ruta="/api/banco/depositar" cuerpo={{ cantidad: 'todo' }} motivo={d.cartera < 1 && 'No tienes monedas en la cartera.'}>Depositar todo</Accion>
          <Accion ruta="/api/banco/retirar" cuerpo={{ cantidad: 'todo' }} motivo={d.banco < 1 && 'No tienes monedas en el banco.'}>Retirar todo</Accion>
        </div>
      </div>
    </>
  );
}

/* ---------- Negocios ---------- */
function Negocio({ n }) {
  if (!n.tiene) {
    return (
      <div className="bloque vidrio">
        <div className="fila"><strong>{n.emoji} {n.nombre}</strong><b>{fmt(n.precio)}</b></div>
        <p className="mut peq">Produce {fmt(n.tasa)} monedas por hora.</p>
        <div className="btns uno">
          <Accion ruta="/api/negocios/comprar" cuerpo={{ clave: n.clave }} motivo={!n.puede && 'Te faltan monedas.'}>Comprar</Accion>
        </div>
      </div>
    );
  }
  return (
    <div className="bloque vidrio">
      <div className="fila"><strong>{n.emoji} {n.nombre}</strong><span className="mut peq">Nv {n.nivel}/{n.max}</span></div>
      <p className="mut peq">{fmt(n.tasa)} monedas por hora · pendiente <b>{fmt(n.pendiente)}</b></p>
      <div className="btns uno">
        {n.costoMejora === null
          ? <Accion motivo="Ya está al máximo.">Nivel máximo</Accion>
          : <Accion ruta="/api/negocios/mejorar" cuerpo={{ clave: n.clave }} motivo={!n.puede && 'Te faltan monedas.'}>Mejorar · {fmt(n.costoMejora)}</Accion>}
      </div>
    </div>
  );
}

function Negocios({ d }) {
  return (
    <>
      <Cartera d={d} />
      <div className="btns uno">
        <Accion ruta="/api/negocios/cobrar" motivo={d.pendienteTotal < 1 && 'Todavía no han producido nada.'}>Cobrar · {fmt(d.pendienteTotal)}</Accion>
      </div>
      <p className="mut peq" style={{ marginTop: 8 }}>Acumulan hasta {d.capHoras} horas. Cobra antes de que se llenen.</p>
      {d.negocios.map(n => <Negocio key={n.clave} n={n} />)}
    </>
  );
}

/* ---------- Casino ---------- */
const COLORES = ['rojo', 'negro', 'par', 'impar', 'verde'];
const cap = k => k[0].toUpperCase() + k.slice(1);

function Casino({ d }) {
  const [monto, setMonto] = useState(String(d.min));
  const [num, setNum] = useState('');
  const camp = { monto };
  return (
    <>
      <Cartera d={d} />
      <div className="bloque vidrio">
        <Campo valor={monto} onCambio={setMonto} ph={'Apuesta (' + fmt(d.min) + ' a ' + fmt(d.max) + ')'} />
        <p className="mut peq" style={{ marginTop: 8 }}>La casa siempre gana a la larga. Juega con lo que puedas perder.</p>
      </div>

      <Titulo>Tragamonedas</Titulo>
      <div className="bloque vidrio">
        <p className="mut peq">{d.tragamonedas.map(s => s.emoji + ' x' + s.x).join(' · ')} · pareja x{d.par}</p>
        <div className="btns uno"><Accion ruta="/api/casino/tragamonedas" campos={camp}>Girar</Accion></div>
      </div>

      <Titulo>Cara o cruz</Titulo>
      <div className="bloque vidrio">
        <p className="mut peq">Pagan {Math.round(d.moneda.pago * 100)}% de tu apuesta.</p>
        <div className="btns">
          <Accion ruta="/api/casino/moneda" cuerpo={{ lado: 'cara' }} campos={camp}>🙂 Cara</Accion>
          <Accion ruta="/api/casino/moneda" cuerpo={{ lado: 'cruz' }} campos={camp}>🦅 Cruz</Accion>
        </div>
      </div>

      <Titulo>Ruleta</Titulo>
      <div className="bloque vidrio">
        <div className="btns">
          {COLORES.map(k => (
            <Accion key={k} ruta="/api/casino/ruleta" cuerpo={{ apuesta: k }} campos={camp}>{cap(k)} x{d.ruleta.colores[k]}</Accion>
          ))}
        </div>
        <Campo valor={num} onCambio={setNum} ph="Número del 0 al 36" />
        <div className="btns uno">
          <Accion ruta="/api/casino/ruleta" campos={{ monto, apuesta: num }}>Apostar al número x{d.ruleta.numero}</Accion>
        </div>
      </div>
    </>
  );
}

/* ---------- Altar ---------- */
function Altar({ d }) {
  return (
    <>
      <Cifras lista={[['Cartera', fmt(d.cartera)], ['Colección', d.n + '/' + d.total], ['Bono', '+' + d.bono + '%']]} />
      <div className="bloque vidrio">
        <p className="mut peq">
          Cada reliquia da un bono permanente de ingresos. El precio sube con cada una que compras
          {d.completo ? '' : ': la siguiente cuesta ' + fmt(d.precio)}. Se paga con la cartera.
        </p>
      </div>
      <div className="lista">
        {d.lista.map(r => (
          <div className="fil" key={r.clave}>
            <div className="nom">
              <strong>{r.emoji} {r.nombre}</strong>
              <span className="mut peq">{r.tiene ? 'En tu colección' : fmt(d.precio) + ' monedas'}</span>
            </div>
            {r.tiene
              ? <span className="val">✓</span>
              : (
                <Accion
                  ruta="/api/altar/comprar"
                  cuerpo={{ clave: r.clave }}
                  confirmar={`¿Pagar ${fmt(d.precio)} monedas por ${r.nombre}?`}
                  motivo={d.cartera < d.precio && 'No te alcanza con la cartera.'}
                >Comprar</Accion>
              )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Jugadores ---------- */
function Jugadores({ d, base }) {
  const [q, setQ] = useState(consultaJugadores);
  const [pago, setPago] = useState('');
  const buscar = () => buscarJugadores(q);
  const consulta = consultaJugadores(); // la búsqueda con la que se pidieron estos resultados
  return (
    <>
      <Cartera d={d} />
      <div className="bloque vidrio">
        <p className="mut peq">
          Busca a un jugador por su nombre del panel. Pagar cobra {d.pago.tasa}% de impuesto (mínimo {fmt(d.pago.min)}).
          Robar necesita {fmt(d.robo.min)} en tu cartera y tiene {d.robo.exito}% de éxito.
        </p>
        <p className="peq" style={{ marginTop: 6 }}>
          {d.robo.esperaS > 0
            ? <>Podrás robar de nuevo en <Countdown fin={base + d.robo.esperaS * 1000} />.</>
            : 'Listo para robar.'}
          {d.robo.escudo > 0 ? ' Tienes un escudo activo que se romperá si atacas.' : ''}
        </p>
        <div className="campo" style={{ marginTop: 10 }}>
          <Campo texto corto valor={q} onCambio={setQ} ph="Nombre del jugador" onEnter={buscar} />
          <button type="button" className="mini" onClick={buscar}>Buscar</button>
        </div>
        <Campo valor={pago} onCambio={setPago} ph="Cantidad a pagar" />
      </div>
      {d.resultados.length
        ? d.resultados.map(j => (
          <div className="bloque vidrio" key={j.ref}>
            <strong>{j.alias}</strong>
            <div className="btnrow">
              <Accion ruta="/api/jugadores/pagar" cuerpo={{ ref: j.ref }} campos={{ cantidad: pago }}>Pagar</Accion>
              <Accion ruta="/api/jugadores/robar" cuerpo={{ ref: j.ref }} confirmar={`¿Intentar robar a ${j.alias}? Si sale mal pagas una multa.`}>Robar</Accion>
            </div>
          </div>
        ))
        : consulta && <Vacio>No encontré jugadores con ese nombre. Solo aparecen quienes han entrado al panel.</Vacio>}
    </>
  );
}

const VISTAS = { banco: Banco, negocios: Negocios, casino: Casino, altar: Altar, jugadores: Jugadores };

export default function Ciudad({ d, base }) {
  const sel = ciudadSeccion();
  const Vista = VISTAS[sel] || Banco;
  return (
    <>
      <Cab titulo="Ciudad" sub="Banco, negocios, casino y otros jugadores." icono={ICONO} />
      <Seg aria="Sección de la ciudad" opciones={SECCIONES} valor={sel} onCambio={ciudadIr} />
      <Vista d={d} base={base} />
    </>
  );
}
