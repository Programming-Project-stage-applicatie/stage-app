import { useState, useEffect } from "react";

export default function FinaleEvaluatieMentor() {
  const [evaluatie, setEvaluatie]       = useState(null);
  const [feedback, setFeedback]         = useState("");
  const [fout, setFout]                 = useState("");
  const [succes, setSucces]             = useState("");
  const [bezig, setBezig]               = useState(false);

  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const mentorId  = user.id || 1;
  const studentId = user.studentId || 1;

  useEffect(() => { haalOp(); }, []);

  async function haalOp() {
    // TIJDELIJK — verwijderen als backend klaar is
    setEvaluatie({
      status: "submitted",
      student_naam: "Test Student",
      bedrijf: "Test BV",
      presentation: "Dit is een testpresentatie.",
      document: null,
      mentor_motivatie: "",
      final_score: null,
      evaluatie_docent: "",
      feedback_docent: "",
    });
   setFeedback(evaluatie.mentor_motivatie || "");
    return;
    // EINDE TIJDELIJK
  }

  async function handleBevestigen() {
    if (!feedback.trim()) {
      setFout("Feedback is verplicht.");
      return;
    }
    if (!window.confirm("Ben je zeker dat je de feedback wilt opslaan?")) return;
    setFout("");
    setSucces("");
    setBezig(true);
// TIJDELIJK — verwijderen als backend klaar is
  setSucces("Feedback succesvol opgeslagen.");
  setBezig(false);
  return;
  // EINDE TIJDELIJK
    try {
      const res = await fetch(`/api/finale-evaluatie/student/${studentId}/mentor-motivatie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentor_motivatie: feedback, mentor_id: mentorId }),
      });

      if (!res.ok) {
        const d = await res.json();
        setFout(d.error || "Opslaan mislukt.");
        return;
      }

      setSucces("Feedback succesvol opgeslagen.");
      await haalOp();
    } catch {
      setFout("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setBezig(false);
    }
  }

  function vertaalStatus(status) {
    const vertalingen = {
      open:       "Open",
      submitted:  "Ingediend",
      evaluated:  "Geëvalueerd",
    };
    return vertalingen[status] || status || "Onbekend";
  }

  if (fout && !evaluatie) return (
    <div style={s.pagina}>
      <p style={s.fout}>⚠️ {fout}</p>
      <button style={{ ...s.btn, ...s.btnWit }} onClick={haalOp}>Opnieuw proberen</button>
    </div>
  );

  if (!evaluatie) return <div style={s.loading}>Laden…</div>;

  const kanBewerken = evaluatie.status === "submitted";

  return (
    <div style={s.pagina}>

      <h1 style={s.titel}>Finale Evaluatie — Mentor</h1>

      <div style={s.statusBadge(evaluatie.status)}>
        {vertaalStatus(evaluatie.status).toUpperCase()}
      </div>

      <div style={s.infoBlok}>
        <p style={s.infoRegel}>
          <span style={s.infoLabel}>Student:</span>
          {evaluatie.student_naam || "—"}
        </p>
        <p style={s.infoRegel}>
          <span style={s.infoLabel}>Stage:</span>
          {evaluatie.bedrijf || user.bedrijf || "—"}
        </p>
        <p style={s.infoRegel}>
          <span style={s.infoLabel}>Mentor:</span>
          {user.name || "—"}
        </p>
      </div>

      <hr style={s.lijn} />

      {!kanBewerken && evaluatie.status !== "open" && (
        <div style={s.statusMelding}>
          ✅ De feedback is <strong>{vertaalStatus(evaluatie.status)}</strong>. Je kan deze niet meer bewerken.
        </div>
      )}

      {evaluatie.status === "open" && (
        <div style={s.waarschuwingMelding}>
          ⏳ De student heeft zijn eindpresentatie nog niet ingediend. Je kan pas feedback ingeven nadat de student heeft ingediend.
        </div>
      )}

      {/* Eindpresentatie van de student — alleen lezen */}
      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Eindpresentatie Student</h2>
        <label style={s.label}>Omschrijving eindpresentatie</label>
        <textarea
          style={{ ...s.textarea, ...s.textareaReadonly }}
          value={evaluatie.presentation || ""}
          readOnly
          placeholder="De student heeft nog geen omschrijving ingediend."
        />
        {evaluatie.document && (
          <a href={evaluatie.document} target="_blank" rel="noreferrer" style={s.docLink}>
            📎 {evaluatie.document.split("/").pop()}
          </a>
        )}
      </section>

      <hr style={s.lijn} />

      {/* Feedback van de mentor — bewerkbaar zolang status "submitted" is */}
      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Feedback Mentor</h2>
        <label style={s.label}>
          Feedback mentor {kanBewerken && <span style={s.verplicht}>*</span>}
        </label>
        <textarea
          style={{
            ...s.textarea,
            ...(kanBewerken ? {} : s.textareaReadonly),
          }}
          placeholder={
            kanBewerken
              ? "Voer hier je feedback in voor de beoordeling van de student…"
              : "Nog geen feedback ingegeven."
          }
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            setFout("");
            setSucces("");
          }}
          readOnly={!kanBewerken}
          rows={6}
        />
      </section>

      <hr style={s.lijn} />

      {/* Beoordeling van de docent — altijd alleen lezen voor de mentor */}
      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Beoordeling Docent</h2>

        {evaluatie.status !== "evaluated" ? (
          <div style={s.infoBanner}>
            ℹ️ De docent heeft nog geen beoordeling ingevoerd.
          </div>
        ) : (
          <>
            {/* Eindscore = de punten die de docent geeft (bv. 14/20) */}
            <label style={s.label}>Eindscore docent:</label>
            <div style={s.scoreBlok}>
              <span style={s.scoreGetal}>
                {evaluatie.final_score != null ? evaluatie.final_score : "—"}
              </span>
              {evaluatie.final_score != null && (
                <span style={s.scoreMax}> / 20</span>
              )}
            </div>

            {/* Evaluatie docent = de schriftelijke beoordeling/motivatie van de punten */}
            <label style={{ ...s.label, marginTop: "1rem" }}>
              Evaluatie docent:
            </label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluatie.evaluatie_docent || ""}
              readOnly
              placeholder="Nog geen evaluatie ingevoerd door de docent."
            />

            {/* Feedback docent = bijkomende opmerkingen of verbeterpunten */}
            <label style={{ ...s.label, marginTop: "1rem" }}>
              Feedback docent:
            </label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluatie.feedback_docent || ""}
              readOnly
              placeholder="Nog geen feedback ingevoerd door de docent."
            />
          </>
        )}
      </section>

      {fout   && <p style={s.fout}>⚠️ {fout}</p>}
      {succes && <p style={s.succesMsg}>✅ {succes}</p>}

      <div style={s.knoppen}>
        {kanBewerken && (
          <button
            style={{ ...s.btn, ...s.btnGroen }}
            onClick={handleBevestigen}
            disabled={bezig}
          >
            {bezig ? "BEZIG…" : "BEVESTIGEN"}
          </button>
        )}
        <button
          style={{ ...s.btn, ...s.btnWit }}
          onClick={() => window.history.back()}
        >
          TERUG
        </button>
      </div>

    </div>
  );
}

// ── Stijlen ────────────────────────────────────────────────────
const s = {
  pagina:           { maxWidth: "620px", margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif", color: "#222" },
  loading:          { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  titel:            { fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" },
  infoBlok:         { marginBottom: "1rem" },
  infoRegel:        { margin: "0.2rem 0", fontSize: "0.95rem" },
  infoLabel:        { fontWeight: "bold", marginRight: "0.4rem" },
  lijn:             { border: "none", borderTop: "1px solid #ccc", margin: "1.25rem 0" },
  statusMelding:    { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  waarschuwingMelding: { background: "#fefce8", border: "1px solid #fde047", color: "#854d0e", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  sectie:           { marginBottom: "1.25rem" },
  sectietitel:      { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" },
  label:            { display: "block", fontSize: "0.9rem", marginBottom: "0.4rem" },
  verplicht:        { color: "#dc2626", marginLeft: "0.2rem" },
  textarea:         { width: "100%", minHeight: "90px", padding: "0.6rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", background: "#fff" },
  textareaReadonly: { background: "#f9f9f9", color: "#444" },
  docLink:          { display: "inline-block", marginTop: "0.4rem", color: "#2563eb", fontSize: "0.85rem" },
  fout:             { color: "#dc2626", background: "#fef2f2", padding: "0.6rem 0.9rem", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.9rem" },
  succesMsg:        { color: "#166534", background: "#f0fdf4", padding: "0.6rem 0.9rem", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.9rem" },
  infoBanner:       { background: "#f0f9ff", border: "1px solid #93c5fd", color: "#1e40af", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.9rem" },
  scoreBlok:        { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem 1.5rem", marginBottom: "0.5rem" },
  scoreGetal:       { fontSize: "2rem", fontWeight: "bold", color: "#16a34a" },
  scoreMax:         { fontSize: "1rem", color: "#555" },
  knoppen:          { display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" },
  btn:              { padding: "0.65rem 2.5rem", fontSize: "0.9rem", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em" },
  btnGroen:         { background: "#16a34a", color: "#fff", border: "none" },
  btnWit:           { background: "#fff", color: "#333", border: "1px solid #ccc" },
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