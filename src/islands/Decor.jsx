import React, { memo, useEffect, useRef } from 'react';

const A = (n, t = 3, d = 0, st) => ({ className: 'dv dv-' + n, style: { '--t': t + 's', '--d': d + 's', ...st } });
const LIN = { animationTimingFunction: 'linear' };
const BASE = { transformOrigin: '50% 100%' };
const TOP = { transformOrigin: '50% 0%' };

const banner = { viewBox: '0 0 160 88', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' };
const ancho = { viewBox: '92 0 128 76', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' };

const Estrellas = ({ pts, color = '#fff' }) => pts.map(([x, y, r, d], i) => (
  <circle key={i} cx={x} cy={y} r={r} fill={color} {...A('tw', 2.4 + (i % 3) * 0.8, -d)} />
));

const Brillo = ({ x, y, s = 1, d = 0, t = 2.6, color = '#fff' }) => (
  <path d={`M${x} ${y - 4 * s}V${y + 4 * s}M${x - 4 * s} ${y}H${x + 4 * s}`} stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none" {...A('glint', t, d)} />
);

const Engranaje = ({ cx, cy, r, inv, t, color = '#c3bbdc' }) => {
  const diente = (2 * Math.PI * r) / 14;
  return (
    <g {...A(inv ? 'spinr' : 'spin', t, 0, LIN)}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeOpacity=".55" strokeWidth={r * 0.4} strokeDasharray={`${diente * 0.55} ${diente * 0.45}`} />
      <circle cx={cx} cy={cy} r={r * 0.84} fill={color} fillOpacity=".28" />
      <circle cx={cx} cy={cy} r={r * 0.34} fill="#1a1522" />
    </g>
  );
};

const Minar = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvm-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f2850" /><stop offset="1" stopColor="#141019" /></linearGradient>
      <radialGradient id="dvm-t"><stop offset="0" stopColor="#ffb25a" stopOpacity=".6" /><stop offset="1" stopColor="#ffb25a" stopOpacity="0" /></radialGradient>
      <radialGradient id="dvm-c"><stop offset="0" stopColor="#bfe0ff" stopOpacity=".55" /><stop offset="1" stopColor="#bfe0ff" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvm-f)" />
    <path d="M0 88V54L26 32L46 48L76 18L106 50L130 34L160 58V88Z" fill="#1b1442" />
    <path d="M0 0H160V5L152 5L148 17L144 5L112 5L108 13L104 5L62 5L58 21L54 5L22 5L18 11L14 5L0 5Z" fill="#0d0a1a" />
    <circle cx="34" cy="62" r="24" fill="url(#dvm-t)" {...A('pulse', 2.6)} />
    <rect x="33" y="60" width="2.4" height="14" fill="#6b4a2a" />
    <g {...A('flick', 0.9, 0, BASE)}>
      <path d="M34.2 51C37.4 55 37.4 59 34.2 61C31 59 31 55 34.2 51Z" fill="#ff9d4a" />
      <path d="M34.2 55.5C35.8 57.5 35.8 59.5 34.2 60.7C32.6 59.5 32.6 57.5 34.2 55.5Z" fill="#fff0c0" />
    </g>
    <circle cx="112" cy="64" r="30" fill="url(#dvm-c)" {...A('pulse', 3.6, -1)} />
    <path d="M92 88L99 58L107 88Z" fill="#c3bbdc" />
    <path d="M106 88L115 46L124 88Z" fill="#cfe6fb" />
    <path d="M82 88L87 68L93 88Z" fill="#6a9fd0" />
    <path d="M126 88L131 70L137 88Z" fill="#6fa6d8" />
    <path d="M115 46L119 66L124 88L115 88Z" fill="#fff" opacity=".18" />
    <Brillo x={115} y={50} s={1.2} t={2.4} />
    <Brillo x={99} y={61} d={-0.8} t={2.4} />
    <Brillo x={131} y={72} s={0.9} d={-1.6} t={2.8} />
    <Brillo x={87} y={70} s={0.8} d={-2.1} t={3} />
    <circle cx="58" cy="22" r="1.3" fill="#9fc8ff" {...A('drip', 3.4)} />
    <circle cx="62" cy="44" r="1" fill="#e9dcff" opacity=".6" {...A('bob', 4, -1)} />
    <circle cx="74" cy="56" r=".9" fill="#e9dcff" opacity=".5" {...A('bob', 5, -2)} />
    <circle cx="146" cy="52" r="1" fill="#e9dcff" opacity=".55" {...A('bob', 4.5, -3)} />
  </svg>
);

const Talar = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvt-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a4a46" /><stop offset="1" stopColor="#101a1a" /></linearGradient>
      <radialGradient id="dvt-m"><stop offset="0" stopColor="#e6f7ee" stopOpacity=".5" /><stop offset="1" stopColor="#e6f7ee" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvt-f)" />
    <circle cx="128" cy="24" r="24" fill="url(#dvt-m)" {...A('pulse', 5)} />
    <circle cx="128" cy="24" r="10" fill="#e6f7ee" opacity=".88" />
    <g fill="#154a44">
      <g {...A('sway', 7, -2, BASE)}><path d="M66 70L80 34L94 70Z" /></g>
      <g {...A('sway', 6, -4, BASE)}><path d="M102 74L112 52L122 74Z" /></g>
    </g>
    <g fill="#0f3330">
      <g {...A('sway', 8, 0, BASE)}><path d="M14 88L30 40L46 88Z" /><path d="M22 66L30 46L38 66Z" fill="#14403b" /></g>
      <g {...A('sway', 9, -3, BASE)}><path d="M60 88L80 28L100 88Z" /></g>
      <g {...A('sway', 7.5, -1, BASE)}><path d="M96 88L112 46L128 88Z" /></g>
      <g {...A('sway', 8.5, -5, BASE)}><path d="M126 88L142 52L158 88Z" /></g>
    </g>
    <ellipse cx="44" cy="72" rx="50" ry="6" fill="#bfe8d8" opacity=".11" {...A('mist', 13)} />
    <ellipse cx="118" cy="80" rx="46" ry="5" fill="#bfe8d8" opacity=".09" {...A('mist', 17, -6)} />
    <rect y="76" width="160" height="12" fill="#8fc4ad" opacity=".08" />
    <circle cx="56" cy="60" r="1.5" fill="#f8f2a0" {...A('fire', 6)} />
    <circle cx="88" cy="68" r="1.3" fill="#f8f2a0" {...A('fire', 7, -2)} />
    <circle cx="108" cy="58" r="1.4" fill="#f8f2a0" {...A('fire', 5.5, -3.5)} />
    <circle cx="22" cy="74" r="1.2" fill="#f8f2a0" {...A('fire', 6.5, -1)} />
    <circle cx="140" cy="70" r="1.3" fill="#f8f2a0" {...A('fire', 7.5, -4)} />
    <g transform="translate(40 4)"><g style={{ '--dx': '14px', '--rot': '240deg' }}><path d="M0 0C3 -2 6 -1 6 2C3 4 0 3 0 0Z" fill="#8fc4ad" {...A('fall', 7, -1)} /></g></g>
    <g transform="translate(96 2)"><g style={{ '--dx': '-10px', '--rot': '-200deg' }}><path d="M0 0C3 -2 6 -1 6 2C3 4 0 3 0 0Z" fill="#c4d98f" {...A('fall', 9, -5)} /></g></g>
    <g transform="translate(140 0)"><g style={{ '--dx': '16px', '--rot': '300deg' }}><path d="M0 0C3 -2 6 -1 6 2C3 4 0 3 0 0Z" fill="#8fc4ad" {...A('fall', 8, -3)} /></g></g>
  </svg>
);

const Pescar = () => {
  const ola = (y, a) => `M-40 ${y} q10 ${a} 20 0${' t20 0'.repeat(11)} V88 H-40Z`;
  return (
    <svg {...banner}>
      <defs>
        <linearGradient id="dvp-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d3f66" /><stop offset="1" stopColor="#141a2c" /></linearGradient>
        <radialGradient id="dvp-m"><stop offset="0" stopColor="#e8f3ff" stopOpacity=".5" /><stop offset="1" stopColor="#e8f3ff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="160" height="88" fill="url(#dvp-f)" />
      <Estrellas pts={[[14, 12, 0.9, 0], [40, 24, 0.7, 1], [66, 10, 0.8, 2], [96, 18, 0.7, 0.5], [146, 40, 0.8, 1.5]]} />
      <circle cx="120" cy="22" r="22" fill="url(#dvp-m)" {...A('pulse', 5)} />
      <circle cx="120" cy="22" r="9" fill="#e8f3ff" opacity=".88" />
      <g {...A('wave', 7, 0, LIN)}><path d={ola(50, -5)} fill="#23304f" /></g>
      <g fill="#cfe8ff">
        <rect x="104" y="53" width="30" height="1.4" rx=".7" opacity=".5" {...A('shim', 3)} />
        <rect x="109" y="57" width="20" height="1.4" rx=".7" opacity=".4" {...A('shim', 3.4, -1)} />
        <rect x="113" y="61" width="12" height="1.4" rx=".7" opacity=".3" {...A('shim', 2.8, -2)} />
      </g>
      <g {...A('wavr', 5, 0, LIN)}><path d={ola(66, 5)} fill="#1a2340" /></g>
      <path d="M54 52q14 -34 36 0" fill="none" stroke="#8fb4d6" strokeWidth="1" strokeDasharray="2 3" opacity=".45" />
      <g transform="translate(56 58)">
        <g {...A('jx', 7.5, -3, LIN)}>
          <g {...A('jy', 7.5, -3)}>
            <path d="M0 0q6 -5 12 0q-6 5 -12 0ZM12 0L16 -3.5L16 3.5Z" fill="#cfe8ff" />
          </g>
        </g>
      </g>
      <ellipse cx="84" cy="62" rx="9" ry="2.4" fill="none" stroke="#cfe8ff" strokeWidth=".8" {...A('rip', 7.5, -3)} />
      <g {...A('bob', 2.6)}>
        <circle cx="30" cy="70" r="2.4" fill="#e84a4a" />
        <path d="M27.8 69.2a2.4 2.4 0 0 1 4.4 0Z" fill="#fff" />
      </g>
      <ellipse cx="30" cy="73" rx="6" ry="1.6" fill="none" stroke="#cfe8ff" strokeWidth=".7" {...A('ripple', 2.6)} />
      <ellipse cx="136" cy="76" rx="9" ry="2.6" fill="#2f8a6a" opacity=".7" {...A('bob', 4, -1)} />
      <path d="M142 88V58M148 88V62M136 88V64" stroke="#2f6a58" strokeWidth="2" {...A('sway', 5, -2, BASE)} />
    </svg>
  );
};

const Cazar = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvc-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#352a4a" /><stop offset=".7" stopColor="#c95a5a" /><stop offset="1" stopColor="#e8946a" /></linearGradient>
      <radialGradient id="dvc-s"><stop offset="0" stopColor="#ffd8a0" stopOpacity=".6" /><stop offset="1" stopColor="#ffd8a0" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvc-f)" />
    <circle cx="104" cy="58" r="36" fill="url(#dvc-s)" {...A('pulse', 4.5)} />
    <circle cx="104" cy="58" r="19" fill="#ffd8a0" opacity=".92" />
    <g stroke="#2a1634" strokeWidth="1.3" strokeLinecap="round" fill="none">
      <g {...A('drift', 17, -5, LIN)}><g transform="translate(0 16)"><path d="M0 0q3 -3.5 6 0q3 -3.5 6 0" {...A('flap', 0.7)} /></g></g>
      <g {...A('drift', 23, -14, LIN)}><g transform="translate(0 28)"><path d="M0 0q2.5 -3 5 0q2.5 -3 5 0" {...A('flap', 0.6, -0.2)} /></g></g>
    </g>
    <path d="M0 88V62C30 50 60 56 90 64C120 54 140 54 160 62V88Z" fill="#2a1634" />
    <g fill="#160e20">
      <path d="M26 64q10 -4 22 0v3H26Z" />
      <path d="M30 66l-1 8M34 66l0 8M42 66l0 8M46 66l1 8" stroke="#160e20" strokeWidth="1.2" />
      <g {...A('nod', 6, 0, { transformOrigin: '10% 100%' })}>
        <path d="M44 64q4 -9 8 -10l2 2q-3 3 -4 8Z" />
        <path d="M52 54q3 -3 5 -1l-1 3Z" />
        <path d="M54 52l-1 -5m1 5l3 -4m-3 4l-3 -3" stroke="#160e20" strokeWidth=".9" strokeLinecap="round" fill="none" />
      </g>
    </g>
    <circle cx="50" cy="56" r="11" fill="none" stroke="#fff3d6" strokeWidth=".7" strokeDasharray="2 2.4" opacity=".75" {...A('spin', 12, 0, LIN)} />
    <path d="M50 42v5M50 65v5M38 56h5M57 56h5" stroke="#fff3d6" strokeWidth=".8" strokeLinecap="round" opacity=".7" />
    <path d="M0 88V74C40 68 80 76 160 70V88Z" fill="#0f1a2c" />
    <g stroke="#0f1a2c" strokeWidth="1.6" strokeLinecap="round" fill="none">
      <path d="M12 88L10 76" {...A('sway', 3.2, 0, BASE)} />
      <path d="M18 88L19 74" {...A('sway', 3.8, -1, BASE)} />
      <path d="M124 88L122 76" {...A('sway', 3.4, -2, BASE)} />
      <path d="M132 88L134 74" {...A('sway', 4, -0.5, BASE)} />
      <path d="M142 88L140 78" {...A('sway', 3.6, -1.5, BASE)} />
      <path d="M90 88L88 80" {...A('sway', 3.9, -2.5, BASE)} />
    </g>
    <circle cx="72" cy="66" r="1" fill="#ffd8a0" {...A('fire', 6, -1)} />
    <circle cx="150" cy="64" r="1" fill="#ffd8a0" {...A('fire', 7, -3)} />
  </svg>
);

const Crimen = () => (
  <svg {...ancho}>
    <defs>
      <linearGradient id="dvk-l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe9b0" stopOpacity=".5" /><stop offset="1" stopColor="#ffe9b0" stopOpacity="0" /></linearGradient>
    </defs>
    <path d="M70 70L214 34L214 106Z" fill="url(#dvk-l)" {...A('sweep', 7, 0, { transformOrigin: '0% 50%' })} />
    <path d="M178 11a10 10 0 1 0 0 18a8 8 0 1 1 0 -18Z" fill="#ffe9c4" opacity=".9" />
    <ellipse cx="150" cy="16" rx="18" ry="3.4" fill="#fff" opacity=".12" {...A('mist', 12)} />
    <path d="M96 76V52L110 44L124 52V76ZM126 76V40H146V76ZM148 76V54L160 46L174 54V76ZM176 76V34H196V76ZM198 76V50H220V76Z" fill="#150d1a" opacity=".92" />
    <g fill="#ffd28a">
      <rect x="130" y="46" width="3" height="3" {...A('tw', 3.2)} />
      <rect x="138" y="58" width="3" height="3" {...A('tw', 4, -1)} />
      <rect x="180" y="40" width="3" height="3" {...A('tw', 3.6, -2)} />
      <rect x="204" y="58" width="3" height="3" {...A('tw', 4.4, -0.5)} />
    </g>
    <rect x="105" y="56" width="9" height="9" rx="1" fill="#05030a" />
    <g fill="#fff">
      <ellipse cx="108" cy="60" rx="1.1" ry="1.5" {...A('blink', 5)} />
      <ellipse cx="112" cy="60" rx="1.1" ry="1.5" {...A('blink', 5)} />
    </g>
    <g style={{ '--dx': '-6px', '--rot': '320deg' }}><circle cx="162" cy="0" r="2.6" fill="#ffd35c" stroke="#b8862a" strokeWidth=".8" {...A('fall', 4, -0.4)} /></g>
    <g style={{ '--dx': '4px', '--rot': '-260deg' }}><circle cx="188" cy="0" r="2.2" fill="#ffd35c" stroke="#b8862a" strokeWidth=".8" {...A('fall', 5, -2.4)} /></g>
    <g style={{ '--dx': '-3px', '--rot': '200deg' }}><circle cx="208" cy="0" r="2.4" fill="#ffd35c" stroke="#b8862a" strokeWidth=".8" {...A('fall', 4.6, -1.4)} /></g>
  </svg>
);

const Diaria = () => (
  <svg {...ancho}>
    <g {...A('spin', 40, 0, LIN)}>
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d="M178 40L170 -30L186 -30Z" fill="#ffe3c8" opacity=".13" transform={`rotate(${i * 36} 178 40)`} />
      ))}
    </g>
    <g>
      <rect x="164" y="40" width="28" height="22" rx="2" fill="#f1b896" />
      <rect x="176" y="40" width="4" height="22" fill="#fff3d6" />
      <g {...A('lid', 3.2, 0, BASE)}>
        <rect x="161" y="33" width="34" height="9" rx="2" fill="#e08c6e" />
        <rect x="176" y="33" width="4" height="9" fill="#fff3d6" />
        <path d="M178 33c-6 -9 -14 -4 -8 0c4 2 8 0 8 0c0 0 4 2 8 0c6 -4 -2 -9 -8 0Z" fill="#fff3d6" />
      </g>
    </g>
    <g>
      <g style={{ '--dx': '-8px', '--rot': '260deg' }}><rect x="132" y="-4" width="4" height="6" fill="#ffd28a" {...A('fall', 5, -0.5)} /></g>
      <g style={{ '--dx': '10px', '--rot': '-300deg' }}><rect x="150" y="-4" width="4" height="6" fill="#8fc4ad" {...A('fall', 6, -2)} /></g>
      <g style={{ '--dx': '-6px', '--rot': '220deg' }}><rect x="170" y="-4" width="4" height="6" fill="#b69be0" {...A('fall', 5.4, -3.2)} /></g>
      <g style={{ '--dx': '12px', '--rot': '-240deg' }}><rect x="190" y="-4" width="4" height="6" fill="#f48fb1" {...A('fall', 6.2, -1)} /></g>
      <g style={{ '--dx': '-10px', '--rot': '300deg' }}><rect x="206" y="-4" width="4" height="6" fill="#ffd28a" {...A('fall', 5.6, -4)} /></g>
      <g style={{ '--dx': '8px', '--rot': '-200deg' }}><rect x="120" y="-4" width="4" height="6" fill="#8fb4d6" {...A('fall', 6.6, -3.6)} /></g>
    </g>
    <Brillo x={156} y={30} s={1.2} t={2.4} color="#fff3d6" />
    <Brillo x={202} y={22} d={-1} t={2.8} color="#fff3d6" />
    <Brillo x={146} y={58} s={0.8} d={-1.8} t={2.6} color="#fff3d6" />
    <Brillo x={206} y={56} s={0.9} d={-0.6} t={3} color="#fff3d6" />
  </svg>
);

const Trabajo = () => (
  <svg {...ancho}>
    <Engranaje cx={176} cy={34} r={16} t={14} />
    <Engranaje cx={203} cy={54} r={10} inv t={9.3} color="#d9cdf2" />
    <Engranaje cx={150} cy={58} r={8} inv t={7.4} color="#a99bd0" />
    <g>
      <ellipse cx="116" cy="66" rx="12" ry="3.6" fill="#e0b96a" />
      <rect x="104" y="60" width="24" height="6" fill="#e0b96a" />
      <ellipse cx="116" cy="60" rx="12" ry="3.6" fill="#f3d68c" />
      <ellipse cx="116" cy="54" rx="12" ry="3.6" fill="#e0b96a" />
      <rect x="104" y="48" width="24" height="6" fill="#e0b96a" />
      <g {...A('hop', 2.8)}>
        <ellipse cx="116" cy="48" rx="12" ry="3.6" fill="#f3d68c" />
        <path d="M116 44v7" stroke="#b8862a" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </g>
    <Brillo x={132} y={40} t={2.6} color="#fff3d6" />
    <Brillo x={102} y={44} s={0.8} d={-1.3} t={2.9} color="#fff3d6" />
    <circle cx="190" cy="14" r="1.4" fill="#fff" {...A('rise', 3.6, 0, { '--o': 0.6 })} />
  </svg>
);

const Mazmorra = () => (
  <svg {...banner}>
    <defs>
      <pattern id="dvz-p" width="20" height="10" patternUnits="userSpaceOnUse">
        <rect width="20" height="10" fill="#1d2634" />
        <path d="M0 .5H20M0 5.5H20M10 .5V5.5M0 5.5V10M20 5.5V10" stroke="#0e131b" strokeWidth=".9" fill="none" />
      </pattern>
      <radialGradient id="dvz-t"><stop offset="0" stopColor="#ffb25a" stopOpacity=".55" /><stop offset="1" stopColor="#ffb25a" stopOpacity="0" /></radialGradient>
      <linearGradient id="dvz-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05070b" /><stop offset="1" stopColor="#141c2a" /></linearGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvz-p)" />
    <path d="M52 88V42A28 28 0 0 1 108 42V88Z" fill="url(#dvz-d)" stroke="#3a465c" strokeWidth="3" />
    <g fill="#222d40">
      <rect x="58" y="78" width="44" height="10" />
      <rect x="62" y="70" width="36" height="8" fill="#1a2433" />
      <rect x="67" y="63" width="26" height="7" fill="#141c2a" />
      <rect x="72" y="57" width="16" height="6" fill="#0e1520" />
    </g>
    <g fill="#ff4d4d">
      <ellipse cx="76" cy="50" rx="1.8" ry="1.2" {...A('blink', 6)} />
      <ellipse cx="84" cy="50" rx="1.8" ry="1.2" {...A('blink', 6)} />
    </g>
    <circle cx="80" cy="50" r="7" fill="#ff4d4d" opacity=".08" {...A('pulse', 3)} />
    {[28, 132].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy="38" r="22" fill="url(#dvz-t)" {...A('pulse', 2.2, -i)} />
        <rect x={x - 1.4} y="38" width="2.8" height="16" fill="#5a3a22" />
        <g {...A('flick', 0.85, -i * 0.3, BASE)}>
          <path d={`M${x} 27C${x + 4} 32 ${x + 4} 37 ${x} 40C${x - 4} 37 ${x - 4} 32 ${x} 27Z`} fill="#ff9d4a" />
          <path d={`M${x} 32C${x + 2} 35 ${x + 2} 38 ${x} 39C${x - 2} 38 ${x - 2} 35 ${x} 32Z`} fill="#fff0c0" />
        </g>
      </g>
    ))}
    <circle cx="44" cy="30" r=".9" fill="#ffd9a8" opacity=".7" {...A('bob', 4)} />
    <circle cx="120" cy="22" r=".9" fill="#ffd9a8" opacity=".7" {...A('bob', 5, -2)} />
    <circle cx="14" cy="50" r=".8" fill="#ffd9a8" opacity=".6" {...A('bob', 4.5, -1)} />
  </svg>
);

const Figura = ({ x, y, d = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <g {...A('bob', 5, d)}>
      <circle cx="0" cy="-9" r="4.2" fill="#0e0a16" stroke="#ffb25a" strokeOpacity=".35" strokeWidth=".7" />
      <path d="M-8 6q0 -10 8 -10q8 0 8 10Z" fill="#0e0a16" stroke="#ffb25a" strokeOpacity=".35" strokeWidth=".7" />
    </g>
  </g>
);

const Sala = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvs-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1430" /><stop offset="1" stopColor="#3a2536" /></linearGradient>
      <radialGradient id="dvs-g"><stop offset="0" stopColor="#ffb25a" stopOpacity=".6" /><stop offset="1" stopColor="#ffb25a" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvs-f)" />
    <Estrellas pts={[[16, 10, 0.9, 0], [44, 22, 0.7, 1], [72, 8, 0.8, 2], [108, 16, 0.7, 0.5], [138, 8, 0.9, 1.5], [150, 30, 0.7, 2.5]]} />
    <path d="M0 88V70C30 62 60 70 90 68C120 64 140 66 160 70V88Z" fill="#150f1e" />
    <circle cx="80" cy="66" r="38" fill="url(#dvs-g)" {...A('pulse', 2.2)} />
    <Figura x={30} y={72} />
    <Figura x={130} y={72} d={-2} />
    <Figura x={52} y={78} d={-1} />
    <Figura x={110} y={78} d={-3} />
    <rect x="68" y="74" width="26" height="3.4" rx="1.7" fill="#4a2c1a" transform="rotate(10 81 76)" />
    <rect x="66" y="74" width="26" height="3.4" rx="1.7" fill="#5c3822" transform="rotate(-10 79 76)" />
    <g {...A('flick', 0.8, 0, BASE)}>
      <path d="M80 50C88 59 88 68 80 74C72 68 72 59 80 50Z" fill="#ff8a3d" />
      <path d="M80 58C84 63 84 69 80 73C76 69 76 63 80 58Z" fill="#ffc15e" />
    </g>
    <g {...A('flick', 0.7, -0.3, BASE)}>
      <path d="M88 62C91 66 91 70 88 73C85 70 85 66 88 62Z" fill="#ffb25a" />
    </g>
    <circle cx="78" cy="58" r="1" fill="#ffd28a" {...A('ember', 3.2)} />
    <circle cx="84" cy="60" r="1" fill="#ffb25a" {...A('ember', 3.8, -1.2)} />
    <circle cx="80" cy="62" r=".8" fill="#ffd28a" {...A('ember', 4.4, -2.4)} />
    <circle cx="86" cy="64" r=".9" fill="#ffb25a" {...A('ember', 3.4, -0.6)} />
  </svg>
);

const Raid = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvr-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a0f1c" /><stop offset=".6" stopColor="#6a1e31" /><stop offset="1" stopColor="#1a0a14" /></linearGradient>
      <radialGradient id="dvr-m"><stop offset="0" stopColor="#ff7a8a" stopOpacity=".55" /><stop offset="1" stopColor="#ff7a8a" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvr-f)" />
    <circle cx="80" cy="44" r="40" fill="url(#dvr-m)" {...A('pulse', 3.4)} />
    <circle cx="80" cy="44" r="17" fill="#c9626f" opacity=".6" />
    <ellipse cx="32" cy="16" rx="30" ry="7" fill="#12060d" opacity=".85" {...A('mist', 12)} />
    <ellipse cx="128" cy="24" rx="34" ry="7" fill="#12060d" opacity=".85" {...A('mist', 15, -7)} />
    <path d="M104 0L96 24L105 24L93 52" stroke="#ffe9a8" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0" {...A('flash', 6)} />
    <rect width="160" height="88" fill="#ffd0c8" opacity="0" {...A('flashbg', 6)} />
    <g {...A('breathe', 4, 0, BASE)}>
      <path d="M48 88V64Q48 40 80 34Q112 40 112 64V88Z" fill="#0b0508" />
      <path d="M54 46Q40 30 46 12Q58 30 66 42Z" fill="#0b0508" />
      <path d="M106 46Q120 30 114 12Q102 30 94 42Z" fill="#0b0508" />
      <path d="M64 62L68 68L72 62L76 68L80 62L84 68L88 62L92 68L96 62" stroke="#c9626f" strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity=".8" />
    </g>
    <path d="M62 50L72 54L72 57L62 54Z" fill="#ff5252" {...A('pulse', 2.2)} />
    <path d="M98 50L88 54L88 57L98 54Z" fill="#ff5252" {...A('pulse', 2.2)} />
    <g fill="#0b0508">
      <g {...A('bob', 2.4)}><rect x="14" y="76" width="4" height="9" /><circle cx="16" cy="73" r="2.6" /><path d="M20 70L26 62" stroke="#0b0508" strokeWidth="1.6" strokeLinecap="round" /></g>
      <g {...A('bob', 2.8, -1)}><rect x="140" y="76" width="4" height="9" /><circle cx="142" cy="73" r="2.6" /><path d="M138 70L132 62" stroke="#0b0508" strokeWidth="1.6" strokeLinecap="round" /></g>
    </g>
  </svg>
);

const Encuentro = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dve-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2748" /><stop offset="1" stopColor="#1a1525" /></linearGradient>
      <radialGradient id="dve-l"><stop offset="0" stopColor="#ffd9a0" stopOpacity=".7" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dve-f)" />
    <Estrellas pts={[[20, 12, 0.8, 0], [56, 20, 0.7, 1], [100, 10, 0.9, 2], [140, 22, 0.7, 0.6]]} />
    <circle cx="120" cy="20" r="8" fill="#ffe3d3" opacity=".85" />
    <g fill="#120d1c">
      <g {...A('sway', 8, 0, BASE)}><path d="M-4 88L14 30L32 88Z" /><path d="M2 66L14 40L26 66Z" fill="#1a1428" /></g>
      <g {...A('sway', 9, -3, BASE)}><path d="M126 88L146 24L166 88Z" /></g>
      <g {...A('sway', 7, -2, BASE)}><path d="M28 88L40 50L52 88Z" /></g>
      <g {...A('sway', 8, -5, BASE)}><path d="M108 88L120 54L132 88Z" /></g>
    </g>
    <path d="M58 88L74 44L86 44L102 88Z" fill="#3b2a45" />
    <path d="M70 88L78 50L82 50L90 88Z" fill="#4c3659" opacity=".7" />
    <ellipse cx="80" cy="70" rx="48" ry="6" fill="#d8c8f0" opacity=".12" {...A('mist', 12)} />
    <ellipse cx="60" cy="52" rx="30" ry="4" fill="#d8c8f0" opacity=".1" {...A('mist', 16, -7)} />
    <path d="M16 20Q40 18 66 24" stroke="#120d1c" strokeWidth="2" fill="none" />
    <g {...A('swing', 3.4, 0, TOP)}>
      <path d="M52 22V30" stroke="#6b4a2a" strokeWidth="1" />
      <circle cx="52" cy="36" r="13" fill="url(#dve-l)" {...A('pulse', 2.4)} />
      <rect x="49" y="30" width="6" height="9" rx="1.2" fill="#2a1c22" stroke="#c9a063" strokeWidth=".8" />
      <rect x="50.4" y="31.6" width="3.2" height="5.4" rx=".8" fill="#ffd28a" />
    </g>
    <text x="96" y="46" textAnchor="middle" fontSize="22" fontWeight="800" fill="#ffe3d3" fontFamily="Fraunces, Georgia, serif" {...A('bob', 3.2)}>?</text>
    <circle cx="70" cy="62" r="1.2" fill="#f8f2a0" {...A('fire', 6)} />
    <circle cx="110" cy="70" r="1.2" fill="#f8f2a0" {...A('fire', 7, -3)} />
    <circle cx="34" cy="74" r="1.1" fill="#f8f2a0" {...A('fire', 6.5, -1)} />
  </svg>
);

const Carta = ({ x, y, rot, fill, borde, d }) => (
  <g transform={`rotate(${rot} 80 70)`}>
    <g {...A('bob', 3.4, d)}>
      <rect x={x} y={y} width="24" height="34" rx="3" fill={fill} stroke={borde} strokeWidth="1.2" />
      <rect x={x + 3} y={y + 3} width="18" height="28" rx="2" fill="none" stroke={borde} strokeOpacity=".5" strokeWidth=".7" />
      <path d={`M${x + 12} ${y + 10}L${x + 14} ${y + 15}L${x + 19} ${y + 17}L${x + 14} ${y + 19}L${x + 12} ${y + 24}L${x + 10} ${y + 19}L${x + 5} ${y + 17}L${x + 10} ${y + 15}Z`} fill={borde} opacity=".9" />
    </g>
  </g>
);

const Gacha = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvg-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2766" /><stop offset="1" stopColor="#150f26" /></linearGradient>
      <radialGradient id="dvg-g"><stop offset="0" stopColor="#d7c4ff" stopOpacity=".6" /><stop offset="1" stopColor="#d7c4ff" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvg-f)" />
    <g {...A('spin', 36, 0, LIN)}>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M80 46L74 -40L86 -40Z" fill="#cdb8ff" opacity=".12" transform={`rotate(${i * 45} 80 46)`} />
      ))}
    </g>
    <circle cx="80" cy="48" r="36" fill="url(#dvg-g)" {...A('pulse', 3.2)} />
    <Estrellas color="#e9dcff" pts={[[12, 14, 1, 0], [36, 40, 0.8, 1], [140, 16, 1, 2], [128, 50, 0.8, 0.5], [60, 10, 0.8, 1.5], [102, 12, 0.7, 2.5], [20, 66, 0.8, 0.8], [146, 70, 0.8, 1.8]]} />
    <Carta x={68} y={32} rot={-20} fill="#4f3a8c" borde="#cdb8ff" d={-0.6} />
    <Carta x={68} y={32} rot={20} fill="#2f6f93" borde="#a8dcff" d={-1.4} />
    <Carta x={68} y={30} rot={0} fill="#6a4fb0" borde="#ffd98a" d={0} />
    <Brillo x={52} y={34} s={1.2} t={2.4} color="#ffe9b0" />
    <Brillo x={112} y={30} d={-1} t={2.6} color="#ffe9b0" />
    <Brillo x={104} y={64} s={0.9} d={-1.8} t={2.8} color="#ffe9b0" />
    <Brillo x={50} y={62} s={0.8} d={-0.6} t={3} color="#ffe9b0" />
  </svg>
);

const Clan = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvl-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2347" /><stop offset=".6" stopColor="#c9758a" /><stop offset="1" stopColor="#f0b97a" /></linearGradient>
      <radialGradient id="dvl-s"><stop offset="0" stopColor="#ffe3b0" stopOpacity=".7" /><stop offset="1" stopColor="#ffe3b0" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvl-f)" />
    <circle cx="124" cy="62" r="34" fill="url(#dvl-s)" {...A('pulse', 4.4)} />
    <circle cx="124" cy="62" r="13" fill="#ffe3b0" opacity=".92" />
    <ellipse cx="34" cy="26" rx="22" ry="4" fill="#f6c9a0" opacity=".4" {...A('mist', 13)} />
    <ellipse cx="108" cy="16" rx="26" ry="4" fill="#f6c9a0" opacity=".35" {...A('mist', 17, -8)} />
    <path d="M0 88V70C30 64 60 72 160 68V88Z" fill="#1d1226" />
    <g fill="#1a0f24">
      <path d="M30 88V52H36V48H42V52H48V48H54V52H60V88Z" />
      <path d="M62 88V34H68V30H74V34H80V30H86V34H92V88Z" />
      <path d="M94 88V54H100V50H106V54H112V50H118V54H124V88Z" />
      <path d="M56 88V64H98V88Z" />
      <path d="M60 64V58H66V64M70 64V58H76V64M80 64V58H86V64M90 64V58H96V64" />
    </g>
    <path d="M70 88V76A7 7 0 0 1 84 76V88Z" fill="#05030a" />
    <g stroke="#1a0f24" strokeWidth="1" fill="none">
      <path d="M77 30V16" /><path d="M45 48V38" /><path d="M109 50V40" />
    </g>
    <path d="M77 16L92 20.5L77 25Z" fill="#e0b96a" {...A('wag', 1.8, 0, { transformOrigin: '0% 50%' })} />
    <path d="M45 38L56 41.5L45 45Z" fill="#c9626f" {...A('wag', 1.6, -0.6, { transformOrigin: '0% 50%' })} />
    <path d="M109 40L120 43.5L109 47Z" fill="#8fb4d6" {...A('wag', 1.9, -0.3, { transformOrigin: '0% 50%' })} />
    <g fill="#ffd28a">
      <rect x="75" y="42" width="3" height="5" {...A('tw', 3)} />
      <rect x="82" y="42" width="3" height="5" {...A('tw', 3.6, -1)} />
      <rect x="38" y="60" width="3" height="4" {...A('tw', 4, -2)} />
      <rect x="102" y="62" width="3" height="4" {...A('tw', 3.4, -0.5)} />
    </g>
    <g {...A('drift', 19, -6, LIN)}><g transform="translate(0 22)"><path d="M0 0q3 -3 6 0q3 -3 6 0" stroke="#2a1634" strokeWidth="1.1" fill="none" {...A('flap', 0.8)} /></g></g>
  </svg>
);

const Mundial = () => {
  const continentes = (dx) => (
    <g transform={`translate(${dx} 0)`} fill="#3f9a6a">
      <path d="M60 34q8 -6 16 -2q6 4 2 10q-6 4 -10 10q-6 2 -8 -4q-4 -8 0 -14Z" />
      <path d="M86 52q8 -4 14 2q2 8 -4 12q-8 2 -10 -6q-2 -4 0 -8Z" />
      <path d="M108 30q10 -4 18 2q4 6 -2 10q-8 2 -12 -2q-6 -4 -4 -10Z" />
      <path d="M130 46q6 -2 10 2q2 6 -4 8q-6 0 -8 -4q-1 -4 2 -6Z" />
    </g>
  );
  return (
    <svg {...banner}>
      <defs>
        <linearGradient id="dvw-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1730" /><stop offset="1" stopColor="#16305a" /></linearGradient>
        <radialGradient id="dvw-a"><stop offset=".6" stopColor="#6fb4ff" stopOpacity=".4" /><stop offset="1" stopColor="#6fb4ff" stopOpacity="0" /></radialGradient>
        <radialGradient id="dvw-s" cx=".34" cy=".3" r=".8"><stop offset=".4" stopColor="#04102a" stopOpacity="0" /><stop offset="1" stopColor="#04102a" stopOpacity=".7" /></radialGradient>
        <clipPath id="dvw-c"><circle cx="80" cy="44" r="26" /></clipPath>
      </defs>
      <rect width="160" height="88" fill="url(#dvw-f)" />
      <Estrellas color="#cfe6ff" pts={[[14, 12, 0.9, 0], [36, 70, 0.8, 1], [140, 14, 1, 2], [146, 66, 0.8, 0.5], [58, 8, 0.7, 1.5], [112, 10, 0.7, 2.5], [22, 40, 0.7, 0.8], [132, 40, 0.7, 1.8]]} />
      <circle cx="80" cy="44" r="38" fill="url(#dvw-a)" {...A('pulse', 4)} />
      <circle cx="80" cy="44" r="26" fill="#1f5a9a" />
      <g clipPath="url(#dvw-c)">
        <g {...A('globe', 30, 0, LIN)}>
          {continentes(-10)}
          {continentes(90)}
        </g>
        <circle cx="80" cy="44" r="26" fill="url(#dvw-s)" />
      </g>
      <ellipse cx="80" cy="44" rx="42" ry="9" fill="none" stroke="#9fd0ff" strokeOpacity=".4" strokeWidth=".8" transform="rotate(-18 80 44)" />
      <g transform="rotate(-18 80 44)">
        <g {...A('orb', 9, 0, LIN)}>
          <circle cx="80" cy="44" r="2.2" fill="#ffe9b0" />
          <circle cx="80" cy="44" r="5" fill="#ffe9b0" opacity=".25" />
        </g>
      </g>
      <Brillo x={30} y={28} t={2.8} color="#cfe6ff" />
      <Brillo x={134} y={58} s={0.9} d={-1.4} t={3} color="#cfe6ff" />
    </svg>
  );
};

const Encargos = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvn-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c4a48" /><stop offset="1" stopColor="#101c1b" /></linearGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvn-f)" />
    <Estrellas color="#dff5ea" pts={[[16, 10, 0.8, 0], [52, 18, 0.7, 1], [96, 8, 0.8, 2], [146, 14, 0.8, 0.6]]} />
    <path d="M0 88V68C40 62 80 68 160 64V88Z" fill="#0c1514" />
    <g fill="#0f1c1b">
      <path d="M8 76V52L22 42L36 52V76Z" />
      <path d="M118 76V50L134 38L150 50V76Z" />
      <path d="M92 76V58L102 52L112 58V76Z" />
      <rect x="28" y="36" width="5" height="12" />
    </g>
    <g fill="#ffd28a">
      <rect x="17" y="56" width="5" height="6" {...A('tw', 3.4)} />
      <rect x="126" y="52" width="6" height="7" {...A('tw', 4, -1)} />
      <rect x="138" y="58" width="5" height="6" {...A('tw', 3.6, -2)} />
      <rect x="99" y="60" width="4" height="5" {...A('tw', 4.4, -0.5)} />
    </g>
    <circle cx="30.5" cy="34" r="2.4" fill="#cfe8e0" {...A('rise', 4.2, 0, { '--o': 0.5 })} />
    <circle cx="31" cy="34" r="2" fill="#cfe8e0" {...A('rise', 4.2, -2.1, { '--o': 0.5 })} />
    <rect x="46" y="54" width="3" height="24" fill="#4a3220" />
    <rect x="84" y="54" width="3" height="24" fill="#4a3220" />
    <rect x="42" y="42" width="48" height="26" rx="2" fill="#6a4a2e" stroke="#3a2616" strokeWidth="1.4" />
    <g {...A('sway', 3.4, 0, TOP)}><rect x="47" y="46" width="15" height="18" rx="1" fill="#f3e3b8" /><path d="M50 52H59M50 56H59M50 60H55" stroke="#9a7a4a" strokeWidth="1" /><circle cx="54.5" cy="47" r="1.2" fill="#c9626f" /></g>
    <g {...A('sway', 4, -1.4, TOP)}><rect x="68" y="47" width="16" height="16" rx="1" fill="#e8d6a2" /><path d="M71 53H81M71 57H81" stroke="#9a7a4a" strokeWidth="1" /><circle cx="76" cy="48" r="1.2" fill="#8fb4d6" /></g>
    <g {...A('swing', 4, 0, TOP)}>
      <path d="M66 28V34" stroke="#6b4a2a" strokeWidth="1" />
      <circle cx="66" cy="38" r="9" fill="#ffd28a" opacity=".3" {...A('pulse', 2.6)} />
      <rect x="63.5" y="34" width="5" height="7" rx="1" fill="#ffd28a" />
    </g>
    <path d="M62 28H72" stroke="#4a3220" strokeWidth="1.6" />
    <g>
      <rect x="132" y="70" width="12" height="9" fill="#5a3d26" stroke="#3a2616" />
      <rect x="140" y="64" width="10" height="9" fill="#6a4a2e" stroke="#3a2616" />
    </g>
  </svg>
);

const Alquimia = () => (
  <svg {...banner}>
    <defs>
      <linearGradient id="dvq-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f3330" /><stop offset="1" stopColor="#0b1313" /></linearGradient>
      <radialGradient id="dvq-g"><stop offset="0" stopColor="#7dffb0" stopOpacity=".6" /><stop offset="1" stopColor="#7dffb0" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="160" height="88" fill="url(#dvq-f)" />
    <rect x="0" y="30" width="160" height="3" fill="#3a2a1c" />
    {[[22, '#b69be0'], [44, '#e8946a'], [116, '#8fb4d6'], [138, '#e0b96a']].map(([x, c], i) => (
      <g key={x}>
        <circle cx={x} cy="20" r="11" fill={c} opacity=".22" {...A('pulse', 3 + i * 0.4, -i)} />
        <rect x={x - 2} y="12" width="4" height="6" fill="#cfe6e0" opacity=".8" />
        <path d={`M${x - 6} 30Q${x - 7} 22 ${x - 2} 18H${x + 2}Q${x + 7} 22 ${x + 6} 30Z`} fill={c} opacity=".75" />
      </g>
    ))}
    <ellipse cx="80" cy="76" rx="26" ry="4" fill="#000" opacity=".4" />
    <g {...A('flick', 0.8, 0, BASE)}>
      <path d="M62 76C66 69 68 66 64 62C70 65 72 70 70 76Z" fill="#ff8a3d" />
      <path d="M88 76C92 69 94 66 90 62C96 65 98 70 96 76Z" fill="#ff8a3d" />
      <path d="M76 76C80 67 82 64 80 58C86 64 88 70 84 76Z" fill="#ffc15e" />
    </g>
    <circle cx="80" cy="50" r="30" fill="url(#dvq-g)" {...A('pulse', 2.6)} />
    <path d="M52 52Q52 74 80 74Q108 74 108 52Z" fill="#161b1f" />
    <path d="M56 56Q58 70 80 71" stroke="#2c353b" strokeWidth="2" fill="none" />
    <ellipse cx="80" cy="52" rx="28" ry="6" fill="#0e1215" />
    <ellipse cx="80" cy="52" rx="24" ry="4.6" fill="#5ff0a0" />
    <ellipse cx="80" cy="51.4" rx="24" ry="4.2" fill="none" stroke="#d9ffe9" strokeOpacity=".5" strokeWidth=".7" {...A('shim', 2.4)} />
    <circle cx="70" cy="52" r="2.4" fill="#d9ffe9" opacity=".8" {...A('bub', 2.8)} />
    <circle cx="82" cy="53" r="3" fill="#d9ffe9" opacity=".8" {...A('bub', 3.4, -1.1)} />
    <circle cx="90" cy="52" r="2" fill="#d9ffe9" opacity=".8" {...A('bub', 2.6, -2)} />
    <circle cx="76" cy="52" r="1.6" fill="#d9ffe9" opacity=".8" {...A('bub', 3, -0.5)} />
    <ellipse cx="74" cy="42" rx="5" ry="3" fill="#cfe8e0" {...A('rise', 3.4, 0, { '--o': 0.3 })} />
    <ellipse cx="86" cy="42" rx="6" ry="3.4" fill="#cfe8e0" {...A('rise', 4, -1.6, { '--o': 0.25 })} />
    <ellipse cx="80" cy="42" rx="4" ry="2.6" fill="#cfe8e0" {...A('rise', 3.8, -2.6, { '--o': 0.28 })} />
    <Brillo x={50} y={44} s={0.9} t={2.6} color="#d9ffe9" />
    <Brillo x={112} y={46} s={0.8} d={-1.3} t={2.8} color="#d9ffe9" />
  </svg>
);

const ESCENAS = {
  minar: Minar, talar: Talar, pescar: Pescar, cazar: Cazar,
  crimen: Crimen, daily: Diaria, work: Trabajo,
  mazmorra: Mazmorra, sala: Sala, raid: Raid, encuentro: Encuentro, gacha: Gacha,
  clan: Clan, mundial: Mundial, encargos: Encargos, alquimia: Alquimia
};

let observador = null;
function obtener() {
  if (observador || typeof IntersectionObserver === 'undefined') return observador;
  observador = new IntersectionObserver(lista => {
    for (const x of lista) {
      if (x.isIntersecting) x.target.removeAttribute('data-off');
      else x.target.setAttribute('data-off', '');
    }
  }, { rootMargin: '60px' });
  return observador;
}

function Decor({ k, clase }) {
  const ref = useRef(null);
  useEffect(() => {
    const o = obtener();
    const el = ref.current;
    if (!o || !el) return undefined;
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  const Escena = ESCENAS[k];
  if (!Escena) return null;
  return <div ref={ref} className={'deco' + (clase ? ' ' + clase : '')} data-d={k} aria-hidden="true"><Escena /></div>;
}

export default memo(Decor);
