export type Locale = "it" | "en";

const LOCALE_STORAGE_KEY = "singapore-math-locale";

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
