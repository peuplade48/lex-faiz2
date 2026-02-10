const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // v1beta yerine v1 kullanarak ve 'models/' ön ekini ekleyerek en stabil yolu deniyoruz
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `GÖREV: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3 adresindeki resmi metni analiz et.

                TALİMATLAR:
                1. Sayfa içeriğindeki 51. maddeyi ve bu maddenin güncelliğini belirleyen 'Değişikliklerin İşlendiği Liste' (en alttaki tablo) kısmını tara.
                2. Yürürlükte olan en güncel oranı ve bu oranın resmi dayanağını (Karar no ve tarih) tespit et.
                3. Tespit ettiğin rakamı ve dayanağını yazdıktan sonra, neden bu seviyenin seçildiğini 2026 yılı başındaki ekonomik konjonktür çerçevesinde KOPYA ÇEKMEDEN tamamen kendi mantığınla analiz et.
                4. Eğer veriye ulaşamıyorsan uydurma veri üretme, dürüstçe 'Veriye ulaşılamadı' yaz.

                YALNIZCA JSON FORMATINDA YANIT VER:
                {
                  "tespit_edilen_oran": "...",
                  "resmi_dayanak": "...",
                  "ozgun_ekonomik_analiz": "..."
                }`
            }]
        }],
        generationConfig: {
            temperature: 0 // Tahmin yürütmeyi kapatır, sadece okumaya zorlar.
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
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("Bağımsız analiz tamamlandı. report.json oluşturuldu.");
                console.log(jsonMatch[0]);
            }
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
