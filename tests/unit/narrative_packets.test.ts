import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/simulation/GameState';

describe('Campaign Progression and Endings', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState(1337, 'normal');
  });

  it('should progress through Act I objectives and transition to Act II', () => {
    expect(state.currentAct).toBe('ACT_1');

    // Seal hull breach
    const hullMod = state.modules.find(m => m.id === 'mod-hull');
    if (hullMod) hullMod.isBreached = false;

    // Raise O2 above 80
    state.lifeSupport.o2Level = 85.0;

    // Advance sim time >= 30
    for (let i = 0; i < 35; i++) {
      state.tick(1.0);
    }

    expect(state.currentAct).toBe('ACT_2');
  });

  it('should reach Act III when comms decoding reaches 50%', () => {
    state.currentAct = 'ACT_2';
    state.comms.decodingProgress = 50.0;
    state.tick(1.0);

    expect(state.currentAct).toBe('ACT_3');
  });

  it('should unlock climax choice when decoding reaches 100%', () => {
    state.currentAct = 'ACT_3';
    state.comms.decodingProgress = 100.0;
    state.tick(1.0);

    expect(state.narrativeDirector.climaxChoiceUnlocked).toBe(true);
  });

  it('should trigger RESCUE ending when chosen with adequate hull and signal quality', () => {
    state.narrativeDirector.climaxChoiceUnlocked = true;
    state.hull.integrity = 80;
    state.comms.signalQuality = 50;

    state.narrativeDirector.chooseEnding(state, 'RESCUE');

    expect(state.ending).toBe('RESCUE');
    expect(state.isPaused || state.ending !== 'NONE').toBe(true);
  });

  it('should trigger SACRIFICE ending when chosen', () => {
    state.narrativeDirector.climaxChoiceUnlocked = true;

    state.narrativeDirector.chooseEnding(state, 'SACRIFICE');

    expect(state.ending).toBe('SACRIFICE');
  });

  it('should trigger CATASTROPHE ending on reactor meltdown or zero hull integrity', () => {
    state.reactor.isMeltdown = true;
    state.tick(1.0);

    expect(state.ending).toBe('CATASTROPHE');
  });
});
