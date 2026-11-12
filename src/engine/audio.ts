// Synthesized locally. No files, requests, microphones, or autoplay.
export class AudioManager {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private level = 0.25;
  async enable(volume: number) {
    this.level = volume;
    this.ctx ??= new AudioContext();
    await this.ctx.resume();
    if (!this.oscillator) {
      this.oscillator = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = 110;
      this.gain.gain.value = volume * 0.035;
      this.oscillator.connect(this.gain).connect(this.ctx.destination);
      this.oscillator.start();
    }
  }
  volume(volume: number) {
    this.level = volume;
    if (this.gain && this.ctx)
      this.gain.gain.setTargetAtTime(volume * 0.035, this.ctx.currentTime, 0.15);
  }
  chime(frequency = 330) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(frequency * 0.8, this.ctx.currentTime + 0.25);
    g.gain.setValueAtTime(this.level * 0.08, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    o.connect(g).connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + 0.55);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  suspend() {
    void this.ctx?.suspend();
  }
  resume() {
    void this.ctx?.resume();
  }
  async destroy() {
    this.oscillator?.stop();
    this.oscillator?.disconnect();
    this.gain?.disconnect();
    await this.ctx?.close();
    this.ctx = null;
    this.oscillator = null;
    this.gain = null;
  }
}
