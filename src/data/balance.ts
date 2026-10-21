import { BalanceConfig, DifficultyLevel } from '../core/types';

export const BALANCE_PRESETS: Record<DifficultyLevel, BalanceConfig> = {
  kolay: {
    difficulty: 'kolay',
    reactor: {
      basePowerOutput: 100,
      maxPowerOutput: 200,
      heatPerKw: 0.08,
      stressThreshold: 85,
      efficiencyLossPerStress: 0.002,
    },
    lifeSupport: {
      o2ConsumptionPerSec: 0.6,
      o2GenPerKw: 0.08,
      maxO2Reserves: 100,
      asphyxiationGraceSec: 45,
    },
    thermal: {
      coolantKwDemand: 20,
      heatDissipationPerKw: 0.8,
      ambientHeatDissipation: 0.3,
      overheatThreshold: 90,
    },
    hull: {
      leakPerBreachPerSec: 0.3,
      breachDamageRate: 0.05,
      isolationLeakReduction: 0.9,
    },
    battery: {
      maxCapacityKwh: 1200,
      chargeEfficiency: 0.95,
      dischargeEfficiency: 0.95,
      maxDischargeKw: 150,
    },
    drones: {
      droneCount: 4,
      repairRatePerSec: 4.0,
      powerDemandPerDroneKw: 5,
    },
    comms: {
      decodeKwDemand: 15,
      baseDecodeRatePerSec: 0.15,
      interferencePenalty: 0.4,
    },
  },
  normal: {
    difficulty: 'normal',
    reactor: {
      basePowerOutput: 100,
      maxPowerOutput: 200,
      heatPerKw: 0.12,
      stressThreshold: 75,
      efficiencyLossPerStress: 0.005,
    },
    lifeSupport: {
      o2ConsumptionPerSec: 0.8,
      o2GenPerKw: 0.06,
      maxO2Reserves: 100,
      asphyxiationGraceSec: 30,
    },
    thermal: {
      coolantKwDemand: 25,
      heatDissipationPerKw: 0.6,
      ambientHeatDissipation: 0.2,
      overheatThreshold: 85,
    },
    hull: {
      leakPerBreachPerSec: 0.5,
      breachDamageRate: 0.1,
      isolationLeakReduction: 0.8,
    },
    battery: {
      maxCapacityKwh: 1000,
      chargeEfficiency: 0.9,
      dischargeEfficiency: 0.9,
      maxDischargeKw: 120,
    },
    drones: {
      droneCount: 3,
      repairRatePerSec: 2.5,
      powerDemandPerDroneKw: 8,
    },
    comms: {
      decodeKwDemand: 20,
      baseDecodeRatePerSec: 0.1,
      interferencePenalty: 0.5,
    },
  },
  zor: {
    difficulty: 'zor',
    reactor: {
      basePowerOutput: 100,
      maxPowerOutput: 200,
      heatPerKw: 0.18,
      stressThreshold: 65,
      efficiencyLossPerStress: 0.008,
    },
    lifeSupport: {
      o2ConsumptionPerSec: 1.1,
      o2GenPerKw: 0.045,
      maxO2Reserves: 100,
      asphyxiationGraceSec: 20,
    },
    thermal: {
      coolantKwDemand: 30,
      heatDissipationPerKw: 0.45,
      ambientHeatDissipation: 0.1,
      overheatThreshold: 80,
    },
    hull: {
      leakPerBreachPerSec: 0.8,
      breachDamageRate: 0.18,
      isolationLeakReduction: 0.7,
    },
    battery: {
      maxCapacityKwh: 800,
      chargeEfficiency: 0.85,
      dischargeEfficiency: 0.85,
      maxDischargeKw: 100,
    },
    drones: {
      droneCount: 2,
      repairRatePerSec: 1.8,
      powerDemandPerDroneKw: 10,
    },
    comms: {
      decodeKwDemand: 25,
      baseDecodeRatePerSec: 0.08,
      interferencePenalty: 0.65,
    },
  },
};
