const crypto = require('crypto');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  const { tool, ...q } = req.query;
  const int = (v, d, min, max) => Math.min(max, Math.max(min, parseInt(v, 10) || d));
  const text = String(q.text ?? '').slice(0, 5000);
  let out;

  switch (tool) {
    case 'uuid':
      out = { uuid: crypto.randomUUID() };
      break;
    case 'password': {
      const len = int(q.len, 16, 8, 128);
      const set = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?';
      out = { length: len, password: Array.from({ length: len }, () => set[crypto.randomInt(set.length)]).join('') };
      break;
    }
    case 'hash': {
      const algo = ['md5', 'sha1', 'sha256', 'sha512'].includes(q.algo) ? q.algo : 'sha256';
      out = { algo, hash: crypto.createHash(algo).update(text).digest('hex') };
      break;
    }
    case 'base64': {
      const dec = q.mode === 'decode';
      out = { mode: dec ? 'decode' : 'encode', result: dec ? Buffer.from(text, 'base64').toString('utf8') : Buffer.from(text).toString('base64') };
      break;
    }
    case 'dado': {
      const caras = int(q.caras, 6, 2, 1000), n = int(q.n, 1, 1, 100);
      const tiradas = Array.from({ length: n }, () => crypto.randomInt(1, caras + 1));
      out = { caras, tiradas, total: tiradas.reduce((a, b) => a + b, 0) };
      break;
    }
    case 'color': {
      const [r, g, b] = [0, 0, 0].map(() => crypto.randomInt(256));
      out = { hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''), rgb: `rgb(${r}, ${g}, ${b})` };
      break;
    }
    case 'hora': {
      const tz = String(q.tz || 'UTC');
      try {
        out = { tz, iso: new Date().toISOString(), local: new Date().toLocaleString('es-MX', { timeZone: tz }) };
      } catch {
        return res.status(400).json({ error: 'Zona horaria inválida' });
      }
      break;
    }
    case 'ip':
      out = { ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress };
      break;
    case 'slug':
      out = { slug: text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') };
      break;
    default:
      return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  res.status(200).json(out);
};
