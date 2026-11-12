// All sound is synthesized with WebAudio. Nothing plays before "Enable sound".
let ctx = null, master = null, amb = null;
const listeners = [];
function noiseBuf(sec = 1) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b;
}
let NB = null;
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }

export const Sound = {
  enabled: false,
  onChange(f) { listeners.push(f); },
  async enable() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
      NB = noiseBuf(2);
      // room tone: soft filtered noise plus a quiet hum
      const n = ctx.createBufferSource(); n.buffer = NB; n.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
      const g = ctx.createGain(); g.gain.value = 0.035; n.connect(f).connect(g).connect(master); n.start();
      const o = ctx.createOscillator(); o.frequency.value = 55; const og = ctx.createGain(); og.gain.value = 0.012;
      o.connect(og).connect(master); o.start(); amb = g;
    }
    await ctx.resume(); this.enabled = true; master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.05);
    listeners.forEach((f) => f(true));
    this.blip(520, 0.06); setTimeout(() => this.blip(780, 0.06), 70);
  },
  disable() { if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.05); this.enabled = false; listeners.forEach((f) => f(false)); },
  toggle() { this.enabled ? this.disable() : this.enable(); },
  blip(freq = 660, dur = 0.05, type = 'sine', vol = 0.12) {
    if (!this.enabled) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; const g = ctx.createGain();
    env(g, t, 0.005, vol, dur); o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
  },
  note(freq, dur = 0.35, type = 'sawtooth', vol = 0.18, cutoff = 2200) {
    if (!this.enabled) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = type; o2.frequency.value = freq * 1.006;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(cutoff * 2, t); f.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * 0.3), t + dur);
    const g = ctx.createGain(); env(g, t, 0.01, vol, dur);
    o.connect(f); o2.connect(f); f.connect(g).connect(master); o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
  },
  drum(kind) {
    if (!this.enabled) return; const t = ctx.currentTime;
    const out = ctx.createGain(); out.connect(master);
    if (kind === 'kick') {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      env(out, t, 0.002, 0.9, 0.35); o.connect(out); o.start(t); o.stop(t + 0.4);
    } else if (kind === 'snare' || kind === 'clap') {
      const n = ctx.createBufferSource(); n.buffer = NB; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kind === 'clap' ? 1500 : 2200; f.Q.value = 0.8;
      n.connect(f).connect(out);
      if (kind === 'clap') { out.gain.setValueAtTime(0.0001, t); [0, 0.012, 0.024].forEach((d) => { out.gain.setValueAtTime(0.5, t + d); out.gain.exponentialRampToValueAtTime(0.05, t + d + 0.01); }); out.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); }
      else env(out, t, 0.002, 0.5, 0.18);
      n.start(t); n.stop(t + 0.3);
      if (kind === 'snare') { const o = ctx.createOscillator(); o.frequency.value = 190; const g = ctx.createGain(); env(g, t, 0.002, 0.3, 0.08); o.connect(g).connect(master); o.start(t); o.stop(t + 0.12); }
    } else if (kind === 'hat' || kind === 'open') {
      const n = ctx.createBufferSource(); n.buffer = NB; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
      n.connect(f).connect(out); env(out, t, 0.001, 0.25, kind === 'open' ? 0.3 : 0.05); n.start(t); n.stop(t + 0.4);
    } else if (kind === 'tom') {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(110, t + 0.25);
      env(out, t, 0.002, 0.6, 0.3); o.connect(out); o.start(t); o.stop(t + 0.35);
    } else if (kind === 'cow') {
      [560, 845].forEach((fq) => { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = fq; o.connect(out); o.start(t); o.stop(t + 0.3); });
      const g = out.gain; g.setValueAtTime(0.0001, t); g.exponentialRampToValueAtTime(0.12, t + 0.003); g.exponentialRampToValueAtTime(0.0001, t + 0.25);
    } else if (kind === 'zap') {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1400, t); o.frequency.exponentialRampToValueAtTime(80, t + 0.2);
      env(out, t, 0.002, 0.18, 0.22); o.connect(out); o.start(t); o.stop(t + 0.3);
    }
  },
};
