import { SystemId } from '../core/types';

export interface EventDefinition {
  id: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  systemId?: SystemId;
  minAct: 'ACT_1' | 'ACT_2' | 'ACT_3';
  chancePerTick: number;
  triggerCondition?: (state: any) => boolean;
  effect: (state: any) => void;
  actionText?: string;
}

export const EVENT_DEFINITIONS: EventDefinition[] = [
  {
    id: 'evt-micro-meteor',
    title: 'Mikro-Göktaşı Çarpması',
    description: 'Gövde koridoruna yüksek hızlı mikro-göktaşı isabet etti! Basınç sızıntısı başladı.',
    severity: 'CRITICAL',
    systemId: SystemId.Hull,
    minAct: 'ACT_1',
    chancePerTick: 0.002,
    effect: (state) => {
      const hullMod = state.modules.find((m: any) => m.id === 'mod-hull');
      if (hullMod) {
        hullMod.isBreached = true;
        hullMod.health = Math.max(10, hullMod.health - 25);
      }
    },
    actionText: 'Onarım Dronu Gönder',
  },
  {
    id: 'evt-solar-flare',
    title: 'Güneş Parlaması Paraziti',
    description: 'Şiddetli güneş paraziti radyo frekanslarını kilitledi ve haberleşme sinyalini bozdu.',
    severity: 'WARNING',
    systemId: SystemId.Communications,
    minAct: 'ACT_2',
    chancePerTick: 0.003,
    effect: (state) => {
      state.comms.interference = Math.min(100, state.comms.interference + 40);
    },
  },
  {
    id: 'evt-coolant-leak',
    title: 'Soğutucu Sıvı Tıkanıklığı',
    description: 'Radyatör hattında termal valf tıkandı. İstasyon sıcaklığı yükseliyor.',
    severity: 'WARNING',
    systemId: SystemId.Thermal,
    minAct: 'ACT_1',
    chancePerTick: 0.0025,
    effect: (state) => {
      state.thermal.temperature += 15.0;
    },
  },
  {
    id: 'evt-battery-surge',
    title: 'Batarya Hücre Aşırı Yüklenmesi',
    description: 'Güç dalgalanması batarya hücrelerinde kısa devreye yol açtı.',
    severity: 'WARNING',
    systemId: SystemId.Battery,
    minAct: 'ACT_2',
    chancePerTick: 0.002,
    effect: (state) => {
      state.battery.currentChargeKwh = Math.max(0, state.battery.currentChargeKwh - 150);
    },
  },
  {
    id: 'evt-drone-jam',
    title: 'Dron Navigasyon Arızası',
    description: 'Yüksek radyasyon 1 Nolu Onarım Dronunun sensörlerini kilitledi.',
    severity: 'WARNING',
    systemId: SystemId.Drones,
    minAct: 'ACT_2',
    chancePerTick: 0.002,
    effect: (state) => {
      const drone = state.repairManager.drones[0];
      if (drone) drone.health = Math.max(20, drone.health - 40);
    },
  },
  {
    id: 'evt-reactor-spike',
    title: 'Reaktör Çekirdek Rezonansı',
    description: 'Bilinmeyen sinyal frekansı füzyon reaktöründe harmonik dalgalanmaya neden oldu.',
    severity: 'CRITICAL',
    systemId: SystemId.Reactor,
    minAct: 'ACT_2',
    chancePerTick: 0.0015,
    effect: (state) => {
      state.reactor.coreStress = Math.min(95, state.reactor.coreStress + 30);
    },
  },
  {
    id: 'evt-o2-valve-fault',
    title: 'Oksijen Sintetizör Valf Arızası',
    description: 'Yaşam desteği O2 üretim valfi sıkıştı. Oksijen sentezi yavaşladı.',
    severity: 'CRITICAL',
    systemId: SystemId.LifeSupport,
    minAct: 'ACT_1',
    chancePerTick: 0.002,
    effect: (state) => {
      state.lifeSupport.o2Level = Math.max(10, state.lifeSupport.o2Level - 15);
    },
  },
  {
    id: 'evt-power-transformer-short',
    title: 'Trafodaki Kısa Devre',
    description: 'Ana güç dağıtım modülünde sigorta attı. Brownout yaşanıyor.',
    severity: 'WARNING',
    systemId: SystemId.Power,
    minAct: 'ACT_1',
    chancePerTick: 0.002,
    effect: (state) => {
      const pMod = state.modules.find((m: any) => m.id === 'mod-power');
      if (pMod) pMod.health = Math.max(20, pMod.health - 30);
    },
  },
  {
    id: 'evt-anomalous-pulse',
    title: 'Anormal Elektro-Manyetik Darbe',
    description: 'İstasyon dışından kaynağı belirsiz bir EMP dalgası algılandı.',
    severity: 'CRITICAL',
    systemId: SystemId.Communications,
    minAct: 'ACT_3',
    chancePerTick: 0.003,
    effect: (state) => {
      state.comms.targetFrequencyMhz = 1420.0 + (state.rng.next() * 10 - 5);
      state.comms.interference = 80;
    },
  },
  {
    id: 'evt-hull-fatigue',
    title: 'Gövde Yorgunluk Çatlağı',
    description: 'Basınç farkı nedeniyle ikincil yaşam modülünde mikroskopik çatlak oluştu.',
    severity: 'WARNING',
    systemId: SystemId.Hull,
    minAct: 'ACT_2',
    chancePerTick: 0.002,
    effect: (state) => {
      const lsMod = state.modules.find((m: any) => m.id === 'mod-lifesupport');
      if (lsMod) lsMod.health = Math.max(30, lsMod.health - 20);
    },
  },
  {
    id: 'evt-thermal-pump-stall',
    title: 'Soğutucu Pompa Duraklaması',
    description: 'Yüksek ısı nedeniyle soğutucu devridaim pompası durdu.',
    severity: 'WARNING',
    systemId: SystemId.Thermal,
    minAct: 'ACT_2',
    chancePerTick: 0.002,
    effect: (state) => {
      state.thermal.temperature += 10;
    },
  },
  {
    id: 'evt-comms-array-misalign',
    title: 'Çanak Anten Eksenden Kaydı',
    description: 'Yörünge düzeltme motorlarının sarsıntısı anten açısını bozdu.',
    severity: 'INFO',
    systemId: SystemId.Communications,
    minAct: 'ACT_1',
    chancePerTick: 0.003,
    effect: (state) => {
      state.comms.signalQuality = Math.max(10, state.comms.signalQuality - 25);
    },
  },
  {
    id: 'evt-reactor-cooling-efficiency',
    title: 'Reaktör Soğutma Kanalı Tıkanması',
    description: 'Isı birikimi reaktör soğutma borularında kireçlenmeye sebep oldu.',
    severity: 'WARNING',
    systemId: SystemId.Reactor,
    minAct: 'ACT_2',
    chancePerTick: 0.002,
    effect: (state) => {
      state.reactor.degradation = Math.min(100, state.reactor.degradation + 15);
    },
  },
  {
    id: 'evt-cryo-leak',
    title: 'Kriyojenik Sızıntı',
    description: 'Soğutucu tankında soğuk kriyojenik gaz sızıntısı tespit edildi.',
    severity: 'INFO',
    systemId: SystemId.Thermal,
    minAct: 'ACT_3',
    chancePerTick: 0.002,
    effect: (state) => {
      state.thermal.temperature = Math.max(5, state.thermal.temperature - 12);
    },
  },
  {
    id: 'evt-signal-resonance',
    title: 'Sinyal Harmonik Rezonansı',
    description: 'Bilinmeyen sinyal istasyon bilgisayarları ile harmonik uyuma girdi!',
    severity: 'INFO',
    systemId: SystemId.Communications,
    minAct: 'ACT_3',
    chancePerTick: 0.002,
    effect: (state) => {
      state.comms.decodingProgress = Math.min(100, state.comms.decodingProgress + 10);
    },
  },
];
