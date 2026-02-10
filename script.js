const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. AŞAMAMA: Hangi versiyon/model çalışıyor?
        console.log("Sistem kontrol ediliyor...");
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        
        if (listData.error) {
            throw new Error(`Liste hatası: ${listData.error.message}`);
        }

        // generateContent destekleyen 'flash' modelini bul
        const activeModel = listData.models.find(m => 
            m.name.includes('flash') && 
            m.supportedGenerationMethods.includes('generateContent')
        );

        if (!activeModel) {
            throw new Error("Uygun bir Flash modeli bulunamadı.");
        }

        console.log(`Çalışan model tespit edildi: ${activeModel.name}`);

        // 2. AŞAMA: Tespit edilen modelle sıfır ipucu analizi
        const prompt = {
            contents: [{
                parts: [{
                    text: `KAYNAK: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3
                    
                    GÖREV:
                    1. Bu bağlantıdaki 51. maddeyi ve sayfanın sonundaki 'Değişikliklerin İşlendiği Liste' fihristini oku.
                    2. En güncel gecikme zammı oranını ve bu oranın dayanağı olan Cumhurbaşkanı Karar numarasını bul.
                    3. Bulduğun veriyi 2026 başındaki ekonomik hedeflerle (enflasyon ve piyasa faizleri) KOPYA ÇEKMEDEN tamamen kendi mantığınla analiz et.
                    4. Eğer veriye ulaşamıyorsan uydurma, dürüstçe 'Veriye ulaşılamadı' yaz.

                    YANITI SADECE JSON OLARAK VER:
                    {
                      "kullanilan_model": "${activeModel.name}",
                      "tespit_edilen_oran": "...",
                      "resmi_dayanak": "...",
                      "ozgun_ekonomik_analiz": "..."
                    }`
                }]
            }],
            generationConfig: { temperature: 0 }
        };

        const response = await fetch(`${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("Rapor oluşturuldu. Bakalım kendi başına ne bulmuş...");
                console.log(jsonMatch[0]);
            }
        }
    } catch (err) {
        console.error("KRİTİK HATA:", err.message);
    }
}

run();
