# LAST SIGNAL — Game Design Document

## 1. Game Vision & Narrative Premise
Setting: Year 2189, Orbital Research Station **Erebus-7**.
Player Role: Station Commander / Systems Operations Engineer.

Communications with Earth have abruptly ceased. The station's main fusion reactor is unstable, life support systems are malfunctioning, and a mysterious anomalous signal is corrupting internal telemetry. The player must maintain life support, manage critical power trade-offs, repair damaged modules, decode the mysterious signal, and navigate station events across 3 Acts to decide the station's final fate.

## 2. Core Gameplay Mechanics & Interconnected Systems
The game features 8 tightly interconnected engineering systems:

1. **Reaktör (Reactor)**
   - *Throttle (0% - 150%)*: High power output generates proportional heat and core stress.
   - *Core Stress (>80%)*: Causes efficiency loss and risk of meltdown or emergency SCRAM.
   - *Emergency SCRAM*: Immediately halts reactor power, shifting load to Battery System.

2. **Power Grid & Güç Dağıtımı (Power Distribution)**
   - *Total Generation*: Reactor output + Battery Discharge.
   - *Load Shedding*: Priority levels (1 = Critical: Life Support, Hull; 2 = Thermal, Batteries; 3 = Comms, Drones).
   - *Brownout*: Systems receive partial power, reducing operational efficiency.

3. **Yaşam Desteği (Life Support)**
   - *Oxygen Reserves (0% - 100%)*: Oxygen is consumed by station crew/life pods (1.0 O2/s baseline).
   - *O2 Generators*: Require electricity to synthesize O2. If power drops, reserves deplete.
   - *Depletion Warning (<20%)*: Triggers emergency medical alert window before fatal asphyxiation.

4. **Isıl Kontrol (Thermal Management)**
   - *Heat Accumulation*: All operating modules produce heat (Reactor produces the most).
   - *Coolant Pumps & Radiators*: Consume power to radiate heat into space.
   - *Overheating (>85°C)*: Causes thermal degradation in adjacent modules and drone damage.

5. **Gövde Bütünlüğü (Hull Integrity)**
   - *Structural Integrity (0% - 100%)*: Micrometeorites, hull stress, or explosions cause breaches.
   - *Atmospheric Leakage*: Breaches accelerate oxygen loss.
   - *Compartment Isolation*: Bulkheads can be sealed to halt oxygen leaks at the expense of disabling access to that module.

6. **Batarya Sistemi (Battery System)**
   - *Reserve Storage (0 - 1000 kWh)*: Buffers power shortages during SCRAM or high consumption.
   - *Charge/Discharge Efficiency*: High discharge rate causes battery heating.

7. **Onarım Dronları (Repair Drones)**
   - *Drone Fleet*: 3 autonomous drones (adjustable by difficulty).
   - *Dispatch*: Drones consume power and take real simulation time to repair modules, repair leaks, or clear thermal jams.

8. **Haberleşme (Communications & Signal Decoder)**
   - *Signal Decoder*: Consumes power to tune into, clear interference, and decode the mysterious transmission.
   - *Decoding Progress (0% - 100%)*: Drives Act II and Act III progression, revealing crucial narrative lore choices.

## 3. Dynamic Narrative Acts & Multiple Endings
- **Act I: AWAKENING (Uyanış)**: Station reboot, emergency repairs, basic life support restoration.
- **Act II: INTERFERENCE (Parazit)**: Anomalous signal frequency shifts, escalating mechanical failures, power trade-offs, narrative choice logs.
- **Act III: LAST TRANSMISSION (Son Sinyal)**: Final signal decoding, critical station condition evaluation, determining the ultimate fate.

### Endings:
- **Ending 1 (Kurtarma Sinyali)**: Require >70% Hull Integrity, functional Comms, and decoded signal. Emergency distress beacon sent to Earth rescue vessel.
- **Ending 2 (Sinyal Soruşturması & Fedakarlık)**: Signal fully decoded and routed to deep-space arrays; station abandoned or sacrificed for alien signal resonance.
- **Ending 3 (Katastrofik Çöküş)**: Total system collapse (0% Hull, 0% O2, or Reactor Meltdown).

## 4. UI/UX Design Token Specifications
- **Background**: Deep Space Charcoal (`#0a0d12`, `#121720`)
- **Operational Status**: Desaturated Cyan (`#00e5ff`, `#00a8c6`)
- **Warnings**: Solar Amber (`#ffb300`, `#ff8f00`)
- **Critical Alerts**: Emergency Red (`#ff3344`, `#d50000`)
- **Nominal / Stable**: Muted Emerald (`#00e676`, `#00c853`)
