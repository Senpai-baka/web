import React from 'react';
import { fmt } from '../lib/format.js';
import { companeroPagina } from '../bridge/acciones.js';
import { Titulo, Accion, Barra, Cifras, Kv, Vacio } from './ui.jsx';
import { Carta, Pager, colGacha } from './gachaUi.jsx';

function Imagen({ c }) {
  const [mal, setMal] = React.useState(false);
  return (
    <div className="gc-img">
      {c.imagen && !mal
        ? <img src={c.imagen} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setMal(true)} />
        : null}
      <span className="gc-em">{c.rareza ? c.rareza.emoji : '🎴'}</span>
    </div>
  );
}

function Activo({ a }) {
  const maxAtr = Math.max(1, ...a.atributos.map(x => x.valor));
  const subir = a.nivel < a.nivelMax;
  return (
    <>
      <Carta c={a.carta} />
      <div className="bloque vidrio cp-ficha">
        <div className="fila">
          <strong>{a.rol.emoji} {a.rol.nombre}</strong>
          <span className="etiq">Activo</span>
        </div>
        <p className="mut peq">{a.rol.desc}</p>
        <div className="stat">
          <div className="fila">
            <span>Nivel {a.nivel} de {a.nivelMax}</span>
            <span>{subir ? fmt(a.exp) + '/' + fmt(a.expSiguiente) + ' XP' : 'Máximo'}</span>
          </div>
          <Barra valor={subir ? a.exp : 1} max={subir ? a.expSiguiente : 1} />
        </div>
        <div className="stat">
          <div className="fila">
            <span>Vínculo {a.vinculo.nivel} de {a.vinculo.max}</span>
            <span>
              {a.vinculo.siguiente !== null
                ? a.vinculo.mazmorras + '/' + a.vinculo.siguiente + ' mazmorras'
                : 'Máximo'}
            </span>
          </div>
          <Barra valor={a.vinculo.siguiente !== null ? a.vinculo.mazmorras : 1} max={a.vinculo.siguiente !== null ? a.vinculo.siguiente : 1} />
        </div>
        <p className="mut peq">{a.vinculo.texto}</p>
        {a.ascension.nivel > 0 || a.ascension.siguiente
          ? <p className="mut peq">Ascensión {a.ascension.nivel}/{a.ascension.max}</p>
          : null}
      </div>

      <Titulo>Atributos</Titulo>
      <div className="bloque vidrio">
        {a.atributos.map(x => (
          <div className="stat" key={x.clave}>
            <div className="fila">
              <span>{x.nombre}</span>
              <span>{fmt(x.valor)}{x.valor !== x.base ? ' · base ' + fmt(x.base) : ''}</span>
            </div>
            <Barra valor={x.valor} max={maxAtr} />
          </div>
        ))}
      </div>

      <Titulo>Bonos pasivos</Titulo>
      <div className="bloque vidrio">
        <Cifras lista={[['Daño', '+' + a.bonos.dano + '%'], ['Vida', '+' + a.bonos.vida + '%'], ['Daño recibido', '−' + a.bonos.recibido + '%']]} />
      </div>

      {a.habilidades.length > 0 && (
        <>
          <Titulo>Habilidades</Titulo>
          {a.habilidades.map(h => (
            <div className={'bloque vidrio cp-hab' + (h.desbloqueada ? '' : ' cp-bloq')} key={h.id}>
              <div className="fila">
                <strong>{h.nombre}</strong>
                <span className="mut peq">{h.desbloqueada ? h.tipo : 'Nivel ' + h.nivel}</span>
              </div>
              <p className="mut peq">{h.descripcion}</p>
              {h.coste ? <p className="peq">Coste: {h.coste}</p> : null}
            </div>
          ))}
        </>
      )}

      {a.hitoSiguiente && (
        <div className="bloque vidrio">
          <strong>Siguiente hito · nivel {a.hitoSiguiente.nivel}</strong>
          <p className="mut peq">{a.hitoSiguiente.texto}</p>
        </div>
      )}

      <div className="bloque vidrio">
        <Kv k="Valor RW" v={'💎 ' + fmt(a.valor.rw)} />
        <Kv k="Desarrollo" v={'💎 ' + fmt(a.valor.desarrollo)} />
        <Kv k="Valor total" v={'💎 ' + fmt(a.valor.total)} />
      </div>
    </>
  );
}

function Sin({ d }) {
  return (
    <div className="bloque vidrio">
      <strong>Aún no tienes compañero</strong>
      <p className="mut peq" style={{ marginTop: 6 }}>
        Elige a uno de tus personajes reclamados. Sube de nivel contigo, gana vínculo con cada mazmorra y te da bonos pasivos.
        {d.desvinculado ? ' Su progreso se conserva si vuelves a elegirlo.' : ''}
      </p>
    </div>
  );
}

function Fila({ c, bloqueo }) {
  const motivo = c.equipado ? 'Ya es tu compañero.' : bloqueo ? bloqueo.texto : undefined;
  return (
    <div className="cp-carta" style={{ '--c': colGacha(c.rareza) }}>
      <Imagen c={c} />
      <div className="cp-in">
        <strong>{c.nombre}</strong>
        <span className="peq">{c.rol.emoji} {c.rol.nombre}{c.nivel ? ' · Nv ' + c.nivel : ''}</span>
        <span className="mut peq">{c.rareza ? c.rareza.emoji + ' ' + c.rareza.nombre + ' · ' : ''}💎 {fmt(c.valor)}</span>
      </div>
      {c.equipado
        ? <span className="etiq">Activo</span>
        : <Accion ruta="/api/companero/elegir" cuerpo={{ id: String(c.id) }} motivo={motivo}>Elegir</Accion>}
    </div>
  );
}

export default function Companero({ d }) {
  const col = d.coleccion;
  return (
    <>
      {d.bloqueo && <p className="hg-hambre ya">{d.bloqueo.texto} No puedes cambiar de compañero ahora.</p>}
      {d.activo ? <Activo a={d.activo} /> : <Sin d={d} />}
      <Titulo extra={<span className="mut peq">{fmt(col.total)} personajes</span>}>Elegir compañero</Titulo>
      {col.cartas.length ? (
        <>
          <div className="bloque vidrio cp-lista">
            {col.cartas.map(c => <Fila key={c.id} c={c} bloqueo={d.bloqueo} />)}
          </div>
          {col.paginas > 1 && <Pager pagina={col.pagina} paginas={col.paginas} onDir={companeroPagina} />}
        </>
      ) : <Vacio>Aún no tienes personajes. Invoca y reclama el primero en Gacha.</Vacio>}
    </>
  );
}
