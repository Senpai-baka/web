import React, { useState } from 'react';
import { fmt, hace } from '../lib/format.js';
import { buscarClan, consultaClan } from '../bridge/acciones.js';
import { Cab, Countdown, Fila, Kv, Sec, Titulo, Campo, Accion, filas, plural, premios } from './ui.jsx';

const ICONO = (
  <>
    <path d="M4 21 V9 L7 7 V4 H9 V7 H11 V4 H13 V7 H15 V4 H17 V7 L20 9 V21" />
    <path d="M3 21 H21" />
    <path d="M10 21 V15 A2 2 0 0 1 14 15 V21" />
  </>
);

const MARCA = { lider: '👑 ', subadmin: '🛡️ ' };

const REGISTRO = {
  fundacion: e => `${e.quien} fundó el clan`,
  entrada: e => `${e.quien} entró al clan`,
  salida: e => `${e.quien} salió del clan`,
  expulsion: e => `${e.quien} expulsó a ${e.objetivo}`,
  deposito: e => `${e.quien} depositó ${fmt(e.monto)}`,
  retiro: e => `${e.quien} retiró ${fmt(e.monto)}`,
  mejora: e => `${e.quien} subió el clan al nivel ${e.nivel}`,
  traspaso: e => `${e.quien} pasó el liderazgo a ${e.objetivo}`,
  subadmin: e => `${e.quien} nombró subadmin a ${e.objetivo}`,
  degradacion: e => `${e.quien} quitó a ${e.objetivo} como subadmin`
};

function Miembro({ m, c, subs }) {
  const sub = m.rol === 'subadmin';
  const protegido = m.rol !== 'miembro';
  return (
    <div className="fil">
      <div className="nom"><strong>{MARCA[m.rol] || ''}{m.alias}{m.yo ? ' (tú)' : ''}</strong></div>
      {m.ref && (
        <>
          {c.lider && <Accion ruta="/api/clan/traspasar" cuerpo={{ ref: m.ref }} confirmar={`¿Traspasar el liderazgo a ${m.alias}?`}>Líder</Accion>}
          {c.lider && (sub
            ? <Accion ruta="/api/clan/degradar" cuerpo={{ ref: m.ref }} confirmar={`¿Quitar a ${m.alias} como subadmin?`}>Quitar subadmin</Accion>
            : <Accion ruta="/api/clan/ascender" cuerpo={{ ref: m.ref }} motivo={subs >= c.maxSubadmins && `El clan ya tiene ${c.maxSubadmins} subadmins.`}>Subadmin</Accion>)}
          {(c.lider || !protegido) && <Accion ruta="/api/clan/expulsar" cuerpo={{ ref: m.ref }} confirmar={`¿Expulsar a ${m.alias}?`}>Expulsar</Accion>}
        </>
      )}
    </div>
  );
}

function Retiro({ c }) {
  const [cant, setCant] = useState('');
  const n = Number(cant);
  const motivo = !Number.isFinite(n) || n < 1 ? 'Indica una cantidad válida.' : n > c.banco ? 'El banco del clan no alcanza.' : n > c.retiroDisponible ? 'Pasa tu tope de retiro de hoy.' : null;
  return (
    <div className="bloque vidrio">
      <strong>Retirar del banco</strong>
      <p className="mut peq">
        {c.lider
          ? 'Como líder puedes retirar todo el banco.'
          : `Como subadmin puedes retirar hoy hasta ${fmt(c.retiroDisponible)} (${c.retiroSubPct}% del banco al inicio del día).`}
      </p>
      <Campo valor={cant} onCambio={setCant} ph="Cantidad a retirar" />
      <div className="btns uno">
        <Accion ruta="/api/clan/retirar" campos={{ cantidad: cant }} motivo={motivo} confirmar={`¿Retirar ${fmt(n)} del banco del clan?`}>Retirar</Accion>
      </div>
    </div>
  );
}

function Registro({ lista }) {
  return (
    <Sec k="cl-reg" titulo="Registro del clan" extra={lista.length ? String(lista.length) : ''}>
      <div className="lista">
        {lista.length ? lista.map((e, i) => (
          <div className="fil" key={i}>
            <div className="nom">
              <strong>{(REGISTRO[e.tipo] || (() => 'Actividad del clan'))(e)}</strong>
              <span className="mut peq">{hace(e.haceS)}</span>
            </div>
          </div>
        )) : <p className="mut peq">Todavía no hay movimientos.</p>}
      </div>
    </Sec>
  );
}

function ClanPropio({ d, c }) {
  const [dep, setDep] = useState('');
  const [q, setQ] = useState(consultaClan);
  const buscar = () => buscarClan(q);
  const g = c.guerra;
  const subs = c.miembros.filter(m => m.rol === 'subadmin').length;
  const sinPrestigio = c.requierePrestigio;

  return (
    <>
      <div className="bloque vidrio">
        <div className="fila"><strong>🏰 {c.nombre}</strong><span className="mut peq">Nv {c.nivel}{c.max ? '/' + c.max : ''}</span></div>
        <Kv k="Tu rol" v={c.lider ? 'Líder' : c.rol === 'subadmin' ? 'Subadmin' : 'Miembro'} />
        <Kv k="Miembros" v={c.miembros.length + '/' + c.cupo} />
        <Kv k="Banco del clan" v={fmt(c.banco)} />
        <Kv k="Bono de ingresos" v={'+' + c.bono + '%'} />
        <Kv k="Guerra" v={fmt(g.pts) + ' pts' + (g.puesto ? ' · puesto ' + g.puesto : '')} />
      </div>

      <div className="bloque vidrio">
        <Campo valor={dep} onCambio={setDep} ph="Cantidad a depositar" />
        <div className="btns uno">
          <Accion ruta="/api/clan/depositar" campos={{ cantidad: dep }}>Depositar al banco del clan</Accion>
        </div>
      </div>

      {c.gestor && <Retiro c={c} />}

      {c.gestor && (
        <div className="bloque vidrio">
          <p className="mut peq">
            Mejorar al nivel {c.nivel + 1} cuesta {fmt(c.costoMejora)} del banco del clan (sube con el prestigio del líder).
            El bono de ingresos llega hasta el nivel {c.bonoMax}; después solo crece el cupo.
          </p>
          {sinPrestigio && <p className="peq">Desde el nivel {c.nivelPrestigio} el líder necesita prestigio {c.prestigioMin} para seguir subiendo.</p>}
          <div className="btns uno">
            <Accion ruta="/api/clan/mejorar" motivo={sinPrestigio ? `El líder necesita prestigio ${c.prestigioMin}.` : c.banco < c.costoMejora && 'El banco del clan no alcanza.'}>Mejorar clan</Accion>
          </div>
          <div className="campo" style={{ marginTop: 10 }}>
            <Campo texto corto valor={q} onCambio={setQ} ph="Buscar jugador para invitar" onEnter={buscar} />
            <button type="button" className="mini" onClick={buscar}>Buscar</button>
          </div>
          {d.resultados.map(j => (
            <div className="fil" key={j.ref}>
              <div className="nom"><strong>{j.alias}</strong></div>
              <Accion ruta="/api/clan/invitar" cuerpo={{ ref: j.ref }}>Invitar</Accion>
            </div>
          ))}
        </div>
      )}

      <Sec k="cl-mi" titulo="Miembros" extra={String(c.miembros.length)}>
        {c.miembros.map((m, i) => <Miembro key={m.ref || i} m={m} c={c} subs={subs} />)}
      </Sec>
      <Registro lista={c.registro || []} />
      <div className="btns uno">
        {c.lider
          ? <Accion ruta="/api/clan/disolver" cuerpo={{ confirmar: true }} confirmar="Se borrará el clan y se pierde el banco. ¿Continuar?">Disolver clan</Accion>
          : <Accion ruta="/api/clan/salir" confirmar="¿Salir del clan?">Salir del clan</Accion>}
      </div>
    </>
  );
}

function SinClan({ d, base }) {
  const [nombre, setNombre] = useState('');
  return (
    <>
      {d.invitacion && (
        <div className="bloque vidrio">
          <strong>📨 Invitación a {d.invitacion.nombre}</strong>
          <p className="mut peq">Caduca en <Countdown fin={base + d.invitacion.restaS * 1000} />.</p>
          <div className="btnrow">
            <Accion ruta="/api/clan/aceptar">Aceptar</Accion>
            <Accion ruta="/api/clan/rechazar">Rechazar</Accion>
          </div>
        </div>
      )}
      <div className="bloque vidrio">
        <strong>Fundar un clan</strong>
        <p className="mut peq">Cuesta {fmt(d.costoFundar)} monedas. Banco común y bono de ingresos para todos.</p>
        <Campo texto valor={nombre} onCambio={setNombre} ph="Nombre (3 a 16 letras o números)" />
        <div className="btns uno">
          <Accion ruta="/api/clan/crear" campos={{ nombre }} motivo={d.cartera < d.costoFundar && 'Te faltan monedas.'}>Fundar</Accion>
        </div>
      </div>
    </>
  );
}

export default function Clan({ d, base }) {
  const g = d.guerra;
  return (
    <>
      <Cab atras titulo="Clan" sub="Banco común, bonos y guerras de clanes." icono={ICONO} />
      <Titulo>Tu clan</Titulo>
      {d.clan ? <ClanPropio d={d} c={d.clan} /> : <SinClan d={d} base={base} />}

      {g && (
        <Sec k="cl-guerra" titulo="Guerra de clanes">
          <div className="lista">
            <p className="mut peq" style={{ marginTop: 12 }}>
              Semana {g.semana} · cierra en <Countdown fin={base + g.cierraS * 1000} /><br />
              Premios al banco: {premios(g.premios)} (mínimo {g.minPuntos} pts)
            </p>
            {filas(g.ranking, 'Todavía nadie ha puntuado esta semana.', (x, i) => (
              <Fila key={i} r={x} extra={plural(x.miembros)} valor={fmt(x.pts) + ' pts'} />
            ))}
          </div>
        </Sec>
      )}

      <Sec k="cl-top" titulo="Top clanes">
        <div className="lista">
          {filas(d.top, 'Aún no hay clanes.', (x, i) => (
            <Fila key={i} r={x} extra={`Nv ${x.nivel} · ${plural(x.miembros)}`} valor={fmt(x.banco)} />
          ))}
        </div>
      </Sec>
    </>
  );
}
