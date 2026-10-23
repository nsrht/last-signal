# LAST SIGNAL — Faz 5: Göç Riskleri, Performans ve Uyumluluk Stratejisi

## 1. Risk Analizi ve Azaltma Planı (Risk Matrix)

| Risk Tanımı | Etki Derecesi | Olasılık | Azaltma (Mitigation) Stratejisi |
|---|---|---|---|
| **WebGL Desteği Olmayan / Düşük Donanımlı Cihazlar:** Mobil veya eski tarayıcılarda Three.js kasmaları veya çökmeleri. | Yüksek | Orta | WebGL varlık denetimi (`WebGL.isWebGLAvailable()`). Desteklenmiyorsa otomatik olarak 2D Canvas (`StationRenderer`) moduna düşme (fallback). |
| **Simülasyon Çekirdeğinin Render Döngüsüne Bağlanması:** FPS düşüşlerinin simülasyon zamanını yavaşlatması. | Yüksek | Düşük | Simülasyon zamanlayıcısı (`SimulationEngine`) ve Three.js render döngüsü (`requestAnimationFrame`) tamamen ayrık çalışır. |
| **Kayıt Dosyası Uyumsuzluğu:** 3D görsel verilerin kayıt dosyasına sızarak eski kayıtları bozması. | Orta | Düşük | Kayıt formatı (`SaveManager`) yalnızca `GameState` verilerini tutar. Render katmanının hiçbir durumu kaydedilmez. |
| **Yüksek Bellek/Sızıntı (Memory Leak):** Sahne yeniden yüklendiğinde Geometri ve Material nesnelerinin dispose edilmemesi. | Orta | Orta | `Station3DRenderer.dispose()` metodu oluşturularak tüm geometri, materyal ve kaplamalar açıkça bellekten temizlenecektir. |

---

## 2. Mobil ve Performans İyileştirmeleri
1. **Gölge Haritası Optimizasyonu:** Mobil cihazlarda gölge haritaları (`castShadow / receiveShadow`) devre dışı bırakılabilir veya 512x512 çözünürlüğe sabitlenebilir.
2. **Kare Hızı Sınırlama (Target FPS Limit):** Pil tasarrufu için mobil ekranlarda render hızı 30 FPS ile sınırlandırılabilir.
3. **Geometri Yeniden Kullanımı (Instancing/Reuse):** Tekrarlayan boru hatları, bağlantı vidaları ve küçük detaylar tek bir `BufferGeometry` nesnesi üzerinden çizilecektir.

---

## 3. Geri Dönüş ve Çift Render Stratejisi (Dual-Renderer Switch)
Kullanıcı Ayarlar paneline (`Settings`) "Görsel Mod: 3D İzometrik / 2D Klasik" anahtarı eklenecektir. Bu sayede oyuncular istedikleri an performans veya görsel tercih doğrultusunda 2D Canvas ile 3D WebGL arasında geçiş yapabilecektir.
