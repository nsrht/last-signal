import { GameState } from '../simulation/GameState';
import { StationModule } from '../core/types';

export class StationRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private selectedModuleId: string | null = null;
  private hoveredModuleId: string | null = null;
  private animFrame: number = 0;
  private onModuleSelectCallback?: (moduleId: string | null) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupListeners();
  }

  public setSelectedModule(id: string | null): void {
    this.selectedModuleId = id;
  }

  public getSelectedModuleId(): string | null {
    return this.selectedModuleId;
  }

  public onModuleSelect(cb: (moduleId: string | null) => void): void {
    this.onModuleSelectCallback = cb;
  }

  private setupListeners(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      const hit = this.getModuleAt(x, y);
      this.hoveredModuleId = hit ? hit.id : null;
      this.canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      const hit = this.getModuleAt(x, y);
      this.selectedModuleId = hit ? hit.id : null;
      if (this.onModuleSelectCallback) {
        this.onModuleSelectCallback(this.selectedModuleId);
      }
    });
  }

  private getModuleAt(x: number, y: number): StationModule | null {
    return this.lastModules.find(m => x >= m.x && x <= m.x + m.width && y >= m.y && y <= m.y + m.height) || null;
  }

  private lastModules: StationModule[] = [];

  public resize(): void {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth || 800;
      this.canvas.height = parent.clientHeight || 500;
    }
  }

  public render(state: GameState): void {
    this.resize();
    this.lastModules = state.modules;
    this.animFrame++;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    this.drawGrid(w, h);
    this.drawCorridors(state.modules);
    this.drawPowerConduits(state.modules, this.animFrame);

    for (const mod of state.modules) {
      this.drawModule(mod);
    }
  }

  private drawGrid(w: number, h: number): void {
    this.ctx.strokeStyle = '#121a24';
    this.ctx.lineWidth = 1;
    const step = 40;

    this.ctx.beginPath();
    for (let x = 0; x < w; x += step) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += step) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
    }
    this.ctx.stroke();
  }

  private drawCorridors(modules: StationModule[]): void {
    this.ctx.strokeStyle = '#2a3b50';
    this.ctx.lineWidth = 12;

    const powerMod = modules.find(m => m.id === 'mod-power');
    if (!powerMod) return;

    const px = powerMod.x + powerMod.width / 2;
    const py = powerMod.y + powerMod.height / 2;

    this.ctx.beginPath();
    for (const mod of modules) {
      if (mod.id === powerMod.id) continue;
      const mx = mod.x + mod.width / 2;
      const my = mod.y + mod.height / 2;
      this.ctx.moveTo(px, py);
      this.ctx.lineTo(mx, my);
    }
    this.ctx.stroke();

    this.ctx.strokeStyle = '#182433';
    this.ctx.lineWidth = 6;
    this.ctx.stroke();
  }

  private drawPowerConduits(modules: StationModule[], frame: number): void {
    const powerMod = modules.find(m => m.id === 'mod-power');
    if (!powerMod) return;

    const px = powerMod.x + powerMod.width / 2;
    const py = powerMod.y + powerMod.height / 2;

    this.ctx.strokeStyle = '#00a8c6';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([6, 6]);
    this.ctx.lineDashOffset = -frame * 1.5;

    this.ctx.beginPath();
    for (const mod of modules) {
      if (mod.id === powerMod.id) continue;
      const mx = mod.x + mod.width / 2;
      const my = mod.y + mod.height / 2;
      this.ctx.moveTo(px, py);
      this.ctx.lineTo(mx, my);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawModule(mod: StationModule): void {
    const isSelected = mod.id === this.selectedModuleId;
    const isHovered = mod.id === this.hoveredModuleId;

    let bgGradient = this.ctx.createLinearGradient(mod.x, mod.y, mod.x, mod.y + mod.height);
    bgGradient.addColorStop(0, '#1c2636');
    bgGradient.addColorStop(1, '#121924');

    if (mod.isIsolated) {
      bgGradient = this.ctx.createLinearGradient(mod.x, mod.y, mod.x, mod.y + mod.height);
      bgGradient.addColorStop(0, '#382b1c');
      bgGradient.addColorStop(1, '#241a10');
    }

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(mod.x, mod.y, mod.width, mod.height);

    let borderColor = '#2a374c';
    if (isSelected) borderColor = '#00e5ff';
    else if (isHovered) borderColor = '#009cb3';
    else if (mod.isBreached) {
      borderColor = (Math.floor(this.animFrame / 15) % 2 === 0) ? '#ff3344' : '#66141b';
    } else if (mod.health < 50) borderColor = '#ffb300';

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = isSelected ? 3 : 2;
    this.ctx.strokeRect(mod.x, mod.y, mod.width, mod.height);

    this.ctx.fillStyle = borderColor;
    const cSize = 4;
    this.ctx.fillRect(mod.x, mod.y, cSize, cSize);
    this.ctx.fillRect(mod.x + mod.width - cSize, mod.y, cSize, cSize);
    this.ctx.fillRect(mod.x, mod.y + mod.height - cSize, cSize, cSize);
    this.ctx.fillRect(mod.x + mod.width - cSize, mod.y + mod.height - cSize, cSize, cSize);

    // Text label (truncated if longer than module width)
    this.ctx.fillStyle = '#e0e6ed';
    this.ctx.font = 'bold 9px monospace';
    const displayName = mod.name.length > 18 ? mod.name.substring(0, 16) + '..' : mod.name;
    this.ctx.fillText(displayName, mod.x + 6, mod.y + 16);

    const barX = mod.x + 6;
    const barY = mod.y + mod.height - 14;
    const barW = mod.width - 12;
    const barH = 5;

    this.ctx.fillStyle = '#0a0d12';
    this.ctx.fillRect(barX, barY, barW, barH);

    const fillW = Math.max(0, (mod.health / 100) * barW);
    let healthColor = '#00e676';
    if (mod.health < 40) healthColor = '#ff3344';
    else if (mod.health < 75) healthColor = '#ffb300';

    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(barX, barY, fillW, barH);

    let badgeX = mod.x + mod.width - 20;
    if (mod.isBreached) {
      this.ctx.fillStyle = '#ff3344';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.fillText('⚠️', badgeX, mod.y + 16);
      badgeX -= 14;
    }
    if (mod.isIsolated) {
      this.ctx.fillStyle = '#ffb300';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.fillText('🔒', badgeX, mod.y + 16);
    }
  }
}
