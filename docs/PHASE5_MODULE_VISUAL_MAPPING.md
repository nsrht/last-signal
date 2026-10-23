# LAST SIGNAL — Faz 5: Modül Görsel Eşleme ve Prosedürel Geometri Şartnamesi

## 1. Genel Tasarım İlkeleri
IXION estetiğinden esinlenen endüstriyel, koyu sinematik sci-fi atmosferini yansıtmak amacıyla harici görseller (png/jpg) yerine Three.js temel geometrileri (`BoxGeometry`, `CylinderGeometry`, `TorusGeometry`) ile oluşturulmuş modüler prosedürel bloklar kullanılacaktır.

---

## 2. 8 Temel Modülün 3D Prosedürel Geometri Tanımları

| Modül ID | Modül Adı | Temel Geometri Biçimi | Prosedürel Detaylar & Parçalar | Normal Durum Rengi | Hasar / Sızıntı Efekti |
|---|---|---|---|---|---|
| `mod-reactor` | Ana Füzyon Reaktörü | Dikey Silindir + Torus Çekirdek | Pulsatif akkor halkalar, soğutma kuleleri | Koyu Titanyum / Cyan Parıltı | Kırmızı Stres Pulsasyonu & Isı Buharı |
| `mod-power` | Güç Dağıtım Deposu | Basık Prizmatik Blok | Şalt panoları, yüksek gerilim iletken kanalları | Koyu Kömür / Amber Göstergeler | Kıvılcım Partikülleri, Voltaj Dalgalanması |
| `mod-battery` | Batarya Hücre Kompleksi | Izgara Modüler Hücre Grubu | LED şarj seviye sütunları | Mavi-Yeşil Hücreler | Yanıp Sönen Amber Düşük Şarj Uyarısı |
| `mod-lifesupport` | Oksijen Sintetizör Modülü | İkiz Gaz Tankı Prizması | Havalandırma fanları, gaz kanalları | Muted Yeşil / Cyan | Gaz Sızıntısı Duman Efekti |
| `mod-thermal` | Isıl Soğutucu Blok | Petek Radyatör Paneli | Soğutma boruları, fan kanatçıkları | Koyu Gümüş / Mavi Işık | Kırmızı Aşırı Isınma Işıması |
| `mod-hull` | Gövde Ana Basınç Koridoru | Zırhlı Tünel Segmenti | Hidrolik izolasyon kapakları | Çelik Zırh Grisi | Kırmızı Acil Siren & Basınç Sızıntısı |
| `mod-drones` | Onarım Hangarı | Açık Kubbe Platform | Dron iniş pedi, mekanik kol | Metalik Gri / Turuncu Telif | Çalışan Dron İzo-Çizgisi |
| `mod-comms` | Haberleşme & Anten Dizisi | Döner Parabolik Çanak | Telsiz çanağı, yüksek frekans vericisi | Alüminyum Beyazı / Cyan | Sinyal Parazit Halesi |

---

## 3. Dinamik Görsel Durum İndikatörleri
1. **Sağlık Bütünlüğü (Health %):** Modül üzerindeki 3D durum çubuğu ve malzeme yıpranma (roughness) katsayısı.
2. **Gövde Sızıntısı (Breach):** Kırmızı renkte dairesel uyarı halesi ve nokta partikül emisyonu.
3. **İzolasyon Kapağı (Isolation):** Modül çevresinde kapanan prosedürel hidrolik kapak blokları.
4. **Enerji Akış Hatları:** Modüller arası koridorlarda Three.js `LineDashedMaterial` ile akan enerji ışık tanecikleri.
