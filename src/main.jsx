import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import legacyMarkup from './legacy.html?raw';
import * as lib from './lib/index.js';
import { setMe } from './bridge/store.js';
import * as store from './state/panel.js';
import { montarIslas } from './bridge/islands.jsx';

window.IslaLib = lib;
window.IslaBridge = { setMe, store };

function App() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    montarIslas();
    const script = document.createElement('script');
    script.src = '/js/app.js?v=15';
    script.async = false;
    script.onload = () => {
      document.documentElement.dataset.islaReactMounted = 'true';
    };
    script.onerror = () => {
      const toast = document.querySelector('#toast');
      if (toast) {
        toast.hidden = false;
        toast.textContent = 'No se pudo cargar la lógica de Isla (/js/app.js).';
      }
    };
    document.body.appendChild(script);
  }, []);

  return <div id="isla-legacy-root" dangerouslySetInnerHTML={{ __html: legacyMarkup }} />;
}

createRoot(document.getElementById('root')).render(<App />);
