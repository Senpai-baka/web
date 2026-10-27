# Isla · puente inicial a React

Este paquete es una **fase de compatibilidad**, no una reescritura completa del panel.

## Qué conserva
- El HTML y CSS del panel existente.
- La lógica de `app.js` y sus llamadas a `/api/...`.
- El flujo de acceso, sesión, inventario, tienda, mundo, ciudad, rankings, gacha, raid y demás pantallas que ya implementaba el código original.
- Las llamadas al backend del mismo origen (`API = ''`).

## Requisitos
- Node.js 20 o superior recomendado.
- El backend de Isla debe seguir publicando las rutas `/api/...` en el mismo dominio/origen.

## Probar localmente
```bash
npm install
npm run dev
```

## Compilar
```bash
npm run build
npm run preview
```

## Importante antes de desplegar en Vercel
Este paquete no incluye el backend de Isla. El frontend debe servirse bajo el mismo origen que la API o configurar un proxy/rewrite hacia el backend. Si el frontend y la API quedan en dominios diferentes, hay que definir `API` y revisar CORS/cookies `credentials: 'include'`.

## Siguiente fase de migración real
La UI existente está escrita de forma imperativa: `app.js` manipula directamente el DOM y registra muchos listeners globales. Por eso esta fase usa React como punto de entrada sin cambiar de golpe la lógica de juego. La migración real debe reemplazar gradualmente cada pantalla por componentes React y mover estado/API a hooks o servicios, validando cada módulo contra el backend.
