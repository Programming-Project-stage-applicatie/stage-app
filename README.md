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
