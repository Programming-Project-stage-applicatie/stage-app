# Stage Monitoring Tool

Een centrale digitale omgeving voor het beheren en opvolgen van het volledige stageproces — van aanvraag tot eindevaluatie.

---

## Probleemstelling

Binnen de opleiding verloopt het stageproces momenteel deels manueel en verspreid over meerdere platformen. Dit leidt tot:

- Versnippering van informatie
- Onduidelijkheid in status en opvolging
- Logge, foutgevoelige administratie
- Weinig transparantie en communicatie tussen betrokken partijen

## Doelstelling

De Stage Monitoring Tool biedt **één uniforme digitale omgeving** voor studenten, docenten, stagementoren, stagecommissie en administratie. Het systeem ondersteunt het volledige stageproces en maakt het helder, centraal en volledig traceerbaar.

---

## Gebruikers (Personas)

| Rol | Beschrijving |
|---|---|
| **Student** | Volgt stage, dient aanvraag in, vult logboeken in |
| **Stagecommissie** | Beoordeelt en keurt stageaanvragen goed of af |
| **Docent** | Volgt studenten op, geeft feedback op logboeken en eindevaluatie |
| **Stagementor** | Begeleidt student op werkvloer, keurt logboeken goed |
| **Bedrijf** | Raadpleegt logboeken van de student |
| **Administratie** | Beheert gebruikers, valideert documenten, raadpleegt eindrapport |

---

## Functionaliteiten

### Fase 1 — MVP (In Scope)

#### Authenticatie & Gebruikersbeheer
- Inloggen op basis van geldige gebruikersgegevens
- Rollen & rechten per profiel
- Aanmaken van nieuwe gebruikers door de administratie

#### Stageaanvraag
- Indienen van een nieuwe stageaanvraag (student, bedrijf, docent, mentor, periode, omschrijving)
- Statusopvolging: `Ingediend` → `Wacht op goedkeuring` → `Goedgekeurd` / `Aanpassingen vereist` / `Afgekeurd`
- Beoordeling door de stagecommissie met feedback

#### Wekelijkse Logboeken
- Aanmaken, invullen, indienen en aanpassen door student
- Feedback en goedkeuring door mentor
- Feedback door docent
- Raadplegen door student, docent en mentor

#### Finale Evaluatie
- Eindmotivatie + bijlage uploaden door student
- Motivatie door mentor
- Eindevaluatie en eindscore door docent
- Alleen-lezen toegang voor student, mentor en administratie

#### Dashboard
- Gepersonaliseerd dashboard per rol met relevante overzichten en acties

---

### Fase 2 — Nice To Have

- Annuleren/verwijderen van stageaanvragen
- Filteren van aanvragen door stagecommissie
- Ziekte/afwezigheid registreren in logboek
- Finalisatie van evaluaties door docent
- Upload en validatie van stageovereenkomsten
- Vervanging van docent of mentor
- Notificaties (statuswijzigingen, herinneringen, feedback)
- Competentiebeheer en evaluatieschema per student
- Uitgebreid dashboard met filteropties

---

### Fase 3 — Out of Scope

- Zelf aanmaken / resetten van eigen gebruiker
- Tussentijdse scores op competenties
- E-mailintegratie
- Digitale handtekeningen (bv. DocuSign)
- Live chat
- Handleidingen / FAQ binnen de app
- Integratie met bestaande systemen
- Rapportages en statistieken
- Beveiliging (geavanceerd)
- Meerdere stages tegelijk per student

---

## User Stories

Het project omvat **23 user stories** voor het MVP, verdeeld over alle rollen:

- **Student** (US 1–3, 7–8, 15–16): aanvragen, logboeken, evaluatie
- **Stagecommissie** (US 4–6): goedkeuren, afkeuren, overzicht
- **Docent** (US 9–10, 17–18): logboeken en finale evaluatie
- **Mentor** (US 11–14, 19–20): logboeken en finale evaluatie
- **Administratie** (US 21–22): eindrapport en gebruikersbeheer
- **Alle rollen** (US 23): inloggen

Zie het analysedocument voor de volledige acceptatiecriteria per user story.

---

## Procesflow

Het volledige stageproces wordt doorlopen in drie grote stappen:

1. **Stageaanvraag** — indiening door student, beoordeling door stagecommissie
2. **Wekelijkse opvolging** — logboeken door student, feedback door docent en mentor
3. **Finale evaluatie** — eindpresentatie student, motivatie mentor, score docent

---

## Stack Technique

| Couche | Technologie |
|---|---|
| **Frontend** | Vite + HTML / CSS / JavaScript |
| **Backend** | Node.js + Express.js |
| **Base de données** | MySQL |

---

## Documentatie

Aanvullende documenten (procesdiagrammen, UI mockups, UML diagrammen) zijn beschikbaar onder de projectmap **Team 1**:

- Procesdiagram
- User Interface Design (GUID / Mockups MVP)
- Technische analyse (UML diagrammen)
