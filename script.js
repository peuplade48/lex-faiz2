const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // Kota dostu hafif model: 1.5-flash
        const modelName = "models/gemini-1.5-flash"; 
        console.log(`Hafif model kullanılıyor: ${modelName}`);

        const prompt = {
            contents: [{
                parts: [{
                    text: "6183 Sayılı Kanun 51. madde dipnotlarındaki (*) güncel gecikme zammı oranını (Mayıs 2024 CK dahil) bul. Sadece JSON: {\"oran\": \"...\", \"yorum\": \"...\"}"
                }]
            }]
        };

        const genResponse = await fetch(`${baseUrl}/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const genData = await genResponse.json();

        if (genData.error) {
            if (genData.error.status === "RESOURCE_EXHAUSTED") {
                console.error("KOTA DOLDU: Lütfen 1 dakika bekleyip tekrar deneyin.");
            } else {
                console.error("API HATASI:", genData.error.message);
            }
            process.exit(1);
        }

        const textResponse = genData.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("BAŞARILI: report.json güncellendi.");
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
        process.exit(1);
    }
}

run();
