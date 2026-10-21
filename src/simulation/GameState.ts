import { BALANCE_PRESETS } from '../data/balance';
import { BalanceConfig, DifficultyLevel, GameEnding, GameEvent, NarrativeAct, SimSpeed, StationModule, SystemId } from '../core/types';
import { SeededRandom } from '../core/random';
import { ReactorSystem } from '../systems/ReactorSystem';
import { BatterySystem } from '../systems/BatterySystem';
import { PowerGrid, PowerConsumer } from '../systems/PowerGrid';
import { LifeSupportSystem } from '../systems/LifeSupportSystem';
import { ThermalSystem } from '../systems/ThermalSystem';
import { HullSystem } from '../systems/HullSystem';
import { RepairManager } from '../systems/RepairManager';
import { CommunicationsSystem } from '../systems/CommunicationsSystem';
import { EventDirector } from '../events/EventDirector';
import { NarrativeDirector } from '../narrative/NarrativeDirector';

export class GameState {
  public seed: number;
  public rng: SeededRandom;
  public difficulty: DifficultyLevel = 'normal';
  public config: BalanceConfig;

  public simTimeSec: number = 0;
  public simSpeed: SimSpeed = 1;
  public isPaused: boolean = false;

  public currentAct: NarrativeAct = 'ACT_1';
  public ending: GameEnding = 'NONE';
  public gameOverReason: string = '';

  // Station Systems
  public reactor: ReactorSystem;
  public battery: BatterySystem;
  public powerGrid: PowerGrid;
  public lifeSupport: LifeSupportSystem;
  public thermal: ThermalSystem;
  public hull: HullSystem;
  public repairManager: RepairManager;
  public comms: CommunicationsSystem;

  // Directors
  public eventDirector: EventDirector;
  public narrativeDirector: NarrativeDirector;

  // Station Modules
  public modules: StationModule[] = [];

  // Events & Log
  public events: GameEvent[] = [];
  public logs: string[] = [];

  constructor(seed: number = 1337, difficulty: DifficultyLevel = 'normal') {
    this.seed = seed;
    this.rng = new SeededRandom(seed);
    this.difficulty = difficulty;
    this.config = BALANCE_PRESETS[difficulty];

    this.reactor = new ReactorSystem();
    this.battery = new BatterySystem();
    this.powerGrid = new PowerGrid();
    this.lifeSupport = new LifeSupportSystem();
    this.thermal = new ThermalSystem();
    this.hull = new HullSystem();
    this.repairManager = new RepairManager();
    this.comms = new CommunicationsSystem();

    this.eventDirector = new EventDirector();
    this.narrativeDirector = new NarrativeDirector();

    this.initModules();
    this.repairManager.initialize(this.config);
    this.addLog('Erebus-7 İkaz Sistemi Aktif. Komuta Konsolu Başlatıldı.');
  }

  private initModules(): void {
    this.modules = [
      {
        id: 'mod-reactor',
        name: 'Ana Füzyon Reaktörü',
        systemId: SystemId.Reactor,
        health: 85,
        powerRequired: 10,
        powerAllocated: 10,
        heatGenerated: 12.0,
        isIsolated: false,
        isBreached: false,
        x: 100,
        y: 200,
        width: 140,
        height: 100,
      },
      {
        id: 'mod-power',
        name: 'Güç Dağıtım Deposu',
        systemId: SystemId.Power,
        health: 90,
        powerRequired: 5,
        powerAllocated: 5,
        heatGenerated: 2.0,
        isIsolated: false,
        isBreached: false,
        x: 280,
        y: 200,
        width: 120,
        height: 100,
      },
      {
        id: 'mod-battery',
        name: 'Batarya Hücre Kompleksi',
        systemId: SystemId.Battery,
        health: 95,
        powerRequired: 0,
        powerAllocated: 0,
        heatGenerated: 1.5,
        isIsolated: false,
        isBreached: false,
        x: 280,
        y: 330,
        width: 120,
        height: 90,
      },
      {
        id: 'mod-lifesupport',
        name: 'Oksijen Sintetizör Modülü',
        systemId: SystemId.LifeSupport,
        health: 70,
        powerRequired: 30,
        powerAllocated: 30,
        heatGenerated: 3.0,
        isIsolated: false,
        isBreached: false,
        x: 440,
        y: 120,
        width: 130,
        height: 90,
      },
      {
        id: 'mod-thermal',
        name: 'Radyatör ve Soğutucu Pompa Blok',
        systemId: SystemId.Thermal,
        health: 80,
        powerRequired: 25,
        powerAllocated: 25,
        heatGenerated: 1.0,
        isIsolated: false,
        isBreached: false,
        x: 440,
        y: 240,
        width: 130,
        height: 90,
      },
      {
        id: 'mod-hull',
        name: 'Gövde Ana Basınç Koridoru',
        systemId: SystemId.Hull,
        health: 65,
        powerRequired: 5,
        powerAllocated: 5,
        heatGenerated: 0.5,
        isIsolated: false,
        isBreached: true,
        x: 280,
        y: 70,
        width: 120,
        height: 100,
      },
      {
        id: 'mod-drones',
        name: 'Onarım Hangarı',
        systemId: SystemId.Drones,
        health: 100,
        powerRequired: 15,
        powerAllocated: 15,
        heatGenerated: 2.0,
        isIsolated: false,
        isBreached: false,
        x: 610,
        y: 160,
        width: 120,
        height: 90,
      },
      {
        id: 'mod-comms',
        name: 'Haberleşme & Anten Dizisi',
        systemId: SystemId.Communications,
        health: 75,
        powerRequired: 20,
        powerAllocated: 20,
        heatGenerated: 2.5,
        isIsolated: false,
        isBreached: false,
        x: 610,
        y: 280,
        width: 120,
        height: 90,
      },
    ];
  }

  public tick(dt: number): void {
    if (this.isPaused || this.ending !== 'NONE') return;

    const actualDt = dt * this.simSpeed;
    this.simTimeSec += actualDt;

    // 1. Update Reactor
    this.reactor.update(actualDt, this.config);

    // 2. Build Power Grid consumers
    const consumers: PowerConsumer[] = [
      { systemId: SystemId.LifeSupport, priority: 1, powerRequestedKw: this.lifeSupport.o2GenKwDemand },
      { systemId: SystemId.Hull, priority: 1, powerRequestedKw: 5.0 },
      { systemId: SystemId.Thermal, priority: 2, powerRequestedKw: this.thermal.coolantPowerDemandKw },
      { systemId: SystemId.Battery, priority: 2, powerRequestedKw: 20.0 },
      { systemId: SystemId.Communications, priority: 3, powerRequestedKw: this.comms.decodeKwDemand },
      { systemId: SystemId.Drones, priority: 3, powerRequestedKw: this.repairManager.getPowerDemandKw(this.config) },
    ];

    const rawGeneration = this.reactor.powerGeneratedKw;

    // 3. Update Power Grid & Battery
    this.powerGrid.updateAllocations(rawGeneration, consumers);
    const deficit = Math.max(0, this.powerGrid.totalDemandKw - rawGeneration);
    const excess = Math.max(0, rawGeneration - this.powerGrid.totalDemandKw);

    const batteryResult = this.battery.update(actualDt, this.config, excess, deficit);
    const totalPowerAvailable = rawGeneration + batteryResult.netPowerSuppliedKw;

    this.powerGrid.updateAllocations(totalPowerAvailable, consumers);

    // 4. Update Systems
    const commsPowerRatio = this.powerGrid.getAllocatedRatio(SystemId.Communications, this.comms.decodeKwDemand);
    const dronePowerRatio = this.powerGrid.getAllocatedRatio(SystemId.Drones, this.repairManager.getPowerDemandKw(this.config));

    this.hull.update(actualDt, this.modules, this.config);
    this.lifeSupport.update(actualDt, this.powerGrid.allocations.get(SystemId.LifeSupport) ?? 0, this.hull.leakRate, this.config);

    const totalHeatInput = this.reactor.heatOutput + this.modules.reduce((s, m) => s + (m.isIsolated ? 0 : m.heatGenerated), 0);
    this.thermal.update(actualDt, totalHeatInput, this.powerGrid.allocations.get(SystemId.Thermal) ?? 0, this.config);

    this.repairManager.update(actualDt, dronePowerRatio, this.modules, this.config);
    this.comms.update(actualDt, commsPowerRatio, this.config);

    // 5. Update Directors
    this.eventDirector.tick(this);
    this.narrativeDirector.tick(this);

    // 6. Game Over / Ending Checks
    this.checkGameConditions();
  }

  private checkGameConditions(): void {
    if (this.reactor.isMeltdown) {
      this.triggerEnding('CATASTROPHE', 'Reaktör çekirdeği eridi. İstasyon infilak etti.');
    } else if (this.lifeSupport.isAsphyxiating && this.lifeSupport.asphyxiationTimerSec > this.config.lifeSupport.asphyxiationGraceSec) {
      this.triggerEnding('CATASTROPHE', 'Oksijen seviyesi tükendi. Yaşam desteği çöktü.');
    } else if (this.hull.integrity <= 0) {
      this.triggerEnding('CATASTROPHE', 'Gövde bütünlüğü sıfırlandı. Katastrofik dekompresyon.');
    }
  }

  public triggerEnding(ending: GameEnding, reason: string): void {
    this.ending = ending;
    this.gameOverReason = reason;
    this.addLog(`[MİSYON SONU] ${reason}`);
  }

  public addLog(msg: string): void {
    const timestamp = new Date(this.simTimeSec * 1000).toISOString().substring(11, 19);
    this.logs.unshift(`[${timestamp}] ${msg}`);
    if (this.logs.length > 100) this.logs.pop();
  }

  public serialize() {
    return {
      seed: this.seed,
      rngSeed: this.rng.getSeed(),
      difficulty: this.difficulty,
      simTimeSec: this.simTimeSec,
      simSpeed: this.simSpeed,
      isPaused: this.isPaused,
      currentAct: this.currentAct,
      ending: this.ending,
      gameOverReason: this.gameOverReason,
      reactor: this.reactor.serialize(),
      battery: this.battery.serialize(),
      powerGrid: this.powerGrid.serialize(),
      lifeSupport: this.lifeSupport.serialize(),
      thermal: this.thermal.serialize(),
      hull: this.hull.serialize(),
      repairManager: this.repairManager.serialize(),
      comms: this.comms.serialize(),
      modules: this.modules,
      events: this.events,
      logs: this.logs,
    };
  }

  public deserialize(data: any): void {
    this.seed = data.seed;
    this.rng.setSeed(data.rngSeed);
    this.difficulty = data.difficulty;
    this.config = BALANCE_PRESETS[this.difficulty];

    this.simTimeSec = data.simTimeSec;
    this.simSpeed = data.simSpeed;
    this.isPaused = data.isPaused;
    this.currentAct = data.currentAct;
    this.ending = data.ending;
    this.gameOverReason = data.gameOverReason;

    this.reactor.deserialize(data.reactor);
    this.battery.deserialize(data.battery);
    this.powerGrid.deserialize(data.powerGrid);
    this.lifeSupport.deserialize(data.lifeSupport);
    this.thermal.deserialize(data.thermal);
    this.hull.deserialize(data.hull, data.modules);
    this.repairManager.deserialize(data.repairManager);
    this.comms.deserialize(data.comms);

    this.modules = data.modules;
    this.events = data.events;
    this.logs = data.logs;
  }
}
