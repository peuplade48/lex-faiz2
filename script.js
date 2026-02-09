const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const model = listData.models.find(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')).name;

        // KESİNLİKLE ORAN VEYA KARAR SAYISI VERMİYORUZ. 
        // SADECE PDF'İ OKUYUP ANALİZ ETMESİNİ İSTİYORUZ.
        const prompt = {
            contents: [{
                parts: [{
                    text: `Aşağıdaki bağlantıda bulunan 6183 sayılı Kanun'un resmi PDF metnini incele: 
                    Bağlantı: https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf

                    Görevin:
                    1. Kanunun 51. maddesini bul.
                    2. Madde metnindeki tüm atıfları (parantez içindeki rakamları) takip ederek, sayfanın altındaki veya metnin sonundaki o atıflara ait olan "yıldızlı (*) dipnotları" tek tek oku.
                    3. Bu dipnotlar içerisinde en son tarihli Cumhurbaşkanı Kararı (veya Bakanlar Kurulu Kararı) ile belirlenmiş olan YÜRÜRLÜKTEKİ gecikme zammı oranını tespit et.
                    4. Tespit ettiğin bu oranı, Türkiye'nin güncel ekonomik şartları ve piyasa faizleriyle kıyaslayarak yorumla.

                    Yanıtı sadece şu JSON formatında ver:
                    {
                      "madde_metni_ozeti": "...",
                      "dipnotlardan_tespit_edilen_oran": "...",
                      "dayanak_karar_ve_tarih": "...",
                      "ozgun_ekonomik_yorum": "...",
                      "tarih": "2026-02-09"
                    }`
                }]
            }]
        };

        const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            fs.writeFileSync('report.json', jsonMatch[0]);
            console.log("PDF Analizi Tamamlandı.");
            console.log(jsonMatch[0]);
        }
    } catch (err) {
        console.error("Hata:", err.message);
        process.exit(1);
    }
}

run();
