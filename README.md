## Singapore Math Club

Applicazione MVP in italiano per bambini della primaria che lavorano con il Singapore Math Method.

## Funzionalità attuali

- accesso con sessione server-side e cookie httpOnly
- registrazione genitore da interfaccia
- verifica email del genitore e recupero password con token
- profili multipli bambino collegati allo stesso account genitore
- selezione del profilo bambino attivo dopo il login del genitore
- persistenza profilo famiglia e progresso per singolo bambino
- supporto doppio storage:
  - fallback locale su file in sviluppo
  - Postgres tramite `DATABASE_URL` in ambiente cloud
- percorsi separati per `seconda`, `terza`, `quarta`
- esercizi JSON locali
- sessioni brevi con stelle, badge e feedback
- storico progressi per classe
- dashboard genitori e docenti
- dashboard docente multi-alunno da dati cloud
- export reali PDF, CSV e Word dalla dashboard
- revisione pedagogica automatica per moduli, prerequisiti, difficoltà e copertura CPA

## Installazione

```bash
corepack pnpm install
```

oppure:

```bash
npm install
```

## Avvio locale

```bash
corepack pnpm dev
```

Apri poi `http://localhost:3000` oppure la porta mostrata dal terminale.

In locale, se `DATABASE_URL` non è definita, l'app usa un archivio file in `.data/auth-store.json`.

## Build produzione

```bash
corepack pnpm build
corepack pnpm start
```

## Deploy su Vercel

1. collega il repository GitHub a Vercel
2. importa il progetto
3. lascia `Next.js` come framework
4. imposta `DATABASE_URL` se vuoi usare Postgres persistente online
5. per email reali con Resend imposta:
   - `RESEND_API_KEY`
   - `EMAIL_FROM=Singapore Math Club <noreply@singaporemathclub.app>`
   - `NEXT_PUBLIC_APP_URL=https://singaporemathclub.app`
6. in Resend verifica il dominio `singaporemathclub.app` e aggiungi i record DNS richiesti dal pannello Resend
7. esegui il deploy

Ogni nuovo push su `main` aggiorna automaticamente il sito.

## Account seed

- `laura.rossi@demo-rotary.it / admin` - famiglia demo 1
- `paolo.bianchi@demo-rotary.it / marco123` - famiglia demo 2
- `docente@singaporemathclub.app / teacher123` - docente demo

## Stato fase 2

- progressi cloud su PostgreSQL tramite `DATABASE_URL`
- ruoli separati genitore / docente
- profili multipli per famiglia o classe
- analytics docente multi-alunno
- export PDF/CSV/Word
- email reale tramite Resend appena sono presenti `RESEND_API_KEY` e dominio verificato
- contenuti adattivi in base agli errori
