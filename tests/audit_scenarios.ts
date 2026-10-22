import { GameState } from '../src/simulation/GameState';
import { CommandManager } from '../src/systems/CommandManager';

function runScenario(name: string, setup: (state: GameState, cmd: CommandManager) => void, ticks: number) {
  console.log(`\n========================================`);
  console.log(`SCENARIO: ${name}`);
  console.log(`========================================`);

  const state = new GameState(1337, 'normal');
  const cmd = new CommandManager(state);

  setup(state, cmd);

  for (let i = 1; i <= ticks; i++) {
    state.tick(0.1); // 0.1s step
  }

  console.log(`Final Sim Time: ${state.simTimeSec.toFixed(1)}s`);
  console.log(`Act: ${state.currentAct}`);
  console.log(`Ending: ${state.ending}`);
  console.log(`Reason: ${state.gameOverReason || 'None'}`);
  console.log(`Reactor Output: ${state.reactor.powerGeneratedKw.toFixed(1)} kW (Throttle: ${state.reactor.throttle}%)`);
  console.log(`Reactor Stress: ${state.reactor.coreStress.toFixed(1)}%`);
  console.log(`O2 Level: ${state.lifeSupport.o2Level.toFixed(1)}%`);
  console.log(`Station Temp: ${state.thermal.temperature.toFixed(1)} °C`);
  console.log(`Hull Integrity: ${state.hull.integrity.toFixed(1)}% (Breaches: ${state.hull.breachesCount})`);
  console.log(`Battery Charge: ${state.battery.currentChargeKwh.toFixed(1)} kWh (${state.battery.getChargePercentage().toFixed(1)}%)`);
  console.log(`Comms Decoding: ${state.comms.decodingProgress.toFixed(1)}%`);
  console.log(`Active Drones Busy: ${state.repairManager.drones.filter(d => d.status === 'REPAIRING').length}`);
}

// 1. Normal Operation (100 seconds)
runScenario('1. Baseline Normal Operation (100s)', (state, cmd) => {
  // Player seals initial breach and tunes comms
  cmd.dispatchRepairTask('mod-hull', 'SEAL_BREACH', 15);
  cmd.tuneFrequency(1420.4);
}, 1000);

// 2. Power Shortage / SCRAM Test
runScenario('2. Reactor SCRAM & Battery Backup (100s)', (state, cmd) => {
  cmd.triggerReactorScram();
}, 1000);

// 3. Reactor Overheat Test (Throttle 140%)
runScenario('3. High Reactor Throttle Overheat (200s)', (state, cmd) => {
  cmd.setReactorThrottle(140);
}, 2000);

// 4. Oxygen Emergency Test (Breaches unsealed, no power to LS)
runScenario('4. Uncontained Hull Breaches & Oxygen Depletion (300s)', (state, cmd) => {
  state.lifeSupport.o2GenKwDemand = 500; // Unreachable demand causing 0 power
}, 3000);

// 5. Full Campaign Progression
runScenario('5. Full Campaign Progression to Rescue Ending', (state, cmd) => {
  cmd.dispatchRepairTask('mod-hull', 'SEAL_BREACH', 10);
  cmd.tuneFrequency(1420.4);
  cmd.setReactorThrottle(90);
}, 6000); // 600 seconds
