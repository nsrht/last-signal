import { SaveManager } from '../persistence/SaveManager';

export interface MainMenuOptions {
  onNewGame: () => void;
  onContinueGame: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export class MainMenu {
  private container: HTMLElement;
  private options: MainMenuOptions;
  private animFrame: number = 0;
  private isVisible: boolean = true;

  constructor(container: HTMLElement, options: MainMenuOptions) {
    this.container = container;
    this.options = options;
    this.render();
  }

  public show(): void {
    this.isVisible = true;
    this.container.style.display = 'flex';
    this.render();
  }

  public hide(): void {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  private render(): void {
    const hasSave = SaveManager.hasSave();

    this.container.innerHTML = `
      <div class="main-menu-overlay">
        <canvas id="menu-bg-canvas"></canvas>
        <div class="main-menu-card">
          <div class="main-menu-header">
            <span class="logo-badge">EREBUS-7</span>
            <h1 class="main-title">LAST SIGNAL</h1>
            <p class="main-subtitle">Orbital Araştırma İstasyonu Komuta Simülasyonu</p>
          </div>

          <div class="main-menu-actions">
            <button class="btn btn-primary btn-large" id="btn-menu-new">Yeni Oyun</button>
            <button class="btn btn-large ${hasSave ? '' : 'btn-disabled'}" id="btn-menu-continue" ${hasSave ? '' : 'disabled'}>Devam Et</button>
            <button class="btn btn-large" id="btn-menu-help">Nasıl Oynanır?</button>
            <button class="btn btn-large" id="btn-menu-settings">Ayarlar</button>
          </div>

          <div class="main-menu-footer">
            <span>Sürüm 1.0.0 | Derleme 2189.10</span>
          </div>
        </div>
      </div>

      <!-- Overwrite Warning Modal -->
      <div class="modal-overlay" id="overwrite-modal" style="display: none;">
        <div class="modal-card">
          <h3>⚠️ Mevcut Kayıt Silinecek</h3>
          <p>Devam eden bir kayıtlı oyununuz var. Yeni bir oyuna başlamak mevcut ilerlemenizi tamamen silecek. Devam etmek istiyor musunuz?</p>
          <div class="modal-actions">
            <button class="btn btn-danger" id="btn-confirm-overwrite">Evet, Yeni Oyun Başlat</button>
            <button class="btn" id="btn-cancel-overwrite">İptal</button>
          </div>
        </div>
      </div>
    `;

    this.initBackgroundCanvas();
    this.bindEvents(hasSave);
  }

  private bindEvents(hasSave: boolean): void {
    const btnNew = document.getElementById('btn-menu-new');
    const btnContinue = document.getElementById('btn-menu-continue');
    const btnHelp = document.getElementById('btn-menu-help');
    const btnSettings = document.getElementById('btn-menu-settings');

    const modal = document.getElementById('overwrite-modal');
    const btnConfirmOverwrite = document.getElementById('btn-confirm-overwrite');
    const btnCancelOverwrite = document.getElementById('btn-cancel-overwrite');

    btnNew?.addEventListener('click', () => {
      if (hasSave) {
        if (modal) modal.style.display = 'flex';
      } else {
        this.hide();
        this.options.onNewGame();
      }
    });

    btnConfirmOverwrite?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
      SaveManager.deleteSave();
      this.hide();
      this.options.onNewGame();
    });

    btnCancelOverwrite?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });

    btnContinue?.addEventListener('click', () => {
      if (hasSave) {
        this.hide();
        this.options.onContinueGame();
      }
    });

    btnHelp?.addEventListener('click', () => {
      this.options.onHowToPlay();
    });

    btnSettings?.addEventListener('click', () => {
      this.options.onSettings();
    });
  }

  private initBackgroundCanvas(): void {
    const canvas = document.getElementById('menu-bg-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const stars: Array<{ x: number; y: number; size: number; speed: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
      });
    }

    const renderLoop = () => {
      if (!this.isVisible) return;
      this.animFrame++;

      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particle starfield
      ctx.fillStyle = '#00e5ff';
      for (const s of stars) {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;

        ctx.globalAlpha = 0.3 + Math.sin(this.animFrame * 0.05 + s.x) * 0.2;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.globalAlpha = 1.0;

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }
}
