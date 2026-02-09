const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Mevcut modelleri listele
        console.log("Hesabınıza tanımlı modeller taranıyor...");
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();

        if (listData.error) {
            console.error("API Hatası:", listData.error.message);
            return;
        }

        // generateContent destekleyen en iyi modeli seç (Örn: gemini-1.5-flash veya gemini-pro)
        const availableModel = listData.models.find(m => 
            m.supportedGenerationMethods.includes('generateContent') && 
            !m.name.includes('vision') // Vision olmayan, metin odaklı güncel bir model
        );

        if (!availableModel) {
            console.error("Uygun bir model bulunamadı!");
            return;
        }

        const modelName = availableModel.name;
        console.log(`Bulunan ve Kullanılan Model: ${modelName}`);

        // 2. ADIM: Seçilen dinamik model ile analizi yap
        const prompt = {
            contents: [{
                parts: [{
                    text: `Bugünün tarihi: 9 Şubat 2026. 
                    Görevin: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf adresindeki 6183 sayılı Kanun'un 51. maddesini analiz etmek.
                    
                    ÖNEMLİ TALİMAT:
                    1. Madde metni içindeki eski oranlara (%2,5 vb.) bakma. 
                    2. PDF'in EN ALTINDA yer alan (*) işaretli DİPNOTLARI ve 2024-2025 yıllarındaki Cumhurbaşkanı Kararları (CK) kronolojisini tara.
                    3. Mevcut (2026) en güncel gecikme zammı oranını tespit et. 
                    4. Neden bu oranın (%4,5'ten sonra gelen güncel oran) tercih edildiğini, dezenflasyon süreci ve piyasa faizleriyle bağ kurarak KOPYA ÇEKMEDEN özgün bir dille yorumla.

                    Yanıtı sadece şu JSON formatında ver:
                    {
                      "kullanilan_model": "${modelName}",
                      "tespit_edilen_oran": "...",
                      "dayanak_dipnot": "...",
                      "ozgun_ekonomik_analiz": "...",
                      "tarih": "2026-02-09"
                    }`
                }]
            }]
        };

        const response = await fetch(`${baseUrl}/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("İŞLEM BAŞARILI: Rapor güncel model ile oluşturuldu.");
            console.log(jsonMatch[0]);
        }

    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
