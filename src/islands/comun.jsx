import React from 'react';

export function ItemIcon({ emoji, cantidad, color }) {
  return (
    <span className="slot" style={{ background: color ? `${color}22` : undefined, '--r': color }} aria-hidden="true">
      <span>{emoji || '📦'}</span>
      {cantidad !== undefined && <i className="n">{cantidad}</i>}
    </span>
  );
}
