const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // API versiyonlarını ve modelleri denemek için liste
    const versions = ['v1beta', 'v1'];
    
    let workingModel = null;
    let workingVersion = null;

    console.log("Uygun model aranıyor...");

    for (const v of versions) {
        try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
            const listData = await listRes.json();
            
            if (listData.models) {
                // generateContent destekleyen ilk gemini modelini bul
                const found = listData.models.find(m => 
                    m.supportedGenerationMethods.includes('generateContent') && 
                    m.name.includes('gemini')
                );
                if (found) {
                    workingModel = found.name;
                    workingVersion = v;
                    break;
                }
            }
        } catch (e) { continue; }
    }

    if (!workingModel) {
        console.error("HATA: Hesabınızda kullanılabilir bir Gemini modeli bulunamadı.");
        process.exit(1);
    }

    console.log(`Bulunan Model: ${workingModel} (Versiyon: ${workingVersion})`);

    const prompt = {
        contents: [{
            parts: [{
                text: "6183 sayılı Kanun'un 51. maddesindeki güncel gecikme zammı oranını (21 Mayıs 2024 tarihli 8484 sayılı CK dahil) madde altındaki dipnotları tarayarak bul. Sadece şu JSON formatında yanıt ver: {\"oran\": \"...\", \"yorum\": \"...\", \"tarih\": \"2026-02-09\"}"
            }]
        }]
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/${workingVersion}/${workingModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("BAŞARILI: Rapor oluşturuldu.");
        }
    } catch (err) {
        console.error("İŞLEM HATASI:", err.message);
        process.exit(1);
    }
}

run();
