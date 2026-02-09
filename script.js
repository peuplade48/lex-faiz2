const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const prompt = {
        contents: [{
            parts: [{
                text: `Tarih: 9 Şubat 2026. 
                Görevin: 6183 sayılı Kanun'un 51. maddesini analiz etmek. 
                Lütfen kendi güncel mevzuat bilgilerini ve internetteki Resmi Gazete verilerini tara. 
                ÖZELLİKLE 51. maddenin altındaki yıldızlı (*) dipnotlarda yer alan, 2024 ve 2025 yıllarındaki Cumhurbaşkanı Kararları (CK) ile yapılan değişiklikleri incele.
                
                Talimatlar:
                1. 2024'teki %4,5'lik oran sonrası, 2025 yılı sonunda yapılan en güncel değişikliği tespit et.
                2. Neden %3,5 veya %4,5 değil de şu anki güncel oranın (yıldızlı dipnotlarda belirtilen) yürürlükte olduğunu ekonomik bir dille, KOPYA ÇEKMEDEN yorumla.
                3. Dayanak olarak PDF'in (https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf) sonundaki hangi dipnotun baz alındığını belirt.

                Sadece şu JSON formatında yanıt ver:
                {
                  "oran": "...",
                  "dayanak_karar": "...",
                  "ozgun_yorum": "...",
                  "dogrulama_notu": "Dipnotlar ve CK kararları taranmıştır."
                }`
            }]
        }]
    };

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();

        // API'den gelen ham hatayı konsola yazdıralım ki ne olduğunu görelim
        if (data.error) {
            console.error("API HATASI:", JSON.stringify(data.error, null, 2));
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("BAŞARILI: Rapor oluşturuldu.");
                console.log("İçerik:", jsonMatch[0]);
            }
        } else {
            console.log("API boş yanıt döndü. Ham veri:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
