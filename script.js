const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Analiz Kaynağı: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf

                Talimat:
                1. Bu PDF dökümanının 51. maddesini bul.
                2. Madde metnindeki rakamla yetinme; metnin sonundaki "LİSTE" veya "DİPNOTLAR" kısmına odaklan.
                3. 51. maddeye ilişkin yapılmış en son tarihli Cumhurbaşkanı Kararı (CK) değişikliğini tespit et. 
                4. Tespit ettiğin bu en güncel oranı ve dayanağını (CK Tarih/Sayı) raporla.
                5. Bu oranın mevcut ekonomik konjonktürdeki yerini, piyasa faizleriyle kıyaslayarak (kopya çekmeden, tamamen kendi mantığınla) yorumla.

                Yanıtı sadece JSON formatında ver:
                {
                  "tespit_edilen_oran": "...",
                  "dayanak_bilgisi": "...",
                  "analiz_metodu": "PDF dipnot taraması",
                  "ozgun_ekonomik_yorum": "...",
                  "tarih": "2026-02-09"
                }`
            }]
        }],
        generationConfig: {
            temperature: 0 // "Yaratıcılığı" kapatıp sadece veriye odaklanmasını sağlar.
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("PDF Analizi Tamamlandı. Rapor oluşturuldu.");
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
