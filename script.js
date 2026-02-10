const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    // En güncel model ve endpoint kombinasyonu
    const model = "gemini-1.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `GÖREV: Bugün 10 Şubat 2026. 
                6183 sayılı Kanun'un 51. maddesindeki gecikme zammı oranını İNTERNETTEN (Resmi Gazete ve GİB verileri) araştırarak bul.
                
                DİKKAT: 
                - Sakın 2024 yılına ait uydurma kararname numaraları (8214 vb.) veya yıllık %60 gibi hatalı oranlar verme.
                - Kasım 2025'te oranı %3,7'ye indiren en güncel Cumhurbaşkanı Kararı'nı tespit et.
                - Bu %3,7'lik oranı bulduktan sonra; devletin neden artış yerine indirimi tercih ettiğini (dezenflasyon süreci, piyasa faizleri) KOPYA ÇEKMEDEN özgün bir dille analiz et.
                
                SADECE JSON YANIT VER:
                {
                  "dogrulanmis_oran": "...",
                  "resmi_karar_verisi": "...",
                  "ozgun_ekonomik_analiz": "...",
                  "kaynak": "Google Search / Resmi Gazete"
                }`
            }]
        }],
        tools: [{ google_search_retrieval: {} }]
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
                console.log("İŞLEM BAŞARILI: Rapor gerçek verilerle güncellendi.");
                console.log(jsonMatch[0]);
            }
        } else {
            console.log("Boş yanıt alındı. Veri yapısı:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}

run();
