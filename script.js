const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const targetUrl = "https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3";

    try {
        // 1. ADIM: HTML'i biz çekiyoruz (Modelin insafına bırakmıyoruz)
        console.log("Mevzuat verisi canlı olarak çekiliyor...");
        const htmlRes = await fetch(targetUrl);
        const htmlText = await htmlRes.text();
        
        // Gereksiz kodları temizleyip sadece metne odaklanalım (Token tasarrufu)
        const cleanText = htmlText.replace(/<[^>]*>?/gm, ' ').substring(0, 15000); 

        // 2. ADIM: Gemini'a bu metni "Context" olarak veriyoruz
        const prompt = {
            contents: [{
                parts: [{
                    text: `Aşağıda 6183 sayılı Kanun'un canlı metni yer almaktadır:
                    ---
                    ${cleanText}
                    ---
                    GÖREV:
                    1. Yukarıdaki metinde yer alan 51. maddeyi ve 'Değişiklik Listesi'ni tara.
                    2. En güncel gecikme zammı oranını tespit et. (Eski uydurma verileri unut, sadece metne bak).
                    3. Bulduğun oranı 2026 başındaki ekonomik hedeflerle (faiz/enflasyon) KOPYA ÇEKMEDEN analiz et.

                    Yanıt formatı JSON:
                    {
                      "tespit_edilen_oran": "...",
                      "dayanak": "...",
                      "analiz": "..."
                    }`
                }]
            }],
            generationConfig: { temperature: 0 }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        if (data.candidates) {
            fs.writeFileSync('report.json', data.candidates[0].content.parts[0].text);
            console.log("Canlı veri analizi tamamlandı.");
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
