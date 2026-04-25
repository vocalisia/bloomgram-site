# PathSocial Reverse Engineering — Rapport Complet

> Mission: cloner le SaaS PathSocial (pas seulement marketing). Stack réel découvert + plan implementation.
> Date: 2026-04-25
> Source: scraping pages publiques (`pricing/`, `getstarted/`, `growth/`, `flash-sale/`, `casestudies/`, `resources/`, `login/`) + analyse HTML/JS app.pathsocial.com.

---

## 1. STACK TECHNIQUE RÉEL DE PATHSOCIAL (decoded from HTML/JS)

### 1.1 Stack actuelle PathSocial (pas Next.js!)

| Layer | Technologie | Source |
|---|---|---|
| Marketing site | **WordPress + Elementor** | meta `Elementor 3.33.0`, theme `path-social` (child de `hello-elementor`) |
| App / signup / dashboard | **WordPress** sur `app.pathsocial.com` | `wp-admin/admin-ajax.php` confirmé |
| Page builder | Elementor 3.33.0 + Premium Addons | CSS bundles |
| Payment / Subscription | **Recurly** (PAS Stripe!) | `recurly_public_key: ewr1-pyjqdzh3pcXBqIkhwFu40V`, `recurly.js` SDK officiel |
| Apple Pay | Recurly Apple Pay button | `<div class="apple-pay-button">` |
| CRM / Email automation | **Customer.io** | `data-site-id: 954f865ce77be99a5800` |
| Affiliate / Referral | **GrowSurf** (programme `vehe7m`) + **CJ (Commission Junction)** (`enterpriseId: 1564039`) | scripts inline |
| Geo IP / currency | **GeoPlugin** (`ssl.geoplugin.net/javascript.gp?k=fbd1dd6140c53ccb`) | client-side currency switch |
| WAF / CDN | **Cloudflare** (challenge sur tous endpoints) | `Server: cloudflare`, `cf-ray` |
| Frontend (forms) | jQuery 3.7.1 + Recurly Elements | inline form `#ps-payment` |
| Lost-password | plugin `frontend-reset-password` | CSS bundle |
| Multilingue | plugin `if-menu` + URL `/fr/`, `/en/` | observed redirects |

### 1.2 Pages accessibles (publiques)

| URL | Statut | Contenu |
|---|---|---|
| `/pricing/` | 200 | 2 plans (Core/Elite) — variation A |
| `/flash-sale/` | 200 | 3 plans (Core/Elite/Expert) — variation B |
| `/login/` | 200 | form email + password |
| `/growth/` | 200 | demo dashboard (preview public) |
| `/casestudies/` | 200 | témoignages |
| `/resources/` | 200 | blog SEO |
| `/about/`, `/affiliate/`, `/checkout/` | **404** | n'existent pas |
| `app.pathsocial.com/getstarted/` | 200 | signup form REAL |
| `app.pathsocial.com/dashboard` | redirect login | auth-gated |

---

## 2. SIGNUP FLOW RÉEL (analysé)

### 2.1 Étape 1 — Pré-checkout (`/getstarted/?plan=elite`)

**Form HTML capté:**
```html
<form id="ps-payment">
  <div id="pathsocial-insta">
    <input type="text" required name="pathso_ig_username" placeholder="oprah">
    <input type="email" required name="user_email">
    <button class="pathsocial-payment-email-submit">Continue</button>
  </div>
  <div id="pathsocial-payment" style="display:none;">
    <input type="text" data-recurly="first_name">
    <input type="text" data-recurly="last_name">
    <div id="recurly-elements"><!-- CC fields --></div>
    <input type="hidden" data-recurly="token">
    <input type="hidden" data-recurly="coupon">
    <div class="apple-pay-button"></div>
    <button data-id="payment">Grow My Instagram!</button>
  </div>
</form>
```

**Champs demandés (étape 1):**
- `pathso_ig_username` (Instagram handle, format `@username`, validation client-side avec preview profile pic via API publique IG ou scraping)
- `user_email`

**Champs étape 2 (post Continue):**
- First Name + Last Name
- Carte de crédit (via Recurly Elements — tokenisée côté client, jamais touche le serveur)
- Coupon code (optionnel)
- Apple Pay alternative

**PAS d'Instagram OAuth.** Username manuel uniquement. Le profile picture est fetché probablement via un endpoint public (Instagram graphql sans auth, ou un scraper interne).

### 2.2 Étape 2 — Paiement (Recurly)

- Currency: auto-détectée via GeoPlugin (USD, EUR, GBP, CHF, JPY, INR, NOK, PHP, CZK, PLN, HUF, MXN, THB, DKK, RUB)
- Recurly Token créé côté client → submit AJAX vers `wp-admin/admin-ajax.php` avec `action=create_subscription` (action exacte non publique mais conventionnel WP)
- WordPress crée user + lie au customer Recurly + crée subscription
- Redirect dashboard

### 2.3 Pricing matrix multi-currency (extrait JSON inline)

```json
{
  "USD": {"core": 49,  "elite": 69,  "core_main": 79,  "elite_main": 99},
  "EUR": {"core": 42,  "elite": 59,  "core_main": 54,  "elite_main": 76},
  "GBP": {"core": 36,  "elite": 51,  "core_main": 46,  "elite_main": 66},
  "CHF": {"core": 45,  "elite": 63,  "core_main": 58,  "elite_main": 81},
  "JPY": {"core": 5555, "elite": 7800, "core_main": 7221, "elite_main": 10140},
  "INR": {"core": 3600, "elite": 5100, "core_main": 4680, "elite_main": 6630}
}
```

Note: `_main` = prix barré (ancre psychologique). Plus une variante 3-tiers existe (Core/Elite/Expert) sur `/flash-sale/` — Expert max ~$102/mo.

### 2.4 Garantie / Acquisition

- 7-day money-back
- "Résultats garantis ou remboursés"
- Pricing affichage `/jour` (ex: `€1.13/jour`) pour réduire friction
- Annual billing → -50% (incentive massif)
- Countdown timer "augmentation prix demain" (urgence artificielle, persistante)

---

## 3. DASHBOARD — KPIs RÉELS (depuis demo `/growth/`)

### 3.1 Sections visibles

1. **Header user**: avatar IG + handle + plan name + 3 stats (Followers, Following, Posts)
2. **Croissance prévue 30 jours** → graphique line (Daily/Weekly/Monthly toggle)
3. **Sources d'engagement**:
   - Organique
   - Discover/Explore page
   - Recherche
   - DM Share
   - Hashtags
4. **Tendances engagement**:
   - Total Engagements
   - Post Views/Day
   - Profile Views/Day
   - Reach
5. **Followers par pays** (Europe/US/Asia/Australia/Canada %)
6. (Inférée) **Activity log**: shoutouts, newsletters, outreach

### 3.2 Filtres targeting (depuis copy marketing)

- Hashtags (manual entry)
- Concurrents (handles à mimic)
- Géo (pays/ville)
- Démographie (âge, genre)
- Niche (preset list: Sport, Mode, Photo, Musique, Pets, Bloggers, Chefs, Influenceurs, Marques)

### 3.3 Activity types (claims)

- **Shoutouts d'influenceurs** (claim: 13 000 influenceurs in-network) — **probablement marketplace partielle + service manuel** (CM team)
- **Newsletters** (claim: 9M abonnés) — **probablement aggregate de plusieurs newsletters thématiques achetées + claim gonflé**
- **Outreach** (DM/comments organiques)
- **Targeting AI** — voir section 4

---

## 4. "AI TARGETING" — DÉCONSTRUCTION

### 4.1 Claim marketing
> "AI targeting algorithm finds organic followers most likely to engage with your unique content and niche"

### 4.2 Faisabilité technique réelle

PathSocial existe depuis 2019 et leur API marketing dit "depuis 10 ans". Le claim "AI" date de leur copy 2021. Stack probable réel:

1. **Scraping Instagram** (puisque pas d'API OAuth visible) via:
   - Instagram Basic Display API (limitée)
   - Scrapers headless (Puppeteer/Selenium farm)
   - Services tiers (Apify, Bright Data, Phantombuster)
2. **Targeting "AI"** = règles + heuristiques + un peu de NLP:
   - Embeddings caption/bio (OpenAI / sentence-transformers)
   - Cosine similarity entre niche du client et bio des cibles
   - Filtres règles dures (followers count range, engagement rate, posting frequency, geo)
3. **Action engine** = service backend (cron/queue) qui:
   - Identifie cibles → planifie shoutouts/likes/comments via influenceurs partenaires (in-network)
   - Track les nouveaux followers/engagement via re-scraping périodique
4. **Pas d'automation Instagram directe** (claim explicite "we don't ask for password, no follow/unfollow") → confirme que la valeur est dans **partenariats influenceurs + newsletters payantes**, pas dans l'automation bot.

### 4.3 Verdict
- "13 000 influenceurs" = probablement DB d'influenceurs micro/nano avec accord pré-payé pour shoutouts thématiques
- "9M abonnés newsletter" = somme d'abonnés sur plusieurs niches gérées en interne ou achetées
- "AI" = couche de classification + matching, pas du ML lourd
- Stack ML réel probable: OpenAI embeddings + Postgres pgvector OR Pinecone + un classifier sklearn pour scorer

---

## 5. ARCHITECTURE PROBABLE BACKEND PATHSOCIAL

```
┌──────────────────────────────────────────────────────────────┐
│ Cloudflare (WAF, CDN, challenge)                              │
└──────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
   ┌─────────────────────┐       ┌─────────────────────────┐
   │ www.pathsocial.com  │       │ app.pathsocial.com      │
   │ WordPress (marketing)│       │ WordPress (theme:       │
   │ Elementor blog/SEO  │       │   path-social)          │
   └─────────────────────┘       │ - signup form           │
                                  │ - login                 │
                                  │ - dashboard (admin-ajax)│
                                  │ - account mgmt          │
                                  └────────┬────────────────┘
                                           │
              ┌────────────────┬───────────┼────────────────┬──────────────┐
              ▼                ▼           ▼                ▼              ▼
        ┌──────────┐    ┌──────────┐ ┌──────────┐ ┌────────────────┐ ┌──────────┐
        │ Recurly  │    │Customer.io│ │GrowSurf  │ │ IG scraping     │ │  CJ      │
        │ (subs)   │    │(email/CRM)│ │(referral)│ │ workers (queue) │ │(affiliate)│
        └──────────┘    └──────────┘ └──────────┘ └────────────────┘ └──────────┘
                                                          │
                                                          ▼
                                            ┌─────────────────────────┐
                                            │ Backend service (Python │
                                            │ /Node) — targeting,     │
                                            │ matching, action planner│
                                            └────────────┬────────────┘
                                                         ▼
                                            ┌─────────────────────────┐
                                            │ Influencer marketplace   │
                                            │ (internal DB, manual ops)│
                                            └─────────────────────────┘
```

---

## 6. MODÈLE DE DONNÉES CIBLE (pour clone)

### 6.1 Tables principales

```sql
-- USERS / AUTH
users(id, email, ig_handle, first_name, last_name, password_hash, created_at)

-- SUBSCRIPTIONS
plans(id, code, name, price_usd, price_eur, ..., features_json, follower_min, follower_max)
subscriptions(id, user_id, plan_id, status, started_at, current_period_end,
              recurly_subscription_uuid, recurly_customer_uuid, currency)

-- IG PROFILE
ig_profiles(id, user_id, handle, profile_pic_url, bio, follower_count, following_count, post_count, last_synced_at)
ig_snapshots(id, ig_profile_id, taken_at, follower_count, engagement_rate, post_count, reach, profile_views)

-- TARGETING
targets(id, user_id, type[hashtag|competitor|geo|niche], value, weight, created_at)
niches(id, label, parent_id) -- preset list

-- AI / SCORING
target_audience_profiles(id, user_id, embedding VECTOR(1536), niches_json, geo_json, demo_json)
candidate_followers(id, user_id, ig_handle, score, matched_at, reason_json)

-- ACTIVITIES
activities(id, user_id, type[shoutout|newsletter|outreach|engagement],
           influencer_id NULL, newsletter_id NULL, scheduled_at, executed_at,
           status, result_json)

-- INFLUENCER MARKETPLACE
influencers(id, ig_handle, follower_count, niche_ids, geo, price_per_shoutout, available)
shoutouts(id, influencer_id, user_id, scheduled_at, executed_at, post_url, metrics_json)

-- NEWSLETTERS
newsletters(id, niche_id, name, subscriber_count, send_day_of_week)
newsletter_features(id, newsletter_id, user_id, scheduled_send_date, status)

-- ENGAGEMENT METRICS
engagement_sources(id, user_id, source[organic|discover|search|dm|hashtag],
                   period_start, period_end, count)
followers_by_country(id, user_id, country_code, count, snapshot_date)

-- BILLING
invoices(id, subscription_id, amount, currency, status, recurly_invoice_uuid, paid_at)

-- REFERRALS
referrals(id, referrer_user_id, referred_email, status, growsurf_id, reward_status)

-- COUPONS
coupons(id, code, discount_pct, valid_from, valid_to, max_uses)
```

### 6.2 Embeddings table (pgvector)

```sql
CREATE EXTENSION vector;
ALTER TABLE target_audience_profiles ADD COLUMN embedding VECTOR(1536);
CREATE INDEX ON target_audience_profiles USING hnsw (embedding vector_cosine_ops);
```

---

## 7. STACK RECOMMANDÉE POUR CLONER (modernisation)

| Layer | PathSocial actuel | Clone recommandé (Bloomgram) |
|---|---|---|
| Frontend marketing | WordPress + Elementor | **Next.js 16 (App Router)** + Tailwind + MDX (déjà cloné) |
| App / dashboard | WordPress + jQuery | **Next.js 16** + shadcn/ui + Recharts |
| Auth | WP users | **Supabase Auth** (email + magic link) |
| DB | MySQL (WP) | **Supabase Postgres** + pgvector |
| Subscription | Recurly | **Stripe** (Subscriptions + Customer Portal) — moderne, mieux DX |
| Email automation | Customer.io | **Resend** + **Brevo** (séquences) ou Customer.io si budget |
| Affiliate | GrowSurf + CJ | **GrowSurf** (€20/mo MVP) ou **Rewardful** |
| Geo / currency | GeoPlugin | **Vercel Edge geo** (free, built-in via `req.geo`) |
| WAF | Cloudflare | **Vercel** (built-in DDoS) ou **Cloudflare** front |
| IG scraping | unknown | **Apify Instagram Scrapers** (déjà clé) + queue BullMQ |
| AI targeting | unknown | **OpenAI embeddings** (text-embedding-3-small) + pgvector + classifier |
| Queue / background | WP cron | **BullMQ** + Redis (Upstash) ou **Inngest** |
| Influencer DB | manual | Postgres table + admin UI |

### 7.1 Avantages Stack moderne
- DX 10x mieux (TypeScript end-to-end)
- Vercel deploy 1-click
- Supabase scale auto
- Stripe Customer Portal gratuit (annul/upgrade self-serve)
- Edge functions pour geo/currency = ~0ms

---

## 8. FLOW UTILISATEUR COMPLET (à implémenter)

### 8.1 Onboarding (signup → first results)

```
[Marketing /pricing] → [/signup?plan=X]
       ↓
[Step 1: IG handle + email]
   ↓ (preview profile pic via Apify scraper, validate handle exists)
[Step 2: Card details (Stripe Elements)]
   ↓ (create Stripe Customer + Subscription)
[Step 3: Targeting wizard]
   - Pick niche (multi-select)
   - Add competitors (3-10 IG handles)
   - Add hashtags (5-20)
   - Geo (countries)
   - Demo (age range, gender)
   ↓ (compute embedding + store target_audience_profile)
[Step 4: AI Profile Analysis (loading screen 30-60s)]
   - Scrape user IG via Apify
   - Compute embedding of bio + last 12 posts
   - Generate "growth forecast" (deterministic from baseline + plan tier)
   ↓
[Dashboard: empty state + first action scheduled]
   - Background worker: queue first shoutout for tomorrow
   - Background worker: schedule newsletter feature for next send
   - Customer.io: trigger welcome sequence
```

### 8.2 Steady-state

```
Daily cron:
- Re-scrape user IG → snapshot
- Compute follower delta, engagement rate
- Update dashboard metrics
- Trigger next batch of activities

Weekly:
- Newsletter feature
- Email digest "Your week in growth"
- Re-tune targeting based on new followers
```

---

## 9. FEATURE LIST PAR PRIORITÉ

### MVP (semaines 1-4) — pour valider revenue

- [ ] Marketing site cloné (DÉJÀ FAIT, partiellement)
- [ ] Pricing page avec multi-currency (geo-detect)
- [ ] Signup form 2-step (IG handle + email → CC)
- [ ] Stripe Subscriptions (3 plans: Core / Elite / Expert)
- [ ] Apple Pay button
- [ ] Coupon code support
- [ ] WordPress admin → custom Next.js dashboard
- [ ] Login (Supabase Auth magic link)
- [ ] Dashboard skeleton (KPI cards: followers, engagement, growth chart)
- [ ] IG profile scraping via Apify (one snapshot per signup)
- [ ] Customer.io (or Resend) welcome email
- [ ] Stripe webhook → activate subscription
- [ ] Billing portal link (Stripe-hosted)

### V1 (semaines 5-10) — fonctionnel end-to-end

- [ ] Targeting wizard (niche, hashtags, competitors, geo, demo)
- [ ] AI profile analysis (OpenAI embeddings → pgvector)
- [ ] Daily IG re-scraping cron (BullMQ + Apify)
- [ ] Engagement sources breakdown (organic vs discover vs hashtag — derived from IG insights API or estimated)
- [ ] Followers by country (from IG audience insights, plan-gated)
- [ ] Activity log (shoutouts, newsletters, outreach — initially manual entries)
- [ ] Growth forecast graph (deterministic ML from baseline)
- [ ] Account manager assignment (Elite plan)
- [ ] Live chat (Crisp or Intercom)

### V2 (semaines 11-20) — différenciation

- [ ] Influencer marketplace (DB + matching engine)
- [ ] Manual shoutout scheduling UI (CM ops side)
- [ ] Newsletter network (start with 1-2 thematic niches)
- [ ] Referral program (GrowSurf integration)
- [ ] Affiliate program (CJ or Tapfiliate)
- [ ] Multi-account support (agencies)
- [ ] Mobile-responsive dashboard PWA
- [ ] Public "Check My Growth" preview tool (lead gen — clone du `/growth/`)

### V3 (futur)

- [ ] White-label for agencies
- [ ] Plug TikTok / X / YouTube
- [ ] AI content generator (caption + hashtag suggestions)
- [ ] Real-time targeting via Apify webhooks

---

## 10. PIÈGES & RISQUES

### 10.1 Légal / TOS
- **Instagram TOS**: scraping = zone grise. Path Social s'en sort en disant "no automation, no password" → vrai mais ils scrapent quand même les profils des cibles.
- **Solution**: utiliser Apify scrapers (déjà conformes côté Apify, le risque est sur l'utilisateur)
- **GDPR**: stocker handles + bios = données personnelles → DPA + privacy policy

### 10.2 Faisabilité claims
- "13 000 influenceurs" et "9M newsletter subs" probablement gonflés. Au lancement, démarrer avec 50-100 influenceurs partenaires + 1-2 newsletters maison (10-50k subs réels)
- Le "AI" est un wrapper marketing — l'utilisateur ne verra jamais le ML directement, il verra juste un graphique qui monte. **Important: le forecast doit être réaliste mais optimiste.**

### 10.3 Backend compute
- Re-scraping quotidien de N users IG = coût Apify
- Estimation: 1 scrape complet = ~$0.001 → 10 000 users = $10/jour = $300/mo (rentable vs $50/mo plan)

### 10.4 Recurly vs Stripe
- Recurly = vendor lock plus fort, support DX moins bon
- Migration future Recurly → Stripe = douloureux (PathSocial est coincé)
- **Choisir Stripe d'office pour le clone**

---

## 11. CHECKLIST IMPLEMENTATION ACTIONNABLE

### Phase 1 — Foundation (jour 1-3)
- [ ] `bloomgram/` repo Next.js 16 + TS + Tailwind
- [ ] Supabase project (auth + db)
- [ ] Schema SQL (tables ci-dessus, migrations)
- [ ] Stripe account + 3 products + webhooks
- [ ] Apify token (déjà disponible)
- [ ] OpenAI key (déjà disponible)

### Phase 2 — Signup & Billing (jour 4-7)
- [ ] `/pricing` page avec geo-detect (Vercel Edge geo)
- [ ] `/signup?plan=X` 2-step form
- [ ] Stripe Elements integration
- [ ] Apple Pay button
- [ ] Webhook `checkout.session.completed` → create user + subscription
- [ ] Customer Portal link

### Phase 3 — Onboarding (jour 8-12)
- [ ] Targeting wizard (niche/hashtag/competitor/geo)
- [ ] Apify call → first IG snapshot
- [ ] OpenAI embedding compute
- [ ] Welcome email (Resend)

### Phase 4 — Dashboard (jour 13-20)
- [ ] KPI cards
- [ ] Growth chart (Recharts)
- [ ] Engagement sources card
- [ ] Followers by country (plan-gated)
- [ ] Activity log table
- [ ] Account settings (change plan via Stripe portal)

### Phase 5 — Backend workers (jour 21-30)
- [ ] BullMQ + Upstash Redis
- [ ] Daily re-scraping job
- [ ] Daily metrics aggregation
- [ ] Activity scheduler (manual ops UI for CM team)

### Phase 6 — Polish & launch (jour 31-40)
- [ ] Reviews, casestudies, resources pages (clones marketing)
- [ ] Free tool `/growth/` (lead magnet) — accept handle, return mock dashboard
- [ ] Live chat (Crisp)
- [ ] Affiliate program (Tapfiliate or GrowSurf)
- [ ] Cloudflare front
- [ ] Launch

---

## 12. RESSOURCES CAPTURÉES

Tous les fichiers dans `C:\tmp\bloomgram\research\`:

| Fichier | Description |
|---|---|
| `01-pricing.png` | Pricing page (2 plans Core/Elite, multi-currency) |
| `02-signup.png` | Signup landing |
| `03-login.png` | Login form |
| `04-growth-dashboard-demo.png` | **Demo dashboard public — KPIs visibles** |
| `05-casestudies.png` | Case studies (témoignages) |
| `06-flash-sale.png` | **3 plans (Core/Elite/Expert) + before/after metrics** |
| `07-getstarted-step1.png` | **Form signup réel (étape 1: handle + email)** |
| `getstarted.html` | **HTML brut signup — révèle Recurly, GrowSurf, Customer.io, CJ** |
| `recurly-theme.js` | SDK Recurly officiel (283KB minified) |
| `sitemap.xml` | bloqué Cloudflare WAF |

---

## 13. CONCLUSION & NEXT STEPS

### Ce qu'on sait avec certitude
1. PathSocial = WordPress + Recurly + Customer.io + GrowSurf
2. Signup = 2-step (handle+email → CC Recurly)
3. Pas d'OAuth IG, juste username manuel + scraping interne
4. Pricing dynamique multi-currency client-side via GeoPlugin
5. Dashboard KPIs = follower delta, engagement rate, sources, geo, activity log

### Ce qu'on déduit
1. Backend "AI" = OpenAI embeddings + cosine match + heuristics règles
2. Influencer network = manual ops + DB Postgres
3. Newsletters = quelques newsletters thématiques propres ou achetées
4. Action engine = mix automation (scraping/scoring) + manual (CM team execute shoutouts)

### Ce qu'on ne sait pas
- Plan codes Recurly exacts (cachés derrière auth)
- API endpoints AJAX exacts (minified JS)
- Algorithme exact de scoring AI
- Vrai size de l'influencer DB

### Prochaine action recommandée
Démarrer **Phase 1 du clone** dans `C:\tmp\bloomgram\` avec stack moderne (Next.js + Supabase + Stripe). Réutiliser le marketing déjà cloné, ajouter le `/getstarted/` 2-step form en priorité, puis le dashboard.

**Le clone peut être 10x plus simple en stack moderne (Next.js Server Actions remplacent admin-ajax, Stripe remplace Recurly, Supabase remplace WP DB). Time-to-MVP estimé: 4-6 semaines à plein temps.**
