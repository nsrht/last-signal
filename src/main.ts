import './styles/main.css';
import { GameState } from './simulation/GameState';
import { SimulationEngine } from './core/engine';
import { CommandManager } from './systems/CommandManager';
import { StationRenderer } from './rendering/StationRenderer';
import { UIController } from './ui/UIController';

console.log('LAST SIGNAL — Initializing Erebus-7 Station Systems...');

const app = document.getElementById('app');
if (app) {
  app.innerHTML = `
    <header class="topbar">
      <div class="station-title">
        <span class="logo-badge">EREBUS-7</span>
        <span>LAST SIGNAL</span>
      </div>
      <div class="topbar-center">
        <div class="metric-pill"><span class="label">MİSYON SÜRESİ:</span><span class="value" id="sim-time">00:00:00</span></div>
        <div class="metric-pill"><span class="label">PERİYOT:</span><span class="value" id="act-name">BÖLÜM I</span></div>
      </div>
      <div class="topbar-controls">
        <button class="btn" id="speed-pause">⏸</button>
        <button class="btn btn-primary" id="speed-1x">1x</button>
        <button class="btn" id="speed-2x">2x</button>
        <button class="btn" id="speed-4x">4x</button>
      </div>
    </header>

    <nav class="left-nav">
      <button class="nav-item active" data-tab="overview">📡 Genel Bakış</button>
      <button class="nav-item" data-tab="reactor">☢️ Reaktör</button>
      <button class="nav-item" data-tab="lifesupport">🌱 Yaşam Desteği</button>
      <button class="nav-item" data-tab="thermal">🔥 Isıl Kontrol</button>
      <button class="nav-item" data-tab="hull">🛡️ Gövde</button>
      <button class="nav-item" data-tab="power">⚡ Güç Dağıtımı</button>
      <button class="nav-item" data-tab="drones">🤖 Onarım Dronları</button>
      <button class="nav-item" data-tab="comms">📻 Haberleşme</button>
      <button class="nav-item" data-tab="logs">📜 Müsvedde/Log</button>
      <button class="nav-item" data-tab="settings">⚙️ Ayarlar</button>
    </nav>

    <main class="central-viewport">
      <canvas id="station-canvas"></canvas>
    </main>

    <aside class="right-info-panel"></aside>

    <footer class="operations-area"></footer>
  `;

  const state = new GameState(1337, 'normal');
  const engine = new SimulationEngine(state);
  const cmd = new CommandManager(state);

  const canvas = document.getElementById('station-canvas') as HTMLCanvasElement;
  const renderer = new StationRenderer(canvas);
  const ui = new UIController(state, cmd, renderer);

  engine.onTick((currentProgressState) => {
    renderer.render(currentProgressState);
    ui.update();
  });

  engine.start();
  console.log('LAST SIGNAL — Simulation engine running.');
}
