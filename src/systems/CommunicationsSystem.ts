import { BalanceConfig } from '../core/types';

export interface SignalPacket {
  id: string;
  name: string;
  threshold: number;
  discovered: boolean;
  decoded: boolean;
  content: string;
}

export class CommunicationsSystem {
  public activeFrequencyMhz: number = 1420.0;
  public targetFrequencyMhz: number = 1420.4;
  public signalQuality: number = 80.0; // 0 to 100%
  public interference: number = 20.0; // 0 to 100%
  public decodingProgress: number = 0.0; // 0 to 100%
  public decodeKwDemand: number = 20.0;

  public packets: SignalPacket[] = [
    { id: 'pkt-1', name: 'Paket Alfa (1420.4 MHz)', threshold: 10, discovered: false, decoded: false, content: 'Erebus-7 telemetry verileri parazit altında.' },
    { id: 'pkt-2', name: 'Paket Beta (1420.4 MHz)', threshold: 30, discovered: false, decoded: false, content: 'Dünya ile iletişim hattı kopuk. Frekans yanıtı anomali gösteriyor.' },
    { id: 'pkt-3', name: 'Paket Gama (1420.4 MHz)', threshold: 50, discovered: false, decoded: false, content: 'Reaktör dalgalanması dış frekanstan tetikleniyor.' },
    { id: 'pkt-4', name: 'Paket Delta (1420.4 MHz)', threshold: 75, discovered: false, decoded: false, content: 'Sinyal insan yapımı değil; derin uzay matrisi rezonansı.' },
    { id: 'pkt-5', name: 'Paket Epsilon (1420.4 MHz)', threshold: 100, discovered: false, decoded: false, content: 'Son Sinyal çözümlendi: Rota seçimi operatör yetkisinde.' },
  ];

  public tuneFrequency(freqMhz: number): void {
    this.activeFrequencyMhz = Math.round(freqMhz * 10) / 10;
  }

  public update(dt: number, powerRatio: number, config: BalanceConfig): void {
    const freqDelta = Math.abs(this.activeFrequencyMhz - this.targetFrequencyMhz);
    const tuningAccuracy = Math.max(0, 100 - freqDelta * 50);

    this.signalQuality = Math.max(0, tuningAccuracy - this.interference * config.comms.interferencePenalty);

    if (this.signalQuality > 30.0 && powerRatio > 0.2) {
      const rate = config.comms.baseDecodeRatePerSec * (this.signalQuality / 100) * powerRatio;
      this.decodingProgress = Math.min(100, this.decodingProgress + rate * dt);
    }

    for (const pkt of this.packets) {
      if (this.decodingProgress >= pkt.threshold - 5) pkt.discovered = true;
      if (this.decodingProgress >= pkt.threshold) pkt.decoded = true;
    }
  }

  public getDecodedCount(): number {
    return this.packets.filter(p => p.decoded).length;
  }

  public getTotalPacketCount(): number {
    return this.packets.length;
  }

  public serialize() {
    return {
      activeFrequencyMhz: this.activeFrequencyMhz,
      targetFrequencyMhz: this.targetFrequencyMhz,
      signalQuality: this.signalQuality,
      interference: this.interference,
      decodingProgress: this.decodingProgress,
      decodeKwDemand: this.decodeKwDemand,
      packets: this.packets,
    };
  }

  public deserialize(data: ReturnType<CommunicationsSystem['serialize']>): void {
    this.activeFrequencyMhz = data.activeFrequencyMhz;
    this.targetFrequencyMhz = data.targetFrequencyMhz;
    this.signalQuality = data.signalQuality;
    this.interference = data.interference;
    this.decodingProgress = data.decodingProgress;
    this.decodeKwDemand = data.decodeKwDemand;
    if (data.packets) this.packets = data.packets;
  }
}
