export class ManualModal {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    this.container.style.display = 'flex';
    this.render();
  }

  public hide(): void {
    this.container.style.display = 'none';
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="modal-overlay" id="manual-modal">
        <div class="modal-card manual-card">
          <div class="modal-header">
            <h2>📖 Erebus-7 İletişim & Komuta El Kitabı</h2>
            <button class="btn btn-small" id="btn-close-manual">✕ Kapat</button>
          </div>
          <div class="manual-body">
            <section class="manual-section">
              <h3>1. Özet ve Görev Hedefi</h3>
              <p>Erebus-7 orbital araştırma istasyonunda beklenmeyen bir anomali sonrası Dünya ile iletişim koptu. Reaktör dengesizleşti ve gövde bütünlüğü risk altında. Amacınız istasyonu hayatta tutmak, arızaları gidermek, bilinmeyen sinyali çözmek ve istasyonun nihai kaderini belirlemektir.</p>
            </section>

            <section class="manual-section">
              <h3>2. İstasyon Sistemleri ve Mühendislik</h3>
              <ul>
                <li><strong>☢️ Ana Füzyon Reaktörü:</strong> İstasyonun tüm güç ihtiyacını karşılar. Güç seviyesi (Throttle) arttıkça güç üretimi artar fakat ısı ve çekirdek stresi yükselir. Aşırı ısınma erimeye (Meltdown) yol açar. SCRAM butonu acil kapatma sağlar.</li>
                <li><strong>🌱 Yaşam Desteği:</strong> Oksijen sentezler. Güç kısıntısı veya gövde sızıntısı durumunda oksijen seviyesi düşer. %0 seviyesinde mürettebat boğulma riski yaşar.</li>
                <li><strong>🔥 Isıl Kontrol:</strong> Reaktör ve modüller ısı üretir. Soğutucu pompalar bu ısıyı uzaya yayar. Aşırı ısınma modül sağlıklarını hızla düşürür.</li>
                <li><strong>🛡️ Gövde Bütünlüğü:</strong> Meteoroid veya basınç kırılmaları gövdede sızıntı açar. Hasarlı modülleri izole ederek veya Onarım Dronu göndererek sızıntıyı kapatın.</li>
                <li><strong>⚡ Güç Dağıtımı & Bataryalar:</strong> Yetersiz güç durumunda sistemler otomatik yük azaltır (Brownout). Bataryalar acil durumda yedek enerji sağlar.</li>
                <li><strong>🤖 Onarım Dronları:</strong> Hangar dronları modül sağlıklarını yeniler ve sızıntıları mühürler. Dronların çalışması için güç tahsisi şarttır.</li>
                <li><strong>📻 Haberleşme & Dekoder:</strong> Bilinmeyen anomali sinyaline doğru frekansta (1420.4 MHz) kilitlenerek sinyali çözün. Sinyal çözümlendikçe hikaye ilerler.</li>
              </ul>
            </section>

            <section class="manual-section">
              <h3>3. Zafer ve Yenilgi Koşulları</h3>
              <p><strong>Yenilgi:</strong> Reaktör erimesi, Oksijen tükenmesi veya Gövde bütünlüğünün sıfırlanması.</p>
              <p><strong>Zafer:</strong> Sinyal %100 çözümlendiğinde sunulan nihai kararlardan birini seçerek hikayeyi tamamlamak.</p>
            </section>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-manual')?.addEventListener('click', () => {
      this.hide();
    });
  }
}
