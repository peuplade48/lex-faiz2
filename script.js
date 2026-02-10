const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // URL yapısında 'models/' ön ekini manuel ekleyerek v1beta üzerinden çağırıyoruz
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `GÖREV: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3 adresindeki resmi metni analiz et.

                TALİMATLAR:
                1. Sayfa içeriğindeki 51. maddeyi ve bu maddenin güncelliğini belirleyen 'Değişikliklerin İşlendiği Liste' kısmını oku.
                2. Kasım 2025 tarihinde yürürlüğe giren en güncel gecikme zammı oranını tespit et.
                3. Bu oranın resmi dayanağını (Cumhurbaşkanı Karar sayısı ve tarihi) sayfadan bul ve raporla.
                4. Sakın geçmişteki uydurma verileri (%4,5 veya %60 gibi) kullanma. Sayfada ne görüyorsan onu yaz.
                5. Bulduğun oranı 2026 yılı başındaki ekonomik hedefler (enflasyonla mücadele, likidite) çerçevesinde KOPYA ÇEKMEDEN özgün bir dille yorumla.

                YALNIZCA JSON FORMATINDA YANIT VER:
                {
                  "tespit_edilen_oran": "...",
                  "hukuki_dayanak": "...",
                  "analiz_metodu": "mevzuat.gov.tr HTML Analizi",
                  "bagimsiz_ekonomik_yorum": "..."
                }`
            }]
        }],
        generationConfig: {
            temperature: 0.1
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();

        if (data.error) {
            console.error("API HATASI:", data.error.message);
            // Eğer hala 404 verirse v1 denenebilir
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("Analiz başarılı. report.json oluşturuldu.");
                console.log(jsonMatch[0]);
            }
        } else {
            console.log("Yanıt alınamadı:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
