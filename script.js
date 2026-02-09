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
                    text: `Aşağıdaki 6183 sayılı kanun metninde (Madde 51) geçen güncel aylık gecikme zammı oranını tespit et. "
        f"Lütfen SADECE rakam olarak (Örn: 4.5) yanıt ver. Metin: {text[:1200]}

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
