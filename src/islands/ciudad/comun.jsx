import React from 'react';
import { Titulo } from '../ui.jsx';

export const Seccion = ({ children }) => <div className="ci">{children}</div>;

export const Grupo = ({ titulo, extra, children }) => (
  <div className="ci-g">
    <Titulo extra={extra ? <span className="ex">{extra}</span> : null}>{titulo}</Titulo>
    {children}
  </div>
);
