const translations = {
  nl: {
    loginTitle: "Meld je aan",
    usernameLabel: "Gebruikersnaam",
    passwordLabel: "Wachtwoord",
    loginButton: "Inloggen",
    noAccountHelp: "Geen toegang? Contacteer administratie@ehb.be",
    welcome: "Welkom",
    loggedIn: "Je bent nu ingelogd.",
    invalidCredentials: "Ongeldige gebruikersnaam of wachtwoord.",
    accountInactive: "Je account is niet actief.",
    requiredFields: "Alle velden zijn verplicht.",
    serverError: "Kan geen verbinding maken met de server.",

    adminUsers: {
      title: "Gebruikers",
      newRow: "Nieuwe lijn",
      save: "Opslaan",
      cancel: "Annuleren",
      actions: "Acties",
      edit: "Bewerken",
      resetPassword: "Reset wachtwoord",
      confirmResetPassword: "Geef een nieuw wachtwoord in voor deze gebruiker:",
      passwordRequired: "Wachtwoord is verplicht.",
      passwordResetSuccess: "Wachtwoord succesvol aangepast.",
      delete: "Verwijderen",
      confirmDelete: "Ben je zeker dat je deze gebruiker wil verwijderen?",
      allFieldsRequired: "Alle velden zijn verplicht.",

      fields: {
        firstname: "Voornaam",
        lastname: "Naam",
        email: "E-mailadres",
        username: "Gebruikersnaam",
        password: "Wachtwoord",
        role: "Rol",
        status: "Status"
      },

      roles: {
        admin: "Administratie",
        student: "Student",
        teacher: "Docent",
        mentor: "Mentor",
        internship_committee: "Stagecommissie"
      },

      status: {
        active: "Actief",
        inactive: "Inactief"
      },

      messages: {
        success: "Gebruiker succesvol aangemaakt.",
        duplicateEmail: "Deze gebruiker (e-mail) bestaat al.",
        genericError: "Er is een fout opgetreden."
      },

      errors: {
        requiredFields: "Alle verplichte velden moeten ingevuld zijn.",
        emailTaken: "Dit e-mailadres is al in gebruik.",
        usernameTaken: "Deze gebruikersnaam is al in gebruik.",
        generic: "Er is een fout opgetreden."
      }
    },

    
    dashboards: {
      student: "Student dashboard",
      teacher: "Docent dashboard",
      mentor: "Mentor dashboard",
      internship_committee: "Stagecommissie dashboard",
      admin: "Administratie dashboard"
    },
    logbooks: {
  title: "Logboek",
  overview: "Overzicht",
  addButton: "+ logboek toevoegen",
  noLogbooks: "Nog geen logboeken. Klik op '+ logboek toevoegen' om te starten.",
  week: "Week",
  action: "Actie",
  fill: "invullen",
  view: "bekijken",
  newLogbook: "Nieuw logboek",
  weekNumber: "Weeknummer",
  weekPlaceholder: "bv. 5",
  weekExists: "Er bestaat al een logboek voor week",
  tasks: "Uitgevoerde taken",
  tasksDescription: "Wat heb je deze week gedaan?",
  tasksPlaceholder: "Beschrijf je taken concreet...",
  reflection: "Reflectie",
  reflectionDescription: "Wat heb je geleerd? Wat liep goed of moeilijker?",
  reflectionPlaceholder: "Jouw reflectie op de week...",
  problems: "Problemen / leerpunten",
  problemsDescription: "Welke problemen liep je tegen? Wat wil je nog leren?",
  problemsPlaceholder: "Beschrijf problemen of leerpunten...",
  save: "opslaan als concept",
  submit: "indienen",
  back: "terug naar overzicht",
  saving: "Bezig...",
  saveError: "Er ging iets mis. Probeer opnieuw.",
  confirmTitle: "Logboek indienen?",
  confirmText: "Weet je zeker dat je wil indienen? Je kan daarna niet meer bewerken.",
  confirmYes: "Ja, indienen",
  confirmCancel: "Annuleren",
  supervisorOverview: "Logboek opvolging",
  supervisorSubtitle: "Overzicht van alle studenten",
  supervisorInterns: "Overzicht van alle stagiairs",
  lastWeek: "Laatste week",
  viewOverview: "Bekijk overzicht",
  noStudents: "Geen studenten gevonden",
  noInterns: "Geen stagiairs gevonden",
  loading: "Laden...",
  logbookOverview: "LOGBOEK OVERZICHT",
  edit: "aanpassen",
  mentorFeedback: "Feedback Mentor",
  interns: "Stagiairs",
  notFilled: "Niet ingevuld",
  yourFeedback: "Jouw feedback (optioneel)",
  feedbackPlaceholder: "geef feedback op dit logboek.",
  saved: "Opgeslagen!",
  submitFeedback: "Indienen",
  backBtn: "Terug",
  filter: {
    all: "Alle"
  },
  status: {
    submitted: "Ingediend",
    approved: "Goedgekeurd",
    adjustment_required: "Aanpassingen vereist",
    open: "Open",
    none: "Nog geen logboeken"
  }
},

  }
};

// nl fixed for now
const currentLanguage = "nl";


/* vertaalfunctie:
    Gebruik:
      t("loginTitle")
      t("adminUsers.title")
      t("adminUsers.fields.firstname")
*/
export const t = (key) => {
  return (
   key
    .split(".")
    .reduce((obj, k) => (obj ? obj[k] : null), translations[currentLanguage])
  || key
  );
};