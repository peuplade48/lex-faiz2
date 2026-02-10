const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En stabil v1beta endpoint'i (HTML erişimi için)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `KAYNAK URL: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3

                GÖREV:
                1. Yukarıdaki HTML sayfasının içeriğini tara. Özellikle 51. madde metnini ve bu maddenin altındaki 'ek listeler' veya 'değişiklik fihristi' tablolarını incele.
                2. 2025 yılı sonu itibarıyla (özellikle Kasım 2025) gecikme zammı oranında yapılan değişikliği tespit et.
                3. Tespit ettiğin oranı, Resmi Gazete tarihini ve Cumhurbaşkanı Karar numarasını bul.
                4. Analizini yaparken sakın geçmişteki uydurma verileri (%4,5, %60 vb.) kullanma. Sadece şu anki HTML sayfasında ne yazıyorsa onu raporla.
                
                EKONOMİK ANALİZ (KOPYA ÇEKMEDEN):
                Bulduğun bu oran neden 2026 başında bu seviyededir? Enflasyon ve piyasa faizleriyle bağ kurarak tamamen kendi yorumunu yap.

                YANIT FORMATI (SADECE JSON):
                {
                  "kaynaktan_gelen_oran": "...",
                  "dayanak_hukuki_metin": "...",
                  "analiz_yontemi": "HTML DOM/Metin Analizi",
                  "bagimsiz_ekonomik_yorum": "..."
                }`
            }]
        }],
        generationConfig: {
            temperature: 0 // Tahmin yürütmeyi engeller, sadece veriye odaklanır.
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("HTML Analizi Tamamlandı. Rapor oluşturuldu.");
                console.log("Bulunan Veri:", JSON.parse(jsonMatch[0]).kaynaktan_gelen_oran);
            }
        } else {
            console.error("Model veriye ulaşamadı veya hata verdi:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Sistem Hatası:", err.message);
    }
}
run();
