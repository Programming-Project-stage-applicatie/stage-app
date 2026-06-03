# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


------Finale Evaluatie------
Finale Evaluatie
Het finale evaluatieproces verloopt in drie stappen en omvat vier gebruikersrollen: student, mentor, docent en admin.

Algemene workflow:
Student dient zijn eindpresentatie in (omschrijving + optioneel document)
Mentor geeft feedback nadat de student heeft ingediend
Docent beoordeelt met een score (/20) en feedback, en finaliseert de evaluatie

Rollen & Functionaliteiten:
Student — eindpresentatie opslaan, indienen, annuleren en document verwijderen; feedback van mentor en docent raadplegen na indiening
Mentor — feedback ingeven zolang status ingediend is; eindpresentatie en beoordeling van docent raadplegen
Docent — score en feedback invullen, evaluatie finaliseren; overzicht van alle toegewezen stages
Admin — overzicht van alle geëvalueerde stages met scores

Statussen:
open = Student heeft nog niet ingediend
submitted / ingediend = Student heeft ingediend, wacht op beoordeling
evaluated / geëvalueerd = Docent heeft de evaluatie gefinaliseerd

Frontend Pagina's:
Student:    /student/finale-evaluatie/:internshipId
Mentor:    /mentor/finale-evaluatie/:internshipId
Docent:    /teacher/internships/:id/evaluation
Admin:    /admin/internships/:id/evaluation
Overzicht docent:    /teacher/final-evaluation-overview
Overzicht mentor:    /mentor/studenten
Overzicht admin:    /admin/final-evaluation-overview

Gebruikte Technologieën (frontend)
React (useState, useEffect, useRef, useCallback)
React Router (useParams, useNavigate)
Multer (bestandsupload via FormData)
i18n vertalingen (t()-functie)
