const fs = require('fs');

async function tryModel(url, modelName) {
    console.log(`Deneniyor: ${modelName} (${url.split('/')[4]})`);
    
    const prompt = {
        contents: [{
            parts: [{
                text: "6183 sayılı Kanun'un 51. maddesindeki güncel gecikme zammı oranını bul. Ekonomik bir yorumla birlikte sadece şu JSON formatında döndür: {\"oran\": \"...\", \"yorum\": \"...\", \"tarih\": \"...\"}"
            }]
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
}

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Denenecek kombinasyonlar listesi
    const configs = [
        { v: 'v1beta', m: 'gemini-1.5-flash' },
        { v: 'v1', m: 'gemini-1.5-flash' },
        { v: 'v1beta', m: 'gemini-pro' },
        { v: 'v1', m: 'gemini-pro' }
    ];

    let success = false;

    for (const config of configs) {
        try {
            const url = `https://generativelanguage.googleapis.com/${config.v}/models/${config.m}:generateContent?key=${apiKey}`;
            const data = await tryModel(url, config.m);
            
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log(`BAŞARILI: ${config.m} modeli ile rapor oluşturuldu.`);
                success = true;
                break; // Başarılı olursa döngüden çık
            }
        } catch (err) {
            console.log(`BAŞARISIZ: ${config.m} hatası -> ${err.message}`);
        }
    }

    if (!success) {
        console.error("Hiçbir model kombinasyonu çalışmadı. API anahtarınızı veya Google AI Studio panelinizi kontrol edin.");
        process.exit(1);
    }
}

run();
