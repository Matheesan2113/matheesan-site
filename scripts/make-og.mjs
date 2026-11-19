// Renders public/og.png from an inline SVG.
// Requires a fontconfig with Cormorant Garamond, Space Mono and DM Sans installed:
//   FONTCONFIG_FILE=/path/to/fonts.conf node scripts/make-og.mjs
import sharp from 'sharp';

const stars = [
  [96,88,.8,.5],[204,195,.7,.4],[312,57,1,.6],[408,139,.6,.3],[492,82,.8,.5],
  [588,233,.9,.4],[684,50,.7,.5],[756,158,1.1,.6],[852,76,.6,.3],[936,246,.8,.4],
  [1032,107,1,.5],[1116,208,.7,.4],[144,303,.8,.4],[264,360,.6,.3],[372,271,.9,.5],
  [528,328,.7,.3],[648,297,.8,.4],[804,354,.6,.3],[888,278,.9,.4],[1056,330,.7,.3],
];

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="80%" cy="18%" r="60%">
      <stop offset="0%" stop-color="#285282" stop-opacity=".30"/>
      <stop offset="100%" stop-color="#285282" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bgGlow2" cx="10%" cy="90%" r="55%">
      <stop offset="0%" stop-color="#1b3a5c" stop-opacity=".26"/>
      <stop offset="100%" stop-color="#1b3a5c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="moon" cx="36%" cy="34%" r="70%">
      <stop offset="0%" stop-color="#eef4ff"/>
      <stop offset="28%" stop-color="#b8cee9"/>
      <stop offset="58%" stop-color="#6f96c2"/>
      <stop offset="100%" stop-color="#1a2a4a"/>
    </radialGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="22" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="#05080e"/>
  <rect width="1200" height="630" fill="url(#bgGlow)"/>
  <rect width="1200" height="630" fill="url(#bgGlow2)"/>

  <g fill="#cfe0ff">
    ${stars.map(([x,y,r,o]) => `<circle cx="${x}" cy="${y}" r="${r}" opacity="${o}"/>`).join('\n    ')}
  </g>

  <rect x="20" y="20" width="1160" height="590" fill="none" stroke="#58aec9" stroke-opacity=".18"/>

  <circle cx="1028" cy="190" r="126" fill="none" stroke="#58aec9" stroke-opacity=".09"/>
  <circle cx="1028" cy="190" r="100" fill="none" stroke="#7fa8d4" stroke-opacity=".14"/>
  <circle cx="1028" cy="190" r="88" fill="url(#moon)" filter="url(#glow)"/>

  <g fill="none" stroke="#cfe0ff" stroke-opacity=".07" stroke-linecap="round">
    <path d="M18,500 C54,466 74,412 132,394 C172,381 194,404 234,385 C274,366 294,338 334,329 C356,324 374,331 388,322" stroke-width="2.4"/>
    <path d="M132,394 C122,375 113,356 94,347 C85,343 76,348 72,357" stroke-width="1.6"/>
    <path d="M234,385 C244,367 254,349 264,340" stroke-width="1.6"/>
    <path d="M234,385 C248,394 258,407 254,421" stroke-width="1.2"/>
    <circle cx="90" cy="342" r="3.2" fill="#cfe0ff" stroke="none" opacity=".8"/>
  </g>

  <text x="72" y="92" font-family="Space Mono" font-size="12" letter-spacing="2.6" fill="#5d7395"><tspan fill="#58aec9">~</tspan> / matheesan.ca</text>

  <text x="70" y="218" font-family="Cormorant Garamond" font-size="118" fill="#dce6f5" letter-spacing="-2">Mathe<tspan fill="#82a9d6">esan</tspan><tspan fill="#c9a96e">.</tspan></text>

  <text x="72" y="290" font-family="Cormorant Garamond" font-size="35" fill="#d3e0f4">Engineer by day.</text>
  <text x="72" y="334" font-family="Cormorant Garamond" font-size="35" fill="#d3e0f4">DJ by night. Gamer in between.</text>

  <text x="72" y="412" font-family="Space Mono" font-size="11" letter-spacing="2" fill="#8ba0bf">MUSIC · <tspan fill="#c9a96e">GAMES</tspan> · AI SYSTEMS</text>

  <line x1="72" y1="454" x2="400" y2="454" stroke="#1c2f49"/>

  <g fill="none" stroke-linecap="round">
    <path d="M0,548 C180,514 280,578 430,556 C580,534 650,486 800,510 C950,534 1030,578 1200,540" stroke="#1b3a5c" stroke-width="1.5"/>
    <path d="M0,570 C160,540 300,596 460,574 C620,552 700,514 860,536 C1020,558 1090,588 1200,564" stroke="#4a9ebb" stroke-opacity=".26" stroke-width="1"/>
    <path d="M0,590 C220,560 340,608 520,588 C700,568 820,540 1000,560 C1100,571 1160,584 1200,578" stroke="#1e4d7a" stroke-opacity=".5" stroke-width="1"/>
  </g>

  <text x="72" y="594" font-family="Space Mono" font-size="10" letter-spacing="1.8" fill="#5d7395"><tspan fill="#7ee0b8">TAMIL-CANADIAN</tspan> · DJ · GAMER</text>
  <text x="1128" y="594" font-family="Space Mono" font-size="10" letter-spacing="1.6" fill="#5d7395" text-anchor="end">43.8561° N · 79.3370° W</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
console.log('wrote public/og.png');
