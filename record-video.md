# 🎬 Enregistrer des vidéos MP4 des animations Bloomgram

> Pour ads Meta/TikTok/YouTube. Capture vidéo des pages animées via Playwright.

## Option 1 — Playwright (recommandé)

Playwright sait enregistrer des vidéos directement. Setup en 5 min.

### Install

```bash
cd C:\tmp\bloomgram
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

### Script `record.mjs`

```javascript
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('./videos', { recursive: true });

const PAGES = [
  { url: 'https://bloomgram-two.vercel.app/ig-mockup.html',     name: 'ig-mockup',  duration: 30 },
  { url: 'https://bloomgram-two.vercel.app/proof.html',         name: 'proof',      duration: 25 },
  { url: 'https://bloomgram-two.vercel.app/ai-chat.html',       name: 'ai-chat',    duration: 40 },
  { url: 'https://bloomgram-two.vercel.app/comparison.html',    name: 'comparison', duration: 30 },
  { url: 'https://bloomgram-two.vercel.app/platforms.html',     name: 'platforms',  duration: 35 },
];

for (const page of PAGES) {
  console.log(`📹 Recording ${page.name}…`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },          // Desktop
    recordVideo: { dir: './videos', size: { width: 1280, height: 800 } },
  });
  const p = await ctx.newPage();
  await p.goto(page.url, { waitUntil: 'networkidle' });
  // Wait + auto-scroll for full-page capture
  for (let y = 0; y < 4000; y += 120) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);
    await p.waitForTimeout(300);
  }
  // Hold at end
  await p.waitForTimeout(5000);
  await ctx.close();
  await browser.close();
  console.log(`✓ ${page.name}.webm saved`);
}
console.log('\n📦 All videos saved in ./videos/ as .webm');
console.log('Convert to MP4: ffmpeg -i videos/X.webm -c:v libx264 -crf 23 X.mp4');
```

### Lance

```bash
node record.mjs
# Génère ./videos/*.webm
```

### Convertir en MP4 + format vertical (TikTok/Reels)

```bash
# WebM → MP4
ffmpeg -i videos/page-N.webm -c:v libx264 -crf 23 -c:a aac videos/page-N.mp4

# Crop vertical 9:16 (TikTok/Reels) pour mobile
ffmpeg -i videos/page-N.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -crf 23 videos/page-N-vertical.mp4

# Format carré 1:1 (Instagram feed)
ffmpeg -i videos/page-N.mp4 -vf "crop=ih:ih,scale=1080:1080" -c:v libx264 -crf 23 videos/page-N-square.mp4
```

## Option 2 — Capture screen Windows

### Game Bar (Windows + G)

1. **Windows + G** sur la page Bloomgram ouverte plein écran
2. Clic enregistrement (cercle rouge)
3. Scroll lentement la page
4. **Stop** après 30 sec
5. Vidéo dans `Videos\Captures\`

### OBS Studio (qualité pro)

```bash
# Install via winget
winget install OBSProject.OBSStudio

# Config:
# - Source: Display Capture (écran)
# - Resolution: 1920x1080
# - Output: MP4
# - Bitrate: 6000 Kbps
# - FPS: 60
```

## Option 3 — Vercel og:image preview

Pour previews de partage sur réseaux:

```html
<!-- Ajouter dans <head> de chaque page -->
<meta property="og:image" content="https://bloomgram-two.vercel.app/preview.png">
<meta property="og:type" content="website">
<meta property="og:title" content="Bloomgram — Croissance Instagram organique">
<meta property="twitter:card" content="summary_large_image">
```

## Recommandations format pour ads

| Plateforme | Format | Résolution | Durée idéale |
|---|---|---|---|
| **Meta Reels** | 9:16 vertical | 1080×1920 | 15-30s |
| **TikTok** | 9:16 vertical | 1080×1920 | 9-15s |
| **YouTube Shorts** | 9:16 vertical | 1080×1920 | 30-60s |
| **Meta Feed** | 1:1 carré | 1080×1080 | 15s |
| **Stories IG/FB** | 9:16 vertical | 1080×1920 | 15s |
| **YouTube Pre-roll** | 16:9 | 1920×1080 | 6-15s |

## Captures faites par claude (déjà disponibles)

```
C:\tmp\bloomgram\preview-final.png       (home)
C:\tmp\bloomgram\preview-pricing.png     (pricing)
C:\tmp\bloomgram\preview-proof.png       (3 profils)
C:\tmp\bloomgram\preview-ig-mockup.png   (iPhone IG)
C:\tmp\bloomgram\preview-ai-chat.png     (ManyChat-style)
C:\tmp\bloomgram\preview-comparison.png  (10 cartes + cascade)
```

Utilise-les comme **thumbnails** ou **og:image** statiques.

## ⚠️ Notes légales pour ads

1. **Disclaimer simulation** doit rester visible OU mentionné en voice-over
2. **Pas de vraie photo IG** copiée (DMCA + RGPD)
3. **Pas de logo Instagram™ / Meta™** sans accord (utilise icônes 📷 ou IG-style mais pas le vrai logo)
4. **CCC art. L121-1** : pratique commerciale trompeuse interdite si tu présentes les chiffres comme "garantis"
5. **Disclaimer Meta** : "Ce service n'est pas affilié à Instagram™ ni Meta Platforms Inc." OBLIGATOIRE pour ads Meta
