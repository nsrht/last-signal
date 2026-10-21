import { GameState } from '../simulation/GameState';
import { DroneTask, SimSpeed } from '../core/types';

export class CommandManager {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  // --- Speed & Pause Controls ---
  public setSpeed(speed: SimSpeed): void {
    this.state.simSpeed = speed;
    this.state.isPaused = speed === 0;
    this.state.addLog(`Simülasyon hızı değiştirildi: ${speed}x`);
  }

  public togglePause(): void {
    this.state.isPaused = !this.state.isPaused;
    this.state.addLog(this.state.isPaused ? 'Simülasyon DAKİKADA DURDURULDU (PAUSED).' : 'Simülasyon DEVAM EDİYOR.');
  }

  // --- Reactor Operations ---
  public setReactorThrottle(percentage: number): void {
    const clamped = Math.max(0, Math.min(150, percentage));
    this.state.reactor.setThrottle(clamped);
    this.state.addLog(`Reaktör güç seviyesi ayarlandı: %${clamped}`);
  }

  public triggerReactorScram(): void {
    this.state.reactor.triggerScram();
    this.state.addLog('ACİL DURUM: REAKTÖR SCRAM (ACİL KAPATMA) UYGULANDI!');
  }

  public resetReactorScram(): void {
    if (this.state.reactor.isMeltdown) {
      this.state.addLog('HATA: Reaktör çekirdeği eridi, yeniden başlatılamaz!');
      return;
    }
    this.state.reactor.resetScram();
    this.state.addLog('Reaktör SCRAM sıfırlandı. Düşük rölantide yeniden başlatılıyor.');
  }

  // --- Hull & Bulkhead Operations ---
  public toggleModuleIsolation(moduleId: string): void {
    const mod = this.state.modules.find(m => m.id === moduleId);
    if (mod) {
      this.state.hull.toggleIsolation(moduleId, this.state.modules);
      this.state.addLog(`Modül izolasyon kapağı ${mod.isIsolated ? 'KAPATILDI (İZOLE)' : 'AÇILDI'}: ${mod.name}`);
    }
  }

  // --- Repair Drone Operations ---
  public dispatchRepairTask(targetModuleId: string, taskType: DroneTask['taskType'], durationSec: number = 20): boolean {
    const mod = this.state.modules.find(m => m.id === targetModuleId);
    if (!mod) return false;

    const task: DroneTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetModuleId,
      targetSystemId: mod.systemId,
      taskType,
      progress: 0,
      duration: durationSec,
    };

    const assigned = this.state.repairManager.assignTask(task);
    if (assigned) {
      this.state.addLog(`Onarım Dronu görevlendirildi: [${taskType}] -> ${mod.name}`);
    } else {
      this.state.addLog(`Onarım görevi kuyruğa eklendi: [${taskType}] -> ${mod.name}`);
    }
    return true;
  }

  public cancelDroneTask(taskId: string): void {
    this.state.repairManager.cancelTask(taskId);
    this.state.addLog(`Onarım görevi iptal edildi: ${taskId}`);
  }

  // --- Communications Operations ---
  public tuneFrequency(freqMhz: number): void {
    this.state.comms.tuneFrequency(freqMhz);
  }
}
