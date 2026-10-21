import { GameState } from '../simulation/GameState';

export class SaveManager {
  private static readonly SAVE_KEY = 'last_signal_save_v1';
  private static readonly SAVE_VERSION = '1.0.0';

  public static saveGame(state: GameState): boolean {
    try {
      const payload = {
        version: this.SAVE_VERSION,
        savedAt: new Date().toISOString(),
        gameState: state.serialize(),
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(payload));
      state.addLog('Oyun kaydedildi (localStorage).');
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  public static loadGame(state: GameState): boolean {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;

      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== this.SAVE_VERSION || !parsed.gameState) {
        console.warn('Corrupted or incompatible save file detected.');
        return false;
      }

      state.deserialize(parsed.gameState);
      state.addLog('Oyun başarıyla yüklendi.');
      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  }

  public static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  public static deleteSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }
}
