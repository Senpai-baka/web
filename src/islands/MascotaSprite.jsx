import React, { useState } from 'react';

export default function MascotaSprite({ tipo, animo = 'normal', emoji = '🐾', tam = 72 }) {
  const [fallo, setFallo] = useState(false);
  if (fallo) return <span className="em">{emoji}</span>;
  return (
    <span className={'msp msp-' + animo} style={{ width: tam, height: tam }} aria-hidden="true">
      <img src={'/img/mascotas/' + tipo + '_sheet.png'} alt="" draggable="false" onError={() => setFallo(true)} />
    </span>
  );
}
