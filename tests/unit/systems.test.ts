import { describe, it, expect } from 'vitest';
import { ReactorSystem } from '../../src/systems/ReactorSystem';
import { BatterySystem } from '../../src/systems/BatterySystem';
import { PowerGrid } from '../../src/systems/PowerGrid';
import { BALANCE_PRESETS } from '../../src/data/balance';
import { SystemId } from '../../src/core/types';

describe('Station System Units', () => {
  describe('ReactorSystem', () => {
    it('should generate more power and heat at higher throttle', () => {
      const config = BALANCE_PRESETS.normal;
      const reactor = new ReactorSystem();

      reactor.setThrottle(50);
      reactor.update(1, config);
      const power50 = reactor.powerGeneratedKw;
      const heat50 = reactor.heatOutput;

      reactor.setThrottle(100);
      reactor.update(1, config);
      const power100 = reactor.powerGeneratedKw;
      const heat100 = reactor.heatOutput;

      expect(power100).toBeGreaterThan(power50);
      expect(heat100).toBeGreaterThan(heat50);
    });

    it('should build core stress and degrade when throttle exceeds 100%', () => {
      const config = BALANCE_PRESETS.normal;
      const reactor = new ReactorSystem();
      reactor.setThrottle(140);

      reactor.update(10, config);

      expect(reactor.coreStress).toBeGreaterThan(0);
      expect(reactor.degradation).toBeGreaterThan(0);
    });

    it('should zero out power output upon SCRAM', () => {
      const config = BALANCE_PRESETS.normal;
      const reactor = new ReactorSystem();
      reactor.setThrottle(100);
      reactor.triggerScram();
      reactor.update(1, config);

      expect(reactor.powerGeneratedKw).toBe(0);
      expect(reactor.throttle).toBe(0);
    });
  });

  describe('BatterySystem', () => {
    it('should discharge when there is power deficit', () => {
      const config = BALANCE_PRESETS.normal;
      const battery = new BatterySystem();
      const initialCharge = battery.currentChargeKwh;

      const result = battery.update(10, config, 0, 50);

      expect(result.netPowerSuppliedKw).toBe(50);
      expect(battery.currentChargeKwh).toBeLessThan(initialCharge);
    });

    it('should charge when there is excess power', () => {
      const config = BALANCE_PRESETS.normal;
      const battery = new BatterySystem();
      battery.currentChargeKwh = 500;

      battery.update(10, config, 50, 0);

      expect(battery.currentChargeKwh).toBeGreaterThan(500);
    });
  });

  describe('PowerGrid', () => {
    it('should shed load according to priority during power shortages', () => {
      const grid = new PowerGrid();
      const consumers = [
        { systemId: SystemId.LifeSupport, priority: 1 as const, powerRequestedKw: 30 },
        { systemId: SystemId.Thermal, priority: 2 as const, powerRequestedKw: 20 },
        { systemId: SystemId.Communications, priority: 3 as const, powerRequestedKw: 25 },
      ];

      const allocations = grid.updateAllocations(40, consumers);

      expect(allocations.get(SystemId.LifeSupport)).toBe(30);
      expect(allocations.get(SystemId.Thermal)).toBe(10);
      expect(allocations.get(SystemId.Communications)).toBe(0);
      expect(grid.isBrownout).toBe(true);
    });
  });
});
