# Stage Monitoring Tool

## Algemeen

Webappllicatie voor het beheer van het volledige stageproces binnen EhB (stageaanvraag -> logboeken -> evaluatie)

De Stage Monitoring Tool is een centrale digitale omgeving voor:
-	Studenten
-	Stagecommissie
-	Docenten (EhB)
-	Stagementoren en hun bedrijf
-	Administratie

## Workflows

### Git Branch Workflow
- main = protected, alleen releases
- develop = branch voor het team
- feature/* = individuele taken (gelinkt met Trello user stories)
    nieuwe feature starten:
        git checkout develop 
        git pull
        git checkout -b feature/[jouw feature]
- docs/* = documentatie updates
    nieuwe documentatie starten:
        git checkout develop
        git pull
        git checkout -b docs/readme-update
- push
    git add .
    git commit -m "update"
    git push

### Trello Workflow
- kaart aanmaken
- GitHub (Power-up) verbinden
- Branch koppelen 
- Commits verschijnen automatisch op de Trello kaart
- Kaart = Done na testing en merge

## Installatie

### Repo clonen
git clone https://github.com/Programming-Project-stage-applicatie/stage-app.git
cd stage-app


### Backend starten
cd backend  
npm install  
node server.js

### Frontend starten
cd frontend  
npm install  
npm run dev

## API Modules

### Users API
- Gebruikers ophalen (GET /users)
- Gebruikers toevoegen (POST /users)
- Bcrypt
- Database tabel: "users"
- Testen via Thunder Client
