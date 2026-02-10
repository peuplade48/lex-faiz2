name: Gecikme Zammı Güncelleyici

on:
  # 1. PHP/JS Arayüzünden gelen sinyal için
  repository_dispatch:
    types: [disaridan-tetikleme]

  # 2. GitHub panelinden manuel çalıştırmak için
  workflow_dispatch:

  # 3. Her gece otomatik kontrol için (Opsiyonel)
  schedule:
    - cron: '0 0 * * *'

jobs:
  update-rate:
    runs-on: ubuntu-latest
    
    # Yazma yetkisi vermezsek "Nothing to commit" hataları devam eder
    permissions:
      contents: write

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: |
          # Eğer node_modules yoksa fetch zaten Node 18+ ile yerleşik gelir
          # Ekstra paket kullanıyorsan buraya ekleyebilirsin

      - name: Run Gemini Research Script
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: node script.js

      - name: Commit and Push Changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          
          # Dosyanın oluşup oluşmadığını kontrol et
          if [ -f report.json ]; then
            git add report.json
            # Sadece değişiklik varsa commit yap, yoksa hata verme
            git commit -m "🤖 AI: Gecikme zammı oranı güncellendi (Sistem Tarihi: 2026)" || echo "Değişiklik yok."
            git push
          else
            echo "Hata: report.json dosyası oluşturulamadı!"
            exit 1
          fi
