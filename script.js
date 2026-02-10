const fs = require('fs');
const path = require('path');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const filePath = path.join(__dirname, 'report.json');

    try {
        console.log("1. Modeller taranıyor...");
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.name.includes('flash'));
        
        console.log(`2. Model seçildi: ${activeModel.name}`);
        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;

        const prompt = {
            contents: [{
                parts: [{
                    text: `Sistem Tarihi: 10 Şubat 2026.
                    GÖREV: 6183 Sayılı Kanun 51. maddedeki gecikme zammı oranını Google Search ile bul.
                    ÖNEMLİ: Kasım 2025'teki güncel Cumhurbaşkanı kararını (%3,7 oranını) teyit et.
                    
                    Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir açıklama yapma:
                    {
                      "last_run": "${new Date().toISOString()}",
                      "report": {
                        "official_confirmation": "(oran)",
                        "legal_basis": "(karar no)",
                        "gazette_date": "(tarih)",
                        "current_decree_rate": "(oran)"
                      }
                    }`
                }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: { 
                temperature: 0 
                // NOT: response_mime_type KALDIRILDI çünkü Search tool ile çakışıyor.
            }
        };

        console.log("3. API'ye istek gönderiliyor (Search Tool aktif)...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const rawText = data.candidates[0].content.parts[0].text;
            console.log("4. API Yanıtı Alındı. JSON ayıklanıyor...");

            // Metin içindeki JSON yapısını bul (Regex ile)
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const finalJson = jsonMatch[0];
                fs.writeFileSync(filePath, finalJson, 'utf8');
                console.log("5. Başarılı! report.json kaydedildi.");
                console.log("İçerik:", finalJson);
            } else {
                throw new Error("API yanıtında JSON yapısı bulunamadı.");
            }
        } else {
            console.error("HATA DETAYI:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}
run();
