const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Aktif modeli dinamik olarak bul (404 hatasını engellemek için)
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.supportedGenerationMethods.includes('generateContent')).name;

        // 2. ADIM: Tamamen bağımsız analiz
        const prompt = {
            contents: [{
                parts: [{
                    text: `Analiz Kaynağı: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf
                    
                    GÖREV:
                    1. Dokümanın 51. maddesini bul, ancak ana metindeki eski oranlara (metin içindekilere) itibar etme.
                    2. PDF'in EN SONUNDA yer alan "DİPNOTLAR" veya "İŞLENEMEYEN HÜKÜMLER" kısmındaki (*) işaretli kronolojik tabloyu tara.
                    3. 2024 ve 2025 yıllarındaki Cumhurbaşkanı Kararları (CK) arasındaki en son değişikliği tespit et.
                    4. Bulduğun bu EN GÜNCEL oranı ve resmi dayanağını raporla.
                    5. Neden önceki oranlardan farklı bir seviyeye gelindiğini, 2026 başındaki ekonomik hedeflere göre KOPYA ÇEKMEDEN tamamen kendi mantığınla yorumla.

                    Yanıtı sadece JSON olarak ver:
                    {
                      "tespit_edilen_oran": "...",
                      "dayanak_verisi": "...",
                      "analiz_yontemi": "Sadece dipnot taraması yapıldı",
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
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("Bağımsız analiz tamamlandı. report.json güncellendi.");
        }
    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
