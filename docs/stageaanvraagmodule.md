# 📘 Stageaanvraagmodule – Technische Documentatie

## 1. Overzicht
De stageaanvraagmodule vormt de kern van het Stage Monitoring‑platform.  
Deze module ondersteunt het volledige proces van:

- het indienen van een stageaanvraag door studenten  
- het beoordelen van aanvragen door de stagecommissie  
- het verwerken van statuswijzigingen  
- het automatisch genereren van een officieel stage‑record bij goedkeuring  
- het uitvoeren van correctierondes wanneer aanpassingen vereist zijn  

De module bestaat uit een **REST‑backend** (validatie, statuslogica, datamanagement) en een **React‑frontend** (formulieren, dashboards, detailweergaven).

---

## 2. Functionaliteiten (samengevat per user story)

### 2.1 Backend

### **1. Nieuwe stageaanvraag opslaan**
Implementeert een POST‑endpoint voor het creëren van stageaanvragen.  
Bevat:

- validatie van verplichte velden  
- opslag in de database  
- koppeling met studentaccount  
- initiële status: **Ingediend – wacht op goedkeuring**

---

### **2. Status & feedback wijzigen (commissie)**
PATCH‑endpoint waarmee commissieleden:

- aanvragen kunnen goedkeuren  
- aanvragen kunnen afkeuren  
- *Aanpassingen vereist* kunnen instellen  
- feedback kunnen toevoegen  

Inclusief:

- rolgebaseerde toegangscontrole  
- validatie van toegestane statusovergangen  

---

### **3. Automatische stagecreatie bij goedkeuring**
Bij statuswijziging naar **Goedgekeurd** wordt automatisch:

- een stage‑record aangemaakt  
- gekoppeld aan student, bedrijf, mentor en periode  
- gegarandeerd dat slechts één stage per aanvraag bestaat  

---

### **4. Aanvraag aanpassen door student (backend)**
PATCH‑endpoint waarmee studenten hun aanvraag kunnen wijzigen **uitsluitend** wanneer:

- de status *Aanpassingen vereist* is  
- zij eigenaar zijn van de aanvraag  

Na succesvolle update wordt de status automatisch teruggezet naar  
**Ingediend – wacht op goedkeuring**.

---

### 2.2 Frontend

### **5. Nieuwe stageaanvraag indienen**
React‑formulier met:

- verplichte velden (bedrijf, mentor, opdracht, periode)  
- inline validatie  
- foutmeldingen bij ontbrekende gegevens  
- submit‑flow die de backend POST‑endpoint aanroept  
- dashboardupdate na indienen  

*(Docent wordt in deze fase niet ingevuld door de student.)*

---

### **6. Aanvraag aanpassen (correctieronde)**
Detailpagina met:

- zichtbare feedback van de commissie  
- bewerkbare velden wanneer status = *Aanpassingen vereist*  
- validatie bij opnieuw indienen  
- submit‑flow die de backend PATCH‑endpoint aanroept  

---

### **7. Aanvraag beoordelen (commissie)**
Beoordelingspagina met:

- volledige detailweergave van aanvraag  
- beslissingsopties: **Goedgekeurd**, **Afgekeurd**, **Aanpassingen vereist**  
- optioneel feedbackveld bij goedkeuring  
- statusupdate via backend PATCH‑endpoint  
- automatische update van het commissieoverzicht  

---

### **8. Dashboard voor commissieleden**
Dashboard toont realtime aantallen per status:

- ingediende aanvragen  
- afgekeurde aanvragen  
- aanvragen met aanpassingen vereist  
- goedgekeurde aanvragen  

Gegevens worden opgehaald via backend‑queries en gefilterd per commissielid.

---

## 3. Architectuur

### **Backend**
- **Type:** REST API  
- **Belangrijkste componenten:**  
  - Controllers voor aanvragen, statuswijzigingen en stagecreatie  
  - Services met validatie‑ en statuslogica  
  - Database‑entiteiten voor users, aanvragen, stages en feedback  
- **Statusflow:**  
  - *Ingediend → Goedgekeurd → Stage aangemaakt*  
  - *Ingediend → Aanpassingen vereist → Ingediend*  
  - *Ingediend → Afgekeurd*

---

### **Frontend**
- **Framework:** React  
- **Belangrijkste componenten:**  
  - Formulieren voor indienen en aanpassen  
  - Detailpagina’s voor student en commissie  
  - Dashboardcomponenten  
  - API‑services voor communicatie met backend  

---

## 4. Datamodel (beknopt)

### **Stageaanvraag**
- id  
- student_id  
- bedrijf  
- mentor_firstname  
- mentor_lastname  
- opdracht  
- periode_start  
- periode_einde  
- docent_id  
- status  
- feedback  
- created_at / updated_at  

### **Stage (automatisch aangemaakt)**
- id  
- aanvraag_id  
- student_id  
- bedrijf_id  
- mentor_id  
- periode_start / periode_einde  

---

## 5. Belangrijkste technische kenmerken
- Strikte validatie van statusovergangen  
- Rolgebaseerde beveiliging (student vs. commissie)  
- Automatisatie van stagecreatie  
- Consistente foutafhandeling  
- Frontend‑validatie + backend‑validatie  
- Duidelijke scheiding tussen read‑only en bewerkbare velden  
- Up‑to‑date dashboards via API‑queries  

---

## 6. API‑endpointoverzicht (Stageaanvraagmodule)

| Methode | Endpoint | Beschrijving | Request body | Response |
|--------|----------|--------------|---------------|----------|
| **POST** | `/internship-requests` | Nieuwe stageaanvraag indienen | JSON met verplichte velden:<br>• student_id<br>• company<br>• mentor_firstname<br>• mentor_lastname<br>• description<br>• start_date<br>• end_date | 201 Created + `{ request_id, message }` |
| **GET** | `/internship-requests` | Overzicht van alle stageaanvragen | n.v.t. | 200 OK + lijst van aanvragen |
| **GET** | `/internship-requests/:id` | Detail van één stageaanvraag | n.v.t. | 200 OK + aanvraagobject |
| **PATCH** | `/internship-requests/:id` | Aanvraag aanpassen door student (alleen bij status *aanpassingen vereist*) | JSON met gewijzigde velden | 200 OK + updated aanvraag |
| **PATCH** | `/internship-requests/:id/status` | Status & feedback wijzigen door stagecommissie | JSON:<br>• status (approved / rejected / adjustment_required)<br>• feedback (optioneel bij approved, verplicht bij andere statussen) | 200 OK + updated status |
| **POST** | *intern proces* | Automatische stagecreatie bij goedkeuring | n.v.t. | Stage‑record wordt aangemaakt in database |

