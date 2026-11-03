import React, { useRef, useState } from 'react';
import { Sec, Accion } from './ui.jsx';
import { useMe } from '../bridge/store.js';
import { publicar, aviso } from '../bridge/acciones.js';

const LADO = 192;
const MAX_ORIGEN = 15 * 1024 * 1024;

async function leerImagen(archivo) {
  if (window.createImageBitmap) {
    try { return await createImageBitmap(archivo, { imageOrientation: 'from-image' }); } catch (_) {  }
  }
  const url = await new Promise((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.onerror = () => mal(r.error);
    r.readAsDataURL(archivo);
  });
  return new Promise((ok, mal) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => mal(new Error('imagen ilegible'));
    i.src = url;
  });
}

async function prepararFoto(archivo) {
  const img = await leerImagen(archivo);
  const w = img.width, h = img.height, lado = Math.min(w, h);
  if (!lado) throw new Error('imagen vacía');
  const c = document.createElement('canvas');
  c.width = c.height = LADO;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#100d17';
  ctx.fillRect(0, 0, LADO, LADO);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (w - lado) / 2, (h - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  if (img.close) img.close();
  return c.toDataURL('image/jpeg', 0.85);
}

export default function FotoPerfil() {
  const me = useMe();
  const entrada = useRef(null);
  const boton = useRef(null);
  const [ocupado, setOcupado] = useState(false);

  const elegir = async e => {
    const campo = e.target;
    const archivo = campo.files && campo.files[0];
    campo.value = '';
    if (!archivo) return;
    if (!/^image\//.test(archivo.type)) return aviso('Elige una imagen (JPG, PNG o WebP).');
    if (archivo.size > MAX_ORIGEN) return aviso('Esa imagen pesa demasiado (máximo 15 MB).');
    setOcupado(true);
    let imagen;
    try { imagen = await prepararFoto(archivo); }
    catch (_) { setOcupado(false); return aviso('No pude leer esa imagen. Prueba con otra (JPG, PNG o WebP).'); }
    try { await publicar(boton.current, '/api/foto', { imagen }); }
    finally { setOcupado(false); }
  };

  return (
    <Sec k="perfil-foto" titulo="Foto de perfil" extra={me?.foto ? 'Personalizada' : 'Sin foto'}>
      <div className="bloque vidrio">
        <p className="mut peq">Elige la imagen que quieras. Se recorta en cuadrado y se muestra junto a tu nombre en los rankings.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <button ref={boton} type="button" className="mini" aria-disabled={ocupado ? 'true' : undefined}
            onClick={() => { if (!ocupado) entrada.current.click(); }}>
            {ocupado ? 'Subiendo…' : me?.foto ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {me?.foto ? <Accion ruta="/api/foto" cuerpo={{ quitar: true }} confirmar="¿Quitar tu foto de perfil?">Quitar foto</Accion> : null}
        </div>
        <input ref={entrada} type="file" accept="image/*" hidden onChange={elegir} />
      </div>
    </Sec>
  );
}
