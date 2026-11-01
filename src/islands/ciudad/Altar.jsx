import React from 'react';
import { fmt } from '../../lib/format.js';
import { Sec, Vacio, Accion, Cifras } from '../ui.jsx';

function Fila({ r, d }) {
  return (
    <div className="fil">
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
  );
}

export default function Altar({ d }) {
  const tengo = d.lista.filter(r => r.tiene);
  const faltan = d.lista.filter(r => !r.tiene);
  return (
    <>
      <Cifras lista={[['Cartera', fmt(d.cartera)], ['Colección', d.n + '/' + d.total], ['Bono', '+' + d.bono + '%']]} />
      <div className="bloque vidrio">
        <p className="mut peq">
          Cada reliquia da un bono permanente de ingresos. El precio sube con cada una que compras
          {d.completo ? '' : ': la siguiente cuesta ' + fmt(d.precio)}. Se paga con la cartera.
        </p>
      </div>
      {faltan.length > 0 && (
        <Sec k="altar-faltan" titulo="Por conseguir" extra={faltan.length + ' · ' + fmt(d.precio) + ' c/u'}>
          <div className="lista">{faltan.map(r => <Fila key={r.clave} r={r} d={d} />)}</div>
        </Sec>
      )}
      <Sec k="altar-coleccion" titulo="Tu colección" extra={tengo.length + '/' + d.lista.length}>
        {tengo.length
          ? <div className="lista">{tengo.map(r => <Fila key={r.clave} r={r} d={d} />)}</div>
          : <Vacio>Aún no tienes reliquias. Cómpralas aquí o encuéntralas en los cofres.</Vacio>}
      </Sec>
    </>
  );
}
