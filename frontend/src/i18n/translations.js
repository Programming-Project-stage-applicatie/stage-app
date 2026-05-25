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
    stages: "Stages",

    status_pending: "In behandeling",
    status_approved: "Goedgekeurd",
    status_rejected: "Afgewezen",

    
    login: {
      errors: {
          invalidCredentials: "Ongeldige gebruikersnaam of wachtwoord",
          requiredFields: "Gebruikersnaam en wachtwoord zijn verplicht",
          accountInactive: "Dit account is gedeactiveerd. Neem contact op met een beheerder.",
          generic: "Er is een fout opgetreden"
      }
    },

    adminUsers: {
      title: "Gebruikers",
      backToDashboard: "Terug naar dashboard",
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
        studyprogram: "Opleiding",
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
        generic: "Er is een fout opgetreden.",
        userInUse: "Deze gebruiker is nog gekoppeld aan bestaande gegevens en kan niet verwijderd worden."
      },



    },

    
    dashboards: {
      student: "Student dashboard",
      teacher: "Docent dashboard",
      mentor: "Mentor dashboard",
      internship_committee: "Stagecommissie dashboard",
      admin: "Administratie dashboard"
    },

    adminInternships: {
      fetchError: "Kon stages niet ophalen",
      detailFetchError: "Kon stage niet ophalen",
      loading: "Laden...",
      detailTitle: "Stage detail",
      backToDashboard: "Terug naar dashboard",
      company: "Bedrijf",
      student: "Student",
      period: "Periode",
      status: "Status",
      description: "Stageopdracht",
      mentor: "Mentor",
      teacher: "Docent",
      notAssigned: "Nog niet toegewezen",
      selectMentor: "Selecteer mentor",
      selectTeacher: "Selecteer docent",
      withoutMentor: "Stages zonder mentor",
      withoutTeacher: "Stages zonder docent",
      withoutBoth: "Stages zonder mentor en docent",
      noneWithoutMentor: "Geen stages zonder mentor",
      noneWithoutTeacher: "Geen stages zonder docent",
      noneWithoutBoth: "Geen stages zonder mentor en docent",
      save: "Opslaan",
      saved: "Stage succesvol bijgewerkt",
      saveError: "Opslaan mislukt" 
    },

    
    studentDashboard: {
      welcome: "Welkom",
      title: "Stages"
    },

    studentInternships: {
      fetchError: "Kon stages niet ophalen",
      
      backToDashboard: "Terug naar dashboard",
      detailTitle: "Stage details",
      company: "Bedrijf",
      period: "Stageperiode",
      status: "Status",
      description: "Beschrijving",
      mentor: "Mentor",
      teacher: "Docent",
      notAssigned: "Niet toegewezen",
      loading: "Laden...",
      detailFetchError: "Fout bij ophalen stagegegevens",

      none: "Je hebt momenteel geen stage",
      period: "Stageperiode",
      stage: "Stage",
      logbooks: "Logboeken",
      evaluation: "Finale evaluatie",
      open: "Open"
    },
FinaleEvaluatieDocent: {
  title:                   "Finale Evaluatie — Docent",
  loading:                 "Laden…",
  retry:                   "Opnieuw proberen",
  statusOpen:              "Open",
  statusSubmitted:         "Ingediend",
  statusEvaluated:        "Geëvalueerd",
  statusUnknown:           "Onbekend",
  student:                 "Student",
  company:                 "Stagebedrijf",
  mentor:                  "Mentor",
  teacher:                 "Docent",
  notYetSubmittedWarning:  "De student heeft zijn eindpresentatie nog niet ingediend.",
  sectionPresentation:     "Eindpresentatie Student",
  submittedBadge:          "Ingediend",
  presentationDescription: "Omschrijving eindpresentatie",
  noDescriptionAvailable:  "Geen omschrijving beschikbaar.",
  noAttachment:            "Geen bestand bijgevoegd.",
  clickToOpen:             "klik om te openen",
  notYetSubmittedInfo:     "De student heeft nog geen eindpresentatie ingediend.",
  sectionMentorFeedback:   "Feedback Mentor",
  noMentorFeedback:        "Geen feedback mentor.",
  sectionTeacherFeedback:  "Feedback Docent",
  finalScore:              "Eindscore",
  feedback:                "Feedback",
  scoreOptionalLabel:      "Eindscore (0–20) — optioneel:",
  feedbackPlaceholder:     "Schrijf hier uw feedback voor de student...",
  noFeedbackEntered:       "Geen feedback ingevoerd.",
  canFillWhenSubmitted:    "Beoordeling kan worden ingevoerd zodra de student de eindpresentatie heeft ingediend.",
  finalizeCheckbox:        "Beëindig evaluatie",
  finalizeNote:            "student kan de beoordeling zien en status wordt \"Geëvalueerd\"",
  save:                    "OPSLAAN",
  saving:                  "BEZIG…",
  editAssessment:          "BEOORDELING BEWERKEN",
  backToDashboard:         "← Terug naar dashboard",
  successSaved:            "✅ Score en feedback succesvol opgeslagen.",
  successFinalized:        "✅ Evaluatie beëindigd en opgeslagen.",
  errorInvalidScore:       "Vul een geldige score in (0–20).",
  errorFetchFailed:        "Er ging iets mis bij het ophalen.",
  errorSubmitFailed:       "Er ging iets mis bij het indienen.",
  errorDocumentFailed:     "Er ging iets mis bij het openen van het document.",
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