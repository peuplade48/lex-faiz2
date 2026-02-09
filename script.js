const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Mevcut ve çalışan model ismini bul
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        
        const activeModel = listData.models.find(m => 
            m.supportedGenerationMethods.includes('generateContent') && 
            m.name.includes('gemini-1.5-flash')
        ) || listData.models.find(m => m.supportedGenerationMethods.includes('generateContent'));

        if (!activeModel) {
            console.error("Uygun model bulunamadı!");
            return;
        }
        
        const modelPath = activeModel.name; 
        console.log(`Sistemde aktif olan model bulundu: ${modelPath}`);

        // 2. ADIM: Analizi bu modelle yap
        const prompt = {
            contents: [{
                parts: [{
                    text: `Analiz Tarihi: 9 Şubat 2026. 
                    Kaynak: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf

                    GÖREV: 
                    Daha önce verdiğin %4,5'lik oran hatalıdır (halüsinasyon). PDF'in en altındaki (*) işaretli dipnotları ve en sondaki değişiklik listesini tara. Kasım 2025'te oranı %3,7'ye indiren en güncel Cumhurbaşkanı Kararı'nı tespit et.
                    
                    Bu %3,7'lik güncel oranı baz alarak; neden bir faiz indirimine gidildiğini piyasa koşullarıyla (dezenflasyon, likidite vb.) kopya çekmeden analiz et.

                    Sadece JSON yanıt ver:
                    {
                      "tespit_edilen_oran": "...",
                      "dayanak_dipnot": "...",
                      "ozgun_yorum": "..."
                    }`
                }]
            }]
        };

        const response = await fetch(`${baseUrl}/${modelPath}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("BAŞARILI: Rapor güncel model ile oluşturuldu.");
            console.log(jsonMatch[0]);
        }
    } catch (err) {
        console.error("KRİTİK HATA:", err.message);
    }
}
run();
