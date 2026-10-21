import { CommunicationsSystem } from '../systems/CommunicationsSystem';

export class SignalScopeRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frame: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public render(comms: CommunicationsSystem): void {
    this.frame++;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.fillStyle = '#0f141d';
    this.ctx.fillRect(0, 0, w, h);

    // Grid lines
    this.ctx.strokeStyle = '#1a2636';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let x = 0; x < w; x += 30) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 20) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
    }
    this.ctx.stroke();

    // Center line
    this.ctx.strokeStyle = '#004d5a';
    this.ctx.beginPath();
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // Waveform rendering
    const freqDiff = Math.abs(comms.activeFrequencyMhz - comms.targetFrequencyMhz);
    const noiseFactor = Math.min(1.0, freqDiff * 2); // Noise higher when out of sync
    const signalAmplitude = (comms.signalQuality / 100) * (h / 3);

    this.ctx.strokeStyle = comms.signalQuality > 60 ? '#00e5ff' : comms.signalQuality > 30 ? '#ffb300' : '#ff3344';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const t = (x + this.frame * 2) * 0.05;
      const cleanWave = Math.sin(t) * signalAmplitude;
      const noise = (Math.random() - 0.5) * noiseFactor * (h / 2.5);
      const y = h / 2 + cleanWave + noise;

      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }

    this.ctx.stroke();

    // Scope Overlay Text
    this.ctx.fillStyle = '#8a99ad';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(`AKTİF FREKANS: ${comms.activeFrequencyMhz.toFixed(1)} MHz`, 10, 15);
    this.ctx.fillText(`SİNYAL KALİTESİ: %${Math.round(comms.signalQuality)}`, 10, 28);
  }
}
