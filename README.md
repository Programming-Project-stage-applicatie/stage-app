# 📌 Backend README

## 📖 Overzicht

Deze backend is gebouwd met **Node.js** en **Express** en volgt een gestructureerde MVC-achtige architectuur. De applicatie beheert gebruikers en maakt communicatie mogelijk met een database via SQL-queries.

De backend bevindt zich in de **main branch**, waar frontend en backend samen worden gebracht. Dit zorgt ervoor dat het volledige project (fullstack) op één plaats beschikbaar is. Andere branches kunnen afzonderlijke delen bevatten, zoals frontend of backend, die later samengevoegd worden in de main branch.

---

## 🏗️ Architectuur

De backend is opgesplitst in drie lagen:

* **Routes**
  Bevat de API-endpoints en koppelt deze aan de controllers.

* **Controllers**
  Verwerkt de logica van inkomende requests en stuurt responses terug.

* **Models**
  Verantwoordelijk voor communicatie met de database.

---

## 👤 Gebruikersbeheer

De backend biedt basisfunctionaliteiten voor gebruikers:

* Alle gebruikers ophalen
* Een nieuwe gebruiker aanmaken

---

## 🔐 Beveiliging

Wachtwoorden worden **gehasht met bcrypt** voordat ze in de database worden opgeslagen.
Dit zorgt ervoor dat gevoelige gegevens niet in platte tekst bewaard worden.

---

## 🗄️ Database

De applicatie gebruikt SQL-queries met **parameter binding (`?`)** om:

* SQL-injectie te voorkomen
* Veilige database-interacties te garanderen

---

## 🌐 API Endpoints

* `GET /`
  Haalt alle gebruikers op

* `POST /`
  Maakt een nieuwe gebruiker aan

---

## ⚙️ Technologieën

* Node.js
* Express
* bcrypt
* SQL database

---

## 📌 Opmerking

Dit is een eenvoudige backend die de basisprincipes van een fullstack applicatie demonstreert. Verdere uitbreidingen zoals authenticatie, autorisatie en middleware kunnen toegevoegd worden voor productiegebruik.
