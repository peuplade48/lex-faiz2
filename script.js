const fs = require('fs');
const path = require('path');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    const filePath = path.join(__dirname, 'report.json');

    try {
        console.log("1. Modeller listeleniyor...");
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        
        const activeModel = listData.models.find(m => m.name.includes('flash'));
        if (!activeModel) throw new Error("Flash modeli bulunamadı!");
        console.log(`2. Kullanılan model: ${activeModel.name}`);

        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `GÖREV: 6183 Sayılı Kanun 51. maddedeki gecikme zammı oranını Google Search ile bul.
                    
                    ÖNEMLİ: Sadece JSON formatında yanıt ver. 
                    Kasım 2025'teki güncel Cumhurbaşkanı kararını (3,7 oranını) bulmaya odaklan.
                    
                    FORMAT:
                    {
                      "last_run": "${new Date().toISOString()}",
                      "report": {
                        "official_confirmation": "(oran)",
                        "legal_basis": "(karar no)",
                        "gazette_date": "(tarih)",
                        "current_decree_rate": "(oran)"
                      }
                    }`
                }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: { temperature: 0, response_mime_type: "application/json" }
        };

        console.log("3. API'ye istek gönderiliyor...");
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            let finalJson = data.candidates[0].content.parts[0].text;
            
            // Markdown temizliği (eğer varsa)
            finalJson = finalJson.replace(/```json/g, "").replace(/```/g, "").trim();

            console.log("4. API'den gelen veri:", finalJson);
            
            // DOSYA YAZMA İŞLEMİ
            fs.writeFileSync(filePath, finalJson, 'utf8');
            
            // Yazılan dosyayı kontrol et
            const checkFile = fs.readFileSync(filePath, 'utf8');
            console.log("5. Dosyaya yazılan içerik boyutu:", checkFile.length);
        } else {
            console.log("HATA: API'den boş yanıt döndü!", JSON.stringify(data));
        }
    } catch (err) {
        console.error("KRİTİK HATA:", err.message);
    }
}
run();
