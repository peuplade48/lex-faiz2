// script.js içindeki prompt kısmını bu "Arama Odaklı" versiyonla değiştir:
const prompt = {
    contents: [{
        parts: [{
            text: `Sen profesyonel bir hukuk araştırmacısısın. 
            Şu an tarih: 9 Şubat 2026. 
            Görevin: 
            1. 6183 sayılı Kanun 51. madde gecikme zammı oranını internetten (Gelir İdaresi Başkanlığı - gib.gov.tr veya Resmi Gazete) teyit et.
            2. ÖZELLİKLE 2025 yılı sonunda yayımlanan (Kasım 2025 gibi) güncel Cumhurbaşkanı Kararlarına bak.
            3. %3.5 ve %4.5 oranlarının ESKİ olduğunu, güncel oranın %3.70'e çekilip çekilmediğini GİB tablolarından doğrula.
            
            Bulduğun sonucu ve ekonomik yorumu şu JSON formatında ver:
            {
              "tespit_edilen_oran": "...",
              "dogrulanmis_dayanak": "...",
              "yorum": "Neden %3.5 veya %4.5 değil de bu oran? Ekonomik gerekçesiyle açıkla.",
              "kaynak": "gib.gov.tr / Mevzuat Bilgi Sistemi",
              "tarih": "2026-02-09"
            }`
        }]
    }]
};
