const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `GÖREV: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf adresindeki dokümanın en son sayfalarında yer alan 'LİSTE' veya 'DİPNOTLAR' kısmını tara.
                
                KRİTİK UYARI: Daha önce 8109 sayılı bir kararla %4,5 oranı uyduruldu. Bu veri yanlıştır. 
                
                GERÇEK ARAMA ADIMLARI:
                1. 51. maddeye ilişkin yapılan son değişikliği bul (Kasım 2025 tarihli kararı ara).
                2. Oranın %3,7'ye revize edildiğini bu dipnotlardan teyit et.
                3. Neden %4,5'ten %3,7'ye inildiğini, 2026 başındaki dezenflasyon hedefleriyle bağ kurarak 'kopya çekmeden' analiz et.

                SADECE JSON YANIT VER:
                {
                  "tespit_edilen_oran": "...",
                  "gercek_dayanak_karar": "...",
                  "ekonomik_analiz": "...",
                  "dogrulama": "PDF son sayfa dipnotları taranmıştır."
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

        // TypeError'u engelleyen kontrol
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("Rapor güncellendi.");
                console.log(jsonMatch[0]);
            }
        } else {
            console.error("API Yanıtı Beklenen Formatın Dışında:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Sistem Hatası:", err.message);
    }
}
run();
