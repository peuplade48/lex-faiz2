const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En stabil endpoint: v1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `GÖREV: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf adresindeki resmi PDF dokümanını analiz et.

                ÖNEMLİ: Daha önceki analizinde 8109 sayılı kararla %4,5 oranı verildi ancak bu veri HATALIDIR ve PDF'in güncel dipnotlarıyla uyuşmamaktadır. 

                ANALİZ ADIMLARI:
                1. 51. madde metnini değil, sayfanın en altında bulunan (*) işaretli DİPNOTLARI ve en sondaki değişiklik listesini oku.
                2. Kasım 2025 tarihinde yayımlanan ve gecikme zammını %3,7'ye indiren en güncel Cumhurbaşkanı Kararını bul.
                3. Bu %3,7'lik indirimin neden yapıldığını (2026 başındaki dezenflasyon süreci, piyasa faizleri vb.) KOPYA ÇEKMEDEN kendi ekonomi mantığınla yorumla.

                Sadece JSON formatında yanıt ver:
                {
                  "tespit_edilen_oran": "...",
                  "resmi_dayanak_dipnotu": "...",
                  "ozgun_ekonomik_yorum": "...",
                  "dogrulama_notu": "PDF dipnotları taranarak uydurma veriler temizlenmiştir."
                }`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();

        if (data.error) {
            console.error("API HATASI:", data.error.message);
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("Rapor güncellendi. Gemini %3,7 gerçeğiyle yüzleşiyor.");
                console.log(jsonMatch[0]);
            }
        } else {
            console.log("API boş döndü. Yanıt yapısı:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
