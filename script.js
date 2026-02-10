const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    try {
        // 1. ADIM: Çalışan modeli tespit et
        const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listRes.json();
        const activeModel = listData.models.find(m => m.name.includes('flash') && m.supportedGenerationMethods.includes('generateContent'));

        if (!activeModel) throw new Error("Uygun model bulunamadı!");

        // 2. ADIM: Dürüstlük Odaklı Prompt
        const url = `${baseUrl}/${activeModel.name}:generateContent?key=${apiKey}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `SİSTEM TARİHİ: 10 Şubat 2026.
                    GÖREV: 6183 sayılı Kanun 51. maddedeki gecikme zammı oranını Google Arama ile tespit et.

                    KRİTİK TALİMATLAR (HAYATİ ÖNEMDE):
                    1. ASLA UYDURMA: Eğer 2025 yılının son çeyreğine (Kasım 2025) ait en güncel Cumhurbaşkanı Kararı'nı ve yeni oranı (%3,7 veya o tarihteki gerçek her ne ise) bulamıyorsan, 'GÜNCEL VERİYE ULAŞAMADIM' yaz. 
                    2. ESKİ VERİ YASAK: Hafızandaki %2,5, %3,5 veya %4,5 gibi eski tarihli oranları "güncelmiş gibi" sunma. Bunlar geçmişte kaldı.
                    3. BELGE ŞARTI: Kararın numarasını (Örn: 10556 sayılı Karar gibi) ve Resmi Gazete tarihini bulamazsan bilgi verme.
                    4. DÜRÜST OL: Tahmin yürütmek veya "olabilir" demek yerine, veriye ulaşamıyorsan bunu net bir şekilde belirt.

                    YANIT FORMATI:
                    - Tespit Edilen Oran: (Emin değilsen 'Tespit edilemedi' yaz)
                    - Dayanak Karar: (Emin değilsen 'Tespit edilemedi' yaz)
                    - Analiz: (Sadece veriden eminsen 2026 ekonomisiyle kıyasla)`
                }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: { 
                temperature: 0 // Yaratıcılığı tamamen kapatır, sadece gerçeklere odaklanır.
            }
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
            console.log("DÜRÜST ANALİZ SONUCU:");
            console.log(output);
            console.log("------------------------------------------");
            fs.writeFileSync('report.json', output);
        }
    } catch (err) {
        console.error("SİSTEM HATASI:", err.message);
    }
}
run();
