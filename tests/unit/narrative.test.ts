import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/simulation/GameState';
import { EVENT_DEFINITIONS } from '../../src/data/events';

describe('EventDirector & Narrative Campaign', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState(1337, 'normal');
  });

  it('should trigger events correctly when invoked', () => {
    const microMeteor = EVENT_DEFINITIONS.find(e => e.id === 'evt-micro-meteor')!;
    state.eventDirector.triggerEvent(state, microMeteor);

    expect(state.events.length).toBeGreaterThan(0);
    expect(state.events[0].title).toBe('Mikro-Göktaşı Çarpması');
    expect(state.logs[0]).toContain('Mikro-Göktaşı Çarpması');
  });

  it('should transition from Act I to Act II when objectives are fulfilled', () => {
    expect(state.currentAct).toBe('ACT_1');

    // Seal breach
    for (const mod of state.modules) {
      mod.isBreached = false;
    }
    state.lifeSupport.o2Level = 85.0;

    // Tick for 31 sim seconds
    for (let i = 0; i < 310; i++) {
      state.tick(0.1);
    }

    expect(state.currentAct).toBe('ACT_2');
    expect(state.narrativeDirector.objectives[0].id).toBe('obj-act2-signal');
  });

  it('should transition from Act II to Act III upon signal decoding threshold', () => {
    state.currentAct = 'ACT_2';
    state.comms.decodingProgress = 51.0;

    state.tick(0.1);

    expect(state.currentAct).toBe('ACT_3');
  });

  it('should unlock climax ending choice when decoding completes 100%', () => {
    state.currentAct = 'ACT_3';
    state.comms.decodingProgress = 100.0;

    state.tick(0.1);

    expect(state.narrativeDirector.climaxChoiceUnlocked).toBe(true);

    // Test Rescue Ending
    state.narrativeDirector.chooseEnding(state, 'RESCUE');
    expect(state.ending).toBe('RESCUE');
    expect(state.gameOverReason).toContain('Kurtarma');
  });
});
