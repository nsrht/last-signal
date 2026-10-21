export type SimSpeed = 0 | 1 | 2 | 4;

export type DifficultyLevel = 'kolay' | 'normal' | 'zor';

export enum SystemId {
  Reactor = 'reactor',
  LifeSupport = 'lifesupport',
  Thermal = 'thermal',
  Hull = 'hull',
  Power = 'power',
  Battery = 'battery',
  Drones = 'drones',
  Communications = 'comms',
}

export type NarrativeAct = 'ACT_1' | 'ACT_2' | 'ACT_3';

export type GameEnding = 'NONE' | 'RESCUE' | 'SACRIFICE' | 'CATASTROPHE';

export interface StationModule {
  id: string;
  name: string;
  systemId: SystemId;
  health: number; // 0 to 100
  powerRequired: number;
  powerAllocated: number;
  heatGenerated: number;
  isIsolated: boolean;
  isBreached: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DroneTask {
  id: string;
  targetModuleId: string;
  targetSystemId: SystemId;
  taskType: 'REPAIR_MODULE' | 'SEAL_BREACH' | 'CLEAR_THERMAL' | 'REPAIR_SYSTEM';
  progress: number; // 0 to 100
  duration: number; // in sim seconds
}

export interface Drone {
  id: string;
  name: string;
  status: 'IDLE' | 'REPAIRING' | 'DAMAGED';
  health: number; // 0 to 100
  currentTask?: DroneTask;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  systemId?: SystemId;
  timestamp: number;
  resolved: boolean;
  actionText?: string;
}

export interface BalanceConfig {
  difficulty: DifficultyLevel;
  reactor: {
    basePowerOutput: number;
    maxPowerOutput: number;
    heatPerKw: number;
    stressThreshold: number;
    efficiencyLossPerStress: number;
  };
  lifeSupport: {
    o2ConsumptionPerSec: number;
    o2GenPerKw: number;
    maxO2Reserves: number;
    asphyxiationGraceSec: number;
  };
  thermal: {
    coolantKwDemand: number;
    heatDissipationPerKw: number;
    ambientHeatDissipation: number;
    overheatThreshold: number;
  };
  hull: {
    leakPerBreachPerSec: number;
    breachDamageRate: number;
    isolationLeakReduction: number;
  };
  battery: {
    maxCapacityKwh: number;
    chargeEfficiency: number;
    dischargeEfficiency: number;
    maxDischargeKw: number;
  };
  drones: {
    droneCount: number;
    repairRatePerSec: number;
    powerDemandPerDroneKw: number;
  };
  comms: {
    decodeKwDemand: number;
    baseDecodeRatePerSec: number;
    interferencePenalty: number;
  };
}
