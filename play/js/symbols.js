/* AI-themed reel symbols as inline SVG (no emoji, no paid assets).
   Titanium, ice-cyan, and a little gold — the same palette as the console. */
window.SLOT_SYMBOLS = {
  robot: {
    name: "Robot",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4f7fa"/>
          <stop offset=".45" stop-color="#9aa8b4"/>
          <stop offset="1" stop-color="#3e4c58"/>
        </linearGradient>
        <linearGradient id="rv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e8fdff"/>
          <stop offset="1" stop-color="#2aa8c4"/>
        </linearGradient>
      </defs>
      <rect x="16" y="18" width="32" height="28" rx="8" fill="url(#rg)" stroke="#e7f6fb" stroke-width="1"/>
      <rect x="20" y="24" width="24" height="12" rx="4" fill="#07141c"/>
      <circle cx="28" cy="30" r="3.2" fill="url(#rv)"/>
      <circle cx="36" cy="30" r="3.2" fill="url(#rv)"/>
      <circle cx="28" cy="29.2" r="1" fill="#fff"/>
      <circle cx="36" cy="29.2" r="1" fill="#fff"/>
      <rect x="26" y="40" width="12" height="2.2" rx="1.1" fill="#1a3140"/>
      <rect x="30.2" y="8" width="3.6" height="10" rx="1.2" fill="url(#rg)"/>
      <circle cx="32" cy="8" r="3.2" fill="#d9f7ff" stroke="#c6a15a" stroke-width=".7"/>
      <rect x="12" y="26" width="5" height="10" rx="2" fill="url(#rg)"/>
      <rect x="47" y="26" width="5" height="10" rx="2" fill="url(#rg)"/>
    </svg>`
  },
  brain: {
    name: "Brain",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e8fdff"/>
          <stop offset=".45" stop-color="#5fd4e6"/>
          <stop offset="1" stop-color="#146072"/>
        </linearGradient>
      </defs>
      <path fill="url(#bg)" stroke="#e7d7a8" stroke-width="1" d="M31.5 14c-3.2-5-14-3.4-16.2 5.2C9.6 20.4 7 28 11 36c2 4.2 6.4 7 12.2 7.6 1.6 3.6 4.6 6.4 8.3 6.4V14z"/>
      <path fill="url(#bg)" stroke="#e7d7a8" stroke-width="1" d="M32.5 14c3.2-5 14-3.4 16.2 5.2C54.4 20.4 57 28 53 36c-2 4.2-6.4 7-12.2 7.6-1.6 3.6-4.6 6.4-8.3 6.4V14z"/>
      <path fill="none" stroke="#f4fbff" stroke-width="1.2" stroke-linecap="round" d="M32 15v33"/>
      <path fill="none" stroke="#f4fbff" stroke-width="1.2" stroke-linecap="round" opacity=".8" d="M22 22c4 2.6 6 2.6 9 0M19 30c5 3 8 3 12 0M21 38c3.6 2.4 6.6 2.4 10 0"/>
      <path fill="none" stroke="#f4fbff" stroke-width="1.2" stroke-linecap="round" opacity=".8" d="M42 22c-4 2.6-6 2.6-9 0M45 30c-5 3-8 3-12 0M43 38c-3.6 2.4-6.6 2.4-10 0"/>
      <circle cx="20" cy="18" r="1.6" fill="#fff"/>
      <circle cx="44" cy="18" r="1.6" fill="#fff"/>
    </svg>`
  },
  chip: {
    name: "Chip",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e8fdff"/>
          <stop offset=".5" stop-color="#3ec8de"/>
          <stop offset="1" stop-color="#0c4e5c"/>
        </linearGradient>
      </defs>
      <rect x="18" y="18" width="28" height="28" rx="4" fill="#0c1622" stroke="url(#cg)" stroke-width="1.6"/>
      <rect x="24" y="24" width="16" height="16" rx="2" fill="url(#cg)"/>
      <rect x="27" y="27" width="10" height="10" rx="1" fill="#062028"/>
      <g stroke="#d5dee6" stroke-width="1.4" stroke-linecap="round">
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
          <stop offset="0" stop-color="#f7feff"/>
          <stop offset=".45" stop-color="#8eebf6"/>
          <stop offset="1" stop-color="#1a7e96"/>
        </radialGradient>
      </defs>
      <path fill="url(#lg)" stroke="#e7f6fb" stroke-width="1" d="M32 8c-9 0-16 7.2-16 16.4 0 6.2 3.4 11.2 8.4 14.2v3.2h15.2v-3.2c5-3 8.4-8 8.4-14.2C48 15.2 41 8 32 8z"/>
      <path fill="none" stroke="#163848" stroke-width="1.4" stroke-linecap="round" d="M29 24c0-3 2.4-5 5.4-5 1.6 0 3 .6 4 1.6"/>
      <path d="M32 22v10" stroke="#163848" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="24.5" y="42" width="15" height="3.4" rx="1" fill="#d5dee6"/>
      <rect x="25.5" y="46.2" width="13" height="3" rx="1" fill="#9aa8b4"/>
      <rect x="26.5" y="50.2" width="11" height="3.8" rx="1.2" fill="#4a5864"/>
      <path d="M20 16l-4-5M44 16l4-5M16 26h-6M48 26h6" stroke="#e7d7a8" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`
  },
  spark: {
    name: "Spark",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="sg" cx=".5" cy=".45" r=".55">
          <stop offset="0" stop-color="#fff"/>
          <stop offset=".4" stop-color="#c8f6ff"/>
          <stop offset="1" stop-color="#1a8aa4"/>
        </radialGradient>
      </defs>
      <path fill="url(#sg)" stroke="#e7d7a8" stroke-width=".7" d="M32 6l4.2 16.4L54 24 38.6 33.2 44 52 32 41.4 20 52l5.4-18.8L10 24l17.8-1.6z"/>
      <path fill="#f7feff" opacity=".85" d="M32 18l1.8 7.2L41 26.4l-5.8 4.4 2.2 7.4L32 34.2 26.6 38.2 28.8 30.8 23 26.4l7.2-.6z"/>
    </svg>`
  },
  coin: {
    name: "Coin",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="og" cx=".38" cy=".32" r=".7">
          <stop offset="0" stop-color="#f7fafc"/>
          <stop offset=".42" stop-color="#b7c3ce"/>
          <stop offset="1" stop-color="#3a4652"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="22" fill="url(#og)" stroke="#e7f6fb" stroke-width="1.1"/>
      <circle cx="32" cy="32" r="16" fill="none" stroke="#c6a15a" stroke-width="1"/>
      <circle cx="32" cy="32" r="8" fill="none" stroke="#7ee7f6" stroke-width="1.4"/>
      <circle cx="32" cy="32" r="3.2" fill="#d9f7ff"/>
      <ellipse cx="24" cy="24" rx="6" ry="3.2" fill="#fff" opacity=".28"/>
    </svg>`
  },
  seven: {
    name: "Seven",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="7g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f7feff"/>
          <stop offset=".4" stop-color="#8fd8ea"/>
          <stop offset="1" stop-color="#1a6074"/>
        </linearGradient>
      </defs>
      <path fill="url(#7g)" stroke="#e7d7a8" stroke-width="1.4" stroke-linejoin="round" d="M16 16h34l-16 36h-10L38 24H16z"/>
      <path fill="#fff" opacity=".45" d="M20 18h24l-1.6 3.2H22z"/>
    </svg>`
  }
};

window.SLOT_SYMBOL_ORDER = ["seven", "coin", "spark", "robot", "brain", "chip", "bulb"];
