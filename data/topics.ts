import type { Grade, Topic } from "@/lib/types";

export const topicsByGrade: Record<Grade, Topic[]> = {
  seconda: [
    { slug: "numeri", label: "Numeri", description: "Conta, ordina e confronta" },
    { slug: "decine-unita", label: "Decine e unità", description: "Costruisci numeri con valore posizionale" },
    { slug: "confronti", label: "Confronti", description: "Maggiore, minore e uguale" },
    { slug: "sequenze", label: "Sequenze", description: "Completa ritmi e salti numerici" },
    { slug: "addizione-sottrazione", label: "Addizione e sottrazione", description: "Calcolo e strategie" },
    { slug: "calcolo-mentale", label: "Calcolo mentale", description: "Strategie veloci e numeri amici" },
    { slug: "problemi", label: "Problemi", description: "Piccoli problemi in parole" },
    { slug: "misure-semplici", label: "Misure semplici", description: "Lunghezze, euro e tempo quotidiano" },
  ],
  terza: [
    { slug: "moltiplicazione", label: "Moltiplicazione", description: "Gruppi e ripetizioni" },
    { slug: "tabelline", label: "Tabelline", description: "Richiama fatti utili con sicurezza" },
    { slug: "divisione", label: "Divisione", description: "Condivisione e raggruppamenti" },
    { slug: "problemi-a-passi", label: "Problemi a passi", description: "Scegli l'ordine giusto delle operazioni" },
    { slug: "bar-model", label: "Bar model", description: "Visualizza il problema" },
    { slug: "misure", label: "Misure", description: "Lunghezze, masse e capacità" },
    { slug: "geometria", label: "Geometria", description: "Figure, lati e angoli intuitivi" },
    { slug: "dati-e-logica", label: "Dati e logica", description: "Leggi tabelle e trova regole" },
  ],
  quarta: [
    { slug: "problemi-avanzati", label: "Problemi avanzati", description: "Più passaggi, più strategie" },
    { slug: "frazioni", label: "Frazioni intuitive", description: "Parti dell’intero" },
    { slug: "bar-model", label: "Bar model avanzato", description: "Rappresenta e risolvi" },
    { slug: "numeri-decimali", label: "Numeri decimali", description: "Decimi e centesimi in contesti reali" },
    { slug: "equivalenze", label: "Equivalenze", description: "Cambia unità senza perdere il significato" },
    { slug: "perimetro-area", label: "Perimetro e area", description: "Misura il bordo e lo spazio" },
    { slug: "dati-e-grafici", label: "Dati e grafici", description: "Leggi informazioni da tabelle e grafici" },
    { slug: "logica", label: "Logica", description: "Strategie, regole e ragionamento" },
  ],
};
