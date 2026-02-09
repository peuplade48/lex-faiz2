const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Kullanılabilir modelleri API'den soralım
        console.log("Kullanılabilir modeller listeleniyor...");
        const listResponse = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listResponse.json();

        if (listData.error) {
            throw new Error(`Model listeleme hatası: ${listData.error.message}`);
        }

        // generateContent destekleyen ilk 'gemini' modelini seçelim
        const availableModel = listData.models.find(m => 
            m.name.includes('gemini') && 
            m.supportedGenerationMethods.includes('generateContent')
        );

        if (!availableModel) {
            throw new Error("Hesabınızda uygun Gemini modeli bulunamadı.");
        }

        const modelName = availableModel.name; // Örn: "models/gemini-1.5-flash-latest"
        console.log(`Uygun model bulundu: ${modelName}. Analiz başlıyor...`);

        // 2. ADIM: Raporu seçilen modelle alalım
        const prompt = {
            contents: [{
                parts: [{
                    text: "6183 sayılı Kanun'un 51. maddesindeki güncel gecikme zammı oranını bul. Ekonomik bir yorumla birlikte sadece şu JSON formatında döndür: {\"oran\": \"...\", \"yorum\": \"...\", \"tarih\": \"2026-02-09\"}"
                }]
            }]
        };

        const genResponse = await fetch(`${baseUrl}/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const genData = await genResponse.json();
        
        if (genData.error) throw new Error(genData.error.message);

        const textResponse = genData.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("BAŞARILI: Rapor report.json dosyasına kaydedildi.");
        } else {
            console.log("Ham Yanıt:", textResponse);
            throw new Error("JSON formatı ayıklanamadı.");
        }

    } catch (err) {
        console.error("KRİTİK HATA:", err.message);
        process.exit(1);
    }
}

run();
