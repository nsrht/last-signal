import './styles/main.css';
import { GameState } from './simulation/GameState';
import { SimulationEngine } from './core/engine';
import { CommandManager } from './systems/CommandManager';
import { StationRenderer } from './rendering/StationRenderer';
import { UIController } from './ui/UIController';
import { MainMenu } from './ui/MainMenu';
import { SaveManager } from './persistence/SaveManager';
import { SVG_ICONS } from './ui/icons';

console.log('LAST SIGNAL — Initializing Erebus-7 Station Systems...');

const app = document.getElementById('app');
if (app) {
  app.innerHTML = `
    <header class="topbar">
      <div class="topbar-left">
        <button class="sidebar-toggle-btn" id="btn-toggle-sidebar" aria-label="Menü">${SVG_ICONS.menu}</button>
        <div class="station-title">
          <span class="logo-badge">EREBUS-7</span>
          <span>LAST SIGNAL</span>
        </div>
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
      <button class="nav-item active" data-tab="overview">${SVG_ICONS.overview} Genel Bakış</button>
      <button class="nav-item" data-tab="reactor">${SVG_ICONS.reactor} Reaktör</button>
      <button class="nav-item" data-tab="lifesupport">${SVG_ICONS.lifesupport} Yaşam Desteği</button>
      <button class="nav-item" data-tab="thermal">${SVG_ICONS.thermal} Isıl Kontrol</button>
      <button class="nav-item" data-tab="hull">${SVG_ICONS.hull} Gövde</button>
      <button class="nav-item" data-tab="power">${SVG_ICONS.power} Güç Dağıtımı</button>
      <button class="nav-item" data-tab="drones">${SVG_ICONS.drones} Onarım Dronları</button>
      <button class="nav-item" data-tab="comms">${SVG_ICONS.comms} Haberleşme</button>
      <button class="nav-item" data-tab="logs">${SVG_ICONS.log} Seyir Defteri</button>
      <button class="nav-item" data-tab="manual">${SVG_ICONS.help} Nasıl Oynanır?</button>
      <button class="nav-item" data-tab="settings">${SVG_ICONS.settings} Ayarlar</button>
    </nav>

    <main class="central-viewport">
      <canvas id="station-canvas"></canvas>
    </main>

    <aside class="right-info-panel"></aside>

    <footer class="operations-area"></footer>
  `;

  let state = new GameState(1337, 'normal');
  state.isPaused = true; // Paused while main menu is open

  let engine = new SimulationEngine(state);
  let cmd = new CommandManager(state);

  const canvas = document.getElementById('station-canvas') as HTMLCanvasElement;
  const renderer = new StationRenderer(canvas);
  const ui = new UIController(state, cmd, renderer);

  engine.onTick((currentProgressState) => {
    renderer.render(currentProgressState);
    ui.update();
  });

  const menuContainer = document.createElement('div');
  menuContainer.id = 'main-menu-container';
  document.body.appendChild(menuContainer);

  const mainMenu = new MainMenu(menuContainer, {
    onNewGame: () => {
      engine.stop();
      state = new GameState(1337, 'normal');
      state.isPaused = false;
      cmd = new CommandManager(state);

      ui.setState(state, cmd);
      engine = new SimulationEngine(state);
      engine.onTick((s) => {
        renderer.render(s);
        ui.update();
      });
      engine.start();
    },
    onContinueGame: () => {
      SaveManager.loadGame(state);
      state.isPaused = false;
      ui.setState(state, cmd);
      engine.start();
    },
    onHowToPlay: () => {
      ui.showManual();
    },
    onSettings: () => {
      ui.setActiveTab('settings');
      mainMenu.hide();
    },
  });

  engine.start();
  console.log('LAST SIGNAL — Simulation engine ready.');
}
