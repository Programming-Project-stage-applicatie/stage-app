import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export default function FinaleEvaluatieAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [error, setError]           = useState("");

  const token       = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  function getStatusLabel(status) {
    const map = {
      open:      t("FinaleEvaluatieDocent.statusOpen"),
      submitted: t("FinaleEvaluatieDocent.statusSubmitted"),
      evaluated: t("FinaleEvaluatieDocent.statusEvaluated"),
    };
    return map[status] || t("FinaleEvaluatieDocent.statusUnknown");
  }

  const fetchEvaluation = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/finale-evaluatie/internship/${id}/docent`,
        { headers: authHeaders }
      );
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || t("FinaleEvaluatieDocent.errorFetchFailed"));
        return;
      }
      const data = await res.json();
      setEvaluation(data);
    } catch {
      setError(t("FinaleEvaluatieDocent.errorFetchFailed"));
    }
  }, [id, token]);

  useEffect(() => { fetchEvaluation(); }, [fetchEvaluation]);

async function openDocument() {
  try {
    const res = await fetch(
      `http://localhost:3000/api/finale-evaluatie/document/${id}`,
      { headers: authHeaders }
    );
    if (!res.ok) { setError(t("FinaleEvaluatieDocent.errorDocumentFailed")); return; }
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const blob = await res.blob();
    const url  = URL.createObjectURL(new Blob([blob], { type: contentType }));
    const a    = document.createElement("a");
    a.href     = url;
    a.target   = "_blank";
    a.rel      = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch {
    setError(t("FinaleEvaluatieDocent.errorDocumentFailed"));
  }
}

  if (error && !evaluation) return (
    <div style={s.page}>
      <p style={s.errorStyle}>⚠️ {error}</p>
      <button style={{ ...s.btn, ...s.btnWhite }} onClick={fetchEvaluation}>
        {t("FinaleEvaluatieDocent.retry")}
      </button>
    </div>
  );

  if (!evaluation) return <div style={s.loading}>{t("FinaleEvaluatieDocent.loading")}</div>;

  return (
    <div style={s.page}>

     <h1 style={s.title}>Finale Evaluatie — Welkom, Admin</h1>

      <div style={s.statusBadge(evaluation.status)}>
        {getStatusLabel(evaluation.status).toUpperCase()}
      </div>

      <div style={s.infoBlock}>
        <p style={s.infoRow}><span style={s.infoLabel}>{t("FinaleEvaluatieDocent.student")}:</span>{evaluation.student_naam || "—"}</p>
        <p style={s.infoRow}><span style={s.infoLabel}>{t("FinaleEvaluatieDocent.company")}:</span>{evaluation.bedrijf || "—"}</p>
        <p style={s.infoRow}><span style={s.infoLabel}>{t("FinaleEvaluatieDocent.mentor")}:</span>{evaluation.mentor_naam || "—"}</p>
      </div>

      <hr style={s.divider} />

      {evaluation.status === "open" && (
        <div style={s.warningMessage}>
          ⏳ {t("FinaleEvaluatieDocent.notYetSubmittedWarning")}
        </div>
      )}

      {/* Presentatie */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>{t("FinaleEvaluatieDocent.sectionPresentation")}</h2>
        {evaluation.status === "open" ? (
          <div style={s.infoBanner}>ℹ️ {t("FinaleEvaluatieDocent.notYetSubmittedInfo")}</div>
        ) : (
          <>
            <div style={s.submittedBadge}>✅ {t("FinaleEvaluatieDocent.submittedBadge")}</div>
            <label style={s.label}>{t("FinaleEvaluatieDocent.presentationDescription")}</label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={evaluation.presentation || ""}
              readOnly
              placeholder={t("FinaleEvaluatieDocent.noDescriptionAvailable")}
            />
            {evaluation.document ? (
              <button onClick={(e) => { e.stopPropagation(); openDocument(); }} style={s.docBtn}>
                📎 {evaluation.document.split("/").pop()} — {t("FinaleEvaluatieDocent.clickToOpen")}
              </button>
            ) : (
              <p style={s.noAttachment}>📄 {t("FinaleEvaluatieDocent.noAttachment")}</p>
            )}
          </>
        )}
      </section>

      <hr style={s.divider} />

      {/* Mentor feedback */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>{t("FinaleEvaluatieDocent.sectionMentorFeedback")}</h2>
        {!evaluation.mentor_motivatie ? (
          <div style={s.infoBanner}>ℹ️ {t("FinaleEvaluatieDocent.noMentorFeedback")}</div>
        ) : (
          <textarea style={{ ...s.textarea, ...s.textareaReadonly }} value={evaluation.mentor_motivatie} readOnly />
        )}
      </section>

      <hr style={s.divider} />

      {/* Docent feedback */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>{t("FinaleEvaluatieDocent.sectionTeacherFeedback")}</h2>
        <label style={s.label}>{t("FinaleEvaluatieDocent.finalScore")}:</label>
        <div style={s.scoreBlock}>
          <span style={s.scoreNumber}>{evaluation.final_score != null ? evaluation.final_score : "—"}</span>
          {evaluation.final_score != null && <span style={s.scoreMax}> / 20</span>}
        </div>
        <label style={{ ...s.label, marginTop: "1rem" }}>{t("FinaleEvaluatieDocent.feedback")}:</label>
        <textarea
          style={{ ...s.textarea, ...s.textareaReadonly }}
          value={evaluation.feedback_docent || ""}
          readOnly
          placeholder={t("FinaleEvaluatieDocent.noFeedbackEntered")}
        />
      </section>

      <div style={s.buttons}>
        <button style={s.backLink} onClick={() => navigate("/admin/final-evaluation-overview")}>
          ← Terug naar overzicht
        </button>
      </div>
    </div>
  );
}

const s = {
  page:             { maxWidth: "620px", margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif", color: "#222", position: "relative" },
  loading:          { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  title:            { fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" },
  infoBlock:        { marginBottom: "1rem" },
  infoRow:          { margin: "0.2rem 0", fontSize: "0.95rem" },
  infoLabel:        { fontWeight: "bold", marginRight: "0.4rem" },
  divider:          { border: "none", borderTop: "1px solid #ccc", margin: "1.25rem 0" },
  warningMessage:   { background: "#fefce8", border: "1px solid #fde047", color: "#854d0e", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  section:          { marginBottom: "1.25rem" },
  sectionTitle:     { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" },
  label:            { display: "block", fontSize: "0.9rem", marginBottom: "0.4rem" },
  textarea:         { width: "100%", minHeight: "90px", padding: "0.6rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", background: "#fff" },
  textareaReadonly: { background: "#efefef", color: "#666", cursor: "not-allowed", outline: "none", userSelect: "none", pointerEvents: "none", border: "1px solid #ddd", resize: "none" },
  docBtn:           { display: "inline-block", marginTop: "0.5rem", color: "#2563eb", fontSize: "0.85rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0" },
  noAttachment:     { marginTop: "0.5rem", fontSize: "0.85rem", color: "#888" },
  errorStyle:       { color: "#dc2626", background: "#fef2f2", padding: "0.6rem 0.9rem", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.9rem" },
  infoBanner:       { background: "#f0f9ff", border: "1px solid #93c5fd", color: "#1e40af", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.9rem" },
  submittedBadge:   { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.75rem" },
  scoreBlock:       { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem 1.5rem", marginBottom: "0.5rem" },
  scoreNumber:      { fontSize: "2rem", fontWeight: "bold", color: "#16a34a" },
  scoreMax:         { fontSize: "1rem", color: "#555" },
  buttons:          { display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" },
  btn:              { padding: "0.65rem 2.5rem", fontSize: "0.9rem", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em", border: "none" },
  btnWhite:         { background: "#fff", color: "#333", border: "1px solid #ccc" },
  backLink:         { background: "none", border: "none", color: "#2563eb", fontSize: "0.9rem", cursor: "pointer", padding: 0, textDecoration: "underline" },
  statusBadge: (status) => ({
    display: "inline-block", padding: "0.3rem 1rem", borderRadius: "20px", fontWeight: "bold", fontSize: "0.85rem", marginBottom: "1rem",
    background: status === "open" ? "#fef9c3" : status === "submitted" ? "#dbeafe" : status === "evaluated" ? "#f0fdf4" : "#f3f4f6",
    color:      status === "open" ? "#854d0e" : status === "submitted" ? "#1e40af" : status === "evaluated" ? "#166534" : "#374151",
    border:     status === "open" ? "1px solid #fde047" : status === "submitted" ? "1px solid #93c5fd" : status === "evaluated" ? "1px solid #86efac" : "1px solid #d1d5db",
  }),
};