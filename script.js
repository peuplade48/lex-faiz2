const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En geniş uyumluluk için models/ ön eki olmadan v1beta endpoint'i
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Analiz Kaynağı: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf

                TALİMAT (KESİN):
                1. Bu PDF'in 51. maddesini bul. Metnin içine değil, en alttaki dipnotlar ve değişiklik listesine bak.
                2. Orada 2024 ve 2025 yıllarında yapılmış olan Cumhurbaşkanı Kararları (CK) kronolojisini incele.
                3. Tespit ettiğin EN SON yürürlüğe giren oranı ve bu kararın resmi numarasını bul.
                4. Bulduğun bu rakamı temel alarak; 2026 yılı başındaki Türkiye ekonomisinin faiz ve enflasyon dengesini, bu rakamın neden bu seviyede olduğunu KOPYA ÇEKMEDEN tamamen özgün bir dille yorumla.
                5. Eğer PDF'i okuyamıyorsan veya veriye ulaşamıyorsan uydurma veri üretme, 'veriye ulaşamadım' yaz.

                Yanıt formatı sadece JSON:
                {
                  "tespit_edilen_oran": "...",
                  "dayanak_verisi": "...",
                  "ozgun_ekonomik_analiz": "..."
                }`
            }]
        }],
        generationConfig: {
            temperature: 0 // Yaratıcılığı ve uydurmayı kapat, sadece gördüğünü yaz.
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
                console.log("Bağımsız rapor oluşturuldu. Bakalım ne buldu...");
            }
        } else {
            console.error("Model yanıt üretemedi:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Sistem Hatası:", err.message);
    }
}
run();
