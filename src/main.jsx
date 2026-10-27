import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import legacyMarkup from './legacy.html?raw';

/**
 * Puente de compatibilidad: React monta el DOM de la web existente.
 * El app.js original sigue controlando las funciones y llamadas a la API
 * hasta que cada módulo sea migrado a componentes React reales.
 */
function App() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const script = document.createElement('script');
    script.src = '/js/app.js';
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
    return () => {
      // No retirar el script: el panel legacy registra listeners globales.
    };
  }, []);

  return <div id="isla-legacy-root" dangerouslySetInnerHTML={{ __html: legacyMarkup }} />;
}

createRoot(document.getElementById('root')).render(<App />);
