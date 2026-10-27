// Perfil → Héroe: port de pintarHeroe() + pintarClase/Talentos/Atributos/Prestigio/Expedicion de public/js/app.js.
import React from 'react';
import { fmt } from '../lib/format.js';
import { Sec, Countdown, Accion } from './ui.jsx';

const Pips = ({ n, m }) => (
  <span className="pips">
    {Array.from({ length: n }, (_, i) => <i className="pip on" key={'o' + i} />)}
    {Array.from({ length: Math.max(0, m - n) }, (_, i) => <i className="pip" key={'f' + i} />)}
  </span>
);

const Dato = ({ ok, children }) => <li className={ok ? 'ok' : 'no'}>{ok ? '✓' : '○'} {children}</li>;

/* ---------- Clase y habilidades ---------- */
function Clase({ d, base }) {
  const c = d.clase;
  const confirma = c ? `Cambiar de clase cuesta ${fmt(d.clases.cambio)} monedas y reinicia tu energía. ¿Continuar?` : undefined;
  return (
    <>
      {c ? (
        <div className="bloque vidrio">
          <div className="fila">
            <strong>{c.emoji} {c.nombre}</strong>
            <span className="mut peq"><Pips n={c.energia.n} m={c.energia.max} /> {c.energia.n}/{c.energia.max}</span>
          </div>
          <p className="mut peq">{c.desc}</p>
          {c.energia.n < c.energia.max && <p className="peq">Próxima energía en <Countdown fin={base + c.energia.faltaS * 1000} /></p>}
        </div>
      ) : (
        <p className="mut peq">{d.clases.disponible ? 'Elige tu clase. Es gratis la primera vez.' : 'Se desbloquea en el nivel ' + d.clases.nivelMin + '.'}</p>
      )}
      <div className="clases">
        {d.clases.lista.map(k => (
          <div className={'bloque vidrio clase ' + (k.actual ? 'actual' : '')} key={k.id}>
            <div className="fila"><strong>{k.emoji} {k.nombre}</strong>{k.actual && <span className="etiq">Tu clase</span>}</div>
            <p className="mut peq">{k.desc}</p>
            <div className="habs">
              {k.habilidades.map(h => (
                <div className={'hab ' + (h.abierta ? '' : 'cerrada')} key={h.n}>
                  <span>{h.nombre} <span className="mut peq">Nv {h.nivel} · {h.costo}⚡ · {h.efecto}</span></span>
                  {k.actual && (
                    <Accion
                      ruta="/api/heroe/habilidad"
                      cuerpo={{ n: h.n }}
                      motivo={(h.activa || !h.abierta) && (h.activa ? 'Ya está activa.' : 'Aún no la desbloqueas.')}
                    >{h.activa ? 'Activa' : 'Usar'}</Accion>
                  )}
                </div>
              ))}
            </div>
            {!k.actual && (
              <div className="btns uno">
                <Accion
                  ruta="/api/heroe/clase"
                  cuerpo={{ clase: k.id }}
                  confirmar={confirma}
                  motivo={!d.clases.disponible && `Necesitas nivel ${d.clases.nivelMin}.`}
                >{c ? 'Cambiar · ' + fmt(d.clases.cambio) : 'Elegir'}</Accion>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Talentos ---------- */
function Talentos({ d }) {
  const t = d.talentos;
  if (!d.clase) return <p className="mut peq">Elige una clase para desbloquear talentos.</p>;
  return (
    <>
      <p className="peq">
        Puntos libres: <b>{t.libres}</b> de {t.total} <span className="mut">(1 cada {t.porNivel} niveles y {t.porPrestigio} por prestigio)</span>
      </p>
      <div className="tals">
        {t.lista.map(x => (
          <div className="tal" key={x.id}>
            <span className="em">{x.emoji}</span>
            <div>
              <strong>{x.nombre}</strong> <span className="mut peq">{x.rango}/{x.max}</span><br />
              <span className="mut peq">{x.efecto} por rango</span><br />
              <Pips n={x.rango} m={x.max} />
            </div>
            <Accion
              ruta="/api/heroe/talento"
              cuerpo={{ id: x.id }}
              motivo={(!t.libres || x.rango >= x.max) && (x.rango >= x.max ? 'Ya está al máximo.' : 'No tienes puntos libres.')}
            >+1</Accion>
          </div>
        ))}
      </div>
      <div className="btns uno">
        <Accion
          ruta="/api/heroe/talentos-reiniciar"
          confirmar={`Reiniciar tus talentos cuesta ${fmt(t.reinicio)} monedas. ¿Continuar?`}
          motivo={!t.gastados && 'No tienes talentos para reiniciar.'}
        >Reiniciar · {fmt(t.reinicio)}</Accion>
      </div>
    </>
  );
}

/* ---------- Atributos ---------- */
function Atributos({ d }) {
  const a = d.atributos;
  return (
    <>
      <p className="peq">Puntos libres: <b>{a.libres}</b> <span className="mut">(1 por nivel)</span> · Entrenamientos: {a.entreno.n}/{a.entreno.tope}</p>
      {a.lista.map(x => (
        <div className="bloque vidrio" key={x.clave}>
          <div className="fila"><strong>{x.emoji} {x.nombre}</strong><b>{x.valor}</b></div>
          <p className="mut peq">{x.desc}</p>
          <div className="btnrow">
            <Accion ruta="/api/heroe/puntos" cuerpo={{ stat: x.clave, cantidad: 1 }} motivo={!a.libres && 'No tienes puntos libres.'}>+1 punto</Accion>
            <Accion ruta="/api/heroe/entrenar" cuerpo={{ stat: x.clave }} motivo={a.entreno.lleno && 'Llegaste al tope de entrenamiento.'}>
              {a.entreno.lleno ? 'Tope' : 'Entrenar ' + fmt(a.entreno.costo)}
            </Accion>
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------- Expediciones ---------- */
function Expediciones({ d, base }) {
  const e = d.expedicion;
  return (
    <>
      {e.curso && (
        <div className="bloque vidrio">
          <div className="fila"><strong>{e.curso.emoji} {e.curso.nombre}</strong><span className="etiq">{e.curso.quien === 'mascota' ? 'Mascota' : 'Tú'}</span></div>
          <p className="peq">{e.curso.lista ? 'Lista para recoger.' : <>Termina en <Countdown fin={base + e.curso.restaS * 1000} /></>}</p>
          <div className="btns uno"><Accion ruta="/api/heroe/expedicion-recoger">Recoger</Accion></div>
        </div>
      )}
      {e.destinos.map(x => {
        const bloq = e.curso || !x.abierto;
        const motivo = e.curso ? 'Ya tienes una expedición en curso.' : 'Necesitas nivel ' + x.nivel + '.';
        return (
          <div className="bloque vidrio" key={x.id}>
            <div className="fila"><strong>{x.emoji} {x.nombre}</strong><span className="mut peq">{x.horas} h · Nv {x.nivel}</span></div>
            <p className="mut peq">{fmt(x.monedas[0])}–{fmt(x.monedas[1])} monedas · {x.materiales} · riesgo {x.riesgo}% · reliquia {x.reliquia}%</p>
            <div className="btnrow">
              <Accion ruta="/api/heroe/expedicion-iniciar" cuerpo={{ destino: x.id, quien: 'yo' }} motivo={bloq && motivo}>Ir yo · {fmt(x.costo)}</Accion>
              <Accion
                ruta="/api/heroe/expedicion-iniciar"
                cuerpo={{ destino: x.id, quien: 'mascota' }}
                motivo={(bloq || !e.nivelMascota) && (e.nivelMascota ? motivo : 'Tu mascota no está disponible.')}
              >Mascota</Accion>
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ---------- Prestigio ---------- */
function Prestigio({ d }) {
  const p = d.prestigio;
  const c = p.cumple;
  const listo = c.nivel && c.monedas && c.cupo;
  return (
    <div className="bloque vidrio">
      <div className="fila"><strong>🌠 Prestigio {p.n}/{p.max}</strong><span className="etiq">+{p.actual}% ingresos</span></div>
      <p className="mut peq">
        Renace con +{p.bono}% permanente en /work, /minar, /fish y /hunt. Se reinicia tu nivel, empleo y puntos. Conservas dinero, ítems y logros.
      </p>
      <ul className="req">
        <Dato ok={c.nivel}>Nivel {p.nivelReq}</Dato>
        <Dato ok={c.monedas}>{fmt(p.costo)} monedas en la cartera</Dato>
        <Dato ok={c.cupo}>Prestigio por debajo del máximo</Dato>
      </ul>
      <div className="btns uno">
        <Accion
          ruta="/api/heroe/prestigio"
          confirmar="Vas a renacer: tu nivel, empleo y puntos se reinician. ¿Continuar?"
          motivo={!listo && 'Aún no cumples los requisitos.'}
        >Renacer</Accion>
      </div>
    </div>
  );
}

export default function PerfilHeroe({ d, base }) {
  return (
    <>
      <p className="peq mut" style={{ marginTop: 8 }}>Cartera: <b>{fmt(d.cartera)}</b> monedas · Nivel {d.nivel}</p>
      <Sec k="h-clase" titulo="Clase y habilidades" extra={d.clase ? d.clase.nombre : ''}><Clase d={d} base={base} /></Sec>
      <Sec k="h-tal" titulo="Talentos" extra={d.clase ? d.talentos.libres + ' libres' : ''}><Talentos d={d} /></Sec>
      <Sec k="h-atr" titulo="Atributos" extra={d.atributos.libres + ' libres'}><Atributos d={d} /></Sec>
      <Sec k="h-exp" titulo="Expediciones" extra={d.expedicion.curso ? 'En curso' : ''}><Expediciones d={d} base={base} /></Sec>
      <Sec k="h-pre" titulo="Prestigio" extra={d.prestigio.n + '/' + d.prestigio.max}><Prestigio d={d} /></Sec>
    </>
  );
}
