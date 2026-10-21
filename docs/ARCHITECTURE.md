# LAST SIGNAL — Architectural Specification

## Architecture Overview
LAST SIGNAL follows a clean, decoupled modular architecture where simulation state, event handling, rendering, audio, and user interface are strictly separated.

```
+-------------------------------------------------------------------+
|                           UIController                            |
|             (DOM Events, User Inputs, Context Panels)            |
+-------------------+-------------------------------+---------------+
                    |                               |
                    v                               v
+-------------------+-------------------+   +-------+---------------+
|          SimulationEngine             |   |    StationRenderer    |
| (Fixed Timestep Loop, Seeded PRNG)    |   |  (Canvas 2D Schematic)|
+-------------------+-------------------+   +-----------------------+
                    |
                    v
+-------------------+-----------------------------------------------+
|                      GameState / Systems                          |
|  - PowerGrid          - LifeSupport       - Reactor               |
|  - ThermalControl     - HullIntegrity     - RepairManager         |
|  - Communications     - BatterySystem     - ResourceManager       |
+-------------------+-----------------------------------------------+
                    |
                    v
+-------------------+-------------------+   +-----------------------+
|  EventDirector / NarrativeDirector    |   |     AudioManager      |
|  (Triggers, Acts, Story Progression)  |   | (Web Audio API Synth) |
+-------------------+-------------------+   +-----------------------+
                    |
                    v
+-------------------+-----------------------------------------------+
|                    SaveManager (localStorage)                     |
+-------------------------------------------------------------------+
```

## Module Breakdown

### 1. `src/core/`
- `engine.ts`: `SimulationEngine` manages the fixed-timestep game tick loop, simulation speeds (0x, 1x, 2x, 4x), delta accumulation, and update hooks.
- `random.ts`: Seeded Pseudo-Random Number Generator (PRNG) using Mulberry32 for deterministic event generation and reproducible save states.
- `types.ts`: Universal interfaces, system state types, event definitions, and command actions.

### 2. `src/systems/`
- `ReactorSystem.ts`: Power generation, heat output, core stress, fuel/efficiency degradation, emergency shutdown logic.
- `LifeSupportSystem.ts`: Oxygen production, oxygen consumption rate, O2 reserves, power reliance, compartment O2 distribution.
- `ThermalSystem.ts`: Heat generation accumulation from active modules, coolant pump allocation, radiators, overheating degradation.
- `HullSystem.ts`: Structural integrity, breach detection, atmospheric leakage, emergency bulkhead compartment isolation.
- `PowerGrid.ts`: Generation vs demand, priority-based load shedding, brownout handling, power distribution to 8 systems.
- `BatterySystem.ts`: Power storage, charge/discharge rates, emergency backup reserves, brownout buffering.
- `RepairManager.ts`: Drone queue management, drone repair dispatch, drone repair duration, maintenance priority.
- `CommunicationsSystem.ts`: Signal reception quality, interference clearing, decoding progress calculation, story triggers.

### 3. `src/events/` & `src/narrative/`
- `EventDirector.ts`: Evaluates conditions every tick, triggers incidents based on station state and PRNG seed, tracks active emergencies.
- `NarrativeDirector.ts`: Tracks Act I (Awakening), Act II (Interference), Act III (Last Transmission), mission objectives, and ending triggers.

### 4. `src/rendering/` & `src/ui/`
- `StationRenderer.ts`: Canvas 2D renderer for station schematic layout, compartment statuses, power flow animations, thermal overlays, hull breach warnings, and selection highlights.
- `UIController.ts`: DOM manager binding game state updates to the Top Bar, Left Navigation, Central Schematic, Right Diagnostics, and Bottom Operations Bar.

### 5. `src/audio/` & `src/persistence/`
- `AudioManager.ts`: Dynamic Web Audio API synthesizer generating station ambient hums, warning sirens, UI clicks, and signal interference sounds.
- `SaveManager.ts`: Versioned serialization to `localStorage`, seed preservation, auto-save, manual save, and corrupted save validation.
