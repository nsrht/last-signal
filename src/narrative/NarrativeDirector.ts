import { GameState } from '../simulation/GameState';

export interface Objective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export class NarrativeDirector {
  public objectives: Objective[] = [];
  public climaxChoiceUnlocked: boolean = false;

  constructor() {
    this.initAct1Objectives();
  }

  private initAct1Objectives(): void {
    this.objectives = [
      {
        id: 'obj-act1-hull',
        title: 'Gövde Sızıntısını Mühürle',
        description: 'Onarım Dronunu gövde koridoruna göndererek basınç sızıntısını kapatın.',
        completed: false,
      },
      {
        id: 'obj-act1-o2',
        title: 'Oksijen Seviyesini Stabilize Et',
        description: 'Oksijen rezervini %80 üzerine çıkarın.',
        completed: false,
      },
    ];
  }

  public tick(state: GameState): void {
    if (state.ending !== 'NONE') return;

    if (state.currentAct === 'ACT_1') {
      this.evaluateAct1(state);
    } else if (state.currentAct === 'ACT_2') {
      this.evaluateAct2(state);
    } else if (state.currentAct === 'ACT_3') {
      this.evaluateAct3(state);
    }
  }

  private evaluateAct1(state: GameState): void {
    const hullBreached = state.modules.some(m => m.isBreached);

    if (!hullBreached) {
      const obj1 = this.objectives.find(o => o.id === 'obj-act1-hull');
      if (obj1) obj1.completed = true;
    }

    if (state.lifeSupport.o2Level >= 80.0) {
      const obj2 = this.objectives.find(o => o.id === 'obj-act1-o2');
      if (obj2) obj2.completed = true;
    }

    // Transition to Act II
    if (!hullBreached && state.lifeSupport.o2Level >= 80.0 && state.simTimeSec >= 30) {
      state.currentAct = 'ACT_2';
      state.addLog('>>> BÖLÜM II BAŞLADI: PARAZİT. Bilinmeyen bir sinyal frekansı istasyon telemetry sistemlerini etkiliyor.');

      this.objectives = [
        {
          id: 'obj-act2-signal',
          title: 'Sinyal Frekansını Yakala',
          description: 'Haberleşme panosundan frekansı 1420.4 MHz seviyesine hizalayın ve %50 çözümlemeye ulaşın.',
          completed: false,
        },
      ];
    }
  }

  private evaluateAct2(state: GameState): void {
    if (state.comms.decodingProgress >= 50.0) {
      const obj = this.objectives.find(o => o.id === 'obj-act2-signal');
      if (obj) obj.completed = true;

      state.currentAct = 'ACT_3';
      state.addLog('>>> BÖLÜM III BAŞLADI: SON SİNYAL. Anomali çözümleniyor, nihai karar anı yaklaşıyor.');

      this.objectives = [
        {
          id: 'obj-act3-decode',
          title: 'Sinyali %100 Çözümle',
          description: 'Bilinmeyen sinyalin tüm veri paketlerini tamamlayın.',
          completed: false,
        },
      ];
    }
  }

  private evaluateAct3(state: GameState): void {
    if (state.comms.decodingProgress >= 100.0) {
      const obj = this.objectives.find(o => o.id === 'obj-act3-decode');
      if (obj) obj.completed = true;

      if (!this.climaxChoiceUnlocked) {
        this.climaxChoiceUnlocked = true;
        state.addLog('>>> SİNYAL %100 ÇÖZÜMLENDİ! Komuta Konsolunda nihai karar seçeneği açıldı.');
      }
    }
  }

  public chooseEnding(state: GameState, choice: 'RESCUE' | 'SACRIFICE'): void {
    if (!this.climaxChoiceUnlocked) return;

    if (choice === 'RESCUE') {
      if (state.hull.integrity >= 50 && state.comms.signalQuality > 30) {
        state.triggerEnding('RESCUE', 'Dünya ile iletişim kuruldu. Kurtarma mekiki Erebus-7 yolunda!');
      } else {
        state.triggerEnding('CATASTROPHE', 'Gövde veya haberleşme yetersizliği nedeniyle kurtarma sinyali iletilemedi!');
      }
    } else if (choice === 'SACRIFICE') {
      state.triggerEnding('SACRIFICE', 'Sinyal derin uzay matrisine aktarıldı. Erebus-7 insanlığın ötesindeki bilimsel keşfe kurban edildi.');
    }
  }
}
