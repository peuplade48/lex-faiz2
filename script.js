const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `KAYNAK: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3

                GÖREV:
                1. Bu bağlantıdaki 51. maddeyi ve sayfanın en sonundaki değişiklik listesini tara.
                2. Yürürlükte olan en güncel oranı ve dayanağı olan Cumhurbaşkanı Karar numarasını bul.
                3. Oranı ve dayanağını yazdıktan sonra, neden bu oranın seçildiğini 2026 başındaki ekonomik hedeflerle bağdaştırarak KOPYA ÇEKMEDEN analiz et.
                4. Eğer veriye ulaşamıyorsan uydurma, 'Veriye ulaşılamadı' yaz.

                YANIT FORMATI (JSON):
                {
                  "tespit_edilen_oran": "...",
                  "hukuki_dayanak": "...",
                  "ozgun_ekonomik_analiz": "..."
                }`
            }]
        }],
        generationConfig: {
            temperature: 0
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
                console.log("Rapor başarıyla yazıldı.");
                console.log(jsonMatch[0]);
            }
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
