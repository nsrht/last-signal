import { BalanceConfig } from '../core/types';

export class BatterySystem {
  public capacityKwh: number = 1000;
  public currentChargeKwh: number = 750;
  public chargeRateKw: number = 0;
  public dischargeRateKw: number = 0;

  public update(dt: number, config: BalanceConfig, excessPowerKw: number, deficitPowerKw: number): { netPowerSuppliedKw: number; excessStoredKw: number } {
    this.capacityKwh = config.battery.maxCapacityKwh;

    let netPowerSuppliedKw = 0;
    let excessStoredKw = 0;

    if (deficitPowerKw > 0) {
      // Discharge battery to supply deficit
      const maxDischargePossible = Math.min(deficitPowerKw, config.battery.maxDischargeKw);
      const energyNeededKwh = (maxDischargePossible * dt) / 3600;

      if (this.currentChargeKwh >= energyNeededKwh) {
        this.currentChargeKwh -= energyNeededKwh / config.battery.dischargeEfficiency;
        netPowerSuppliedKw = maxDischargePossible;
        this.dischargeRateKw = maxDischargePossible;
        this.chargeRateKw = 0;
      } else {
        // Partial discharge until empty
        const powerSupplied = (this.currentChargeKwh * config.battery.dischargeEfficiency * 3600) / dt;
        this.currentChargeKwh = 0;
        netPowerSuppliedKw = powerSupplied;
        this.dischargeRateKw = powerSupplied;
        this.chargeRateKw = 0;
      }
    } else if (excessPowerKw > 0) {
      // Charge battery with excess power
      const spaceAvailableKwh = this.capacityKwh - this.currentChargeKwh;
      if (spaceAvailableKwh > 0) {
        const energyToStoreKwh = (excessPowerKw * config.battery.chargeEfficiency * dt) / 3600;
        if (energyToStoreKwh <= spaceAvailableKwh) {
          this.currentChargeKwh += energyToStoreKwh;
          this.chargeRateKw = excessPowerKw;
          excessStoredKw = excessPowerKw;
        } else {
          // Battery full, charge up to max
          this.currentChargeKwh = this.capacityKwh;
          const powerUsedToFill = (spaceAvailableKwh * 3600) / (config.battery.chargeEfficiency * dt);
          this.chargeRateKw = powerUsedToFill;
          excessStoredKw = powerUsedToFill;
        }
      }
      this.dischargeRateKw = 0;
    } else {
      this.chargeRateKw = 0;
      this.dischargeRateKw = 0;
    }

    return { netPowerSuppliedKw, excessStoredKw };
  }

  public getChargePercentage(): number {
    return Math.max(0, Math.min(100, (this.currentChargeKwh / this.capacityKwh) * 100));
  }

  public serialize() {
    return {
      capacityKwh: this.capacityKwh,
      currentChargeKwh: this.currentChargeKwh,
      chargeRateKw: this.chargeRateKw,
      dischargeRateKw: this.dischargeRateKw,
    };
  }

  public deserialize(data: ReturnType<BatterySystem['serialize']>): void {
    this.capacityKwh = data.capacityKwh;
    this.currentChargeKwh = data.currentChargeKwh;
    this.chargeRateKw = data.chargeRateKw;
    this.dischargeRateKw = data.dischargeRateKw;
  }
}
