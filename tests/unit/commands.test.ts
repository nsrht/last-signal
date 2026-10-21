import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/simulation/GameState';
import { CommandManager } from '../../src/systems/CommandManager';

describe('CommandManager Player Controls', () => {
  let state: GameState;
  let cmd: CommandManager;

  beforeEach(() => {
    state = new GameState(1337, 'normal');
    cmd = new CommandManager(state);
  });

  it('should adjust simulation speed correctly', () => {
    cmd.setSpeed(2);
    expect(state.simSpeed).toBe(2);
    expect(state.isPaused).toBe(false);

    cmd.setSpeed(0);
    expect(state.simSpeed).toBe(0);
    expect(state.isPaused).toBe(true);
  });

  it('should trigger and reset reactor SCRAM', () => {
    cmd.triggerReactorScram();
    expect(state.reactor.scramActive).toBe(true);
    expect(state.reactor.throttle).toBe(0);

    cmd.resetReactorScram();
    expect(state.reactor.scramActive).toBe(false);
    expect(state.reactor.throttle).toBe(30);
  });

  it('should toggle module bulkhead isolation', () => {
    const mod = state.modules[0];
    const initialIso = mod.isIsolated;

    cmd.toggleModuleIsolation(mod.id);
    expect(mod.isIsolated).toBe(!initialIso);

    cmd.toggleModuleIsolation(mod.id);
    expect(mod.isIsolated).toBe(initialIso);
  });

  it('should dispatch repair tasks to available drones', () => {
    const mod = state.modules.find(m => m.isBreached)!;
    const dispatched = cmd.dispatchRepairTask(mod.id, 'SEAL_BREACH', 15);

    expect(dispatched).toBe(true);
    const activeDrone = state.repairManager.drones.find(d => d.status === 'REPAIRING');
    expect(activeDrone).toBeDefined();
    expect(activeDrone?.currentTask?.taskType).toBe('SEAL_BREACH');
  });

  it('should adjust communication frequency tuning', () => {
    cmd.tuneFrequency(1420.4);
    expect(state.comms.activeFrequencyMhz).toBe(1420.4);
  });
});
