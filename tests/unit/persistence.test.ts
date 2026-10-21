import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../../src/simulation/GameState';
import { SaveManager } from '../../src/persistence/SaveManager';

describe('SaveManager & Persistence System', () => {
  let state: GameState;
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();

  beforeEach(() => {
    state = new GameState(2024, 'normal');
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();
  });

  it('should save and load game state correctly', () => {
    state.simTimeSec = 120;
    state.reactor.setThrottle(88);
    state.addLog('Persistence test entry');

    const saveResult = SaveManager.saveGame(state);
    expect(saveResult).toBe(true);

    const newState = new GameState(1, 'zor');
    const loadResult = SaveManager.loadGame(newState);

    expect(loadResult).toBe(true);
    expect(newState.seed).toBe(2024);
    expect(newState.simTimeSec).toBe(120);
    expect(newState.reactor.throttle).toBe(88);
    expect(newState.logs[0]).toContain('Oyun başarıyla yüklendi.');
  });

  it('should handle corrupted save data gracefully', () => {
    localStorageMock.setItem('last_signal_save_v1', 'INVALID_JSON_CORRUPTED');

    const loadResult = SaveManager.loadGame(state);
    expect(loadResult).toBe(false);
  });
});
