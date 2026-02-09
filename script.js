const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    // KESİN VERİ: Bu veriyi mevzuat.gov.tr veya GİB'den manuel teyit ettik.
    const guncelVeri = {
        oran: "%3,7",
        karar: "13 Kasım 2025 tarihli ve 10556 sayılı Cumhurbaşkanı Kararı",
        oncekiOran: "%4,5"
    };

    try {
        const prompt = {
            contents: [{
                parts: [{
                    text: `Sen profesyonel bir ekonomistsin. Sana 6183 sayılı Kanun 51. madde ile ilgili kesinleşmiş şu güncel verileri veriyorum:
                    - Mevcut Gecikme Zammı Oranı: ${guncelVeri.oran} (Aylık)
                    - Dayanak: ${guncelVeri.karar}
                    - Önceki Oran: ${guncelVeri.oncekiOran}
                    
                    Görevin:
                    Bu verileri baz alarak; oranın %4,5'ten %3,7'ye çekilmesinin ekonomik mantığını (enflasyon beklentileri, piyasa faizleri ve vergi uyumu açısından) derinlemesine analiz et. 
                    Neden devlet faiz yükünü hafifletme yoluna gitmiş olabilir? Bu durumun mükellef davranışına etkisini "kopya çekmeden" özgün bir dille yorumla.

                    Yanıtı şu JSON formatında ver:
                    {
                      "veriler": {
                         "oran": "${guncelVeri.oran}",
                         "dayanak": "${guncelVeri.karar}"
                      },
                      "ozgun_ekonomik_analiz": "...",
                      "tarih": "2026-02-09"
                    }`
                }]
            }]
        };

        const response = await fetch(`${baseUrl}/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("Analiz Raporu Başarıyla Oluşturuldu.");
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
