import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function FinaleEvaluatie() {
  const [evaluatie, setEvaluatie]       = useState(null);
  const [omschrijving, setOmschrijving] = useState("");
  const [bestandNaam, setBestandNaam]   = useState("Geen bestand gekozen");
  const [bestand, setBestand]           = useState(null);
  const [fout, setFout]                 = useState("");
  const [bezig, setBezig]               = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user.id || 1;

  useEffect(() => { haalOp(); }, []);

  async function haalOp() {
    try {
      const res  = await fetch(`/api/finale-evaluatie/student/${studentId}`);
      const data = await res.json();
      setEvaluatie(data);
      setOmschrijving(data.presentation ?? "");
    } catch {
      setEvaluatie({ status: "open" });
    }
  }

  function handleBestand(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBestand(file);
    setBestandNaam(file.name);
  }

  async function handleIndienen() {
    if (!omschrijving.trim()) {
      setFout("Omschrijving is verplicht.");
      return;
    }
    if (!window.confirm("Ben je zeker dat je wilt indienen?")) return;
    setFout("");
    setBezig(true);

    const fd = new FormData();
    fd.append("omschrijving", omschrijving);
    if (bestand) fd.append("document", bestand);

    try {
      const r1 = await fetch(`/api/finale-evaluatie/student/${studentId}/opslaan`, {
        method: "POST", body: fd,
      });
      if (!r1.ok) { const d = await r1.json(); setFout(d.error); return; }

      const r2 = await fetch(`/api/finale-evaluatie/student/${studentId}/indienen`, {
        method: "POST",
      });
      if (!r2.ok) { const d = await r2.json(); setFout(d.error); return; }
      await haalOp();
    } catch {
      setFout("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setBezig(false);
    }
  }

  function handleAnnuleren() { // opgelet na de merge moet deze functie aangepast worden
    if (window.confirm("Ben je zeker dat je wilt annuleren?")) {
      fetch(`/api/finale-evaluatie/student/${studentId}/annuleren`, {
        method: "POST",
      })
      .then(res => {
        if (res.ok) {
          haalOp();
        } else {
          setFout("Annuleren mislukt. Probeer opnieuw.");
        }
      })
      .catch(() => setFout("Er ging iets mis. Probeer opnieuw."));
    }
  }

  function vertaalStatus(status) {
    const vertalingen = {
      open: "Open",
      submitted: "Ingediend",
      evaluated: "Geëvalueerd",
    };
    return vertalingen[status] || status;
  }

  if (!evaluatie) return <div style={s.loading}>Laden…</div>;

  const isOpen      = evaluatie.status === "open";
  const alleenLezen = !isOpen;

  return (
    <div style={s.pagina}>

      <h1 style={s.titel}>Finale Evaluatie</h1>

      <div style={s.statusBadge(evaluatie.status)}>
        {vertaalStatus(evaluatie.status).toUpperCase()}
      </div>

      <div style={s.infoBlok}>
        <p style={s.infoRegel}>
          <span style={s.infoLabel}>Student:</span>
          {user.name || "Sarah Janssens"}
        </p>
        <p style={s.infoRegel}>
          <span style={s.infoLabel}>Stage:</span>
          {user.bedrijf || evaluatie.bedrijf || "XYZ BV"}
        </p>
      </div>

      <hr style={s.lijn} />

      {alleenLezen && (
        <div style={s.statusMelding}>
          ✅ Je eindpresentatie is <strong>{vertaalStatus(evaluatie.status)}</strong>. Je kan deze niet meer bewerken.
        </div>
      )}

      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Eindpresentatie</h2>

        <label style={s.label}>Omschrijving eindpresentatie *</label>
        <textarea
          style={{ ...s.textarea, ...(alleenLezen ? s.textareaReadonly : {}) }}
          placeholder="Voer hier een omschrijving in van je eindpresentatie"
          value={omschrijving}
          onChange={(e) => { setOmschrijving(e.target.value); setFout(""); }}
          readOnly={alleenLezen}
        />

        {isOpen && (
          <div style={s.uploadRij}>
            <label style={s.label}>Upload bestand (optioneel)</label>
            <div style={s.uploadControls}>
              <button
                type="button"
                style={s.kiesBestandBtn}
                onClick={() => fileRef.current.click()}
              >
                Kies bestand
              </button>
              <span style={s.bestandNaam}>{bestandNaam}</span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.doc,.zip"
                style={{ display: "none" }}
                onChange={handleBestand}
              />
            </div>
          </div>
        )}

        {evaluatie.document && (
          <a href={evaluatie.document} target="_blank" rel="noreferrer" style={s.docLink}>
            📎 {evaluatie.document.split("/").pop()}
          </a>
        )}
      </section>

      {alleenLezen && (
        <>
          <hr style={s.lijn} />
          <section style={s.sectie}>
            <h2 style={s.sectietitel}>Feedback Mentor</h2>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluatie.mentor_feedback || ""}
              readOnly
              placeholder="Nog geen feedback van mentor."
            />
          </section>

          <section style={s.sectie}>
            <h2 style={s.sectietitel}>Feedback Docent:</h2>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluatie.teacher_feedback || ""}
              readOnly
              placeholder="Nog geen feedback van docent."
            />
          </section>
        </>
      )}

      {evaluatie.status === "evaluated" && (
        <>
          <hr style={s.lijn} />
          <section style={s.sectie}>
            <h2 style={s.sectietitel}>Beoordeling</h2>
            <label style={s.label}>Eindscore:</label>
            <div style={s.scoreBlok}>
              <span style={s.scoreGetal}>{evaluatie.final_score != null ? evaluatie.final_score : "—"}</span>
              {evaluatie.final_score != null && <span style={s.scoreMax}> / 20</span>}
            </div>
            <label style={{ ...s.label, marginTop: "1rem" }}>Motivatie:</label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluatie.motivatie || ""}
              readOnly
              placeholder="Nog geen motivatie ingegeven."
            />
          </section>
        </>
      )}

      {fout && <p style={s.fout}>⚠️ {fout}</p>}

      <div style={s.knoppen}>
        {isOpen && (
          <button
            style={{ ...s.btn, ...s.btnGroen }}
            onClick={handleIndienen}
            disabled={bezig}
          >
            {bezig ? "BEZIG…" : "INDIENEN"}
          </button>
        )}
        <button
          style={{ ...s.btn, ...s.btnWit }}
          onClick={handleAnnuleren}
        >
          ANNULEREN
        </button>
      </div>

    </div>
  );
}

// ── Stijlen ────────────────────────────────────────────────────
const s = {
  pagina:          { maxWidth: "620px", margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif", color: "#222" },
  loading:         { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  titel:           { fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" },
  infoBlok:        { marginBottom: "1rem" },
  infoRegel:       { margin: "0.2rem 0", fontSize: "0.95rem" },
  infoLabel:       { fontWeight: "bold", marginRight: "0.4rem" },
  lijn:            { border: "none", borderTop: "1px solid #ccc", margin: "1.25rem 0" },
  statusMelding:   { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  sectie:          { marginBottom: "1.25rem" },
  sectietitel:     { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" },
  label:           { display: "block", fontSize: "0.9rem", marginBottom: "0.4rem" },
  textarea:        { width: "100%", minHeight: "90px", padding: "0.6rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", background: "#fff" },
  textareaReadonly:{ background: "#f9f9f9", color: "#444" },
  uploadRij:       { marginTop: "0.75rem" },
  uploadControls:  { display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.3rem" },
  kiesBestandBtn:  { padding: "0.4rem 0.9rem", background: "#f0f0f0", border: "1px solid #bbb", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" },
  bestandNaam:     { fontSize: "0.85rem", color: "#555" },
  docLink:         { display: "inline-block", marginTop: "0.4rem", color: "#2563eb", fontSize: "0.85rem" },
  fout:            { color: "#dc2626", background: "#fef2f2", padding: "0.6rem 0.9rem", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.9rem" },
  knoppen:         { display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" },
  btn:             { padding: "0.65rem 2.5rem", fontSize: "0.9rem", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em" },
  btnGroen:        { background: "#16a34a", color: "#fff", border: "none" },
  btnWit:          { background: "#fff", color: "#333", border: "1px solid #ccc" },
  scoreBlok:       { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem 1.5rem", marginBottom: "0.5rem" },
  scoreGetal:      { fontSize: "2rem", fontWeight: "bold", color: "#16a34a" },
  scoreMax:        { fontSize: "1rem", color: "#555" },
  statusBadge: (status) => ({
    display: "inline-block",
    padding: "0.3rem 1rem",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "0.85rem",
    marginBottom: "1rem",
    background:
      status === "open"       ? "#fef9c3" :
      status === "submitted"  ? "#dbeafe" :
      status === "evaluated"  ? "#f0fdf4" : "#f3f4f6",
    color:
      status === "open"       ? "#854d0e" :
      status === "submitted"  ? "#1e40af" :
      status === "evaluated"  ? "#166534" : "#374151",
    border:
      status === "open"       ? "1px solid #fde047" :
      status === "submitted"  ? "1px solid #93c5fd" :
      status === "evaluated"  ? "1px solid #86efac" : "1px solid #d1d5db",
  }),
};