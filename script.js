const fs = require('fs');
const pdf = require('pdf-parse');

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const pdfUrl = "https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6183.pdf";

    try {
        // 1. ADIM: PDF'i gerçekten indir ve metne dök
        const responsePdf = await fetch(pdfUrl);
        const buffer = await responsePdf.arrayBuffer();
        const pdfData = await pdf(Buffer.from(buffer));
        
        // Sadece son 2000 karakteri (dipnotların olduğu yer) alalım ki Gemini kaybolmasın
        const lastPart = pdfData.text.slice(-3000); 

        // 2. ADIM: Gemini'a bu ham metni ver ve "Buradaki gerçek oranı bul" de
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const prompt = {
            contents: [{
                parts: [{
                    text: `Aşağıdaki metin 6183 sayılı Kanun PDF'inin sonundaki dipnotlar kısmıdır:
                    
                    ---
                    ${lastPart}
                    ---
                    
                    GÖREV:
                    1. Bu metindeki 51. maddeye ilişkin EN SON tarihli değişikliği bul.
                    2. Oranın kaç olduğunu (Kasım 2025 verisi orada olmalı) tespit et.
                    3. Tespit ettiğin rakam üzerinden, neden bu seviyenin seçildiğini KOPYA ÇEKMEDEN özgün bir dille yorumla.
                    4. Sakın uydurma kararname numarası (8214 vb.) verme. Sadece metindeki gerçek numarayı yaz.

                    Yanıt JSON olsun:
                    {
                      "gercek_oran": "...",
                      "dayanak_no": "...",
                      "analiz": "..."
                    }`
                }]
            }]
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await res.json();
        const resultText = data.candidates[0].content.parts[0].text;
        fs.writeFileSync('report.json', resultText.match(/\{[\s\S]*\}/)[0]);
        console.log("Gerçek veri çekildi ve analiz edildi.");

    } catch (err) {
        console.error("Hata:", err.message);
    }
}
run();
