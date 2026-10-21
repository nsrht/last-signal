import { BalanceConfig } from '../core/types';

export class ReactorSystem {
  public throttle: number = 70; // 0 to 150 %
  public powerGeneratedKw: number = 70;
  public heatOutput: number = 5.6;
  public coreStress: number = 0; // 0 to 100 %
  public degradation: number = 0; // 0 to 100 %
  public scramActive: boolean = false;
  public isMeltdown: boolean = false;

  public setThrottle(percentage: number): void {
    if (this.scramActive || this.isMeltdown) return;
    this.throttle = Math.max(0, Math.min(150, percentage));
  }

  public triggerScram(): void {
    this.scramActive = true;
    this.throttle = 0;
  }

  public resetScram(): void {
    if (this.isMeltdown) return;
    this.scramActive = false;
    this.throttle = 30; // low idle restart
  }

  public update(dt: number, config: BalanceConfig): void {
    if (this.isMeltdown) {
      this.powerGeneratedKw = 0;
      this.heatOutput = 0;
      this.throttle = 0;
      return;
    }

    if (this.scramActive) {
      this.powerGeneratedKw = 0;
      this.heatOutput = 0;
      // Core cools down during SCRAM
      this.coreStress = Math.max(0, this.coreStress - dt * 1.5);
      return;
    }

    // Meltdown check prior to tick calculations
    if (this.coreStress >= 100) {
      this.isMeltdown = true;
      this.powerGeneratedKw = 0;
      this.throttle = 0;
      return;
    }

    // Base power calculated from throttle & degradation
    const rawPower = (this.throttle / 100) * config.reactor.maxPowerOutput;
    const eff = Math.max(0.2, 1 - this.degradation * 0.005 - (this.coreStress > config.reactor.stressThreshold ? (this.coreStress - config.reactor.stressThreshold) * config.reactor.efficiencyLossPerStress : 0));
    this.powerGeneratedKw = rawPower * eff;

    // Heat output
    this.heatOutput = this.powerGeneratedKw * config.reactor.heatPerKw;

    // Core stress buildup if throttle > 100%
    if (this.throttle > 100) {
      const overspeed = this.throttle - 100;
      this.coreStress = Math.min(100, this.coreStress + overspeed * 0.08 * dt);
      this.degradation = Math.min(100, this.degradation + overspeed * 0.01 * dt);
    } else if (this.throttle < 80) {
      // Slow stress recovery below 80% throttle
      this.coreStress = Math.max(0, this.coreStress - 0.2 * dt);
    }

    // Final meltdown check
    if (this.coreStress >= 100) {
      this.isMeltdown = true;
      this.powerGeneratedKw = 0;
      this.throttle = 0;
    }
  }

  public serialize() {
    return {
      throttle: this.throttle,
      powerGeneratedKw: this.powerGeneratedKw,
      heatOutput: this.heatOutput,
      coreStress: this.coreStress,
      degradation: this.degradation,
      scramActive: this.scramActive,
      isMeltdown: this.isMeltdown,
    };
  }

  public deserialize(data: ReturnType<ReactorSystem['serialize']>): void {
    this.throttle = data.throttle;
    this.powerGeneratedKw = data.powerGeneratedKw;
    this.heatOutput = data.heatOutput;
    this.coreStress = data.coreStress;
    this.degradation = data.degradation;
    this.scramActive = data.scramActive;
    this.isMeltdown = data.isMeltdown;
  }
}
