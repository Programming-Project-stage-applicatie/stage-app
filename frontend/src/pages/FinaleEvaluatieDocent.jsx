import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FinaleEvaluatieDocent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluatie, setEvaluatie]                   = useState(null);
  const [fout, setFout]                             = useState("");
  const [bezig, setBezig]                           = useState(false);
  const [succesMelding, setSuccesMelding]           = useState("");
  const [score, setScore]                           = useState("");
  const [feedbackTekst, setFeedbackTekst]           = useState("");
  const [evaluatieBeëindigd, setEvaluatieBeëindigd] = useState(false);
  const [opgeslagenAlsBeëindigd, setOpgeslagenAlsBeëindigd] = useState(false);

  const isEersteLaad = useRef(true);

  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  function toonSucces(tekst) {
    setSuccesMelding(tekst);
    setTimeout(() => setSuccesMelding(""), 3000);
  }

  // ── Data ophalen ───────────────────────────────────────────────────────────
  const haalOp = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/finale-evaluatie/internship/${id}/docent`,
        { headers: authHeaders }
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
      if (isEersteLaad.current) {
        const isGeeval = data.status === "evaluated";
        setEvaluatieBeëindigd(isGeeval);
        setOpgeslagenAlsBeëindigd(isGeeval);
        isEersteLaad.current = false;
      }
    } catch {
      setFout("Er ging iets mis bij het ophalen.");
    }
  }, [id, token]);

  useEffect(() => { haalOp(); }, [haalOp]);

  // ── Indienen / opslaan ─────────────────────────────────────────────────────
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
        `http://localhost:3000/api/finale-evaluatie/internship/${id}/docent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            final_score:     scoreNum,
            feedback_docent: feedbackTekst,
            beëindigd:       evaluatieBeëindigd,
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        setFout(d.error || "Indienen mislukt.");
      } else {
        toonSucces(
          evaluatieBeëindigd
            ? "✅ Evaluatie beëindigd en opgeslagen."
            : "✅ Score en feedback succesvol opgeslagen."
        );
        if (evaluatieBeëindigd) setOpgeslagenAlsBeëindigd(true);
        await haalOp();
      }
    } catch {
      setFout("Er ging iets mis bij het indienen.");
    } finally {
      setBezig(false);
    }
  }

  // ── Bewerken ───────────────────────────────────────────────────────────────
  function handleBewerken() {
    setOpgeslagenAlsBeëindigd(false);
    setEvaluatieBeëindigd(false);
  }

  // ── Bijlage openen ─────────────────────────────────────────────────────────
  async function openDocument() {
    try {
      const res = await fetch(
        `http://localhost:3000/api/finale-evaluatie/document/${id}`,
        { headers: authHeaders }
      );
      if (!res.ok) {
        setFout("Document kon niet worden geopend.");
        return;
      }
      const contentType = res.headers.get("content-type") || "application/octet-stream";
      const blob = await res.blob();
      const typedBlob = new Blob([blob], { type: contentType });
      const url = URL.createObjectURL(typedBlob);
      window.open(url, "_blank");
    } catch {
      setFout("Er ging iets mis bij het openen van het document.");
    }
  }

  function vertaalStatus(status) {
    const vertalingen = { open: "Open", submitted: "Ingediend", evaluated: "Geëvalueerd" };
    return vertalingen[status] || status || "Onbekend";
  }

  if (fout && !evaluatie) return (
    <div style={s.pagina}>
      <p style={s.fout}>⚠️ {fout}</p>
      <button style={{ ...s.btn, ...s.btnWit }} onClick={haalOp}>Opnieuw proberen</button>
    </div>
  );

  if (!evaluatie) return <div style={s.loading}>Laden…</div>;

  const isIngediend    = evaluatie.status === "submitted";
  const isGeeval       = evaluatie.status === "evaluated";
  const kanInvullen    = isIngediend || isGeeval;
  const toonReadonly   = opgeslagenAlsBeëindigd || isGeeval;
  const kanBewerken    = toonReadonly && !isGeeval;

  return (
    <div style={s.pagina}>

      {succesMelding && <div style={s.successToast}>{succesMelding}</div>}

      <h1 style={s.titel}>Finale Evaluatie — Docent</h1>

      <div style={s.statusBadge(evaluatie.status)}>
        {vertaalStatus(evaluatie.status).toUpperCase()}
      </div>

      <div style={s.infoBlok}>
        <p style={s.infoRegel}><span style={s.infoLabel}>Student:</span>{evaluatie.student_naam || "—"}</p>
        <p style={s.infoRegel}><span style={s.infoLabel}>Stagebedrijf:</span>{evaluatie.bedrijf || "—"}</p>
        <p style={s.infoRegel}><span style={s.infoLabel}>Mentor:</span>{evaluatie.mentor_naam || "—"}</p>
        <p style={s.infoRegel}><span style={s.infoLabel}>Docent:</span>{user.firstname || user.username || "—"}</p>
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
                onClick={(e) => { e.stopPropagation(); openDocument(); }}
                style={{ ...s.docBtn, border: "2px solid red", padding: "8px" }}
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
          <div style={s.infoBanner}>ℹ️ Geen feedback mentor.</div>
        ) : (
          <textarea style={{ ...s.textarea, ...s.textareaReadonly }} value={evaluatie.mentor_motivatie} readOnly />
        )}
      </section>

      <hr style={s.lijn} />

      <section style={s.sectie}>
        <h2 style={s.sectietitel}>Feedback Docent</h2>
        {toonReadonly ? (
          <>
            <label style={s.label}>Eindscore:</label>
            <div style={s.scoreBlok}>
              <span style={s.scoreGetal}>{evaluatie.final_score != null ? evaluatie.final_score : "—"}</span>
              {evaluatie.final_score != null && <span style={s.scoreMax}> / 20</span>}
            </div>
            <label style={{ ...s.label, marginTop: "1rem" }}>Feedback:</label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={feedbackTekst}
              readOnly
              placeholder="Geen feedback ingevoerd."
            />
          </>
        ) : kanInvullen ? (
          <>
            <label style={s.label}>Eindscore (0–20) — optioneel:</label>
            <div style={s.scoreInvoerRij}>
              <input
                type="number" min="0" max="20" value={score}
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
            Beëindig evaluatie 
            <span style={s.checkboxToelichting}>
              {" "}— student kan de beoordeling zien en status wordt "Geëvalueerd"
            </span>
          </label>
        </div>
      )}

      <div style={s.knoppen}>
        {kanInvullen && !toonReadonly && (
          <button style={{ ...s.btn, ...s.btnGroen }} onClick={handleIndienen} disabled={bezig}>
            {bezig ? "BEZIG…" : isGeeval ? "OPSLAAN" : "BEVESTIGEN"}
          </button>
        )}
        {kanBewerken && (
          <button style={{ ...s.btn, ...s.btnOranje }} onClick={handleBewerken}>
            BEOORDELING BEWERKEN
          </button>
        )}
        <button style={s.terugLink} onClick={() => navigate("/dashboard/teacher")}>
          ← Terug naar dashboard
        </button>
      </div>
    </div>
  );
}

const s = {
  pagina:              { maxWidth: "620px", margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif", color: "#222", position: "relative" },
  loading:             { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  titel:               { fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" },
  successToast:        { position: "fixed", top: "1.5rem", right: "1.5rem", background: "#16a34a", color: "#fff", padding: "0.75rem 1.25rem", borderRadius: "8px", fontWeight: "bold", fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 9999 },
  infoBlok:            { marginBottom: "1rem" },
  infoRegel:           { margin: "0.2rem 0", fontSize: "0.95rem" },
  infoLabel:           { fontWeight: "bold", marginRight: "0.4rem" },
  lijn:                { border: "none", borderTop: "1px solid #ccc", margin: "1.25rem 0" },
  waarschuwingMelding: { background: "#fefce8", border: "1px solid #fde047", color: "#854d0e", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  sectie:              { marginBottom: "1.25rem" },
  sectietitel:         { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" },
  label:               { display: "block", fontSize: "0.9rem", marginBottom: "0.4rem" },
  textarea:            { width: "100%", minHeight: "90px", padding: "0.6rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", background: "#fff" },
  textareaReadonly:    { background: "#f9f9f9", color: "#444", cursor: "default", outline: "none", userSelect: "none" },
  inputScore:          { width: "100px", padding: "0.5rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1.1rem" },
  scoreInvoerRij:      { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" },
  scoreHint:           { fontSize: "1rem", color: "#555" },
  foutInline:          { color: "#dc2626", background: "#fef2f2", padding: "0.4rem 0.75rem", borderRadius: "4px", marginBottom: "0.5rem", fontSize: "0.88rem" },
  docBtn:              { display: "inline-block", marginTop: "0.5rem", color: "#2563eb", fontSize: "0.85rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0", pointerEvents: "auto", position: "relative", zIndex: 1 },
  geenBijlage:         { marginTop: "0.5rem", fontSize: "0.85rem", color: "#888" },
  fout:                { color: "#dc2626", background: "#fef2f2", padding: "0.6rem 0.9rem", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.9rem" },
  infoBanner:          { background: "#f0f9ff", border: "1px solid #93c5fd", color: "#1e40af", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.9rem" },
  ingediendBadge:      { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.75rem" },
  scoreBlok:           { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem 1.5rem", marginBottom: "0.5rem" },
  scoreGetal:          { fontSize: "2rem", fontWeight: "bold", color: "#16a34a" },
  scoreMax:            { fontSize: "1rem", color: "#555" },
  knoppen:             { display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" },
  btn:                 { padding: "0.65rem 2.5rem", fontSize: "0.9rem", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em", border: "none" },
  btnGroen:            { background: "#16a34a", color: "#fff" },
  btnOranje:           { background: "#ea580c", color: "#fff" },
  btnWit:              { background: "#fff", color: "#333", border: "1px solid #ccc" },
  terugLink:           { background: "none", border: "none", color: "#2563eb", fontSize: "0.9rem", cursor: "pointer", padding: 0, textDecoration: "underline" },
  checkboxRij:         { display: "flex", alignItems: "flex-start", gap: "0.6rem", margin: "1.5rem 0 0.5rem", padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px" },
  checkbox:            { marginTop: "2px", accentColor: "#16a34a", width: "16px", height: "16px", flexShrink: 0, cursor: "pointer" },
  checkboxLabel:       { fontSize: "0.9rem", fontWeight: "bold", color: "#166534", cursor: "pointer" },
  checkboxToelichting: { fontWeight: "normal", color: "#4b7c5e", fontSize: "0.85rem" },
  statusBadge: (status) => ({
    display: "inline-block", padding: "0.3rem 1rem", borderRadius: "20px", fontWeight: "bold", fontSize: "0.85rem", marginBottom: "1rem",
    background: status === "open" ? "#fef9c3" : status === "submitted" ? "#dbeafe" : status === "evaluated" ? "#f0fdf4" : "#f3f4f6",
    color:      status === "open" ? "#854d0e" : status === "submitted" ? "#1e40af" : status === "evaluated" ? "#166534" : "#374151",
    border:     status === "open" ? "1px solid #fde047" : status === "submitted" ? "1px solid #93c5fd" : status === "evaluated" ? "1px solid #86efac" : "1px solid #d1d5db",
  }),
};
