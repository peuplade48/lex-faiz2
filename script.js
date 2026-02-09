const fs = require('fs');

async function fetchGeminiReport() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("HATA: GEMINI_API_KEY eksik! Lütfen GitHub Secrets ayarlarını kontrol edin.");
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
      6183 sayılı Kanun'un 51. maddesindeki güncel gecikme zammı oranını (2026 yılı için) tespit et. 
      Ekonomik bir yorumla birlikte sadece şu JSON formatında yanıt ver:
      {
        "oran": "...",
        "yorum": "...",
        "tarih": "${new Date().toISOString()}"
      }
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // API Hata kontrolü
        if (data.error) {
            console.error("API Hatası:", data.error.message);
            process.exit(1);
        }

        // Yanıt yapısı kontrolü
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error("Gemini geçerli bir yanıt dönmedi. Dönen veri:", JSON.stringify(data));
            process.exit(1);
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("Rapor başarıyla 'report.json' dosyasına yazıldı.");
        } else {
            console.error("Yanıt içinde JSON bulunamadı:", textResponse);
        }

    } catch (error) {
        console.error("Beklenmedik bir hata oluştu:", error.message);
        process.exit(1);
    }
}

fetchGeminiReport();
