const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // Model olarak Flash 1.5 en güncel ve hızlı olanıdır
        const model = "models/gemini-1.5-flash"; 

        const prompt = {
            contents: [{
                parts: [{
                    text: `
                    GÖREV: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf adresindeki dokümanı bir dedektif gibi incele.
                    
                    ÖNEMLİ: Dokümanın ilk sayfasındaki 51. madde metni ESKİDİR (%2,5 veya %3,5 yazabilir). 
                    Gerçek ve güncel oran, PDF'in EN SONUNDA yer alan "DİPNOTLAR" veya "İŞLENEMEYEN HÜKÜMLER" kısmındaki yıldızlı (*) tablolardadır.
                    
                    ADIMLAR:
                    1. PDF'in en son sayfalarına git ve 51. madde ile ilgili yapılan en son tarihli Cumhurbaşkanı Kararı (CK) değişikliğini bul.
                    2. 2024 ve 2025 yıllarında yayımlanan kararları karşılaştır (8484 sayılı ve 10556 sayılı kararlar gibi).
                    3. Mevcut (Şubat 2026) en güncel oranı tespit et.
                    4. Bu tespitine dayanarak; neden oranların değiştiğini, piyasa faizleri ve vergi adaleti açısından KOPYA ÇEKMEDEN özgün bir dille yorumla.

                    Yanıtı SADECE şu JSON formatında ver:
                    {
                      "tespit_edilen_guncel_oran": "...",
                      "dayanak_dipnot_verisi": "...",
                      "ozgun_ekonomik_analiz": "...",
                      "rapor_durumu": "Mevzuat dipnotları taranarak güncellendi",
                      "tarih": "2026-02-09"
                    }`
                }]
            }]
        };

        const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0].content) {
            console.error("API'den geçerli bir yanıt alınamadı. Kota veya erişim sorunu olabilir.");
            process.exit(1);
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            // Dosyayı her seferinde üzerine yazarak güncelle
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("GÜNCELLEME BAŞARILI: report.json yeni verilerle yenilendi.");
            console.log("Yeni Rapor:", jsonMatch[0]);
        }
    } catch (err) {
        console.error("HATA:", err.message);
    }
}

run();
