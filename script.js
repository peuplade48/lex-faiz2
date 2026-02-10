const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Mevcut modelleri listele ve çalışanı bul
        console.log("Sistem taranıyor, uygun model aranıyor...");
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();

        if (listData.error) throw new Error(listData.error.message);

        // generateContent destekleyen ilk flash modelini seç
        const activeModel = listData.models.find(m => 
            m.name.includes('flash') && 
            m.supportedGenerationMethods.includes('generateContent')
        );

        if (!activeModel) throw new Error("Uygun model bulunamadı!");
        console.log(`Tespit edilen model: ${activeModel.name}`);

        // 2. ADIM: Tespit edilen modelle sıfır kopya araştırması
        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `GÖREV:
                    1. 6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranını araştır.
                    2. En son yapılan değişikliği (oran ve dayanak karar) tespit et.
                    3. Bulduğun veriyi 2026 yılı başı ekonomik konjonktürüyle KOPYA ÇEKMEDEN analiz et.
                    4. Hafızandaki eski/sabit verileri değil, şu anki güncel veriyi kullan. Bulamazsan uydurma.`
                }]
            }],
            generationConfig: { temperature: 0 }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const output = data.candidates[0].content.parts[0].text;
            console.log("------------------------------------------");
            console.log("BAĞIMSIZ ANALİZ SONUCU:");
            console.log(output);
            console.log("------------------------------------------");
            fs.writeFileSync('report.json', output);
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}
run();
