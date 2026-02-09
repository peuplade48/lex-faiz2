const fs = require('fs');

async function fetchGeminiReport() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En güncel ve genel erişime açık endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: "6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranını (Şubat 2026 itibarıyla) bul. Ekonomik bir yorumla birlikte sadece şu JSON formatında döndür: {\"oran\": \"...\", \"yorum\": \"...\", \"tarih\": \"...\"}"
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();

        if (data.error) {
            console.error("API Hatası:", data.error.message);
            process.exit(1);
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            // Dosyayı oluştur veya üzerine yaz
            fs.writeFileSync('./report.json', jsonMatch[0]);
            console.log("report.json başarıyla oluşturuldu.");
        } else {
            throw new Error("JSON bulunamadı.");
        }
    } catch (error) {
        console.error("Hata:", error.message);
        process.exit(1);
    }
}

fetchGeminiReport();
