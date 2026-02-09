const fs = require('fs');

async function fetchGeminiReport() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // v1 endpoint'i ve tam model adı kullanımı daha stabildir
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
      6183 sayılı Kanun'un 51. maddesindeki güncel gecikme zammı oranını (2026 yılı için) kontrol et. 
      Lütfen sadece aşağıdaki JSON yapısını döndür, başka hiçbir metin yazma:
      {
        "kanun": "6183",
        "madde": "51",
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

        // Detaylı hata raporlama
        if (data.error) {
            console.error("API Hatası Detayı:", JSON.stringify(data.error, null, 2));
            process.exit(1);
        }

        if (!data.candidates || data.candidates.length === 0) {
            console.error("Yanıt yapısı beklenen formatta değil:", JSON.stringify(data, null, 2));
            process.exit(1);
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        
        // Markdown kod bloklarını (```json ... ```) temizlemek için regex
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const cleanJson = jsonMatch[0];
            fs.writeFileSync('report.json', cleanJson);
            console.log("Rapor başarıyla güncellendi.");
        } else {
            console.error("JSON ayıklanamadı. Ham yanıt:", textResponse);
            process.exit(1);
        }

    } catch (error) {
        console.error("Sistem Hatası:", error.message);
        process.exit(1);
    }
}

fetchGeminiReport();
