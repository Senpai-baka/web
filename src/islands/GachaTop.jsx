import React from 'react';
import { fmt } from '../lib/format.js';
import { topSeccion, topIr, gachaPagina } from '../bridge/acciones.js';
import { Seg, Vacio, Titulo, Fila, Accion } from './ui.jsx';
import { Carta, Pager } from './gachaUi.jsx';

const OPCIONES = [['coleccionistas', 'Coleccionistas'], ['populares', 'Más votados']];

function Coleccionistas({ d }) {
  return (
    <>
      <Titulo extra={<span className="mut peq">{d.miPuesto ? 'Tu puesto #' + fmt(d.miPuesto) : 'Aún sin cartas'}</span>}>Mayores coleccionistas</Titulo>
      {d.filas.length
        ? (
          <>
            <div className="bloque vidrio">
              {d.filas.map(r => <Fila key={r.pos} r={r} extra={fmt(r.cartas) + ' cartas'} valor={'💎 ' + fmt(r.valor)} />)}
            </div>
            {d.paginas > 1 && <Pager pagina={d.pagina} paginas={d.paginas} onDir={gachaPagina} />}
          </>
        )
        : <Vacio>Todavía nadie ha reclamado cartas.</Vacio>}
    </>
  );
}

function Populares({ d }) {
  return (
    <>
      <Titulo extra={<span className="mut peq">{fmt(d.total)} personajes</span>}>Personajes más votados</Titulo>
      <p className="mut peq">Vota por tus personajes favoritos para subir su valor. Puedes votar cada cierto tiempo.</p>
      {d.cartas.length
        ? (
          <>
            {d.cartas.map(c => (
              <div className="bloque vidrio" key={c.id}>
                <Carta c={c} />
                <div className="fila" style={{ marginTop: 8 }}>
                  <span className="mut peq">{c.dueno ? 'Dueño: ' + c.dueno : 'Sin dueño'}</span>
                  <Accion ruta="/api/cartas/votar" cuerpo={{ id: c.id }}>⭐ Votar</Accion>
                </div>
              </div>
            ))}
            {d.paginas > 1 && <Pager pagina={d.pagina} paginas={d.paginas} onDir={gachaPagina} />}
          </>
        )
        : <Vacio>Todavía no hay personajes para mostrar.</Vacio>}
    </>
  );
}

export default function GachaTop({ d }) {
  const sel = topSeccion() === 'populares' ? 'populares' : 'coleccionistas';
  return (
    <>
      <Seg aria="Tipo de ranking" opciones={OPCIONES} valor={sel} onCambio={topIr} />
      {sel === 'populares' ? <Populares d={d} /> : <Coleccionistas d={d} />}
    </>
  );
}

export function GachaFavoritos({ d }) {
  return (
    <>
      <p className="mut peq">
        Tus personajes favoritos ({d.total} de {d.max}). Para agregar uno, elígelo en Colección. Si dejas de ser su dueño, se quita solo.
      </p>
      <Titulo extra={<span className="mut peq">💎 {fmt(d.valor)}</span>}>Favoritos</Titulo>
      {d.cartas.length
        ? (
          <>
            {d.cartas.map(c => (
              <div className="bloque vidrio" key={c.id}>
                <Carta c={c} />
                <div className="btns uno"><Accion ruta="/api/cartas/favorito_quitar" cuerpo={{ id: c.id }}>Quitar de favoritos</Accion></div>
              </div>
            ))}
            <div className="btns uno" style={{ marginTop: 12 }}>
              <Accion ruta="/api/cartas/favorito_quitar" cuerpo={{ id: 'todo' }} confirmar="¿Vaciar tu lista de favoritos?">Vaciar lista</Accion>
            </div>
          </>
        )
        : <Vacio>Aún no tienes favoritos. Elige una carta en Colección y agrégala.</Vacio>}
    </>
  );
}
