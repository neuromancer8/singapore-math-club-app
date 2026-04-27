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
  confronti: { en: { label: "Comparisons", description: "Greater than, less than and equal to" } },
  sequenze: { en: { label: "Sequences", description: "Complete patterns and number jumps" } },
  "addizione-sottrazione": { en: { label: "Addition and subtraction", description: "Calculation and strategies" } },
  "calcolo-mentale": { en: { label: "Mental calculation", description: "Fast strategies and friendly numbers" } },
  problemi: { en: { label: "Word problems", description: "Short problems in words" } },
  "bar-model-base": { en: { label: "Basic bar model", description: "Represent quantities with visual bars" } },
  "doppi-meta": { en: { label: "Doubles and halves", description: "Double, halve and reason with parts" } },
  "geometria-base": { en: { label: "Basic geometry", description: "Shapes, sides and simple positions" } },
  "misure-semplici": { en: { label: "Simple measures", description: "Lengths, euros and everyday time" } },
  "misure-tempo": { en: { label: "Measures and time", description: "Read simple measures, clocks and sequences" } },
  moltiplicazione: { en: { label: "Multiplication", description: "Groups and repeated addition" } },
  tabelline: { en: { label: "Times tables", description: "Recall useful facts with confidence" } },
  divisione: { en: { label: "Division", description: "Sharing and grouping" } },
  "problemi-a-passi": { en: { label: "Multi-step problems", description: "Choose the right order of operations" } },
  "bar-model": { en: { label: "Bar model", description: "Visualise the problem" } },
  misure: { en: { label: "Measures", description: "Lengths, masses and capacity" } },
  geometria: { en: { label: "Geometry", description: "Shapes, sides and intuitive angles" } },
  "dati-e-logica": { en: { label: "Data and logic", description: "Read tables and find rules" } },
  "geometria-perimetro": { en: { label: "Geometry and perimeter", description: "Measure sides and build shapes" } },
  "calcolo-scritto": { en: { label: "Written calculation", description: "Organised strategies for longer operations" } },
  "frazioni-base": { en: { label: "Basic fractions", description: "Halves, thirds and quarters with images" } },
  "problemi-avanzati": { en: { label: "Advanced problems", description: "More steps, more strategies" } },
  frazioni: { en: { label: "Intuitive fractions", description: "Parts of the whole" } },
  "bar-model-avanzato": { en: { label: "Advanced bar model", description: "Represent and solve" } },
  "numeri-decimali": { en: { label: "Decimal numbers", description: "Tenths and hundredths in real contexts" } },
  equivalenze: { en: { label: "Unit conversions", description: "Change units without losing meaning" } },
  "perimetro-area": { en: { label: "Perimeter and area", description: "Measure the border and the space" } },
  "dati-e-grafici": { en: { label: "Data and charts", description: "Read information from tables and charts" } },
  logica: { en: { label: "Logic", description: "Strategies, rules and reasoning" } },
  "operazioni-strategiche": { en: { label: "Strategic operations", description: "Multiply, divide and check with method" } },
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

export function cpaStageLabel(stage: "Concrete" | "Pittorico" | "Astratto", locale: Locale) {
  const labels = {
    it: {
      Concrete: "Concrete",
      Pittorico: "Pittorico",
      Astratto: "Astratto",
    },
    en: {
      Concrete: "Concrete",
      Pittorico: "Pictorial",
      Astratto: "Abstract",
    },
  } as const;

  return labels[locale][stage];
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
      "La pagina resta visibile a tutti. Il genitore accede, sceglie il profilo del bambino e sincronizza progressi e dashboard.",
    invalidCredentials: "Credenziali non valide. Controlla email e password oppure crea un nuovo account genitore.",
    email: "Email",
    password: "Password",
    confirmPassword: "Conferma password",
    loginWithAdmin: "Accedi all'area genitore",
    demoCredentials: "Account disponibili",
    profile: "Profilo",
    logout: "Esci",
    profileArea: "Area profilo",
    profileTitle: "Profilo di",
    profileDescription: "Da qui il genitore sceglie il profilo attivo, cambia avatar e aggiunge altri bambini.",
    logoutFrom: "Esci da",
    parentArea: "Area genitore",
    familyProfiles: "Profili famiglia",
    activeProfile: "Profilo attivo",
    switchProfile: "Apri questo profilo",
    createAccount: "Registrati",
    createParentAccount: "Crea account genitore",
    haveAccount: "Hai gia un account?",
    noAccountYet: "Non hai ancora credenziali?",
    parentFirstName: "Nome genitore",
    parentLastName: "Cognome genitore",
    childFirstName: "Nome bambino/a",
    childLastName: "Cognome bambino/a",
    childGrade: "Classe del bambino/a",
    childAvatar: "Avatar iniziale",
    registerDescription:
      "Il genitore si registra una sola volta e crea il primo profilo bambino. In seguito puo aggiungerne altri dall'area profilo.",
    registerNow: "Crea account e primo profilo",
    emailTaken: "Questa email e gia in uso. Proviamo con un'altra.",
    registerInvalid: "Compila tutti i campi principali per creare l'account.",
    registerInvalidEmail: "Inserisci un'email valida del genitore.",
    registerPasswordShort: "La password deve avere almeno 8 caratteri.",
    registerPasswordMismatch: "Le due password non coincidono ancora.",
    registerChecklistTitle: "Controllo rapido prima di creare l'account",
    registerCheckParent: "Nome e cognome del genitore",
    registerCheckChild: "Nome e cognome del bambino/a",
    registerCheckEmail: "Email valida del genitore",
    registerCheckPassword: "Password di almeno 8 caratteri",
    registerCheckConfirm: "Conferma password uguale",
    verificationRequired: "Ti abbiamo inviato una verifica email. Conferma l'indirizzo del genitore prima di accedere.",
    verificationPending: "Questa email non e ancora verificata.",
    resendVerification: "Invia di nuovo la verifica email",
    forgotPassword: "Hai dimenticato la password?",
    passwordRecovery: "Recupera password",
    recoveryDescription: "Inserisci l'email del genitore e ti inviamo il link per impostare una nuova password.",
    sendRecoveryLink: "Invia link di recupero",
    previewLink: "Apri link di anteprima",
    emailSent: "Email inviata correttamente.",
    previewReady: "Apri il link qui sotto per continuare subito.",
    previewFallbackNotice:
      "Su questa versione l'invio email automatico non e ancora attivo. Usa il pulsante qui sotto per aprire subito il link di verifica o recupero.",
    backToLogin: "Torna al login",
    addChild: "Aggiungi un bambino",
    addChildDescription: "Crea un nuovo profilo bambino collegato allo stesso account genitore.",
    saveChild: "Salva profilo bambino",
    parentName: "Genitore",
    childProfiles: "Profili bambino",
    currentProfile: "Profilo corrente",
    createAnotherChild: "Crea un altro profilo",
    familyAccess: "Accesso famiglia",
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
      "The page stays visible to everyone. The parent logs in, chooses the child's profile and syncs progress and dashboards.",
    invalidCredentials: "Invalid credentials. Check email and password or create a new parent account.",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    loginWithAdmin: "Log in to the parent area",
    demoCredentials: "Available accounts",
    profile: "Profile",
    logout: "Log out",
    profileArea: "Profile area",
    profileTitle: "Profile of",
    profileDescription: "The parent can choose the active child profile, change avatars and add more children here.",
    logoutFrom: "Log out",
    parentArea: "Parent area",
    familyProfiles: "Family profiles",
    activeProfile: "Active profile",
    switchProfile: "Open this profile",
    createAccount: "Register",
    createParentAccount: "Create parent account",
    haveAccount: "Already have an account?",
    noAccountYet: "Do you need credentials?",
    parentFirstName: "Parent first name",
    parentLastName: "Parent last name",
    childFirstName: "Child first name",
    childLastName: "Child last name",
    childGrade: "Child grade",
    childAvatar: "Starting avatar",
    registerDescription:
      "The parent registers once and creates the first child profile. More child profiles can be added later from the profile area.",
    registerNow: "Create account and first profile",
    emailTaken: "This email is already in use. Let's try another one.",
    registerInvalid: "Fill in the main fields to create the account.",
    registerInvalidEmail: "Enter a valid parent email.",
    registerPasswordShort: "The password must be at least 8 characters long.",
    registerPasswordMismatch: "The two passwords do not match yet.",
    registerChecklistTitle: "Quick check before creating the account",
    registerCheckParent: "Parent first name and last name",
    registerCheckChild: "Child first name and last name",
    registerCheckEmail: "Valid parent email",
    registerCheckPassword: "Password with at least 8 characters",
    registerCheckConfirm: "Matching password confirmation",
    verificationRequired: "We sent a verification email. Confirm the parent email before logging in.",
    verificationPending: "This email has not been verified yet.",
    resendVerification: "Send verification email again",
    forgotPassword: "Forgot your password?",
    passwordRecovery: "Recover password",
    recoveryDescription: "Enter the parent's email and we will send a link to set a new password.",
    sendRecoveryLink: "Send recovery link",
    previewLink: "Open preview link",
    emailSent: "Email sent successfully.",
    previewReady: "Open the link below to continue right away.",
    previewFallbackNotice:
      "Automatic email delivery is not active on this version yet. Use the button below to open the verification or recovery link right away.",
    backToLogin: "Back to login",
    addChild: "Add a child",
    addChildDescription: "Create another child profile linked to the same parent account.",
    saveChild: "Save child profile",
    parentName: "Parent",
    childProfiles: "Child profiles",
    currentProfile: "Current profile",
    createAnotherChild: "Create another profile",
    familyAccess: "Family access",
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
