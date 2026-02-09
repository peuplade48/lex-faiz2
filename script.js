const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    if (!apiKey) {
        console.error("HATA: GEMINI_API_KEY bulunamadı!");
        process.exit(1);
    }

    try {
        // 1. ADIM: Mevcut modelleri listele ve en uygununu seç
        const listResponse = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listResponse.json();

        if (listData.error) throw new Error(`Model listeleme hatası: ${listData.error.message}`);

        const selectedModel = listData.models.find(m => 
            m.name.includes('gemini-1.5-flash') || m.name.includes('gemini-pro')
        );

        if (!selectedModel) throw new Error("Uygun bir Gemini modeli bulunamadı.");
        console.log(`Kullanılan Model: ${selectedModel.name}`);

        // 2. ADIM: Madde dipnotlarına ve güncel CK kararlarına odaklanan Prompt
        const prompt = {
            contents: [{
                parts: [{
                    text: `6183 sayılı Kanun'un 51. maddesini analiz et. 
                    ÖZELLİKLE madde metninin altındaki dipnotları (*), yıldızla belirtilmiş alanları ve parantez içi hükümleri tarayarak en güncel gecikme zammı oranını bul.
                    
                    Bilgi Notu: 21 Mayıs 2024 tarihli Resmi Gazete'de yayımlanan 8484 sayılı Cumhurbaşkanı Kararı ile oran güncellenmiştir. 
                    
                    Lütfen bu güncel durumu ve ekonomik etkisini yorumlayarak sadece şu JSON formatında yanıt ver:
                    {
                      "kanun_madde": "6183 Sayılı Kanun Madde 51",
                      "guncel_oran_aylik": "%...",
                      "dayanak_cumhurbaskani_karari": "...",
                      "analiz_ve_yorum": "...",
                      "rapor_tarihi": "${new Date().toISOString().split('T')[0]}"
                    }`
                }]
            }]
        };

        // 3. ADIM: Gemini API'den raporu al
        const genResponse = await fetch(`${baseUrl}/${selectedModel.name}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const genData = await genResponse.json();
        if (genData.error) throw new Error(genData.error.message);

        const textResponse = genData.candidates[0].content.parts[0].text;
        
        // JSON formatını temizle (Markdown tag'lerini kaldır)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const finalData = jsonMatch[0];
            fs.writeFileSync('report.json', finalData);
            console.log("BAŞARILI: Güncel rapor 'report.json' dosyasına yazıldı.");
            console.log("İçerik:", finalData);
        } else {
            console.error("JSON ayıklanamadı. Ham yanıt:", textResponse);
            process.exit(1);
        }

    } catch (err) {
        console.error("KRİTİK HATA:", err.message);
        process.exit(1);
    }
}

run();
