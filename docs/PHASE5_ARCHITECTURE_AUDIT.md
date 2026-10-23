# LAST SIGNAL — Faz 5: 3D İzometrik Dönüşüm Mimari Denetim Raporu

## 1. Giriş ve Amaç
Bu doküman, **LAST SIGNAL** (Erebus-7 Uzay İstasyonu Hayatta Kalma ve Yönetim Simülasyonu) projesinin mevcut 2D Canvas tabanlı görselleştirme mimarisinin, IXION atmosferinden esinlenen zengin 3D izometrik bir ortama dönüştürülmesi için gerçekleştirilen kapsamlı mimari denetim sonuçlarını içerir.

---

## 2. Mevcut Mimari Yapısı ve Dosya İncelemesi

### A. Simülasyon Çekirdeği ve Güncelleme Döngüsü
- **`src/core/engine.ts` (`SimulationEngine`):** Sabit zaman adımlı (fixed-timestep, `dt = 0.1` saniye) deterministik simülasyon döngüsünü yönetir. `requestAnimationFrame` veya `setInterval` bağımsız `tick` mekanizmasına sahiptir. `0x` (duraklatılmış), `1x`, `2x`, `4x` simülasyon hızlarını destekler.
- **`src/core/random.ts` (`SeededRandom`):** Mulberry32 PRNG (Pseudo-Random Number Generator) algoritması ile tohumlu (seeded) rastgele sayılar üretir. Simülasyon kararlılığını garanti eder.
- **`src/simulation/GameState.ts` (`GameState`):** Bütün istasyon sistemlerinin, modüllerinin, olaylarının ve hikaye durumlarının birincil doğruluk kaynağıdır (Single Source of Truth).

### B. İstasyon Sistemleri (8 Temel Sistem)
1. **`ReactorSystem.ts`:** Güç üretimi, reaktör stresi, aşınma/degradasyon ve SCRAM/erime mantığı.
2. **`BatterySystem.ts`:** kWh şarj/deşarj kapasitesi ve acil durum tampon depolaması.
3. **`PowerGrid.ts`:** Dinamik güç talebi toplama, 1-3 öncelik sıralaması ve yük atma (load-shedding).
4. **`LifeSupportSystem.ts`:** Oksijen üretimi, tüketim hızları ve asfiksi zamanlayıcısı.
5. **`ThermalSystem.ts`:** İstasyon genel sıcaklığı, soğutucu pompa yükü ve aşırı ısınma cezaları.
6. **`HullSystem.ts`:** Gövde bütünlüğü, basınç sızıntı hızları ve modül izolasyon kapakları.
7. **`RepairManager.ts`:** Dron filosu, görev kuyruğu, modül onarımı ve sızıntı mühürleme.
8. **`CommunicationsSystem.ts`:** Frekans hizalama, sinyal paraziti, deşifre ilerlemesi ve 5 sinyal veri paketi ($\alpha, \beta, \gamma, \delta, \epsilon$).

### C. Mevcut 2D Görselleştirme ve Arayüz
- **`src/rendering/StationRenderer.ts`:** 2D Canvas bağlamı (`CanvasRenderingContext2D`) kullanarak dikdörtgen modül blokları, boru hatları, dron iz hatları ve sağlık çubuklarını çizer.
- **`src/rendering/SignalScopeRenderer.ts`:** Frekans dalga boyu osiloskopunu çizer.
- **`src/ui/UIController.ts`:** HTML DOM bileşenlerini ve yan panelleri yönetir. `StationRenderer`'dan gelen tıklama/seçim olaylarını yakalar.

### D. Kayıt/Yükleme ve Kalıcılık
- **`src/persistence/SaveManager.ts`:** Sürüm denetimli `localStorage` serialization/deserialization işlemlerini yürütür. PRNG tohumunu ve simülasyon zamanını eksiksiz korur.

### E. Bağımlılıklar ve Yapılandırma
- **`package.json`:** TypeScript, Vite, Vitest, Playwright. (React, Vue, Three.js veya harici oyun motoru barındırmaz).
- **`vite.config.ts`:** GitHub Pages uyumluluğu için `base: process.env.NODE_ENV === 'production' ? '/last-signal/' : './'` tanımına sahiptir.
- **`.github/workflows/deploy.yml`:** Automated GitHub Pages CI/CD workflow.

---

## 3. Temel Mimari Sınırlar ve Kurallar
1. **Doğruluk Kaynağı Ayrımı:** 3D görselleştirici (Three.js) hiçbir koşulda simülasyon durumunu değiştiremez veya kendi içinde oyun mantığı üretemez. Yalnızca `GameState`'i salt-okunur olarak tüketir.
2. **Determinizm ve Tohum Koruması:** 3D sahnede oluşacak efektler (partiküller, ışık dalgalanmaları, kamera sallantısı) deterministik simülasyon PRNG'sini (`state.rng`) etkilememelidir; gerekirse ayrı bir UI visual PRNG kullanılmalıdır.
3. **Canvas Geriye Dönük Uyumluluk:** Mevcut 2D `StationRenderer` kod tabanından kaldırılmayacak; performans veya uyumluluk durumunda dinamik bir render anahtarı (2D/3D Toggle) ile desteklenecektir.
