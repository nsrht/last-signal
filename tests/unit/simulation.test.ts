import { describe, it, expect } from 'vitest';
import { GameState } from '../../src/simulation/GameState';

describe('GameState & Simulation Loop', () => {
  it('should advance simulation time deterministically on tick', () => {
    const state = new GameState(999, 'normal');
    expect(state.simTimeSec).toBe(0);

    state.tick(1.0);
    expect(state.simTimeSec).toBe(1.0);

    state.simSpeed = 2;
    state.tick(1.0);
    expect(state.simTimeSec).toBe(3.0);
  });

  it('should trigger catastrophe when reactor melts down', () => {
    const state = new GameState(123, 'zor');
    state.reactor.coreStress = 100;
    state.tick(0.1);

    expect(state.ending).toBe('CATASTROPHE');
    expect(state.gameOverReason).toContain('Reaktör');
  });

  it('should trigger catastrophe when O2 grace period expires during asphyxiation', () => {
    const state = new GameState(123, 'normal');
    state.lifeSupport.o2Level = 0;
    state.lifeSupport.asphyxiationTimerSec = state.config.lifeSupport.asphyxiationGraceSec + 1;

    state.tick(0.1);

    expect(state.ending).toBe('CATASTROPHE');
    expect(state.gameOverReason).toContain('Oksijen');
  });

  it('should serialize and deserialize state faithfully', () => {
    const state = new GameState(555, 'normal');
    state.tick(10);
    state.reactor.setThrottle(90);
    state.addLog('Test log entry');

    const serialized = state.serialize();

    const restoredState = new GameState(111, 'kolay');
    restoredState.deserialize(serialized);

    expect(restoredState.seed).toBe(555);
    expect(restoredState.simTimeSec).toBe(10);
    expect(restoredState.reactor.throttle).toBe(90);
    expect(restoredState.logs[0]).toContain('Test log entry');
  });
});
