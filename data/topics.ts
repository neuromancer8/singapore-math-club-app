import type { Grade, Topic } from "@/lib/types";

export const topicsByGrade: Record<Grade, Topic[]> = {
  seconda: [
    { slug: "numeri", label: "Numeri", description: "Conta, ordina e confronta" },
    { slug: "addizione-sottrazione", label: "Addizione e sottrazione", description: "Calcolo e strategie" },
    { slug: "problemi", label: "Problemi", description: "Piccoli problemi in parole" },
  ],
  terza: [
    { slug: "moltiplicazione", label: "Moltiplicazione", description: "Gruppi e ripetizioni" },
    { slug: "divisione", label: "Divisione", description: "Condivisione e raggruppamenti" },
    { slug: "bar-model", label: "Bar model", description: "Visualizza il problema" },
  ],
  quarta: [
    { slug: "problemi-avanzati", label: "Problemi avanzati", description: "Più passaggi, più strategie" },
    { slug: "frazioni", label: "Frazioni intuitive", description: "Parti dell’intero" },
    { slug: "bar-model", label: "Bar model avanzato", description: "Rappresenta e risolvi" },
  ],
};
