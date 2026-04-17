export type Locale = "it" | "en";

export const LOCALE_STORAGE_KEY = "singapore-math-locale";

export const defaultLocale: Locale = "it";

export function getLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" || stored === "it" ? stored : defaultLocale;
}

export function setLocale(locale: Locale) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function gradeLabel(grade: string, locale: Locale) {
  const labels: Record<Locale, Record<string, string>> = {
    it: {
      seconda: "Seconda elementare",
      terza: "Terza elementare",
      quarta: "Quarta elementare",
    },
    en: {
      seconda: "Second grade",
      terza: "Third grade",
      quarta: "Fourth grade",
    },
  };

  return labels[locale][grade] ?? grade;
}

const topicTranslations: Record<
  string,
  { en: { label: string; description: string }; it?: { label: string; description: string } }
> = {
  numeri: { en: { label: "Numbers", description: "Count, order and compare" } },
  "decine-unita": { en: { label: "Tens and ones", description: "Build numbers with place value" } },
  "addizione-sottrazione": { en: { label: "Addition and subtraction", description: "Calculation and strategies" } },
  problemi: { en: { label: "Word problems", description: "Short problems in words" } },
  "bar-model-base": { en: { label: "Basic bar model", description: "Represent quantities with visual bars" } },
  "doppi-meta": { en: { label: "Doubles and halves", description: "Double, halve and reason with parts" } },
  "geometria-base": { en: { label: "Basic geometry", description: "Shapes, sides and simple positions" } },
  "misure-tempo": { en: { label: "Measures and time", description: "Read simple measures, clocks and sequences" } },
  moltiplicazione: { en: { label: "Multiplication", description: "Groups and repeated addition" } },
  divisione: { en: { label: "Division", description: "Sharing and grouping" } },
  "problemi-a-passi": { en: { label: "Multi-step problems", description: "Choose the right order of operations" } },
  "bar-model": { en: { label: "Bar model", description: "Visualise the problem" } },
  misure: { en: { label: "Measures", description: "Lengths, masses and capacity" } },
  "geometria-perimetro": { en: { label: "Geometry and perimeter", description: "Measure sides and build shapes" } },
  "calcolo-scritto": { en: { label: "Written calculation", description: "Organised strategies for longer operations" } },
  "frazioni-base": { en: { label: "Basic fractions", description: "Halves, thirds and quarters with images" } },
  "problemi-avanzati": { en: { label: "Advanced problems", description: "More steps, more strategies" } },
  frazioni: { en: { label: "Intuitive fractions", description: "Parts of the whole" } },
  "bar-model-avanzato": { en: { label: "Advanced bar model", description: "Represent and solve" } },
  equivalenze: { en: { label: "Unit conversions", description: "Change units without losing meaning" } },
  "divisioni-con-resto": { en: { label: "Division with remainders", description: "Interpret what is left over" } },
  "moltiplicazioni-grandi": { en: { label: "Large multiplications", description: "Break numbers apart and recombine" } },
  "geometria-area": { en: { label: "Geometry and area", description: "Cover surfaces with square units" } },
  "problemi-con-frazioni": { en: { label: "Fraction problems", description: "Use parts of a whole in real problems" } },
};

export function topicLabel(slug: string, fallback: string, locale: Locale) {
  if (locale === "it") return fallback;
  return topicTranslations[slug]?.en.label ?? fallback;
}

export function topicDescription(slug: string, fallback: string, locale: Locale) {
  if (locale === "it") return fallback;
  return topicTranslations[slug]?.en.description ?? fallback;
}

export function difficultyLabel(value: string | number, locale: Locale) {
  const key = String(value);
  const labels = {
    it: { "1": "facile", "2": "media", "3": "avanzata", facile: "facile", media: "media", avanzata: "avanzata", all: "tutte le difficoltà" },
    en: { "1": "easy", "2": "medium", "3": "advanced", facile: "easy", media: "medium", avanzata: "advanced", all: "all difficulties" },
  } as const;

  return labels[locale][key as keyof (typeof labels)[Locale]] ?? key;
}

export function exerciseTypeLabel(type: string, locale: Locale) {
  const labels = {
    it: {
      "multiple-choice": "Scelta multipla",
      "numeric-input": "Numero",
      "word-problem": "Problema",
      "bar-model": "Bar model",
    },
    en: {
      "multiple-choice": "Multiple choice",
      "numeric-input": "Number",
      "word-problem": "Word problem",
      "bar-model": "Bar model",
    },
  } as const;

  return labels[locale][type as keyof (typeof labels)[Locale]] ?? type;
}

export const uiText = {
  it: {
    appSubtitle: "Numeri, barre e strategie per la primaria",
    navHome: "Home",
    navResults: "Risultati",
    navParents: "Genitori",
    activeClass: "Classe attiva",
    login: "Accedi",
    close: "Chiudi",
    loginStage: "Accesso fase MVP",
    loginTitle: "Accedi",
    loginDescription:
      "La pagina resta visibile a tutti. L'accesso serve per aprire la dashboard personale e salvare il percorso del bambino.",
    invalidCredentials: "Credenziali non valide. Per ora usa admin e admin.",
    username: "Username",
    password: "Password",
    loginWithAdmin: "Accedi con admin",
    demoCredentials: "Credenziali demo",
    profile: "Profilo",
    logout: "Esci",
    profileArea: "Area profilo",
    profileTitle: "Profilo di",
    profileDescription: "Da qui puoi scegliere l'avatar sicuro del bambino e uscire dall'account demo.",
    logoutFrom: "Esci da",
    publicBadge: "Metodo Singapore Math per la primaria",
    publicTitle: "Imparare la matematica con immagini, logica e piccoli passi sicuri.",
    publicDescription:
      "Ogni attività unisce numero, ragionamento visivo, bar model e problem solving con un ritmo adatto ai bambini.",
    classes: "Classi",
    topics: "Argomenti",
    exercises: "Esercizi",
    activePath: "Percorso attivo",
    children: "Bambini",
    concrete: "Concrete",
    pictorial: "Pittorico",
    abstract: "Astratto",
    concreteText: "Conta, confronta, costruisci",
    pictorialText: "Disegna barre, gruppi e parti",
    abstractText: "Risolvi, spiega e controlla",
    whyWorks: "Perché funziona",
    clearLearning: "Un apprendimento chiaro e rassicurante",
    readyToGrow: "Pronto per crescere",
    phaseTwoBase: "Base solida per la fase 2",
    personalDashboard: "Dashboard personale",
    helloPrefix: "Ciao",
    helloSuffix: "questo e il tuo percorso.",
    fullName: "Nome e cognome",
    avatar: "Avatar",
    startingClass: "Classe di partenza",
    currentClass: "Classe attiva",
    pathStatus: "Stato del percorso",
    continueIn: "Continua in",
    latestResults: "Vedi ultimi risultati",
    educationalStatus: "Stato educativo",
    accuracy: "accuratezza",
    start: "Partenza",
    consolidation: "Consolidamento",
    nextStep: "Prossimo passo",
    firstAccessReady: "Primo accesso pronto",
    bestStars: "stelle migliori in",
    chooseTopic: "Scegli un argomento di",
    sessionsDone: "Sessioni svolte",
    averageAccuracy: "Accuratezza media",
    activeTopics: "Argomenti attivi",
    availableExercises: "Esercizi disponibili",
    educationPathStatus: "Stato del percorso educativo",
    classVision: "Visione per classe",
    pathwayMap: "Mappa del percorso",
    nextLessons: "Prossime lezioni di",
    openPath: "Apri percorso",
    recommended: "Consigliato",
    review: "Da ripassare",
    nextAction: "Prossima azione",
    whatNow: "Cosa facciamo adesso",
  },
  en: {
    appSubtitle: "Numbers, bars and strategies for primary school",
    navHome: "Home",
    navResults: "Results",
    navParents: "Parents",
    activeClass: "Active class",
    login: "Log in",
    close: "Close",
    loginStage: "MVP access",
    loginTitle: "Log in",
    loginDescription:
      "The page remains visible to everyone. Login opens the personal dashboard and saves the child's learning path.",
    invalidCredentials: "Invalid credentials. For now use admin and admin.",
    username: "Username",
    password: "Password",
    loginWithAdmin: "Log in with admin",
    demoCredentials: "Demo credentials",
    profile: "Profile",
    logout: "Log out",
    profileArea: "Profile area",
    profileTitle: "Profile of",
    profileDescription: "Choose the child's safe avatar here and log out of the demo account.",
    logoutFrom: "Log out",
    publicBadge: "Singapore Math method for primary school",
    publicTitle: "Learn math through images, logic and safe small steps.",
    publicDescription:
      "Each activity combines numbers, visual reasoning, bar models and problem solving at a child-friendly pace.",
    classes: "Classes",
    topics: "Topics",
    exercises: "Exercises",
    activePath: "Active path",
    children: "Children",
    concrete: "Concrete",
    pictorial: "Pictorial",
    abstract: "Abstract",
    concreteText: "Count, compare, build",
    pictorialText: "Draw bars, groups and parts",
    abstractText: "Solve, explain and check",
    whyWorks: "Why it works",
    clearLearning: "Clear and reassuring learning",
    readyToGrow: "Ready to grow",
    phaseTwoBase: "A solid base for phase 2",
    personalDashboard: "Personal dashboard",
    helloPrefix: "Hi",
    helloSuffix: "this is your path.",
    fullName: "Full name",
    avatar: "Avatar",
    startingClass: "Starting class",
    currentClass: "Active class",
    pathStatus: "Path status",
    continueIn: "Continue in",
    latestResults: "View latest results",
    educationalStatus: "Educational status",
    accuracy: "accuracy",
    start: "Start",
    consolidation: "Consolidation",
    nextStep: "Next step",
    firstAccessReady: "First access ready",
    bestStars: "best stars in",
    chooseTopic: "Choose a topic in",
    sessionsDone: "Sessions done",
    averageAccuracy: "Average accuracy",
    activeTopics: "Active topics",
    availableExercises: "Available exercises",
    educationPathStatus: "Educational path status",
    classVision: "Class overview",
    pathwayMap: "Learning path map",
    nextLessons: "Next lessons for",
    openPath: "Open path",
    recommended: "Recommended",
    review: "Review",
    nextAction: "Next action",
    whatNow: "What shall we do now",
  },
} as const;
