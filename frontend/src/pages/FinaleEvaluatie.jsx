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
  const studentId = user.id || 1; // fallback voor test

  useEffect(() => { haalOp(); }, []);

  async function haalOp() {
    try {
      const res  = await fetch(`/api/finale-evaluatie/student/${studentId}`);
      const data = await res.json();
      setEvaluatie(data);
      setOmschrijving(data.omschrijving ?? "");
    } catch {
      setEvaluatie({ status: "Open" });
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

    // Eerst opslaan
    const fd = new FormData();
    fd.append("omschrijving", omschrijving);
    if (bestand) fd.append("document", bestand);

    try {
      const r1 = await fetch(`/api/finale-evaluatie/student/${studentId}/opslaan`, {
        method: "POST", body: fd,
      });
      if (!r1.ok) { const d = await r1.json(); setFout(d.error); return; }

      // Dan indienen
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

  function handleAnnuleren() {
    navigate(-1);
  }

  if (!evaluatie) return <div style={s.loading}>Laden…</div>;

  const isOpen      = evaluatie.status === "Open";
  const alleenLezen = !isOpen;

  return (
    <div style={s.pagina}>

      {/* ── Titel ── */}
      <h1 style={s.titel}>Finale Evaluatie</h1>

      {/* ── Student info ── */}
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

      {/* ── Status melding ── */}
      {alleenLezen && (
        <div style={s.statusMelding}>
          ✅ Je eindpresentatie is <strong>{evaluatie.status}</strong>. Je kan deze niet meer bewerken.
        </div>
      )}

      {/* ── Eindpresentatie ── */}
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

        {/* Upload */}
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

        {/* Huidig document */}
        {evaluatie.document_url && (
          <a href={evaluatie.document_url} target="_blank" rel="noreferrer" style={s.docLink}>
            📎 {evaluatie.document_url.split("/").pop()}
          </a>
        )}
      </section>

      <hr style={s.lijn} />

      {/* ── Feedback Mentor ── */}
      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Feedback Mentor</h2>
        <textarea
          style={{ ...s.textarea, ...s.textareaReadonly }}
          value={evaluatie.feedback_mentor || ""}
          readOnly
          placeholder="Nog geen feedback van mentor."
        />
      </section>

      {/* ── Feedback Docent ── */}
      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Feedback Docent:</h2>
        <textarea
          style={{ ...s.textarea, ...s.textareaReadonly }}
          value={evaluatie.feedback_docent || ""}
          readOnly
          placeholder="Nog geen feedback van docent."
        />
      </section>


      {/* ── Beoordeling (alleen zichtbaar als Geëvalueerd) ── */}
      {evaluatie.status === "Geëvalueerd" && (
        <>
          <hr style={s.lijn} />
          <section style={s.sectie}>
            <h2 style={s.sectietitel}>Beoordeling</h2>
            <label style={s.label}>Eindscore:</label>
            <div style={s.scoreBlok}>
              <span style={s.scoreGetal}>{evaluatie.eindscore != null ? evaluatie.eindscore : "—"}</span>
              {evaluatie.eindscore != null && <span style={s.scoreMax}> / 20</span>}
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
      {/* ── Foutmelding ── */}
      {fout && <p style={s.fout}>⚠️ {fout}</p>}

      {/* ── Knoppen ── */}
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
};
