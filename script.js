const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // En hafif ve hızlı model
        const model = "models/gemini-1.5-flash"; 

        const prompt = {
            contents: [{
                parts: [{
                    text: `Şu URL'deki PDF'in EN SON sayfasındaki 'DİPNOTLAR' (madde 51 ile ilgili olanlar) kısmını analiz et: 
                    https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf
                    
                    Görevin:
                    1. 51. maddenin yanındaki (*) işaretinin dipnotlardaki karşılığını bul.
                    2. En son yayımlanan Cumhurbaşkanı Kararı (2025 tarihli olanlar dahil) ile belirlenen oranı tespit et.
                    3. Bu oranın, piyasadaki kredi faizlerine göre neden bu seviyede olduğunu KOPYA ÇEKMEDEN özgün bir dille yorumla.
                    
                    Yanıt sadece JSON olsun:
                    {
                      "oran": "...",
                      "dayanak": "...",
                      "ozgun_yorum": "...",
                      "tarih": "2026-02-09"
                    }`
                }]
            }]
        };

        const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        // Yanıt kontrolü ve hata ayıklama
        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("GÜNCELLEME TAMAMLANDI: report.json içeriği yenilendi.");
            }
        } else {
            console.log("Kota dolmuş olabilir. Lütfen 60 saniye bekleyip tekrar deneyin.");
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}
run();
