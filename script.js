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
                    text: `GÖREV: 6183 Sayılı Kanun 51. maddedeki gecikme zammı oranını Google Search ile bul.
                    
                    KURALLAR:
                    1. Yanıtı SADECE aşağıdaki JSON formatında ver.
                    2. Veriye ulaşamazsan değerleri null yap.
                    
                    FORMAT:
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
            generationConfig: { temperature: 0, response_mime_type: "application/json" }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const rawOutput = data.candidates[0].content.parts[0].text;
            
            // Temizlik ve Kayıt
            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
            const finalData = jsonMatch ? jsonMatch[0] : rawOutput;

            // JS kodunun beklediği "last_run" ve "report" yapısının korunduğundan emin olalım
            fs.writeFileSync('report.json', finalData, 'utf8');
            console.log("------------------------------------------");
            console.log("SENKRONİZE JSON OLUŞTURULDU:");
            console.log(finalData);
            console.log("------------------------------------------");
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
