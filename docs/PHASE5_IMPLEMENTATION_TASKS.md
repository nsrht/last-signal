# LAST SIGNAL — Faz 5: Somut Uygulama Görevleri ve Kabul Kriterleri

## 1. Uygulama Aşamaları (Sequential Stages)

### Aşama 1: Bağımlılıkların ve WebGL Altyapısının Hazırlanması
- **Görev 1.1:** `three` ve `@types/three` paketlerinin projeye eklenmesi.
- **Görev 1.2:** `src/rendering/3d/` dizin yapısının kurulması.
- **Kabul Kriterleri:** Proje `npm run build` komutunu hatasız tamamlar, Vitest birim testleri geçmeye devam eder.

### Aşama 2: Salt-Okunur Görsel Durum Adaptörü (`StationVisualAdapter`)
- **Görev 2.1:** `src/rendering/3d/StationVisualAdapter.ts` dosyasının oluşturulması.
- **Görev 2.2:** `GameState` verilerinden yumuşatılmış `StationVisualSnapshot` nesnesi türetilmesi.
- **Kabul Kriterleri:** Adaptör birim testleri (`tests/unit/visual_adapter.test.ts`) simülasyon durumunun tam ve doğru dönüştürüldüğünü doğrular.

### Aşama 3: 3D Sahne, İzometrik Kamera ve Işık Matrisi
- **Görev 3.1:** `src/rendering/3d/Station3DRenderer.ts` ve `src/rendering/3d/CameraController.ts` oluşturulması.
- **Görev 3.2:** Orthographic camera, ortam/ana ışık ve acil durum ışıklarının kurulması.
- **Kabul Kriterleri:** Tuvalde boş 3D izometrik uzay ve koyu sci-fi atmosferik ışıklandırma görünür.

### Aşama 4: Prosedürel Modül Blokları ve Raycaster Etkileşimi
- **Görev 4.1:** 8 temel modül için prosedürel 3D geometrilerin (`BoxGeometry`, `CylinderGeometry`) oluşturulması.
- **Görev 4.2:** Raycaster ile modül tıklama ve hover olaylarının `UIController`'a bağlanması.
- **Kabul Kriterleri:** Modüllere tıklandığında sol/sağ UI panelleri seçili modül bilgilerini günceller.

### Aşama 5: Efektler, Animasyonlar ve Çift Render Geçişi (2D/3D Toggle)
- **Görev 5.1:** Dron hareket hatları, reaktör parıltısı ve gaz sızıntı partiküllerinin eklenmesi.
- **Görev 5.2:** Ayarlar menüsüne "2D / 3D Render Modu" geçiş anahtarının eklenmesi.
- **Kabul Kriterleri:** Kullanıcı istediği an 2D Canvas ile 3D İzometrik görüntü arasında geçiş yapabilir.

---

## 2. Etkilenen ve Yeni Eklenecek Dosyalar Listesi

### Yeni Eklenecek Dosyalar:
- `src/rendering/3d/StationVisualAdapter.ts`
- `src/rendering/3d/Station3DRenderer.ts`
- `src/rendering/3d/CameraController.ts`
- `src/rendering/3d/ModuleRegistry3D.ts`
- `src/rendering/3d/EffectsSystem3D.ts`
- `tests/unit/visual_adapter.test.ts`

### Düzenlenecek Mevcut Dosyalar:
- `package.json` (three.js bağımlılığı eklenecek)
- `src/main.ts` (Render başlatma ve 2D/3D mod seçimi)
- `src/ui/UIController.ts` (3D etkileşim olaylarının dinlenmesi)
