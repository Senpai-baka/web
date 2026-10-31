import React from 'react';

const cache = new Map();

function leer(html) {
  let r = cache.get(html);
  if (r) return r;
  const m = /^<svg([^>]*)>([\s\S]*)<\/svg>$/.exec(html.trim());
  if (!m) return null;
  const props = {};
  for (const [, k, v] of m[1].matchAll(/([\w:-]+)="([^"]*)"/g)) {
    const nombre = k.startsWith('aria-') || k.startsWith('data-') ? k : k === 'class' ? 'className' : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    props[nombre] = v;
  }
  r = { props, interior: m[2] };
  cache.set(html, r);
  return r;
}

export default function Svg({ html }) {
  const r = html ? leer(html) : null;
  if (!r) return null;
  return <svg {...r.props} dangerouslySetInnerHTML={{ __html: r.interior }} />;
}
