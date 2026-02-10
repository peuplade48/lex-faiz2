const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // v1beta sürümü 'tools' (Google Search) özelliğini destekler
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Bugün 10 Şubat 2026. 
                Görevin: 6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranını internetten (Resmi Gazete ve GİB) araştırarak bul.
                
                TALİMATLAR:
                1. Sakın kafandan kararname (8214 sayılı vb.) veya oran (%60 vb.) uydurma.
                2. Kasım 2025 tarihinde yayımlanan ve oranı %3,7'ye indiren en güncel Cumhurbaşkanı Kararını bul.
                3. Bu %3,7'lik oranı teyit ettikten sonra, devletin neden bu indirimi yaptığını (enflasyon beklentileri, piyasa faizleri) KOPYA ÇEKMEDEN özgün bir dille analiz et.
                
                Yanıtı şu JSON formatında ver:
                {
                  "dogrulanmış_oran": "...",
                  "resmi_karar_no": "...",
                  "ekonomik_yorum": "..."
                }`
            }]
        }],
        // Bu kısım Gemini'ın internete çıkmasını sağlar
        tools: [{ google_search_retrieval: {} }]
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
                console.log("Rapor internetten doğrulanan gerçek verilerle oluşturuldu.");
                console.log(jsonMatch[0]);
            }
        } else {
            console.error("API yanıt vermedi veya arama yapamadı:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Sistem Hatası:", err.message);
    }
}

run();
