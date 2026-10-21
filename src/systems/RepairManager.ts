import { BalanceConfig, Drone, DroneTask, StationModule } from '../core/types';

export class RepairManager {
  public drones: Drone[] = [];
  public taskQueue: DroneTask[] = [];

  public initialize(config: BalanceConfig): void {
    this.drones = [];
    for (let i = 1; i <= config.drones.droneCount; i++) {
      this.drones.push({
        id: `drone-${i}`,
        name: `Dron-0${i}`,
        status: 'IDLE',
        health: 100,
      });
    }
  }

  public assignTask(task: DroneTask): boolean {
    const availableDrone = this.drones.find(d => d.status === 'IDLE' && d.health > 20);
    if (!availableDrone) {
      if (!this.taskQueue.some(t => t.id === task.id)) {
        this.taskQueue.push(task);
      }
      return false;
    }

    availableDrone.status = 'REPAIRING';
    availableDrone.currentTask = task;
    return true;
  }

  public cancelTask(taskId: string): void {
    this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);
    for (const drone of this.drones) {
      if (drone.currentTask?.id === taskId) {
        drone.status = 'IDLE';
        drone.currentTask = undefined;
      }
    }
  }

  public getPowerDemandKw(config: BalanceConfig): number {
    const activeDronesCount = this.drones.filter(d => d.status === 'REPAIRING').length;
    return activeDronesCount * config.drones.powerDemandPerDroneKw;
  }

  public update(dt: number, powerRatio: number, modules: StationModule[], config: BalanceConfig): void {
    for (const drone of this.drones) {
      if (drone.status === 'REPAIRING' && drone.currentTask) {
        const task = drone.currentTask;

        const speed = config.drones.repairRatePerSec * powerRatio * dt;
        task.progress = Math.min(100, task.progress + (speed / task.duration) * 100);

        const targetMod = modules.find(m => m.id === task.targetModuleId);
        if (targetMod) {
          if (task.taskType === 'REPAIR_MODULE') {
            targetMod.health = Math.min(100, targetMod.health + speed * 2);
          } else if (task.taskType === 'SEAL_BREACH') {
            if (task.progress >= 100) {
              targetMod.isBreached = false;
            }
          }
        }

        if (task.progress >= 100) {
          drone.status = 'IDLE';
          drone.currentTask = undefined;

          if (this.taskQueue.length > 0) {
            const nextTask = this.taskQueue.shift()!;
            this.assignTask(nextTask);
          }
        }
      }
    }
  }

  public serialize() {
    return {
      drones: this.drones,
      taskQueue: this.taskQueue,
    };
  }

  public deserialize(data: ReturnType<RepairManager['serialize']>): void {
    this.drones = data.drones;
    this.taskQueue = data.taskQueue;
  }
}
