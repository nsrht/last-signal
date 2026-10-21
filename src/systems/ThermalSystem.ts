import { BalanceConfig } from '../core/types';

export class ThermalSystem {
  public temperature: number = 24.0; // °C
  public coolantPowerDemandKw: number = 25.0;
  public isOverheating: boolean = false;

  public update(dt: number, totalHeatInput: number, allocatedCoolantPowerKw: number, config: BalanceConfig): void {
    const coolantRatio = Math.min(1.0, allocatedCoolantPowerKw / (this.coolantPowerDemandKw || 1));

    // Active heat dissipation via coolant pumps
    const activeDissipation = coolantRatio * config.thermal.heatDissipationPerKw * allocatedCoolantPowerKw;
    // Ambient heat dissipation into deep space
    const ambientDissipation = (this.temperature - 4.0) * config.thermal.ambientHeatDissipation * 0.1;

    const netHeatRate = totalHeatInput - (activeDissipation + ambientDissipation);

    // Temp delta: thermal inertia factor
    this.temperature = Math.max(4.0, Math.min(130.0, this.temperature + netHeatRate * 0.05 * dt));

    this.isOverheating = this.temperature >= config.thermal.overheatThreshold;
  }

  public serialize() {
    return {
      temperature: this.temperature,
      coolantPowerDemandKw: this.coolantPowerDemandKw,
      isOverheating: this.isOverheating,
    };
  }

  public deserialize(data: ReturnType<ThermalSystem['serialize']>): void {
    this.temperature = data.temperature;
    this.coolantPowerDemandKw = data.coolantPowerDemandKw;
    this.isOverheating = data.isOverheating;
  }
}
