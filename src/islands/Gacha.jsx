import React, { useEffect } from 'react';
import { fmt, dur } from '../lib/format.js';
import { gachaSel, gachaIr, gachaPagina, abiertasGacha, vigilarFinGacha } from '../bridge/acciones.js';
import { Cab, Seg, Vacio, Countdown, BotonListo, Accion, Fila, Titulo } from './ui.jsx';
import { Carta, Mini, ChipsRareza, Pager } from './gachaUi.jsx';
import GachaTratos from './GachaTratos.jsx';

const OPCIONES = [['invocar', 'Invocar'], ['coleccion', 'Colección'], ['tratos', 'Tratos']];

const ICONO = <path d="M12 3 L14.5 9.5 L21 12 L14.5 14.5 L12 21 L9.5 14.5 L3 12 L9.5 9.5Z" />;

function VigiaFin({ fin }) {
  useEffect(() => {
    vigilarFinGacha(fin);
    return () => vigilarFinGacha(0);
  }, [fin]);
  return null;
}

function Invocar({ d, base }) {
  const p = d.pendiente;
  const libres = abiertasGacha().filter(a => a.fin > Date.now());
  return (
    <>
      <p className="mut peq">
        Invoca personajes de anime y reclama los que te gusten. Puedes tirar cada {dur(d.cooldownS)} y tienes {dur(d.reclamoS)} para reclamar la carta que salga.
      </p>

      {d.trato && (
        <div className="bloque vidrio">
          <p className="peq">🔁 Tienes una propuesta de cambio esperando. Caduca en <Countdown fin={base + d.trato.restaS * 1000} />.</p>
          <div className="btns uno"><button type="button" className="mini" onClick={() => gachaIr('tratos')}>Ver propuesta</button></div>
        </div>
      )}

      {libres.length > 0 && (
        <>
          <Titulo extra={<span className="mut peq">¡sé el primero!</span>}>Cartas por reclamar</Titulo>
          {libres.map(a => (
            <div className="bloque vidrio" key={a.id}>
              <Carta c={a.carta} />
              <p className="mut peq" style={{ marginTop: 8 }}><b>{a.por}</b> la invocó. Se escapa en <Countdown fin={a.fin} />.</p>
              <div className="btns uno"><Accion ruta="/api/gacha/reclamar" cuerpo={{ id: a.id }}>Reclamar carta</Accion></div>
            </div>
          ))}
        </>
      )}

      <ChipsRareza lista={d.mia.porRareza} />
      <div className="btns uno" style={{ marginTop: 14 }}>
        <BotonListo ruta="/api/gacha/tirar" txt="✨ Invocar" fin={base + d.esperaS * 1000} />
      </div>

      {p && (
        <>
          <Titulo extra={<span className="mut peq">se escapa en <Countdown fin={base + p.restaS * 1000} /></span>}>Carta pendiente</Titulo>
          <div className="bloque vidrio">
            <VigiaFin fin={base + p.restaS * 1000} />
            <Carta c={p.carta} />
            <p className="mut peq" style={{ marginTop: 10 }}>
              Reclámala antes de que se acabe el tiempo. Los demás jugadores también pueden quedársela si se adelantan.
            </p>
            <div className="btns uno"><Accion ruta="/api/gacha/reclamar" cuerpo={{ id: p.carta.id }}>Reclamar carta</Accion></div>
          </div>
        </>
      )}

      {d.mundo.length > 0 && (
        <>
          <Titulo>Cartas del mundo</Titulo>
          <div className="bloque vidrio">
            {d.mundo.map((r, i) => (
              <div className="fil" key={i}>
                <span className="pos">{r.emoji}</span>
                <div className="nom"><strong>{r.nombre}</strong><span className="mut peq">{fmt(r.reclamadas)} reclamadas</span></div>
                <span className="val">{fmt(r.libres)} libres</span>
              </div>
            ))}
          </div>
        </>
      )}

      {d.ranking.length > 0 && (
        <>
          <Titulo>Mayores coleccionistas</Titulo>
          <div className="bloque vidrio">
            {d.ranking.map((r, i) => <Fila key={i} r={r} extra={fmt(r.cartas) + ' cartas'} valor={'💎 ' + fmt(r.valor)} />)}
          </div>
        </>
      )}
    </>
  );
}

function Coleccion({ d }) {
  return (
    <>
      <ChipsRareza lista={d.porRareza} />
      <Titulo>Tu colección</Titulo>
      {d.cartas.length ? (
        <>
          <div className="gc-rejilla">{d.cartas.map(c => <Mini key={c.id} c={c} />)}</div>
          {d.paginas > 1 && <Pager pagina={d.pagina} paginas={d.paginas} onDir={gachaPagina} />}
        </>
      ) : <Vacio>Aún no tienes cartas. Invoca y reclama la primera.</Vacio>}
    </>
  );
}

export default function Gacha({ d, base }) {
  const sel = gachaSel();
  const mia = sel === 'coleccion' ? { total: d.total, valor: d.valor } : sel === 'tratos' ? null : d.mia;
  const stats = mia ? [['Cartas', fmt(mia.total)], ['Valor', fmt(mia.valor)]] : undefined;
  return (
    <>
      <Cab atras titulo="Gacha" sub="Invoca, colecciona y cambia personajes de anime." icono={ICONO} stats={stats} />
      <Seg aria="Sección del gacha" opciones={OPCIONES} valor={sel} onCambio={gachaIr} />
      {sel === 'coleccion' ? <Coleccion d={d} /> : sel === 'tratos' ? <GachaTratos d={d} base={base} /> : <Invocar d={d} base={base} />}
    </>
  );
}
