const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // Kota dostu ve kararlı model
        const model = "models/gemini-1.5-flash"; 

        const prompt = {
            contents: [{
                parts: [{
                    text: `
                    GÖREV: 6183 sayılı Kanun'un 51. maddesini analiz et. 
                    KAYNAK: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf
                    
                    İnceleme Talimatı:
                    1. PDF'in içindeki ana metne (eski oranlara) güvenme. 
                    2. 51. maddenin altındaki yıldızlı (*) dipnotları ve en son yayımlanan Cumhurbaşkanı Kararlarını (CK) internet üzerinden (gib.gov.tr dahil) araştırarak doğrula.
                    3. 2024 (8484 sayılı CK) ve 2025 (10556 sayılı CK gibi) yıllarındaki değişiklik kronolojisini takip ederek BUGÜNKÜ (Şubat 2026) oranı bul.
                    4. Bu oranın neden %4,5'ten daha aşağıya (%3,7 seviyelerine) çekildiğine dair KOPYA ÇEKMEDEN özgün bir ekonomik yorum yap.

                    Sadece şu JSON formatında yanıt ver:
                    {
                      "oran_tespiti": "...",
                      "dayanak_mevzuat_dipnotu": "...",
                      "ekonomik_yorum_analiz": "...",
                      "dogrulama_kaynagi": "Mevzuat PDF + GİB Verileri",
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
        
        if (data.error) {
            console.error("API HATASI:", data.error.message);
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("BAŞARILI: Rapor güncellendi.");
                console.log(jsonMatch[0]);
            }
        } else {
            console.log("Yanıt alınamadı. Lütfen 30 saniye sonra tekrar deneyin.");
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}
run();
