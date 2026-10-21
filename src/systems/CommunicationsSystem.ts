import { BalanceConfig } from '../core/types';

export class CommunicationsSystem {
  public activeFrequencyMhz: number = 1420.0;
  public targetFrequencyMhz: number = 1420.4;
  public signalQuality: number = 80.0; // 0 to 100%
  public interference: number = 20.0; // 0 to 100%
  public decodingProgress: number = 0.0; // 0 to 100%
  public decodeKwDemand: number = 20.0;

  public tuneFrequency(freqMhz: number): void {
    this.activeFrequencyMhz = Math.round(freqMhz * 10) / 10;
  }

  public update(dt: number, powerRatio: number, config: BalanceConfig): void {
    // Frequency tuning accuracy
    const freqDelta = Math.abs(this.activeFrequencyMhz - this.targetFrequencyMhz);
    const tuningAccuracy = Math.max(0, 100 - freqDelta * 50); // Exact match = 100%

    // Calculate signal quality
    this.signalQuality = Math.max(0, tuningAccuracy - this.interference * config.comms.interferencePenalty);

    // Decoding progress
    if (this.signalQuality > 30.0 && powerRatio > 0.2) {
      const rate = config.comms.baseDecodeRatePerSec * (this.signalQuality / 100) * powerRatio;
      this.decodingProgress = Math.min(100, this.decodingProgress + rate * dt);
    }
  }

  public serialize() {
    return {
      activeFrequencyMhz: this.activeFrequencyMhz,
      targetFrequencyMhz: this.targetFrequencyMhz,
      signalQuality: this.signalQuality,
      interference: this.interference,
      decodingProgress: this.decodingProgress,
      decodeKwDemand: this.decodeKwDemand,
    };
  }

  public deserialize(data: ReturnType<CommunicationsSystem['serialize']>): void {
    this.activeFrequencyMhz = data.activeFrequencyMhz;
    this.targetFrequencyMhz = data.targetFrequencyMhz;
    this.signalQuality = data.signalQuality;
    this.interference = data.interference;
    this.decodingProgress = data.decodingProgress;
    this.decodeKwDemand = data.decodeKwDemand;
  }
}
