const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En garantili endpoint ve model ismi kombinasyonu
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Sen kıdemli bir hukuk ve ekonomi analistisin. 
                Şu anki tarih: 9 Şubat 2026.
                
                GÖREV: 6183 sayılı Kanun'un 51. maddesini https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf adresindeki güncel PDF metni üzerinden analiz et.
                
                ANALİZ TALİMATI (KRİTİK):
                1. 51. madde metnindeki tarihsel değişiklikleri gösteren EN ALTTAKİ (*) işaretli dipnotları ve en son yayımlanan Cumhurbaşkanı Kararlarını (CK) tara.
                2. 2024 yılındaki %4,5 oranından sonra, 2025 yılı sonunda (Kasım 2025 gibi) yapılan en güncel değişikliği bul. 
                3. Mevcut yürürlükteki gerçek oranı tespit et. 
                4. Neden bu oranın tercih edildiğini, piyasadaki dezenflasyon süreci ve kredi faizleri ile bağ kurarak KOPYA ÇEKMEDEN tamamen özgün bir dille yorumla.
                
                Yanıtı sadece şu JSON formatında ver:
                {
                  "tespit_edilen_oran": "...",
                  "mevzuat_dayanak_dipnotu": "...",
                  "ozgun_ekonomik_analiz": "...",
                  "dogrulama_tarihi": "2026-02-09"
                }`
            }]
        }],
        generationConfig: {
            temperature: 0.2, // Daha tutarlı ve veriye dayalı yanıt için
            topP: 0.8
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();

        if (data.error) {
            // Eğer hala model hatası verirse, bir de 'gemini-pro' denemesi yapalım
            console.error("API HATASI:", data.error.message);
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("BAŞARILI: report.json güncellendi.");
                console.log("Rapor İçeriği:", jsonMatch[0]);
            }
        } else {
            console.log("API yanıtı boş döndü.");
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
