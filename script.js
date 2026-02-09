const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En güncel ve stabil endpoint
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Tarih: 9 Şubat 2026. 
                Görevin: 6183 sayılı Kanun'un 51. maddesini analiz etmek. 
                Lütfen https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf adresindeki resmi dökümanı baz al.
                
                ÖZELLİKLE ŞUNA DİKKAT ET: 
                51. madde metninin içindeki rakamlara değil, en alt sayfadaki (*) işaretli dipnotlara bak. 2024 (8484 sayılı CK) ve 2025 sonundaki (10556 sayılı CK) değişim kronolojisini inceleyerek bugün (2026) geçerli olan oranı bul.
                
                Neden %3,5 veya %4,5 değil de dipnotlarda belirtilen o en güncel oranın yürürlükte olduğunu, piyasa faizleri ve enflasyonla bağ kurarak KOPYA ÇEKMEDEN özgün bir dille yorumla.

                Sadece şu JSON formatında yanıt ver:
                {
                  "tespit_edilen_oran": "...",
                  "dayanak_dipnot": "...",
                  "ozgun_yorum": "...",
                  "tarih": "2026-02-09"
                }`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();

        if (data.error) {
            console.error("API HATASI:", JSON.stringify(data.error, null, 2));
            // Eğer v1 hata verirse v1beta'yı denemek için fallback
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("BAŞARILI: Rapor oluşturuldu.");
                console.log(jsonMatch[0]);
            }
        } else {
            console.log("Yanıt içeriği boş.");
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
