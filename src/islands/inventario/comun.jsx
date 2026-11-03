import { useState } from 'react';

export function useElegir() {
  const [sel, setSel] = useState(null);
  const elegir = id => setSel(x => (x === id ? null : id));
  return [sel, elegir];
}
