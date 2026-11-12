// Shared sound switch. Nothing makes sound until sound.enable() runs inside a click.
const listeners = new Set();
export const sound = {
  enabled: false, ctx: null, master: null,
  enable() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.7;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp); comp.connect(this.ctx.destination);
    }
    this.ctx.resume(); this.enabled = true; listeners.forEach(f => f(true));
  },
  disable() { if (this.ctx) this.ctx.suspend(); this.enabled = false; listeners.forEach(f => f(false)); },
  toggle() { this.enabled ? this.disable() : this.enable(); },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};
