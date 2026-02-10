const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // URL'deki model ismini en yalın ve stabil haliyle güncelledik
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `KAYNAK: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3

                GÖREV:
                1. Yukarıdaki bağlantıda yer alan 6183 sayılı Kanun'un 51. maddesini ve sayfanın en sonundaki değişiklik listesini analiz et.
                2. Bu maddeye ilişkin yürürlükte olan en güncel oranı ve bu oranın resmi dayanağını (Karar no ve tarih) tespit et.
                3. Tespit ettiğin veriyi, 2026 yılı başındaki Türkiye ekonomisinin faiz politikalarıyla kıyaslayarak (kopya çekmeden, tamamen kendi zekanla) yorumla.
                4. Eğer veriye ulaşamıyorsan uydurma, 'Veriye ulaşılamadı' yaz.

                YANIT FORMATI (JSON):
                {
                  "tespit_edilen_oran": "...",
                  "hukuki_dayanak": "...",
                  "ozgun_ekonomik_analiz": "..."
                }`
            }]
        }],
        generationConfig: {
            temperature: 0 // Tahmin yürütmeyi (uydurmayı) kapatır.
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
            console.error("API HATASI:", data.error.message);
            return;
        }

        if (data.candidates && data
