const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // v1beta sürümü araç (tool) kullanımını en iyi destekleyen sürümdür
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `GÖREV:
                1. Google Arama aracını kullanarak 6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranını araştır.
                2. Özellikle 2025 yılı sonundaki (Kasım 2025) en güncel Cumhurbaşkanı Kararını bul.
                3. Tespit ettiğin oranı (%...), karar numarasını ve Resmi Gazete tarihini raporla.
                4. Bu oranı, 2026 başındaki Türkiye ekonomisinin dezenflasyon süreci ve piyasa faizleri çerçevesinde KOPYA ÇEKMEDEN özgün bir dille analiz et.

                DİKKAT: Hafızandaki eski verilere (%4,5 gibi) güvenme. Canlı internet verisini kullan. Bulamıyorsan uydurma, 'Veriye ulaşılamadı' yaz.

                FORMAT (JSON):
                {
                  "oran": "...",
                  "dayanak": "...",
                  "analiz": "..."
                }`
            }]
        }],
        tools: [{ google_search: {} }], // Canlı internet erişimini aktif eder
        generationConfig: { temperature: 0 }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const result = data.candidates[0].content.parts[0].text;
            fs.writeFileSync('report.json', result);
            console.log("İnternet araştırması tamamlandı. report.json hazır.");
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
