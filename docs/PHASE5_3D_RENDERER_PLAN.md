# LAST SIGNAL — Faz 5: 3D İzometrik Render Mimarisi ve Veri Akışı Planı

## 1. Mimari Katman Ayrımı
Three.js tabanlı 3D izometrik render sisteminin simülasyon mantığına müdahale etmesini önlemek amacıyla katmanlı bir mimari uygulanacaktır:

```
[ Core Simulation Engine (GameState) ]
               │ (Salt-Okunur Güncelleme)
               ▼
[ Visual State Adapter (StationVisualAdapter) ]
               │ (Sadece Görsel Veri Nesneleri)
               ▼
[ Three.js Scene Renderer (Station3DRenderer) ]
 ├── [ Isometric Camera Controller ]
 ├── [ Module Visual Registry ]
 ├── [ Lighting & Atmosphere System ]
 └── [ Particle & Shader FX ]
               │ (Raycasting / Tıklama Olayları)
               ▼
[ UI Interaction Bridge ] ──► [ UIController / CommandManager ]
```

---

## 2. Bileşen Sorumlulukları ve Arayüzler

### A. Read-Only Visual State Adapter (`StationVisualAdapter`)
Simülasyon durumundan (`GameState`) render katmanının ihtiyaç duyduğu gürültüsüz, işlenmiş ve yumuşatılmış (interpolated) görsel verileri türetir.
```typescript
export interface ModuleVisualState {
  id: string;
  name: string;
  healthPct: number;
  isBreached: boolean;
  isIsolated: boolean;
  powerRatio: number;
  heatRatio: number;
  position: { x: number; y: number; z: number };
}

export interface StationVisualSnapshot {
  simTimeSec: number;
  modules: ModuleVisualState[];
  activeDrones: Array<{ id: string; x: number; y: number; z: number; targetModuleId: string }>;
  reactorStressPct: number;
  isEmergencyLighting: boolean;
}
```

### B. Three.js Scene Renderer (`Station3DRenderer`)
Sahte/Sanal WebGL bağlamı yönetimi, sahne oluşturma, ışık matrisi ve nesne yaşam döngüsünü yönetir.
- **Orthographic Camera:** İzometrik açı için ($45^\circ$ rotasyon, $35.264^\circ$ eğim) ayarlanmış dik açılı kamera.
- **Lighting Matrix:** Endüstriyel koyu tonlu sinematik ortam ışığı, yönlü ana güneş ışığı ve acil durum kırmızısı noktasal ışıklar.

### C. UI Interaction Bridge
3D sahnede yapılan fare hareketleri (hover) ve tıklamaları 3D Raycaster ile tespit eder, seçili modül ID'sini `UIController` ve `CommandManager` yapısına iletir.
