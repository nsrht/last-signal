# LAST SIGNAL — Simulation Balance & Engineering Documentation

## 1. Overview
This document specifies the exact math, physics formulas, and system resource rates across all difficulty presets (**Kolay**, **Normal**, **Zor**).

## 2. Resource & System Formulas

### A. Reaktör (Reactor)
- **Base Power Output ($P_{raw}$)**: $P_{raw} = \frac{\text{Throttle}}{100} \times P_{max}$
- **Core Efficiency ($E_{core}$)**:
  $$E_{core} = \max\left(0.2, 1.0 - 0.005 \times \text{Degradation} - 0.005 \times \max(0, \text{CoreStress} - \text{StressThreshold})\right)$$
- **Actual Power Generated ($P_{gen}$)**: $P_{gen} = P_{raw} \times E_{core}$
- **Heat Output ($Q_{gen}$)**: $Q_{gen} = P_{gen} \times \text{heatPerKw}$
- **Core Stress ($S_{core}$)**: If $\text{Throttle} > 100\%$, $\Delta S_{core} = (\text{Throttle} - 100) \times 0.08 \times dt$.

### B. Power Grid & Battery
- **Total Power Available**: $P_{avail} = P_{gen} + P_{battery\_discharge}$
- **Priority Priority Levels**:
  - **Level 1 (Critical)**: Yaşam Desteği (O2 Synth), Gövde Basınç Tutucular.
  - **Level 2 (Essential)**: Soğutucu Pompaları, Batarya Şarj.
  - **Level 3 (Operations)**: Haberleşme Dekoderi, Onarım Dronları.

### C. Yaşam Desteği & Gövde Sızıntısı
- **Oxygen Balance**:
  $$\Delta \text{O2} = \left(\text{O2GenPerKw} \times P_{LS} - (\text{O2Consumption} + \text{LeakRate})\right) \times dt$$
- **Leak Rate ($L_{hull}$)**: $L_{hull} = \sum \text{Breaches} \times \text{leakPerBreachPerSec} \times (1 - \text{isolationReduction})$

### D. Haberleşme (Communications & Signal Decoder)
- **Tuning Accuracy**: $\text{Accuracy} = \max(0, 100 - |f_{active} - f_{target}| \times 50)$
- **Signal Quality ($Q_{signal}$)**: $Q_{signal} = \max(0, \text{Accuracy} - \text{Interference} \times \text{InterferencePenalty})$
- **Decoding Rate**: $\Delta \text{Progress} = \text{BaseDecodeRate} \times \frac{Q_{signal}}{100} \times \text{PowerRatio} \times dt$

## 3. Difficulty Multiplier Matrix

| Parameter | Kolay (Easy) | Normal | Zor (Hard) |
|---|---|---|---|
| Reactor Heat Per kW | 0.08 | 0.12 | 0.18 |
| O2 Consumption / sec | 0.6 % | 0.8 % | 1.1 % |
| Asphyxiation Grace Window | 45 sec | 30 sec | 20 sec |
| Battery Max Capacity | 1200 kWh | 1000 kWh | 800 kWh |
| Drone Fleet Count | 4 | 3 | 2 |
| Drone Repair Speed | 4.0 /s | 2.5 /s | 1.8 /s |
