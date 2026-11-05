/* AI-themed reel symbols as inline SVG (no emoji, no paid assets). */
window.SLOT_SYMBOLS = {
  robot: {
    name: "Robot",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f6e7a2"/>
          <stop offset=".45" stop-color="#d4a017"/>
          <stop offset="1" stop-color="#7a4a00"/>
        </linearGradient>
        <linearGradient id="rv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7ef0ff"/>
          <stop offset="1" stop-color="#3d7dff"/>
        </linearGradient>
      </defs>
      <rect x="16" y="18" width="32" height="28" rx="8" fill="url(#rg)" stroke="#fff3c0" stroke-width="1.2"/>
      <rect x="20" y="24" width="24" height="12" rx="4" fill="#1a0d30"/>
      <circle cx="28" cy="30" r="3.2" fill="url(#rv)"/>
      <circle cx="36" cy="30" r="3.2" fill="url(#rv)"/>
      <circle cx="28" cy="29.2" r="1" fill="#fff"/>
      <circle cx="36" cy="29.2" r="1" fill="#fff"/>
      <rect x="26" y="40" width="12" height="2.4" rx="1.2" fill="#3a2060"/>
      <rect x="30.2" y="8" width="3.6" height="10" rx="1.2" fill="url(#rg)"/>
      <circle cx="32" cy="8" r="3.4" fill="#ffe27a" stroke="#fff6c8" stroke-width=".8"/>
      <rect x="12" y="26" width="5" height="10" rx="2" fill="url(#rg)"/>
      <rect x="47" y="26" width="5" height="10" rx="2" fill="url(#rg)"/>
    </svg>`
  },
  brain: {
    name: "Brain",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4c6ff"/>
          <stop offset=".45" stop-color="#c86bff"/>
          <stop offset="1" stop-color="#6b2aa8"/>
        </linearGradient>
      </defs>
      <path fill="url(#bg)" stroke="#ffe9a0" stroke-width="1.4" d="M31.5 14c-3.2-5-14-3.4-16.2 5.2C9.6 20.4 7 28 11 36c2 4.2 6.4 7 12.2 7.6 1.6 3.6 4.6 6.4 8.3 6.4V14z"/>
      <path fill="url(#bg)" stroke="#ffe9a0" stroke-width="1.4" d="M32.5 14c3.2-5 14-3.4 16.2 5.2C54.4 20.4 57 28 53 36c-2 4.2-6.4 7-12.2 7.6-1.6 3.6-4.6 6.4-8.3 6.4V14z"/>
      <path fill="none" stroke="#ffe9a0" stroke-width="1.5" stroke-linecap="round" d="M32 15v33"/>
      <path fill="none" stroke="#f8d8ff" stroke-width="1.5" stroke-linecap="round" d="M22 22c4 2.6 6 2.6 9 0M19 30c5 3 8 3 12 0M21 38c3.6 2.4 6.6 2.4 10 0"/>
      <path fill="none" stroke="#f8d8ff" stroke-width="1.5" stroke-linecap="round" d="M42 22c-4 2.6-6 2.6-9 0M45 30c-5 3-8 3-12 0M43 38c-3.6 2.4-6.6 2.4-10 0"/>
      <circle cx="20" cy="18" r="2" fill="#fff6c8"/>
      <circle cx="44" cy="18" r="2" fill="#fff6c8"/>
    </svg>`
  },
  chip: {
    name: "Chip",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#b8fff0"/>
          <stop offset=".5" stop-color="#1ec8a0"/>
          <stop offset="1" stop-color="#0a5a48"/>
        </linearGradient>
      </defs>
      <rect x="18" y="18" width="28" height="28" rx="4" fill="#1a2440" stroke="url(#cg)" stroke-width="2"/>
      <rect x="24" y="24" width="16" height="16" rx="2" fill="url(#cg)"/>
      <rect x="27" y="27" width="10" height="10" rx="1" fill="#083028"/>
      <g stroke="#f0e0a0" stroke-width="1.6" stroke-linecap="round">
        <path d="M22 14v4M27 14v4M32 14v4M37 14v4M42 14v4"/>
        <path d="M22 46v4M27 46v4M32 46v4M37 46v4M42 46v4"/>
        <path d="M14 22h4M14 27h4M14 32h4M14 37h4M14 42h4"/>
        <path d="M46 22h4M46 27h4M46 32h4M46 37h4M46 42h4"/>
      </g>
    </svg>`
  },
  bulb: {
    name: "Idea",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="lg" cx=".35" cy=".3" r=".7">
          <stop offset="0" stop-color="#fff6c8"/>
          <stop offset=".5" stop-color="#ffd24a"/>
          <stop offset="1" stop-color="#c47a00"/>
        </radialGradient>
      </defs>
      <path fill="url(#lg)" stroke="#fff3c0" stroke-width="1.2" d="M32 8c-9 0-16 7.2-16 16.4 0 6.2 3.4 11.2 8.4 14.2v3.2h15.2v-3.2c5-3 8.4-8 8.4-14.2C48 15.2 41 8 32 8z"/>
      <path fill="none" stroke="#7a4a00" stroke-width="1.6" stroke-linecap="round" d="M29 24c0-3 2.4-5 5.4-5 1.6 0 3 .6 4 1.6"/>
      <path d="M32 22v10" stroke="#7a4a00" stroke-width="1.6" stroke-linecap="round"/>
      <rect x="24.5" y="42" width="15" height="4" rx="1" fill="#e6c86a"/>
      <rect x="25.5" y="46.5" width="13" height="3.4" rx="1" fill="#c4a44a"/>
      <rect x="26.5" y="50.4" width="11" height="4.2" rx="1.4" fill="#8a6a28"/>
      <path d="M20 16l-4-5M44 16l4-5M16 26h-6M48 26h6" stroke="#ffe27a" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  },
  spark: {
    name: "Spark",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="sg" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#fff"/>
          <stop offset=".35" stop-color="#ffe27a"/>
          <stop offset="1" stop-color="#ff8a1a"/>
        </radialGradient>
      </defs>
      <path fill="url(#sg)" stroke="#fff6c8" stroke-width=".8" d="M32 4l5.4 18.2L56 22 40.8 33.6 47 54 32 42.2 17 54l6.2-20.4L8 22l18.6.2z"/>
      <path fill="#fff6c8" opacity=".9" d="M32 18l2.2 8.2L43 27l-7 5.2 2.6 8.6L32 35.6 25.4 40.8 28 32.2 21 27l8.8-.8z"/>
    </svg>`
  },
  coin: {
    name: "Coin",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="og" cx=".35" cy=".3" r=".75">
          <stop offset="0" stop-color="#fff6c8"/>
          <stop offset=".4" stop-color="#ffd24a"/>
          <stop offset="1" stop-color="#9a5a00"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="34" rx="22" ry="22" fill="#7a4a00" opacity=".35"/>
      <circle cx="32" cy="32" r="22" fill="url(#og)" stroke="#fff3c0" stroke-width="1.4"/>
      <circle cx="32" cy="32" r="16.5" fill="none" stroke="#a06a10" stroke-width="1.6"/>
      <circle cx="32" cy="32" r="14.5" fill="none" stroke="#ffe9a0" stroke-width=".8" opacity=".85"/>
      <path fill="#8a5a00" stroke="#fff4c0" stroke-width=".6" d="M32 19.5l3.2 8.4 8.8.6-6.8 5.6 2.2 8.6L32 37.8l-7.4 4.9 2.2-8.6-6.8-5.6 8.8-.6z"/>
      <ellipse cx="24" cy="24" rx="7" ry="4" fill="#fff" opacity=".35"/>
    </svg>`
  },
  seven: {
    name: "Seven",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="7g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffd0d0"/>
          <stop offset=".35" stop-color="#ff3b4a"/>
          <stop offset="1" stop-color="#7a0010"/>
        </linearGradient>
      </defs>
      <path fill="url(#7g)" stroke="#ffe27a" stroke-width="2.2" stroke-linejoin="round" d="M16 16h34l-16 36h-10L38 24H16z"/>
      <path fill="#fff6c8" opacity=".55" d="M20 18h26l-2 4H22z"/>
    </svg>`
  }
};

window.SLOT_SYMBOL_ORDER = ["seven", "coin", "spark", "robot", "brain", "chip", "bulb"];
