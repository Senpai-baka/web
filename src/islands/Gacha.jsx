import React, { useEffect, useState } from 'react';
import { fmt, dur } from '../lib/format.js';
import { gachaSel, gachaIr, gachaPagina, abiertasGacha, vigilarFinGacha } from '../bridge/acciones.js';
import { Seg, Vacio, Countdown, BotonListo, Accion, Fila, Titulo } from './ui.jsx';
import Cabeza from './Cabeza.jsx';
import { Carta, Mini, MiniSel, ChipsRareza, Pager } from './gachaUi.jsx';
import GachaTratos from './GachaTratos.jsx';
import GachaTienda, { PanelCarta } from './GachaTienda.jsx';
import GachaTop, { GachaFavoritos } from './GachaTop.jsx';

const OPCIONES = [['invocar', 'Invocar'], ['coleccion', 'Colección'], ['tratos', 'Tratos'], ['tienda', 'Tienda'], ['top', 'Top'], ['favoritos', 'Favoritos']];

const ARTE = (
  <svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="gc-fondo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1d1236" />
        <stop offset="1" stopColor="#3a1f4a" />
      </linearGradient>
      <radialGradient id="gc-brillo" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#f4efff" stopOpacity=".5" />
        <stop offset="1" stopColor="#f4efff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="110" fill="url(#gc-fondo)" />
    <circle className="gc-halo" cx="200" cy="64" r="70" fill="url(#gc-brillo)" />
    <g transform="translate(200 104)">
      <g transform="rotate(-24)"><rect x="-26" y="-78" width="52" height="76" rx="6" fill="#91d6bd" fillOpacity=".85" /></g>
      <g transform="rotate(-8)"><rect x="-26" y="-82" width="52" height="76" rx="6" fill="#d7b5ff" fillOpacity=".95" /></g>
      <g transform="rotate(10)"><rect x="-26" y="-82" width="52" height="76" rx="6" fill="#f0d39a" fillOpacity=".95" /></g>
      <g transform="rotate(26)"><rect x="-26" y="-78" width="52" height="76" rx="6" fill="#e5b4a0" fillOpacity=".85" /></g>
      <path d="M0 -62 L5 -50 L18 -46 L5 -42 L0 -30 L-5 -42 L-18 -46 L-5 -50Z" fill="#fff" fillOpacity=".8" transform="rotate(10)" />
    </g>
  </svg>
);

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
  const [elegida, setElegida] = useState(0);
  const activa = d.cartas.find(c => c.id === elegida) || null;
  return (
    <>
      <ChipsRareza lista={d.porRareza} />
      <Titulo extra={<span className="mut peq">Toca una para venderla o marcarla</span>}>Tu colección</Titulo>
      {d.cartas.length ? (
        <>
          <div className="gc-rejilla">
            {d.cartas.map(c => <MiniSel key={c.id} c={c} activa={c.id === elegida} onClick={() => setElegida(x => (x === c.id ? 0 : c.id))} />)}
          </div>
          {d.paginas > 1 && <Pager pagina={d.pagina} paginas={d.paginas} onDir={gachaPagina} />}
          {activa && <PanelCarta key={activa.id} c={activa} />}
        </>
      ) : <Vacio>Aún no tienes cartas. Invoca y reclama la primera.</Vacio>}
    </>
  );
}

const stats = (sel, d) => (sel === 'invocar' ? [['Cartas', fmt(d.mia.total)], ['Valor', fmt(d.mia.valor)]]
  : sel === 'coleccion' ? [['Cartas', fmt(d.total)], ['Valor', fmt(d.valor)]]
    : sel === 'tienda' ? [['Cartera', fmt(d.cartera)], ['En venta', d.enVenta + '/' + d.maxVentas]]
      : sel === 'favoritos' ? [['Favoritos', d.total + '/' + d.max], ['Valor', fmt(d.valor)]]
        : undefined);

export default function Gacha({ d, base }) {
  const sel = gachaSel();
  return (
    <div className="lg gc">
      <Cabeza titulo="Gacha" sub="Invoca, colecciona y cambia personajes de anime." arte={ARTE} cifras={stats(sel, d)} />
      <Seg aria="Sección del gacha" opciones={OPCIONES} valor={sel} onCambio={gachaIr} />
      {sel === 'coleccion' ? <Coleccion d={d} />
        : sel === 'tratos' ? <GachaTratos d={d} base={base} />
          : sel === 'tienda' ? <GachaTienda d={d} />
            : sel === 'top' ? <GachaTop d={d} />
              : sel === 'favoritos' ? <GachaFavoritos d={d} />
                : <Invocar d={d} base={base} />}
    </div>
  );
}
