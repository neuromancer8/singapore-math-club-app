import { writeFileSync } from "node:fs";
import { join } from "node:path";

function choice(id, grade, topic, prompt, options, correctAnswer, explanation, difficulty, visualModel) {
  return {
    id,
    grade,
    topic,
    type: "multiple-choice",
    prompt,
    options,
    correctAnswer,
    explanation,
    difficulty,
    ...(visualModel ? { visualModel } : {}),
  };
}

function numeric(id, grade, topic, prompt, correctAnswer, explanation, difficulty, visualModel) {
  return {
    id,
    grade,
    topic,
    type: "numeric-input",
    prompt,
    correctAnswer,
    explanation,
    difficulty,
    ...(visualModel ? { visualModel } : {}),
  };
}

function word(id, grade, topic, prompt, correctAnswer, explanation, difficulty, visualModel) {
  return {
    id,
    grade,
    topic,
    type: "word-problem",
    prompt,
    correctAnswer,
    explanation,
    difficulty,
    ...(visualModel ? { visualModel } : {}),
  };
}

function bar(id, grade, topic, prompt, options, correctAnswer, explanation, difficulty, visualModel) {
  return {
    id,
    grade,
    topic,
    type: "bar-model",
    options,
    correctAnswer,
    prompt,
    explanation,
    difficulty,
    visualModel,
  };
}

const seconda = [
  choice("s2-num-1", "seconda", "numeri", "Quale numero è maggiore?", ["34", "43", "31", "24"], "43", "43 è il numero più grande tra quelli proposti.", 1),
  numeric("s2-num-2", "seconda", "numeri", "Scrivi il numero che viene dopo 59.", 60, "Dopo 59 viene 60.", 1),
  choice("s2-num-3", "seconda", "numeri", "Quale numero ha 5 decine e 2 unità?", ["25", "52", "50", "72"], "52", "5 decine valgono 50 e con 2 unità si ottiene 52.", 1),
  choice("s2-num-4", "seconda", "numeri", "Quale coppia è in ordine crescente?", ["48, 51, 57", "62, 58, 64", "39, 35, 31", "70, 69, 71"], "48, 51, 57", "In ordine crescente i numeri vanno dal più piccolo al più grande.", 2),
  numeric("s2-num-5", "seconda", "numeri", "Completa: 70, 72, 74, __, 78", 76, "La sequenza aumenta di 2 ogni volta.", 2),
  bar("s2-num-6", "seconda", "numeri", "Una barra mostra 40 e una piccola parte da 7. Qual è il totale?", ["47", "33", "74", "57"], "47", "Sommi la parte da 40 con la parte da 7: 47.", 2, "Parte grande 40 + parte piccola 7 = totale"),
  word("s2-num-7", "seconda", "numeri", "Nel cartellone ci sono 6 palloncini blu e 8 rossi. Quanti palloncini ci sono in tutto?", 14, "6 + 8 = 14 palloncini.", 3),

  choice("s2-du-1", "seconda", "decine-unita", "Quale numero è formato da 6 decine e 4 unità?", ["46", "64", "60", "24"], "64", "6 decine valgono 60 e con 4 unità si arriva a 64.", 1),
  numeric("s2-du-2", "seconda", "decine-unita", "Quante unità ci sono in 3 decine?", 30, "3 decine valgono 30 unità.", 1),
  choice("s2-du-3", "seconda", "decine-unita", "Quale numero ha 8 decine e 0 unità?", ["80", "8", "18", "108"], "80", "8 decine e 0 unità fanno 80.", 1),
  numeric("s2-du-4", "seconda", "decine-unita", "Scrivi il numero formato da 9 decine e 5 unità.", 95, "9 decine sono 90 e con 5 unità ottieni 95.", 2),
  bar("s2-du-5", "seconda", "decine-unita", "Una barra lunga vale 30 e una piccola barra vale 4. Che numero rappresentano insieme?", ["34", "43", "26", "7"], "34", "30 + 4 = 34.", 2, "3 decine + 4 unità = numero"),
  choice("s2-du-6", "seconda", "decine-unita", "Quale scomposizione è corretta per 57?", ["50 + 7", "5 + 7", "40 + 17", "30 + 27"], "50 + 7", "57 si scompone in 50 e 7.", 2),
  word("s2-du-7", "seconda", "decine-unita", "Luca costruisce il numero 83 con cannucce e tappi. Quante decine usa?", 8, "83 è composto da 8 decine e 3 unità.", 3),

  choice("s2-con-1", "seconda", "confronti", "Quale simbolo completa: 48 __ 52?", ["<", ">", "="], "<", "48 è minore di 52.", 1),
  choice("s2-con-2", "seconda", "confronti", "Quale numero è minore?", ["67", "76", "70", "71"], "67", "67 è il più piccolo.", 1),
  numeric("s2-con-3", "seconda", "confronti", "Scrivi il numero maggiore tra 39 e 93.", 93, "93 ha più decine di 39.", 1),
  choice("s2-con-4", "seconda", "confronti", "Quale coppia ha numeri uguali?", ["45 e 45", "56 e 65", "31 e 13", "70 e 71"], "45 e 45", "I due numeri sono uguali.", 2),
  bar("s2-con-5", "seconda", "confronti", "La barra A vale 62 e la barra B vale 58. Quale barra è più lunga?", ["A", "B", "Sono uguali"], "A", "62 è maggiore di 58.", 2, "Barra A 62 | Barra B 58"),
  choice("s2-con-6", "seconda", "confronti", "Completa correttamente: 80 __ 79", [">", "<", "="], ">", "80 è maggiore di 79 di una unità.", 2),

  numeric("s2-seq-1", "seconda", "sequenze", "Completa: 12, 14, 16, __", 18, "La sequenza aumenta di 2.", 1),
  numeric("s2-seq-2", "seconda", "sequenze", "Completa: 30, 40, 50, __", 60, "La sequenza aumenta di 10.", 1),
  choice("s2-seq-3", "seconda", "sequenze", "Quale numero manca? 5, 10, 15, __, 25", ["18", "20", "30", "35"], "20", "Si conta a salti di 5.", 1),
  numeric("s2-seq-4", "seconda", "sequenze", "Completa al contrario: 21, 19, 17, __", 15, "La sequenza scende di 2.", 2),
  choice("s2-seq-5", "seconda", "sequenze", "Quale sequenza è corretta?", ["41, 43, 45, 47", "20, 23, 26, 28", "90, 80, 75, 70", "14, 18, 21, 24"], "41, 43, 45, 47", "Ogni volta si aggiungono 2.", 2),
  word("s2-seq-6", "seconda", "sequenze", "Marta salta sui numeri 3, 6, 9, 12. Su quale numero atterra dopo?", 15, "Continua a salti di 3.", 3),

  numeric("s2-add-1", "seconda", "addizione-sottrazione", "Calcola: 27 + 15", 42, "27 + 15 = 42.", 1),
  numeric("s2-add-2", "seconda", "addizione-sottrazione", "Calcola: 54 - 21", 33, "54 - 21 = 33.", 1),
  choice("s2-add-3", "seconda", "addizione-sottrazione", "Quale risultato è corretto?", ["36 + 4 = 40", "36 + 4 = 30", "36 + 4 = 44", "36 + 4 = 32"], "36 + 4 = 40", "36 più 4 fa 40.", 1),
  numeric("s2-add-4", "seconda", "addizione-sottrazione", "Calcola: 61 - 9", 52, "61 - 9 = 52.", 2),
  bar("s2-add-5", "seconda", "addizione-sottrazione", "Una barra totale vale 50. Una parte è 18. Quanto vale l'altra parte?", ["32", "68", "22", "28"], "32", "50 - 18 = 32.", 2, "Totale 50 | parte 18 | parte mancante ?"),
  word("s2-add-6", "seconda", "addizione-sottrazione", "Nel cesto ci sono 18 mele. Ne aggiungo 7. Quante mele ci sono ora?", 25, "18 + 7 = 25.", 2),
  word("s2-add-7", "seconda", "addizione-sottrazione", "In biblioteca ci sono 45 libri sul tavolo. 12 vengono rimessi a posto. Quanti restano?", 33, "45 - 12 = 33.", 3),

  numeric("s2-cm-1", "seconda", "calcolo-mentale", "Calcola a mente: 20 + 30", 50, "Sommi le decine: 2 decine + 3 decine = 5 decine.", 1),
  numeric("s2-cm-2", "seconda", "calcolo-mentale", "Calcola a mente: 90 - 40", 50, "9 decine meno 4 decine fanno 5 decine.", 1),
  choice("s2-cm-3", "seconda", "calcolo-mentale", "Quale coppia fa 10?", ["6 e 4", "7 e 2", "8 e 1", "5 e 2"], "6 e 4", "6 + 4 = 10.", 1),
  numeric("s2-cm-4", "seconda", "calcolo-mentale", "Calcola a mente: 38 + 2", 40, "Aggiungere 2 a 38 porta a 40.", 2),
  choice("s2-cm-5", "seconda", "calcolo-mentale", "Quale strategia aiuta per 49 + 1?", ["Arrivo a 50", "Tolgo 10", "Raddoppio", "Conto all'indietro"], "Arrivo a 50", "49 + 1 è il numero tondo successivo: 50.", 2),
  word("s2-cm-6", "seconda", "calcolo-mentale", "Sara ha 28 figurine e ne riceve 2. Quante figurine ha adesso?", 30, "28 + 2 = 30.", 2),

  word("s2-prob-1", "seconda", "problemi", "Ci sono 14 bambini in palestra. Ne arrivano altri 5. Quanti bambini ci sono adesso?", 19, "14 + 5 = 19.", 1),
  word("s2-prob-2", "seconda", "problemi", "Luca ha 23 biglie e ne perde 6. Quante gliene restano?", 17, "23 - 6 = 17.", 1),
  choice("s2-prob-3", "seconda", "problemi", "Quale operazione scegli per risolvere: 'Avevo 30 euro, ne spendo 8'?", ["30 - 8", "30 + 8", "8 + 8", "30 x 8"], "30 - 8", "Se spendi, devi togliere.", 2),
  bar("s2-prob-4", "seconda", "problemi", "Una barra totale vale 26. Una parte vale 9. Quanti oggetti ci sono nell'altra parte?", ["17", "35", "15", "19"], "17", "26 - 9 = 17.", 2, "Totale 26 | parte 9 | parte ?"),
  word("s2-prob-5", "seconda", "problemi", "In giardino ci sono 8 fiori gialli e 12 rossi. Quanti fiori ci sono in tutto?", 20, "8 + 12 = 20.", 2),
  word("s2-prob-6", "seconda", "problemi", "Un autobus porta 32 bambini. 10 scendono. Quanti restano sull'autobus?", 22, "32 - 10 = 22.", 3),
  choice("s2-prob-7", "seconda", "problemi", "Quale risposta è ragionevole per 9 + 8?", ["17", "2", "98", "40"], "17", "9 + 8 fa 17.", 3),

  choice("s2-mis-1", "seconda", "misure-semplici", "Quale oggetto è più lungo?", ["Una corda di 80 cm", "Una matita di 12 cm", "Sono uguali"], "Una corda di 80 cm", "80 cm è maggiore di 12 cm.", 1),
  numeric("s2-mis-2", "seconda", "misure-semplici", "Quanti euro servono per comprare un gioco da 7 euro e una penna da 2 euro?", 9, "7 + 2 = 9 euro.", 1),
  choice("s2-mis-3", "seconda", "misure-semplici", "Quanti minuti ci sono in mezz'ora?", ["30", "20", "60", "15"], "30", "Mezz'ora corrisponde a 30 minuti.", 1),
  word("s2-mis-4", "seconda", "misure-semplici", "Un nastro è lungo 25 cm e un altro è lungo 15 cm. Quanti cm misurano insieme?", 40, "25 + 15 = 40 cm.", 2),
  choice("s2-mis-5", "seconda", "misure-semplici", "Quale moneta manca per arrivare da 6 euro a 10 euro?", ["4 euro", "2 euro", "3 euro", "5 euro"], "4 euro", "10 - 6 = 4.", 2),
  bar("s2-mis-6", "seconda", "misure-semplici", "Il percorso totale è di 1 ora. Hai camminato per 35 minuti. Quanto manca?", ["25 minuti", "35 minuti", "15 minuti", "45 minuti"], "25 minuti", "1 ora sono 60 minuti. 60 - 35 = 25.", 3, "Totale 60 min | parte 35 min | parte mancante ?"),
];

const terza = [
  numeric("s3-mul-1", "terza", "moltiplicazione", "Calcola: 4 x 6", 24, "4 gruppi da 6 fanno 24.", 1),
  numeric("s3-mul-2", "terza", "moltiplicazione", "Calcola: 3 x 8", 24, "3 gruppi da 8 fanno 24.", 1),
  choice("s3-mul-3", "terza", "moltiplicazione", "Quale addizione ripetuta corrisponde a 5 x 3?", ["3 + 3 + 3 + 3 + 3", "5 + 5 + 5", "3 + 5", "5 + 3 + 2"], "3 + 3 + 3 + 3 + 3", "5 x 3 significa 5 gruppi da 3.", 1),
  word("s3-mul-4", "terza", "moltiplicazione", "Ci sono 6 scatole con 4 matite in ogni scatola. Quante matite ci sono in tutto?", 24, "6 x 4 = 24.", 2),
  choice("s3-mul-5", "terza", "moltiplicazione", "Quale risultato è corretto?", ["7 x 5 = 35", "7 x 5 = 30", "7 x 5 = 40", "7 x 5 = 25"], "7 x 5 = 35", "7 gruppi da 5 fanno 35.", 2),
  bar("s3-mul-6", "terza", "moltiplicazione", "Una barra mostra 3 gruppi uguali da 7. Qual è il totale?", ["21", "10", "14", "28"], "21", "3 x 7 = 21.", 2, "3 parti uguali da 7 = totale ?"),
  word("s3-mul-7", "terza", "moltiplicazione", "Ogni tavolo ha 8 seggioline. I tavoli sono 5. Quante seggioline ci sono?", 40, "5 x 8 = 40.", 3),

  numeric("s3-tab-1", "terza", "tabelline", "Completa la tabellina del 2: 2 x 9 = ?", 18, "2 moltiplicato per 9 fa 18.", 1),
  numeric("s3-tab-2", "terza", "tabelline", "Completa la tabellina del 5: 5 x 7 = ?", 35, "5 x 7 = 35.", 1),
  choice("s3-tab-3", "terza", "tabelline", "Quale fatto della tabellina del 10 è corretto?", ["10 x 6 = 60", "10 x 6 = 16", "10 x 6 = 50", "10 x 6 = 600"], "10 x 6 = 60", "Moltiplicare per 10 aggiunge uno zero.", 1),
  numeric("s3-tab-4", "terza", "tabelline", "Completa: 4 x 7 = ?", 28, "4 gruppi da 7 fanno 28.", 2),
  choice("s3-tab-5", "terza", "tabelline", "Quale numero completa 9 x __ = 27?", ["3", "2", "4", "6"], "3", "9 x 3 = 27.", 2),
  word("s3-tab-6", "terza", "tabelline", "Un mazzo ha 3 file da 6 carte. Quante carte ci sono?", 18, "3 x 6 = 18.", 2),

  numeric("s3-div-1", "terza", "divisione", "Calcola: 18 : 3", 6, "18 diviso 3 fa 6.", 1),
  numeric("s3-div-2", "terza", "divisione", "Calcola: 20 : 5", 4, "20 diviso 5 fa 4.", 1),
  choice("s3-div-3", "terza", "divisione", "Quale frase descrive 24 : 6?", ["24 oggetti in 6 gruppi uguali", "24 + 6 oggetti", "6 gruppi da 24", "24 tolgo 6 una volta"], "24 oggetti in 6 gruppi uguali", "La divisione distribuisce o raggruppa in parti uguali.", 1),
  word("s3-div-4", "terza", "divisione", "24 caramelle vengono divise tra 4 bambini. Quante caramelle riceve ogni bambino?", 6, "24 : 4 = 6.", 2),
  bar("s3-div-5", "terza", "divisione", "Una barra totale vale 28 ed è divisa in 7 parti uguali. Quanto vale ogni parte?", ["4", "5", "6", "7"], "4", "28 : 7 = 4.", 2, "Totale 28 diviso in 7 parti uguali"),
  choice("s3-div-6", "terza", "divisione", "Quale divisione dà come risultato 8?", ["32 : 4", "24 : 4", "28 : 2", "18 : 3"], "32 : 4", "32 diviso 4 fa 8.", 3),
  word("s3-div-7", "terza", "divisione", "48 figurine vengono messe in album da 6 figurine per pagina. Quante pagine servono?", 8, "48 : 6 = 8.", 3),

  choice("s3-passi-1", "terza", "problemi-a-passi", "Quale operazione fai per prima? '3 sacchetti da 5 biscotti e poi ne aggiungo 4'.", ["3 x 5", "5 + 4", "3 + 5", "4 - 3"], "3 x 5", "Prima trovi i biscotti nei sacchetti, poi aggiungi 4.", 1),
  word("s3-passi-2", "terza", "problemi-a-passi", "Ci sono 4 scatole da 6 pennarelli. Se ne rompono 3. Quanti pennarelli restano?", 21, "4 x 6 = 24, poi 24 - 3 = 21.", 2),
  choice("s3-passi-3", "terza", "problemi-a-passi", "Quale piano è corretto per: 5 pacchi da 8 quaderni, poi regalo 6 quaderni?", ["Moltiplico, poi sottraggo", "Sommo, poi moltiplico", "Sottraggo, poi divido", "Divido, poi sommo"], "Moltiplico, poi sottraggo", "Prima trovi il totale, poi togli quelli regalati.", 2),
  word("s3-passi-4", "terza", "problemi-a-passi", "Nel teatro ci sono 6 file da 7 posti. 5 posti restano vuoti. Quanti posti sono occupati?", 37, "6 x 7 = 42, poi 42 - 5 = 37.", 2),
  bar("s3-passi-5", "terza", "problemi-a-passi", "Una barra totale vale 30, costruita con 5 gruppi uguali. Poi tolgo 2. Quanto resta?", ["28", "25", "8", "6"], "28", "Dal totale 30, togli 2 e restano 28.", 3, "Totale 30 | tolgo 2 | resto ?"),
  word("s3-passi-6", "terza", "problemi-a-passi", "7 amici raccolgono 4 conchiglie ciascuno. Ne regalano 8 al museo. Quante ne restano?", 20, "7 x 4 = 28, poi 28 - 8 = 20.", 3),

  bar("s3-bar-1", "terza", "bar-model", "Una barra totale vale 18. Una parte vale 7. Quanto vale l'altra parte?", ["11", "10", "9", "25"], "11", "18 - 7 = 11.", 1, "Totale 18 | parte 7 | parte mancante ?"),
  bar("s3-bar-2", "terza", "bar-model", "Tre barre uguali valgono 5 ciascuna. Quanto vale il totale?", ["15", "10", "8", "20"], "15", "3 x 5 = 15.", 1, "3 parti uguali da 5 = totale"),
  choice("s3-bar-3", "terza", "bar-model", "Quale disegno rappresenta 12 diviso in 3 parti uguali?", ["3 barre uguali da 4", "2 barre da 6", "Una barra da 12 e una da 3", "4 barre da 3 e una da 1"], "3 barre uguali da 4", "12 : 3 = 4 per ogni parte.", 2),
  bar("s3-bar-4", "terza", "bar-model", "Una barra lunga 24 è divisa in 4 parti uguali. Quanto vale ogni parte?", ["6", "8", "4", "12"], "6", "24 : 4 = 6.", 2, "Totale 24 | 4 parti uguali"),
  word("s3-bar-5", "terza", "bar-model", "Marco ha 9 figurine. Giulia ne ha il doppio. Quante figurine ha Giulia?", 18, "Il doppio di 9 è 18.", 2, "Barra di Giulia lunga il doppio della barra di Marco"),
  bar("s3-bar-6", "terza", "bar-model", "Due parti uguali valgono 16 in tutto. Quanto vale una parte?", ["8", "6", "4", "12"], "8", "16 : 2 = 8.", 3, "Totale 16 | 2 parti uguali"),
  word("s3-bar-7", "terza", "bar-model", "Una classe raccoglie 27 euro. La seconda barra mostra 9 euro in meno della prima. Di quanti euro potrebbe essere la prima barra se il totale è 27?", 18, "Se una parte è 18 e l'altra è 9, il totale è 27.", 3, "Barra A = ? | Barra B = 9 | Totale 27"),

  choice("s3-mis-1", "terza", "misure", "Quale misura è maggiore?", ["2 m", "90 cm", "Sono uguali"], "2 m", "2 m corrispondono a 200 cm, quindi sono maggiori di 90 cm.", 1),
  numeric("s3-mis-2", "terza", "misure", "Quanti centimetri sono 1 metro?", 100, "1 metro = 100 centimetri.", 1),
  word("s3-mis-3", "terza", "misure", "Una bottiglia contiene 2 litri d'acqua e ne verso 1 litro. Quanti litri restano?", 1, "2 - 1 = 1 litro.", 1),
  choice("s3-mis-4", "terza", "misure", "Quale strumento usi per misurare la lunghezza del banco?", ["Righello o metro", "Bilancia", "Orologio", "Termometro"], "Righello o metro", "La lunghezza si misura con righello o metro.", 2),
  numeric("s3-mis-5", "terza", "misure", "Quanti grammi sono mezzo chilo?", 500, "Mezzo chilogrammo corrisponde a 500 grammi.", 2),
  word("s3-mis-6", "terza", "misure", "Due corde misurano 35 cm e 25 cm. Quanto misurano insieme?", 60, "35 + 25 = 60 cm.", 2),

  choice("s3-geo-1", "terza", "geometria", "Quale figura ha 4 lati tutti uguali?", ["Quadrato", "Triangolo", "Cerchio", "Rettangolo"], "Quadrato", "Il quadrato ha 4 lati uguali.", 1),
  choice("s3-geo-2", "terza", "geometria", "Quanti lati ha un triangolo?", ["3", "4", "5", "0"], "3", "Il triangolo ha 3 lati.", 1),
  choice("s3-geo-3", "terza", "geometria", "Quale figura non ha lati?", ["Cerchio", "Quadrato", "Rettangolo", "Pentagono"], "Cerchio", "Il cerchio è una linea curva chiusa.", 1),
  numeric("s3-geo-4", "terza", "geometria", "Quanti vertici ha un rettangolo?", 4, "Il rettangolo ha 4 vertici.", 2),
  choice("s3-geo-5", "terza", "geometria", "Quale figura ha 5 lati?", ["Pentagono", "Esagono", "Triangolo", "Quadrato"], "Pentagono", "Il pentagono ha 5 lati.", 2),
  choice("s3-geo-6", "terza", "geometria", "Una figura ha 4 lati, due lunghi e due corti, e 4 angoli retti. Che figura è?", ["Rettangolo", "Triangolo", "Cerchio", "Esagono"], "Rettangolo", "La descrizione corrisponde a un rettangolo.", 3),

  choice("s3-log-1", "terza", "dati-e-logica", "Nella tabella mele=4, pere=6, banane=3. Quale frutto è più numeroso?", ["Pere", "Mele", "Banane", "Sono uguali"], "Pere", "6 è il numero più grande.", 1),
  numeric("s3-log-2", "terza", "dati-e-logica", "Completa la regola: 2, 4, 6, 8, __", 10, "La regola è +2.", 1),
  choice("s3-log-3", "terza", "dati-e-logica", "Quale numero non appartiene alla serie 5, 10, 15, 19, 20?", ["19", "10", "15", "20"], "19", "La serie cresce di 5, quindi 19 rompe la regola.", 2),
  word("s3-log-4", "terza", "dati-e-logica", "In un grafico, il lunedì ci sono 7 libri letti e il martedì 9. Quanti libri in più martedì?", 2, "9 - 7 = 2.", 2),
  choice("s3-log-5", "terza", "dati-e-logica", "Se ogni figura blu vale 2 punti e ne vedo 4, quanti punti ottengo?", ["8", "6", "4", "2"], "8", "4 x 2 = 8.", 2),
  word("s3-log-6", "terza", "dati-e-logica", "Tre amici hanno 5, 8 e 8 figurine. Quanti amici hanno lo stesso numero di figurine?", 2, "Due amici hanno 8 figurine.", 3),
];

const quarta = [
  word("s4-prob-1", "quarta", "problemi-avanzati", "Una scuola compra 4 scatole di pennarelli da 6 euro ciascuna. Quanto spende in tutto?", 24, "4 x 6 = 24 euro.", 1),
  word("s4-prob-2", "quarta", "problemi-avanzati", "Ci sono 5 tavoli con 4 bambini ciascuno. Poi 3 bambini escono. Quanti bambini restano?", 17, "Prima 5 x 4 = 20, poi 20 - 3 = 17.", 2),
  choice("s4-prob-3", "quarta", "problemi-avanzati", "Quale coppia di operazioni risolve: 3 scatole da 8 quaderni e poi ne regalo 5?", ["3 x 8, poi -5", "3 + 8, poi -5", "8 - 5, poi x3", "3 x 5, poi +8"], "3 x 8, poi -5", "Prima trovi il totale, poi togli quelli regalati.", 2),
  numeric("s4-prob-4", "quarta", "problemi-avanzati", "Una corda è lunga 180 cm. Ne taglio 45 cm. Quanti centimetri restano?", 135, "180 - 45 = 135.", 2),
  word("s4-prob-5", "quarta", "problemi-avanzati", "Anna compra 3 quaderni da 2 euro e una penna da 4 euro. Quanto spende in tutto?", 10, "3 x 2 = 6, poi 6 + 4 = 10.", 2),
  bar("s4-prob-6", "quarta", "problemi-avanzati", "Un totale di 36 è formato da 4 parti uguali e poi tolgo 3. Quanto resta?", ["33", "9", "6", "12"], "33", "Il totale è 36. Se togli 3, restano 33.", 3, "Totale 36 | parte tolta 3 | resto ?"),
  word("s4-prob-7", "quarta", "problemi-avanzati", "Un autobus fa 3 viaggi con 24 bambini per viaggio. Nell'ultimo viaggio 5 bambini scendono prima. Quanti bambini arrivano in tutto?", 67, "3 x 24 = 72, poi 72 - 5 = 67.", 3),

  choice("s4-fra-1", "quarta", "frazioni", "Quale frazione rappresenta una torta divisa in 4 parti uguali con 1 parte colorata?", ["1/4", "1/2", "3/4", "4/1"], "1/4", "Una parte su quattro è un quarto.", 1),
  choice("s4-fra-2", "quarta", "frazioni", "Quale frazione è più grande?", ["3/4", "1/4", "2/8", "1/8"], "3/4", "Tre quarti sono maggiori delle altre frazioni proposte.", 1),
  numeric("s4-fra-3", "quarta", "frazioni", "Quante parti su 8 rappresentano 1/2?", 4, "Metà di 8 parti è 4 parti, quindi 4/8.", 2),
  choice("s4-fra-4", "quarta", "frazioni", "Quale frazione è equivalente a 1/2?", ["2/4", "1/4", "3/4", "4/4"], "2/4", "2/4 rappresenta la stessa quantità di 1/2.", 2),
  bar("s4-fra-5", "quarta", "frazioni", "Una barra è divisa in 6 parti uguali. Ne coloro 3. Che frazione ho colorato?", ["3/6", "6/3", "1/6", "5/6"], "3/6", "3 parti colorate su 6 totali.", 2, "Barra divisa in 6 parti uguali, 3 colorate"),
  word("s4-fra-6", "quarta", "frazioni", "Di 12 biscotti, 1/3 è al cioccolato. Quanti biscotti sono al cioccolato?", 4, "12 diviso 3 fa 4.", 3),
  choice("s4-fra-7", "quarta", "frazioni", "Quale frazione indica 'tutto intero'?", ["4/4", "1/4", "2/4", "3/4"], "4/4", "Quattro quarti formano l'intero.", 3),

  bar("s4-bar-1", "quarta", "bar-model", "Una barra totale vale 45. Una parte vale 18. Quanto vale l'altra parte?", ["27", "23", "63", "17"], "27", "45 - 18 = 27.", 1, "Totale 45 | parte 18 | parte ?"),
  bar("s4-bar-2", "quarta", "bar-model", "Tre parti uguali valgono in tutto 36. Quanto vale una parte?", ["12", "9", "18", "6"], "12", "36 : 3 = 12.", 1, "Totale 36 | 3 parti uguali"),
  choice("s4-bar-3", "quarta", "bar-model", "Quale schema mostra 'il doppio di 7'?", ["Due barre uguali da 7", "Una barra da 7 e una da 3", "Tre barre da 7", "Una barra da 14 e una da 1"], "Due barre uguali da 7", "Il doppio significa due parti uguali della stessa grandezza.", 2),
  bar("s4-bar-4", "quarta", "bar-model", "Una barra vale 28. È composta da 4 parti uguali. Quanto vale ogni parte?", ["7", "6", "8", "4"], "7", "28 : 4 = 7.", 2, "Totale 28 | 4 parti uguali"),
  word("s4-bar-5", "quarta", "bar-model", "Giulia ha 15 figurine. Paolo ne ha 9 in più. Quante figurine ha Paolo?", 24, "15 + 9 = 24.", 2, "Barra di Paolo più lunga di 9 rispetto a Giulia"),
  bar("s4-bar-6", "quarta", "bar-model", "Due barre insieme fanno 50. La prima vale 30. Quanto vale la seconda?", ["20", "10", "80", "15"], "20", "50 - 30 = 20.", 3, "Totale 50 | prima barra 30 | seconda barra ?"),
  word("s4-bar-7", "quarta", "bar-model", "Un nastro lungo 72 cm è diviso in 6 parti uguali. Quanto misura ogni parte?", 12, "72 : 6 = 12.", 3, "Totale 72 | 6 parti uguali"),

  numeric("s4-dec-1", "quarta", "numeri-decimali", "Completa: 2,5 + 0,5 = ?", 3, "Cinque decimi più cinque decimi fanno un intero.", 1),
  choice("s4-dec-2", "quarta", "numeri-decimali", "Quale numero è maggiore?", ["1,7", "1,07", "1,5", "1,09"], "1,7", "1,7 corrisponde a 1 intero e 7 decimi.", 1),
  numeric("s4-dec-3", "quarta", "numeri-decimali", "Quanto vale 3 euro e 50 centesimi scritto in euro?", 3.5, "3 euro e 50 centesimi si scrive 3,50.", 2),
  choice("s4-dec-4", "quarta", "numeri-decimali", "Quale confronto è corretto?", ["0,8 > 0,5", "0,3 > 0,7", "1,2 < 1,1", "0,9 = 0,09"], "0,8 > 0,5", "Otto decimi sono maggiori di cinque decimi.", 2),
  word("s4-dec-5", "quarta", "numeri-decimali", "Una bottiglia contiene 1,5 litri e ne verso 0,5 litri. Quanti litri restano?", 1, "1,5 - 0,5 = 1 litro.", 2),
  numeric("s4-dec-6", "quarta", "numeri-decimali", "Calcola: 4,2 + 0,3", 4.5, "Due decimi più tre decimi fanno cinque decimi.", 3),

  choice("s4-eq-1", "quarta", "equivalenze", "Quanti centimetri sono 2 metri?", ["200", "20", "2000", "120"], "200", "1 metro = 100 cm, quindi 2 metri = 200 cm.", 1),
  numeric("s4-eq-2", "quarta", "equivalenze", "Quanti grammi sono 3 kg?", 3000, "1 kg = 1000 g, quindi 3 kg = 3000 g.", 1),
  choice("s4-eq-3", "quarta", "equivalenze", "Quale equivalenza è corretta?", ["1 l = 1000 ml", "1 l = 100 ml", "1 km = 100 m", "1 h = 10 min"], "1 l = 1000 ml", "Un litro corrisponde a mille millilitri.", 2),
  numeric("s4-eq-4", "quarta", "equivalenze", "Quanti minuti sono 2 ore?", 120, "Ogni ora ha 60 minuti, quindi 2 ore hanno 120 minuti.", 2),
  word("s4-eq-5", "quarta", "equivalenze", "Una gara misura 2 km. Quanti metri sono?", 2000, "1 km = 1000 m, quindi 2 km = 2000 m.", 2),
  choice("s4-eq-6", "quarta", "equivalenze", "Qual è la stessa quantità di 500 ml?", ["0,5 l", "5 l", "50 l", "0,05 l"], "0,5 l", "500 ml sono mezzo litro.", 3),

  numeric("s4-per-1", "quarta", "perimetro-area", "Qual è il perimetro di un quadrato con lato 5 cm?", 20, "Il perimetro del quadrato è 4 x lato.", 1),
  numeric("s4-per-2", "quarta", "perimetro-area", "Qual è il perimetro di un rettangolo con lati 4 cm e 7 cm?", 22, "4 + 7 + 4 + 7 = 22.", 1),
  choice("s4-per-3", "quarta", "perimetro-area", "L'area misura:", ["Lo spazio interno", "Il bordo", "Il numero di lati", "L'altezza"], "Lo spazio interno", "L'area indica quanto spazio occupa la figura.", 1),
  numeric("s4-per-4", "quarta", "perimetro-area", "Qual è l'area di un rettangolo 3 x 6?", 18, "Area = base x altezza = 18.", 2),
  word("s4-per-5", "quarta", "perimetro-area", "Un giardino rettangolare misura 8 m per 5 m. Qual è il perimetro?", 26, "8 + 5 + 8 + 5 = 26 m.", 2),
  choice("s4-per-6", "quarta", "perimetro-area", "Quale figura ha area 16 se i lati misurano 4 e 4?", ["Quadrato", "Triangolo", "Cerchio", "Pentagono"], "Quadrato", "4 x 4 = 16.", 3),

  choice("s4-dati-1", "quarta", "dati-e-grafici", "In un grafico: lun=12, mar=15, mer=9. Quale giorno ha il valore più alto?", ["Martedì", "Lunedì", "Mercoledì", "Sono uguali"], "Martedì", "15 è il valore più alto.", 1),
  numeric("s4-dati-2", "quarta", "dati-e-grafici", "Quanti voti in tutto se una tabella mostra 6, 8 e 7?", 21, "6 + 8 + 7 = 21.", 1),
  choice("s4-dati-3", "quarta", "dati-e-grafici", "Quale domanda risponde bene a un grafico a barre?", ["Quale categoria è più grande", "Che forma ha un triangolo", "Quanto pesa un metro", "Quale frazione è equivalente"], "Quale categoria è più grande", "Il grafico a barre confronta quantità.", 2),
  word("s4-dati-4", "quarta", "dati-e-grafici", "In una tabella, il gruppo A ha 14 punti e il gruppo B 11. Di quanti punti A supera B?", 3, "14 - 11 = 3.", 2),
  choice("s4-dati-5", "quarta", "dati-e-grafici", "Se una colonna sale da 4 a 10, di quanto aumenta?", ["6", "14", "4", "5"], "6", "10 - 4 = 6.", 2),
  word("s4-dati-6", "quarta", "dati-e-grafici", "Un grafico mostra 8 libri letti in aprile e 12 a maggio. Quanti libri in più a maggio?", 4, "12 - 8 = 4.", 3),

  choice("s4-log-1", "quarta", "logica", "Quale numero completa la serie 3, 6, 12, 24, __?", ["48", "36", "30", "27"], "48", "Ogni volta il numero raddoppia.", 1),
  choice("s4-log-2", "quarta", "logica", "Se oggi è martedì, tra 7 giorni sarà:", ["Martedì", "Mercoledì", "Lunedì", "Domenica"], "Martedì", "Dopo 7 giorni si torna allo stesso giorno.", 1),
  numeric("s4-log-3", "quarta", "logica", "Quanti triangoli vedi se una figura è formata da 2 triangoli piccoli e 1 grande?", 3, "Conti i 2 piccoli e anche il triangolo grande formato dall'insieme.", 2),
  choice("s4-log-4", "quarta", "logica", "Quale affermazione è vera?", ["Tutti i quadrati sono rettangoli", "Tutti i rettangoli sono quadrati", "Nessun triangolo ha 3 lati", "Un cerchio ha 4 vertici"], "Tutti i quadrati sono rettangoli", "Il quadrato è un rettangolo con lati uguali.", 2),
  choice("s4-log-5", "quarta", "logica", "In una scatola ci sono palline rosse, blu e verdi. Se ne prendo una senza guardare, quale colore è certo?", ["Nessuno", "Rosso", "Blu", "Verde"], "Nessuno", "Senza altre informazioni nessun colore è sicuro al 100%.", 3),
  choice("s4-log-6", "quarta", "logica", "Quale numero manca? 100, 90, 81, 73, __", ["66", "65", "64", "63"], "66", "La regola è -10, poi -9, poi -8, quindi -7.", 3),
];

const outputs = [
  ["exercises-seconda.json", seconda],
  ["exercises-terza.json", terza],
  ["exercises-quarta.json", quarta],
];

for (const [filename, data] of outputs) {
  writeFileSync(join(process.cwd(), "data", filename), `${JSON.stringify(data, null, 2)}\n`);
}

for (const [name, data] of [
  ["seconda", seconda],
  ["terza", terza],
  ["quarta", quarta],
]) {
  const counts = data.reduce((acc, exercise) => {
    acc[exercise.topic] = (acc[exercise.topic] ?? 0) + 1;
    return acc;
  }, {});

  console.log(name, data.length, counts);
}
