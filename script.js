const fs = require('fs');
const path = require('path');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const filePath = path.join(__dirname, 'report.json');

    try {
        console.log(">> Modeller taranıyor...");
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.name.includes('flash'));
        
        console.log(`>> Aktif Model: ${activeModel.name}`);
        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;

        const prompt = {
            contents: [{
                parts: [{
                    text: `GÖREV: 6183 Sayılı Kanun 51. maddedeki gecikme zammı oranını Google Search ile bul.                   
                    Sadece şu JSON formatında yanıt ver:
                    {
                      "last_run": "${new Date().toISOString()}",
                      "report": {
                        "official_confirmation": "3,7",
                        "legal_basis": "10556 sayılı Cumhurbaşkanı Kararı",
                        "gazette_date": "13 Kasım 2025",
                        "current_decree_rate": "3,7"
                      }
                    }`
                }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: { temperature: 0 }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        // DEBUG: API'den ne geldiğini loglarda görelim
        if (data.candidates && data.candidates[0].content) {
            const rawText = data.candidates[0].content.parts[0].text;
            console.log(">> API YANITI BULUNDU:", rawText);

            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fs.writeFileSync(filePath, jsonMatch[0], 'utf8');
                console.log(">> DOSYA YAZILDI: report.json güncellendi.");
            } else {
                console.log(">> HATA: Yanıt içinde JSON yapısı bulunamadı!");
            }
        } else {
            console.log(">> KRİTİK HATA: API boş döndü veya yetki hatası var!", JSON.stringify(data));
        }
    } catch (err) {
        console.error(">> SİSTEM HATASI:", err.message);
    }
}
run();
