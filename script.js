const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // En geniş bağlam pencereli modeli seçelim
        const model = "models/gemini-1.5-flash"; 

        const prompt = {
            contents: [{
                parts: [{
                    text: `Sen bir Mevzuat Denetçisisin. 
                    Kaynak: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf
                    
                    Görevin:
                    1. 51. madde metnini oku. Ancak orada yazan rakamla yetinme.
                    2. Madde numarasının yanındaki veya metin içindeki dipnot numaralarını (1, 2, 3...) takip et.
                    3. PDF'in en sonundaki "LİSTE" veya "DİPNOTLAR" kısmına git. 51. maddeye ilişkin en son tarihli değişikliği yapan Cumhurbaşkanı Kararı (CK) bilgisini ve orada belirtilen yeni oranı bul.
                    4. Tarihsel kronolojiyi kur: 2023 (%3,5) -> 2024 (%4,5) -> ve varsa 2025 sonundaki en güncel adım.
                    
                    Senden sadece kendi bulduğun verilerle şu analizi bekliyorum:
                    - Bulduğun en güncel oran nedir?
                    - Bu oranı PDF'in hangi sayfasındaki veya hangi dipnotundaki veriye dayanarak buldun? (Kanıt göster)
                    - Devletin bu oranı son dönemde neden değiştirdiğine dair özgün, piyasa faizleriyle tutarlı bir yorum yap.

                    Yanıtı sadece bu JSON yapısında ver:
                    {
                      "analiz_metodolojisi": "Dipnot kronolojisi takip edildi.",
                      "tespit_edilen_oran": "...",
                      "dayanak_dipnot_no": "...",
                      "ozgun_ekonomik_yorum": "...",
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
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("Rapor, Gemini'ın özgün analiziyle oluşturuldu.");
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
