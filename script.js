const fs = require('fs');

async function fetchGeminiReport() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // v1beta ve gemini-1.5-flash kullanımı çoğu hesapta en stabil çalışan sürümdür
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: "6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranını (bugünkü güncel veri) bul ve ekonomik bir yorumla birlikte şu JSON formatında döndür: {\"oran\": \"...\", \"yorum\": \"...\", \"tarih\": \"...\"}. Sadece JSON verisini yaz."
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
            console.error("API Hatası Detayı:", JSON.stringify(data.error, null, 2));
            // Eğer 404 almaya devam edersek, bir de 'gemini-pro' modelini deneyelim
            if (data.error.code === 404) {
                console.log("Model bulunamadı, gemini-pro deneniyor...");
                return tryBackupModel(apiKey);
            }
            process.exit(1);
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("Rapor başarıyla yazıldı.");
        }
    } catch (error) {
        console.error("Hata:", error.message);
        process.exit(1);
    }
}

// Yedek model denemesi (Eğer flash modeli hesabınızda tanımlı değilse)
async function tryBackupModel(apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    // ... (Aynı mantıkla fetch işlemi)
    // Bu kısım hata devam ederse alternatif yol sunar
}

fetchGeminiReport();
