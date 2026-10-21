import { BalanceConfig, StationModule } from '../core/types';

export class HullSystem {
  public integrity: number = 92.0; // 0 to 100%
  public breachesCount: number = 1;
  public isolatedModuleIds: Set<string> = new Set();
  public leakRate: number = 0.5;

  public update(dt: number, modules: StationModule[], config: BalanceConfig): void {
    // Calculate total breaches and leakage
    let totalBreaches = 0;
    let unisolatedBreaches = 0;

    for (const mod of modules) {
      if (mod.isBreached) {
        totalBreaches++;
        if (mod.isIsolated) {
          unisolatedBreaches += 1 - config.hull.isolationLeakReduction;
        } else {
          unisolatedBreaches += 1;
        }
      }
    }

    this.breachesCount = totalBreaches;
    this.leakRate = unisolatedBreaches * config.hull.leakPerBreachPerSec;

    // Hull integrity degradation from unisolated breaches
    if (unisolatedBreaches > 0) {
      this.integrity = Math.max(0, this.integrity - unisolatedBreaches * config.hull.breachDamageRate * dt);
    }
  }

  public toggleIsolation(moduleId: string, modules: StationModule[]): void {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      mod.isIsolated = !mod.isIsolated;
      if (mod.isIsolated) {
        this.isolatedModuleIds.add(moduleId);
      } else {
        this.isolatedModuleIds.delete(moduleId);
      }
    }
  }

  public serialize() {
    return {
      integrity: this.integrity,
      breachesCount: this.breachesCount,
      isolatedModuleIds: Array.from(this.isolatedModuleIds),
      leakRate: this.leakRate,
    };
  }

  public deserialize(data: ReturnType<HullSystem['serialize']>, modules: StationModule[]): void {
    this.integrity = data.integrity;
    this.breachesCount = data.breachesCount;
    this.isolatedModuleIds = new Set(data.isolatedModuleIds);
    this.leakRate = data.leakRate;

    for (const mod of modules) {
      mod.isIsolated = this.isolatedModuleIds.has(mod.id);
    }
  }
}
