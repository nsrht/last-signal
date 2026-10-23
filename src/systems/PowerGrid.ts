import { SystemId } from '../core/types';

export interface PowerConsumer {
  systemId: SystemId;
  priority: number; // 1 = Critical, 2 = Essential, 3 = Non-essential
  powerRequestedKw: number;
}

export class PowerGrid {
  public totalGenerationKw: number = 0;
  public totalCapacityKw: number = 0;
  public totalDemandKw: number = 0;
  public allocations: Map<SystemId, number> = new Map();
  public customPriorities: Map<SystemId, number> = new Map();
  public isBrownout: boolean = false;

  constructor() {
    this.customPriorities.set(SystemId.LifeSupport, 1);
    this.customPriorities.set(SystemId.Hull, 1);
    this.customPriorities.set(SystemId.Thermal, 2);
    this.customPriorities.set(SystemId.Battery, 2);
    this.customPriorities.set(SystemId.Communications, 3);
    this.customPriorities.set(SystemId.Drones, 3);
  }

  public setPriority(systemId: SystemId, priority: number): void {
    this.customPriorities.set(systemId, Math.max(1, Math.min(3, priority)));
  }

  public getPriority(systemId: SystemId): number {
    return this.customPriorities.get(systemId) ?? 2;
  }

  public updateAllocations(availablePowerKw: number, consumers: PowerConsumer[]): Map<SystemId, number> {
    this.totalGenerationKw = availablePowerKw;
    this.totalCapacityKw = availablePowerKw;
    this.allocations.clear();

    const activeConsumers = consumers.map(c => ({
      ...c,
      priority: this.getPriority(c.systemId),
    }));

    this.totalDemandKw = activeConsumers.reduce((sum, c) => sum + c.powerRequestedKw, 0);

    let remainingPower = availablePowerKw;
    this.isBrownout = availablePowerKw < this.totalDemandKw;

    for (const priorityLevel of [1, 2, 3]) {
      const levelConsumers = activeConsumers.filter(c => c.priority === priorityLevel);
      const levelDemand = levelConsumers.reduce((sum, c) => sum + c.powerRequestedKw, 0);

      if (remainingPower >= levelDemand) {
        for (const consumer of levelConsumers) {
          this.allocations.set(consumer.systemId, consumer.powerRequestedKw);
        }
        remainingPower -= levelDemand;
      } else if (remainingPower > 0) {
        const ratio = remainingPower / (levelDemand || 1);
        for (const consumer of levelConsumers) {
          this.allocations.set(consumer.systemId, consumer.powerRequestedKw * ratio);
        }
        remainingPower = 0;
      } else {
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
      totalCapacityKw: this.totalCapacityKw,
      totalDemandKw: this.totalDemandKw,
      allocations: Array.from(this.allocations.entries()),
      customPriorities: Array.from(this.customPriorities.entries()),
      isBrownout: this.isBrownout,
    };
  }

  public deserialize(data: any): void {
    this.totalGenerationKw = data.totalGenerationKw;
    this.totalCapacityKw = data.totalCapacityKw ?? data.totalGenerationKw;
    this.totalDemandKw = data.totalDemandKw;
    this.allocations = new Map(data.allocations);
    if (data.customPriorities) {
      this.customPriorities = new Map(data.customPriorities);
    }
    this.isBrownout = data.isBrownout;
  }
}
