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
