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
        generic: "Er is een fout opgetreden."
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
      title: "Mijn stages"
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
      open: "Open",
    }, logbooks: {
  supervisorOverview: "Logboek opvolging",
  supervisorInterns: "overzicht van alle stagiairs",
  interns: "Stagiairs",
  lastWeek: "Laatste week",
  week: "Week",
  loading: "Laden...",
  noInterns: "Geen stagiairs gevonden",
  viewOverview: "Open overzicht",
  status: {
    submitted: "Ingediend",
    approved: "Goedgekeurd",
    adjustment_required: "Aanpassing vereist",
    open: "open",
    none: "nog geen logboeken"
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