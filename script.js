const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Aktif ve erişilebilir modeli kendin bul (404 hatasını bitirir)
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        
        // generateContent destekleyen ilk geçerli modeli seç (Genelde gemini-1.5-flash-latest veya benzeridir)
        const activeModel = listData.models.find(m => m.supportedGenerationMethods.includes('generateContent')).name;
        console.log(`Kullanılan Model: ${activeModel}`);

        // 2. ADIM: Sıfır ipucu ile PDF analizi
        const prompt = {
            contents: [{
                parts: [{
                    text: `Analiz Kaynağı: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf
                    
                    GÖREV:
                    1. Bu dokümanın 51. maddesini bul. Metnin içine değil, en alttaki DİPNOTLAR kısmındaki kronolojik tabloya odaklan.
                    2. 2024 ve 2025 yıllarında yapılmış olan son değişikliği tespit et.
                    3. Tespit ettiğin EN GÜNCEL oranı ve resmi dayanağını (CK No ve Tarih) raporla.
                    4. Bu oranın 2026 başındaki ekonomik dengelerdeki yerini KOPYA ÇEKMEDEN tamamen kendi mantığınla yorumla.
                    5. Eğer PDF'i okuyamıyorsan veya veriye ulaşamıyorsan uydurma veri üretme, 'veriye ulaşamadım' yaz.

                    Yanıtı sadece JSON olarak ver:
                    {
                      "tespit_edilen_oran": "...",
                      "dayanak_verisi": "...",
                      "ozgun_ekonomik_analiz": "..."
                    }`
                }]
            }]
        };

        const response = await fetch(`${baseUrl}/${activeModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("Bağımsız rapor oluşturuldu.");
            }
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
