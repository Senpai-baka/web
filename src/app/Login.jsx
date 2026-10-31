import React, { useState } from 'react';
import { BOT_NUMBER, escena } from '../core/datos.js';
import { useEstado } from '../core/estado.js';
import { entrar } from '../core/sesion.js';
import Svg from './Svg.jsx';

const ESCENA = escena('l');

const limpiar = v => v.toUpperCase().replace(/[^A-Z0-9]/g, '');

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
      <h1>Conecta con Isla</h1>
      <p className="mut">Entra con tu cuenta de WhatsApp. Nunca te pedimos tu número.</p>
      <ol className="pasos">
        <li><b>1</b><span><strong>Abre el chat privado con Isla</strong><span className="mut peq">Desde el botón de abajo.</span></span></li>
        <li><b>2</b><span><strong>Envía /web</strong><span className="mut peq">El bot te responde con un código.</span></span></li>
        <li><b>3</b><span><strong>Pega el código aquí</strong><span className="mut peq">Sirve una sola vez y caduca en 5 minutos.</span></span></li>
      </ol>
      {BOT_NUMBER && <a className="btn" id="wa" href={'https://wa.me/' + BOT_NUMBER + '?text=%2Fweb'} target="_blank" rel="noopener">Abrir WhatsApp</a>}
      <form id="form" noValidate onSubmit={enviar}>
        <label htmlFor="codigo">Tu código</label>
        <div className="campo">
          <input id="codigo" placeholder="K7M2-9QXA" maxLength={12} inputMode="text" autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} value={codigo} onChange={cambiar} />
          <button className="btn2" id="entrar" type="submit">{enviando ? 'Entrando…' : 'Entrar'}</button>
        </div>
        <p className="err" id="err" role="alert">{msg || errGlobal}</p>
      </form>
    </section>
  );
}
