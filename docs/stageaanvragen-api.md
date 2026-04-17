# Internship Requests API

Deze module behandelt het indienen van stageaanvragen door studenten.

## Endpoint

POST `/internship-requests`

## Vereiste JSON-body

{
  "student_id": 1,
  "company": "Example Company",
  "mentor_firstName": "John",
  "mentor_lastName": "Doe",
  "description": "Beschrijving van de stageaanvraag",
  "request_date": "2024-03-15",
  "start_date": "2024-04-01",
  "end_date": "2024-06-30"
}

## Validatieregels

- `student_id` moet bestaan in de tabel `students`
- `company` en `description` zijn verplicht
- Datums moeten geldig zijn
- `start_date` < `end_date`

## Testen

- Testen via Thunder Client
- Succesvolle aanvraag → 201 Created
- Ongeldige body → 400 Bad Request
- Niet-bestaande student → 404 Not Found