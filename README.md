# Stage App – Backend

Dit is de backend van de Stage App, een applicatie waarmee studenten stageaanvragen kunnen indienen en de stagecommissie deze aanvragen kan beheren.

## Functionaliteiten

- POST endpoint voor het indienen van stageaanvragen
- Validatie van verplichte velden
- Opslag van aanvragen in MySQL database
- GET endpoint om alle stageaanvragen op te halen (indien aanwezig)
- Structuur met Express routers
- Middleware voor databaseconnectie

## Technologieën

- Node.js
- Express.js
- MySQL (mysql2)
- dotenv
- Thunder Client / Postman voor testen

## Installatie

1. Clone de repository:
   ```bash
   git clone <repo-url>
Ga naar de backend map:

bash
cd backend
Installeer dependencies:

bash
npm install
Maak een .env bestand aan met:

Code
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=...
DB_NAME=stage_app
Server starten
bash
npm start
De server draait standaard op:

Code
http://localhost:3000

API Endpoints
POST /internship-requests
Voegt een nieuwe stageaanvraag toe.

Body voorbeeld:

json
{
  "student_id": 1,
  "company": "Testbedrijf",
  "description": "Dit is een testaanvraag",
  "start_date": "2026-01-01",
  "end_date": "2026-02-01"
}

Respons:

json
{
  "message": "Stageaanvraag succesvol ingediend",
  "request_id": 1
}

GET /internship-requests
Haalt alle stageaanvragen op.

Projectstructuur
Code
backend/
│ server.js
│ .env
│ package.json
│ README.md
│
└── routes/
    └── internship_requests.js

Team Workflow
-Werken met feature branches
-Commits per user story
-Pull requests naar develop
-Code review voor merge

Licentie
Schoolproject – geen commerciële licentie.


