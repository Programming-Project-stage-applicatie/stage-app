import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";

export default function FinaleEvaluatieDocent() {
  const { id } = useParams();
  const [evaluatie, setEvaluatie] = useState(null);
  const [fout, setFout]           = useState("");
  const [bezig, setBezig]         = useState(false);

  const [score, setScore]                   = useState("");
  const [feedbackTekst, setFeedbackTekst]   = useState("");
  const [ingediend, setIngediend]           = useState(false);
  const [evaluatieBeëindigd, setEvaluatieBeëindigd] = useState(false);

  // Zorgt dat checkbox-staat alleen bij eerste laden gezet wordt, niet na elke save
  const isEersteLaad = useRef(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const haalOp = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/finale-evaluatie/student/${id}/docent`,
        {
          headers: user.token
            ? { Authorization: `Bearer ${user.token}` }
            : {},
        }
      );
      if (!res.ok) {
        const d = await res.json();
        setFout(d.error || "Ophalen mislukt.");
        return;
      }
      const data = await res.json();
      setEvaluatie(data);

      setScore(data.final_score != null ? String(data.final_score) : "");
      setFeedbackTekst(data.feedback_docent || "");

      // Checkbox-staat enkel bij eerste laden invullen vanuit de server
      if (isEersteLaad.current) {
        setEvaluatieBeëindigd(data.status === "evaluated");
        isEersteLaad.current = false;
      }
    } catch {
      setFout("Er ging iets mis bij het ophalen.");
    }
  }, [id, user.token]);

  useEffect(() => { haalOp(); }, [haalOp]);

  async function handleIndienen() {
    setFout("");

    let scoreNum = null;
    if (score !== "") {
      scoreNum = Number(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
        setFout("Vul een geldige score in (0–20).");
        return;
      }
    }

    setBezig(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/finale-evaluatie/student/${id}/docent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
          body: JSON.stringify({
            final_score: scoreNum,
            feedback_docent: feedbackTekst,
            beëindigd: evaluatieBeëindigd,
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        setFout(d.error || "Indienen mislukt.");
      } else {
        await haalOp();
      }
    } catch {
      setFout("Er ging iets mis bij het indienen.");
    } finally {
      setBezig(false);
    }
  }

  function handleBewerken() {
    setIngediend(false);
    setEvaluatieBeëindigd(evaluatie?.status === "evaluated");
  }

  async function openDocument(url) {
    try {
      const res = await fetch(url, {
        headers: user.token
          ? { Authorization: `Bearer ${user.token}` }
          : {},
      });
      if (!res.ok) {
        setFout("Document kon niet worden geopend.");
        return;
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch {
      setFout("Er ging iets mis bij het openen van het document.");
    }
  }

  function vertaalStatus(status) {
    const vertalingen = {
      open:      "Open",
      submitted: "Ingediend",
      evaluated: "Geëvalueerd",
    };
    return vertalingen[status] || status || "Onbekend";
  }

  if (fout && !evaluatie) return (
    <div style={s.pagina}>
      <p style={s.fout}>⚠️ {fout}</p>
      <button style={{ ...s.btn, ...s.btnWit }} onClick={haalOp}>
        Opnieuw proberen
      </button>
    </div>
  );

  if (!evaluatie) return <div style={s.loading}>Laden…</div>;

  const isIngediend  = evaluatie.status === "submitted";
  const isGeeval     = evaluatie.status === "evaluated";
  const kanInvullen  = isIngediend || isGeeval;
  const toonReadonly = (isGeeval || isIngediend) && ingediend;

  return (
    <div style={s.pagina}>
      <h1 style={s.titel}>Finale Evaluatie — Docent</h1>

      <div style={s.statusBadge(evaluatie.status)}>
        {vertaalStatus(evaluatie.status).toUpperCase()}
      </div>

      <div style={s.infoBlok}>
        <p style={s.infoRegel}><span style={s.infoLabel}>Student:</span>{evaluatie.student_naam || "—"}</p>
        <p style={s.infoRegel}><span style={s.infoLabel}>Stagebedrijf:</span>{evaluatie.bedrijf || "—"}</p>
        <p style={s.infoRegel}><span style={s.infoLabel}>Mentor:</span>{evaluatie.mentor_naam || "—"}</p>
        <p style={s.infoRegel}><span style={s.infoLabel}>Docent:</span>{user.name || "—"}</p>
      </div>

      <hr style={s.lijn} />

      {evaluatie.status === "open" && (
        <div style={s.waarschuwingMelding}>
          ⏳ De student heeft zijn eindpresentatie nog niet ingediend.
        </div>
      )}

      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Eindpresentatie Student</h2>
        {!isIngediend && !isGeeval ? (
          <div style={s.infoBanner}>ℹ️ De student heeft nog geen eindpresentatie ingediend.</div>
        ) : (
          <>
            <div style={s.ingediendBadge}>✅ Ingediend</div>
            <label style={s.label}>Omschrijving eindpresentatie</label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluatie.presentation || ""}
              readOnly
              placeholder="Geen omschrijving beschikbaar."
            />
            {evaluatie.document ? (
              <button
                onClick={() => openDocument(evaluatie.document)}
                style={s.docBtn}
              >
                📎 {evaluatie.document.split("/").pop()} — klik om te openen
              </button>
            ) : (
              <p style={s.geenBijlage}>📄 Geen bestand bijgevoegd.</p>
            )}
          </>
        )}
      </section>

      <hr style={s.lijn} />

      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Feedback Mentor</h2>
        {!evaluatie.mentor_motivatie ? (
          <div style={s.infoBanner}>ℹ️ De mentor heeft nog geen feedback ingevoerd.</div>
        ) : (
          <textarea
            style={{ ...s.textarea, ...s.textareaReadonly }}
            value={evaluatie.mentor_motivatie}
            readOnly
          />
        )}
      </section>

      <hr style={s.lijn} />

      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Feedback Docent</h2>
        {toonReadonly ? (
          <>
            <label style={s.label}>Eindscore:</label>
            <div style={s.scoreBlok}>
              <span style={s.scoreGetal}>
                {evaluatie.final_score != null ? evaluatie.final_score : "—"}
              </span>
              {evaluatie.final_score != null && <span style={s.scoreMax}> / 20</span>}
            </div>
            <label style={{ ...s.label, marginTop: "1rem" }}>Feedback:</label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluatie.feedback_docent || ""}
              readOnly
              placeholder="Geen feedback ingevoerd."
            />
          </>
        ) : kanInvullen ? (
          <>
            <label style={s.label}>Eindscore (0–20) — optioneel:</label>
            <div style={s.scoreInvoerRij}>
              <input
                type="number"
                min="0"
                max="20"
                value={score}
                onChange={e => { setScore(e.target.value); setFout(""); }}
                style={{ ...s.inputScore, borderColor: fout ? "#dc2626" : "#ccc" }}
                placeholder="0 – 20"
              />
              <span style={s.scoreHint}>/ 20</span>
            </div>
            {fout && <p style={s.foutInline}>⚠️ {fout}</p>}

            <label style={{ ...s.label, marginTop: "1rem" }}>Feedback:</label>
            <textarea
              style={s.textarea}
              value={feedbackTekst}
              onChange={e => setFeedbackTekst(e.target.value)}
              placeholder="Schrijf hier uw feedback voor de student..."
            />
          </>
        ) : (
          <div style={s.infoBanner}>
            ℹ️ Beoordeling kan worden ingevoerd zodra de student de eindpresentatie heeft ingediend.
          </div>
        )}
      </section>

      {kanInvullen && !toonReadonly && (
        <div style={s.checkboxRij}>
          <input
            type="checkbox"
            id="beëindigd"
            checked={evaluatieBeëindigd}
            onChange={e => setEvaluatieBeëindigd(e.target.checked)}
            style={s.checkbox}
          />
          <label htmlFor="beëindigd" style={s.checkboxLabel}>
            Evaluatie beëindigd
            <span style={s.checkboxToelichting}>
              {" "}— student kan de beoordeling zien en status wordt "Geëvalueerd"
            </span>
          </label>
        </div>
      )}

      <div style={s.knoppen}>
        {kanInvullen && !toonReadonly && (
          <button
            style={{ ...s.btn, ...s.btnGroen }}
            onClick={handleIndienen}
            disabled={bezig}
          >
            {bezig ? "BEZIG…" : isGeeval ? "OPSLAAN" : "BEVESTIGEN"}
          </button>
        )}
        {toonReadonly && (
          <button
            style={{ ...s.btn, ...s.btnGroen }}
            onClick={handleBewerken}
          >
            BEOORDELING BEWERKEN
          </button>
        )}
        <button style={{ ...s.btn, ...s.btnWit }} onClick={() => window.history.back()}>
          TERUG
        </button>
      </div>
    </div>
  );
}

const s = {
  pagina:              { maxWidth: "620px", margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif", color: "#222" },
  loading:             { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  titel:               { fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" },
  infoBlok:            { marginBottom: "1rem" },
  infoRegel:           { margin: "0.2rem 0", fontSize: "0.95rem" },
  infoLabel:           { fontWeight: "bold", marginRight: "0.4rem" },
  lijn:                { border: "none", borderTop: "1px solid #ccc", margin: "1.25rem 0" },
  statusMelding:       { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  waarschuwingMelding: { background: "#fefce8", border: "1px solid #fde047", color: "#854d0e", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  sectie:              { marginBottom: "1.25rem" },
  sectietitel:         { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" },
  label:               { display: "block", fontSize: "0.9rem", marginBottom: "0.4rem" },
  textarea:            { width: "100%", minHeight: "90px", padding: "0.6rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", background: "#fff" },
  textareaReadonly:    { background: "#f9f9f9", color: "#444", cursor: "default", outline: "none", userSelect: "none", pointerEvents: "none" },
  inputScore:          { width: "100px", padding: "0.5rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1.1rem" },
  scoreInvoerRij:      { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" },
  scoreHint:           { fontSize: "1rem", color: "#555" },
  foutInline:          { color: "#dc2626", background: "#fef2f2", padding: "0.4rem 0.75rem", borderRadius: "4px", marginBottom: "0.5rem", fontSize: "0.88rem" },
  docBtn:              { display: "inline-block", marginTop: "0.5rem", color: "#2563eb", fontSize: "0.85rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 },
  geenBijlage:         { marginTop: "0.5rem", fontSize: "0.85rem", color: "#888" },
  fout:                { color: "#dc2626", background: "#fef2f2", padding: "0.6rem 0.9rem", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.9rem" },
  infoBanner:          { background: "#f0f9ff", border: "1px solid #93c5fd", color: "#1e40af", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.9rem" },
  ingediendBadge:      { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.75rem" },
  scoreBlok:           { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem 1.5rem", marginBottom: "0.5rem" },
  scoreGetal:          { fontSize: "2rem", fontWeight: "bold", color: "#16a34a" },
  scoreMax:            { fontSize: "1rem", color: "#555" },
  knoppen:             { display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" },
  btn:                 { padding: "0.65rem 2.5rem", fontSize: "0.9rem", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em" },
  btnGroen:            { background: "#16a34a", color: "#fff", border: "none" },
  btnWit:              { background: "#fff", color: "#333", border: "1px solid #ccc" },
  checkboxRij:         { display: "flex", alignItems: "flex-start", gap: "0.6rem", margin: "1.5rem 0 0.5rem", padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px" },
  checkbox:            { marginTop: "2px", accentColor: "#16a34a", width: "16px", height: "16px", flexShrink: 0, cursor: "pointer" },
  checkboxLabel:       { fontSize: "0.9rem", fontWeight: "bold", color: "#166534", cursor: "pointer" },
  checkboxToelichting: { fontWeight: "normal", color: "#4b7c5e", fontSize: "0.85rem" },
  statusBadge: (status) => ({
    display: "inline-block",
    padding: "0.3rem 1rem",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "0.85rem",
    marginBottom: "1rem",
    background:  status === "open" ? "#fef9c3" : status === "submitted" ? "#dbeafe" : status === "evaluated" ? "#f0fdf4" : "#f3f4f6",
    color:       status === "open" ? "#854d0e" : status === "submitted" ? "#1e40af" : status === "evaluated" ? "#166534" : "#374151",
    border:      status === "open" ? "1px solid #fde047" : status === "submitted" ? "1px solid #93c5fd" : status === "evaluated" ? "1px solid #86efac" : "1px solid #d1d5db",
  }),
};
