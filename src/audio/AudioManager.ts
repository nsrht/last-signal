export class AudioManager {
  private ctx?: AudioContext;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;
  private ambientGain?: GainNode;
  private isInitialized: boolean = false;

  public init(): void {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
      this.startAmbientHum();
    } catch {
      console.warn('Web Audio API not supported or blocked.');
    }
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.15, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setMasterVolume(this.masterVolume);
    return this.isMuted;
  }

  public playClick(): void {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.masterVolume * 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playAlarm(): void {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.masterVolume * 0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  private startAmbientHum(): void {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low 55Hz station hum

    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.15, this.ctx.currentTime);

    osc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    osc.start();
  }
}
