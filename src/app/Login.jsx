import React, { useState } from 'react';
import { BOT_NUMBER, escena } from '../core/datos.js';
import { useEstado } from '../core/estado.js';
import { entrar } from '../core/sesion.js';
import Svg from './Svg.jsx';

const ESCENA = escena('l');

const PASOS = [
  ['Abre el chat privado con Isla', 'Desde el botón de abajo.'],
  ['Envía /web', 'El bot te responde con un código.'],
  ['Pega el código aquí', 'Sirve una sola vez y caduca en 5 minutos.']
];

const limpiar = v => v.toUpperCase().replace(/[^A-Z0-9]/g, '');

const CHAT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 5 H20 V16 H10 L5 20 V16 H4 Z" />
    <path d="M8 10 H16 M8 13 H13" />
  </svg>
);

export default function Login({ visible }) {
  const [codigo, setCodigo] = useState('');
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const errGlobal = useEstado(s => s.errLogin);

  const cambiar = ev => {
    const l = limpiar(ev.target.value).slice(0, 8);
    setCodigo(l.length > 4 ? l.slice(0, 4) + '-' + l.slice(4) : l);
  };

  const enviar = async ev => {
    ev.preventDefault();
    if (enviando) return;
    const c = limpiar(codigo);
    setMsg('');
    if (c.length !== 8) return setMsg('El código tiene 8 caracteres. Revisa que lo hayas copiado completo.');
    setEnviando(true);
    try {
      await entrar(c);
      setCodigo('');
    } catch (x) {
      setMsg(x.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="v-login" hidden={!visible}>
      <div className="escena login-esc" id="esc-login"><Svg html={ESCENA} /></div>
      <div className="lg-cuerpo">
        <h1>Conecta con Isla</h1>
        <p className="mut lg-sub">Entra con tu cuenta de WhatsApp. Nunca te pedimos tu número.</p>
        <ol className="pasos">
          {PASOS.map(([titulo, ayuda], i) => (
            <li key={i}>
              <b>{i + 1}</b>
              <span><strong>{titulo}</strong><span className="mut peq">{ayuda}</span></span>
            </li>
          ))}
        </ol>
        {BOT_NUMBER && (
          <a className="btn2 lg-wa" id="wa" href={'https://wa.me/' + BOT_NUMBER + '?text=%2Fweb'} target="_blank" rel="noopener">
            {CHAT}Abrir WhatsApp
          </a>
        )}
        <form className="lg-form" id="form" noValidate onSubmit={enviar}>
          <label htmlFor="codigo">Tu código</label>
          <div className="campo">
            <input id="codigo" placeholder="K7M2-9QXA" maxLength={12} inputMode="text" autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} aria-describedby="err" value={codigo} onChange={cambiar} />
            <button className="btn" id="entrar" type="submit" aria-disabled={enviando ? 'true' : undefined}>{enviando ? 'Entrando…' : 'Entrar'}</button>
          </div>
          <p className="err" id="err" role="alert">{msg || errGlobal}</p>
        </form>
      </div>
    </section>
  );
}
