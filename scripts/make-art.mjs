import { mkdirSync, writeFileSync } from 'node:fs';

const out = 'public/art';
mkdirSync(out, { recursive: true });

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SERIF = "Georgia, 'Times New Roman', serif";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const defs = (a = '#7fb2ff', b = '#58aec9', gold = '#c9a96e') => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#08111f"/>
      <stop offset="0.55" stop-color="#05080e"/>
      <stop offset="1" stop-color="#0a1526"/>
    </linearGradient>
    <radialGradient id="halo">
      <stop offset="0" stop-color="${a}" stop-opacity=".22"/>
      <stop offset="0.55" stop-color="${a}" stop-opacity=".06"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="${b}" stroke-opacity=".07" stroke-width=".7"/>
    </pattern>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#ffffff" opacity=".018"/>
    </pattern>
    <filter id="soft"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10Z" fill="${a}"/>
    </marker>
    <marker id="arrow-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10Z" fill="${gold}"/>
    </marker>
  </defs>`;

const frame = (w, h, a, label = 'MATHEESAN.CA / SYSTEM ART', right = 'VECTOR / 2026') => `
  <rect width="${w}" height="${h}" fill="#05080e"/>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect x="20" y="20" width="${w - 40}" height="${h - 40}" fill="none" stroke="${a}" stroke-opacity=".3"/>
  <rect x="20" y="20" width="${w - 40}" height="${h - 40}" fill="url(#scan)"/>
  <path d="M20 52V32H40M${w - 20} 52V32H${w - 40}M20 ${h - 52}V${h - 32}H40M${w - 20} ${h - 52}V${h - 32}H${w - 40}" fill="none" stroke="${a}" stroke-opacity=".8" stroke-width="1.2"/>
  <text x="44" y="48" font-family="${MONO}" font-size="10" letter-spacing="2.2" fill="${a}">${esc(label)}</text>
  <text x="${w - 44}" y="48" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1.8" fill="#6b82a5">${esc(right)}</text>`;

const text = (x, y, value, size = 12, fill = '#8ba0bf', opts = '') =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${fill}" letter-spacing="1.2" ${opts}>${esc(value)}</text>`;

const serif = (x, y, value, size = 42, fill = '#dce6f5', opts = '') =>
  `<text x="${x}" y="${y}" font-family="${SERIF}" font-size="${size}" fill="${fill}" ${opts}>${esc(value)}</text>`;

const box = (x, y, w, h, label, sub = '', color = '#7fb2ff', fill = 'rgba(8,17,31,.86)') => `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${color}" stroke-opacity=".5"/>
    <path d="M${x} ${y + 10}V${y}H${x + 12}M${x + w - 12} ${y}H${x + w}V${y + 10}M${x} ${y + h - 10}V${y + h}H${x + 12}M${x + w - 12} ${y + h}H${x + w}V${y + h - 10}" fill="none" stroke="${color}" stroke-opacity=".9"/>
    <text x="${x + 12}" y="${y + 24}" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${color}">${esc(label)}</text>
    ${sub ? `<text x="${x + 12}" y="${y + 42}" font-family="${MONO}" font-size="8.5" letter-spacing=".6" fill="#6b82a5">${esc(sub)}</text>` : ''}
  </g>`;

const path = (d, color = '#7fb2ff', dash = '', marker = true, width = 1.2) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${dash ? `stroke-dasharray="${dash}"` : ''} ${marker ? 'marker-end="url(#arrow)"' : ''}/>`;

const dot = (x, y, r = 3, color = '#7fb2ff') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;

/* ── Workbench diagram ─────────────────────────────────────── */
function workbench() {
  const w = 1200;
  const h = 700;
  const a = '#7fb2ff';
  const gold = '#c9a96e';
  const green = '#7ee0b8';
  const silos = [
    ['DATA LAKE', 'structured + unstructured', 148],
    ['TICKETS', 'JIRA / workstreams', 228],
    ['DOCS / SPECS', 'contracts + context', 308],
    ['REPOS / CI', 'code + builds', 388],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(a, '#58aec9', gold)}
  ${frame(w, h, a, 'AGENTIC WORKBENCH / SYSTEM MAP', 'CASE 00 / REPLICANT')}
  <circle cx="520" cy="300" r="230" fill="url(#halo)"/>
  <text x="54" y="100" font-family="${SERIF}" font-size="44" fill="#dce6f5">The agentic workbench.</text>
  <text x="56" y="124" font-family="${MONO}" font-size="10" letter-spacing="2" fill="#6b82a5">ONE ENGINE / MULTI-SILO / OVERNIGHT / GATED</text>

  <text x="54" y="180" font-family="${MONO}" font-size="9" letter-spacing="1.6" fill="${a}">INPUTS</text>
  ${silos.map(([label, sub, y]) => box(54, y, 168, 58, label, sub, '#58aec9')).join('')}
  ${silos.map(([, , y]) => path(`M222 ${y + 29}H236`, '#58aec9', '', false)).join('')}

  <rect x="236" y="130" width="42" height="330" fill="rgba(8,17,31,.9)" stroke="#58aec9" stroke-opacity=".55"/>
  <text transform="rotate(-90 257 300)" x="257" y="300" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="2" fill="#58aec9">PLUGIN BUS</text>
  ${[158, 238, 318, 398].map((y) => dot(257, y, 3.5, '#58aec9')).join('')}
  <text x="286" y="150" font-family="${MONO}" font-size="9" fill="${gold}">MCP / PLUGINS</text>

  ${path('M278 300 C350 300 390 300 455 300', a)}
  <text x="324" y="286" font-family="${MONO}" font-size="8" fill="#6b82a5">tool calls</text>

  <g filter="url(#glow)">
    <circle cx="520" cy="300" r="132" fill="none" stroke="${a}" stroke-opacity=".28" stroke-dasharray="2 7"/>
    <circle cx="520" cy="300" r="105" fill="rgba(8,17,31,.94)" stroke="${a}" stroke-opacity=".8"/>
    <circle cx="520" cy="300" r="78" fill="none" stroke="${a}" stroke-opacity=".2"/>
  </g>
  <text x="520" y="284" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2" fill="${a}">ENGINE</text>
  <text x="520" y="326" text-anchor="middle" font-family="${SERIF}" font-size="46" fill="#dce6f5">M.</text>
  <text x="520" y="350" text-anchor="middle" font-family="${MONO}" font-size="8" letter-spacing="1.4" fill="#6b82a5">ORCHESTRATION</text>
  ${[0, 60, 120, 180, 240, 300].map((deg) => {
    const r = 132;
    const x = 520 + Math.cos((deg * Math.PI) / 180) * r;
    const y = 300 + Math.sin((deg * Math.PI) / 180) * r;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${a}"/>`;
  }).join('')}

  ${box(760, 122, 176, 76, 'DEEPSEEK', 'reasoning / planning', gold)}
  ${box(760, 218, 176, 76, 'CLAUDE', 'build / review / tool use', gold)}
  ${path('M650 270 C700 270 718 160 754 160', gold)}
  ${path('M650 330 C700 330 718 256 754 256', gold)}
  <text x="680" y="186" font-family="${MONO}" font-size="8" fill="#6b82a5">LLM</text>
  <text x="680" y="292" font-family="${MONO}" font-size="8" fill="#6b82a5">LLM</text>

  <rect x="760" y="350" width="176" height="190" fill="rgba(8,17,31,.9)" stroke="${green}" stroke-opacity=".55"/>
  <text x="774" y="374" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${green}">GATES</text>
  <text x="774" y="390" font-family="${MONO}" font-size="8" fill="#6b82a5">FAIL CLOSED</text>
  ${[0, 1, 2].map((i) => {
    const y = 414 + i * 38;
    const labels = ['PERMISSIONS', 'TESTS + EVALS', 'HUMAN APPROVAL'];
    return `<g><rect x="774" y="${y}" width="148" height="28" fill="rgba(126,224,184,.045)" stroke="${green}" stroke-opacity=".28"/><text x="786" y="${y + 18}" font-family="${MONO}" font-size="8" letter-spacing="1" fill="#8ba0bf">${labels[i]}</text><circle cx="908" cy="${y + 14}" r="3" fill="${green}"/></g>`;
  }).join('')}
  ${path('M650 330 C700 330 705 420 754 420', green)}
  <text x="674" y="400" font-family="${MONO}" font-size="8" fill="#6b82a5">verify</text>

  ${[
    ['PLAN', 122],
    ['SCOPE', 194],
    ['BUILD', 266],
    ['JIRA', 338],
    ['REVIEW', 410],
  ].map(([label, y], i) => box(998, y, 148, 54, label, i === 4 ? 'human in the loop' : 'gated output', i === 4 ? green : a)).join('')}
  ${[149, 221, 293, 365, 437].map((y) => path(`M936 ${y}H990`, y === 437 ? green : a, '', true)).join('')}
  ${path('M760 398 C700 398 700 300 650 300', green, '4 5', false)}

  <line x1="54" y1="540" x2="1146" y2="540" stroke="${a}" stroke-opacity=".2"/>
  <text x="54" y="570" font-family="${MONO}" font-size="9" letter-spacing="2" fill="${a}">OVERNIGHT LOOP</text>
  ${[
    ['22:00', 'PLAN'],
    ['00:00', 'SCOPE'],
    ['02:00', 'BUILD'],
    ['04:00', 'JIRA'],
    ['06:00', 'GATE'],
    ['07:00', 'HUMAN'],
  ].map(([time, label], i) => {
    const x = 200 + i * 158;
    return `<g><circle cx="${x}" cy="540" r="4" fill="${i === 5 ? green : a}"/><text x="${x}" y="566" text-anchor="middle" font-family="${MONO}" font-size="8" fill="${i === 5 ? green : '#8ba0bf'}">${time}</text><text x="${x}" y="584" text-anchor="middle" font-family="${MONO}" font-size="8" letter-spacing="1.6" fill="#6b82a5">${label}</text></g>`;
  }).join('')}
  <text x="54" y="646" font-family="${MONO}" font-size="9" letter-spacing="1.5" fill="#6b82a5">BUILT SOLO / OWN HARNESSES / ONE ENGINE</text>
  <text x="1146" y="646" text-anchor="end" font-family="${MONO}" font-size="9" letter-spacing="1.5" fill="${gold}">STATUS: ORG-WIDE</text>
  </svg>`;
}

/* ── Homelab topology ──────────────────────────────────────── */
function homelab() {
  const w = 1200;
  const h = 700;
  const a = '#4fffd0';
  const gold = '#c9a96e';
  const blue = '#7df9ff';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(a, '#58aec9', gold)}
  ${frame(w, h, a, 'HOMELAB / MOON-01 / TOPOLOGY', 'NOT TO SCALE')}
  <text x="54" y="100" font-family="${SERIF}" font-size="44" fill="#dce6f5">A production lab under the moon.</text>
  <text x="56" y="124" font-family="${MONO}" font-size="10" letter-spacing="2" fill="#6b82a5">LOCAL INFERENCE / COMPUTER VISION / STORAGE / IDENTITY</text>

  <rect x="56" y="160" width="336" height="330" fill="rgba(8,17,31,.88)" stroke="${a}" stroke-opacity=".5"/>
  <text x="76" y="190" font-family="${MONO}" font-size="12" letter-spacing="1.6" fill="${a}">PROXMOX</text>
  <text x="76" y="208" font-family="${MONO}" font-size="9" fill="#6b82a5">AMD RYZEN 9 5900X / 128 GB</text>
  ${box(76, 228, 296, 80, 'RTX A2000 12 GB', 'CUDA / Ollama / Whisper / ComfyUI', gold)}
  ${box(76, 324, 136, 64, 'OLLAMA', 'local inference', a)}
  ${box(236, 324, 136, 64, 'IMMICH ML', 'face + object', a)}
  ${box(76, 404, 136, 58, 'FRIGATE', '9 cameras', a)}
  ${box(236, 404, 136, 58, 'WHISPER', 'transcription', a)}

  ${box(456, 292, 172, 108, '10G SWITCH', 'VLAN 10 / 20 / 30 / 40', blue)}
  ${path('M392 320 C420 320 430 340 450 340', a)}
  ${path('M392 350 C420 350 430 350 450 350', a)}
  ${path('M392 430 C420 430 430 380 450 372', a)}

  ${box(456, 460, 172, 96, '22 TB ZFS', 'TORNADO + SNAPSHOTS', gold)}
  ${path('M456 480 C420 480 410 440 392 400', gold, '4 5')}

  ${box(760, 120, 380, 88, 'FRIGATE NVR', '9 cameras / object recognition / alerts', a)}
  ${box(760, 228, 180, 88, 'IMMICH', 'photos / face / timeline', a)}
  ${box(960, 228, 180, 88, 'JELLYFIN', 'media / invite-only', a)}
  ${box(760, 336, 380, 88, 'AUTHENTIK', 'SSO / OIDC / access policy', gold)}
  ${box(760, 444, 380, 82, 'OBSERVABILITY', 'Grafana / Prometheus / Uptime Kuma', blue)}
  ${path('M628 320 C680 320 700 164 754 164', a)}
  ${path('M628 330 C680 330 700 272 754 272', a)}
  ${path('M628 350 C680 350 700 380 754 380', gold)}
  ${path('M628 370 C680 370 700 480 754 480', blue)}
  ${path('M940 272H954', a, '3 5', false)}
  ${dot(628, 350, 4, a)}

  ${text(56, 548, 'NETWORK', 9, a)}
  ${text(56, 570, '10G core / 2.5G uplink / WireGuard / Tailscale', 9, '#8ba0bf')}
  ${text(56, 600, 'STORAGE', 9, gold)}
  ${text(56, 622, '22 TB ZFS / snapshots / offsite backup', 9, '#8ba0bf')}
  ${text(744, 548, 'ACCESS', 9, gold)}
  ${text(744, 570, 'Authentik SSO / invite-only / least privilege', 9, '#8ba0bf')}
  ${text(744, 600, 'STATUS', 9, a)}
  ${text(744, 622, 'nominal / monitored / backed up', 9, '#8ba0bf')}
  <line x1="54" y1="520" x2="1146" y2="520" stroke="${a}" stroke-opacity=".2"/>
  <text x="1146" y="646" text-anchor="end" font-family="${MONO}" font-size="9" letter-spacing="1.5" fill="${a}">MOON-01 / ALWAYS ON</text>
  </svg>`;
}

/* ── Covers ─────────────────────────────────────────────────── */
function cover({ title, sub, accent, accent2, art, right = '800 / 800' }) {
  const w = 800;
  const h = 800;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(accent, accent2)}
  ${frame(w, h, accent, 'MATHEESAN / THE CRATE', right)}
  ${art}
  <text x="56" y="662" font-family="${MONO}" font-size="11" letter-spacing="2.2" fill="${accent}">${esc(sub)}</text>
  <text x="56" y="724" font-family="${SERIF}" font-size="64" fill="#dce6f5">${esc(title)}</text>
  <text x="744" y="724" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#6b82a5">SPOTIFY / PUBLIC</text>
  </svg>`;
}

const covers = {
  'cover-lock-in.svg': cover({
    title: 'Lock In',
    sub: '08 TRACKS / FOCUS MODE',
    accent: '#ff4fd8',
    accent2: '#7df9ff',
    art: `
      <g filter="url(#glow)">
        <circle cx="400" cy="350" r="228" fill="none" stroke="#ff4fd8" stroke-opacity=".28"/>
        <circle cx="400" cy="350" r="164" fill="none" stroke="#7df9ff" stroke-opacity=".22"/>
        <circle cx="400" cy="350" r="96" fill="rgba(255,79,216,.05)" stroke="#ff4fd8" stroke-opacity=".8"/>
      </g>
      ${Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r1 = 116;
        const r2 = i % 3 === 0 ? 204 : 160;
        const x1 = 400 + Math.cos(angle) * r1;
        const y1 = 350 + Math.sin(angle) * r1;
        const x2 = 400 + Math.cos(angle) * r2;
        const y2 = 350 + Math.sin(angle) * r2;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ff4fd8" stroke-opacity="${i % 3 === 0 ? '.65' : '.22'}"/>`;
      }).join('')}
      <text x="400" y="338" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="3" fill="#7df9ff">FOCUS</text>
      <text x="400" y="386" text-anchor="middle" font-family="${SERIF}" font-size="48" fill="#dce6f5">01</text>
      <rect x="338" y="412" width="124" height="2" fill="#ff4fd8" opacity=".7"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${268 + i * 23}" y="${450 - (i % 5) * 9}" width="9" height="${18 + (i % 5) * 9}" fill="#ff4fd8" opacity="${.25 + (i % 4) * .18}"/>`).join('')}
    `,
  }),
  'cover-games.svg': cover({
    title: 'Games',
    sub: '48 TRACKS / BOSS FIGHTS + RACING',
    accent: '#a8ff60',
    accent2: '#ffd166',
    art: `
      <g opacity=".7">
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${120 + i * 70} 200L${400} 340L${680 - i * 70} 200" stroke="#a8ff60" stroke-opacity=".16" fill="none"/>`).join('')}
        ${Array.from({ length: 5 }, (_, i) => `<path d="M${160 + i * 120} 470L400 330L${640 - i * 120} 470" stroke="#ffd166" stroke-opacity=".12" fill="none"/>`).join('')}
      </g>
      <rect x="238" y="250" width="324" height="186" rx="28" fill="rgba(8,17,31,.92)" stroke="#a8ff60" stroke-opacity=".75"/>
      <rect x="278" y="286" width="84" height="30" rx="6" fill="#a8ff60" opacity=".22"/>
      <rect x="278" y="286" width="30" height="30" rx="6" fill="#a8ff60" opacity=".8"/>
      <circle cx="500" cy="310" r="14" fill="none" stroke="#ffd166" stroke-width="2"/>
      <circle cx="470" cy="310" r="14" fill="none" stroke="#ffd166" stroke-width="2"/>
      <path d="M278 370H522" stroke="#a8ff60" stroke-opacity=".35"/>
      <path d="M300 370V394M500 370V394" stroke="#a8ff60" stroke-opacity=".6"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${284 + i * 28}" y="${186 - (i % 3) * 18}" width="16" height="${16 + (i % 3) * 18}" fill="${i % 2 ? '#ffd166' : '#a8ff60'}" opacity=".6"/>`).join('')}
      <path d="M160 520L400 450L640 520" stroke="#a8ff60" stroke-opacity=".5" fill="none"/>
      <path d="M160 544L400 474L640 544" stroke="#ffd166" stroke-opacity=".35" fill="none"/>
      <text x="400" y="610" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="4" fill="#a8ff60">PRESS START</text>
    `,
  }),
  'cover-mixxx.svg': cover({
    title: 'Mixxx',
    sub: '22 TRACKS / GLOBAL BASS / DANCEHALL',
    accent: '#ff4fd8',
    accent2: '#ffd166',
    art: `
      ${Array.from({ length: 7 }, (_, i) => `<path d="M60 ${300 + i * 26} C180 ${220 + i * 26} 300 ${380 + i * 26} 420 ${300 + i * 26} C540 ${220 + i * 26} 660 ${380 + i * 26} 740 ${300 + i * 26}" fill="none" stroke="${i % 2 ? '#ffd166' : '#ff4fd8'}" stroke-opacity="${.18 + i * .07}" stroke-width="${1 + i * .25}"/>`).join('')}
      <circle cx="400" cy="350" r="150" fill="rgba(8,17,31,.78)" stroke="#ff4fd8" stroke-opacity=".5"/>
      <circle cx="400" cy="350" r="110" fill="none" stroke="#ffd166" stroke-opacity=".4" stroke-dasharray="2 6"/>
      <text x="400" y="338" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="3" fill="#ff4fd8">BASS</text>
      <text x="400" y="382" text-anchor="middle" font-family="${SERIF}" font-size="42" fill="#dce6f5">140</text>
      <text x="400" y="406" text-anchor="middle" font-family="${MONO}" font-size="8" letter-spacing="2" fill="#6b82a5">BPM</text>
      ${Array.from({ length: 18 }, (_, i) => `<rect x="${140 + i * 30}" y="${520 - (i % 6) * 12}" width="12" height="${20 + (i % 6) * 12}" fill="${i % 3 ? '#ff4fd8' : '#ffd166'}" opacity="${.2 + (i % 4) * .12}"/>`).join('')}
    `,
  }),
  'cover-lumiere.svg': cover({
    title: 'Lumiere',
    sub: '101 TRACKS / THE LONG LIBRARY',
    accent: '#b48cff',
    accent2: '#7df9ff',
    art: `
      <g filter="url(#glow)">
        <circle cx="570" cy="260" r="120" fill="rgba(180,140,255,.08)" stroke="#b48cff" stroke-opacity=".8"/>
        <circle cx="570" cy="260" r="86" fill="rgba(180,140,255,.1)"/>
      </g>
      ${Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const x = 570 + Math.cos(angle) * 180;
        const y = 260 + Math.sin(angle) * 180;
        return `<line x1="570" y1="260" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#b48cff" stroke-opacity=".18"/>`;
      }).join('')}
      ${Array.from({ length: 26 }, (_, i) => {
        const x = 100 + ((i * 137.5) % 600);
        const y = 150 + ((i * 73.3) % 380);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${1 + (i % 3)}" fill="#7df9ff" opacity="${.2 + (i % 4) * .15}"/>`;
      }).join('')}
      <path d="M80 540C220 480 300 570 440 500C580 430 650 500 720 470" fill="none" stroke="#b48cff" stroke-opacity=".45"/>
      <path d="M80 566C240 506 320 596 460 526C600 456 670 526 720 496" fill="none" stroke="#7df9ff" stroke-opacity=".3"/>
      <text x="570" y="250" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="3" fill="#b48cff">LUMIERE</text>
      <text x="570" y="286" text-anchor="middle" font-family="${SERIF}" font-size="30" fill="#dce6f5">101</text>
    `,
  }),
};

/* ── Game key art ──────────────────────────────────────────── */
function gameArt({ title, tag, accent, accent2, art }) {
  const w = 1200;
  const h = 675;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(accent, accent2)}
  ${frame(w, h, accent, 'MATHEESAN / GAME KEY ART', tag)}
  ${art}
  <text x="56" y="624" font-family="${MONO}" font-size="10" letter-spacing="2.2" fill="${accent}">${esc(title)} / THE ROTATION</text>
  <text x="1144" y="624" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1.6" fill="#6b82a5">NO RANK / JUST PLAY</text>
  </svg>`;
}

const games = {
  'game-elden-ring.svg': gameArt({
    title: 'Elden Ring',
    tag: 'THE BENCHMARK',
    accent: '#c9a96e',
    accent2: '#82a9d6',
    art: `
      <circle cx="760" cy="270" r="220" fill="url(#halo)"/>
      <g filter="url(#glow)">
        <path d="M620 180 A180 180 0 0 1 900 180" fill="none" stroke="#c9a96e" stroke-width="18" stroke-opacity=".55"/>
        <path d="M640 170 A160 160 0 0 1 880 170" fill="none" stroke="#c9a96e" stroke-width="2" stroke-opacity=".9" stroke-dasharray="3 8"/>
        <path d="M690 150 A120 120 0 0 1 830 150" fill="none" stroke="#82a9d6" stroke-width="1" stroke-opacity=".5"/>
      </g>
      <path d="M720 520V300M760 520V240M800 520V320M840 520V270" stroke="#0a1526" stroke-width="18"/>
      <path d="M700 520 C740 470 760 500 780 440 C800 380 820 460 850 400" stroke="#c9a96e" stroke-opacity=".2" fill="none" stroke-width="2"/>
      <path d="M0 540 C260 500 380 570 620 535 C860 500 980 550 1200 520" stroke="#1b3a5c" fill="none"/>
      <path d="M0 568 C260 528 380 598 620 563 C860 528 980 578 1200 548" stroke="#82a9d6" stroke-opacity=".5" fill="none"/>
      <g fill="#05080e" stroke="#c9a96e" stroke-opacity=".6">
        <circle cx="560" cy="470" r="10"/>
        <path d="M550 480V520M560 480V520M550 495L540 515M560 495L570 515"/>
      </g>
      <text x="620" y="290" font-family="${MONO}" font-size="10" letter-spacing="3" fill="#c9a96e">SHATTERED</text>
      <text x="620" y="316" font-family="${SERIF}" font-size="34" fill="#dce6f5">ring</text>
    `,
  }),
  'game-wukong.svg': gameArt({
    title: 'Black Myth: Wukong',
    tag: 'CURRENT WALL',
    accent: '#ffb347',
    accent2: '#ff4f4f',
    art: `
      <circle cx="830" cy="250" r="180" fill="url(#halo)"/>
      <circle cx="830" cy="250" r="128" fill="#ff4f4f" opacity=".16"/>
      <circle cx="830" cy="250" r="112" fill="none" stroke="#ffb347" stroke-opacity=".55"/>
      <path d="M300 570L700 110" stroke="#ffb347" stroke-width="8" stroke-opacity=".55"/>
      <path d="M316 584L716 124" stroke="#ffd166" stroke-width="1.4" stroke-opacity=".8"/>
      <circle cx="700" cy="110" r="14" fill="none" stroke="#ffd166" stroke-width="3"/>
      <path d="M90 470C220 420 320 500 440 450C560 400 650 470 760 430" fill="none" stroke="#ffb347" stroke-opacity=".35"/>
      <path d="M70 500C220 450 320 530 460 480C600 430 680 500 800 460" fill="none" stroke="#ffd166" stroke-opacity=".22"/>
      <path d="M0 580L220 470L360 540L540 430L760 520L960 410L1200 500V675H0Z" fill="#0a1526" opacity=".8"/>
      <path d="M0 596L220 486L360 556L540 446L760 536L960 426L1200 516" fill="none" stroke="#ffb347" stroke-opacity=".25"/>
      <text x="610" y="330" font-family="${MONO}" font-size="10" letter-spacing="3" fill="#ffb347">CLOUD / STAFF</text>
      <text x="610" y="360" font-family="${SERIF}" font-size="34" fill="#dce6f5">rise</text>
    `,
  }),
  'game-mario-kart.svg': gameArt({
    title: 'Mario Kart',
    tag: 'COMFORT GAME',
    accent: '#7df9ff',
    accent2: '#ff4fd8',
    art: `
      <circle cx="600" cy="300" r="260" fill="url(#halo)"/>
      <path d="M120 560C260 430 400 440 540 360C680 280 800 300 1080 180" fill="none" stroke="#7df9ff" stroke-opacity=".3" stroke-width="42"/>
      <path d="M120 560C260 430 400 440 540 360C680 280 800 300 1080 180" fill="none" stroke="#05080e" stroke-width="18"/>
      <path d="M120 560C260 430 400 440 540 360C680 280 800 300 1080 180" fill="none" stroke="#ff4fd8" stroke-width="1.6" stroke-dasharray="4 12"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const x = 130 + i * 62;
        const y = 540 - i * 21;
        return `<rect x="${x}" y="${y}" width="26" height="26" fill="${i % 2 ? '#7df9ff' : '#ff4fd8'}" opacity="${.15 + (i % 3) * .12}"/>`;
      }).join('')}
      <g transform="translate(500 330) rotate(-18)">
        <rect x="0" y="0" width="150" height="70" rx="18" fill="#0a1526" stroke="#7df9ff" stroke-opacity=".8"/>
        <circle cx="36" cy="76" r="20" fill="#05080e" stroke="#7df9ff"/>
        <circle cx="116" cy="76" r="20" fill="#05080e" stroke="#7df9ff"/>
        <circle cx="58" cy="24" r="12" fill="#ff4fd8" opacity=".7"/>
        <path d="M20 34H64" stroke="#7df9ff" stroke-opacity=".5"/>
      </g>
      <path d="M660 300C720 250 760 320 820 270" fill="none" stroke="#7df9ff" stroke-opacity=".6" stroke-width="3"/>
      <path d="M650 320C730 270 770 340 840 290" fill="none" stroke="#ff4fd8" stroke-opacity=".4" stroke-width="1.5"/>
      <text x="140" y="210" font-family="${MONO}" font-size="10" letter-spacing="3" fill="#7df9ff">LAST LAP</text>
      <text x="140" y="246" font-family="${SERIF}" font-size="34" fill="#dce6f5">never over</text>
    `,
  }),
  'game-valorant.svg': gameArt({
    title: 'Valorant',
    tag: 'AIM TRAINING',
    accent: '#ff4655',
    accent2: '#7df9ff',
    art: `
      <circle cx="600" cy="300" r="260" fill="url(#halo)"/>
      <g opacity=".7">
        <path d="M100 180H500V520H100Z" fill="none" stroke="#ff4655" stroke-opacity=".18"/>
        <path d="M760 120H1100V560H760Z" fill="none" stroke="#7df9ff" stroke-opacity=".18"/>
        <path d="M100 180L500 520M500 180L100 520M760 120L1100 560M1100 120L760 560" stroke="#ff4655" stroke-opacity=".1"/>
      </g>
      <g stroke="#ff4655" stroke-width="2">
        <circle cx="600" cy="300" r="90" fill="none" stroke-opacity=".7"/>
        <circle cx="600" cy="300" r="40" fill="none" stroke-opacity=".5"/>
        <path d="M600 190V410M490 300H710" stroke-opacity=".5"/>
        <path d="M600 260V340M560 300H640" stroke-width="5"/>
      </g>
      <circle cx="600" cy="300" r="5" fill="#ff4655"/>
      <path d="M220 430L360 380L450 430L360 480Z" fill="none" stroke="#7df9ff" stroke-opacity=".4"/>
      <path d="M780 220L930 160L1040 210L900 280Z" fill="none" stroke="#ff4655" stroke-opacity=".35"/>
      <text x="760" y="470" font-family="${MONO}" font-size="10" letter-spacing="3" fill="#ff4655">CROSSHAIR</text>
      <text x="720" y="502" font-family="${SERIF}" font-size="30" fill="#dce6f5">hold the line</text>
    `,
  }),
  'game-overwatch.svg': gameArt({
    title: 'Overwatch',
    tag: 'TEAM FIGHT',
    accent: '#ff9f43',
    accent2: '#7df9ff',
    art: `
      <circle cx="600" cy="300" r="250" fill="url(#halo)"/>
      <g filter="url(#glow)">
        <circle cx="600" cy="290" r="170" fill="none" stroke="#ff9f43" stroke-opacity=".35" stroke-width="2"/>
        <circle cx="600" cy="290" r="120" fill="none" stroke="#7df9ff" stroke-opacity=".3" stroke-dasharray="2 8"/>
      </g>
      ${Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = 600 + Math.cos(angle) * 170;
        const y = 290 + Math.sin(angle) * 170;
        return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l26 -46h52l26 46 -26 46h-52Z" fill="none" stroke="${i % 2 ? '#ff9f43' : '#7df9ff'}" stroke-opacity=".35"/>`;
      }).join('')}
      <path d="M430 300C480 200 560 180 600 180C640 180 720 200 770 300C720 400 640 420 600 420C560 420 480 400 430 300Z" fill="rgba(8,17,31,.75)" stroke="#ff9f43" stroke-opacity=".55"/>
      <text x="600" y="282" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="4" fill="#7df9ff">TEAM</text>
      <text x="600" y="326" text-anchor="middle" font-family="${SERIF}" font-size="44" fill="#dce6f5">ult</text>
      <path d="M200 500C320 440 440 540 560 480C680 420 780 520 1000 440" fill="none" stroke="#ff9f43" stroke-opacity=".25"/>
      <text x="140" y="200" font-family="${MONO}" font-size="10" letter-spacing="3" fill="#ff9f43">TOUCH THE POINT</text>
    `,
  }),
};

/* ── About studies ─────────────────────────────────────────── */
function study({ title, sub, accent, art }) {
  const w = 900;
  const h = 600;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs(accent, '#58aec9')}
  ${frame(w, h, accent, 'VISUAL STUDY / MATHEESAN', 'VECTOR / 2026')}
  ${art}
  <text x="44" y="550" font-family="${MONO}" font-size="10" letter-spacing="2.2" fill="${accent}">${esc(sub)}</text>
  <text x="856" y="550" text-anchor="end" font-family="${SERIF}" font-size="34" fill="#dce6f5">${esc(title)}</text>
  </svg>`;
}

const studies = {
  'study-moon.svg': study({
    title: 'moon.',
    sub: 'MATHEE / MOON / ORBITAL STUDY 01',
    accent: '#82a9d6',
    art: `
      <ellipse cx="450" cy="300" rx="300" ry="120" fill="none" stroke="#82a9d6" stroke-opacity=".25" transform="rotate(-18 450 300)"/>
      <ellipse cx="450" cy="300" rx="220" ry="80" fill="none" stroke="#c9a96e" stroke-opacity=".3" transform="rotate(-18 450 300)"/>
      ${[0, 1, 2, 3, 4].map((i) => {
        const x = 170 + i * 140;
        const r = i === 2 ? 44 : 28;
        return `<g><circle cx="${x}" cy="280" r="${r}" fill="rgba(130,169,214,${i === 2 ? '.28' : '.1'})" stroke="#82a9d6" stroke-opacity=".6"/><circle cx="${x}" cy="280" r="${r + 10}" fill="none" stroke="#82a9d6" stroke-opacity=".14"/></g>`;
      }).join('')}
      <circle cx="450" cy="280" r="86" fill="none" stroke="#c9a96e" stroke-opacity=".3" stroke-dasharray="2 7"/>
      <text x="450" y="274" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="4" fill="#c9a96e">MATHEE</text>
      <text x="450" y="312" text-anchor="middle" font-family="${SERIF}" font-size="32" fill="#dce6f5">moon</text>
      ${Array.from({ length: 20 }, (_, i) => `<circle cx="${80 + (i * 137) % 740}" cy="${90 + (i * 71) % 380}" r="${1 + (i % 2)}" fill="#dce6f5" opacity=".35"/>`).join('')}
    `,
  }),
  'study-dragon.svg': study({
    title: 'dragon.',
    sub: 'YEAR OF THE DRAGON / LINE STUDY 02',
    accent: '#c9a96e',
    art: `
      <path d="M80 430C160 390 190 300 280 280C350 264 380 310 440 280C500 250 530 320 600 290C680 256 700 180 780 170C820 166 840 180 858 160" fill="none" stroke="#c9a96e" stroke-width="6" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M280 280C260 240 240 210 210 200C190 192 170 200 160 216" fill="none" stroke="#c9a96e" stroke-width="2" stroke-linecap="round"/>
      <path d="M440 280C470 240 490 210 520 200" fill="none" stroke="#c9a96e" stroke-width="2" stroke-linecap="round"/>
      <path d="M600 290C630 310 650 340 640 365" fill="none" stroke="#c9a96e" stroke-width="1.5"/>
      <circle cx="200" cy="190" r="5" fill="#c9a96e"/>
      <path d="M80 430C60 460 52 490 70 510C88 530 120 522 140 495" fill="none" stroke="#c9a96e" stroke-width="2"/>
      <path d="M80 460C120 480 160 470 190 500C220 530 260 540 300 520C340 500 380 510 420 530" fill="none" stroke="#82a9d6" stroke-opacity=".5"/>
      <path d="M80 486C140 506 180 496 220 526C260 556 320 560 370 540C420 520 470 530 520 550" fill="none" stroke="#82a9d6" stroke-opacity=".3"/>
      <text x="80" y="160" font-family="${MONO}" font-size="9" letter-spacing="3" fill="#c9a96e">DRAGON / WAVE / MOON</text>
    `,
  }),
  'study-wave.svg': study({
    title: 'wave.',
    sub: 'VARUNA / WAVE / SIGNAL STUDY 03',
    accent: '#4fffd0',
    art: `
      ${Array.from({ length: 8 }, (_, i) => `<path d="M60 ${260 + i * 22} C180 ${210 + i * 22} 260 ${310 + i * 22} 380 ${260 + i * 22} C500 ${210 + i * 22} 580 ${310 + i * 22} 700 ${260 + i * 22} C780 ${230 + i * 22} 820 ${250 + i * 22} 860 ${240 + i * 22}" fill="none" stroke="${i % 2 ? '#4fffd0' : '#82a9d6'}" stroke-opacity="${.12 + i * .05}" stroke-width="${1 + i * .2}"/>`).join('')}
      <circle cx="450" cy="290" r="130" fill="none" stroke="#4fffd0" stroke-opacity=".25" stroke-dasharray="2 8"/>
      <circle cx="450" cy="290" r="86" fill="none" stroke="#4fffd0" stroke-opacity=".4"/>
      <circle cx="450" cy="290" r="42" fill="rgba(79,255,208,.06)" stroke="#4fffd0" stroke-opacity=".6"/>
      <path d="M450 290L540 220" stroke="#4fffd0" stroke-width="1.4" opacity=".6"/>
      <circle cx="540" cy="220" r="4" fill="#4fffd0"/>
      <text x="450" y="284" text-anchor="middle" font-family="${MONO}" font-size="8" letter-spacing="3" fill="#4fffd0">VARUNA</text>
      <text x="450" y="316" text-anchor="middle" font-family="${SERIF}" font-size="30" fill="#dce6f5">waves</text>
      <text x="60" y="160" font-family="${MONO}" font-size="9" letter-spacing="3" fill="#4fffd0">SIGNAL / TIDE / RETURN</text>
    `,
  }),
};

/* ── Write files ───────────────────────────────────────────── */
const files = {
  'workbench-diagram.svg': workbench(),
  'lab-topology.svg': homelab(),
  ...covers,
  ...games,
  ...studies,
};

for (const [name, contents] of Object.entries(files)) {
  writeFileSync(`${out}/${name}`, contents);
  console.log(`wrote ${out}/${name}`);
}
