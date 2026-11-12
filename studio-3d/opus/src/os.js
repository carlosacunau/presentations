// Studio OS: a small desktop that runs inside the monitor. DOM based, drawn at full resolution.
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// ------------------------------------------------------------------ wallpapers (canvas, shared with the room screen)
function mountains(x, W, H, seed, base, amp, col, snow) {
  const n = 220; const ys = [];
  for (let i = 0; i <= n; i++) { const u = i / n * 6.283;
    const v = 0.55 * Math.abs(Math.sin(u * 1.3 + seed)) + 0.25 * Math.abs(Math.sin(u * 3.7 + seed * 2.1)) + 0.12 * Math.sin(u * 9.1 + seed * 3.3) + 0.06 * Math.sin(u * 23.0 + seed);
    ys.push((base - amp * v) * H); }
  const path = (off) => { x.beginPath(); x.moveTo(0, H); ys.forEach((y, i) => x.lineTo(i / n * W, y + off(i, y))); x.lineTo(W, H); x.closePath(); };
  const top = Math.min(...ys);
  if (snow) { path(() => 0); const g = x.createLinearGradient(0, top, 0, base * H); g.addColorStop(0, snow); g.addColorStop(1, col); x.fillStyle = g; x.fill();
    path((i, y) => Math.max(0, (top + amp * H * 0.45 - y)) * 0.0 + Math.max(0, amp * H * 0.42 - (y - top)) * (0.55 + 0.45 * Math.abs(Math.sin(i * 0.9)))); }
  else path(() => 0);
  x.fillStyle = col; x.fill();
}
export const WALLPAPERS = [
  { id: 'dusk', name: 'Dusk', draw(x, W, H) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141a3a'); g.addColorStop(0.45, '#4b3a6e'); g.addColorStop(0.72, '#e48a6a'); g.addColorStop(1, '#f6b98a');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.6})`; x.fillRect(Math.random() * W, Math.random() * H * 0.35, 2, 2); }
    const sun = x.createRadialGradient(W * 0.62, H * 0.66, 0, W * 0.62, H * 0.66, W * 0.35); sun.addColorStop(0, 'rgba(255,190,140,0.55)'); sun.addColorStop(1, 'rgba(255,190,140,0)'); x.fillStyle = sun; x.fillRect(0, 0, W, H);
    mountains(x, W, H, 3, 0.72, 0.26, '#7a5f8e', '#ffd6cf');
    mountains(x, W, H, 7, 0.84, 0.24, '#3b2f55', '#e9a9b4');
    mountains(x, W, H, 11, 1.0, 0.12, '#191429');
  } },
  { id: 'grid', name: 'Grid', draw(x, W, H) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#060814'); g.addColorStop(0.55, '#16124a'); g.addColorStop(1, '#3a0e48');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const hz = H * 0.55; const sun = x.createLinearGradient(0, hz - 260, 0, hz); sun.addColorStop(0, '#ffcf6a'); sun.addColorStop(1, '#ff4f8b');
    x.save(); x.beginPath(); x.arc(W / 2, hz, 220, Math.PI, 0); x.fillStyle = sun; x.fill(); x.restore();
    x.fillStyle = '#060814'; for (let i = 0; i < 7; i++) x.fillRect(W / 2 - 230, hz - 30 - i * 26, 460, 4 + i * 1.2);
    x.strokeStyle = 'rgba(255,90,200,0.55)'; x.lineWidth = 2;
    for (let i = -30; i <= 30; i++) { x.beginPath(); x.moveTo(W / 2 + i * 30, hz); x.lineTo(W / 2 + i * 260, H); x.stroke(); }
    for (let k = 0; k < 18; k++) { const y = hz + Math.pow(k / 18, 2.2) * (H - hz); x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  } },
  { id: 'paper', name: 'Paper', draw(x, W, H) {
    x.fillStyle = '#efe7da'; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(80,60,40,0.18)'; for (let i = 0; i < W; i += 28) for (let j = 0; j < H; j += 28) { x.beginPath(); x.arc(i, j, 1.6, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(220,90,40,0.85)'; x.lineWidth = 10; x.lineCap = 'round';
    x.beginPath(); x.moveTo(W * 0.12, H * 0.62); x.bezierCurveTo(W * 0.3, H * 0.2, W * 0.5, H * 0.9, W * 0.88, H * 0.36); x.stroke();
    x.strokeStyle = 'rgba(30,80,90,0.8)'; x.lineWidth = 6;
    x.beginPath(); x.moveTo(W * 0.1, H * 0.7); x.bezierCurveTo(W * 0.35, H * 0.35, W * 0.55, H * 1.0, W * 0.9, H * 0.45); x.stroke();
  } },
  { id: 'aurora', name: 'Aurora', draw(x, W, H) {
    x.fillStyle = '#070b14'; x.fillRect(0, 0, W, H);
    const blobs = [['#1fd1a5', 0.25, 0.4, 0.5], ['#3a6bff', 0.65, 0.3, 0.55], ['#b04bff', 0.8, 0.75, 0.45], ['#ff8a3d', 0.15, 0.85, 0.35]];
    x.globalCompositeOperation = 'lighter';
    for (const [c, bx, by, r] of blobs) { const g = x.createRadialGradient(bx * W, by * H, 0, bx * W, by * H, r * W); g.addColorStop(0, c + 'aa'); g.addColorStop(1, c + '00'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    x.globalCompositeOperation = 'source-over';
  } },
  { id: 'night', name: 'Terminal', draw(x, W, H) {
    x.fillStyle = '#04100a'; x.fillRect(0, 0, W, H);
    x.font = '22px "JetBrains Mono", monospace'; const chars = '01{}<>/=+*#';
    for (let i = 0; i < W; i += 24) for (let j = 0; j < H; j += 30) { x.fillStyle = `rgba(80,255,150,${Math.random() * Math.random() * 0.35})`; x.fillText(chars[(Math.random() * chars.length) | 0], i, j); }
    const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.7)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  } },
];
const wpCache = {};
function wallpaperCanvas(id) {
  if (wpCache[id]) return wpCache[id];
  const c = document.createElement('canvas'); c.width = 2400; c.height = 1080;
  (WALLPAPERS.find((w) => w.id === id) || WALLPAPERS[0]).draw(c.getContext('2d'), c.width, c.height);
  return (wpCache[id] = c);
}

// ------------------------------------------------------------------ icons
const ICON = {
  terminal: '<svg viewBox="0 0 24 24"><path d="M5 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17h7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  paint: '<svg viewBox="0 0 24 24"><path d="M14.5 4.5l5 5-8.5 8.5-5-5z" fill="currentColor" opacity=".9"/><path d="M6 13l5 5c-1 2-3 3-6 2.5.6-1.2.4-2.3 0-3.2C4.3 15.8 5 14 6 13z" fill="currentColor"/></svg>',
  drums: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor"/><rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor" opacity=".6"/><rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor" opacity=".6"/><rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor"/></svg>',
  game: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="13" rx="5" ry="6" fill="currentColor"/><circle cx="12" cy="6" r="2.6" fill="currentColor"/><path d="M7 10L3 8M7 14H3M7 17l-3 2M17 10l4-2M17 14h4M17 17l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  notes: '<svg viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  videos: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9v6l5-3z" fill="currentColor"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};
const APPS = [
  { id: 'terminal', name: 'Terminal', color: '#22252f', glyph: '>_', w: 620, h: 400 },
  { id: 'notes', name: 'Notes', color: '#e9b949', glyph: '≡', w: 460, h: 440 },
  { id: 'paint', name: 'Paint', color: '#e2553f', glyph: '✎', w: 720, h: 500 },
  { id: 'drums', name: 'Beat pad', color: '#7a5af5', glyph: '▦', w: 640, h: 470 },
  { id: 'game', name: 'Bug hunt', color: '#2bb673', glyph: '✱', w: 560, h: 460 },
  { id: 'videos', name: 'Videos', color: '#2f80ed', glyph: '▶', w: 720, h: 440 },
  { id: 'settings', name: 'Settings', color: '#8a8f9c', glyph: '⚙', w: 520, h: 420 },
];

const ABOUT = `Carlos Acuña

Founder of Fiba Labs. Fiba Labs is AI mentoring: it teaches people and teams to use AI in their own daily work.

Before that, a long career in enterprise sales, channels and customer success across Latin America, at IBM, Oracle and Red Hat.

Works in English and Spanish.

What Fiba Labs offers
- Hands-on Claude Code workshops
- One-to-one AI mentoring
- Start kits that set a team up with AI tools
- A recorder that turns a screen recording of a work process into a step-by-step guide

Site: fibalabs.com`;
const TOPICS = [
  ['Claude Code for people who don\'t code', 'Use an AI coding agent for everyday work: files, notes, reports and small tools, without learning to program first.'],
  ['AI for sales teams', 'Where AI fits in a sales week: account research, call prep, follow-ups and pipeline notes, done with the team\'s own tools.'],
  ['From a recorded process to a written guide to an AI skill', 'Record how a task is done, turn the recording into a step-by-step guide, then turn the guide into a skill an AI can run.'],
  ['Building your own AI operating system', 'Set up a personal workspace where notes, routines and AI helpers live together and get better every week.'],
  ['Making bilingual video with AI', 'Plan, voice and edit video in English and Spanish with AI tools, from the first script to the final cut.'],
];

export function createOS(root, { sound, onExit, onWallpaper }) {
  let wp = ls.get('sos.wp', 'dusk');
  let accent = ls.get('sos.accent', '#ff9a4d');
  root.style.setProperty('--accent', accent);
  root.innerHTML = `
    <div class="boot"><div class="boot-mark"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="104 200" stroke-linecap="round"/><circle cx="32" cy="32" r="7" fill="currentColor"/></svg></div>
      <div class="boot-name">Studio OS</div><div class="boot-bar"><i></i></div><div class="boot-log"></div></div>
    <div class="desk">
      <div class="menubar"><div class="mb-left"><span class="mb-mark"></span><b>Studio OS</b><span class="mb-app">Desktop</span></div>
        <div class="mb-right"><button class="mb-sound"></button><span class="mb-clock"></span><button class="mb-exit">Back to studio <kbd>Esc</kbd></button></div></div>
      <div class="icons"></div>
      <div class="wins"></div>
      <div class="dock"></div>
    </div>`;
  const desk = root.querySelector('.desk'), wins = root.querySelector('.wins'), dock = root.querySelector('.dock');
  const mbApp = root.querySelector('.mb-app'), clock = root.querySelector('.mb-clock'), sbtn = root.querySelector('.mb-sound');
  root.querySelector('.mb-exit').onclick = () => onExit();
  sbtn.onclick = () => sound.toggle();
  const syncSound = (on) => { sbtn.textContent = on ? 'Sound on' : 'Enable sound'; sbtn.classList.toggle('on', on); root.querySelectorAll('.need-sound').forEach((e) => e.classList.toggle('hidden', on)); };
  sound.onChange(syncSound); syncSound(sound.enabled);
  function applyWallpaper() { desk.style.backgroundImage = `url(${wallpaperCanvas(wp).toDataURL('image/jpeg', 0.9)})`; root.classList.toggle('light', wp === 'paper'); }
  applyWallpaper();
  const tick = () => { const d = new Date(); clock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 10000);

  // ---------------------------------------------------------------- window manager
  let z = 10; const open = {};
  APPS.forEach((a) => {
    const b = el('button', 'dock-app', `<span class="di" style="background:${a.color}">${ICON[a.id]}</span><span class="dl">${a.name}</span><span class="dot"></span>`);
    b.onclick = () => launch(a.id); b.dataset.app = a.id; dock.appendChild(b);
  });
  function focus(w) { w.style.zIndex = ++z; Object.values(open).forEach((o) => o.el.classList.toggle('focused', o.el === w)); mbApp.textContent = w.dataset.title; }
  function launch(id, opts = {}) {
    if (open[id]) { const w = open[id].el; w.classList.remove('min'); focus(w); return open[id]; }
    const a = APPS.find((x) => x.id === id);
    const dr = desk.getBoundingClientRect();
    const W = Math.min(a.w, dr.width - 40), H = Math.min(a.h, dr.height - 140);
    const n = Object.keys(open).length;
    const x = opts.x ?? Math.max(20, (dr.width - W) / 2 + (n % 4) * 34 - 50), y = opts.y ?? Math.max(44, (dr.height - H) / 2 - 40 + (n % 4) * 30);
    const w = el('div', 'win opening', `<div class="tb"><div class="ctl"><button class="c-close" aria-label="Close"></button><button class="c-min" aria-label="Minimize"></button><button class="c-max" aria-label="Maximize"></button></div><div class="tt">${a.name}</div></div><div class="wb"></div><div class="rs"></div>`);
    Object.assign(w.style, { left: x + 'px', top: y + 'px', width: W + 'px', height: H + 'px' });
    w.dataset.title = a.name; wins.appendChild(w);
    setTimeout(() => w.classList.remove('opening'), 20);
    const rec = { el: w, app: null };
    open[id] = rec; dock.querySelector(`[data-app="${id}"]`).classList.add('running');
    w.addEventListener('pointerdown', () => focus(w));
    w.querySelector('.c-close').onclick = (e) => { e.stopPropagation(); close(id); };
    w.querySelector('.c-min').onclick = (e) => { e.stopPropagation(); w.classList.add('min'); };
    const maxT = () => { if (w.classList.toggle('max')) { w.dataset.prev = w.style.cssText; } else if (w.dataset.prev) { w.style.cssText = w.dataset.prev; } rec.app?.resize?.(); setTimeout(() => rec.app?.resize?.(), 220); };
    w.querySelector('.c-max').onclick = (e) => { e.stopPropagation(); maxT(); };
    w.querySelector('.tb').addEventListener('dblclick', maxT);
    drag(w.querySelector('.tb'), (dx, dy, s) => { if (w.classList.contains('max')) return; w.style.left = clamp(s.l + dx, -W + 80, desk.clientWidth - 80) + 'px'; w.style.top = clamp(s.t + dy, 34, desk.clientHeight - 60) + 'px'; }, () => ({ l: w.offsetLeft, t: w.offsetTop }));
    drag(w.querySelector('.rs'), (dx, dy, s) => { w.style.width = Math.max(300, s.w + dx) + 'px'; w.style.height = Math.max(200, s.h + dy) + 'px'; rec.app?.resize?.(); }, () => ({ w: w.offsetWidth, h: w.offsetHeight }));
    rec.app = APPIMPL[id](w.querySelector('.wb'), { sound, launch, setWallpaper, setAccent, get wp() { return wp; }, get accent() { return accent; }, close: () => close(id), exit: onExit });
    focus(w); sound.blip(740, 0.04, 'triangle', 0.08);
    return rec;
  }
  function close(id) { const r = open[id]; if (!r) return; r.app?.destroy?.(); r.el.classList.add('closing'); setTimeout(() => r.el.remove(), 160); delete open[id]; dock.querySelector(`[data-app="${id}"]`).classList.remove('running'); mbApp.textContent = 'Desktop'; }
  function setWallpaper(id) { wp = id; ls.set('sos.wp', id); applyWallpaper(); onWallpaper?.(); }
  function setAccent(c) { accent = c; ls.set('sos.accent', c); root.style.setProperty('--accent', c); }

  let booted = false;
  return {
    apps: APPS,
    wallpaperCanvas: () => wallpaperCanvas(wp),
    handleEscape() { return false; },
    open(instant = false) {
      if (booted) return;
      booted = true;
      const boot = root.querySelector('.boot'), log = root.querySelector('.boot-log');
      const lines = ['mounting /studio', 'warming up the espresso machine', 'loading notes, paint, beat pad', 'starting window manager', 'ready'];
      const finish = () => {
        boot.classList.add('done');
        setTimeout(() => {
          launch('notes', { x: Math.max(30, desk.clientWidth * 0.08), y: 70 });
          launch('terminal', { x: Math.max(60, desk.clientWidth * 0.38), y: Math.max(90, desk.clientHeight * 0.2) });
        }, instant ? 0 : 250);
      };
      if (instant) { boot.style.display = 'none'; finish(); return; }
      lines.forEach((l, i) => setTimeout(() => { log.textContent = l; boot.style.setProperty('--p', (i + 1) / lines.length); if (i === lines.length - 1) setTimeout(finish, 260); }, 180 + i * 230));
      sound.blip(330, 0.2, 'sine', 0.1); setTimeout(() => sound.blip(495, 0.3, 'sine', 0.08), 200);
    },
    launch,
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function drag(handle, move, start) {
  handle.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault(); handle.setPointerCapture(e.pointerId);
    const s = start(), x0 = e.clientX, y0 = e.clientY;
    const mv = (ev) => move(ev.clientX - x0, ev.clientY - y0, s);
    const up = () => { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); };
    handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up);
  });
}

// ------------------------------------------------------------------ apps
const APPIMPL = {
  terminal(body, os) {
    body.classList.add('term');
    body.innerHTML = `<div class="t-out"></div><div class="t-in"><span class="ps">carlos@studio ~ %</span><input spellcheck="false" autocomplete="off" aria-label="Terminal input"></div>`;
    const out = body.querySelector('.t-out'), inp = body.querySelector('input');
    const hist = []; let hi = 0;
    const print = (s, cls = '') => { const d = el('div', 't-line ' + cls); d.innerHTML = s; out.appendChild(d); body.scrollTop = body.scrollHeight; };
    const FILES = { 'about.txt': ABOUT, 'products.txt': 'Claude Code workshops (hands-on)\nOne-to-one AI mentoring\nStart kits: a team set up with AI tools\nThe recorder: screen recording in, step-by-step guide out', 'topics.txt': TOPICS.map((t) => t[0]).join('\n'), 'site.txt': 'fibalabs.com' };
    const JOKES = ['I asked the AI for a sandwich. It wrote a very detailed plan for a sandwich.', 'There are two kinds of people: those who read the docs, and those who ask the person who read the docs.', 'My prompt went to therapy. Too many unresolved instructions.', 'The model said it was confident. So was my printer, right before the spaghetti.', 'Weekly standup, AI edition: "Yesterday I summarized. Today I summarize. No blockers."'];
    const C = {
      help: () => print(`<span class="dim">commands</span>
  <b>about</b>       who runs this studio      <b>ls</b> / <b>cat</b> &lt;file&gt;   read files
  <b>products</b>    what Fiba Labs offers     <b>topics</b>          course and video topics
  <b>open</b> &lt;app&gt;  paint, drums, game, notes, videos, settings
  <b>wallpaper</b>   next wallpaper            <b>joke</b>, <b>coffee</b>, <b>matrix</b>, <b>hola</b>
  <b>clear</b>       clear the screen          <b>exit</b>            back to the studio`),
      ls: () => print(Object.keys(FILES).map((f) => `<span class="file">${f}</span>`).join('   ')),
      cat: (a) => FILES[a] ? print(esc(FILES[a])) : print(`cat: ${esc(a || '')}: no such file. Try <b>ls</b>.`, 'err'),
      about: () => print(esc(ABOUT)), whoami: () => print('Carlos Acuña, founder of Fiba Labs. AI mentoring for people and teams.'),
      products: () => C.cat('products.txt'), topics: () => print(TOPICS.map((t) => '· ' + esc(t[0])).join('\n')),
      open: (a) => { const map = { paint: 'paint', drums: 'drums', beat: 'drums', game: 'game', bug: 'game', notes: 'notes', videos: 'videos', settings: 'settings', terminal: 'terminal' }; if (map[a]) { os.launch(map[a]); print(`opening ${a}...`); } else print('open what? paint, drums, game, notes, videos, settings', 'err'); },
      clear: () => { out.innerHTML = ''; },
      echo: (...a) => print(esc(a.join(' '))),
      date: () => print(new Date().toString()),
      history: () => print(hist.map(esc).join('\n')),
      wallpaper: () => { const ids = WALLPAPERS.map((w) => w.id); const n = ids[(ids.indexOf(os.wp) + 1) % ids.length]; os.setWallpaper(n); print(`wallpaper: ${n}`); },
      joke: () => print(JOKES[(Math.random() * JOKES.length) | 0]),
      hola: () => print('¡Hola! Este estudio trabaja en inglés y en español.'), hello: () => print('Hello. Type <b>help</b> to look around.'),
      sudo: () => print('Nice try. In this studio the only superuser is coffee.', 'err'),
      rm: () => print('Not today.', 'err'), vim: () => print('You are now trapped in vim. Just kidding. Type <b>help</b>.'),
      coffee: () => { const steps = ['grinding beans', 'tamping', 'pulling a shot', 'steaming milk', 'done. productivity restored']; steps.forEach((s, i) => setTimeout(() => { print((i < 4 ? '<span class="dim">... </span>' : '<span class="ok">✓ </span>') + s); os.sound.blip(300 + i * 80, 0.05, 'square', 0.04); }, i * 380)); },
      matrix: () => {
        const c = el('canvas', 't-matrix'); c.width = Math.max(200, out.clientWidth - 8); c.height = 160; out.appendChild(c); body.scrollTop = body.scrollHeight;
        const x = c.getContext('2d'); const cols = Math.floor(c.width / 12); const ys = Array(cols).fill(0).map(() => Math.random() * 20); let f = 0;
        const step = () => { x.fillStyle = 'rgba(10,12,18,0.18)'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#4dff9a'; x.font = '12px JetBrains Mono, monospace';
          ys.forEach((y, i) => { x.fillText(String.fromCharCode(0x30a0 + ((Math.random() * 96) | 0)), i * 12, y * 12); ys[i] = y * 12 > c.height && Math.random() > 0.95 ? 0 : y + 1; });
          if (++f < 120) requestAnimationFrame(step); else print('wake up. the coffee is ready.', 'ok'); };
        step();
      },
      exit: () => os.exit(),
    };
    C.ll = C.ls; C.dir = C.ls; C.cls = C.clear; C.man = C.help;
    print('<span class="ok">Studio OS terminal.</span> Type <b>help</b> and press Enter.');
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { inp.blur(); return; }
      e.stopPropagation();
      if (e.key === 'ArrowUp') { hi = Math.max(0, hi - 1); inp.value = hist[hi] || ''; e.preventDefault(); return; }
      if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; e.preventDefault(); return; }
      if (e.key === 'Tab') { e.preventDefault(); const v = inp.value; const m = Object.keys(C).filter((k) => k.startsWith(v)); if (m.length === 1) inp.value = m[0] + ' '; return; }
      if (e.key !== 'Enter') { os.sound.blip(1200 + Math.random() * 300, 0.012, 'square', 0.02); return; }
      const v = inp.value.trim(); inp.value = ''; print(`<span class="ps">carlos@studio ~ %</span> ${esc(v)}`);
      if (!v) return; hist.push(v); hi = hist.length;
      const [cmd, ...args] = v.split(/\s+/); const f = C[cmd.toLowerCase()];
      if (f) f(...args); else print(`command not found: ${esc(cmd)}. Type <b>help</b>.`, 'err');
    });
    body.addEventListener('pointerup', () => { if (!getSelection().toString()) inp.focus({ preventScroll: true }); });
    setTimeout(() => inp.focus({ preventScroll: true }), 50);
    return { type(cmd) { inp.value = cmd; inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); } };
  },

  notes(body) {
    body.classList.add('notes');
    const ta = el('textarea'); ta.spellcheck = false; ta.value = ls.get('sos.notes', ABOUT); ta.setAttribute('aria-label', 'Notes');
    ta.addEventListener('input', () => ls.set('sos.notes', ta.value)); ta.addEventListener('keydown', (e) => { if (e.key !== 'Escape') e.stopPropagation(); });
    body.appendChild(ta);
  },

  paint(body, os) {
    body.classList.add('paint');
    const COLORS = ['#16181f', '#f4f1ea', '#e2553f', '#ff9a4d', '#f2c94c', '#2bb673', '#2f80ed', '#7a5af5', '#e84393', 'rainbow'];
    body.innerHTML = `<div class="p-bar"></div><div class="p-wrap"><canvas></canvas></div>`;
    const bar = body.querySelector('.p-bar'), wrap = body.querySelector('.p-wrap'), cv = body.querySelector('canvas'), x = cv.getContext('2d');
    let color = '#e2553f', size = 8, tool = 'brush', mirror = false, hue = 0, inited = false;
    COLORS.forEach((c) => { const b = el('button', 'sw' + (c === color ? ' on' : '')); b.style.background = c === 'rainbow' ? 'conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)' : c; b.title = c === 'rainbow' ? 'Rainbow' : c;
      b.onclick = () => { color = c; tool = 'brush'; bar.querySelectorAll('.sw').forEach((s) => s.classList.remove('on')); b.classList.add('on'); sync(); }; bar.appendChild(b); });
    const mk = (label, fn, cls = '') => { const b = el('button', 'pb ' + cls, label); b.onclick = () => fn(b); bar.appendChild(b); return b; };
    const sizes = [[3, 'S'], [8, 'M'], [20, 'L']].map(([s, l]) => mk(l, () => { size = s; sync(); }, 'size'));
    const er = mk('Eraser', () => { tool = tool === 'eraser' ? 'brush' : 'eraser'; sync(); });
    const sp = mk('Spray', () => { tool = tool === 'spray' ? 'brush' : 'spray'; sync(); });
    const mi = mk('Mirror', () => { mirror = !mirror; sync(); });
    mk('Clear', () => { fill(); os.sound.drum('zap'); });
    mk('Save', () => { const a = document.createElement('a'); a.download = 'studio-paint.png'; a.href = cv.toDataURL('image/png'); a.click(); });
    function sync() { sizes.forEach((b, i) => b.classList.toggle('on', [3, 8, 20][i] === size)); er.classList.toggle('on', tool === 'eraser'); sp.classList.toggle('on', tool === 'spray'); mi.classList.toggle('on', mirror); }
    sync();
    function fill() { x.fillStyle = '#fbf8f2'; x.fillRect(0, 0, cv.width, cv.height); }
    function resize() { const r = { width: wrap.clientWidth, height: wrap.clientHeight }; if (r.width < 10) return; const old = inited ? x.getImageData(0, 0, cv.width, cv.height) : null; inited = true;
      const dpr = Math.min(2, devicePixelRatio || 1); const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr); if (w === cv.width && h === cv.height) return;
      cv.width = w; cv.height = h; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; fill(); if (old) x.putImageData(old, 0, 0); x.lineCap = x.lineJoin = 'round'; }
    requestAnimationFrame(resize);
    let last = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    x.canvas.getContext('2d', { willReadFrequently: true });
    function seg(a, b) {
      const dpr = cv.width / cv.getBoundingClientRect().width;
      const col = tool === 'eraser' ? '#fbf8f2' : color === 'rainbow' ? `hsl(${(hue += 4) % 360},90%,55%)` : color;
      const pts = mirror ? [[a, b], [[cv.width - a[0], a[1]], [cv.width - b[0], b[1]]]] : [[a, b]];
      for (const [p, q] of pts) {
        if (tool === 'spray') { x.fillStyle = col; for (let i = 0; i < 26; i++) { const r = Math.random() * size * 2 * dpr, t = Math.random() * 6.28; x.fillRect(q[0] + Math.cos(t) * r, q[1] + Math.sin(t) * r, 1.4 * dpr, 1.4 * dpr); } }
        else { x.strokeStyle = col; x.lineWidth = size * dpr * (tool === 'eraser' ? 2.5 : 1); x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); }
      }
    }
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); last = pos(e); seg(last, [last[0] + 0.1, last[1]]); });
    cv.addEventListener('pointermove', (e) => { if (!last) return; const p = pos(e); seg(last, p); last = p; });
    cv.addEventListener('pointerup', () => { last = null; });
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    return { resize, destroy() { ro.disconnect(); }, draw(path) { for (let i = 1; i < path.length; i++) seg(path[i - 1], path[i]); } };
  },

  drums(body, os) {
    body.classList.add('drums');
    const PADS = [['kick', 'Kick', 'Q'], ['snare', 'Snare', 'W'], ['hat', 'Hat', 'E'], ['clap', 'Clap', 'R'], ['tom', 'Tom', 'A'], ['open', 'Open hat', 'S'], ['cow', 'Bell', 'D'], ['zap', 'Zap', 'F']];
    const ROWS = ['kick', 'snare', 'hat', 'clap'];
    const pat = { kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1] };
    const SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3];
    body.innerHTML = `<div class="need-sound${os.sound.enabled ? ' hidden' : ''}">Sound is off. <button class="es">Enable sound</button></div>
      <div class="pads"></div><div class="seq-head"><button class="play">Play</button><label>Tempo <input type="range" min="70" max="160" value="108"></label></div><div class="seq"></div><div class="keys"></div>`;
    body.querySelector('.es').onclick = () => os.sound.enable();
    const pads = body.querySelector('.pads');
    const hit = (k) => { os.sound.drum(k); const p = pads.querySelector(`[data-k="${k}"]`); if (p) { p.classList.remove('hit'); void p.offsetWidth; p.classList.add('hit'); } };
    PADS.forEach(([k, n, key]) => { const b = el('button', 'pad', `<span>${n}</span><kbd>${key}</kbd>`); b.dataset.k = k; b.onpointerdown = () => hit(k); pads.appendChild(b); });
    const seq = body.querySelector('.seq');
    ROWS.forEach((r) => { const row = el('div', 'row', `<span class="rn">${r}</span>`); pat[r].forEach((v, i) => { const s = el('button', 'st' + (v ? ' on' : '') + (i % 4 === 0 ? ' beat' : '')); s.onclick = () => { pat[r][i] ^= 1; s.classList.toggle('on'); }; row.appendChild(s); }); seq.appendChild(row); });
    const keys = body.querySelector('.keys');
    SCALE.forEach((f, i) => { const b = el('button', 'key', ''); b.onpointerdown = () => { os.sound.note(f, 0.5, 'sawtooth', 0.12, 1400 + i * 200); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 150); }; keys.appendChild(b); });
    let timer = null, step = 0;
    const playB = body.querySelector('.play'), tempo = body.querySelector('input');
    const tickF = () => {
      seq.querySelectorAll('.row').forEach((row) => row.querySelectorAll('.st').forEach((s, i) => s.classList.toggle('now', i === step)));
      ROWS.forEach((r) => { if (pat[r][step]) hit(r); });
      step = (step + 1) % 16; timer = setTimeout(tickF, 60000 / tempo.value / 4);
    };
    playB.onclick = () => { if (timer) { clearTimeout(timer); timer = null; playB.textContent = 'Play'; seq.querySelectorAll('.now').forEach((s) => s.classList.remove('now')); } else { step = 0; playB.textContent = 'Stop'; tickF(); } };
    const KM = { q: 'kick', w: 'snare', e: 'hat', r: 'clap', a: 'tom', s: 'open', d: 'cow', f: 'zap' };
    const kd = (e) => { if (!body.isConnected || !body.closest('.win').classList.contains('focused')) return; if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return; const k = KM[e.key.toLowerCase()]; if (k && !e.repeat) hit(k); };
    addEventListener('keydown', kd);
    return { destroy() { clearTimeout(timer); removeEventListener('keydown', kd); } };
  },

  game(body, os) {
    body.classList.add('game');
    body.innerHTML = `<div class="g-hud"><span class="g-score">Score 0</span><span class="g-time"></span><span class="g-best"></span></div><canvas></canvas>
      <div class="g-over"><h3>Bug hunt</h3><p>Bugs are crawling through the code. Click them before they get away. You have twenty seconds.</p><button>Start</button></div>`;
    const cv = body.querySelector('canvas'), x = cv.getContext('2d'), over = body.querySelector('.g-over');
    const sEl = body.querySelector('.g-score'), tEl = body.querySelector('.g-time'), bEl = body.querySelector('.g-best');
    let best = +ls.get('sos.best', 0); bEl.textContent = best ? `Best ${best}` : '';
    let bugs = [], splats = [], score = 0, tLeft = 0, running = false, raf = 0, lastT = 0, spawn = 0;
    function resize() { const W = cv.clientWidth * 2, H = cv.clientHeight * 2; if (W > 20 && (W !== cv.width || H !== cv.height)) { cv.width = W; cv.height = H; } }
    requestAnimationFrame(resize);
    const lines = Array.from({ length: 30 }, (_, i) => ({ w: 0.15 + Math.random() * 0.6, ind: (i % 5) * 0.04 }));
    function addBug() { const sp = 0.6 + Math.min(2.2, score * 0.05); bugs.push({ x: Math.random() * cv.width, y: cv.height + 20, a: -Math.PI / 2 + (Math.random() - 0.5), v: (80 + Math.random() * 90) * sp, s: 24 + Math.random() * 12, gold: Math.random() < 0.08, ph: Math.random() * 6 }); }
    function drawBug(b, t) {
      x.save(); x.translate(b.x, b.y); x.rotate(b.a + Math.PI / 2); const s = b.s;
      x.strokeStyle = '#111'; x.lineWidth = 3;
      for (let i = -1; i <= 1; i++) for (const side of [-1, 1]) { const w = Math.sin(t * 20 + b.ph + i) * 4; x.beginPath(); x.moveTo(side * s * 0.4, i * s * 0.4); x.lineTo(side * s * 1.1, i * s * 0.5 + w); x.stroke(); }
      x.fillStyle = b.gold ? '#f2c94c' : '#e2553f'; x.beginPath(); x.ellipse(0, s * 0.15, s * 0.65, s * 0.85, 0, 0, 7); x.fill();
      x.fillStyle = '#16181f'; x.beginPath(); x.arc(0, -s * 0.8, s * 0.4, 0, 7); x.fill();
      x.strokeStyle = 'rgba(0,0,0,0.45)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -s * 0.5); x.lineTo(0, s); x.stroke();
      x.fillStyle = 'rgba(0,0,0,0.5)'; [[-0.3, 0], [0.3, 0.3], [-0.25, 0.55]].forEach(([a, c]) => { x.beginPath(); x.arc(a * s, c * s, s * 0.12, 0, 7); x.fill(); });
      x.restore();
    }
    function frame(ts) {
      resize();
      const dt = Math.min(0.05, (ts - lastT) / 1000 || 0); lastT = ts;
      x.fillStyle = '#12141c'; x.fillRect(0, 0, cv.width, cv.height);
      x.fillStyle = 'rgba(255,255,255,0.05)'; lines.forEach((l, i) => { x.fillRect(40 + l.ind * cv.width, 30 + i * 36, l.w * cv.width * 0.6, 12); });
      if (running) {
        tLeft -= dt; spawn -= dt; if (spawn <= 0) { addBug(); spawn = Math.max(0.18, 0.7 - score * 0.02); }
        if (tLeft <= 0) end();
      }
      bugs.forEach((b) => { b.a += (Math.sin(ts / 300 + b.ph) * 1.8) * dt; b.x += Math.cos(b.a) * b.v * dt; b.y += Math.sin(b.a) * b.v * dt; if (b.x < 0 || b.x > cv.width) b.a = Math.PI - b.a; });
      bugs = bugs.filter((b) => b.y > -40);
      splats.forEach((s) => { s.t -= dt; x.globalAlpha = Math.max(0, s.t); x.fillStyle = s.gold ? '#f2c94c' : '#ff9a4d'; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; x.beginPath(); x.arc(s.x + Math.cos(a) * (1 - s.t) * 40, s.y + Math.sin(a) * (1 - s.t) * 40, 5, 0, 7); x.fill(); } x.font = 'bold 28px Instrument Sans, sans-serif'; x.fillText(s.gold ? '+5' : '+1', s.x + 14, s.y - 20 - (1 - s.t) * 30); x.globalAlpha = 1; });
      splats = splats.filter((s) => s.t > 0);
      bugs.forEach((b) => drawBug(b, ts / 1000));
      sEl.textContent = `Score ${score}`; tEl.textContent = running ? `${Math.ceil(tLeft)}s left` : '';
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    cv.addEventListener('pointerdown', (e) => {
      if (!running) return; const r = cv.getBoundingClientRect(); const px = (e.clientX - r.left) * 2, py = (e.clientY - r.top) * 2;
      const i = bugs.findIndex((b) => Math.hypot(b.x - px, b.y - py) < b.s * 1.6);
      if (i >= 0) { const b = bugs[i]; score += b.gold ? 5 : 1; splats.push({ x: b.x, y: b.y, t: 1, gold: b.gold }); bugs.splice(i, 1); os.sound.drum(b.gold ? 'cow' : 'snare'); }
      else os.sound.blip(180, 0.04, 'square', 0.05);
    });
    function start() { score = 0; bugs = []; tLeft = 20; running = true; over.classList.add('hidden'); for (let i = 0; i < 5; i++) { addBug(); const b = bugs[bugs.length - 1]; b.x = cv.width * (0.15 + Math.random() * 0.7); b.y = cv.height * (0.3 + Math.random() * 0.6); } os.sound.blip(660, 0.08); }
    function end() { running = false; if (score > best) { best = score; ls.set('sos.best', best); } bEl.textContent = `Best ${best}`;
      over.querySelector('h3').textContent = `Score ${score}`; over.querySelector('p').textContent = score >= best && score > 0 ? 'New best. The codebase thanks you.' : 'Some bugs got away. They always do.';
      over.querySelector('button').textContent = 'Play again'; over.classList.remove('hidden'); os.sound.drum('zap'); }
    over.querySelector('button').onclick = start;
    return { resize, destroy() { cancelAnimationFrame(raf); }, start };
  },

  videos(body, os) {
    body.classList.add('videos');
    body.innerHTML = `<ul class="v-list"></ul><div class="v-main"><canvas></canvas><div class="v-ctl"><button class="v-play">Pause</button><div class="v-prog"><i></i></div></div><h3></h3><p></p></div>`;
    const list = body.querySelector('.v-list'), cv = body.querySelector('canvas'), x = cv.getContext('2d');
    const h3 = body.querySelector('h3'), p = body.querySelector('p'), prog = body.querySelector('.v-prog i'), pb = body.querySelector('.v-play');
    const HUES = [24, 205, 150, 265, 340];
    let cur = 0, t = 0, playing = true, raf = 0, last = 0;
    TOPICS.forEach(([title], i) => { const li = el('li', '', `<span class="vt" style="--h:${HUES[i]}"></span><span>${esc(title)}</span>`); li.onclick = () => sel(i); list.appendChild(li); });
    function sel(i) { cur = i; t = 0; playing = true; pb.textContent = 'Pause'; list.querySelectorAll('li').forEach((l, k) => l.classList.toggle('on', k === i)); h3.textContent = TOPICS[i][0]; p.textContent = TOPICS[i][1]; os.sound.blip(520 + i * 60, 0.05); }
    pb.onclick = () => { playing = !playing; pb.textContent = playing ? 'Pause' : 'Play'; };
    function draw(ts) {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts; if (playing) t += dt; if (t > 12) t = 0;
      const r = { width: cv.clientWidth, height: cv.clientHeight }; if (r.width > 10 && cv.width !== Math.round(r.width * 2)) { cv.width = Math.round(r.width * 2); cv.height = Math.round(r.height * 2); }
      const W = cv.width, H = cv.height, hue = HUES[cur];
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, `hsl(${hue},55%,16%)`); g.addColorStop(1, `hsl(${hue + 40},60%,30%)`); x.fillStyle = g; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { x.strokeStyle = `hsla(${hue + i * 12},80%,65%,${0.12 + 0.05 * i})`; x.lineWidth = 3; x.beginPath();
        for (let k = 0; k <= 60; k++) { const xx = k / 60 * W; const yy = H * 0.72 + Math.sin(k * 0.3 + t * (1.5 + i * 0.3) + i) * H * 0.05 * (1 + Math.sin(t + i)); k ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }
      const title = TOPICS[cur][0]; const n = Math.min(title.length, Math.floor(t * 22));
      x.fillStyle = '#fff'; x.font = `600 ${Math.round(W / 22)}px Instrument Sans, sans-serif`; wrapText(x, title.slice(0, n) + (n < title.length || (t * 2 | 0) % 2 ? '' : '▍'), W * 0.07, H * 0.3, W * 0.86, W / 18);
      x.fillStyle = `hsla(${hue},90%,70%,0.9)`; x.font = `500 ${Math.round(W / 50)}px JetBrains Mono, monospace`; x.fillText('Fiba Labs · topic preview', W * 0.07, H * 0.16);
      prog.style.width = (t / 12 * 100) + '%';
      raf = requestAnimationFrame(draw);
    }
    sel(0); raf = requestAnimationFrame(draw);
    return { destroy() { cancelAnimationFrame(raf); } };
  },

  settings(body, os) {
    body.classList.add('settings');
    body.innerHTML = `<h4>Wallpaper</h4><div class="wps"></div><h4>Accent</h4><div class="acc"></div><h4>Sound</h4><div><button class="snd"></button></div>
      <h4>About this computer</h4><p class="dim">Studio OS runs inside the monitor of Carlos Acuña's studio. The room is modeled and lit in Blender, baked with Cycles and drawn with three.js.</p>`;
    const wps = body.querySelector('.wps');
    WALLPAPERS.forEach((w) => { const b = el('button', 'wp' + (w.id === os.wp ? ' on' : '')); const c = wallpaperCanvas(w.id); b.style.backgroundImage = `url(${c.toDataURL('image/jpeg', 0.6)})`; b.innerHTML = `<span>${w.name}</span>`;
      b.onclick = () => { os.setWallpaper(w.id); wps.querySelectorAll('.wp').forEach((k) => k.classList.remove('on')); b.classList.add('on'); os.sound.blip(600, 0.04); }; wps.appendChild(b); });
    const acc = body.querySelector('.acc');
    ['#ff9a4d', '#2f80ed', '#2bb673', '#e84393', '#7a5af5', '#f2c94c'].forEach((c) => { const b = el('button', 'ac' + (c === os.accent ? ' on' : '')); b.style.background = c; b.onclick = () => { os.setAccent(c); acc.querySelectorAll('.ac').forEach((k) => k.classList.remove('on')); b.classList.add('on'); }; acc.appendChild(b); });
    const snd = body.querySelector('.snd'); const s = (on) => { snd.textContent = on ? 'Turn sound off' : 'Enable sound'; };
    s(os.sound.enabled); os.sound.onChange(s); snd.onclick = () => os.sound.toggle();
  },
};
function wrapText(x, text, X, Y, maxW, lh) {
  const words = text.split(' '); let line = ''; let y = Y;
  for (const w of words) { const test = line ? line + ' ' + w : w; if (x.measureText(test).width > maxW && line) { x.fillText(line, X, y); line = w; y += lh; } else line = test; }
  x.fillText(line, X, y);
}
