const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.name.includes('flash'));

        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `Sistem Tarihi: 10 Şubat 2026.
                    GÖREV: 6183 Sayılı Kanun 51. maddedeki en güncel gecikme zammı oranını Google Search ile bul.
                    
                    ÖNEMLİ: Sadece JSON formatında yanıt ver. Bulamazsan uydurma, 'null' yaz.
                    
                    ŞABLON:
                    {
                      "official_confirmation": "(oran)",
                      "legal_basis": "(karar no)",
                      "gazette_date": "(tarih)",
                      "status": "active",
                      "annual_rate_percent": (yıllık hesap)
                    }`
                }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: { 
                temperature: 0
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            let rawText = data.candidates[0].content.parts[0].text;
            
            // Markdown bloklarını (```json ... ```) temizle
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            const finalJson = jsonMatch ? jsonMatch[0] : rawText;

            console.log("Bulunan Veri:", finalJson);
            
            // Dosyayı diske yaz
            fs.writeFileSync('report.json', finalJson, 'utf8');
            console.log("report.json başarıyla kaydedildi.");
        } else {
            console.log("Modelden içerik gelmedi:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
