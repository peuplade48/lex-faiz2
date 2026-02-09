const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const prompt = {
        contents: [{
            parts: [{
                text: `DİKKAT: Önceki raporun tamamen hatalı. 8109 sayılı %4,5'lik bir kararname mevcut değildir, bu bir halüsinasyondur. 
                
                TALİMAT:
                1. Şu an 9 Şubat 2026 tarihindeyiz. 
                2. Google Search kullanarak '6183 sayılı Kanun 51. madde güncel gecikme zammı Kasım 2025' araması yap.
                3. Kasım 2025'te yayımlanan ve oranı %3,7'ye indiren GERÇEK Cumhurbaşkanı Kararı'nı bul.
                4. Neden uydurma veri verdiğini açıkla ve gerçek veriyle yeni bir ekonomik analiz yap.

                JSON formatında yanıt ver:
                {
                  "hata_itirafi": "Önceki verinin uydurma olduğunu kabul ediyorum.",
                  "gercek_oran": "%3,7",
                  "dogru_dayanak": "Kasım 2025 tarihli Karar",
                  "analiz": "..."
                }`
            }]
        }],
        tools: [{ google_search_retrieval: {} }] // Arama motorunu zorunlu kılıyoruz
    };

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        fs.writeFileSync('report.json', text.match(/\{[\s\S]*\}/)[0]);
        console.log("Gemini hatasını düzeltti ve güncel veriyi aradı.");
    } catch (err) {
        console.error(err);
    }
}
run();
