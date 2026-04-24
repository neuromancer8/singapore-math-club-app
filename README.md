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
4. esegui il deploy

Ogni nuovo push su `main` aggiorna automaticamente il sito.

## Account seed

- `laura.rossi@demo-rotary.it / admin` - famiglia demo 1
- `paolo.bianchi@demo-rotary.it / marco123` - famiglia demo 2

## Fase 2 suggerita

- email reale per il genitore con recupero password
- ruoli separati genitore / docente
- sincronizzazione cloud completa dei progressi multi-dispositivo
- profili multipli per famiglia o classe
- analytics più dettagliate per docente
- contenuti adattivi in base agli errori
