import { GameState } from '../simulation/GameState';

export class SimulationEngine {
  private state: GameState;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private accumulator: number = 0;
  private readonly stepDt: number = 0.1; // 100ms fixed timestep
  private onTickCallbacks: Array<(state: GameState) => void> = [];

  constructor(state: GameState) {
    this.state = state;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  public stop(): void {
    this.isRunning = false;
  }

  public onTick(callback: (state: GameState) => void): void {
    this.onTickCallbacks.push(callback);
  }

  private loop(now: number): void {
    if (!this.isRunning) return;

    const frameDelta = (now - this.lastFrameTime) / 1000; // in seconds
    this.lastFrameTime = now;

    // Cap frameDelta to prevent spiral of death on lag spikes
    const clampedFrameDelta = Math.min(frameDelta, 0.25);
    this.accumulator += clampedFrameDelta;

    while (this.accumulator >= this.stepDt) {
      if (!this.state.isPaused) {
        this.state.tick(this.stepDt);
      }
      this.accumulator -= this.stepDt;
    }

    // Trigger UI / Render callbacks
    for (const cb of this.onTickCallbacks) {
      cb(this.state);
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  public stepOnce(dt: number): void {
    this.state.tick(dt);
  }
}
