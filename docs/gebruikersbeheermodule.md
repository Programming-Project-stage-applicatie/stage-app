# Gebruikersbeheer Module van de Stage Monitor Tool.  

## Inleiding

Deze module zorgt ervoor dat gebruikers zich kunnen authenticeren en dat hun toegang tot de applicatie bepaald wordt op basis van hun rol.

De applicatie ondersteunt verschillende gebruikersrollen:

- Administratie
- Student
- Docent
- Mentor
- Stagecommissie

Elke rol heeft toegang tot een specifiek dashboard en bijhorende functionaliteiten.

---

## Functionaliteit

De module voorziet in volgende kernfunctionaliteiten:

- Inloggen van gebruikers met validatie van credentials
- Automatische doorverwijzing naar rolspecifieke dashboards
- Aanmaken van nieuwe gebruikers door de admin
- Beheren en aanpassen van bestaande gebruikers
- Verwijderen van gebruikers
- Opslag van rolspecifieke gegevens (zoals opleiding bij studenten)

Daarnaast wordt gezorgd voor een consistente koppeling tussen gebruikers en hun roldata.

---

## User Stories

### Authenticatie

- Als gebruiker wil ik kunnen inloggen zodat ik toegang krijg tot de applicatie.
- Als ingelogde gebruiker wil ik automatisch naar mijn dashboard gestuurd worden zodat ik meteen kan werken.

---

### Gebruikersbeheer

- Als admin wil ik gebruikers kunnen aanmaken zodat elke rol toegang krijgt.
- Als admin wil ik gebruikers kunnen aanpassen zodat gegevens correct blijven.
- Als admin wil ik gebruikers kunnen verwijderen zodat het systeem overzichtelijk blijft.

---

### Datamodel

- Als admin wil ik dat bij het aanmaken van een gebruiker ook de rolspecifieke gegevens correct worden aangemaakt.
- Als admin wil ik bij studenten een opleiding kunnen opslaan zodat studentgegevens volledig zijn.

---

### Dashboards

- Als admin wil ik mijn dashboard zien zodat ik gebruikersbeheer en stages kan opvolgen.
- Als student wil ik mijn stage-informatie zien zodat ik inzicht heb in mijn traject.

---

## Technische Uitwerking

### Backend

De backend is opgebouwd met Node.js, Express en MySQL.

Belangrijke aspecten:

- REST API voor gebruikersbeheer
- JWT authenticatie
- Middleware voor autorisatie
- Scheiding tussen algemene gebruikersdata en rolspecifieke data

---

### Frontend

De frontend is gebouwd met React en maakt gebruik van:

- React Router voor navigatie
- Custom i18n systeem voor vertalingen
- Component-based structuur

Belangrijke pagina’s:

- Login scherm
- Admin dashboard
- Gebruikersbeheer pagina
- Student dashboard

---

## Database Structuur

De applicatie maakt gebruik van een relationele database waarbij gebruikers en rollen gescheiden worden beheerd.

### Users

Bevat de algemene gebruikersinformatie:

- id (PK)
- firstname
- lastname
- email
- username
- password
- role
- status

---

### Students

Bevat studenten-specifieke data:

- id (PK)
- user_id (FK → users.id)
- studyprogram

---

### Teachers

- id (PK)
- user_id (FK → users.id)

(Bevat geen extra velden, enkel koppeling naar gebruiker)

---

### Mentors

- id (PK)
- user_id (FK → users.id)

(Bevat geen extra velden, enkel koppeling naar gebruiker)

---

### Internship_committees

- id (PK)
- user_id (FK → users.id)

(Bevat geen extra velden, enkel koppeling naar gebruiker)

---

### Relaties

- Elke gebruiker heeft exact één rol
- Rolspecifieke tabellen zijn gekoppeld via user_id
- Dit zorgt voor:
  - uitbreidbaarheid
  - duidelijke scheiding van verantwoordelijkheden
  - eenvoudige onderhoudbaarheid

---

## API Endpoints

### Authenticatie

POST /login
- valideert gebruikersgegevens
- geeft JWT token terug

### Users API

GET /users
POST /users
PUT /users/:id
DELETE /users/:id

Functionaliteit:
- Ophalen van alle gebruikers
- Aanmaken van een gebruiker
- Bewerken van gebruikersgegevens
- Verwijderen van gebruikers

---

### Extra validaties

- Unieke e-mail en username
- Rolgebaseerde velden (zoals studieprogramma)

---

## Admin Dashboard Functionaliteit

De admin krijgt een overzicht van:

- Totaal aantal gebruikers  
- Stages zonder mentor  
- Stages zonder docent  
- Stages zonder beide  

Vanuit het dashboard kan de admin:
- Navigeren naar gebruikersbeheer
- Stages toewijzen

---

## Authenticatie & Autorisatie

De applicatie gebruikt JWT tokens:

- Tokens worden opgeslagen in localStorage
- Elke request bevat een Authorization header
- Backend valideert gebruiker en rol

Op basis van de rol krijgt de gebruiker enkel toegang tot relevante functionaliteiten.

---

## Internationalisatie 

De applicatie ondersteunt vertalingen via een eigen i18n systeem.

Voorbeeld:
t("adminUsers.title")

Op dit moment is Nederlands de primaire taal.

## Validaties & Foutenafhandeling

- Verplichte velden worden gecontroleerd
- Email en username moeten uniek zijn = dubbele gebruikers worden verhinderd
- Rolstpecifieke velden worden gevalideerd
- Backend geeft gepaste foutmeldingen terug
- Fouten worden weergegeven via UI meldingen

## Testing

De module werd getest op:
- Correcte login flow
- Role-based redirects
- CRUD operaties op gebruikers
- Dashboard rendering
- API responses


## Resultaat##  een volledig geïntegreerde oplossing bestaande uit:

- Een werkende en veilige login flow
- Role-based toegang tot dashboards
- Efficiënt beheer van gebruikers
- Correct gestructureerde database
- Gebruiksvriendelijke interface voor de admin

De module vormt de basis voor verdere functionaliteiten binnen de applicatie.


