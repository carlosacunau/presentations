// Ridge OS: the small operating system inside the studio monitor.
import { sound } from './sound.js';

const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const tri = t => Math.abs((((t % 1) + 1) % 1) * 2 - 1);

/* ---------- icons (24 box, stroke paths, shared by DOM and canvas preview) ---------- */
const ICONS = {
  terminal: ['M4 5h16v14H4z', 'M7.5 10l3 2.5-3 2.5', 'M12.5 15h4'],
  notes: ['M6 3h9l4 4v14H6z', 'M15 3v4h4', 'M9 12h7M9 15.5h7M9 19h4'],
  videos: ['M3 6h18v12H3z', 'M10 9.3v5.4l4.6-2.7z'],
  paint: ['M4 20c.3-2.6 1.6-4 3.4-4 1.6 0 2.4 1.2 1.6 2.4C8 20 5.6 20 4 20z', 'M10 15.5L19 4.5l1.6 1.4L12 17z'],
  beats: ['M3 7h18v10H3z', 'M7.5 7v5.5M12 7v5.5M16.5 7v5.5'],
  ski: ['M2.5 19L9 8l4 6 2.5-3.5L21.5 19z', 'M17 3.5v5', 'M17 3.5l3 1.4-3 1.4'],
  settings: ['M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1', 'M15 5.2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z', 'M9 10.2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z', 'M17 15.2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z'],
  back: ['M14 6l-6 6 6 6'],
};
const svg = (name, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name].map(d => `<path d="${d}"/>`).join('')}</svg>`;
const LOGO = `<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="33" cy="15" r="5" fill="#ffb561"/><path pathLength="100" d="M4 38L17 14l8 13 5-7 14 18" stroke="#f3ecf7" stroke-width="3.2"/><path pathLength="100" d="M13 21.5l4 3 3.5-3.5" stroke="#ff8a7a" stroke-width="2.4"/></svg>`;

/* ---------- wallpapers ---------- */
function ridgeLayer(ctx, w, h, base, amp, seed, fill, snow) {
  const r = rng(seed), ph = [r() * 6, r() * 6, r(), r()], f = [1.2 + r(), 2.6 + r() * 2, 2.5 + r() * 3, 9 + r() * 6];
  const y = x => { const u = x / w; return h * (base - amp * (Math.sin(u * f[0] * 3 + ph[0]) * .32 + Math.sin(u * f[1] * 3 + ph[1]) * .16 + (tri(u * f[2] + ph[2]) - .5) * .62 + (tri(u * f[3] + ph[3]) - .5) * .13)); };
  const st = Math.max(1, w / 900);
  ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w + st; x += st) ctx.lineTo(x, y(x));
  ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  if (snow) {
    const line = h * snow.line;
    for (let x = 0; x <= w; x += st) {
      const y0 = y(x), y1 = y(x + st);
      const d0 = Math.max(0, line - y0) * (.55 + .45 * tri(x / w * 37 + seed)), d1 = Math.max(0, line - y1) * (.55 + .45 * tri((x + st) / w * 37 + seed));
      if (d0 <= 0 && d1 <= 0) continue;
      ctx.fillStyle = y1 > y0 ? snow.shade : snow.lit;
      ctx.beginPath(); ctx.moveTo(x, y0 - .5); ctx.lineTo(x + st + .6, y1 - .5); ctx.lineTo(x + st + .6, y1 + d1); ctx.lineTo(x, y0 + d0); ctx.fill();
    }
  }
}
function stars(ctx, w, h, n, seed, maxY) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h * maxY, s = (r() * 1.2 + .4) * Math.max(1, w / 1600); ctx.globalAlpha = (.25 + r() * .7) * (1 - y / (h * maxY)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
function lg(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
const WALLS = [
  { id: 'dusk', name: 'Dusk ridge', glow: '#c9a2ff', draw(ctx, w, h) {
    ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#15113a'], [.3, '#3a2468'], [.52, '#a04c80'], [.66, '#f08a6c'], [.76, '#ffc890'], [1, '#ffc890']]); ctx.fillRect(0, 0, w, h);
    stars(ctx, w, h, 130, 7, .42);
    const g = ctx.createRadialGradient(w * .7, h * .72, 0, w * .7, h * .72, h * .55); g.addColorStop(0, 'rgba(255,225,170,.85)'); g.addColorStop(.25, 'rgba(255,170,120,.35)'); g.addColorStop(1, 'rgba(255,150,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ridgeLayer(ctx, w, h, .7, .07, 5, lg(ctx, 0, h * .6, 0, h * .8, [[0, '#c77f96'], [1, '#d9909a']]));
    ridgeLayer(ctx, w, h, .66, .30, 11, lg(ctx, 0, h * .35, 0, h * .8, [[0, '#8a5a96'], [1, '#c98a9a']]), { line: .6, lit: '#ffd9cf', shade: '#b79ad6' });
    ridgeLayer(ctx, w, h, .76, .24, 23, lg(ctx, 0, h * .5, 0, h * .9, [[0, '#5a3c82'], [1, '#8a5a8e']]), { line: .66, lit: '#f6c3c6', shade: '#8f7bc4' });
    ridgeLayer(ctx, w, h, .86, .16, 37, lg(ctx, 0, h * .65, 0, h, [[0, '#33235e'], [1, '#4a3070']]));
    ridgeLayer(ctx, w, h, .97, .12, 51, lg(ctx, 0, h * .8, 0, h, [[0, '#1b1440'], [1, '#120d2c']]));
  } },
  { id: 'aurora', name: 'Aurora', glow: '#6fe0c0', draw(ctx, w, h) {
    ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#070b24'], [.6, '#10294a'], [1, '#1c4a5a']]); ctx.fillRect(0, 0, w, h);
    stars(ctx, w, h, 220, 3, .8);
    ctx.globalCompositeOperation = 'lighter';
    const r = rng(5);
    for (let b = 0; b < 3; b++) { const col = ['90,255,190', '120,160,255', '200,120,255'][b], ph = r() * 6, by = h * (.3 + b * .08);
      for (let x = 0; x < w; x += Math.max(2, w / 500)) { const u = x / w, top = by + Math.sin(u * 5 + ph) * h * .08 + Math.sin(u * 13 + ph * 2) * h * .03, len = h * (.22 + .12 * Math.sin(u * 9 + ph * 3)), a = .1 + .08 * Math.sin(u * 31 + ph) + .05 * Math.sin(u * 77);
        ctx.fillStyle = lg(ctx, 0, top - len, 0, top + len * .3, [[0, `rgba(${col},0)`], [.75, `rgba(${col},${Math.max(0, a)})`], [1, `rgba(${col},0)`]]); ctx.fillRect(x, top - len, Math.max(2, w / 500) + 1, len * 1.3); } }
    ctx.globalCompositeOperation = 'source-over';
    ridgeLayer(ctx, w, h, .84, .2, 61, lg(ctx, 0, h * .6, 0, h, [[0, '#14284a'], [1, '#0c1a34']]), { line: .72, lit: '#bfeee0', shade: '#5a86b4' });
    ridgeLayer(ctx, w, h, .97, .12, 73, '#060b1c');
  } },
  { id: 'grid', name: 'Sun grid', glow: '#ff9aa8', draw(ctx, w, h) {
    ctx.fillStyle = lg(ctx, 0, 0, 0, h * .62, [[0, '#1a0f3c'], [.7, '#6a2a78'], [1, '#e0607a']]); ctx.fillRect(0, 0, w, h);
    stars(ctx, w, h, 90, 9, .4);
    const cx = w * .5, cy = h * .5, R = h * .26;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); ctx.fillStyle = lg(ctx, 0, cy - R, 0, cy + R, [[0, '#ffe08a'], [.5, '#ffb561'], [1, '#ff6a7a']]); ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.fillStyle = '#7a2f78'; for (let i = 0; i < 6; i++) { const yy = cy + R * (.12 + i * .15); ctx.fillRect(cx - R, yy, 2 * R, R * (.02 + i * .012)); } ctx.restore();
    const hy = h * .62; ctx.fillStyle = lg(ctx, 0, hy, 0, h, [[0, '#2a1250'], [1, '#0e0824']]); ctx.fillRect(0, hy, w, h - hy);
    ctx.strokeStyle = 'rgba(255,138,160,.75)'; ctx.lineWidth = Math.max(1, w / 1400);
    for (let i = -24; i <= 24; i++) { ctx.beginPath(); ctx.moveTo(cx + i * w * .012, hy); ctx.lineTo(cx + i * w * .13, h); ctx.stroke(); }
    for (let i = 0; i < 14; i++) { const yy = hy + (h - hy) * Math.pow(i / 14, 2.2); ctx.globalAlpha = .25 + .75 * i / 14; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke(); } ctx.globalAlpha = 1;
  } },
  { id: 'contours', name: 'Contours', glow: '#e0a878', draw(ctx, w, h) {
    ctx.fillStyle = lg(ctx, 0, 0, w, h, [[0, '#2a1638'], [1, '#3e1f3a']]); ctx.fillRect(0, 0, w, h);
    const r = rng(17); const peaks = [[.28, .42, 1], [.72, .6, .8], [.55, .2, .5]];
    ctx.lineWidth = Math.max(1, w / 1500);
    peaks.forEach(([px, py, s], pi) => { const ph = [r() * 6, r() * 6, r() * 6];
      for (let k = 1; k < 16; k++) { const rad = k * h * .045 * s; ctx.strokeStyle = `rgba(255,${170 + pi * 20},${110 + pi * 30},${.75 - k * .04})`; ctx.beginPath();
        for (let a = 0; a <= 6.3; a += .04) { const rr = rad * (1 + .16 * Math.sin(a * 3 + ph[0] + k * .15) + .08 * Math.sin(a * 5 + ph[1]) + .05 * Math.sin(a * 9 + ph[2] + k * .3)); const x = px * w + Math.cos(a) * rr * 1.35, y = py * h + Math.sin(a) * rr; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.closePath(); ctx.stroke(); } });
  } },
  { id: 'ink', name: 'Ink', glow: '#8f9cf0', draw(ctx, w, h) {
    ctx.fillStyle = lg(ctx, 0, 0, w, h, [[0, '#1c1a52'], [.5, '#2c2064'], [1, '#5a2a66']]); ctx.fillRect(0, 0, w, h);
    const r = rng(29); for (let i = 0; i < 7; i++) { const x = r() * w, y = r() * h, R = h * (.25 + r() * .4); const g = ctx.createRadialGradient(x, y, 0, x, y, R); const c = ['255,181,97', '255,138,122', '120,140,255', '170,110,230'][i % 4]; g.addColorStop(0, `rgba(${c},.28)`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  } },
];
const ACCENTS = ['#ffb561', '#ff8a7a', '#8fe0b4', '#9db4ff', '#e6a3ff'];

/* ---------- apps metadata ---------- */
const APPS = [
  { id: 'notes', name: 'Notes', icon: 'notes', c: ['#ffcf7a', '#ff9a5a'], w: .34, h: .58, x: .07, y: .1 },
  { id: 'terminal', name: 'Terminal', icon: 'terminal', c: ['#4a3f86', '#241c52'], w: .4, h: .5, x: .5, y: .14 },
  { id: 'videos', name: 'Videos', icon: 'videos', c: ['#ff8a7a', '#d94a7a'], w: .5, h: .62, x: .24, y: .1 },
  { id: 'paint', name: 'Paint', icon: 'paint', c: ['#7fd8c0', '#3a9aa8'], w: .46, h: .62, x: .3, y: .12 },
  { id: 'beats', name: 'Beats', icon: 'beats', c: ['#c08aff', '#7a4ad8'], w: .52, h: .56, x: .2, y: .18 },
  { id: 'ski', name: 'Slalom', icon: 'ski', c: ['#9db4ff', '#5a6ad8'], w: .36, h: .74, x: .56, y: .05 },
  { id: 'settings', name: 'Settings', icon: 'settings', c: ['#8a84a8', '#4a4468'], w: .36, h: .56, x: .4, y: .2 },
];

const TOPICS = [
  ['Claude Code for people who don\'t code', 'Start in plain language, no programming needed.'],
  ['AI for sales teams', 'AI inside the daily work of selling.'],
  ['From a recorded process to a written guide to an AI skill', 'Record it once, write it down, hand it to AI.'],
  ['Building your own AI operating system', 'One workspace where your AI tools live together.'],
  ['Making bilingual video with AI', 'One idea, told in English and Spanish.'],
];

export function createOS(root, { onExit = () => {}, frozenTime = null } = {}) {
  const frozen = frozenTime != null;
  root.classList.add('ridge'); if (frozen) root.classList.add('frozen');
  root.innerHTML = '';
  const wallCv = h('canvas', 'os-wall'); root.append(wallCv);
  const menubar = h('div', 'os-menubar', `<div class="os-brand">${LOGO}<span>Ridge OS</span></div><div class="os-appname"></div><div class="sp"></div><div class="os-snd"><i></i><span>Sound off</span></div><div class="os-clock"></div><button class="os-exit" title="Escape">${svg('back', 2.2)}Back to the studio</button>`);
  const desktop = h('div', 'os-desktop'); const dock = h('div', 'os-dock');
  root.append(desktop, menubar, dock);
  const appNameEl = menubar.querySelector('.os-appname'), clockEl = menubar.querySelector('.os-clock'), sndEl = menubar.querySelector('.os-snd');
  menubar.querySelector('.os-exit').onclick = () => onExit();
  const updSnd = () => { sndEl.classList.toggle('on', sound.enabled); sndEl.lastChild.textContent = sound.enabled ? 'Sound on' : 'Sound off'; };
  sound.on(updSnd); updSnd();

  const state = { wall: 'dusk', accent: ACCENTS[0], active: false, booted: false, z: 10, wins: new Map(), focus: null, history: [] };
  const wallFns = new Set(); let previewCache = null;
  const wallOf = id => WALLS.find(w => w.id === id) || WALLS[0];

  function paintWall() { const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(2, root.clientWidth * dpr | 0), hh = Math.max(2, root.clientHeight * dpr | 0); wallCv.width = w; wallCv.height = hh; wallOf(state.wall).draw(wallCv.getContext('2d'), w, hh); }
  function setWall(id) { if (!WALLS.some(w => w.id === id)) return false; state.wall = id; previewCache = null; paintWall(); wallFns.forEach(f => f(wallOf(id).glow)); root.dispatchEvent(new CustomEvent('os-wall')); return true; }
  function setAccent(c) { state.accent = c; root.style.setProperty('--accent', c); previewCache = null; root.dispatchEvent(new CustomEvent('os-wall')); }
  new ResizeObserver(() => { paintWall(); state.wins.forEach(w => { keepIn(w); w.api.onResize && w.api.onResize(); }); }).observe(root);

  /* ----- window manager ----- */
  function focusWin(win) { if (state.focus === win) return; state.focus = win; state.wins.forEach(w => w.el.classList.toggle('focus', w === win)); if (win) { win.el.style.zIndex = ++state.z; win.api.onFocus && win.api.onFocus(); } appNameEl.textContent = win ? win.app.name : ''; }
  function keepIn(win) { const W = desktop.clientWidth, H = desktop.clientHeight; if (!W) return; const r = win.rect; r.w = Math.min(r.w, W); r.h = Math.min(r.h, H); r.x = clamp(r.x, 90 - r.w, W - 90); r.y = clamp(r.y, 0, H - 44); Object.assign(win.el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' }); }
  function dragger(target, win, fn) { target.addEventListener('pointerdown', e => { if (e.button || e.target.closest('.os-dot')) return; e.preventDefault(); focusWin(win); if (win.max) return; target.setPointerCapture(e.pointerId); const sx = e.clientX, sy = e.clientY, r0 = { ...win.rect };
    const mv = ev => { fn(ev.clientX - sx, ev.clientY - sy, r0); keepIn(win); win.api.onResize && target.classList.contains('os-rz') && win.api.onResize(); };
    const up = () => { target.removeEventListener('pointermove', mv); target.removeEventListener('pointerup', up); target.removeEventListener('pointercancel', up); };
    target.addEventListener('pointermove', mv); target.addEventListener('pointerup', up); target.addEventListener('pointercancel', up); }); }
  function openApp(id, opts = {}) {
    const app = APPS.find(a => a.id === id); if (!app) return null;
    let win = state.wins.get(id);
    if (win) { win.el.classList.remove('min'); focusWin(null); focusWin(win); win.api.resume && state.active && win.api.resume(); return win; }
    const el = h('div', 'os-win', `<div class="os-titlebar"><div class="os-dots"><button class="os-dot close" aria-label="Close"></button><button class="os-dot mini" aria-label="Minimise"></button><button class="os-dot maxi" aria-label="Maximise"></button></div><div class="os-title">${svg(app.icon)}${app.name}</div></div><div class="os-body"></div><div class="os-rz e"></div><div class="os-rz s"></div><div class="os-rz se"></div>`);
    const W = desktop.clientWidth || 1280, H = desktop.clientHeight || 680;
    win = { app, el, max: false, rect: { x: W * (opts.x ?? app.x), y: H * (opts.y ?? app.y), w: Math.max(380, W * app.w), h: Math.max(300, H * app.h) }, api: {} };
    state.wins.set(id, win); desktop.append(el); keepIn(win);
    win.api = BUILD[id](el.querySelector('.os-body'), win) || {};
    el.addEventListener('pointerdown', () => focusWin(win), true);
    dragger(el.querySelector('.os-titlebar'), win, (dx, dy, r0) => { win.rect.x = r0.x + dx; win.rect.y = r0.y + dy; });
    dragger(el.querySelector('.os-rz.e'), win, (dx, dy, r0) => { win.rect.w = Math.max(300, r0.w + dx); });
    dragger(el.querySelector('.os-rz.s'), win, (dx, dy, r0) => { win.rect.h = Math.max(220, r0.h + dy); });
    dragger(el.querySelector('.os-rz.se'), win, (dx, dy, r0) => { win.rect.w = Math.max(300, r0.w + dx); win.rect.h = Math.max(220, r0.h + dy); });
    el.querySelector('.close').onclick = () => closeApp(id);
    el.querySelector('.mini').onclick = () => { el.classList.add('min'); win.api.pause && win.api.pause(); focusTop(); };
    const toggleMax = () => { if (!win.max) { win.saved = { ...win.rect }; win.rect = { x: 0, y: 0, w: desktop.clientWidth, h: desktop.clientHeight }; } else win.rect = win.saved; win.max = !win.max; keepIn(win); win.api.onResize && win.api.onResize(); };
    el.querySelector('.maxi').onclick = toggleMax; el.querySelector('.os-titlebar').ondblclick = toggleMax;
    dockBtns[id].classList.add('open'); focusWin(win);
    if (!state.active && win.api.pause) win.api.pause();
    return win;
  }
  function focusTop() { let top = null; state.wins.forEach(w => { if (!w.el.classList.contains('min') && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w; }); state.focus = null; focusWin(top); if (!top) state.wins.forEach(w => w.el.classList.remove('focus')); }
  function closeApp(id) { const win = state.wins.get(id); if (!win) return; win.api.pause && win.api.pause(); win.api.destroy && win.api.destroy(); state.wins.delete(id); dockBtns[id].classList.remove('open'); win.el.classList.add('closing'); setTimeout(() => win.el.remove(), frozen ? 0 : 150); focusTop(); }

  const dockBtns = {};
  APPS.forEach(a => { const b = h('button', 'os-dockbtn', `${svg(a.icon, 1.6)}<span>${a.name}</span>`); b.style.background = `linear-gradient(150deg, ${a.c[0]}, ${a.c[1]})`; b.dataset.app = a.id; b.onclick = () => { const w = state.wins.get(a.id); if (w && state.focus === w && !w.el.classList.contains('min')) { w.el.classList.add('min'); w.api.pause && w.api.pause(); focusTop(); } else openApp(a.id); }; dock.append(b); dockBtns[a.id] = b; });

  /* ----- sound helpers ----- */
  let noiseBuf = null;
  const VOICES = {
    kick(t, c) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + .14); g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(.001, t + .38); o.connect(g).connect(sound.master); o.start(t); o.stop(t + .4); },
    noise(t, c, type, freq, dur, vol) { if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(f).connect(g).connect(sound.master); s.start(t, Math.random() * .5); s.stop(t + dur + .02); },
    snare(t, c) { this.noise(t, c, 'highpass', 1400, .2, .6); const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + .1); g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .14); o.connect(g).connect(sound.master); o.start(t); o.stop(t + .16); },
    hat(t, c) { this.noise(t, c, 'highpass', 7500, .06, .3); },
    clap(t, c) { this.noise(t, c, 'bandpass', 1300, .05, .5); this.noise(t + .012, c, 'bandpass', 1300, .05, .5); this.noise(t + .026, c, 'bandpass', 1300, .2, .5); },
    pluck(t, c, f) { const o = c.createOscillator(), o2 = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2.005; fl.type = 'lowpass'; fl.Q.value = 4; fl.frequency.setValueAtTime(3200, t); fl.frequency.exponentialRampToValueAtTime(300, t + .35); g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.22, t + .008); g.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(fl); o2.connect(fl); fl.connect(g).connect(sound.master); o.start(t); o2.start(t); o.stop(t + .65); o2.stop(t + .65); },
  };
  function play(voice, f) { if (!sound.enabled || !sound.ctx || !state.active) return; const c = sound.ctx; VOICES[voice](c.currentTime + .005, c, f); }
  function blip(f = 660) { play('pluck', f); }

  /* ----- app builders ----- */
  const BUILD = {};

  // terminal
  const FS = { 'readme.txt': 'Welcome to Ridge OS. Type help to see what this shell can do.\nTry: ls work, cat about.txt, open ski, wallpaper aurora, coffee',
    'about.txt': 'Carlos Acuña, founder of Fiba Labs.\nFiba Labs is AI mentoring: it teaches people and teams to use AI in their own daily work.\nBefore that: a long career in enterprise sales, channels and customer success across Latin America (IBM, Oracle, Red Hat).\nWorks in English and Spanish. Site: fibalabs.com',
    work: { 'workshops.txt': 'Hands-on Claude Code workshops.\nYou bring your own daily work and leave with it running.', 'mentoring.txt': 'One-to-one AI mentoring.\nYour work, your pace, your questions.', 'start-kits.txt': 'Start kits that set a team up with AI tools.', 'recorder.txt': 'A recorder that turns a screen recording of a work process into a step-by-step guide.' },
    courses: { 'topics.txt': TOPICS.map(t => '- ' + t[0]).join('\n') },
    secrets: { 'plan.txt': 'Step one: teach people to use AI in their own work.\nStep two: repeat step one.' } };
  BUILD.terminal = (body) => {
    const out = h('div', 'os-term os-scroll'); body.append(out);
    const line = h('div', 'os-termline', `<span class="p"></span><input spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Terminal input">`); const input = line.querySelector('input'), promptEl = line.querySelector('.p');
    let cwd = [], hi = -1;
    const node = p => p.reduce((n, k) => (n && typeof n === 'object' ? n[k] : undefined), FS);
    const resolve = arg => { let p = arg.startsWith('/') || arg.startsWith('~') ? [] : [...cwd]; arg.replace(/^~\/?/, '').split('/').filter(Boolean).forEach(s => { if (s === '..') p.pop(); else if (s !== '.') p.push(s); }); return p; };
    const prompt = () => `<span class="g">carlos</span><span class="d">@</span><span class="b">ridge</span> <span class="a">~${cwd.length ? '/' + cwd.join('/') : ''}</span> <span class="d">$</span>`;
    const print = html => { const d = h('div', '', html); out.insertBefore(d, line); return d; };
    const setPrompt = () => promptEl.innerHTML = prompt();
    const banner = () => { const art = ['        <span class="a">o</span>      ', '   <span class="w">/\\</span>          ', '  <span class="w">/</span><span class="c">\\/</span><span class="w">\\    /\\</span>   ', ' <span class="w">/    \\/\\/  \\</span>  ', '<span class="w">/            \\</span> '];
      const info = ['<span class="a">carlos</span><span class="d">@</span><span class="a">ridge</span>', '<span class="c">os</span>      Ridge OS', '<span class="c">host</span>    an ultrawide monitor in a studio', '<span class="c">work</span>    Fiba Labs, AI mentoring', '<span class="c">speaks</span>  English, Spanish']; art.forEach((a, i) => print(a + '   ' + info[i])); print(' '); };
    const CMDS = {
      help: () => print('<span class="a">files</span>   ls, cd, cat, pwd\n<span class="a">system</span>  open &lt;app&gt;, apps, wallpaper &lt;name&gt;, accent, banner, date, whoami, history, clear, exit\n<span class="a">fun</span>     coffee, sudo, hola, fortune, rm -rf /, ski'),
      ls: a => { const n = node(resolve(a[0] || '.')); if (n === undefined) return print(`ls: ${esc(a[0])}: no such file or folder`); if (typeof n === 'string') return print(esc(a[0])); print(Object.keys(n).map(k => typeof n[k] === 'object' ? `<span class="b">${k}/</span>` : k).join('   ')); },
      cd: a => { const p = resolve(a[0] || '~'), n = node(p); if (n === undefined || typeof n === 'string') return print(`cd: ${esc(a[0])}: not a folder`); cwd = p; },
      cat: a => { if (!a[0]) return print('cat: which file? Try cat about.txt'); const n = node(resolve(a[0])); if (n === undefined) return print(`cat: ${esc(a[0])}: no such file`); if (typeof n === 'object') return print(`cat: ${esc(a[0])}: is a folder, try ls ${esc(a[0])}`); print(esc(n)); },
      pwd: () => print('/home/carlos' + (cwd.length ? '/' + cwd.join('/') : '')),
      echo: a => print(esc(a.join(' '))),
      date: () => print(esc(new Date().toString())),
      whoami: () => print('carlos <span class="d">(founder of Fiba Labs, speaks English and Spanish)</span>'),
      clear: () => { [...out.children].forEach(c => c !== line && c.remove()); },
      history: () => print(state.history.map((c, i) => `<span class="d">${String(i + 1).padStart(3)}</span>  ${esc(c)}`).join('\n') || 'nothing yet'),
      apps: () => print(APPS.map(a => `<span class="a">${a.id}</span>`).join('  ')),
      open: a => { const id = (a[0] || '').toLowerCase(), app = APPS.find(x => x.id === id || x.name.toLowerCase() === id); if (!app) return print('open: try one of ' + APPS.map(x => x.id).join(', ')); print(`opening ${app.name}`); setTimeout(() => openApp(app.id), 60); },
      wallpaper: a => { if (setWall(a[0])) print(`wallpaper set to <span class="a">${a[0]}</span>`); else print('wallpapers: ' + WALLS.map(w => `<span class="a">${w.id}</span>`).join('  ')); },
      theme: a => CMDS.wallpaper(a),
      accent: () => { const c = ACCENTS[(ACCENTS.indexOf(state.accent) + 1) % ACCENTS.length]; setAccent(c); print(`accent is now <span style="color:${c}">${c}</span>`); },
      banner: banner, neofetch: banner,
      exit: () => { print('back to the studio'); setTimeout(onExit, 150); },
      sudo: a => print(a.join(' ') === 'make me a sandwich' ? 'Okay.' : '<span class="c">carlos is not in the sudoers file.</span> This incident will be mentioned at the next workshop.'),
      coffee: () => { print('<span class="d">   ( (\n    ) )\n  ........\n  |      |]\n  \\      /\n   `----\'</span>\nOne espresso, pulled. The real machine is in the corner of the room.'); blip(520); },
      hola: () => print('Hola. Aquí también se trabaja en español.'),
      fortune: () => print(['The best prompt is the one about your own work.', 'Record the process once. Let the guide write itself.', 'A team that learns together ships together.', 'There is no cloud, only a monitor in a studio at dusk.'][Math.random() * 4 | 0]),
      rm: a => { if (a.join(' ').includes('-rf')) { const d = print('<span class="c">deleting everything</span>'); let n = 0; const iv = setInterval(() => { d.innerHTML += ' .'; if (++n > 5) { clearInterval(iv); print('Just kidding. The mountains are still there.'); out.scrollTop = 1e6; } }, frozen ? 0 : 160); } else print('rm: nothing was removed. This file system is fond of its files.'); },
      ski: () => CMDS.open(['ski']), make: () => print('make: nothing to make. Try coffee.'), vim: () => print('You are inside vim now. Just kidding, you can leave.'), ls_: null,
    };
    function run(raw) { const cmd = raw.trim(); print(prompt() + ' ' + esc(raw)); if (!cmd) return; state.history.push(cmd); hi = -1; const [name, ...args] = cmd.split(/\s+/); const fn = CMDS[name.toLowerCase()]; if (fn) fn(args); else print(`${esc(name)}: command not found. Type <span class="a">help</span>.`); setPrompt(); out.scrollTop = 1e6; }
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const v = input.value; input.value = ''; run(v); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const H = state.history; if (!H.length) return; hi = hi < 0 ? H.length : hi; hi = clamp(hi + (e.key === 'ArrowUp' ? -1 : 1), 0, H.length); input.value = H[hi] || ''; }
      else if (e.key === 'Tab') { e.preventDefault(); const parts = input.value.split(' '), last = parts.pop(); let pool; if (!parts.length) pool = Object.keys(CMDS).filter(k => CMDS[k]); else { const segs = last.split('/'), frag = segs.pop(), n = node(resolve(segs.join('/') || '.')); pool = n && typeof n === 'object' ? Object.keys(n).map(k => [...segs, k].join('/')) : []; if (parts[0] === 'open') pool = APPS.map(a => a.id); if (parts[0] === 'wallpaper') pool = WALLS.map(w => w.id); }
        const m = pool.filter(k => k.startsWith(last)); if (m.length === 1) input.value = [...parts, m[0]].join(' '); else if (m.length > 1) { print(m.join('   ')); out.scrollTop = 1e6; } }
      if (e.key !== 'Escape') e.stopPropagation();
    });
    out.append(line); setPrompt(); banner(); print('Type <span class="a">help</span> for commands. Escape returns to the studio.');
    out.addEventListener('click', () => { if (!String(window.getSelection())) input.focus({ preventScroll: true }); });
    return { onFocus() { if (!frozen && state.active) setTimeout(() => input.focus({ preventScroll: true }), 0); }, run };
  };

  // notes
  BUILD.notes = (body) => {
    const pages = { About: `<h2>Hello, I'm <span>Carlos Acuña</span></h2><p>I'm the founder of <b>Fiba Labs</b>. Fiba Labs is AI mentoring: it teaches people and teams to use AI in their own daily work.</p><p>Before that came a long career in enterprise sales, channels and customer success across Latin America, at IBM, Oracle and Red Hat.</p><p>I work in English and Spanish.</p><p><span class="tag">AI mentoring</span><span class="tag">Claude Code</span><span class="tag">English</span><span class="tag">Español</span></p><p>The work lives at <a href="https://fibalabs.com" target="_blank" rel="noopener">fibalabs.com</a></p>`,
      'What I offer': `<h2>What <span>Fiba Labs</span> offers</h2><ul><li><b>Claude Code workshops</b>Hands-on sessions where you work on your own tasks.</li><li><b>One-to-one AI mentoring</b>A guide beside you while you learn to use AI in your work.</li><li><b>Start kits</b>Kits that set a team up with AI tools.</li><li><b>The recorder</b>Turns a screen recording of a work process into a step-by-step guide.</li></ul>`,
      'Course topics': `<h2>Course and <span>video topics</span></h2><ul>${TOPICS.map(t => `<li><b>${t[0]}</b>${t[1]}</li>`).join('')}</ul>`,
      Scratchpad: null };
    let scratch = 'Write here. Nothing leaves this monitor.\n\nIdeas for the next workshop:\n';
    const wrap = h('div', 'os-notes'), list = h('div', 'os-noteslist'), view = h('div', 'os-note os-scroll'); wrap.append(list, view); body.append(wrap);
    const show = k => { [...list.children].forEach(b => b.classList.toggle('on', b.textContent === k)); if (pages[k]) view.innerHTML = pages[k]; else { view.innerHTML = ''; const ta = h('textarea'); ta.value = scratch; ta.spellcheck = false; ta.oninput = () => scratch = ta.value; ta.addEventListener('keydown', e => { if (e.key === 'Escape') ta.blur(); e.stopPropagation(); }); view.append(ta); } view.scrollTop = 0; };
    Object.keys(pages).forEach(k => { const b = h('button', '', k); b.onclick = () => show(k); list.append(b); }); show('About');
  };

  // videos
  function thumb(ctx, w, hh, i, t = 0) {
    const pal = [['#2a1c5a', '#6a3a8a'], ['#5a2350', '#d0587a'], ['#1c3a5a', '#3a8a9a'], ['#3a1c5a', '#8a5ad0'], ['#5a3320', '#e08a5a']][i];
    ctx.fillStyle = lg(ctx, 0, 0, w, hh, [[0, pal[0]], [1, pal[1]]]); ctx.fillRect(0, 0, w, hh);
    const u = w / 320; ctx.lineWidth = 3 * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff';
    const rr = (x, y, a, b, r) => { ctx.beginPath(); ctx.roundRect(x * u, y * u, a * u, b * u, r * u); };
    if (i === 0) { rr(70, 40, 180, 100, 10); ctx.fillStyle = 'rgba(10,6,30,.75)'; ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#ffb561'; ctx.beginPath(); ctx.moveTo(92 * u, 70 * u); ctx.lineTo(108 * u, 82 * u); ctx.lineTo(92 * u, 94 * u); ctx.stroke(); ctx.strokeStyle = '#fff'; const n = 1 + Math.floor(t * 3) % 6; ctx.beginPath(); ctx.moveTo(120 * u, 94 * u); ctx.lineTo((120 + n * 16) * u, 94 * u); ctx.stroke(); ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(92 * u, 116 * u); ctx.lineTo(200 * u, 116 * u); ctx.stroke(); ctx.globalAlpha = 1; }
    if (i === 1) { for (let k = 0; k < 4; k++) { const wv = 190 - k * 42; rr(160 - wv / 2, 36 + k * 28, wv, 20, 10); ctx.fillStyle = `rgba(255,255,255,${.25 + k * .22 + .12 * Math.sin(t * 3 - k)})`; ctx.fill(); } ctx.fillStyle = '#ffb561'; ctx.beginPath(); ctx.arc(160 * u, 158 * u, (7 + Math.sin(t * 4)) * u, 0, 7); ctx.fill(); }
    if (i === 2) { const xs = [50, 130, 210]; xs.forEach((x, k) => { rr(x, 60, 60, 60, 10); ctx.fillStyle = 'rgba(10,6,30,.55)'; ctx.fill(); ctx.stroke(); if (k < 2) { ctx.beginPath(); ctx.moveTo((x + 64) * u, 90 * u); ctx.lineTo((x + 76) * u, 90 * u); ctx.stroke(); } });
      ctx.fillStyle = '#ff6a6a'; ctx.globalAlpha = .6 + .4 * Math.sin(t * 5); ctx.beginPath(); ctx.arc(80 * u, 90 * u, 12 * u, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.beginPath(); [78, 90, 102].forEach(y => { ctx.moveTo(144 * u, y * u); ctx.lineTo(176 * u, y * u); }); ctx.stroke();
      ctx.strokeStyle = '#ffb561'; ctx.beginPath(); for (let a = 0; a < 4; a++) { const an = a * Math.PI / 4 + t; ctx.moveTo((240 + Math.cos(an) * 16) * u, (90 + Math.sin(an) * 16) * u); ctx.lineTo((240 - Math.cos(an) * 16) * u, (90 - Math.sin(an) * 16) * u); } ctx.stroke(); }
    if (i === 3) { rr(60, 34, 200, 112, 10); ctx.fillStyle = 'rgba(10,6,30,.55)'; ctx.fill(); ctx.stroke(); [[76, 50, 70, 40], [156, 50, 88, 26], [156, 84, 88, 30], [76, 98, 70, 16]].forEach(([x, y, a, b], k) => { rr(x, y, a, b, 5); ctx.fillStyle = k === (Math.floor(t * 1.5) % 4) ? '#ffb561' : 'rgba(255,255,255,.3)'; ctx.fill(); }); ctx.beginPath(); ctx.moveTo(130 * u, 160 * u); ctx.lineTo(190 * u, 160 * u); ctx.stroke(); }
    if (i === 4) { rr(54, 44, 110, 70, 16); ctx.fillStyle = 'rgba(10,6,30,.6)'; ctx.fill(); ctx.stroke(); rr(156, 74, 110, 70, 16); ctx.fillStyle = '#ffb561'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.font = `700 ${30 * u}px 'Instrument Sans', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('EN', 109 * u, (80 + Math.sin(t * 3) * 2) * u); ctx.fillStyle = '#3a1c20'; ctx.fillText('ES', 211 * u, (110 - Math.sin(t * 3) * 2) * u); }
  }
  BUILD.videos = (body, win) => {
    let raf = 0, cur = -1, stage = null;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const grid = () => { cancelAnimationFrame(raf); cur = -1; body.innerHTML = ''; const g = h('div', 'os-videos os-scroll'); TOPICS.forEach((t, i) => { const c = h('button', 'os-vcard', `<canvas width="${320 * dpr}" height="${180 * dpr}"></canvas><div>${t[0]}<small>${t[1]}</small></div>`); thumb(c.querySelector('canvas').getContext('2d'), 320 * dpr, 180 * dpr, i, .4); c.onclick = () => detail(i); g.append(c); }); body.append(g); };
    const frame = () => { if (cur < 0 || !stage) return; const r = stage.parentElement.getBoundingClientRect(); const w = Math.max(2, r.width * dpr | 0), hh = Math.max(2, r.height * dpr | 0); if (stage.width !== w || stage.height !== hh) { stage.width = w; stage.height = hh; } const ctx = stage.getContext('2d'); const s = Math.min(w / 320, hh / 180); ctx.fillStyle = '#0c0820'; ctx.fillRect(0, 0, w, hh); ctx.save(); ctx.translate((w - 320 * s) / 2, (hh - 180 * s) / 2); ctx.beginPath(); ctx.rect(0, 0, 320 * s, 180 * s); ctx.clip(); thumb(ctx, 320 * s, 180 * s, cur, frozen ? .4 : performance.now() / 1000); ctx.restore(); if (!frozen && state.active) raf = requestAnimationFrame(frame); };
    const detail = i => { cur = i; body.innerHTML = ''; const d = h('div', 'os-vdetail', `<div class="os-bar"><button class="os-btn">${svg('back', 2)}All topics</button></div><div class="os-vstage"><canvas></canvas></div><div class="os-vinfo"><h3>${TOPICS[i][0]}</h3><p>${TOPICS[i][1]} A course and video topic by Carlos Acuña at Fiba Labs.</p></div>`); d.querySelector('button').onclick = grid; stage = d.querySelector('canvas'); body.append(d); blip(440 + i * 60); frame(); };
    grid();
    return { pause() { cancelAnimationFrame(raf); }, resume() { cancelAnimationFrame(raf); frame(); }, onResize() { if (cur >= 0 && (frozen || !state.active)) frame(); } };
  };

  // paint
  BUILD.paint = (body) => {
    const cols = ['#221a3a', '#ff8a7a', '#ffb561', '#f6d860', '#7fd8a0', '#5ab4e0', '#8f7be0', '#ffffff'];
    const bar = h('div', 'os-bar'), wrap = h('div', 'os-paintwrap'), cv = h('canvas'); wrap.append(cv); body.append(bar, wrap);
    let col = cols[1], size = 8, erase = false; const ctx = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    cols.forEach(c => { const b = h('button', 'os-swatch'); b.style.background = c; b.title = c; b.onclick = () => { col = c; erase = false; upd(); }; bar.append(b); });
    bar.append(h('div', 'os-sep'));
    [4, 8, 18].forEach(s => { const b = h('button', 'os-btn os-size', `<i style="width:${s * .8 + 2}px;height:${s * .8 + 2}px"></i>`); b.dataset.s = s; b.title = 'Brush size'; b.onclick = () => { size = s; upd(); }; bar.append(b); });
    const er = h('button', 'os-btn', 'Eraser'), cl = h('button', 'os-btn', 'Clear'), sv = h('button', 'os-btn primary', 'Save PNG'); bar.append(h('div', 'os-sep'), er, cl, sv);
    const upd = () => { [...bar.querySelectorAll('.os-swatch')].forEach((b, i) => b.classList.toggle('on', !erase && cols[i] === col)); [...bar.querySelectorAll('.os-size')].forEach(b => b.classList.toggle('on', +b.dataset.s === size)); er.classList.toggle('on', erase); };
    const bg = () => { ctx.fillStyle = '#f5ede3'; ctx.fillRect(0, 0, cv.width, cv.height); };
    const doodle = () => { const w = cv.width, hh = cv.height; ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = 7 * dpr; ctx.strokeStyle = '#ffb561'; ctx.beginPath(); ctx.arc(w * .72, hh * .3, hh * .09, 0, 7); ctx.stroke(); ctx.strokeStyle = '#8f7be0'; ctx.beginPath(); const r = rng(4); [[.08, .8], [.26, .42], [.36, .6], [.5, .3], [.66, .62], [.78, .5], [.93, .8]].forEach(([x, y], i) => { const px = (x + (r() - .5) * .01) * w, py = (y + (r() - .5) * .02) * hh; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); ctx.strokeStyle = '#ff8a7a'; ctx.lineWidth = 5 * dpr; ctx.beginPath(); ctx.moveTo(w * .44, hh * .4); ctx.lineTo(w * .5, hh * .46); ctx.lineTo(w * .56, hh * .41); ctx.stroke(); };
    let first = true;
    const fit = () => { const w = Math.max(2, wrap.clientWidth * dpr | 0), hh = Math.max(2, wrap.clientHeight * dpr | 0); if (w === cv.width && hh === cv.height) return; const old = first ? null : h('canvas'); if (old) { old.width = cv.width; old.height = cv.height; old.getContext('2d').drawImage(cv, 0, 0); } cv.width = w; cv.height = hh; bg(); if (old) ctx.drawImage(old, 0, 0); else doodle(); first = false; };
    let last = null;
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    const seg = (a, b) => { ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = erase ? '#f5ede3' : col; ctx.lineWidth = (erase ? size * 2.5 : size) * dpr; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); last = pos(e); seg(last, [last[0] + .01, last[1]]); });
    cv.addEventListener('pointermove', e => { if (!last) return; const p = pos(e); seg(last, p); last = p; });
    const end = () => last = null; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    er.onclick = () => { erase = !erase; upd(); }; cl.onclick = () => { bg(); blip(300); };
    sv.onclick = () => { const a = h('a'); a.download = 'ridge-painting.png'; a.href = cv.toDataURL('image/png'); a.click(); sv.textContent = 'Saved'; setTimeout(() => sv.textContent = 'Save PNG', 1200); };
    upd(); requestAnimationFrame(fit); fit();
    return { onResize: fit };
  };

  // beats
  BUILD.beats = (body) => {
    const PADS = [['A', 'Kick', 'kick', 0, '#ff8a7a'], ['S', 'Snare', 'snare', 0, '#ffb561'], ['D', 'Hat', 'hat', 0, '#f6d860'], ['F', 'Clap', 'clap', 0, '#8fe0b4'], ['G', 'Low', 'pluck', 196, '#5ab4e0'], ['H', 'Mid', 'pluck', 261.6, '#9db4ff'], ['J', 'High', 'pluck', 329.6, '#c08aff'], ['K', 'Top', 'pluck', 392, '#e6a3ff']];
    const ROWS = [[0, 'Kick', 'x...x...x..x.x..'], [1, 'Snare', '....x.......x...'], [2, 'Hat', 'x.x.x.xxx.x.x.xx'], [4, 'Low', 'x.....x...x.....'], [6, 'High', '...x.x...x....x.']];
    const bar = h('div', 'os-bar', `<button class="os-btn primary snd"></button><button class="os-btn pl">Stop</button><button class="os-btn cl">Clear</button><div class="os-sep"></div><small>Tempo</small><input type="range" min="70" max="160" value="108" aria-label="Tempo"><div style="flex:1"></div><small>Keys A S D F G H J K play the pads</small>`);
    const wrap = h('div', 'os-beats'), pads = h('div', 'os-pads'), seq = h('div', 'os-seq'); wrap.append(pads, seq); body.append(bar, wrap);
    const sndB = bar.querySelector('.snd'), plB = bar.querySelector('.pl'), tempo = bar.querySelector('input');
    const updS = () => { sndB.textContent = sound.enabled ? 'Sound on' : 'Enable sound'; sndB.classList.toggle('primary', !sound.enabled); }; const off = sound.on(updS); updS();
    sndB.onclick = () => { sound.toggle(); if (sound.enabled) hit(4); };
    const padEls = PADS.map((p, i) => { const b = h('button', 'os-pad', `<b>${p[0]}</b><em>${p[1]}</em>`); b.style.setProperty('--pc', p[4]); b.addEventListener('pointerdown', () => hit(i)); pads.append(b); return b; });
    function hit(i) { const p = PADS[i], el = padEls[i]; play(p[2], p[3]); el.classList.add('hit'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('hit'), 110); }
    const grid = ROWS.map(([pi, name, pat]) => { seq.append(h('label', '', name)); return [...pat].map((ch, s) => { const b = h('button', 'os-step' + (s % 4 === 0 ? ' q' : '') + (ch === 'x' ? ' on' : '')); b.style.setProperty('--pc', PADS[pi][4]); b.onclick = () => { b.classList.toggle('on'); if (b.classList.contains('on')) hit(pi); }; seq.append(b); return b; }); });
    let step = -1, timer = 0, playing = !frozen;
    const tick = () => { grid.forEach(r => r[step] && r[step].classList.remove('now')); step = (step + 1) % 16; grid.forEach((r, ri) => { r[step].classList.add('now'); if (r[step].classList.contains('on')) hit(ROWS[ri][0]); }); timer = setTimeout(tick, 60000 / tempo.value / 4); };
    const start = () => { clearTimeout(timer); if (playing && state.active && !frozen) timer = setTimeout(tick, 120); plB.textContent = playing ? 'Stop' : 'Play'; };
    plB.onclick = () => { playing = !playing; start(); };
    bar.querySelector('.cl').onclick = () => grid.flat().forEach(b => b.classList.remove('on'));
    start();
    return { onKey(e) { if (e.type !== 'keydown' || e.repeat) return; const i = 'asdfghjk'.indexOf(e.key.toLowerCase()); if (i >= 0) hit(i); if (e.key === ' ') { e.preventDefault(); plB.onclick(); } }, pause() { clearTimeout(timer); }, resume: start, destroy() { clearTimeout(timer); off(); } };
  };

  // slalom
  BUILD.ski = (body) => {
    const wrap = h('div', 'os-game'), cv = h('canvas'); wrap.append(cv); body.append(wrap); const ctx = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 2, H = 2, raf = 0, lastT = 0, g, best = 0, keys = {}, mouseX = null;
    const reset = demo => { g = { demo, x: .5, vx: 0, speed: .42, dist: 0, next: .5, score: 0, objs: [], over: false, trail: [], flash: 0, r: rng(demo ? 3 : (Math.random() * 1e6) | 0), lastGateX: .5 }; };
    const fit = () => { W = Math.max(2, wrap.clientWidth * dpr | 0); H = Math.max(2, wrap.clientHeight * dpr | 0); cv.width = W; cv.height = H; if (frozen || !state.active) draw(); };
    const SY = .3;
    function update(dt) {
      if (g.over) return;
      g.speed = Math.min(1.05, .42 + g.dist * .012); const dy = g.speed * dt; g.dist += dy;
      g.next -= dy; if (g.next <= 0) { g.next = .34; const gx = clamp(g.lastGateX + (g.r() - .5) * .55, .2, .8); g.lastGateX = gx; g.objs.push({ t: 'gate', x: gx, y: 1.08, w: Math.max(.17, .26 - g.dist * .002) }); for (let k = 0; k < 2; k++) { const tx = g.r(); if (Math.abs(tx - gx) > .2) g.objs.push({ t: 'tree', x: tx, y: 1.08 + .17 + g.r() * .1, s: .8 + g.r() * .5 }); } }
      let target = null;
      if (g.demo) { const ng = g.objs.find(o => o.t === 'gate' && o.y > SY); target = ng ? ng.x : .5; }
      else if (keys.ArrowLeft || keys.a) g.vx -= 3.2 * dt; else if (keys.ArrowRight || keys.d) g.vx += 3.2 * dt; else if (mouseX != null) target = mouseX;
      if (target != null) g.vx += ((target - g.x) * 7 - g.vx) * Math.min(1, dt * 9); else g.vx *= 1 - Math.min(1, dt * 5);
      g.vx = clamp(g.vx, -1.2, 1.2); g.x = clamp(g.x + g.vx * dt, .04, .96);
      g.trail.push({ x: g.x, y: SY }); g.trail.forEach(p => p.y -= dy); while (g.trail.length && g.trail[0].y < -.05) g.trail.shift();
      for (const o of g.objs) { const py = o.y; o.y -= dy;
        if (o.t === 'gate' && !o.done && py >= SY && o.y < SY) { o.done = true; if (Math.abs(g.x - o.x) < o.w / 2) { g.score++; o.ok = true; g.flash = 1; if (!g.demo) blip(520 + (g.score % 8) * 60); } else { o.miss = true; if (!g.demo) play('hat'); } }
        if (o.t === 'tree' && !g.demo && Math.abs(o.y - SY) < .022 && Math.abs(o.x - g.x) * W < .03 * H * o.s + .012 * W) { g.over = true; best = Math.max(best, g.score); play('snare'); } }
      g.objs = g.objs.filter(o => o.y > -.2); g.flash = Math.max(0, g.flash - dt * 3);
    }
    function draw() {
      const u = H / 600;
      ctx.fillStyle = lg(ctx, 0, 0, W, H, [[0, '#f1e9f6'], [.6, '#d6cdee'], [1, '#b9aee4']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(140,120,210,.08)'; for (let k = 0; k < 7; k++) { const yy = (((k * .17 - g.dist * 1) % 1.2) + 1.2) % 1.2 - .1; ctx.beginPath(); ctx.ellipse(W * (.15 + (k * .37) % .8), yy * H, W * .22, H * .035, -.15, 0, 7); ctx.fill(); }
      ctx.strokeStyle = 'rgba(110,95,190,.35)'; ctx.lineWidth = 2.2 * u; for (const off of [-5, 5]) { ctx.beginPath(); g.trail.forEach((p, i) => { const x = p.x * W + off * u, y = p.y * H; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
      const sorted = [...g.objs].sort((a, b) => a.y - b.y);
      for (const o of sorted) { const x = o.x * W, y = o.y * H;
        if (o.t === 'tree') { const s = 30 * u * o.s; ctx.fillStyle = 'rgba(90,70,170,.25)'; ctx.beginPath(); ctx.ellipse(x + s * .5, y + s * .1, s * .9, s * .22, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - s * .08, y - s * .2, s * .16, s * .3); for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#2b2a5e', '#35357a', '#42439a'][k]; ctx.beginPath(); ctx.moveTo(x, y - s * (1.9 - k * .1) - k * s * .0); ctx.lineTo(x - s * (.62 - k * .13), y - s * (.2 + k * .5)); ctx.lineTo(x + s * (.62 - k * .13), y - s * (.2 + k * .5)); ctx.fill(); } ctx.fillStyle = '#f6f0ff'; ctx.beginPath(); ctx.moveTo(x, y - s * 1.9); ctx.lineTo(x - s * .16, y - s * 1.5); ctx.lineTo(x + s * .16, y - s * 1.5); ctx.fill(); }
        else for (const sd of [-1, 1]) { const fx = x + sd * o.w / 2 * W; const c = o.ok ? '#4ac08a' : o.miss ? '#9a92b8' : sd < 0 ? '#ff6a6a' : '#ffa53a'; ctx.strokeStyle = '#3a2f66'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, y - 34 * u); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(fx, y - 34 * u); ctx.lineTo(fx - sd * 20 * u, y - 27 * u); ctx.lineTo(fx, y - 20 * u); ctx.fill(); ctx.fillStyle = 'rgba(90,70,170,.25)'; ctx.beginPath(); ctx.ellipse(fx + 5 * u, y, 8 * u, 2.5 * u, 0, 0, 7); ctx.fill(); }
      }
      // skier
      const sx = g.x * W, sy = SY * H, lean = clamp(g.vx * .5, -.5, .5); ctx.save(); ctx.translate(sx, sy); ctx.scale(1.35, 1.35); if (g.over) ctx.rotate(1.3);
      ctx.fillStyle = 'rgba(90,70,170,.3)'; ctx.beginPath(); ctx.ellipse(6 * u, 4 * u, 14 * u, 5 * u, 0, 0, 7); ctx.fill();
      ctx.rotate(lean); ctx.strokeStyle = '#2a2050'; ctx.lineWidth = 3 * u; ctx.lineCap = 'round'; for (const o of [-5, 5]) { ctx.beginPath(); ctx.moveTo(o * u, -16 * u); ctx.lineTo(o * u, 16 * u); ctx.stroke(); }
      ctx.fillStyle = '#ff7a5a'; ctx.beginPath(); ctx.roundRect(-8 * u, -14 * u, 16 * u, 18 * u, 6 * u); ctx.fill(); ctx.fillStyle = '#ffd9b8'; ctx.beginPath(); ctx.arc(0, -19 * u, 6.5 * u, 0, 7); ctx.fill(); ctx.fillStyle = '#ffb561'; ctx.beginPath(); ctx.arc(0, -21 * u, 6.5 * u, Math.PI, 0); ctx.fill(); ctx.restore();
      // text
      ctx.fillStyle = '#2a2050'; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.font = `700 ${22 * u}px 'Instrument Sans', sans-serif`;
      if (!g.demo) { ctx.fillText(`Gates ${g.score}`, 16 * u, 14 * u); if (best) { ctx.font = `500 ${14 * u}px 'Instrument Sans', sans-serif`; ctx.fillText(`Best ${best}`, 16 * u, 42 * u); } }
      if (g.flash > 0) { ctx.globalAlpha = g.flash * .25; ctx.fillStyle = '#4ac08a'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (g.demo || g.over) { ctx.fillStyle = 'rgba(30,20,70,.72)'; const bw = Math.min(W * .86, 330 * u), bh = 104 * u; ctx.beginPath(); ctx.roundRect((W - bw) / 2, H * .56, bw, bh, 16 * u); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `700 ${24 * u}px 'Instrument Sans', sans-serif`; ctx.fillText(g.over ? `Wipeout. Gates ${g.score}` : 'Dusk slalom', W / 2, H * .56 + 18 * u); ctx.font = `500 ${14.5 * u}px 'Instrument Sans', sans-serif`; ctx.fillStyle = '#ffcf9a'; ctx.fillText(g.over ? 'Click or press space to ski again' : 'Click or press space to ski', W / 2, H * .56 + 54 * u); ctx.fillStyle = '#cfc6ea'; ctx.fillText('Mouse or arrow keys steer. Mind the trees.', W / 2, H * .56 + 76 * u); }
    }
    const loop = t => { const dt = Math.min(.05, (t - lastT) / 1000 || 0); lastT = t; update(dt); draw(); raf = requestAnimationFrame(loop); };
    const go = () => { if (g.demo || g.over) { reset(false); blip(660); } };
    cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouseX = (e.clientX - r.left) / r.width; keys = {}; });
    cv.addEventListener('pointerdown', go);
    reset(true); if (frozen) { for (let i = 0; i < 150; i++) update(1 / 60); }
    requestAnimationFrame(fit); fit();
    const resume = () => { cancelAnimationFrame(raf); lastT = performance.now(); if (state.active && !frozen) raf = requestAnimationFrame(loop); else draw(); };
    resume();
    return { onResize: fit, pause() { cancelAnimationFrame(raf); }, resume, onKey(e) { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (e.type === 'keydown') { if (k === ' ' || k === 'Enter') { e.preventDefault(); go(); } if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(k)) { e.preventDefault(); keys[k] = true; mouseX = null; } } else delete keys[k]; } };
  };

  // settings
  BUILD.settings = (body) => {
    const s = h('div', 'os-settings os-scroll', `<h4>Wallpaper</h4><div class="os-walls"></div><h4>Accent colour</h4><div class="os-accents"></div><p>Ridge OS, a small system inside a monitor inside a studio. Everything here runs in this page.</p>`); body.append(s);
    const walls = s.querySelector('.os-walls'), acc = s.querySelector('.os-accents');
    WALLS.forEach(w => { const b = h('button', 'os-wallbtn', `<canvas width="320" height="200"></canvas><span>${w.name}</span>`); b.dataset.id = w.id; w.draw(b.querySelector('canvas').getContext('2d'), 320, 200); b.onclick = () => { setWall(w.id); blip(500); }; walls.append(b); });
    ACCENTS.forEach(c => { const b = h('button', 'os-accent'); b.style.background = c; b.dataset.c = c; b.title = c; b.onclick = () => { setAccent(c); blip(700); }; acc.append(b); });
    const upd = () => { walls.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.id === state.wall)); acc.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.c === state.accent)); };
    root.addEventListener('os-wall', upd); upd();
    return { destroy() { root.removeEventListener('os-wall', upd); } };
  };

  /* ----- keys ----- */
  const onKey = e => {
    if (!state.active) return;
    if (e.type === 'keydown' && e.key === 'Escape') { if (e.target && e.target.tagName === 'TEXTAREA') return; e.preventDefault(); onExit(); return; }
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type !== 'range') return;
    const f = state.focus; if (f && f.api.onKey) f.api.onKey(e);
  };
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

  /* ----- boot ----- */
  let clockTimer = 0;
  const tickClock = () => { clockEl.textContent = frozen ? 'Dusk' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  function showDesktop() { if (state.booted) return; state.booted = true; openApp('notes'); openApp('terminal'); }
  function boot() {
    const b = h('div', 'os-boot', `${LOGO}<h1>Ridge <b>OS</b></h1><div class="os-bootbar"><i></i></div><div class="os-bootlog"></div><div class="os-boothint">Click to skip</div>`); root.append(b);
    const log = b.querySelector('.os-bootlog'), msgs = ['warming the tube', 'counting mountains', 'pulling an espresso', 'loading the work', 'ready'];
    let i = 0; const iv = setInterval(() => { log.textContent = msgs[Math.min(i++, msgs.length - 1)]; }, 480); log.textContent = msgs[0]; i = 1;
    let done = false; const fin = () => { if (done) return; done = true; clearInterval(iv); b.classList.add('out'); showDesktop(); setTimeout(() => b.remove(), 550); };
    b.onclick = fin; setTimeout(fin, 2500);
  }

  paintWall(); setAccent(state.accent); tickClock();

  /* ----- preview for the room monitor ----- */
  function buildPreview(w, hh) {
    const c = document.createElement('canvas'); c.width = w; c.height = hh; const ctx = c.getContext('2d');
    wallOf(state.wall).draw(ctx, w, hh);
    const u = hh / 440, mb = 22 * u;
    ctx.fillStyle = 'rgba(18,13,40,.6)'; ctx.fillRect(0, 0, w, mb);
    ctx.fillStyle = '#f3ecf7'; ctx.font = `700 ${11 * u}px 'Instrument Sans', sans-serif`; ctx.textBaseline = 'middle'; ctx.fillText('Ridge OS', 26 * u, mb / 2 + u);
    ctx.fillStyle = state.accent; ctx.beginPath(); ctx.arc(14 * u, mb / 2, 4 * u, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.roundRect(w - 112 * u, 4 * u, 104 * u, mb - 8 * u, 8 * u); ctx.fill();
    const win = (x, y, ww, wh, dark) => { ctx.save(); ctx.shadowColor = 'rgba(5,2,20,.6)'; ctx.shadowBlur = 24 * u; ctx.shadowOffsetY = 8 * u; ctx.fillStyle = dark ? 'rgba(12,8,28,.94)' : 'rgba(30,23,60,.94)'; ctx.beginPath(); ctx.roundRect(x, y, ww, wh, 8 * u); ctx.fill(); ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.roundRect(x, y, ww, 20 * u, [8 * u, 8 * u, 0, 0]); ctx.fill(); ['#ff8a7a', state.accent, '#8fd6b4'].forEach((cc, i) => { ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(x + (12 + i * 11) * u, y + 10 * u, 3.4 * u, 0, 7); ctx.fill(); }); };
    const ax = w * .08, ay = mb + hh * .08, aw = w * .32, ah = hh * .56; win(ax, ay, aw, ah);
    ctx.fillStyle = '#f3ecf7'; ctx.font = `700 ${17 * u}px 'Instrument Sans', sans-serif`; ctx.fillText('Hello, I\'m', ax + 20 * u, ay + 48 * u); ctx.fillStyle = state.accent; ctx.fillText('Carlos Acuña', ax + 20 * u, ay + 70 * u);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; [0, 1, 2, 4, 5, 7].forEach((k, i) => ctx.fillRect(ax + 20 * u, ay + (96 + k * 13) * u, aw * (.8 - (i % 3) * .12) - 20 * u, 5 * u));
    const tx = w * .5, ty = mb + hh * .14, tw = w * .38, th = hh * .46; win(tx, ty, tw, th, true);
    const cols = ['#8fe0b4', '#f3ecf7', '#ff8a7a', '#f3ecf7', state.accent, '#7d75a3'];
    cols.forEach((cc, i) => { ctx.fillStyle = cc; ctx.globalAlpha = .8; ctx.fillRect(tx + 14 * u, ty + (34 + i * 14) * u, tw * [.3, .55, .2, .62, .4, .5][i], 5 * u); }); ctx.globalAlpha = 1;
    const n = APPS.length, s = 30 * u, gap = 8 * u, dw = n * s + (n + 1) * gap, dx = (w - dw) / 2, dy = hh - s - 22 * u;
    ctx.fillStyle = 'rgba(24,18,50,.6)'; ctx.beginPath(); ctx.roundRect(dx, dy - gap, dw, s + gap * 2, 14 * u); ctx.fill();
    APPS.forEach((a, i) => { const x = dx + gap + i * (s + gap); ctx.fillStyle = lg(ctx, x, dy, x + s, dy + s, [[0, a.c[0]], [1, a.c[1]]]); ctx.beginPath(); ctx.roundRect(x, dy, s, s, 8 * u); ctx.fill(); ctx.save(); ctx.translate(x + s * .2, dy + s * .2); ctx.scale(s * .6 / 24, s * .6 / 24); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.lineCap = ctx.lineJoin = 'round'; ICONS[a.icon].forEach(d => ctx.stroke(new Path2D(d))); ctx.restore(); });
    c._cur = [tx + 14 * u, ty + (34 + 6 * 14) * u, 7 * u, 9 * u];
    return c;
  }
  function paintPreview(ctx, w, hh, t = 0) {
    if (!previewCache || previewCache.width !== w || previewCache.height !== hh) previewCache = buildPreview(w, hh);
    ctx.drawImage(previewCache, 0, 0);
    if (Math.floor(t * 1.6) % 2 === 0) { ctx.fillStyle = state.accent; ctx.fillRect(...previewCache._cur); }
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { previewCache = null; });

  return {
    enter() { state.active = true; tickClock(); clearInterval(clockTimer); if (!frozen) clockTimer = setInterval(tickClock, 5000);
      if (!state.booted) { if (frozen) showDesktop(); else boot(); }
      state.wins.forEach(w => { if (!w.el.classList.contains('min') && w.api.resume) w.api.resume(); }); if (state.focus && state.focus.api.onFocus) state.focus.api.onFocus(); },
    leave() { state.active = false; clearInterval(clockTimer); state.wins.forEach(w => w.api.pause && w.api.pause()); if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur(); },
    paintPreview,
    onWallpaper(fn) { wallFns.add(fn); fn(wallOf(state.wall).glow); },
    open: openApp, setWallpaper: setWall,
  };
}
