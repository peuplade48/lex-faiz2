const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Sistem Tarihi: 10 Şubat 2026. 
                GÖREV: Google Arama aracını kullanarak 6183 sayılı Kanun 51. maddedeki gecikme zammı oranını bul.
                HEDEF: Kasım 2025'te yürürlüğe giren en son Cumhurbaşkanı Kararını ve yeni oranı tespit et.
                ANALİZ: Bu oranı 2026 başı enflasyon hedefleriyle KOPYA ÇEKMEDEN kıyasla.
                
                DİKKAT: Eski verileri (%4,5 gibi) kullanma. Sadece canlı internet verisini raporla.`
            }]
        }],
        tools: [{ google_search: {} }],
        generationConfig: { 
            temperature: 0,
            response_mime_type: "application/json"
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
            const rawOutput = data.candidates[0].content.parts[0].text;
            console.log("------------------------------------------");
            console.log("GEMINI ANALİZ SONUCU:");
            console.log(rawOutput);
            console.log("------------------------------------------");
            fs.writeFileSync('report.json', rawOutput);
        } else {
            console.log("Model yanıt veremedi:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("Hata oluştu:", err.message);
    }
}
run();
