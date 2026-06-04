# Stage Monitoring Tool

## Overzicht
Een webapplicatie voor het opvolgen van stages, logboeken en evaluaties. De applicatie ondersteunt meerdere rollen: student, mentor, docent, stagecommissie en admin.

## Technologieën
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MySQL

## Installatie

### Backend
\```bash
cd backend
npm install
node server.js
\```

### Frontend
\```bash
cd frontend
npm install
npm run dev
\```

### Environment variables
Maak een `.env` bestand aan in de `backend` map:
\```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=jouw_database
\```

## Functionaliteiten per rol

### Student
- Stageaanvraag indienen en aanpassen
- Logboeken aanmaken, opslaan en indienen
- Finale evaluatie bekijken

### Mentor
- Logboeken van studenten opvolgen
- Feedback geven en logboeken goed- of afkeuren
- Finale evaluaties beheren

### Docent
- Logboeken van studenten opvolgen
- Optionele feedback geven
- Finale evaluaties beheren

### Stagecommissie
- Stageaanvragen beoordelen
- Status wijzigen (goedgekeurd, afgekeurd, aanpassingen vereist)

### Admin
- Gebruikersbeheer
- Overzicht van alle stages

## API Endpoints

### Authenticatie
| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| POST | /auth/login | Inloggen |

### Stageaanvragen
| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| POST | /internship-requests | Nieuwe aanvraag indienen |
| GET | /internship-requests | Alle aanvragen ophalen |
| GET | /internship-requests/:id | Detail van één aanvraag |
| PATCH | /internship-requests/:id | Aanvraag aanpassen |
| PATCH | /internship-requests/:id/status | Status wijzigen |

### Logboeken
| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | /api/logbooks | Logboeken van student ophalen |
| POST | /api/logbooks | Nieuw logboek aanmaken |
| PUT | /api/logbooks/:id/save | Logboek opslaan |
| PUT | /api/logbooks/:id/submit | Logboek indienen |

### Supervisor
| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | /api/supervisor/teacher/logbooks | Logboeken per docent |
| GET | /api/supervisor/mentor/logbooks | Logboeken per mentor |
| GET | /api/supervisor/internship/:id/logbooks | Logboeken per stage |
| GET | /api/supervisor/logbooks/:id/detail | Detail logboek |
| POST | /api/supervisor/logbooks/:id/feedback | Feedback opslaan |

## Projectstructuur
\```
stage-app/
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── logbooks/
        ├── styles/
        └── i18n/
\```
