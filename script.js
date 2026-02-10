const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // 'latest' takısı Free tier üzerindeki 404 hatalarını çözmek için en garantili yoldur
    const modelName = "gemini-1.5-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `KAYNAK: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3

                GÖREV:
                1. Yukarıdaki bağlantıda yer alan 6183 sayılı Kanun'un 51. maddesini ve sayfanın sonundaki 'Değişikliklerin İşlendiği Liste' fihristini tara.
                2. Bu maddeye ilişkin yapılmış olan EN GÜNCEL değişikliği (oranı ve dayanağını) tespit et.
                3. Bulduğun oranı ve bu kararın resmi numarasını/tarihini raporla.
                4. Bu oranın neden bu seviyede olduğunu, 2026 yılı başındaki ekonomik hedefler çerçevesinde KOPYA ÇEKMEDEN tamamen kendi mantığınla analiz et.
                5. Eğer veriye ulaşamıyorsan uydurma, dürüstçe 'Veriye ulaşılamadı' yaz.

                YANIT FORMATI (SADECE JSON):
                {
                  "tespit_edilen_oran": "...",
                  "resmi_dayanak": "...",
                  "ozgun_ekonomik_analiz": "..."
                }`
            }]
        }],
        generationConfig: {
            temperature: 0
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
