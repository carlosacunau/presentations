import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Sound } from './sound.js';
import { createOS, WALLPAPERS } from './os.js';

const Q = new URLSearchParams(location.search);
const FREEZE = Q.has('t') ? parseFloat(Q.get('t')) : null;
const VIEW = Q.get('view') || 'room';
const ROOM_EXPOSURE = Q.has('exp') ? parseFloat(Q.get('exp')) : 1.0;

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setClearColor(0x05060c);
const DPR = Math.min(window.devicePixelRatio || 1, 2);
let resScale = 1;
renderer.setPixelRatio(DPR * resScale);
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.02, 60);

// ------------------------------------------------------------------ baked material
const DEC = /* glsl */`
vec3 dec(vec3 y){ vec3 x = pow(y, vec3(2.2)); return x / max(vec3(1.0) - x, vec3(0.004)); }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
uniform vec2 uRes;
vec3 grade(vec3 c, float e){
  c *= e; c = aces(c);
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(c, c * vec3(0.9, 0.97, 1.1), (1.0 - smoothstep(0.0, 0.35, l)) * 0.7);
  c = mix(c, c * vec3(1.06, 1.0, 0.9), smoothstep(0.35, 1.0, l) * 0.5);
  c = pow(c, vec3(1.0/2.2));
  vec2 q = gl_FragCoord.xy / uRes; float v = 0.3 + 0.7 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.22);
  return c * v;
}
`;
const uniformsShared = { uGlow: { value: 0 }, uExp: { value: ROOM_EXPOSURE }, uTime: { value: 0 }, uFade: { value: 1 }, uRes: { value: new THREE.Vector2(1920, 1080) } };
function bakedMat(map, glowMap, sway = null) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, glowMap: { value: glowMap }, ...uniformsShared, uSway: { value: sway || new THREE.Vector3() } },
    vertexShader: /* glsl */`
      varying vec2 vUv; uniform float uTime; uniform vec3 uSway;
      void main(){
        vUv = uv; vec3 p = position;
        ${sway ? `float h = max(p.y - 0.42, 0.0);
        float s = sin(uTime*0.9 + p.x*2.1 + p.z*1.7)*0.6 + sin(uTime*1.7 + p.y*5.0)*0.4;
        p.x += s * 0.022 * h * h; p.z += cos(uTime*0.7 + p.y*3.0) * 0.012 * h * h;` : ''}
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D map; uniform sampler2D glowMap; uniform float uGlow; uniform float uExp; uniform float uFade;
      varying vec2 vUv;
      ${DEC}
      void main(){
        vec3 c = dec(texture2D(map, vUv).rgb) + uGlow * dec(texture2D(glowMap, vUv).rgb);
        gl_FragColor = vec4(grade(c, uExp) * uFade, 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ loading
const veil = document.getElementById('veil');
const texLoader = new THREE.TextureLoader();
function loadTex(url) {
  return new Promise((res) => texLoader.load(url, (t) => {
    t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8;
    t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; res(t);
  }, undefined, () => res(null)));
}
const gltf = new GLTFLoader();
const loadGLB = (u) => new Promise((res, rej) => gltf.load(u, res, undefined, rej));

const meta = await (await fetch('assets/scene.json')).json();
const B = (x, y, z) => new THREE.Vector3(x, z, -y); // Blender -> three
const GROUPS = ['shell', 'desk', 'props', 'plant'];
const pickables = [];
const glassMats = [];

const [glbs, maps, glows, backTex] = await Promise.all([
  Promise.all(GROUPS.map((g) => loadGLB(`assets/${g}.glb`))),
  Promise.all(GROUPS.map((g) => loadTex(`assets/bake/${g}_main.jpg`))),
  Promise.all(GROUPS.map((g) => loadTex(`assets/bake/${g}_glow.jpg`))),
  loadTex('assets/backdrop.jpg'),
]);
const blackTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blackTex.needsUpdate = true;
GROUPS.forEach((g, i) => {
  const root = glbs[i].scene;
  const mat = bakedMat(maps[i], glows[i] || blackTex, g === 'plant' ? new THREE.Vector3(1, 0, 0) : null);
  root.traverse((o) => { if (o.isMesh) { o.material = mat; o.frustumCulled = g !== 'plant'; } });
  scene.add(root);
});

// ------------------------------------------------------------------ backdrop (mountains at dusk)
{
  backTex.flipY = true; backTex.needsUpdate = true;
  const m = new THREE.ShaderMaterial({
    uniforms: { map: { value: backTex }, uExp: uniformsShared.uExp, uTime: uniformsShared.uTime, uFade: uniformsShared.uFade, uRes: uniformsShared.uRes },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D map; uniform float uExp; uniform float uTime; uniform float uFade; varying vec2 vUv; ${DEC}
      void main(){ vec3 c = dec(texture2D(map, vUv).rgb);
        float tw = step(0.6, vUv.y) * smoothstep(0.55, 1.0, c.r) * (0.6 + 0.4*sin(uTime*3.0 + vUv.x*900.0));
        c *= 0.9 + 0.1*tw;
        gl_FragColor = vec4(grade(c*1.25, uExp)*uFade, 1.0); }`,
    depthWrite: false,
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(34, 17), m);
  p.position.set(2.3, 4.2, -16); scene.add(p);
}

// ------------------------------------------------------------------ monitor screen (live)
const MON = meta.monitor;
const screenCanvas = document.createElement('canvas');
screenCanvas.width = 2048; screenCanvas.height = Math.round(2048 * MON.height / MON.width);
const screenTex = new THREE.CanvasTexture(screenCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
const screenU = { map: { value: screenTex }, uPow: { value: 0 }, uTime: uniformsShared.uTime, uOn: { value: 0 }, uFade: uniformsShared.uFade, uHover: { value: 0 } };
function curvedGeo(R, width, height, cx, yf, zc, segs = 96) {
  const g = new THREE.BufferGeometry(); const pos = []; const uv = []; const idx = [];
  const half = width / R / 2;
  for (let i = 0; i <= segs; i++) {
    const a = -half + (i / segs) * 2 * half;
    const x = cx + R * Math.sin(a), y = (yf - R) + R * Math.cos(a);
    for (const k of [0, 1]) { const v = B(x, y, zc + (k - 0.5) * height); pos.push(v.x, v.y, v.z); uv.push(i / segs, k); }
  }
  for (let i = 0; i < segs; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  return g;
}
const screen = new THREE.Mesh(curvedGeo(MON.R - 0.003, MON.width, MON.height, MON.cx, MON.yf - 0.003, MON.zc), new THREE.ShaderMaterial({
  uniforms: screenU,
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D map; uniform float uPow; uniform float uOn; uniform float uTime; uniform float uFade; uniform float uHover; varying vec2 vUv;
    float h(float n){ return fract(sin(n)*43758.5453); }
    void main(){
      // tube power-on: a bright line that opens vertically
      float open = smoothstep(0.0, 1.0, uOn);
      float band = abs(vUv.y - 0.5);
      float lineMask = smoothstep(open*0.5 + 0.004, open*0.5 - 0.004, band);
      vec3 img = texture2D(map, vec2(vUv.x, 0.5 + (vUv.y - 0.5) / max(open, 0.001))).rgb;
      img = pow(img, vec3(2.2));
      float scan = 0.94 + 0.06*sin(vUv.y*900.0 + uTime*8.0);
      float roll = 0.97 + 0.03*smoothstep(0.0, 0.05, abs(fract(vUv.y*0.6 - uTime*0.12) - 0.5));
      vec3 col = img * scan * roll;
      col = mix(vec3(1.4, 1.5, 1.7) * (1.0 - band*2.0), col, smoothstep(0.08, 0.6, open));
      col *= lineMask * uPow;
      col += vec3(0.01, 0.012, 0.016);
      col *= 1.0 + uHover*0.12;
      float vig = smoothstep(0.0, 0.03, vUv.x) * smoothstep(1.0, 0.97, vUv.x) * smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
      col *= mix(0.75, 1.0, vig);
      gl_FragColor = vec4(pow(col, vec3(1.0/2.2)) * uFade, 1.0);
    }`,
}));
scene.add(screen);
const SCREEN_C = B(MON.cx, MON.yf, MON.zc);

// ------------------------------------------------------------------ glow sprites (fake bloom)
function glowTex(r, g, b) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.25, `rgba(${r},${g},${b},0.35)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function sprite(tex, pos, size, op) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: op, transparent: true }));
  s.position.copy(pos); s.scale.set(size, size, 1); scene.add(s); return s;
}
const warmG = glowTex(255, 170, 90), coolG = glowTex(120, 160, 255), whiteG = glowTex(255, 230, 205);
sprite(warmG, B(meta.lamp.x, meta.lamp.y, meta.lamp.z), 1.1, 0.35);
const sbp = meta.softbox.p, sbd = meta.softbox.d;
sprite(whiteG, B(sbp[0] + sbd[0] * 0.3, sbp[1] + sbd[1] * 0.3, sbp[2] + sbd[2] * 0.3), 1.3, 0.22);
const monGlow = sprite(coolG, SCREEN_C.clone().add(new THREE.Vector3(0, 0, 0.05)), 2.2, 0);
const monGlow2 = sprite(coolG, SCREEN_C.clone().add(new THREE.Vector3(0, -0.3, 0.3)), 1.4, 0);

// ------------------------------------------------------------------ glass with live reflections
const cubeRT = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
const cubeCam = new THREE.CubeCamera(0.05, 30, cubeRT);
function glass(w, h, pos, rotY, rotX = 0, strength = 0.22) {
  const m = new THREE.ShaderMaterial({
    uniforms: { env: { value: cubeRT.texture }, uStr: { value: strength }, uFade: uniformsShared.uFade, uTime: uniformsShared.uTime },
    vertexShader: `varying vec3 vW; varying vec3 vN; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform samplerCube env; uniform float uStr; uniform float uFade; varying vec3 vW; varying vec3 vN;
      void main(){ vec3 v = normalize(vW - cameraPosition); vec3 n = normalize(vN); if(dot(n,v)>0.0) n=-n;
        vec3 r = reflect(v, n); float f = 0.06 + 0.94*pow(1.0 - abs(dot(n, -v)), 5.0);
        vec3 c = textureCube(env, vec3(-r.x, r.yz)).rgb;
        gl_FragColor = vec4(c * (f * 2.5 + 0.12) * uStr * uFade, 1.0); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  p.position.copy(pos); p.rotation.set(rotX, rotY, 0, 'YXZ'); scene.add(p); return p;
}
const win = meta.window;
glass(win.x1 - win.x0, win.z1 - win.z0, B((win.x0 + win.x1) / 2, win.y + 0.04, (win.z0 + win.z1) / 2), 0, 0, 0.35);
const tp = meta.tprompt;
glass(0.32, 0.42, (() => { const c = Math.cos(tp.yaw), s = Math.sin(tp.yaw); return B(tp.x + 0.0 * c, tp.y + 0.0 * s, tp.z + 0.01); })(), tp.yaw + Math.PI / 2, Math.PI / 4, 0.5);

// ------------------------------------------------------------------ dust in the light
const DUST = 700;
const dpos = new Float32Array(DUST * 3), dseed = new Float32Array(DUST);
for (let i = 0; i < DUST; i++) {
  dpos[i * 3] = -3.2 + Math.random() * 6.4; dpos[i * 3 + 1] = 0.2 + Math.random() * 2.6; dpos[i * 3 + 2] = -2.9 + Math.random() * 5.4; dseed[i] = Math.random();
}
const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3)); dg.setAttribute('seed', new THREE.BufferAttribute(dseed, 1));
const SB = B(sbp[0], sbp[1], sbp[2]); const SBD = new THREE.Vector3(sbd[0], sbd[2], -sbd[1]).normalize();
const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
  uniforms: { uTime: uniformsShared.uTime, uPx: { value: renderer.getPixelRatio() }, uSB: { value: SB }, uSBD: { value: SBD }, uWin: { value: B((win.x0 + win.x1) / 2, win.y, 1.6) }, uFade: uniformsShared.uFade },
  vertexShader: `attribute float seed; uniform float uTime; uniform float uPx; uniform vec3 uSB; uniform vec3 uSBD; uniform vec3 uWin; varying float vA;
    void main(){ vec3 p = position;
      p.y += mod(uTime*0.012*(0.5+seed) + seed*3.0, 2.6) - 1.3;
      p.x += sin(uTime*0.13 + seed*40.0)*0.25; p.z += cos(uTime*0.11 + seed*23.0)*0.25;
      vec3 d = p - uSB; float along = dot(d, uSBD); float perp = length(d - uSBD*along);
      float beam = along > 0.0 ? smoothstep(0.35 + along*0.35, 0.0, perp) * smoothstep(3.5, 0.5, along) : 0.0;
      float w = smoothstep(1.8, 0.0, length((p - uWin)*vec3(0.6,0.7,0.5)));
      vA = (beam*1.1 + w*0.6 + 0.07) * (0.5 + 0.5*sin(uTime*1.3 + seed*30.0));
      vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
      gl_PointSize = uPx * (1.4 + seed*2.4) * (3.6 / -mv.z); }`,
  fragmentShader: `varying float vA; uniform float uFade; void main(){ float r = length(gl_PointCoord-0.5); float a = smoothstep(0.5, 0.0, r)*vA;
    gl_FragColor = vec4(vec3(1.0,0.86,0.7)*a*0.9*uFade, 1.0); }`,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
}));
scene.add(dust);

// ------------------------------------------------------------------ pickable shelf objects
const WORK = {
  mascot: ['Fiba Labs', 'Carlos Acuña founded Fiba Labs, an AI mentoring studio. It teaches people and teams to use AI in their own daily work, in English and Spanish. fibalabs.com'],
  workshops: ['Claude Code workshops', 'Hands-on sessions where a team installs Claude Code and uses it on its own tasks the same day. Built for people who don\'t write code.'],
  mentoring: ['One-to-one AI mentoring', 'Working sessions with one person at a time: their tools, their workflow, their questions. The goal is that they keep going without help.'],
  startkits: ['Start kits', 'A kit that sets a team up with AI tools: the installs, the first settings and the first useful routines, ready on day one.'],
  recorder: ['The recorder', 'Record your screen while you do a work process. The recorder turns that recording into a step-by-step written guide.'],
  bilingual: ['Bilingual video with AI', 'A course topic: making video in English and Spanish with AI, from script to voice to edit.'],
  aios: ['Your own AI operating system', 'A course topic: building a personal AI operating system, from a recorded process to a written guide to an AI skill.'],
  career: ['Before Fiba Labs', 'A long career in enterprise sales, channels and customer success across Latin America, at IBM, Oracle and Red Hat.'],
};
const pickMat = new THREE.MeshBasicMaterial({ visible: false });
for (const [id, bb] of Object.entries(meta.picks)) {
  const a = B(...bb.min), b = B(...bb.max);
  const size = new THREE.Vector3(Math.abs(b.x - a.x), Math.abs(b.y - a.y), Math.abs(b.z - a.z)).addScalar(0.04);
  const m = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), pickMat);
  m.position.copy(a.clone().add(b).multiplyScalar(0.5)); m.userData.work = id; scene.add(m); pickables.push(m);
}
// hover ring
const ringTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 30, 64, 64, 64); g.addColorStop(0, 'rgba(255,200,140,0)'); g.addColorStop(0.6, 'rgba(255,200,140,0.5)'); g.addColorStop(1, 'rgba(255,200,140,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const hoverGlow = sprite(ringTex, new THREE.Vector3(), 0.4, 0);
// screen pick
pickables.push(screen); screen.userData.screen = true;

// ------------------------------------------------------------------ camera rig
const VIEWS = {
  room: { p: new THREE.Vector3(0.7, 1.5, 2.7), t: new THREE.Vector3(-0.2, 1.12, -2.0), fov: 47 },
  desk: { p: new THREE.Vector3(0.05, 1.3, -0.6), t: new THREE.Vector3(0, 1.12, -2.7), fov: 50 },
  shelf: { p: new THREE.Vector3(-1.75, 1.42, -1.0), t: new THREE.Vector3(-2.55, 1.15, -2.85), fov: 50 },
  board: { p: new THREE.Vector3(0.2, 1.55, 0.3), t: new THREE.Vector3(-3.5, 1.45, -1.42), fov: 50 },
  window: { p: new THREE.Vector3(0.9, 1.4, 0.6), t: new THREE.Vector3(2.3, 1.55, -3.0), fov: 52 },
};
const screenFill = (() => { const d = (MON.height / 2) / Math.tan(THREE.MathUtils.degToRad(50) / 2) * 0.93;
  return { p: SCREEN_C.clone().add(new THREE.Vector3(0, 0, d)), t: SCREEN_C.clone(), fov: 50 }; })();
const rig = { p: VIEWS.room.p.clone(), t: VIEWS.room.t.clone(), fov: 52, goal: VIEWS[VIEW] || VIEWS.room };
if (VIEWS[VIEW]) { rig.p.copy(VIEWS[VIEW].p); rig.t.copy(VIEWS[VIEW].t); rig.fov = VIEWS[VIEW].fov; }
if (VIEW === 'room' && FREEZE === null) { rig.p.add(new THREE.Vector3(0.45, 0.25, 0.12)); rig.fov = 66; } // slow push-in on load
let fly = null; // {from, to, t0, dur, done}
const look = { yaw: 0, pitch: 0, ty: 0, tp: 0, dolly: 0, tdolly: 0, mx: 0, my: 0 };
let dragging = false, dragMoved = 0, lastX = 0, lastY = 0, lastInput = -10;

function setGoal(name) { rig.goal = VIEWS[name]; look.tdolly = 0; }
function flyTo(target, dur, done) { fly = { fromP: camera.position.clone(), fromT: rig.curT.clone(), fromF: camera.fov, to: target, t0: now, dur, done }; }

// ------------------------------------------------------------------ OS
const osEl = document.getElementById('os');
const OS = createOS(osEl, {
  sound: Sound,
  onExit: () => exitOS(),
  onWallpaper: () => drawScreen(),
});
let mode = 'room'; // room | flying | os
function enterOS() {
  if (mode !== 'room') return;
  mode = 'flying'; closeCard(); Sound.blip(660, 0.08); label.classList.remove('on'); hovered = null; canvas.style.cursor = 'default';
  flyTo(screenFill, 1.6, () => {
    mode = 'os'; document.body.classList.add('in-os'); OS.open(); osEl.classList.remove('hidden'); osEl.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => osEl.classList.add('shown'));
  });
}
function exitOS() {
  if (mode !== 'os') return;
  osEl.classList.remove('shown'); osEl.setAttribute('aria-hidden', 'true'); document.body.classList.remove('in-os');
  setTimeout(() => osEl.classList.add('hidden'), 350);
  mode = 'flying'; drawScreen();
  camera.position.copy(screenFill.p); rig.curT.copy(screenFill.t);
  flyTo(VIEWS.desk, 1.5, () => { mode = 'room'; rig.p.copy(VIEWS.desk.p); rig.t.copy(VIEWS.desk.t); rig.goal = VIEWS.desk; look.ty = look.tp = 0; });
}

// ------------------------------------------------------------------ screen drawing (same wallpaper as the OS)
function drawScreen() {
  const c = screenCanvas, x = c.getContext('2d'), W = c.width, H = c.height;
  const wp = OS.wallpaperCanvas();
  const s = Math.max(W / wp.width, H / wp.height);
  x.drawImage(wp, (W - wp.width * s) / 2, (H - wp.height * s) / 2, wp.width * s, wp.height * s);
  const k = H / 1080 * 1.55; // scale UI so it matches the OS seen at full window height
  x.fillStyle = 'rgba(12,14,24,0.55)'; x.fillRect(0, 0, W, 30 * k);
  x.fillStyle = '#f3efe8'; x.font = `600 ${15 * k}px "Instrument Sans", sans-serif`; x.textBaseline = 'middle';
  x.fillText('Studio OS', 16 * k, 15 * k);
  x.textAlign = 'right'; x.fillText('Click the screen to enter', W - 16 * k, 15 * k); x.textAlign = 'left';
  // dock
  const apps = OS.apps; const dw = apps.length * 62 * k + 16 * k; const dx = (W - dw) / 2, dy = H - 84 * k;
  x.fillStyle = 'rgba(20,22,34,0.55)'; roundRect(x, dx, dy, dw, 72 * k, 18 * k); x.fill();
  apps.forEach((a, i) => { x.fillStyle = a.color; roundRect(x, dx + 12 * k + i * 62 * k, dy + 11 * k, 50 * k, 50 * k, 12 * k); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.9)'; x.font = `700 ${20 * k}px "JetBrains Mono", monospace`; x.textAlign = 'center';
    x.fillText(a.glyph, dx + 37 * k + i * 62 * k, dy + 37 * k); x.textAlign = 'left'; });
  // a terminal window teaser
  const tx = W * 0.5 - 390 * k, ty = H * 0.5 - 200 * k, tw = 780 * k, th = 320 * k;
  x.fillStyle = 'rgba(14,16,26,0.86)'; roundRect(x, tx, ty, tw, th, 12 * k); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(tx, ty + 30 * k, tw, 1);
  ['#ff6b5a', '#ffbf3f', '#3fd27f'].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.arc(tx + 18 * k + i * 18 * k, ty + 15 * k, 5 * k, 0, 7); x.fill(); });
  x.font = `${23 * k}px "JetBrains Mono", monospace`;
  const lines = [['#8be9b0', 'carlos@studio ~ % whoami'], ['#e8e4dc', 'Carlos Acuña, founder of Fiba Labs'], ['#e8e4dc', 'AI mentoring for people and teams'], ['#8be9b0', 'carlos@studio ~ % open studio-os'], ['#ffcf7a', 'click the screen to come inside_']];
  lines.forEach(([col, t], i) => { x.fillStyle = col; x.fillText(t, tx + 26 * k, ty + 74 * k + i * 46 * k); });
  screenTex.needsUpdate = true;
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
document.fonts?.ready.then(() => drawScreen());
drawScreen();

// ------------------------------------------------------------------ card
const card = document.getElementById('card');
function openCard(id) {
  const [title, body] = WORK[id] || ['', ''];
  card.querySelector('.card-title').textContent = title;
  card.querySelector('.card-body').textContent = body;
  card.classList.remove('hidden'); requestAnimationFrame(() => card.classList.add('shown'));
  Sound.blip(880, 0.05);
}
function closeCard() { card.classList.remove('shown'); setTimeout(() => { if (!card.classList.contains('shown')) card.classList.add('hidden'); }, 250); }
card.querySelector('.card-x').addEventListener('click', closeCard);

// ------------------------------------------------------------------ input
const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
const label = document.getElementById('label');
let hovered = null;
function pick(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickables, false)[0];
  return hit ? hit.object : null;
}
canvas.addEventListener('pointerdown', (e) => { dragging = true; dragMoved = 0; lastX = e.clientX; lastY = e.clientY; lastInput = now; });
addEventListener('pointerup', (e) => {
  if (dragging && dragMoved < 6 && mode === 'room' && e.target === canvas) {
    const o = pick(e);
    if (o?.userData.screen) enterOS();
    else if (o?.userData.work) { openCard(o.userData.work); setGoal('shelf'); }
    else closeCard();
  }
  dragging = false;
});
addEventListener('pointermove', (e) => {
  lastInput = now;
  look.mx = e.clientX / innerWidth * 2 - 1; look.my = e.clientY / innerHeight * 2 - 1;
  if (dragging && mode === 'room') {
    const dx = e.clientX - lastX, dy = e.clientY - lastY; dragMoved += Math.abs(dx) + Math.abs(dy);
    look.ty = THREE.MathUtils.clamp(look.ty - dx * 0.0025, -0.6, 0.6); look.tp = THREE.MathUtils.clamp(look.tp - dy * 0.002, -0.25, 0.25);
    lastX = e.clientX; lastY = e.clientY;
  }
  if (mode === 'room' && !dragging) {
    const o = pick(e); hovered = o;
    canvas.style.cursor = o ? 'pointer' : 'grab';
    if (o?.userData.work) { label.textContent = WORK[o.userData.work][0]; label.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`; label.classList.add('on'); }
    else if (o?.userData.screen) { label.textContent = 'Enter the computer'; label.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`; label.classList.add('on'); }
    else label.classList.remove('on');
  } else label.classList.remove('on');
});
canvas.addEventListener('wheel', (e) => { if (mode !== 'room') return; lastInput = now; look.tdolly = THREE.MathUtils.clamp(look.tdolly - e.deltaY * 0.0012, -0.6, 1.6); e.preventDefault(); }, { passive: false });
addEventListener('keydown', (e) => {
  lastInput = now;
  if (e.key === 'Escape') { if (mode === 'os') { if (!OS.handleEscape()) exitOS(); } else if (!card.classList.contains('hidden')) closeCard(); else setGoal('room'); }
  if (mode !== 'room') return;
  if (e.key === 'Enter') enterOS();
  const map = { 1: 'room', 2: 'desk', 3: 'shelf', 4: 'board', 5: 'window' };
  if (map[e.key]) setGoal(map[e.key]);
  if (e.key === 'ArrowLeft') look.ty = Math.min(0.6, look.ty + 0.15);
  if (e.key === 'ArrowRight') look.ty = Math.max(-0.6, look.ty - 0.15);
  if (e.key === 'ArrowUp') look.tdolly = Math.min(1.6, look.tdolly + 0.3);
  if (e.key === 'ArrowDown') look.tdolly = Math.max(-0.6, look.tdolly - 0.3);
});
const soundBtn = document.getElementById('sound');
soundBtn.addEventListener('click', () => { Sound.toggle(); });
Sound.onChange((on) => { soundBtn.classList.toggle('on', on); soundBtn.setAttribute('aria-pressed', on); soundBtn.querySelector('.txt').textContent = on ? 'Sound on' : 'Enable sound'; });

addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

// ------------------------------------------------------------------ loop
let now = 0; const t0 = performance.now();
rig.curT = rig.t.clone(); camera.position.copy(rig.p); camera.lookAt(rig.t);
let ft = 16, frames = 0, lastAdj = 0, cubeDone = false;
const ease = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
function powerAt(t) {
  // monitor: dark, a few flickers like a tube, then on
  const s = 1.1;
  if (t < s) return [0, 0];
  const u = t - s;
  if (u < 0.5) { const f = [0.0, 0.7, 0.0, 0.0, 0.9, 0.2, 0.0, 1.0, 0.3, 0.0][Math.floor(u * 20) % 10]; return [f * 0.6, 0.02]; }
  const o = Math.min(1, (u - 0.5) / 0.45);
  const fl = 0.93 + 0.07 * Math.sin(t * 31.0) * Math.sin(t * 7.3);
  return [fl, o];
}
let wasPreFrozen = false;
function frame() {
  const real = (performance.now() - t0) / 1000;
  const dt = Math.min(0.05, real - (frame.last || real)); frame.last = real;
  now = FREEZE !== null ? FREEZE : real;
  uniformsShared.uTime.value = now;
  // monitor power
  const [pw, op] = mode === 'room' && FREEZE === null && now < 1.1 && VIEW === 'os' ? [1, 1] : powerAt(VIEW === 'os' ? 99 : now);
  screenU.uPow.value = pw; screenU.uOn.value = op;
  uniformsShared.uGlow.value = pw * Math.max(op, 0.35) * 2.6;
  renderer.getDrawingBufferSize(uniformsShared.uRes.value);
  monGlow.material.opacity = 0.16 * pw * Math.max(op, 0.3); monGlow2.material.opacity = 0.08 * pw * op;
  screenU.uHover.value += ((hovered === screen ? 1 : 0) - screenU.uHover.value) * 0.15;
  // camera
  if (fly) {
    const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k);
    camera.position.lerpVectors(fly.fromP, fly.to.p, e);
    rig.curT.lerpVectors(fly.fromT, fly.to.t, e);
    camera.fov = THREE.MathUtils.lerp(fly.fromF, fly.to.fov, e);
    camera.lookAt(rig.curT); camera.updateProjectionMatrix();
    if (FREEZE !== null) { fly = null; }
    if (k >= 1) { const d = fly.done; fly = null; d && d(); }
  } else if (mode === 'room') {
    const idle = now - lastInput > 4;
    const attract = idle ? 1 : 0;
    look.yaw += ((look.ty + attract * Math.sin(now * 0.11) * 0.16 - look.mx * 0.07) - look.yaw) * Math.min(1, dt * 2.5);
    look.pitch += ((look.tp + attract * Math.sin(now * 0.07) * 0.03 + look.my * 0.035) - look.pitch) * Math.min(1, dt * 2.5);
    look.dolly += (look.tdolly - look.dolly) * Math.min(1, dt * 3);
    const g = rig.goal; const kk = Math.min(1, dt * 1.1);
    rig.p.lerp(g.p, kk); rig.t.lerp(g.t, kk); rig.fov += (g.fov - rig.fov) * kk;
    const dir = rig.t.clone().sub(rig.p); const dist = dir.length(); dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const pos = rig.p.clone().addScaledVector(side, look.mx * 0.06 + attract * Math.sin(now * 0.09) * 0.12).add(new THREE.Vector3(0, -look.my * 0.03 + Math.sin(now * 0.23) * 0.01, 0));
    pos.addScaledVector(dir, look.dolly * 0.9);
    const yawQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), look.yaw);
    const d2 = dir.clone().applyQuaternion(yawQ); d2.y -= look.pitch; d2.normalize();
    camera.position.copy(pos); rig.curT.copy(pos).addScaledVector(d2, dist);
    camera.fov = rig.fov; camera.updateProjectionMatrix(); camera.lookAt(rig.curT);
  }
  if (hovered?.userData.work) { hoverGlow.position.copy(hovered.position); hoverGlow.material.opacity += (0.9 - hoverGlow.material.opacity) * 0.2; }
  else hoverGlow.material.opacity *= 0.85;
  if (mode !== 'os') {
    if (!cubeDone) { const keepG = uniformsShared.uGlow.value; cubeCam.position.set(0.8, 1.4, -1.0); cubeCam.update(renderer, scene); cubeDone = true; }
    renderer.render(scene, camera);
  }
  // adaptive resolution
  frames++; ft = ft * 0.95 + dt * 1000 * 0.05;
  if (FREEZE === null && real - lastAdj > 1.0 && frames > 60 && mode !== 'os') {
    if (ft > 19 && resScale > 0.55) { resScale -= 0.1; renderer.setPixelRatio(DPR * resScale); lastAdj = real; }
    else if (ft < 13 && resScale < 1) { resScale = Math.min(1, resScale + 0.05); renderer.setPixelRatio(DPR * resScale); lastAdj = real; }
  }
  window.__fps = 1000 / ft; window.__res = resScale;
  requestAnimationFrame(frame);
}
veil.classList.add('gone');
if (VIEW === 'os') { mode = 'room'; camera.position.copy(screenFill.p); rig.curT.copy(screenFill.t); mode = 'os'; document.body.classList.add('in-os'); OS.open(FREEZE !== null); osEl.classList.remove('hidden'); osEl.classList.add('shown'); }
if (Q.get('card')) openCard(Q.get('card'));
window.__ready = true;
window.__api = { enterOS, exitOS, setGoal, openCard, OS, screenPos() { const v = SCREEN_C.clone().project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; } };
requestAnimationFrame(frame);
