const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Aktif Modeli Bul
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.name.includes('flash'));

        // 2. ADIM: Kesin Veri ve JSON Formatı Talebi
        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `GÖREV: 6183 Sayılı Kanun 51. Madde kapsamındaki en güncel gecikme zammı oranını Google Search ile teyit et.
                    
                    ÖNEMLİ: Sadece aşağıdaki JSON formatında yanıt ver. Sözel açıklama yapma.
                    
                    {
                      "official_confirmation": "",
                      "legal_basis": "",
                      "gazette_date": "",
                      "status": "",
                      "annual_rate_percent": 
                    }`
                }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: { 
                temperature: 0,
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const jsonOutput = data.candidates[0].content.parts[0].text;
            console.log("JSON Verisi Hazırlandı:");
            console.log(jsonOutput);
            
            // Dosyaya kaydet
            fs.writeFileSync('report.json', jsonOutput);
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
