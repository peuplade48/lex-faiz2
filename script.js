const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // v1beta'da en geniş kabul gören model tanımlama formatı
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Sistem Tarihi: 10 Şubat 2026.
                GÖREV: Google Arama (google_search) aracını kullanarak 6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranını araştır.
                ÖZELLİKLE: Kasım 2025 tarihinde yayımlanan Resmi Gazete verilerini ve yeni oranı (yüzde kaç olduğunu) tespit et.
                ANALİZ: Bulduğun bu oranı, 2026 yılı başındaki Türkiye ekonomisinin faiz politikalarıyla KOPYA ÇEKMEDEN kıyasla.
                
                DİKKAT: Hafızandaki eski %4,5 veya %1,6 gibi verileri kullanma. Bulamazsan 'Veriye ulaşılamadı' yaz.`
            }]
        }],
        tools: [{ google_search: {} }], // Canlı internet erişimi
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
        
        if (data.error) {
            console.error("API HATASI:", data.error.message);
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const output = data.candidates[0].content.parts[0].text;
            console.log("------------------------------------------");
            console.log("ARAŞTIRMA SONUCU:");
            console.log(output);
            console.log("------------------------------------------");
            fs.writeFileSync('report.json', output);
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}
run();
