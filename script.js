const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // v1beta sürümünde tam model ismini kullanarak 404 hatasını bypass ediyoruz
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `KAYNAK: https://mevzuat.gov.tr/mevzuat?MevzuatNo=6183&MevzuatTur=1&MevzuatTertip=3

                GÖREV:
                1. Bu bağlantıda yer alan resmi metni ve 'Değişikliklerin İşlendiği Liste' kısmını analiz et.
                2. Gecikme zammı oranında (Madde 51) yapılan en güncel değişikliği, tarihini ve Cumhurbaşkanı Karar numarasını bul.
                3. Bulduğun bu rakamı ve resmi dayanağını raporla.
                4. Bu oranın neden bu seviyede olduğunu, 2026 yılı başındaki ekonomik hedefler çerçevesinde KOPYA ÇEKMEDEN özgün bir dille analiz et.
                5. Eğer veriye kesin olarak ulaşamıyorsan uydurma, 'Veriye ulaşılamadı' yaz.

                YANIT FORMATI (SADECE JSON):
                {
                  "tespit_edilen_oran": "...",
                  "resmi_dayanak": "...",
                  "ozgun_ekonomik_analiz": "..."
                }`
            }]
        }],
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
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fs.writeFileSync('report.json', jsonMatch[0]);
                console.log("Analiz tamamlandı. report.json güncellendi.");
            }
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
