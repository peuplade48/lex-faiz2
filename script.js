const fs = require('fs');
const path = require('path');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const filePath = path.join(__dirname, 'report.json');

    try {
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.name.includes('flash'));
        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;

        const prompt = {
            contents: [{
                parts: [{
                    text: `GÖREV: 6183 Sayılı Kanun 51. maddedeki gecikme zammı oranını Google Search ile bul.
                    Sadece aşağıdaki JSON formatında yanıt ver:
                    {
                      "last_run": "${new Date().toISOString()}",
                      "report": {
                        "official_confirmation": "(oran)",
                        "legal_basis": "(karar no)",
                        "gazette_date": "(tarih)",
                        "current_decree_rate": "(oran)"
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
        if (data.candidates && data.candidates[0].content) {
            const rawText = data.candidates[0].content.parts[0].text;
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fs.writeFileSync(filePath, jsonMatch[0], 'utf8');
                console.log("report.json başarıyla güncellendi.");
            }
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
