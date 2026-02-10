const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.name.includes('flash'));

        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `Sistem Tarihi: 10 Şubat 2026.
                    
                    GÖREV: 
                    Google Search aracını kullanarak 6183 Sayılı Kanun'un 51. maddesindeki gecikme zammı oranını araştır. 
                    En güncel (2025 sonu/2026 başı) resmi veriyi tespit et.
                    
                    KURALLAR:
                    1. Veriyi bulamazsan uydurma, 'null' yaz.
                    2. Yanıtı sadece aşağıdaki JSON şablonuna göre ver. Şablon içindeki anahtarları (key) kullan ama değerleri (value) kendin bulup doldur.
                    
                    ŞABLON:
                    {
                      "official_confirmation": "(Buraya bulduğun oranı sadece rakam olarak yaz)",
                      "legal_basis": "(Buraya resmi karar numarasını yaz)",
                      "gazette_date": "(Buraya Resmi Gazete tarihini yaz)",
                      "status": "(Yürürlük durumunu yaz)",
                      "annual_rate_percent": (Bulduğun aylık oran üzerinden yıllık hesabı rakam olarak yaz)
                    }`
                }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: { 
                temperature: 0,
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const jsonOutput = data.candidates[0].content.parts[0].text;
            console.log("------------------------------------------");
            console.log("OTONOM JSON ÇIKTISI:");
            console.log(jsonOutput);
            console.log("------------------------------------------");
            fs.writeFileSync('report.json', jsonOutput);
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
