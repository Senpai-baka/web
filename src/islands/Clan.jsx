import React, { useState } from 'react';
import { fmt, hace } from '../lib/format.js';
import { buscarClan, consultaClan } from '../bridge/acciones.js';
import { Countdown, Fila, Sec, Titulo, Campo, Accion, filas, plural, premios } from './ui.jsx';
import Cabeza from './Cabeza.jsx';

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="cl-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1d1730" />
        <stop offset="1" stopColor="#2f2646" />
      </linearGradient>
    </defs>
    <rect width="400" height="110" fill="url(#cl-fondo)" />
    <g fill="#241c38">
      <rect x="0" y="70" width="400" height="40" />
      <path d="M0 70 V58 H18 V70 M44 70 V58 H62 V70 M88 70 V58 H106 V70 M132 70 V58 H150 V70 M176 70 V58 H194 V70 M220 70 V58 H238 V70 M264 70 V58 H282 V70 M308 70 V58 H326 V70 M352 70 V58 H370 V70 M396 70 V58 H400 V70Z" />
    </g>
    <g className="cl-pendon">
      <rect x="60" y="0" width="3" height="14" fill="#8a7aa6" />
      <path d="M48 12 H88 V74 L68 62 L48 74Z" fill="#d7b5ff" fillOpacity=".78" />
      <path d="M48 12 H88 V20 H48Z" fill="#f4efff" fillOpacity=".35" />
    </g>
    <g className="cl-pendon p2">
      <rect x="196" y="0" width="3" height="14" fill="#8a7aa6" />
      <path d="M180 12 H216 V92 L198 78 L180 92Z" fill="#f0d39a" fillOpacity=".86" />
      <path d="M180 12 H216 V20 H180Z" fill="#fff6dc" fillOpacity=".4" />
      <circle cx="198" cy="44" r="8" fill="#241c38" fillOpacity=".55" />
    </g>
    <g className="cl-pendon p3">
      <rect x="326" y="0" width="3" height="14" fill="#8a7aa6" />
      <path d="M312 12 H348 V70 L330 58 L312 70Z" fill="#91d6bd" fillOpacity=".7" />
      <path d="M312 12 H348 V20 H312Z" fill="#e8fff6" fillOpacity=".3" />
    </g>
  </svg>
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
  degradacion: e => `${e.quien} quitó a ${e.objetivo} como subadmin`,
  perk: e => `${e.quien} mejoró ${e.perk} al nivel ${e.nivel}`,
  mision: e => `Misión del clan completada${e.monto ? ' (+' + fmt(e.monto) + ')' : ''}`
};

function Miembro({ m, c, subs }) {
  const sub = m.rol === 'subadmin';
  const protegido = m.rol !== 'miembro';
  return (
    <div className="fil cl-miembro">
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

function Mejoras({ c }) {
  return (
    <Sec k="cl-mej" titulo="Mejoras del clan">
      <div className="lista">
        {c.mejoras.map(m => {
          const lleno = m.nivel >= m.max;
          const motivo = !lleno && (c.nivel < m.requiere ? `Necesitas clan nivel ${m.requiere}.` : c.banco < m.costo && 'El banco del clan no alcanza.');
          return (
            <div className="fil" key={m.clave}>
              <div className="nom">
                <strong>{m.emoji} {m.nombre} · {m.nivel}/{m.max}</strong>
                <span className="mut peq">
                  {m.desc}: +{m.actual}{m.unidad === '%' ? '%' : ' ' + m.unidad}
                  {lleno ? ' · máximo' : ` · siguiente ${fmt(m.costo)} (clan nv ${m.requiere})`}
                </span>
              </div>
              {c.gestor && !lleno && (
                <Accion ruta="/api/clan/perk" cuerpo={{ clave: m.clave }} motivo={motivo} confirmar={`¿Mejorar ${m.nombre} por ${fmt(m.costo)}?`}>Mejorar</Accion>
              )}
            </div>
          );
        })}
      </div>
    </Sec>
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
      <div className="cl-clan">
        <div className="cl-estandarte" aria-hidden="true">
          <small>Nv</small>
          <b>{c.nivel}</b>
        </div>
        <div className="cl-quien">
          <h2>{c.nombre}</h2>
          <span className="etiq">{c.lider ? 'Líder' : c.rol === 'subadmin' ? 'Subadmin' : 'Miembro'}</span>
          {c.max ? <span className="mut peq">Nivel máximo {c.max}</span> : null}
        </div>
      </div>
      <div className="cl-datos">
        <div><b>{c.miembros.length}/{c.cupo}</b><span>Miembros</span></div>
        <div><b>{fmt(c.banco)}</b><span>Banco del clan</span></div>
        <div><b>+{c.bono}%</b><span>Bono de ingresos</span></div>
        <div><b>{fmt(g.pts)}</b><span>{g.puesto ? 'Guerra · puesto ' + g.puesto : 'Puntos de guerra'}</span></div>
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

      {c.mejoras && <Mejoras c={c} />}

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
    <div className="cl">
      <Cabeza titulo="Clan" sub="Banco común, bonos y guerras de clanes." arte={ARTE} />
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
    </div>
  );
}
