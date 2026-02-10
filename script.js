const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En stabil endpoint ve model isimlendirmesi
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `GÖREV: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf adresindeki PDF belgesini analiz et.
                
                TALİMATLAR:
                1. 51. maddeye ilişkin olarak PDF'in en altındaki DİPNOTLAR kısmını ve kronolojik tabloyu tara.
                2. Bu tabloda yer alan en güncel (en son tarihli) gecikme zammı oranını tespit et.
                3. Tespit ettiğin rakamın resmi dayanağını (Cumhurbaşkanı Karar numarası ve tarihi) belirt.
                4. Bu oran üzerinden, 2026 yılı başındaki ekonomik konjonktürü ve neden bu seviyenin tercih edildiğini tamamen kendi mantığınla analiz et.
                
                ÖNEMLİ: Daha önce uydurduğun yıllık %60 veya 8214 sayılı karar gibi verilere itibar etme. Sadece PDF'te yazanı oku. Bulamıyorsan uydurma, 'veriye ulaşamadım' yaz.

                Yanıtı sadece JSON formatında ver:
                {
                  "tespit_edilen_oran": "...",
                  "resmi_dayanak": "...",
                  "ozgun_analiz": "..."
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
                console.log("Rapor oluşturuldu. Bakalım kendi başına ne buldu?");
                console.log(jsonMatch[0]);
            }
        } else {
            console.log("Model yanıt vermedi.");
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
