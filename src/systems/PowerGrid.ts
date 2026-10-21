import { SystemId } from '../core/types';

export interface PowerConsumer {
  systemId: SystemId;
  priority: 1 | 2 | 3; // 1 = Critical, 2 = Essential, 3 = Non-essential
  powerRequestedKw: number;
}

export class PowerGrid {
  public totalGenerationKw: number = 0;
  public totalDemandKw: number = 0;
  public allocations: Map<SystemId, number> = new Map();
  public isBrownout: boolean = false;

  public updateAllocations(availablePowerKw: number, consumers: PowerConsumer[]): Map<SystemId, number> {
    this.totalGenerationKw = availablePowerKw;
    this.allocations.clear();

    this.totalDemandKw = consumers.reduce((sum, c) => sum + c.powerRequestedKw, 0);

    let remainingPower = availablePowerKw;
    this.isBrownout = availablePowerKw < this.totalDemandKw;

    // Group by priority
    for (const priorityLevel of [1, 2, 3] as const) {
      const levelConsumers = consumers.filter(c => c.priority === priorityLevel);
      const levelDemand = levelConsumers.reduce((sum, c) => sum + c.powerRequestedKw, 0);

      if (remainingPower >= levelDemand) {
        // Full power to this level
        for (const consumer of levelConsumers) {
          this.allocations.set(consumer.systemId, consumer.powerRequestedKw);
        }
        remainingPower -= levelDemand;
      } else if (remainingPower > 0) {
        // Proportional power ratio for this level
        const ratio = remainingPower / (levelDemand || 1);
        for (const consumer of levelConsumers) {
          this.allocations.set(consumer.systemId, consumer.powerRequestedKw * ratio);
        }
        remainingPower = 0;
      } else {
        // No power left for this level
        for (const consumer of levelConsumers) {
          this.allocations.set(consumer.systemId, 0);
        }
      }
    }

    return this.allocations;
  }

  public getAllocatedRatio(systemId: SystemId, requestedKw: number): number {
    if (requestedKw <= 0) return 1.0;
    const allocated = this.allocations.get(systemId) ?? 0;
    return Math.min(1.0, Math.max(0, allocated / requestedKw));
  }

  public serialize() {
    return {
      totalGenerationKw: this.totalGenerationKw,
      totalDemandKw: this.totalDemandKw,
      allocations: Array.from(this.allocations.entries()),
      isBrownout: this.isBrownout,
    };
  }

  public deserialize(data: ReturnType<PowerGrid['serialize']>): void {
    this.totalGenerationKw = data.totalGenerationKw;
    this.totalDemandKw = data.totalDemandKw;
    this.allocations = new Map(data.allocations);
    this.isBrownout = data.isBrownout;
  }
}
