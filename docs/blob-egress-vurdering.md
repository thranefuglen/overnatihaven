# Vurdering: langsigtet løsning på Vercel Blob-egress

Kontekst: Galleri- og hero-billeder serveres direkte fra Vercel Blob. Egress
(data ud) ramte gratis-tierens ~10 GB/måned-loft (juli 2026). Denne PR angriber
problemet med komprimering (nedskalering + WebP), både for eksisterende filer
(`npm run blob:compress`) og som delt helper klar til upload-pathen. Dette
dokument vurderer, om vi bør flytte væk fra Vercel Blob på sigt.

## Hvor stort er problemet efter komprimering?

Komprimering alene skærer typisk hver fil 10-30×. En hero-visning på ~15 MB
falder til ~0,5-1 MB. Med det nuværende trafikniveau (~650 forsidebesøg ramte
loftet) betyder det, at vi lander langt under 10 GB/måned. **For den nuværende
trafik er komprimering sandsynligvis nok** — en migrering er en optimering, ikke
en nødvendighed, medmindre trafikken vokser markant eller vi vil have et fast
loft-frit setup.

## Muligheder

### 1. Bliv på Vercel Blob + komprimering (denne PR)
- **Fordele:** Ingen ny infrastruktur, ingen kodeændring i upload/servering ud
  over den delte helper, ingen ekstra hemmeligheder. Allerede integreret.
- **Ulemper:** Egress er stadig meget-bill't men ikke gratis; ved kraftig vækst
  kan loftet rammes igen. Ingen on-the-fly transformationer (vi bager én
  størrelse ved upload).
- **Egnet når:** Trafik forbliver lav-moderat. Dette er standardanbefalingen.

### 2. Cloudflare R2
- **Model:** S3-kompatibelt object storage med **nul egress-gebyr**; man betaler
  kun for lagring (~$0,015/GB/md) og operationer. Ingen båndbredde-loft.
- **Fordele:** Fjerner egress-bekymringen permanent. Billig lagring. Kan sættes
  bag Cloudflare CDN gratis.
- **Ulemper:** Migrering kræver: nyt SDK (`@aws-sdk/client-s3` eller Cloudflare
  SDK), ombygning af `uploadToBlob`, en bucket + API-tokens som nye
  Vercel-miljøvariabler, og en engangs-kopiering af eksisterende filer + DB
  URL-opdatering (samme mønster som `compress-blobs.ts`). Ingen indbygget
  billedtransformation (medmindre man tilføjer Cloudflare Images oveni).
- **Egnet når:** Vi vil have et permanent egress-frit fundament og er villige
  til én migreringsindsats.

### 3. Cloudinary
- **Model:** Dedikeret billed-CDN med on-the-fly transformationer (resize,
  format, kvalitet via URL-parametre) og auto-WebP/AVIF. Gratis-tier ~25
  "credits" (≈ 25 GB lagring/båndbredde eller transformationer).
- **Fordele:** Ville gøre både komprimering OG thumbnail-varianten overflødig —
  man uploader originalen og henter `.../w_1600,q_auto,f_auto/...` til hero og
  `.../w_400,.../` til grid. Bedst mulige billedhåndtering med mindst kode
  fremadrettet.
- **Ulemper:** Endnu en tredjeparts-konto/leverandør-lock-in. Gratis-tieren har
  også et loft (kan rammes ved vækst, men transformationer strækker det langt).
  Migrering svarer til R2 i indsats.
- **Egnet når:** Vi forventer at ville lave flere billedstørrelser/-varianter og
  vil have det håndteret automatisk frem for i kode.

## Anbefaling

1. **Nu:** Kør `npm run blob:compress` mod produktion for at skære den
   eksisterende egress (denne PR). Overvåg forbruget via Vercel Analytics den
   næste måned.
2. **Fremadrettet (lille opfølgnings-PR):** Kobl den delte `compressImage`-helper
   ind i `uploadToBlob`, så nye uploads også komprimeres automatisk — ellers
   vokser problemet igen ved næste billed-upload. Det er ~2 linjer og bruger
   koden fra denne PR.
3. **Kun hvis trafikken vokser ud over komprimeringens råderum:** Migrér til
   **Cloudflare R2** for permanent nul-egress (simplest mental model, ingen
   leverandør-transformationslogik), eller **Cloudinary** hvis vi på det
   tidspunkt også vil have automatiske billedvarianter. Ingen af delene er
   nødvendige i dag.
