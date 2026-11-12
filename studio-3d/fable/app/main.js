// Studio: baked room drawn unlit, with a few live parts on top.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { createOS } from './os.js';
import { sound } from './sound.js';

const Q = new URLSearchParams(location.search);
const FROZEN = Q.has('t') ? parseFloat(Q.get('t')) : null;
const START_VIEW = Q.get('view') || 'room';
const B = 'app/baked/';
const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

// ---------- renderer ----------
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setClearColor(0x05040a);
const scene = new THREE.Scene();
const FOV = 46;
const camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.05, 80);
let prScale = 1;
const maxPR = () => Math.min(window.devicePixelRatio || 1, 2);
const rt = new THREE.WebGLRenderTarget(4, 4, { samples: maxPR() >= 1.5 ? 2 : 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.75, 0.82);
composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFade: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uFade; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 d = vUv-0.5;
      vec3 c;
      float ca = dot(d,d)*0.0035;
      c.r = texture2D(tDiffuse, vUv + d*ca).r; c.g = texture2D(tDiffuse, vUv).g; c.b = texture2D(tDiffuse, vUv - d*ca).b;
      c = pow(max(c, 0.), vec3(1.04)) * 1.03;
      c = mix(c, c*vec3(1.03,1.0,0.97), 0.5);
      float v = smoothstep(1.05, 0.25, length(d*vec2(1.0,1.15)));
      c *= mix(0.55, 1.0, v);
      c += (h(vUv*vec2(1920.,1080.)+fract(uTime)*91.7)-0.5)*0.022;
      c *= uFade;
      gl_FragColor = vec4(c,1.);
      #include <colorspace_fragment>
    }`,
});
composer.addPass(grade);

function resize() {
  const w = window.innerWidth, h = window.innerHeight, pr = maxPR() * prScale;
  renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
  composer.setPixelRatio(pr); composer.setSize(w, h);
  camera.aspect = w / h;
  // keep the horizontal field on narrow windows
  camera.fov = camera.aspect < 1.6 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * 1.6 / camera.aspect)) : FOV;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();

// ---------- time ----------
let T0 = performance.now();
const now = () => (FROZEN != null ? FROZEN : (performance.now() - T0) / 1000);

// ---------- baked room ----------
const texLoader = new THREE.TextureLoader();
const maxAniso = renderer.capabilities.getMaxAnisotropy();
function bakedTex(name) {
  return new Promise((res) => texLoader.load(B + name, (t) => {
    t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, maxAniso); res(t);
  }));
}
const blackTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blackTex.needsUpdate = true;
const shared = { uMon: { value: 0 }, uTint: { value: new THREE.Color(0.8, 0.85, 1) }, uTime: { value: 0 } };
function bakedMat(tA, tB, sway) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { tA: { value: tA }, tB: { value: tB || blackTex }, uMon: shared.uMon, uTint: shared.uTint, uTime: shared.uTime, uGainB: { value: tB ? 0.95 : 0 } },
    vertexShader: `varying vec2 vUv; uniform float uTime;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position,1.);
      ${sway ? `float hgt = max(wp.y-0.45, 0.); float ph = wp.x*3.1 + wp.z*2.3;
        wp.x += sin(uTime*0.9 + ph)*0.012*hgt + sin(uTime*2.3 + ph*2.1)*0.004*hgt;
        wp.z += cos(uTime*0.7 + ph*1.3)*0.010*hgt; wp.y += sin(uTime*1.3 + ph*1.7)*0.006*hgt;` : ''}
      gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform sampler2D tA, tB; uniform float uMon, uGainB; uniform vec3 uTint; varying vec2 vUv;
      void main(){ vec3 c = texture2D(tA, vUv).rgb; c += texture2D(tB, vUv).rgb * uTint * (uMon*uGainB);
      gl_FragColor = vec4(c,1.); }`,
  });
}
const gltf = new GLTFLoader();
const loadGLB = (n) => new Promise((res, rej) => gltf.load(B + n, (g) => res(g.scene), undefined, rej));

// ---------- OS ----------
const osRoot = document.getElementById('os');
let mode = 'room'; // room | in | inside | out
let previewDirty = true, previewAt = -9;
const os = createOS(osRoot, { onExit: () => flyOut(), frozenTime: FROZEN });
os.onWallpaper((css) => {
  const c = new THREE.Color(css); const m = Math.max(c.r, c.g, c.b, 0.001);
  shared.uTint.value.setRGB(0.45 + 0.55 * c.r / m, 0.45 + 0.55 * c.g / m, 0.45 + 0.55 * c.b / m);
  previewDirty = true;
});
const pv = document.createElement('canvas'); pv.width = 2048; pv.height = 842;
const pctx = pv.getContext('2d');
const screenTex = new THREE.CanvasTexture(pv); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = maxAniso; screenTex.flipY = false;
function paintPreview(t) {
  try { os.paintPreview(pctx, pv.width, pv.height, t); } catch (e) { pctx.fillStyle = '#2a1d3a'; pctx.fillRect(0, 0, pv.width, pv.height); }
  screenTex.needsUpdate = true; previewDirty = false; previewAt = t;
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { previewDirty = true; });

// monitor turn-on: line, opens, flickers, settles
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
function monState(t) {
  const a = 2.3;
  if (t < a) return { ox: 0, oy: 0, gain: 0 };
  const ox = Math.min(1, (t - a) / 0.16);
  let oy = t < a + 0.16 ? 0.012 : Math.min(1, 0.012 + Math.pow((t - a - 0.16) / 0.3, 0.6));
  let gain = 1;
  if (t < a + 0.16) gain = 2.2;
  else if (t < a + 1.5) { const k = (t - a - 0.16) / 1.34; const n = hash(Math.floor(t * 22)); gain = (n > 0.62 - k * 0.3 ? 1 : 0.25 + 0.5 * k) * (1.5 - 0.5 * k); }
  else gain = 1 + 0.012 * Math.sin(t * 13.0) + 0.01 * Math.sin(t * 2.1);
  return { ox, oy, gain };
}
const screenMat = new THREE.ShaderMaterial({
  uniforms: { map: { value: screenTex }, uOpen: { value: new THREE.Vector2(0, 0) }, uGain: { value: 0 }, uTime: shared.uTime, uCam: { value: new THREE.Vector3() } },
  vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 wp=modelMatrix*vec4(position,1.); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }',
  fragmentShader: `uniform sampler2D map; uniform vec2 uOpen; uniform float uGain, uTime; uniform vec3 uCam; varying vec2 vUv; varying vec3 vW;
    void main(){
      vec2 c = vUv-0.5;
      float oy = max(uOpen.y, 0.001);
      vec2 uv = vec2(vUv.x, 0.5 + c.y/oy);
      float m = step(abs(c.x), 0.5*uOpen.x) * smoothstep(0.5*oy+0.003, 0.5*oy-0.001, abs(c.y));
      vec3 col = texture2D(map, clamp(uv,0.,1.)).rgb;
      col = mix(col, vec3(0.85,0.92,1.0)*2.5, smoothstep(0.5, 0.0, uOpen.y));
      col *= uGain * 1.18;
      col *= 0.985 + 0.015*sin(vUv.y*1100.);
      col *= m;
      // glass: soft reflections of the softbox and the lamps, shifting with the eye
      vec3 V = normalize(vW - uCam); vec3 R = reflect(V, vec3(0.,0.,1.));
      float sb = pow(max(dot(R, normalize(vec3(-2.45,1.66,-0.28) - vW)), 0.), 18.);
      float fl = pow(max(dot(R, normalize(vec3(2.0,2.8,0.4) - vW)), 0.), 60.);
      vec3 refl = vec3(1.0,0.86,0.7)*sb*0.05 + vec3(1.0,0.8,0.6)*fl*0.06 + vec3(0.02,0.022,0.03)*(1.-abs(V.z));
      gl_FragColor = vec4(col + refl, 1.);
    }`,
});

// ---------- live parts ----------
function mountainCanvas() {
  const W = 4096, H = 1600, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  let sd = 77; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const sky = x.createLinearGradient(0, 0, 0, H);
  [[0, '#0b0d2a'], [0.2, '#1c1e52'], [0.38, '#4a3a82'], [0.52, '#a8588c'], [0.62, '#ee7a62'], [0.7, '#ffb070'], [1, '#ffb070']].forEach(([o, col]) => sky.addColorStop(o, col));
  x.fillStyle = sky; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 420; i++) { const yy = rnd() * H * 0.36; x.globalAlpha = (0.2 + rnd() * 0.8) * (1 - yy / (H * 0.4)); x.fillStyle = '#fff'; const r = rnd() < 0.08 ? 2.4 : 1.3; x.fillRect(rnd() * W, yy, r, r); }
  x.globalAlpha = 1;
  const sun = x.createRadialGradient(W * 0.3, H * 0.7, 0, W * 0.3, H * 0.7, H * 0.55); sun.addColorStop(0, 'rgba(255,214,150,.75)'); sun.addColorStop(0.35, 'rgba(255,150,100,.25)'); sun.addColorStop(1, 'rgba(255,120,100,0)');
  x.fillStyle = sun; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) { const cx = rnd() * W, cy = H * (0.36 + rnd() * 0.2), w = 200 + rnd() * 620, h = 5 + rnd() * 11; const g = x.createLinearGradient(cx - w, 0, cx + w, 0); const col = rnd() < 0.5 ? '255,160,120' : '120,80,150'; g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},.5)`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, w, h, 0, 0, 7); x.fill(); }
  function ridge(base, amp, n, rough) { // midpoint displacement
    let pts = []; for (let i = 0; i <= 9; i++) pts.push([i / 9, i % 2 ? 0.55 + rnd() * 0.45 : rnd() * 0.4]);
    for (let it = 0, a = 0.5; it < n - 3; it++, a *= rough) { const np = []; for (let i = 0; i < pts.length - 1; i++) { const p = pts[i], q = pts[i + 1]; np.push(p, [(p[0] + q[0]) / 2 + (rnd() - 0.5) * (q[0] - p[0]) * 0.3, (p[1] + q[1]) / 2 + (rnd() - 0.5) * a]); } np.push(pts[pts.length - 1]); pts = np; }
    let mn = 9, mx = -9; pts.forEach((p) => { mn = Math.min(mn, p[1]); mx = Math.max(mx, p[1]); });
    return pts.map((p) => [p[0] * W, H * (base - amp * (p[1] - mn) / (mx - mn))]);
  }
  function layer(pts, o) {
    const path = new Path2D(); path.moveTo(0, H); pts.forEach((p) => path.lineTo(p[0], p[1])); path.lineTo(W, H); path.closePath();
    x.save(); x.clip(path);
    const g = x.createLinearGradient(0, H * (o.base - o.amp), 0, H * (o.base + 0.05)); g.addColorStop(0, o.shade); g.addColorStop(1, o.haze); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const faces = (lit, alpha) => {
      x.fillStyle = lit; x.globalAlpha = alpha;
      for (let i = 1; i < pts.length - 1; i++) {
        if (!(pts[i][1] < pts[i - 1][1] && pts[i][1] <= pts[i + 1][1])) continue;
        let j = i; while (j > 0 && pts[j - 1][1] > pts[j][1]) j--;
        const pk = pts[i], drop = Math.min(H * o.amp * 1.1, (pts[j][1] - pk[1]) * 2.6 + 30);
        x.beginPath(); x.moveTo(pk[0], pk[1]); for (let k = i - 1; k >= j; k--) x.lineTo(pts[k][0], pts[k][1]);
        x.lineTo(pts[j][0] - drop * 0.5, pts[j][1] + drop);
        const steps = 5; for (let k = steps; k >= 1; k--) { const t = k / steps; x.lineTo(pk[0] + (k % 2 ? 1 : -0.4) * drop * 0.16 * t + drop * 0.12 * t, pk[1] + drop * t); }
        x.closePath(); x.fill();
      }
      x.globalAlpha = 1;
    };
    faces(o.lit, 0.85);
    if (o.snow) {
      const sp = new Path2D(); sp.moveTo(0, 0); sp.lineTo(0, H * o.snow);
      for (let px = 0; px <= W; px += 26 + rnd() * 40) sp.lineTo(px, H * o.snow + (rnd() - 0.5) * H * 0.06);
      sp.lineTo(W, 0); sp.closePath(); x.clip(sp);
      x.fillStyle = o.snowShade; x.fillRect(0, 0, W, H); faces(o.snowLit, 1);
    }
    x.restore();
    const hz = x.createLinearGradient(0, H * (o.base - 0.03), 0, H * (o.base + 0.04)); hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(1, o.mist);
    x.save(); x.clip(path); x.fillStyle = hz; x.fillRect(0, 0, W, H); x.restore();
  }
  layer(ridge(0.72, 0.36, 8, 0.5), { base: 0.72, amp: 0.36, shade: '#5b4a8c', haze: '#b0688c', lit: '#8a5f96', snow: 0.6, snowShade: '#8d86c9', snowLit: '#ffc6a6', mist: 'rgba(240,140,120,.55)' });
  layer(ridge(0.76, 0.2, 8, 0.52), { base: 0.76, amp: 0.2, shade: '#3b2f66', haze: '#70487c', lit: '#5a3f7c', snow: 0.655, snowShade: '#6f69a8', snowLit: '#e9a79a', mist: 'rgba(120,70,120,.5)' });
  layer(ridge(0.8, 0.1, 8, 0.55), { base: 0.8, amp: 0.1, shade: '#1d1838', haze: '#2a2148', lit: '#2a2148', mist: 'rgba(20,16,40,.4)' });
  layer(ridge(0.86, 0.07, 9, 0.6), { base: 0.86, amp: 0.07, shade: '#0d0b1c', haze: '#0b0916', lit: '#131027', mist: 'rgba(0,0,0,0)' });
  for (let i = 0; i < 70; i++) { x.globalAlpha = 0.5 + rnd() * 0.5; x.fillStyle = rnd() < 0.8 ? '#ffc070' : '#ffe9c0'; const px = rnd() * W, py = H * (0.86 + rnd() * 0.08); x.fillRect(px, py, 3, 3); }
  x.globalAlpha = 1; return c;
}
function makeMountains() {
  const t = new THREE.CanvasTexture(mountainCanvas()); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(36, 14), new THREE.MeshBasicMaterial({ map: t, color: 0xe6e6e6 }));
  m.position.set(-1.0, 4.5, -16); scene.add(m);
}
function makeGlass() {
  const g = new THREE.PlaneGeometry(3.2, 2.05);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uCam: { value: new THREE.Vector3() }, uMon: shared.uMon, uTint: shared.uTint },
    vertexShader: 'varying vec3 vW; varying vec2 vUv; void main(){ vUv=uv; vec4 wp=modelMatrix*vec4(position,1.); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }',
    fragmentShader: `uniform vec3 uCam, uTint; uniform float uMon; varying vec3 vW; varying vec2 vUv;
      float blob(vec3 R, vec3 L, float p){ return pow(max(dot(R, normalize(L - vW)), 0.), p); }
      void main(){
        vec3 V = normalize(vW - uCam); vec3 R = reflect(V, vec3(0.,0.,1.));
        vec3 c = vec3(0.);
        c += vec3(1.0,0.55,0.25) * blob(R, vec3(0.55,1.6,-2.0), 9.) * 0.16;      // floor lamp
        c += vec3(1.0,0.86,0.7) * smoothstep(0.90,0.995, dot(R, normalize(vec3(-2.45,1.66,-0.28)-vW))) * 0.07; // softbox
        c += vec3(1.0,0.6,0.3) * blob(R, vec3(-2.8,1.86,-1.65), 2500.) * 0.35;      // pendant
        for(int i=0;i<3;i++){ c += vec3(1.0,0.8,0.6) * blob(R, vec3(2.08,2.74,-1.0+float(i)*0.9), 1800.) * 0.5; }
        c += vec3(1.0,0.66,0.36) * smoothstep(0.02,0.0,abs(R.y*2.2/max(R.z,0.05) - (1.8 - vW.y)))* step(0.9, vW.x+R.x/max(R.z,0.05)*2.2) * 0.0;
        c += uTint * uMon * 0.035 * blob(R, vec3(-1.1,1.16,-1.4), 6.);              // monitor back glow
        float fres = pow(1. - abs(V.z), 3.);
        c += vec3(0.10,0.07,0.06) * fres;
        c += vec3(0.012,0.012,0.016) * smoothstep(0.0, 1.0, vUv.y*0.3 + 0.2);
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const mesh = new THREE.Mesh(g, m); mesh.position.set(-1.3, 1.525, -2.585); scene.add(mesh);
  return m;
}
function makeDust() {
  const N = 520, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = -3.0 + Math.random() * 5.6; pos[i * 3 + 1] = 0.3 + Math.random() * 2.3; pos[i * 3 + 2] = -2.4 + Math.random() * 3.4; seed[i] = Math.random() * 100;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: shared.uTime, uPx: { value: 1 }, uMon: shared.uMon },
    vertexShader: `attribute float seed; uniform float uTime, uPx, uMon; varying float vA; varying vec3 vC;
      void main(){ vec3 p = position;
        p.x += sin(uTime*0.07 + seed)*0.25 + sin(uTime*0.31+seed*3.)*0.03;
        p.y = 0.3 + mod(p.y - 0.3 + uTime*0.012*(0.5+fract(seed)), 2.3);
        p.z += cos(uTime*0.05 + seed*1.7)*0.25;
        float dl = distance(p, vec3(0.55,1.45,-2.1));
        vec3 sd = normalize(vec3(0.67,-0.467,-0.577)); vec3 rel = p - vec3(-2.45,1.66,-0.28);
        float along = dot(rel, sd); float off = length(rel - sd*along);
        float beam = smoothstep(0.75, 0.2, off - along*0.25) * smoothstep(2.6, 0.2, along) * step(0., along);
        float mon = uMon * exp(-distance(p, vec3(-1.1,1.15,-1.5))*1.6);
        float lamp = exp(-dl*dl*0.9);
        vA = (0.03 + lamp*0.9 + beam*0.5 + mon*0.5) * smoothstep(0.5, 1.6, distance(p, cameraPosition));
        vC = vec3(1.0,0.72,0.45)*(lamp+0.05) + vec3(1.0,0.9,0.78)*beam*0.6 + vec3(0.6,0.7,1.0)*mon*0.6;
        vec4 mv = viewMatrix * vec4(p,1.); gl_Position = projectionMatrix*mv;
        gl_PointSize = uPx * (0.9 + 1.5*fract(seed*7.3)) / max(-mv.z, 0.8); }`,
    fragmentShader: `varying float vA; varying vec3 vC; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.05,d); gl_FragColor = vec4(vC*a*vA*0.55, 1.); }`,
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts); return m;
}
function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
const GLOW = glowTex();
function halo(pos, color, size, op) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.position.copy(pos); s.scale.setScalar(size); scene.add(s); return s;
}
// whiteboard: hand-drawn boxes and arrows, no words
function whiteboard() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 888; const x = c.getContext('2d');
  let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const j = (a) => (rnd() - 0.5) * a;
  function line(x1, y1, x2, y2, col = '#1c2230', w = 5) {
    x.strokeStyle = col; x.lineWidth = w * (0.85 + rnd() * 0.3); x.lineCap = 'round'; x.lineJoin = 'round'; x.globalAlpha = 0.82;
    x.beginPath(); const n = Math.max(3, Math.hypot(x2 - x1, y2 - y1) / 40 | 0); x.moveTo(x1 + j(3), y1 + j(3));
    for (let i = 1; i <= n; i++) { const t = i / n; x.lineTo(x1 + (x2 - x1) * t + j(4), y1 + (y2 - y1) * t + j(4)); }
    x.stroke();
  }
  function rect(a, b, w, h, col, fill) {
    if (fill) { x.globalAlpha = 0.5; x.fillStyle = fill; x.fillRect(a, b, w, h); }
    line(a, b, a + w, b + j(5), col); line(a + w, b, a + w + j(5), b + h, col); line(a + w, b + h, a, b + h + j(5), col); line(a, b + h, a + j(5), b, col);
  }
  function arrow(x1, y1, x2, y2, col) {
    line(x1, y1, x2, y2, col); const an = Math.atan2(y2 - y1, x2 - x1);
    line(x2, y2, x2 - 26 * Math.cos(an - 0.5), y2 - 26 * Math.sin(an - 0.5), col); line(x2, y2, x2 - 26 * Math.cos(an + 0.5), y2 - 26 * Math.sin(an + 0.5), col);
  }
  function scribble(a, b, w, col = '#1c2230', rows = 2) {
    for (let r = 0; r < rows; r++) {
      x.strokeStyle = col; x.lineWidth = 4; x.globalAlpha = 0.75; x.beginPath(); let px = a; const y = b + r * 24; x.moveTo(px, y);
      const ww = w * (r === rows - 1 ? 0.6 : 1);
      while (px < a + ww) { px += 7 + rnd() * 9; x.lineTo(px, y + j(13)); if (rnd() < 0.18) { px += 14; x.moveTo(px, y); } }
      x.stroke();
    }
  }
  function circle(cx, cy, r, col) { x.strokeStyle = col; x.lineWidth = 5; x.globalAlpha = 0.8; x.beginPath(); for (let i = 0; i <= 26; i++) { const a = i / 24 * 6.4; const rr = r + j(6); x[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr); } x.stroke(); }
  const K = '#1c2230', R = '#a63a2e', BL = '#2c4f9a', G = '#2f6b45';
  // flow: recording -> guide -> skill
  rect(110, 120, 250, 150, K); scribble(145, 170, 180); arrow(370, 195, 500, 195, R);
  rect(510, 120, 250, 150, K); scribble(545, 165, 180, K, 3); arrow(770, 195, 900, 195, R);
  rect(910, 105, 270, 180, BL, 'rgba(60,110,200,.25)'); scribble(950, 165, 190, BL); circle(1045, 195, 120, R);
  arrow(1045, 300, 1045, 420, K); arrow(635, 280, 635, 420, K); arrow(235, 280, 235, 420, K);
  // lower row: team loop
  rect(120, 430, 230, 120, G); scribble(150, 470, 170, G); rect(520, 430, 230, 120, G); scribble(550, 470, 170, G); rect(930, 430, 230, 120, G); scribble(960, 470, 170, G);
  arrow(350, 490, 515, 490, K); arrow(750, 490, 925, 490, K);
  line(1160, 520, 1230, 640, K); line(1230, 640, 180, 680, K); arrow(180, 680, 150, 560, K);
  scribble(420, 720, 520, R, 2);
  // right side: pyramid, axes, sticky notes
  line(1420, 420, 1620, 110, K); line(1620, 110, 1820, 420, K); line(1820, 420, 1420, 420, K); line(1487, 320, 1753, 320, K); line(1553, 215, 1687, 215, K);
  scribble(1570, 365, 100, BL, 1); scribble(1585, 262, 70, BL, 1);
  arrow(1880, 300, 1830, 250, R); scribble(1890, 310, 110, R, 2);
  line(1380, 800, 1380, 520, K); line(1380, 800, 1980, 800, K);
  x.strokeStyle = BL; x.lineWidth = 6; x.globalAlpha = 0.8; x.beginPath(); x.moveTo(1390, 780);
  for (let i = 1; i <= 30; i++) { const t = i / 30; x.lineTo(1390 + t * 560, 780 - Math.pow(t, 2.2) * 230 + j(8)); } x.stroke();
  for (let i = 0; i < 5; i++) { x.globalAlpha = 0.85; x.fillStyle = ['#c9a23a', '#b8605a', '#c9a23a', '#5a8f6a', '#b8605a'][i]; x.save(); x.translate(1250 + (i % 2) * 20, 90 + i * 0 + (i > 2 ? 0 : 0)); x.restore(); }
  [[1235, 90, '#c2a04a'], [1235, 215, '#b56b62'], [1880, 80, '#c2a04a'], [1900, 470, '#6a9a78'], [1790, 560, '#c2a04a']].forEach(([a, b, col]) => {
    x.save(); x.translate(a + 50, b + 50); x.rotate(j(0.2)); x.globalAlpha = 0.9; x.fillStyle = col; x.fillRect(-50, -50, 100, 100); x.restore(); scribble(a + 14, b + 36, 70, '#2a2420', 2);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.3), new THREE.MeshBasicMaterial({ map: t, transparent: true, color: 0x9a938c, depthWrite: false }));
  m.rotation.y = -Math.PI / 2; m.position.set(3.166, 1.5, -0.1); scene.add(m);
}
function laptopTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 324; const x = c.getContext('2d');
  x.fillStyle = '#141021'; x.fillRect(0, 0, 512, 324); x.fillStyle = '#1e1830'; x.fillRect(0, 0, 110, 324);
  const cols = ['#ffb561', '#8fd3c8', '#e9e2d8', '#f08a7b', '#b79cff'];
  let s = 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let r = 0; r < 22; r++) { let px = 126 + ((rnd() * 3) | 0) * 16; for (let k = 0; k < 2 + rnd() * 4; k++) { const w = 14 + rnd() * 70; x.fillStyle = cols[(rnd() * 5) | 0]; x.globalAlpha = 0.85; x.fillRect(px, 18 + r * 13.5, w, 5); px += w + 8; if (px > 470) break; } }
  for (let r = 0; r < 12; r++) { x.fillStyle = '#6d6485'; x.globalAlpha = 0.8; x.fillRect(14, 22 + r * 18, 40 + rnd() * 44, 5); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const tpC = document.createElement('canvas'); tpC.width = 256; tpC.height = 180; const tpX = tpC.getContext('2d');
const tpTex = new THREE.CanvasTexture(tpC); tpTex.colorSpace = THREE.SRGBColorSpace;
let tpAt = -1;
function paintTP(t) {
  tpX.fillStyle = '#020403'; tpX.fillRect(0, 0, 256, 180);
  const off = (t * 9) % 22;
  for (let r = -1; r < 10; r++) {
    const row = Math.floor(t * 9 / 22) + r; const w = 120 + hash(row) * 100; const y = r * 22 - off + 14;
    tpX.globalAlpha = Math.max(0, 0.8 - Math.abs(y - 90) / 120); tpX.fillStyle = '#bfeed4';
    let px = 128 - w / 2; let k = 0;
    while (px < 128 + w / 2) { const ww = 10 + hash(row * 7 + k) * 30; tpX.fillRect(px, y, Math.min(ww, 128 + w / 2 - px), 7); px += ww + 7; k++; }
  }
  tpX.globalAlpha = 1; tpTex.needsUpdate = true; tpAt = t;
}

// ---------- hotspots ----------
const CARDS = {
  mascot: { k: 'The company', t: 'Fiba Labs', b: 'I founded Fiba Labs to do AI mentoring: teaching people and teams to use AI in their own daily work. <br><br><a href="https://fibalabs.com" target="_blank" rel="noopener">fibalabs.com</a>', tip: 'Fiba Labs' },
  workshops: { k: 'Product', t: 'Claude Code workshops', b: 'Hands-on workshops. People who do not code sit down with Claude Code and use it on their own work.', tip: 'Claude Code workshops' },
  mentoring: { k: 'Product', t: 'One-to-one AI mentoring', b: 'One person at a time, working on the tasks they already do every day, with AI beside them.', tip: 'One-to-one mentoring' },
  kits: { k: 'Product', t: 'Start kits', b: 'Kits that set a team up with AI tools, so everyone begins from the same working base.', tip: 'Start kits' },
  recorder: { k: 'Product', t: 'The recorder', b: 'Record your screen while you do a work process. The recorder turns that recording into a step-by-step guide.', tip: 'The recorder' },
  career: { k: 'Before Fiba Labs', t: 'A career across Latin America', b: 'A long career in enterprise sales, channels and customer success across Latin America, at IBM, Oracle and Red Hat. I work in English and Spanish.', tip: 'Before Fiba Labs' },
  courses: { k: 'Courses and videos', t: 'What I teach', b: '<ul><li>Claude Code for people who don\'t code</li><li>AI for sales teams</li><li>From a recorded process to a written guide to an AI skill</li><li>Building your own AI operating system</li><li>Making bilingual video with AI</li></ul>', tip: 'Courses and videos' },
  printer: { k: 'The workshop', t: 'Made here', b: 'The figures on these shelves come off this printer. This one is half done.', tip: 'The printer' },
};
const hits = []; const dots = [];
const card = document.getElementById('card'), tip = document.getElementById('tip');
let openCard = null;
function showCard(id) {
  const c = CARDS[id]; openCard = id;
  document.getElementById('card-kicker').textContent = c.k; document.getElementById('card-title').textContent = c.t; document.getElementById('card-body').innerHTML = c.b;
  card.classList.add('on'); tip.classList.remove('on');
  const h = hits.find((q) => q.id === id); const ctr = h.box.getCenter(new THREE.Vector3());
  focus = { p: new THREE.Vector3(ctr.x - 0.42, ctr.y + 0.06, ctr.z + 1.25), t: new THREE.Vector3(ctr.x + 0.16, ctr.y, ctr.z) };
  blip(660, 0.05);
}
function hideCard() { if (!openCard) return; openCard = null; focus = null; card.classList.remove('on'); }
document.getElementById('card-close').addEventListener('click', (e) => { e.stopPropagation(); hideCard(); });

// ---------- camera ----------
const VIEWS = {
  room: { p: [0.4, 1.46, 2.05], t: [-0.3, 1.14, -2.0] },
  desk: { p: [-0.75, 1.32, 0.15], t: [-1.12, 1.12, -1.8] },
  shelves: { p: [1.3, 1.74, -0.45], t: [1.68, 1.72, -2.4] },
  whiteboard: { p: [1.1, 1.5, -0.15], t: [3.2, 1.5, -0.1] },
  coffee: { p: [-1.5, 1.45, -0.7], t: [-3.0, 1.15, -1.75] },
  window: { p: [-1.0, 1.5, 0.6], t: [-1.6, 1.5, -2.6] },
};
let viewName = VIEWS[START_VIEW] ? START_VIEW : 'room';
let focus = null;
const cur = { p: new THREE.Vector3(), t: new THREE.Vector3() };
const mouse = { x: 0, y: 0, sx: 0, sy: 0, has: false };
const drag = { on: false, x: 0, y: 0, yaw: 0, pitch: 0, moved: 0 };
let dolly = 0;
const SCREEN_C = new THREE.Vector3(-1.1, 1.16, -1.827);
function screenPose() {
  const d = (0.426 / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.9;
  return { p: new THREE.Vector3(SCREEN_C.x, SCREEN_C.y, SCREEN_C.z + d), t: SCREEN_C.clone() };
}
const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3(0, 1, 0), _p = new THREE.Vector3(), _t = new THREE.Vector3();
function desiredPose(t) {
  const base = focus || { p: V3(VIEWS[viewName].p), t: V3(VIEWS[viewName].t) };
  _p.copy(base.p); _t.copy(base.t);
  _f.subVectors(_t, _p); const dist = _f.length(); _f.normalize(); _r.crossVectors(_f, _u).normalize();
  const k = focus ? 0.35 : 1;
  const intro = focus ? 0 : Math.pow(1 - Math.min(1, t / 5), 3);
  const ax = Math.sin(t * 0.21) * 0.16 + Math.sin(t * 0.087 + 1) * 0.1, ay = Math.sin(t * 0.17 + 2) * 0.035;
  _p.addScaledVector(_r, (mouse.sx * 0.34 + ax) * k).addScaledVector(_u, (-mouse.sy * 0.12 + ay) * k).addScaledVector(_f, (focus ? 0 : dolly) - intro * 0.9);
  _p.y += intro * 0.12;
  _t.addScaledVector(_r, (-mouse.sx * 0.1 + ax * 0.3) * k + Math.tan(drag.yaw) * dist).addScaledVector(_u, (mouse.sy * 0.05) * k + Math.tan(drag.pitch) * dist);
  _p.x = THREE.MathUtils.clamp(_p.x, -2.4, 2.7); _p.y = THREE.MathUtils.clamp(_p.y, 0.7, 2.4); _p.z = THREE.MathUtils.clamp(_p.z, -1.6, 2.42);
  return { p: _p, t: _t };
}
// fly in / out
let fly = null;
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function flyIn() {
  if (mode !== 'room') return; hideCard(); mode = 'in';
  fly = { t0: performance.now(), dur: 2300, from: { p: cur.p.clone(), t: cur.t.clone() }, to: screenPose() };
  tip.classList.remove('on'); whoosh(true);
}
function flyOut() {
  if (mode !== 'inside') return; mode = 'out'; os.leave();
  document.body.classList.remove('inside'); osRoot.classList.remove('on');
  fly = { t0: performance.now(), dur: 1900, from: screenPose(), to: null }; previewDirty = true; whoosh(false);
}
function arrive() { mode = 'inside'; osRoot.style.opacity = 1; osRoot.classList.add('on'); document.body.classList.add('inside'); os.enter(); }

// ---------- sound (made in code, only after the button) ----------
const sbtn = document.getElementById('sound-btn');
let amb = null;
function startAmb() {
  const c = sound.ctx; if (amb || !c) return;
  const g = c.createGain(); g.gain.value = 0; g.connect(sound.master); g.gain.linearRampToValueAtTime(0.16, c.currentTime + 2);
  const len = c.sampleRate * 3, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); let l = 0;
  for (let i = 0; i < len; i++) { l = l * 0.985 + (Math.random() * 2 - 1) * 0.015; d[i] = l * 6; }
  const n = c.createBufferSource(); n.buffer = buf; n.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; n.connect(f); f.connect(g); n.start();
  [110, 164.8, 220.5, 277.2].forEach((fr, i) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr; const og = c.createGain(); og.gain.value = 0.05 / (i + 1);
    const lfo = c.createOscillator(); lfo.frequency.value = 0.05 + i * 0.03; const lg = c.createGain(); lg.gain.value = 0.03 / (i + 1); lfo.connect(lg); lg.connect(og.gain); lfo.start(); o.connect(og); og.connect(g); o.start(); });
  amb = g;
}
function blip(freq, vol) {
  if (!sound.enabled || !sound.ctx) return; const c = sound.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = 'triangle'; o.frequency.value = freq; g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.35); o.connect(g); g.connect(sound.master); o.start(); o.stop(c.currentTime + 0.4);
}
function whoosh(up) {
  if (!sound.enabled || !sound.ctx) return; const c = sound.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 500; const a = up ? 60 : 240, b = up ? 240 : 60;
  o.frequency.setValueAtTime(a, c.currentTime); o.frequency.exponentialRampToValueAtTime(b, c.currentTime + 1.8);
  g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.09, c.currentTime + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.0);
  o.connect(f); f.connect(g); g.connect(sound.master); o.start(); o.stop(c.currentTime + 2.1);
}
sbtn.addEventListener('click', (e) => { e.stopPropagation(); sound.toggle(); });
sound.on((on) => { sbtn.classList.toggle('on', on); document.getElementById('sound-label').textContent = on ? 'Sound on' : 'Enable sound'; if (on) startAmb(); });

// ---------- input ----------
const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(); let screenMesh = null; let hover = null;
function pick(cx, cy) {
  ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  let best = null, bd = 1e9; const pt = new THREE.Vector3();
  for (const h of hits) { if (ray.ray.intersectBox(h.box, pt)) { const d = pt.distanceTo(camera.position); if (d < bd) { bd = d; best = h.id; } } }
  if (screenMesh) { const r = ray.intersectObject(screenMesh, false); if (r.length && r[0].distance < bd) best = 'screen'; }
  return best;
}
window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = (e.clientY / window.innerHeight) * 2 - 1; mouse.has = true;
  if (mode !== 'room') return;
  if (drag.on) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    drag.yaw = THREE.MathUtils.clamp(drag.yaw - dx * 0.0022, -0.62, 0.62); drag.pitch = THREE.MathUtils.clamp(drag.pitch + dy * 0.0016, -0.2, 0.22);
  }
  hover = e.target === canvas ? pick(e.clientX, e.clientY) : null;
  canvas.style.cursor = hover ? 'pointer' : (drag.on ? 'grabbing' : 'grab');
  if (hover) { tip.textContent = hover === 'screen' ? 'Step inside the computer' : CARDS[hover].tip; tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.classList.add('on'); }
  else tip.classList.remove('on');
});
canvas.addEventListener('pointerdown', (e) => { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; drag.moved = 0; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointerup', (e) => {
  drag.on = false; if (mode !== 'room' || drag.moved > 6) return;
  const h = pick(e.clientX, e.clientY);
  if (h === 'screen') flyIn(); else if (h) showCard(h); else hideCard();
});
canvas.addEventListener('wheel', (e) => { e.preventDefault(); if (mode === 'room') dolly = THREE.MathUtils.clamp(dolly - e.deltaY * 0.0016, -0.25, 1.5); }, { passive: false });
window.addEventListener('keydown', (e) => {
  if (mode === 'inside' || mode === 'in' || mode === 'out') return;
  if (e.key === 'Escape') { if (openCard) hideCard(); else { viewName = 'room'; drag.yaw = drag.pitch = 0; dolly = 0; } }
  else if (e.key === 'Enter') flyIn();
  else if (e.key === 'ArrowLeft') drag.yaw = Math.min(0.62, drag.yaw + 0.1);
  else if (e.key === 'ArrowRight') drag.yaw = Math.max(-0.62, drag.yaw - 0.1);
  else if (e.key === 'ArrowUp') dolly = Math.min(1.5, dolly + 0.2);
  else if (e.key === 'ArrowDown') dolly = Math.max(-0.25, dolly - 0.2);
  else { const names = ['room', 'desk', 'shelves', 'whiteboard', 'coffee', 'window']; const i = '123456'.indexOf(e.key); if (i >= 0) { hideCard(); viewName = names[i]; drag.yaw = drag.pitch = 0; dolly = 0; } }
});

// ---------- load ----------
let shadeGlow, glassMat, dustMat, ready = false, readyAt = 0;
const lampHalos = []; const steam = [];
async function init() {
  const [shell, desk, shelf, plant, live, sa, sb, da, db, fa, pa, hj] = await Promise.all([
    loadGLB('shell.glb'), loadGLB('desk.glb'), loadGLB('shelf.glb'), loadGLB('plant.glb'), loadGLB('live.glb'),
    bakedTex('shell_a.jpg'), bakedTex('shell_b.jpg'), bakedTex('desk_a.jpg'), bakedTex('desk_b.jpg'), bakedTex('shelf_a.jpg'), bakedTex('plant_a.jpg'),
    fetch(B + 'hits.json').then((r) => r.json()),
  ]);
  const setMat = (root, m) => root.traverse((o) => { if (o.isMesh) { o.material = m; o.frustumCulled = false; } });
  setMat(shell, bakedMat(sa, sb)); setMat(desk, bakedMat(da, db)); setMat(shelf, bakedMat(fa, null)); setMat(plant, bakedMat(pa, null, true));
  scene.add(shell, desk, shelf, plant, live);
  live.traverse((o) => {
    if (!o.isMesh) return;
    if (o.name.startsWith('screen')) { o.material = screenMat; screenMesh = o; }
    else if (o.name.startsWith('laptop')) o.material = new THREE.MeshBasicMaterial({ map: (() => { const t = laptopTex(); t.flipY = false; return t; })(), color: 0xbbbbbb });
    else if (o.name.startsWith('tp')) { tpTex.flipY = false; o.material = new THREE.MeshBasicMaterial({ map: tpTex, color: 0x9a9a9a }); }
  });
  { const cf = new THREE.Mesh(new THREE.CircleGeometry(0.035, 20), new THREE.MeshBasicMaterial({ color: 0x0a0503 })); cf.rotation.x = -Math.PI / 2; cf.position.set(-0.62, 0.8525, -1.28); scene.add(cf); }
  shadeGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.203, 0.3, 40, 1, true), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide, uniforms: { uK: { value: 1 } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 wp=modelMatrix*vec4(position,1.); vV=normalize(cameraPosition-wp.xyz); gl_Position=projectionMatrix*viewMatrix*wp; }',
    fragmentShader: 'uniform float uK; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(max(dot(vN,vV),0.),0.7); float g = 0.55 + 0.45*sin(vUv.y*3.14159); gl_FragColor = vec4(vec3(1.0,0.56,0.24)*f*g*uK*0.85, 1.); }',
  }));
  shadeGlow.position.set(0.55, 1.6, -2.18); scene.add(shadeGlow);
  makeMountains(); glassMat = makeGlass(); dustMat = makeDust(); whiteboard();
  lampHalos.push(halo(new THREE.Vector3(0.55, 1.6, -2.18), 0xff9a4a, 1.5, 0.22), halo(new THREE.Vector3(-2.8, 1.84, -1.65), 0xffa050, 0.7, 0.25), halo(new THREE.Vector3(-2.45, 1.66, -0.28), 0xffe0c0, 1.6, 0.07));
  for (const src of [[-0.62, 0.87, -1.28], [-2.86, 1.0, -1.95]]) for (let i = 0; i < 4; i++) {
    const sp = halo(new THREE.Vector3(...src), 0xd8d0e0, 0.05, 0); sp.material.blending = THREE.NormalBlending; sp.userData = { src, ph: i / 4 }; steam.push(sp);
  }
  for (const [id, b] of Object.entries(hj)) {
    const box = new THREE.Box3(V3(b.min), V3(b.max)); box.expandByScalar(0.03); hits.push({ id, box });
    const c = box.getCenter(new THREE.Vector3());
    const d = halo(new THREE.Vector3(c.x, b.max[1] + 0.07, b.max[2] + 0.02), 0xffc680, 0.06, 0.9); d.userData.id = id; d.userData.ph = hits.length; dots.push(d);
  }
  const p0 = desiredPose(now()); cur.p.copy(p0.p); cur.t.copy(p0.t);
  ready = true; readyAt = T0 = performance.now();
  { const v = document.getElementById('veil'); if (FROZEN != null) v.style.transition = 'none'; v.classList.add('gone'); }
  window.__hit = (id) => { const h = hits.find((q) => q.id === id); const c = (h ? h.box.getCenter(new THREE.Vector3()) : SCREEN_C.clone()).project(camera); return [(c.x + 1) / 2 * innerWidth, (1 - c.y) / 2 * innerHeight]; };
  if (START_VIEW === 'os') { const sp = screenPose(); cur.p.copy(sp.p); cur.t.copy(sp.t); arrive(); }
}
init().catch((e) => { console.error(e); });

// ---------- loop ----------
let last = performance.now(), acc = 0, frames = 0, slow = 0, fast = 0, drops = 0, ceil = 1;
window.__fps = 0;
function frame() {
  requestAnimationFrame(frame);
  const n = performance.now(); const dt = Math.min(0.1, (n - last) / 1000); last = n;
  acc += dt; frames++;
  if (acc >= 0.5) {
    window.__fps = frames / acc; const ms = acc / frames * 1000; acc = 0; frames = 0;
    if (FROZEN == null && mode !== 'inside' && ready && n - readyAt > 3500) {
      if (ms > 19.5) { slow++; fast = 0; } else if (ms < 17.2) { fast++; slow = 0; }
      if (slow >= 2 && prScale > 0.5) { prScale = Math.max(0.5, prScale - 0.15); slow = 0; drops++; ceil = prScale; resize(); }
      if (fast >= 5 && prScale < ceil) { prScale = Math.min(ceil, prScale + 0.15); fast = 0; resize(); }
    }
  }
  if (!ready) return;
  const t = now();
  if (mode === 'inside') return; // the OS owns the window; the room rests
  shared.uTime.value = t;
  mouse.sx += (mouse.x - mouse.sx) * (FROZEN != null ? 1 : Math.min(1, dt * 4)); mouse.sy += (mouse.y - mouse.sy) * (FROZEN != null ? 1 : Math.min(1, dt * 4));
  // monitor
  const ms = monState(t); screenMat.uniforms.uOpen.value.set(ms.ox, ms.oy); screenMat.uniforms.uGain.value = ms.gain;
  shared.uMon.value = ms.gain * ms.ox * Math.min(1, ms.oy * 1.2);
  if (previewDirty || t - previewAt > 0.5 || t < previewAt) paintPreview(t);
  if (Math.abs(t - tpAt) > 0.05) paintTP(t);
  // camera
  if (fly) {
    const k = Math.min(1, (performance.now() - fly.t0) / fly.dur), e = ease(k);
    if (mode === 'in') {
      cur.p.lerpVectors(fly.from.p, fly.to.p, e); cur.t.lerpVectors(fly.from.t, fly.to.t, Math.min(1, e * 1.6));
      osRoot.style.opacity = THREE.MathUtils.smoothstep(k, 0.8, 1.0);
      if (k >= 1) { fly = null; arrive(); }
    } else {
      const d = desiredPose(t); const e2 = ease(k);
      cur.p.lerpVectors(fly.from.p, d.p, e2); cur.t.lerpVectors(fly.from.t, d.t, e2);
      osRoot.style.opacity = 1 - THREE.MathUtils.smoothstep(k, 0.0, 0.22);
      if (k >= 1) { fly = null; mode = 'room'; }
    }
  } else {
    const d = desiredPose(t); const a = FROZEN != null ? 1 : 1 - Math.exp(-dt * 2.6);
    cur.p.lerp(d.p, a); cur.t.lerp(d.t, a);
  }
  camera.position.copy(cur.p); camera.lookAt(cur.t);
  screenMat.uniforms.uCam.value.copy(camera.position); glassMat.uniforms.uCam.value.copy(camera.position);
  dustMat.uniforms.uPx.value = renderer.domElement.height * 0.012;
  shadeGlow.material.uniforms.uK.value = 1 + 0.03 * Math.sin(t * 7.0) + 0.02 * Math.sin(t * 17.3);
  lampHalos[0].material.opacity = 0.2 + 0.015 * Math.sin(t * 7.0) + 0.01 * Math.sin(t * 17.3);
  for (const d of dots) {
    const hv = hover === d.userData.id || openCard === d.userData.id; const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + d.userData.ph * 1.3);
    const target = hv ? 0.13 : 0.045 + 0.02 * pulse; d.scale.setScalar(d.scale.x + (target - d.scale.x) * 0.2); d.material.opacity = hv ? 1 : 0.55 + 0.4 * pulse;
  }
  for (const sp of steam) {
    const k = (t * 0.22 + sp.userData.ph) % 1; const [sx, sy, sz] = sp.userData.src;
    sp.position.set(sx + Math.sin(t * 0.9 + sp.userData.ph * 9) * 0.012 * k * 3, sy + k * 0.2, sz + Math.cos(t * 0.7 + sp.userData.ph * 5) * 0.01);
    sp.scale.setScalar(0.035 + k * 0.09); sp.material.opacity = Math.sin(k * Math.PI) * 0.13;
  }
  grade.uniforms.uTime.value = t;
  grade.uniforms.uFade.value = FROZEN != null ? 1 : Math.min(1, (performance.now() - readyAt) / 1400);
  composer.render();
}
requestAnimationFrame(frame);
