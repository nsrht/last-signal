import { GameState } from '../simulation/GameState';
import { CommandManager } from '../systems/CommandManager';
import { StationRenderer } from '../rendering/StationRenderer';
import { SignalScopeRenderer } from '../rendering/SignalScopeRenderer';
import { SaveManager } from '../persistence/SaveManager';
import { AudioManager } from '../audio/AudioManager';

export class UIController {
  private state: GameState;
  private cmd: CommandManager;
  private stationRenderer: StationRenderer;
  private audio: AudioManager;
  private signalScopeRenderer?: SignalScopeRenderer;
  private activeTab: string = 'overview';
  private lastRenderedTab: string = '';
  private lastSelectedModuleId: string | null = null;
  private lastClimaxChoiceState: boolean = false;

  constructor(state: GameState, cmd: CommandManager, stationRenderer: StationRenderer) {
    this.state = state;
    this.cmd = cmd;
    this.stationRenderer = stationRenderer;
    this.audio = new AudioManager();

    this.setupTabListeners();
    this.setupHeaderListeners();

    window.addEventListener('click', () => this.audio.init(), { once: true });
  }

  private setupHeaderListeners(): void {
    document.getElementById('speed-pause')?.addEventListener('click', () => {
      this.audio.playClick();
      this.cmd.setSpeed(0);
      this.updateTopBar();
    });
    document.getElementById('speed-1x')?.addEventListener('click', () => {
      this.audio.playClick();
      this.cmd.setSpeed(1);
      this.updateTopBar();
    });
    document.getElementById('speed-2x')?.addEventListener('click', () => {
      this.audio.playClick();
      this.cmd.setSpeed(2);
      this.updateTopBar();
    });
    document.getElementById('speed-4x')?.addEventListener('click', () => {
      this.audio.playClick();
      this.cmd.setSpeed(4);
      this.updateTopBar();
    });
  }

  private setupTabListeners(): void {
    const navItems = document.querySelectorAll('.left-nav .nav-item');
    navItems.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.audio.playClick();
        const target = e.currentTarget as HTMLElement;
        const tab = target.getAttribute('data-tab');
        if (tab) {
          this.setActiveTab(tab);
        }
      });
    });

    this.stationRenderer.onModuleSelect((moduleId) => {
      if (moduleId !== this.lastSelectedModuleId) {
        this.audio.playClick();
        this.lastSelectedModuleId = moduleId;
        this.renderRightInfoPanel();
        this.renderOperationsArea();
      }
    });
  }

  public setActiveTab(tab: string): void {
    this.activeTab = tab;
    const navItems = document.querySelectorAll('.left-nav .nav-item');
    navItems.forEach((btn) => {
      const bTab = btn.getAttribute('data-tab');
      if (bTab === tab) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    this.renderRightInfoPanel();
    this.renderOperationsArea();
  }

  public update(): void {
    this.updateTopBar();

    const climaxUnlocked = this.state.narrativeDirector.climaxChoiceUnlocked;
    if (climaxUnlocked !== this.lastClimaxChoiceState) {
      this.lastClimaxChoiceState = climaxUnlocked;
      this.renderRightInfoPanel();
    }

    if (this.signalScopeRenderer && this.activeTab === 'comms') {
      this.signalScopeRenderer.render(this.state.comms);
      // Update dynamic comms text if element present
      const freqEl = document.getElementById('comms-freq-text');
      if (freqEl) {
        freqEl.textContent = `${this.state.comms.activeFrequencyMhz.toFixed(1)} MHz`;
      }
    }
  }

  private updateTopBar(): void {
    const simTimeEl = document.getElementById('sim-time');
    if (simTimeEl) {
      const sec = Math.floor(this.state.simTimeSec);
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      simTimeEl.textContent = `${h}:${m}:${s}`;
    }

    const actNameEl = document.getElementById('act-name');
    if (actNameEl) {
      const actLabels: Record<string, string> = {
        ACT_1: 'BÖLÜM I: UYANIŞ',
        ACT_2: 'BÖLÜM II: PARAZİT',
        ACT_3: 'BÖLÜM III: SON SİNYAL',
      };
      actNameEl.textContent = actLabels[this.state.currentAct] || 'BÖLÜM I';
    }

    const speedBtns = {
      0: document.getElementById('speed-pause'),
      1: document.getElementById('speed-1x'),
      2: document.getElementById('speed-2x'),
      4: document.getElementById('speed-4x'),
    };
    Object.entries(speedBtns).forEach(([spd, btn]) => {
      if (btn) {
        if (Number(spd) === this.state.simSpeed && (!this.state.isPaused || Number(spd) === 0)) {
          btn.classList.add('btn-primary');
        } else {
          btn.classList.remove('btn-primary');
        }
      }
    });
  }

  private renderRightInfoPanel(): void {
    const panel = document.querySelector('.right-info-panel');
    if (!panel) return;

    const selectedModId = this.stationRenderer.getSelectedModuleId();
    const selectedMod = this.state.modules.find(m => m.id === selectedModId);

    let html = '';

    if (selectedMod) {
      html += `
        <div class="panel-section">
          <div class="panel-header">🔍 Seçili Modül</div>
          <div style="margin-bottom: 8px;"><strong>${selectedMod.name}</strong></div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
            <div>Sağlık Bütünlüğü: <strong style="color: ${selectedMod.health < 50 ? 'var(--color-red)' : 'var(--color-green)'}">%${Math.round(selectedMod.health)}</strong></div>
            <div>Güç Talebi: <strong>${selectedMod.powerRequired} kW</strong></div>
            <div>Isı Üretimi: <strong>${selectedMod.heatGenerated} kW/s</strong></div>
            <div>Gövde Sızıntısı: <strong style="color: ${selectedMod.isBreached ? 'var(--color-red)' : 'var(--text-muted)'}">${selectedMod.isBreached ? 'VAR (HASARLI)' : 'YOK'}</strong></div>
            <div>Yalıtım Kapağı: <strong style="color: ${selectedMod.isIsolated ? 'var(--color-amber)' : 'var(--text-muted)'}">${selectedMod.isIsolated ? 'KAPALI (İZOLE)' : 'AÇIK'}</strong></div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'reactor') {
      html += `
        <div class="panel-section">
          <div class="panel-header">☢️ Reaktör Tanılama</div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
            <div>Güç Seviyesi: <strong>%${this.state.reactor.throttle}</strong></div>
            <div>Üretilen Güç: <strong style="color: var(--color-cyan-glow)">${Math.round(this.state.reactor.powerGeneratedKw)} kW</strong></div>
            <div>Çekirdek Stresi: <strong style="color: ${this.state.reactor.coreStress > 70 ? 'var(--color-red)' : 'var(--color-amber)'}">%${Math.round(this.state.reactor.coreStress)}</strong></div>
            <div>Aşınma Degradasyonu: <strong>%${Math.round(this.state.reactor.degradation)}</strong></div>
            <div>SCRAM Durumu: <strong style="color: ${this.state.reactor.scramActive ? 'var(--color-red)' : 'var(--color-green)'}">${this.state.reactor.scramActive ? 'AKTİF (ACİL KAPALI)' : 'NORMAL'}</strong></div>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'lifesupport') {
      html += `
        <div class="panel-section">
          <div class="panel-header">🌱 Yaşam Desteği Tanılama</div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
            <div>Oksijen Seviyesi: <strong style="color: ${this.state.lifeSupport.o2Level < 30 ? 'var(--color-red)' : 'var(--color-green)'}">%${Math.round(this.state.lifeSupport.o2Level)}</strong></div>
            <div>Atmosfer Sızıntı Hızı: <strong style="color: ${this.state.hull.leakRate > 0 ? 'var(--color-red)' : 'var(--text-muted)'}">${this.state.hull.leakRate.toFixed(2)} %/s</strong></div>
            <div>Asfiksi / Boğulma Riski: <strong style="color: ${this.state.lifeSupport.isAsphyxiating ? 'var(--color-red)' : 'var(--color-green)'}">${this.state.lifeSupport.isAsphyxiating ? 'KRİTİK UYARI!' : 'YOK'}</strong></div>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'comms') {
      html += `
        <div class="panel-section">
          <div class="panel-header">📻 Sinyal Dekoderi</div>
          <div style="margin-bottom: 8px;">
            <canvas id="signal-scope-canvas" width="280" height="100" style="width: 100%; border: 1px solid var(--bg-panel-border); background: #000;"></canvas>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
            <div>Aktif Frekans: <strong style="color: var(--color-cyan-glow)" id="comms-freq-text">${this.state.comms.activeFrequencyMhz.toFixed(1)} MHz</strong></div>
            <div>Çözümleme İlerlemesi: <strong style="color: var(--color-cyan-glow)">%${Math.round(this.state.comms.decodingProgress)}</strong></div>
            <div>Sinyal Paraziti: <strong>%${Math.round(this.state.comms.interference)}</strong></div>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'settings') {
      html += `
        <div class="panel-section">
          <div class="panel-header">⚙️ Sistem Ayarları & Kayıt</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-primary" id="btn-save-game">💾 Oyunu Kaydet</button>
            <button class="btn" id="btn-load-game">📂 Kayıtlı Oyunu Yükle</button>
            <button class="btn btn-danger" id="btn-delete-save">🗑️ Kaydı Sıfırla</button>
          </div>
        </div>
      `;
    }

    // Active Mission Objectives
    html += `
      <div class="panel-section">
        <div class="panel-header">🎯 Aktif Görevler</div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
          ${this.state.narrativeDirector.objectives.map(o => `
            <div style="border-left: 2px solid ${o.completed ? 'var(--color-green)' : 'var(--color-cyan-glow)'}; padding-left: 6px;">
              <strong style="color: ${o.completed ? 'var(--color-green)' : 'var(--text-main)'}">${o.completed ? '✓ ' : ''}${o.title}</strong>
              <div style="color: var(--text-muted); font-size: 10px;">${o.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (this.state.narrativeDirector.climaxChoiceUnlocked && this.state.ending === 'NONE') {
      html += `
        <div class="panel-section" style="border-color: var(--color-cyan-glow);">
          <div class="panel-header" style="color: var(--color-cyan-glow);">🚨 NİHAİ KARAR ANI</div>
          <p style="font-size: 11px; margin-bottom: 8px;">Sinyal %100 çözümlendi. Erebus-7 istasyonunun nihai rotasını seçin:</p>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button class="btn btn-primary" id="btn-ending-rescue">📡 Dünya'ya Kurtarma Sinyali Gönder</button>
            <button class="btn btn-danger" id="btn-ending-sacrifice">🌌 Sinyali Derin Uzaya Yönlendir (Fedakarlık)</button>
          </div>
        </div>
      `;
    }

    panel.innerHTML = html;

    const scopeCanvas = document.getElementById('signal-scope-canvas') as HTMLCanvasElement;
    if (scopeCanvas) {
      this.signalScopeRenderer = new SignalScopeRenderer(scopeCanvas);
    }

    document.getElementById('btn-save-game')?.addEventListener('click', () => {
      this.audio.playClick();
      SaveManager.saveGame(this.state);
    });
    document.getElementById('btn-load-game')?.addEventListener('click', () => {
      this.audio.playClick();
      SaveManager.loadGame(this.state);
    });
    document.getElementById('btn-delete-save')?.addEventListener('click', () => {
      this.audio.playClick();
      SaveManager.deleteSave();
      this.state.addLog('Kayıtlı oyun silindi.');
    });

    document.getElementById('btn-ending-rescue')?.addEventListener('click', () => {
      this.audio.playAlarm();
      this.state.narrativeDirector.chooseEnding(this.state, 'RESCUE');
    });
    document.getElementById('btn-ending-sacrifice')?.addEventListener('click', () => {
      this.audio.playAlarm();
      this.state.narrativeDirector.chooseEnding(this.state, 'SACRIFICE');
    });
  }

  private renderOperationsArea(): void {
    const ops = document.querySelector('.operations-area');
    if (!ops) return;

    const selectedModId = this.stationRenderer.getSelectedModuleId();
    const selectedMod = this.state.modules.find(m => m.id === selectedModId);

    if (this.lastRenderedTab === this.activeTab && this.lastSelectedModuleId === selectedModId) {
      return;
    }
    this.lastRenderedTab = this.activeTab;
    this.lastSelectedModuleId = selectedModId;

    let html = '';

    if (this.activeTab === 'reactor') {
      html = `
        <div style="display: flex; align-items: center; gap: 16px; width: 100%;">
          <label style="font-family: var(--font-mono); font-size: 11px;">REAKTÖR GÜÇ SEVİYESİ (%):</label>
          <input type="range" id="reactor-throttle-slider" min="0" max="150" value="${this.state.reactor.throttle}" style="flex: 1;" />
          <button class="btn btn-danger" id="btn-scram">ACİL SCRAM</button>
          <button class="btn btn-primary" id="btn-reset-scram">Sıfırla / Restart</button>
        </div>
      `;
    } else if (this.activeTab === 'comms') {
      html = `
        <div style="display: flex; align-items: center; gap: 16px; width: 100%;">
          <label style="font-family: var(--font-mono); font-size: 11px;">FREKANS AYARI (1400 - 1440 MHz):</label>
          <input type="range" id="comms-freq-slider" min="1400.0" max="1440.0" step="0.1" value="${this.state.comms.activeFrequencyMhz}" style="flex: 1;" />
          <button class="btn btn-primary" id="btn-tune-target">Otomatik Kilitlen (1420.4 MHz)</button>
        </div>
      `;
    } else if (selectedMod) {
      html = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-family: var(--font-mono); font-size: 11px;">KOMUTLAR [${selectedMod.name}]:</span>
          <button class="btn btn-primary" id="btn-dispatch-repair">🤖 Dron Onarımı Başlat</button>
          ${selectedMod.isBreached ? `<button class="btn btn-danger" id="btn-dispatch-seal">⚠️ Sızıntıyı Mühürle</button>` : ''}
          <button class="btn" id="btn-toggle-isolation">${selectedMod.isIsolated ? '🔓 Yalıtımı Kaldır' : '🔒 Modülü İzole Et'}</button>
        </div>
      `;
    } else {
      html = `
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
          Komut Konsolu: Detaylı işlemler için sol menüden bir sistem veya haritadan bir modül seçiniz.
        </div>
      `;
    }

    ops.innerHTML = html;

    document.getElementById('reactor-throttle-slider')?.addEventListener('input', (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      this.cmd.setReactorThrottle(val);
    });

    document.getElementById('btn-scram')?.addEventListener('click', () => {
      this.audio.playAlarm();
      this.cmd.triggerReactorScram();
    });
    document.getElementById('btn-reset-scram')?.addEventListener('click', () => {
      this.audio.playClick();
      this.cmd.resetReactorScram();
    });

    document.getElementById('comms-freq-slider')?.addEventListener('input', (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      this.cmd.tuneFrequency(val);
    });

    document.getElementById('btn-tune-target')?.addEventListener('click', () => {
      this.audio.playClick();
      this.cmd.tuneFrequency(1420.4);
      this.renderRightInfoPanel();
    });

    if (selectedMod) {
      document.getElementById('btn-dispatch-repair')?.addEventListener('click', () => {
        this.audio.playClick();
        this.cmd.dispatchRepairTask(selectedMod.id, 'REPAIR_MODULE', 20);
      });
      document.getElementById('btn-dispatch-seal')?.addEventListener('click', () => {
        this.audio.playClick();
        this.cmd.dispatchRepairTask(selectedMod.id, 'SEAL_BREACH', 15);
      });
      document.getElementById('btn-toggle-isolation')?.addEventListener('click', () => {
        this.audio.playClick();
        this.cmd.toggleModuleIsolation(selectedMod.id);
      });
    }
  }
}
