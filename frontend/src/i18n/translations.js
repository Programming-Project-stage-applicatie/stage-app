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
      }
    }

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