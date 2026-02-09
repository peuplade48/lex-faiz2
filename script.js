const fs = require('fs');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    if (!apiKey) {
        console.error("HATA: GEMINI_API_KEY bulunamadı!");
        process.exit(1);
    }

    try {
        // 1. ADIM: Mevcut modelleri listele ve en uygun olanı (Flash veya Pro) seç
        const listResponse = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const listData = await listResponse.json();
        
        const selectedModel = listData.models.find(m => 
            m.supportedGenerationMethods.includes('generateContent') && 
            m.name.includes('gemini')
        );

        if (!selectedModel) throw new Error("Uygun bir Gemini modeli bulunamadı.");
        console.log(`Kullanılan Model: ${selectedModel.name}`);

        // 2. ADIM: Analitik ve Derinlemesine Tarama Yapan Prompt
        // Burada oran belirtmiyoruz, Gemini'ın dipnotları (yıldızlı alanları) taramasını istiyoruz.
        const prompt = {
            contents: [{
                parts: [{
                    text: `Sen kıdemli bir hukuk ve ekonomi danışmanısın. 
                    Görevin: 6183 sayılı Kanun'un 51. maddesini, madde metninin en altındaki tüm dipnotları (*), parantez içi hükümleri ve 2024'ten bugüne (Şubat 2026) kadar yayımlanmış olan en güncel Cumhurbaşkanı Kararlarını (CK) titizlikle taramak.
                    
                    Analiz Talimatı:
                    1. 51. maddedeki gecikme zammı oranının şu an (2026 yılı başı itibarıyla) yürürlükte olan güncel değerini tespit et. (Eski 2024 verilerinde takılı kalma, mevzuat dipnotlarındaki son güncellemeyi bul).
                    2. Bu oranı piyasa faiz oranları ve enflasyon konjonktürü ile kıyaslayarak özgün bir ekonomik yorum yap.
                    3. Tespit ettiğin oranın hangi Resmi Gazete bilgisine veya Cumhurbaşkanı Kararına dayandığını belirt.
                    
                    Yanıtı sadece aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
                    {
                      "kanun_madde": "6183 / 51",
                      "tespit_edilen_guncel_oran": "%...",
                      "dayanak_mevzuat": "...",
                      "ekonomik_analiz_ve_yorum": "...",
                      "tarih": "${new Date().toISOString().split('T')[0]}"
                    }`
                }]
            }]
        };

        // 3. ADIM: API İsteğini Gönder
        const genResponse = await fetch(`${baseUrl}/${selectedModel.name}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const genData = await genResponse.json();
        if (genData.error) throw new Error(genData.error.message);

        const textResponse = genData.candidates[0].content.parts[0].text;
        
        // JSON formatını temizle (Markdown tag'lerini ayıkla)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const finalJson = jsonMatch[0];
            fs.writeFileSync('report.json', finalJson);
            console.log("BAŞARILI: Analitik rapor 'report.json' dosyasına yazıldı.");
            console.log("Rapor İçeriği:", finalJson);
        } else {
            console.error("HATA: Gemini JSON formatında yanıt dönmedi.");
            console.log("Ham Yanıt:", textResponse);
            process.exit(1);
        }

    } catch (err) {
        console.error("KRİTİK HATA:", err.message);
        process.exit(1);
    }
}

run();
