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

### Internship Requests API
- Zie: docs/stageaanvragen-api.md

# 🧩 Branch `develop`

De **develop-branch** is een integratiebranch waar alle nieuwe functionaliteiten en bugfixes samenkomen voordat ze naar productie gaan.

👉 Alles wordt eerst gemerged in `develop` voordat het naar `main` gaat. Dit is het belangrijkste principe.

De `develop` branch is een **work in progress** versie van de applicatie waar alle features samen worden getest om te controleren of alles correct samenwerkt.

---

## 🔄 Workflow

```
feature branches → develop → main
```

---

## 📌 Rol van `develop`

* Alle feature-branches worden eerst gemerged in `develop`
* `develop` wordt gebruikt als test- en integratieomgeving
* Hier wordt gecontroleerd of alle functionaliteiten samen correct werken
* Wanneer alles stabiel is, wordt `develop` gemerged naar `main`

---

## 🚀 Rol van `main`

* `main` is de versie van de code die **naar productie kan**
* Dit is de stabiele en afgewerkte versie van het project
* Er wordt niet rechtstreeks op `main` gewerkt

---

## 🔄 Belangrijk principe

* Ontwikkelaars werken op `feature/*` branches
* Alles gaat eerst naar `develop` (merge stap)
* Daarna pas van `develop` naar `main` voor productie
