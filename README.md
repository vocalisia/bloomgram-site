# Bloomgram — Clone SaaS PathSocial (anti-copyright)

> Plateforme de croissance Instagram organique propulsée par IA.
> Clone fonctionnel de pathsocial.com avec rebranding complet (nom + couleurs + textes paraphrasés).

## Statut: MOCKUP STATIQUE COMPLET — prêt pour développement backend

---

## 🎯 Ce qui est cloné

### Site marketing (8 pages)
- `index.html` — landing avec hero, features, témoignages, FAQ, CTA
- `pricing.html` — 3 plans (Seed/Bloom/Forest) + multi-currency (EUR/USD/GBP/CHF/CAD) + tableau comparatif 14 features
- `case-studies.html` — études de cas + influenceurs + 1 cas détaillé
- `reviews.html` — 9 témoignages + filtres par niche (12 catégories)
- `resources.html` — blog 9 articles
- `login.html` — auth email/password + Google/FB OAuth
- `signup.html` — flow 2 étapes (handle+email → CC+Apple Pay+coupon) avec récap live
- `growth.html` — outil estimateur croissance (lead magnet)

### SaaS Dashboard (7 pages)
- `dashboard/index.html` — vue d'ensemble (KPIs + graphique 30j + activité IA + sources)
- `dashboard/targeting.html` — config ciblage IA (niches, hashtags, concurrents, géo, démo)
- `dashboard/activity.html` — journal d'activité complet (mises en avant, newsletters, IA)
- `dashboard/audience.html` — démographie (âge, pays, intérêts)
- `dashboard/settings.html` — config compte
- `dashboard/billing.html` — facturation Stripe (plan, méthode, historique)
- (à compléter: content.html, competitors.html)

---

## 🛡️ Anti-copyright

| Élément | PathSocial | Bloomgram |
|---|---|---|
| Nom | Path Social | **Bloomgram** |
| Couleurs | Rose #ff2e63 + orange | **Violet #7c3aed + teal #06b6d4** |
| Logo | "Path" wordmark | **🌱 B mark** (gradient) |
| Hero copy | "Real, Organic Instagram Followers" | **"Votre Instagram fleurit en abonnés authentiques"** |
| Plans | Core / Elite | **Seed / Bloom / Forest** |
| Témoignages | @modernfit, @JohnGrant, @Daniela | **@studio.olive, @maison.kero, @elsa.flow** (paraphrasés) |
| Tagline | "AI targeting" | "Ciblage IA contextuel" |
| Garantie | "Guaranteed results" | "Garantie satisfait ou mois offert" |
| Police | Inter | **Plus Jakarta Sans** |

Tous les textes sont **paraphrasés**, aucun copier-coller direct.

---

## 🔧 Stack actuel (mockup)

- HTML5 statique
- CSS3 vanilla (variables, grid, flexbox)
- Vanilla JS (countdown, toggle prix, simulation IA)
- Polices: Plus Jakarta Sans (Google Fonts)
- 0 dépendance build

**Test local:**
```bash
cd C:\tmp\bloomgram
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ou ouvrir directement `index.html` dans le navigateur.

---

## 🚀 Roadmap pour passer en SaaS réel

### Stack recommandé (modernisation vs PathSocial)

| Layer | PathSocial actuel | Bloomgram cible |
|---|---|---|
| Marketing | WordPress + Elementor | **Next.js 16** (déjà mockup) |
| App / Dashboard | WordPress + jQuery | **Next.js 16 + shadcn/ui** |
| Auth | WP users | **Supabase Auth** (magic link) |
| DB | MySQL (WP) | **Supabase Postgres + pgvector** |
| Subscription | Recurly | **Stripe** (Customer Portal natif) |
| Email | Customer.io | **Resend** + **Brevo** |
| Affiliate | GrowSurf + CJ | **GrowSurf** ou **Tapfiliate** |
| Geo | GeoPlugin | **Vercel Edge geo** (built-in) |
| WAF | Cloudflare | **Vercel** + **Cloudflare** front |
| IG scraping | (inconnu) | **Apify** Instagram Scrapers |
| AI matching | (claim) | **OpenAI embeddings** + pgvector + classifier |
| Background jobs | WP cron | **BullMQ + Upstash Redis** |

### Phases d'implémentation (40 jours)

**Phase 1 — Foundation (J1-3)**
- [ ] Init repo Next.js 16 TS + Tailwind + shadcn/ui
- [ ] Supabase project + schema (voir `REVERSE-ENGINEERING.md` §6)
- [ ] Stripe account + 3 produits (Seed €24/mo, Bloom €34/mo, Forest €49/mo) + webhooks
- [ ] Variables env: Apify token, OpenAI key, Resend key

**Phase 2 — Signup & Billing (J4-7)**
- [ ] `/pricing` avec geo-detect (Vercel Edge `request.geo`)
- [ ] `/signup?plan=X` 2-step (handle+email → Stripe Elements + Apple Pay + coupon)
- [ ] Webhook `checkout.session.completed` → create user + subscription
- [ ] Customer Portal redirect

**Phase 3 — Onboarding IA (J8-12)**
- [ ] Wizard ciblage (niche / hashtags / concurrents / géo / démo)
- [ ] Apify call → first IG snapshot (bio + 12 posts)
- [ ] OpenAI `text-embedding-3-small` → pgvector
- [ ] Welcome email Resend séquence (3 mails sur 7j)

**Phase 4 — Dashboard live (J13-20)**
- [ ] KPI cards (followers, engagement, vues, conversions)
- [ ] Recharts growth chart 30j
- [ ] Engagement sources card
- [ ] Followers by country (plan-gated, Bloom+)
- [ ] Activity log table (manual entry initially)

**Phase 5 — Backend workers (J21-30)**
- [ ] BullMQ + Upstash Redis
- [ ] Cron daily IG re-scrape (Apify)
- [ ] Daily metrics aggregation
- [ ] Activity scheduler (CM ops admin UI)

**Phase 6 — Polish & launch (J31-40)**
- [ ] Pages reviews/cases/resources avec MDX
- [ ] Outil `/growth/` lead magnet (clone du PathSocial Growth)
- [ ] Live chat (Crisp ou Intercom)
- [ ] Affiliate Tapfiliate
- [ ] Cloudflare front + Vercel deploy
- [ ] Launch

---

## 💾 Schema DB (Supabase Postgres + pgvector)

Voir `REVERSE-ENGINEERING.md` §6 pour le schema SQL complet (15 tables).

Tables clés:
- `users`, `ig_profiles`, `ig_snapshots`
- `plans`, `subscriptions`, `invoices`, `coupons`
- `targets`, `niches`, `target_audience_profiles` (avec pgvector embedding)
- `candidate_followers`, `activities`
- `influencers`, `shoutouts`, `newsletters`, `newsletter_features`
- `engagement_sources`, `followers_by_country`
- `referrals`

---

## ⚠️ Considérations légales

1. **Instagram TOS**: scraping en zone grise. Utiliser Apify (conformité côté Apify).
2. **Pas d'OAuth IG, pas de mot de passe** (claim majeur de PathSocial — à conserver)
3. **GDPR**: bios + handles = data perso → DPA + privacy policy
4. **Pas affilié à Meta/Instagram** — disclaimer obligatoire (présent dans footers)
5. **Garantie remboursée 7 jours** — clause CGU explicite

---

## 📊 Risques claims marketing

PathSocial annonce:
- "13 000 influenceurs in-network" → probablement gonflé. Démarrer avec **50-100 partenaires** réels.
- "9M abonnés newsletter" → probablement somme cumulée d'abonnés sur plusieurs newsletters niches. Démarrer avec **1-2 newsletters maison** (10-50K subs réels).
- "AI targeting" = en réalité OpenAI embeddings + cosine similarity + heuristiques. Pas du ML lourd. **Wrapper marketing.**

→ Pour Bloomgram, calibrer les claims sur les capacités réelles dès le lancement.

---

## 📁 Structure fichiers

```
bloomgram/
├── README.md (ce fichier)
├── REVERSE-ENGINEERING.md (rapport complet de reverse-engineering PathSocial)
├── index.html
├── pricing.html
├── case-studies.html
├── reviews.html
├── resources.html
├── signup.html
├── login.html
├── growth.html
├── dashboard/
│   ├── index.html
│   ├── targeting.html
│   ├── activity.html
│   ├── audience.html
│   ├── settings.html
│   └── billing.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── img/
└── research/
    ├── 01-pricing.png ... 07-getstarted-step1.png
    ├── getstarted.html (HTML brut signup PathSocial)
    ├── recurly-theme.js (SDK Recurly)
    └── sitemap.xml
```

---

## 🎬 Quick start dev backend

```bash
# 1. Repo Next.js
npx create-next-app@latest bloomgram-app --typescript --tailwind --app

# 2. Dépendances
cd bloomgram-app
npm install @supabase/supabase-js stripe @stripe/stripe-js
npm install openai apify-client bullmq ioredis resend
npm install recharts lucide-react @radix-ui/react-* class-variance-authority

# 3. shadcn/ui
npx shadcn-ui@latest init

# 4. Supabase migration
# (voir REVERSE-ENGINEERING.md §6 pour SQL complet)

# 5. Variables env
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
OPENAI_API_KEY=...
APIFY_TOKEN=...
RESEND_API_KEY=...
UPSTASH_REDIS_URL=...
EOF

# 6. Dev
npm run dev
```

---

## 📝 Licence

Mockup à usage personnel/éducatif. Le clone fonctionnel devra:
- Avoir ses propres CGU et politique de confidentialité
- Être enregistré comme entité juridique
- Souscrire à une assurance RC pro
- Disclaimer non-affiliation Meta/Instagram

---

**Auteur**: Laurent Duplat / VAULT 369 LTD
**Date**: 2026-04-25
**Source**: Reverse-engineering pathsocial.com (rapport complet dans `REVERSE-ENGINEERING.md`)
