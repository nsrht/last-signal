import { GameState } from '../simulation/GameState';

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  targetSelector?: string;
  isComplete: (state: GameState) => boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: '1/8: Erebus-7 İstasyonuna Hoş Geldiniz',
    description: 'Dünya ile iletişim kesildi. İstasyon reaktörü dengesiz ve basınç sızıntısı var. Haritada "Gövde Ana Basınç Koridoru" modülüne tıklayarak inceleyin.',
    targetSelector: '#station-canvas',
    isComplete: (state) => state.simTimeSec >= 300.0,
  },
  {
    id: 2,
    title: '2/8: Hasarlı Modülü İnceleme',
    description: 'Haritada "Gövde Ana Basınç Koridoru" modülü seçildi. Alt operasyon panelinde beliren "⚠️ Sızıntıyı Mühürle" butonuna tıklayarak Onarım Dronunu görevlendirin.',
    targetSelector: '#btn-dispatch-seal',
    isComplete: (state) => state.repairManager.drones.some(d => d.status === 'REPAIRING' || !state.modules.find(m => m.id === 'mod-hull')?.isBreached),
  },
  {
    id: 3,
    title: '3/8: Onarım Sürecini İzleme',
    description: 'Onarım Dronu görevlendirildi! Dron hangardan çıkış yaptı ve gövde sızıntısını mühürlüyor. Sızıntı tamamen kapanana kadar bekleyin.',
    targetSelector: '.right-info-panel',
    isComplete: (state) => !state.modules.find(m => m.id === 'mod-hull')?.isBreached,
  },
  {
    id: 4,
    title: '4/8: Oksijen ve Basınç Kontrolü',
    description: 'Gövde sızıntısı kapatıldı! Şimdi sol menüden "🌱 Yaşam Desteği" sekmesine geçerek oksijen sentezlenme hızını kontrol edin.',
    targetSelector: 'button[data-tab="lifesupport"]',
    isComplete: (state) => state.lifeSupport.o2Level >= 80.0,
  },
  {
    id: 5,
    title: '5/8: Güç Dağıtımı ve Reaktör',
    description: 'Reaktör güç üretimi istasyon sistemlerini besliyor. Sol menüden "☢️ Reaktör" sekmesine tıklayın.',
    targetSelector: 'button[data-tab="reactor"]',
    isComplete: (state) => state.reactor.throttle >= 50,
  },
  {
    id: 6,
    title: '6/8: Sinyal Frekansı Ayarı',
    description: 'Bilinmeyen anomali sinyali istasyon telsizlerini etkiliyor. Sol menüden "📻 Haberleşme" sekmesine tıklayın ve frekansı 1420.4 MHz seviyesine kilitleyin.',
    targetSelector: 'button[data-tab="comms"]',
    isComplete: (state) => Math.abs(state.comms.activeFrequencyMhz - 1420.4) < 0.2,
  },
  {
    id: 7,
    title: '7/8: Acil Durum & Uyarı Paneli',
    description: 'Sağ paneldeki "🎯 Aktif Görevler" listesini takip ederek istasyon ikazlarını ve kritik arızaları anında müdahale ile çözebilirsiniz.',
    targetSelector: '.right-info-panel',
    isComplete: (state) => state.simTimeSec >= 600,
  },
  {
    id: 8,
    title: '8/8: Temel Onarım Tamamlandı!',
    description: 'Tebrikler! İlk kurtarma adımlarını başardınız. İstasyonu hayatta tutmak, sinyali çözmek ve Bölüm II\'ye geçmek artık sizin elinizde!',
    isComplete: () => true,
  },
];

export class TutorialManager {
  public currentStepIndex: number = 0;
  public isActive: boolean = true;
  public isCompleted: boolean = false;

  public tick(state: GameState): void {
    if (!this.isActive || this.isCompleted) return;

    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (step && step.isComplete(state)) {
      this.currentStepIndex++;
      if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
        this.isCompleted = true;
        this.isActive = false;
        state.addLog('>>> ETKİLEŞİMLİ EĞİTİM TAMAMLANDI!');
      }
    }
  }

  public skip(): void {
    this.isActive = false;
    this.isCompleted = true;
  }

  public restart(): void {
    this.currentStepIndex = 0;
    this.isActive = true;
    this.isCompleted = false;
  }

  public getCurrentStep(): TutorialStep | null {
    if (!this.isActive || this.isCompleted) return null;
    return TUTORIAL_STEPS[this.currentStepIndex] || null;
  }

  public serialize() {
    return {
      currentStepIndex: this.currentStepIndex,
      isActive: this.isActive,
      isCompleted: this.isCompleted,
    };
  }

  public deserialize(data: any): void {
    if (!data) return;
    this.currentStepIndex = data.currentStepIndex ?? 0;
    this.isActive = data.isActive ?? true;
    this.isCompleted = data.isCompleted ?? false;
  }
}
