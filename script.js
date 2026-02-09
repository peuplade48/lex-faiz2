const fs = require('fs');

async function getGeminiData() {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const prompt = "6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranının bugünkü (Şubat 2026) güncel değerini bul. Bu oranı ekonomik bağlamda yorumla ve sadece şu formatta JSON döndür: {\"oran\": \"...\", \"yorum\": \"...\", \"kaynak\": \"...\", \"tarih\": \"...\"}";

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    // Gemini'dan gelen text'i parse ediyoruz
    const rawText = data.candidates[0].content.parts[0].text;
    return JSON.parse(rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1));
}

async function run() {
    try {
        const reportData = await getGeminiData();
        console.log("Gemini'dan gelen veriler alındı.");

        // 1. Dış API'ye Report Etme
        if (process.env.REPORT_API_URL) {
            await fetch(process.env.REPORT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });
            console.log("Dış API'ye raporlandı.");
        }

        // 2. report.json Dosyasına Yazma
        fs.writeFileSync('report.json', JSON.stringify(reportData, null, 2));
        console.log("report.json güncellendi.");

    } catch (error) {
        console.error("Hata:", error);
        process.exit(1);
    }
}

run();
