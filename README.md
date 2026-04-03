## Singapore Math Club

Applicazione MVP in italiano per bambini della primaria che lavorano con il Singapore Math Method.

## Funzionalità attuali

- accesso locale demo con `admin / admin`
- percorsi separati per `seconda`, `terza`, `quarta`
- esercizi JSON locali
- sessioni brevi con stelle, badge e feedback
- storico progressi per classe
- dashboard genitori e docenti

## Installazione

```bash
pnpm install
```

oppure:

```bash
npm install
```

## Avvio locale

```bash
pnpm dev
```

Apri poi `http://localhost:3000` oppure la porta mostrata dal terminale.

## Build produzione

```bash
pnpm build
pnpm start
```

## Deploy su Vercel

1. collega il repository GitHub a Vercel
2. importa il progetto
3. lascia `Next.js` come framework
4. esegui il deploy

Ogni nuovo push su `main` aggiorna automaticamente il sito.

## Credenziali demo

- username: `admin`
- password: `admin`

## Fase 2 suggerita

- autenticazione con database utenti
- sincronizzazione cloud dei progressi
- profili multipli per famiglia o classe
- analytics più dettagliate per docente
- contenuti adattivi in base agli errori
