import { BalanceConfig } from '../core/types';

export class LifeSupportSystem {
  public o2Level: number = 95.0; // percentage (0 to 100)
  public o2GenKwDemand: number = 30.0; // power demand
  public isAsphyxiating: boolean = false;
  public asphyxiationTimerSec: number = 0;

  public update(dt: number, allocatedPowerKw: number, hullLeakRate: number, config: BalanceConfig): void {
    // Generation based on allocated power ratio
    const powerRatio = Math.min(1.0, allocatedPowerKw / (this.o2GenKwDemand || 1));
    const o2Produced = powerRatio * config.lifeSupport.o2GenPerKw * this.o2GenKwDemand * dt;

    // Consumption + hull leak
    const o2Consumed = (config.lifeSupport.o2ConsumptionPerSec + hullLeakRate) * dt;

    const netO2Change = o2Produced - o2Consumed;
    this.o2Level = Math.max(0, Math.min(100, this.o2Level + netO2Change));

    // Asphyxiation check
    if (this.o2Level <= 15.0) {
      this.isAsphyxiating = true;
      this.asphyxiationTimerSec += dt;
    } else {
      this.isAsphyxiating = false;
      this.asphyxiationTimerSec = Math.max(0, this.asphyxiationTimerSec - dt * 2);
    }
  }

  public serialize() {
    return {
      o2Level: this.o2Level,
      o2GenKwDemand: this.o2GenKwDemand,
      isAsphyxiating: this.isAsphyxiating,
      asphyxiationTimerSec: this.asphyxiationTimerSec,
    };
  }

  public deserialize(data: ReturnType<LifeSupportSystem['serialize']>): void {
    this.o2Level = data.o2Level;
    this.o2GenKwDemand = data.o2GenKwDemand;
    this.isAsphyxiating = data.isAsphyxiating;
    this.asphyxiationTimerSec = data.asphyxiationTimerSec;
  }
}
