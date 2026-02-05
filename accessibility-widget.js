/**
 * Accessibility Widget - Self-contained accessibility overlay
 * Drop-in single script for any website.
 *
 * Usage: <script src="accessibility-widget.js"></script>
 *
 * Features:
 *   Contrast+, Highlight Links, Bigger Text, Text Spacing,
 *   Pause Animations, Hide Images, Dyslexia Friendly, Cursor,
 *   Tooltips, Line Height, Text Align, Saturation
 *
 * Keyboard shortcut: Alt+A to toggle panel
 * Settings persist in localStorage.
 */
;(function () {
  'use strict'

  /* ───────── constants ───────── */
  const STORAGE_KEY = 'a11y_widget_state'
  const PREFIX = 'a11y-w'

  /* ───────── state ───────── */
  const defaults = {
    contrast: 0,       // 0=off,1=invert,2=dark,3=light
    highlightLinks: 0, // 0/1
    biggerText: 0,     // 0-4
    textSpacing: 0,    // 0-3
    pauseAnimations: 0,// 0/1
    hideImages: 0,     // 0/1
    dyslexia: 0,       // 0=off,1=dyslexia,2=legible
    cursor: 0,         // 0=off,1=big,2=mask,3=guide
    tooltips: 0,       // 0/1
    lineHeight: 0,     // 0-3
    textAlign: 0,      // 0=off,1=left,2=right,3=center,4=justify
    saturation: 0,     // 0=off,1=low,2=high,3=desat
    oversized: 0,
    position: 'right', // 'left' | 'right'
    hidden: 0,
  }

  let state = loadState()

  function loadState () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return Object.assign({}, defaults, JSON.parse(raw))
    } catch (_) {}
    return Object.assign({}, defaults)
  }

  function saveState () {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (_) {}
  }

  /* ───────── SVG icons ───────── */
  const icons = {
    accessibility: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="4" r="2"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/></svg>`,
    contrast: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
    textSize: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 4v3h5v12h3V7h5V4H2zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>`,
    textSpacing: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    hideImage: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c0-1.1-.9-2-2-2H5c-.45 0-.85.15-1.2.41l14.31 14.31L21 15V5zM2.41 2.13L1 3.54l2 2V19c0 1.1.9 2 2 2h13.46l2 2 1.41-1.41L2.41 2.13zM5 18l3.5-4.5 2.5 3.01L12.17 15l4.83 5H5z"/></svg>`,
    dyslexia: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/></svg>`,
    cursor: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L10.13 16.76l-3.02 3.03c-.36.36-.86.47-1.31.3-.46-.17-.77-.59-.82-1.08L4 4.01c-.05-.49.2-.96.61-1.23.41-.27.93-.27 1.34 0L20.96 13.8c.41.27.56.79.37 1.25s-.67.73-1.14.68l-4.23-.46L17.93 19.56c.24.49.04 1.09-.45 1.33l-3.84 1.08z"/></svg>`,
    tooltips: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
    lineHeight: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h-2v12h2V6zm4 0h-2v12h2V6zM8 10.05l1.79-1.79L11.2 9.67 8 12.87 4.8 9.67l1.41-1.41L8 10.05zM8 13.95l-1.79 1.79L4.8 14.33 8 11.13l3.2 3.2-1.41 1.41L8 13.95z"/></svg>`,
    textAlign: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>`,
    saturation: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66c3.12 3.12 3.12 8.19 0 11.31-1.56 1.56-3.61 2.34-5.66 2.34s-4.1-.78-5.66-2.34c-3.12-3.12-3.12-8.19 0-11.31L12 2.69zM12 4.81L7.76 9.07c-2.34 2.34-2.34 6.13 0 8.47A5.98 5.98 0 0012 19.5V4.81z"/></svg>`,
    reset: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    move: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>`,
  }

  /* ───────── feature definitions ───────── */
  const features = [
    {
      id: 'contrast', icon: icons.contrast,
      labels: ['Contrast +', 'Invert Colors', 'Dark Contrast', 'Light Contrast'],
      max: 3,
      desc: 'Cycle through: invert colors, dark contrast, light contrast',
    },
    {
      id: 'highlightLinks', icon: icons.link,
      labels: ['Highlight Links', 'Highlight Links'],
      max: 1,
      desc: 'Underline and highlight all links',
    },
    {
      id: 'biggerText', icon: icons.textSize,
      labels: ['Bigger Text', 'Bigger Text', 'Bigger Text', 'Bigger Text', 'Bigger Text'],
      max: 4,
      desc: 'Increase text size (4 levels)',
    },
    {
      id: 'textSpacing', icon: icons.textSpacing,
      labels: ['Text Spacing', 'Light Spacing', 'Moderate Spacing', 'Heavy Spacing'],
      max: 3,
      desc: 'Increase letter and word spacing',
    },
    {
      id: 'pauseAnimations', icon: icons.pause,
      labels: ['Pause Animations', 'Play Animations'],
      max: 1,
      desc: 'Stop all CSS animations and transitions',
    },
    {
      id: 'hideImages', icon: icons.hideImage,
      labels: ['Hide Images', 'Show Images'],
      max: 1,
      desc: 'Hide all images on the page',
    },
    {
      id: 'dyslexia', icon: icons.dyslexia,
      labels: ['Dyslexia Friendly', 'Dyslexia Font', 'Legible Fonts'],
      max: 2,
      desc: 'Switch to dyslexia-friendly or legible fonts',
    },
    {
      id: 'cursor', icon: icons.cursor,
      labels: ['Cursor', 'Big Cursor', 'Reading Mask', 'Reading Guide'],
      max: 3,
      desc: 'Big cursor, reading mask, or reading guide',
    },
    {
      id: 'tooltips', icon: icons.tooltips,
      labels: ['Tooltips', 'Tooltips On'],
      max: 1,
      desc: 'Show enhanced tooltips on hover',
    },
    {
      id: 'lineHeight', icon: icons.lineHeight,
      labels: ['Line Height', 'Line Height 1.5x', 'Line Height 1.75x', 'Line Height 2x'],
      max: 3,
      desc: 'Increase line height (3 levels)',
    },
    {
      id: 'textAlign', icon: icons.textAlign,
      labels: ['Text Align', 'Align Left', 'Align Right', 'Align Center', 'Justify'],
      max: 4,
      desc: 'Override text alignment',
    },
    {
      id: 'saturation', icon: icons.saturation,
      labels: ['Saturation', 'Low Saturation', 'High Saturation', 'Desaturate'],
      max: 3,
      desc: 'Adjust color saturation',
    },
  ]

  /* ───────── inject styles ───────── */
  function injectCSS () {
    const style = document.createElement('style')
    style.id = PREFIX + '-styles'
    style.textContent = `
/* ── trigger button ── */
.${PREFIX}-trigger {
  position: fixed;
  bottom: 24px;
  z-index: 999999;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--a11y-trigger-bg, #333);
  color: var(--a11y-trigger-fg, #fff);
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0,0,0,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: .3;
  transition: transform .2s, background .2s, opacity .2s;
}
.${PREFIX}-trigger:hover { transform: scale(1.15); opacity: 1; filter: brightness(1.2); }
.${PREFIX}-trigger:focus-visible { outline: 3px solid #ffd600; outline-offset: 2px; opacity: 1; }
.${PREFIX}-trigger svg { width: 16px; height: 16px; }
.${PREFIX}-trigger.${PREFIX}-pos-right { right: 20px; }
.${PREFIX}-trigger.${PREFIX}-pos-left  { left: 20px; }

/* ── panel ── */
.${PREFIX}-panel {
  position: fixed;
  top: 0;
  z-index: 1000000;
  width: 365px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  color: #222;
  box-shadow: -4px 0 24px rgba(0,0,0,.25);
  display: flex;
  flex-direction: column;
  transition: transform .3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
}
.${PREFIX}-panel.${PREFIX}-pos-right { right: 0; transform: translateX(100%); }
.${PREFIX}-panel.${PREFIX}-pos-left  { left: 0;  transform: translateX(-100%); }
.${PREFIX}-panel.${PREFIX}-open.${PREFIX}-pos-right { transform: translateX(0); }
.${PREFIX}-panel.${PREFIX}-open.${PREFIX}-pos-left  { transform: translateX(0); }

.${PREFIX}-panel.${PREFIX}-oversized { width: 440px; font-size: 17px; }
.${PREFIX}-panel.${PREFIX}-oversized .${PREFIX}-grid-btn { min-height: 130px; }

/* ── header ── */
.${PREFIX}-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}
.${PREFIX}-header h2 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 700;
  color: #1565c0;
}
.${PREFIX}-header h2 small { font-weight: 400; font-size: .75em; color: #888; }
.${PREFIX}-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
}
.${PREFIX}-close-btn:hover { background: #eee; color: #000; }
.${PREFIX}-close-btn svg { width: 20px; height: 20px; }

/* ── toolbar ── */
.${PREFIX}-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 18px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}
.${PREFIX}-toolbar label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: .9em;
  user-select: none;
}
.${PREFIX}-toggle {
  position: relative;
  width: 40px;
  height: 22px;
  background: #ccc;
  border-radius: 11px;
  transition: background .2s;
  flex-shrink: 0;
}
.${PREFIX}-toggle::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  top: 2px;
  left: 2px;
  transition: transform .2s;
}
.${PREFIX}-toggle.active { background: #1565c0; }
.${PREFIX}-toggle.active::after { transform: translateX(18px); }

/* ── grid ── */
.${PREFIX}-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 14px 18px;
  overflow-y: auto;
  flex: 1;
}

.${PREFIX}-grid-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 105px;
  padding: 12px 6px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fafafa;
  cursor: pointer;
  transition: border-color .2s, background .2s, box-shadow .2s;
  text-align: center;
  color: #333;
}
.${PREFIX}-grid-btn:hover { border-color: #90caf9; background: #e3f2fd; }
.${PREFIX}-grid-btn:focus-visible { outline: 3px solid #ffd600; outline-offset: 2px; }
.${PREFIX}-grid-btn[aria-pressed="true"] {
  border-color: #1565c0;
  background: #e3f2fd;
  box-shadow: 0 0 0 2px #1565c0 inset;
  color: #0d47a1;
}
.${PREFIX}-grid-btn svg { width: 32px; height: 32px; flex-shrink: 0; }
.${PREFIX}-grid-btn span { font-size: .85em; font-weight: 600; line-height: 1.2; }

/* ── level dots ── */
.${PREFIX}-dots { display: flex; gap: 4px; }
.${PREFIX}-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #ccc;
}
.${PREFIX}-dot.active { background: #1565c0; }

/* ── footer ── */
.${PREFIX}-footer {
  padding: 12px 18px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.${PREFIX}-reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #1565c0;
  color: #fff;
  cursor: pointer;
  font-size: .95em;
  font-weight: 600;
  transition: background .2s;
}
.${PREFIX}-reset-btn:hover { background: #0d47a1; }
.${PREFIX}-reset-btn svg { width: 18px; height: 18px; }

.${PREFIX}-move-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .85em;
  color: #555;
}
.${PREFIX}-move-row button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  font-size: .85em;
  color: #555;
  transition: background .2s, border-color .2s;
}
.${PREFIX}-move-row button:hover { background: #eee; border-color: #999; }
.${PREFIX}-move-row svg { width: 16px; height: 16px; flex-shrink: 0; }
.${PREFIX}-branding {
  text-align: center;
  font-size: .75em;
  color: #999;
  padding-top: 4px;
}

/* ── backdrop (mobile) ── */
.${PREFIX}-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(0,0,0,.4);
}
.${PREFIX}-backdrop.${PREFIX}-open { display: block; }

/* ── unhide tab ── */
.${PREFIX}-unhide-tab {
  position: fixed;
  bottom: 0;
  z-index: 999999;
  background: #1565c0;
  color: #fff;
  border: none;
  border-radius: 6px 6px 0 0;
  padding: 6px 14px;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: pointer;
  box-shadow: 0 -2px 8px rgba(0,0,0,.2);
  display: none;
}
.${PREFIX}-unhide-tab:hover { background: #0d47a1; }
.${PREFIX}-unhide-tab.${PREFIX}-pos-right { right: 20px; }
.${PREFIX}-unhide-tab.${PREFIX}-pos-left  { left: 20px; }

/* ─────── page-level effect classes (applied to <html>) ─────── */
html.${PREFIX}-invert       { filter: invert(1) hue-rotate(180deg); }
html.${PREFIX}-dark-contrast { filter: invert(1) hue-rotate(180deg); background: #000; }
html.${PREFIX}-dark-contrast img,
html.${PREFIX}-dark-contrast video,
html.${PREFIX}-dark-contrast svg:not(.${PREFIX}-trigger svg):not(.${PREFIX}-panel svg) { filter: invert(1) hue-rotate(180deg); }
html.${PREFIX}-light-contrast { filter: contrast(1.75) brightness(1.15); }

html.${PREFIX}-hl-links a { outline: 2px solid #1565c0 !important; background: #e3f2fd !important; text-decoration: underline !important; }

html.${PREFIX}-bigger-1 { font-size: 112.5% !important; }
html.${PREFIX}-bigger-2 { font-size: 125%   !important; }
html.${PREFIX}-bigger-3 { font-size: 150%   !important; }
html.${PREFIX}-bigger-4 { font-size: 175%   !important; }

html.${PREFIX}-spacing-1 * { letter-spacing: .05em !important; word-spacing: .1em  !important; }
html.${PREFIX}-spacing-2 * { letter-spacing: .1em  !important; word-spacing: .2em  !important; }
html.${PREFIX}-spacing-3 * { letter-spacing: .15em !important; word-spacing: .35em !important; }

html.${PREFIX}-no-anim *:not(.${PREFIX}-panel):not(.${PREFIX}-panel *):not(.${PREFIX}-trigger):not(.${PREFIX}-backdrop),
html.${PREFIX}-no-anim *:not(.${PREFIX}-panel):not(.${PREFIX}-panel *)::before,
html.${PREFIX}-no-anim *:not(.${PREFIX}-panel):not(.${PREFIX}-panel *)::after {
  animation-duration:   0s !important;
  animation-delay:      0s !important;
  transition-duration:  0s !important;
  transition-delay:     0s !important;
}

html.${PREFIX}-no-images img { display: none !important; }

html.${PREFIX}-dyslexia-font * { font-family: "OpenDyslexic", "Comic Sans MS", cursive, sans-serif !important; }
html.${PREFIX}-legible-font  * { font-family: "Verdana", "Tahoma", "Arial", sans-serif !important; }

html.${PREFIX}-big-cursor,
html.${PREFIX}-big-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='white' stroke-width='1' d='M5 3l3.5 14 2.63-5.15L17 15.5 15.5 13l5.15-2.63L5 3z'/%3E%3C/svg%3E") 4 4, auto !important; }

/* tooltips handled via JS floating element */
.${PREFIX}-tooltip-float {
  position: fixed;
  z-index: 999998;
  padding: 5px 12px;
  background: #333;
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity .15s;
}
.${PREFIX}-tooltip-float.visible { opacity: 1; }

html.${PREFIX}-lh-1 * { line-height: 1.5 !important; }
html.${PREFIX}-lh-2 * { line-height: 1.75 !important; }
html.${PREFIX}-lh-3 * { line-height: 2   !important; }

html.${PREFIX}-align-left    * { text-align: left    !important; }
html.${PREFIX}-align-right   * { text-align: right   !important; }
html.${PREFIX}-align-center  * { text-align: center  !important; }
html.${PREFIX}-align-justify * { text-align: justify !important; }

html.${PREFIX}-sat-low  { filter: saturate(.4); }
html.${PREFIX}-sat-high { filter: saturate(2);  }
html.${PREFIX}-desat    { filter: saturate(0);  }

/* Reading mask & guide – elements injected via JS */
.${PREFIX}-reading-mask {
  position: fixed;
  inset: 0;
  z-index: 999998;
  pointer-events: none;
}
.${PREFIX}-reading-mask-top,
.${PREFIX}-reading-mask-bottom {
  position: fixed;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.65);
  z-index: 999998;
  pointer-events: none;
  transition: top .05s linear, bottom .05s linear, height .05s linear;
}
.${PREFIX}-reading-guide {
  position: fixed;
  left: 0;
  right: 0;
  height: 3px;
  background: #1565c0;
  z-index: 999998;
  pointer-events: none;
  transition: top .05s linear;
}

/* counter-filter the widget so it appears normal under page filters */
html.${PREFIX}-invert .${PREFIX}-panel,
html.${PREFIX}-invert .${PREFIX}-trigger,
html.${PREFIX}-invert .${PREFIX}-backdrop {
  filter: invert(1) hue-rotate(180deg);
}
html.${PREFIX}-dark-contrast .${PREFIX}-panel,
html.${PREFIX}-dark-contrast .${PREFIX}-trigger,
html.${PREFIX}-dark-contrast .${PREFIX}-backdrop {
  filter: invert(1) hue-rotate(180deg);
}
html.${PREFIX}-light-contrast .${PREFIX}-panel,
html.${PREFIX}-light-contrast .${PREFIX}-trigger,
html.${PREFIX}-light-contrast .${PREFIX}-backdrop {
  filter: contrast(${1/1.75}) brightness(${1/1.15});
}
html.${PREFIX}-sat-low .${PREFIX}-panel,
html.${PREFIX}-sat-low .${PREFIX}-trigger {
  filter: saturate(${1/0.4});
}
html.${PREFIX}-sat-high .${PREFIX}-panel,
html.${PREFIX}-sat-high .${PREFIX}-trigger {
  filter: saturate(0.5);
}
html.${PREFIX}-desat .${PREFIX}-panel,
html.${PREFIX}-desat .${PREFIX}-trigger {
  filter: saturate(9999);
}
`
    document.head.appendChild(style)
  }

  /* ───────── build DOM ───────── */
  let triggerBtn, panel, backdrop, gridBtns = {}
  let maskTop, maskBottom, readingGuide, oversizedToggle
  let unhideTab, tooltipFloat

  function buildWidget () {
    // backdrop
    backdrop = el('div', { className: `${PREFIX}-backdrop`, 'aria-hidden': 'true' })
    backdrop.addEventListener('click', closePanel)
    document.body.appendChild(backdrop)

    // trigger
    triggerBtn = el('button', {
      className: `${PREFIX}-trigger ${PREFIX}-pos-${state.position}`,
      'aria-label': 'Accessibility Menu',
      title: 'Accessibility Menu (Alt+A)',
      innerHTML: icons.accessibility,
    })
    if (state.hidden) triggerBtn.style.display = 'none'
    triggerBtn.addEventListener('click', togglePanel)
    document.body.appendChild(triggerBtn)

    // panel
    panel = el('div', {
      className: `${PREFIX}-panel ${PREFIX}-pos-${state.position}`,
      role: 'dialog',
      'aria-label': 'Accessibility Settings',
    })
    if (state.oversized) panel.classList.add(`${PREFIX}-oversized`)

    // header
    const header = el('div', { className: `${PREFIX}-header` })
    header.innerHTML = `<h2>Accessibility Menu <small>(Alt+A)</small></h2>`
    const closeBtn = el('button', {
      className: `${PREFIX}-close-btn`,
      'aria-label': 'Close accessibility menu',
      innerHTML: icons.close,
    })
    closeBtn.addEventListener('click', closePanel)
    header.appendChild(closeBtn)
    panel.appendChild(header)

    // toolbar – oversized toggle
    const toolbar = el('div', { className: `${PREFIX}-toolbar` })
    const label = el('label')
    label.innerHTML = `Oversized Widget`
    oversizedToggle = el('div', {
      className: `${PREFIX}-toggle` + (state.oversized ? ' active' : ''),
      role: 'switch',
      'aria-checked': String(!!state.oversized),
      tabindex: '0',
    })
    oversizedToggle.addEventListener('click', () => {
      state.oversized = state.oversized ? 0 : 1
      oversizedToggle.classList.toggle('active', !!state.oversized)
      oversizedToggle.setAttribute('aria-checked', String(!!state.oversized))
      panel.classList.toggle(`${PREFIX}-oversized`, !!state.oversized)
      saveState()
    })
    label.prepend(oversizedToggle)
    toolbar.appendChild(label)
    panel.appendChild(toolbar)

    // grid
    const grid = el('div', { className: `${PREFIX}-grid` })
    features.forEach(f => {
      const btn = el('button', {
        className: `${PREFIX}-grid-btn`,
        'aria-pressed': state[f.id] ? 'true' : 'false',
        'aria-label': f.desc,
        'data-feature': f.id,
      })
      btn.innerHTML = f.icon + `<span>${f.labels[state[f.id]] || f.labels[0]}</span>`

      // level dots for multi-level features
      if (f.max > 1) {
        const dots = el('div', { className: `${PREFIX}-dots` })
        for (let i = 1; i <= f.max; i++) {
          const dot = el('span', { className: `${PREFIX}-dot` + (i <= state[f.id] ? ' active' : '') })
          dots.appendChild(dot)
        }
        btn.appendChild(dots)
      }

      btn.addEventListener('click', () => cycleFeature(f))
      grid.appendChild(btn)
      gridBtns[f.id] = btn
    })
    panel.appendChild(grid)

    // footer
    const footer = el('div', { className: `${PREFIX}-footer` })

    const resetBtn = el('button', {
      className: `${PREFIX}-reset-btn`,
      'aria-label': 'Reset all accessibility settings',
    })
    resetBtn.innerHTML = icons.reset + ' Reset All Settings'
    resetBtn.addEventListener('click', resetAll)
    footer.appendChild(resetBtn)

    const moveRow = el('div', { className: `${PREFIX}-move-row` })
    moveRow.innerHTML = icons.move + ' Move widget:'
    const leftBtn = el('button', { textContent: 'Left' })
    const rightBtn = el('button', { textContent: 'Right' })
    const hideBtn = el('button', { textContent: 'Hide' })
    leftBtn.addEventListener('click', () => moveWidget('left'))
    rightBtn.addEventListener('click', () => moveWidget('right'))
    hideBtn.addEventListener('click', hideWidget)
    moveRow.append(leftBtn, rightBtn, hideBtn)
    footer.appendChild(moveRow)

    const branding = el('div', { className: `${PREFIX}-branding` })
    branding.textContent = 'Accessibility Widget'
    footer.appendChild(branding)

    panel.appendChild(footer)
    document.body.appendChild(panel)

    // reading mask elements
    maskTop = el('div', { className: `${PREFIX}-reading-mask-top` })
    maskBottom = el('div', { className: `${PREFIX}-reading-mask-bottom` })
    readingGuide = el('div', { className: `${PREFIX}-reading-guide` })

    // unhide tab (visible only when widget is hidden)
    unhideTab = el('button', {
      className: `${PREFIX}-unhide-tab ${PREFIX}-pos-${state.position}`,
      textContent: 'Accessibility',
      'aria-label': 'Show accessibility widget',
    })
    unhideTab.addEventListener('click', showWidget)
    if (state.hidden) unhideTab.style.display = 'block'
    document.body.appendChild(unhideTab)

    // floating tooltip element (JS-driven, replaces CSS pseudo-elements)
    tooltipFloat = el('div', { className: `${PREFIX}-tooltip-float` })
    document.body.appendChild(tooltipFloat)

    // apply saved state
    applyAllEffects()
  }

  /* ───────── helpers ───────── */
  function el (tag, attrs) {
    const e = document.createElement(tag)
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') e.className = v
      else if (k === 'innerHTML') e.innerHTML = v
      else if (k === 'textContent') e.textContent = v
      else if (k === 'tabindex') e.setAttribute('tabindex', v)
      else if (k.startsWith('aria-') || k === 'role' || k.startsWith('data-')) e.setAttribute(k, v)
      else e[k] = v
    })
    return e
  }

  /* ───────── panel open / close ───────── */
  let panelOpen = false

  function togglePanel () { panelOpen ? closePanel() : openPanel() }

  function openPanel () {
    panelOpen = true
    panel.classList.add(`${PREFIX}-open`)
    backdrop.classList.add(`${PREFIX}-open`)
    panel.querySelector(`.${PREFIX}-close-btn`).focus()
    document.addEventListener('keydown', trapFocus)
  }

  function closePanel () {
    panelOpen = false
    panel.classList.remove(`${PREFIX}-open`)
    backdrop.classList.remove(`${PREFIX}-open`)
    document.removeEventListener('keydown', trapFocus)
    triggerBtn.focus()
  }

  function trapFocus (e) {
    if (e.key !== 'Tab' || !panelOpen) return
    const focusable = panel.querySelectorAll('button, [tabindex="0"], input, select, textarea, a[href]')
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  /* ───────── feature cycling ───────── */
  function cycleFeature (f) {
    state[f.id] = (state[f.id] + 1) % (f.max + 1)
    updateButton(f)
    applyEffect(f.id)
    saveState()
  }

  function updateButton (f) {
    const btn = gridBtns[f.id]
    const val = state[f.id]
    btn.setAttribute('aria-pressed', val ? 'true' : 'false')
    btn.querySelector('span').textContent = f.labels[val] || f.labels[0]

    const dots = btn.querySelector(`.${PREFIX}-dots`)
    if (dots) {
      dots.querySelectorAll(`.${PREFIX}-dot`).forEach((d, i) => {
        d.classList.toggle('active', i < val)
      })
    }
  }

  /* ───────── apply effects ───────── */
  const html = document.documentElement

  const classMap = {
    contrast: ['', `${PREFIX}-invert`, `${PREFIX}-dark-contrast`, `${PREFIX}-light-contrast`],
    highlightLinks: ['', `${PREFIX}-hl-links`],
    biggerText: ['', `${PREFIX}-bigger-1`, `${PREFIX}-bigger-2`, `${PREFIX}-bigger-3`, `${PREFIX}-bigger-4`],
    textSpacing: ['', `${PREFIX}-spacing-1`, `${PREFIX}-spacing-2`, `${PREFIX}-spacing-3`],
    pauseAnimations: ['', `${PREFIX}-no-anim`],
    hideImages: ['', `${PREFIX}-no-images`],
    dyslexia: ['', `${PREFIX}-dyslexia-font`, `${PREFIX}-legible-font`],
    cursor: ['', `${PREFIX}-big-cursor`],  // mask & guide handled separately
    tooltips: ['', ''],  // handled via JS, no CSS class
    lineHeight: ['', `${PREFIX}-lh-1`, `${PREFIX}-lh-2`, `${PREFIX}-lh-3`],
    textAlign: ['', `${PREFIX}-align-left`, `${PREFIX}-align-right`, `${PREFIX}-align-center`, `${PREFIX}-align-justify`],
    saturation: ['', `${PREFIX}-sat-low`, `${PREFIX}-sat-high`, `${PREFIX}-desat`],
  }

  function applyEffect (id) {
    const classes = classMap[id]
    if (!classes) return
    // remove all classes for this feature
    classes.forEach(c => { if (c) html.classList.remove(c) })
    // add current
    const active = classes[state[id]]
    if (active) html.classList.add(active)

    // special: tooltips via JS
    if (id === 'tooltips') {
      state.tooltips ? enableTooltips() : disableTooltips()
    }

    // special: cursor modes 2 & 3
    if (id === 'cursor') {
      html.classList.remove(`${PREFIX}-big-cursor`)
      removeMask()
      removeGuide()
      if (state.cursor === 1) html.classList.add(`${PREFIX}-big-cursor`)
      if (state.cursor === 2) enableMask()
      if (state.cursor === 3) enableGuide()
    }

    // combined filter: contrast + saturation share CSS filter, handle conflict
    if (id === 'contrast' || id === 'saturation') resolveFilters()
  }

  function resolveFilters () {
    // If both contrast and saturation are active, contrast takes priority
    // (matching UserWay behavior)
    const contrastClasses = classMap.contrast
    const satClasses = classMap.saturation
    contrastClasses.forEach(c => { if (c) html.classList.remove(c) })
    satClasses.forEach(c => { if (c) html.classList.remove(c) })

    if (state.contrast) {
      html.classList.add(contrastClasses[state.contrast])
    } else if (state.saturation) {
      html.classList.add(satClasses[state.saturation])
    }
  }

  function applyAllEffects () {
    Object.keys(classMap).forEach(id => applyEffect(id))
  }

  /* ───────── reading mask ───────── */
  let maskActive = false
  function enableMask () {
    if (maskActive) return
    maskActive = true
    document.body.appendChild(maskTop)
    document.body.appendChild(maskBottom)
    document.addEventListener('mousemove', moveMask)
  }
  function removeMask () {
    if (!maskActive) return
    maskActive = false
    maskTop.remove()
    maskBottom.remove()
    document.removeEventListener('mousemove', moveMask)
  }
  function moveMask (e) {
    const y = e.clientY
    const gap = 60
    maskTop.style.top = '0'
    maskTop.style.height = Math.max(0, y - gap) + 'px'
    maskBottom.style.bottom = '0'
    maskBottom.style.height = Math.max(0, window.innerHeight - y - gap) + 'px'
  }

  /* ───────── reading guide ───────── */
  let guideActive = false
  function enableGuide () {
    if (guideActive) return
    guideActive = true
    document.body.appendChild(readingGuide)
    document.addEventListener('mousemove', moveGuide)
  }
  function removeGuide () {
    if (!guideActive) return
    guideActive = false
    readingGuide.remove()
    document.removeEventListener('mousemove', moveGuide)
  }
  function moveGuide (e) {
    readingGuide.style.top = e.clientY + 'px'
  }

  /* ───────── reset ───────── */
  function resetAll () {
    Object.keys(classMap).forEach(id => {
      classMap[id].forEach(c => { if (c) html.classList.remove(c) })
    })
    html.classList.remove(`${PREFIX}-big-cursor`)
    removeMask()
    removeGuide()
    disableTooltips()

    Object.keys(defaults).forEach(k => { state[k] = defaults[k] })
    features.forEach(f => updateButton(f))
    oversizedToggle.classList.remove('active')
    oversizedToggle.setAttribute('aria-checked', 'false')
    panel.classList.remove(`${PREFIX}-oversized`)
    saveState()
  }

  /* ───────── move / hide ───────── */
  function moveWidget (pos) {
    state.position = pos
    triggerBtn.className = `${PREFIX}-trigger ${PREFIX}-pos-${pos}`
    unhideTab.className = `${PREFIX}-unhide-tab ${PREFIX}-pos-${pos}`
    panel.classList.remove(`${PREFIX}-pos-left`, `${PREFIX}-pos-right`)
    panel.classList.add(`${PREFIX}-pos-${pos}`)
    if (panelOpen) panel.classList.add(`${PREFIX}-open`)
    saveState()
  }

  function hideWidget () {
    state.hidden = 1
    triggerBtn.style.display = 'none'
    unhideTab.style.display = 'block'
    closePanel()
    saveState()
  }

  function showWidget () {
    state.hidden = 0
    triggerBtn.style.display = ''
    unhideTab.style.display = 'none'
    saveState()
  }

  /* ───────── JS-based tooltips ───────── */
  let tooltipActive = false

  function enableTooltips () {
    if (tooltipActive) return
    tooltipActive = true
    document.addEventListener('mouseover', handleTooltipOver, true)
    document.addEventListener('mouseout', handleTooltipOut, true)
    document.addEventListener('mousemove', handleTooltipMove, true)
  }

  function disableTooltips () {
    if (!tooltipActive) return
    tooltipActive = false
    document.removeEventListener('mouseover', handleTooltipOver, true)
    document.removeEventListener('mouseout', handleTooltipOut, true)
    document.removeEventListener('mousemove', handleTooltipMove, true)
    tooltipFloat.classList.remove('visible')
  }

  function handleTooltipOver (e) {
    const target = e.target.closest('[title], [aria-label]')
    if (!target || target.closest(`.${PREFIX}-panel`) || target.closest(`.${PREFIX}-trigger`)) return
    const text = target.getAttribute('title') || target.getAttribute('aria-label')
    if (!text) return
    // stash and remove native title to prevent double tooltip
    if (target.hasAttribute('title')) {
      target.setAttribute('data-a11y-title', target.getAttribute('title'))
      target.removeAttribute('title')
    }
    tooltipFloat.textContent = text
    tooltipFloat.classList.add('visible')
  }

  function handleTooltipOut (e) {
    const target = e.target.closest('[data-a11y-title], [aria-label]')
    // restore native title
    if (target && target.hasAttribute('data-a11y-title')) {
      target.setAttribute('title', target.getAttribute('data-a11y-title'))
      target.removeAttribute('data-a11y-title')
    }
    tooltipFloat.classList.remove('visible')
  }

  function handleTooltipMove (e) {
    tooltipFloat.style.left = (e.clientX + 12) + 'px'
    const topPos = e.clientY - 32
    tooltipFloat.style.top = (topPos < 0 ? e.clientY + 16 : topPos) + 'px'
  }

  /* ───────── keyboard shortcut ───────── */
  function handleKey (e) {
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault()
      if (state.hidden) showWidget()
      togglePanel()
    }
    if (e.key === 'Escape' && panelOpen) closePanel()
  }

  /* ───────── auto-detect contrasting color ───────── */
  let lastBtnBg = ''
  let autoColorRaf = 0

  function autoColor () {
    autoColorRaf = 0
    if (state.hidden) return

    // sample background behind the trigger button position
    triggerBtn.style.visibility = 'hidden'
    const rect = triggerBtn.getBoundingClientRect()
    const x = Math.round(rect.left + rect.width / 2)
    const y = Math.round(rect.top + rect.height / 2)
    const behind = document.elementFromPoint(x, y)
    triggerBtn.style.visibility = ''

    // walk up DOM to find first non-transparent background
    let bg = [255, 255, 255] // fallback: white
    let node = behind || document.body
    while (node && node !== document) {
      const style = getComputedStyle(node)
      const c = style.backgroundColor
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
        const m = c.match(/\d+/g)
        if (m && m.length >= 3) { bg = m.slice(0, 3).map(Number); break }
      }
      node = node.parentElement
    }

    // relative luminance (0 = black, 1 = white)
    const lum = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) / 255

    // pick button colors that contrast with the page background
    let btnBg, btnFg
    if (lum > 0.6) {
      btnBg = '#222'; btnFg = '#fff'
    } else if (lum < 0.4) {
      btnBg = '#f5f5f5'; btnFg = '#222'
    } else {
      btnBg = lum > 0.5 ? '#111' : '#eee'
      btnFg = lum > 0.5 ? '#fff' : '#111'
    }

    // page has a dominant color — use a neutral for max contrast
    const bgGray = Math.abs(bg[0] - bg[1]) < 20 && Math.abs(bg[1] - bg[2]) < 20
    if (!bgGray) {
      btnBg = lum > 0.5 ? '#222' : '#f5f5f5'
      btnFg = lum > 0.5 ? '#fff' : '#222'
    }

    // only touch DOM if color actually changed
    if (btnBg !== lastBtnBg) {
      lastBtnBg = btnBg
      triggerBtn.style.setProperty('--a11y-trigger-bg', btnBg)
      triggerBtn.style.setProperty('--a11y-trigger-fg', btnFg)
    }
  }

  function scheduleAutoColor () {
    if (!autoColorRaf) autoColorRaf = requestAnimationFrame(autoColor)
  }

  /* ───────── init ───────── */
  function init () {
    injectCSS()
    buildWidget()
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', scheduleAutoColor, { passive: true })
    window.addEventListener('resize', scheduleAutoColor, { passive: true })
    // initial color detection after render
    requestAnimationFrame(() => requestAnimationFrame(autoColor))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
