import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";


export default function FinaleEvaluatieDocent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation]             = useState(null);
  const [error, setError]                       = useState("");
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [successMessage, setSuccessMessage]     = useState("");
  const [score, setScore]                       = useState("");
  const [feedbackText, setFeedbackText]         = useState("");
  const [isFinalized, setIsFinalized]           = useState(false);
  const [savedAsFinalized, setSavedAsFinalized] = useState(false);

  const isFirstLoad = useRef(true);

  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const token       = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  function showSuccess(text) {
    setSuccessMessage(text);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

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
      setScore(data.final_score != null ? String(data.final_score) : "");
      setFeedbackText(data.feedback_docent || "");
      if (isFirstLoad.current) {
        const alreadyEvaluated = data.status === "evaluated";
        setIsFinalized(alreadyEvaluated);
        setSavedAsFinalized(alreadyEvaluated);
        isFirstLoad.current = false;
      }
    } catch {
      setError(t("FinaleEvaluatieDocent.errorFetchFailed"));
    }
  }, [id, token]);

  useEffect(() => { fetchEvaluation(); }, [fetchEvaluation]);

  async function handleSubmit() {
    setError("");
    let scoreNum = null;
    if (score !== "") {
      scoreNum = Number(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
        setError(t("FinaleEvaluatieDocent.errorInvalidScore"));
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/finale-evaluatie/internship/${id}/docent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            final_score:     scoreNum,
            feedback_docent: feedbackText,
            beëindigd:       isFinalized,
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || t("FinaleEvaluatieDocent.errorSubmitFailed"));
      } else {
        showSuccess(
          isFinalized
            ? t("FinaleEvaluatieDocent.successFinalized")
            : t("FinaleEvaluatieDocent.successSaved")
        );
        if (isFinalized) setSavedAsFinalized(true);
        await fetchEvaluation();
      }
    } catch {
      setError(t("FinaleEvaluatieDocent.errorSubmitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit() {
    setSavedAsFinalized(false);
    setIsFinalized(false);
  }

  async function openDocument() {
    try {
      const res = await fetch(
        `http://localhost:3000/api/finale-evaluatie/document/${id}`,
        { headers: authHeaders }
      );
      if (!res.ok) {
        setError(t("FinaleEvaluatieDocent.errorDocumentFailed"));
        return;
      }
      const contentType = res.headers.get("content-type") || "application/octet-stream";
      const blob        = await res.blob();
      const url         = URL.createObjectURL(new Blob([blob], { type: contentType }));
      window.open(url, "_blank");
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

  const isSubmitted  = evaluation.status === "submitted";
  const isEvaluated  = evaluation.status === "evaluated";
  const canFill      = isSubmitted || isEvaluated;
  const showReadonly = savedAsFinalized || isEvaluated;
  const canEdit      = showReadonly && !isEvaluated;

  return (
    <div style={s.page}>

      {successMessage && <div style={s.successToast}>{successMessage}</div>}

      <h1 style={s.title}>{t("FinaleEvaluatieDocent.title")}</h1>

      <div style={s.statusBadge(evaluation.status)}>
        {getStatusLabel(evaluation.status).toUpperCase()}
      </div>

      <div style={s.infoBlock}>
        <p style={s.infoRow}><span style={s.infoLabel}>{t("FinaleEvaluatieDocent.student")}:</span>{evaluation.student_naam || "—"}</p>
        <p style={s.infoRow}><span style={s.infoLabel}>{t("FinaleEvaluatieDocent.company")}:</span>{evaluation.bedrijf || "—"}</p>
        <p style={s.infoRow}><span style={s.infoLabel}>{t("FinaleEvaluatieDocent.mentor")}:</span>{evaluation.mentor_naam || "—"}</p>
        <p style={s.infoRow}><span style={s.infoLabel}>{t("FinaleEvaluatieDocent.teacher")}:</span>{user.firstname || user.username || "—"}</p>
      </div>

      <hr style={s.divider} />

      {evaluation.status === "open" && (
        <div style={s.warningMessage}>
          ⏳ {t("FinaleEvaluatieDocent.notYetSubmittedWarning")}
        </div>
      )}

      <section style={s.section}>
        <h2 style={s.sectionTitle}>{t("FinaleEvaluatieDocent.sectionPresentation")}</h2>
        {!isSubmitted && !isEvaluated ? (
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

      <section style={s.section}>
        <h2 style={s.sectionTitle}>{t("FinaleEvaluatieDocent.sectionMentorFeedback")}</h2>
        {!evaluation.mentor_motivatie ? (
          <div style={s.infoBanner}>ℹ️ {t("FinaleEvaluatieDocent.noMentorFeedback")}</div>
        ) : (
          <textarea style={{ ...s.textarea, ...s.textareaReadonly }} value={evaluation.mentor_motivatie} readOnly />
        )}
      </section>

      <hr style={s.divider} />

      <section style={s.section}>
        <h2 style={s.sectionTitle}>{t("FinaleEvaluatieDocent.sectionTeacherFeedback")}</h2>
        {showReadonly ? (
          <>
            <label style={s.label}>{t("FinaleEvaluatieDocent.finalScore")}:</label>
            <div style={s.scoreBlock}>
              <span style={s.scoreNumber}>{evaluation.final_score != null ? evaluation.final_score : "—"}</span>
              {evaluation.final_score != null && <span style={s.scoreMax}> / 20</span>}
            </div>
            <label style={{ ...s.label, marginTop: "1rem" }}>{t("FinaleEvaluatieDocent.feedback")}:</label>
            <textarea
              style={{ ...s.textarea, ...s.textareaReadonly }}
              value={feedbackText}
              readOnly
              placeholder={t("FinaleEvaluatieDocent.noFeedbackEntered")}
            />
          </>
        ) : canFill ? (
          <>
            <label style={s.label}>{t("FinaleEvaluatieDocent.scoreOptionalLabel")}</label>
            <div style={s.scoreInputRow}>
              <input
                type="number" min="0" max="20" value={score}
                onChange={e => { setScore(e.target.value); setError(""); }}
                style={{ ...s.inputScore, borderColor: error ? "#dc2626" : "#ccc" }}
                placeholder="0 – 20"
              />
              <span style={s.scoreHint}>/ 20</span>
            </div>
            {error && <p style={s.errorInline}>⚠️ {error}</p>}
            <label style={{ ...s.label, marginTop: "1rem" }}>{t("FinaleEvaluatieDocent.feedback")}:</label>
            <textarea
              style={s.textarea}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder={t("FinaleEvaluatieDocent.feedbackPlaceholder")}
            />
          </>
        ) : (
          <div style={s.infoBanner}>
            ℹ️ {t("FinaleEvaluatieDocent.canFillWhenSubmitted")}
          </div>
        )}
      </section>

      {canFill && !showReadonly && (
        <div style={s.checkboxRow}>
          <input
            type="checkbox"
            id="finalize"
            checked={isFinalized}
            onChange={e => setIsFinalized(e.target.checked)}
            style={s.checkbox}
          />
          <label htmlFor="finalize" style={s.checkboxLabel}>
            {t("FinaleEvaluatieDocent.finalizeCheckbox")}
            <span style={s.checkboxNote}>{" "}— {t("FinaleEvaluatieDocent.finalizeNote")}</span>
          </label>
        </div>
      )}

      <div style={s.buttons}>
        {canFill && !showReadonly && (
          <button style={{ ...s.btn, ...s.btnGreen }} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("FinaleEvaluatieDocent.saving") : t("FinaleEvaluatieDocent.save")}
          </button>
        )}
        {canEdit && (
          <button style={{ ...s.btn, ...s.btnOrange }} onClick={handleEdit}>
            {t("FinaleEvaluatieDocent.editAssessment")}
          </button>
        )}
        <button style={s.backLink} onClick={() => navigate("/teacher/final-evaluation-overview")}>
          ← Terug naar overzicht
        </button>
      </div>
    </div>
  );
}

const s = {
  page:           { maxWidth: "620px", margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif", color: "#222", position: "relative" },
  loading:        { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  title:          { fontSize: "1.6rem", fontWeight: "bold", marginBottom: "1rem" },
  successToast:   { position: "fixed", top: "1.5rem", right: "1.5rem", background: "#16a34a", color: "#fff", padding: "0.75rem 1.25rem", borderRadius: "8px", fontWeight: "bold", fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 9999 },
  infoBlock:      { marginBottom: "1rem" },
  infoRow:        { margin: "0.2rem 0", fontSize: "0.95rem" },
  infoLabel:      { fontWeight: "bold", marginRight: "0.4rem" },
  divider:        { border: "none", borderTop: "1px solid #ccc", margin: "1.25rem 0" },
  warningMessage: { background: "#fefce8", border: "1px solid #fde047", color: "#854d0e", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" },
  section:        { marginBottom: "1.25rem" },
  sectionTitle:   { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" },
  label:          { display: "block", fontSize: "0.9rem", marginBottom: "0.4rem" },
  textarea:       { width: "100%", minHeight: "90px", padding: "0.6rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", background: "#fff" },
  textareaReadonly: { background: "#efefef", color: "#666", cursor: "not-allowed", outline: "none", userSelect: "none", pointerEvents: "none", border: "1px solid #ddd", resize: "none" },
  inputScore:     { width: "100px", padding: "0.5rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1.1rem" },
  scoreInputRow:  { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" },
  scoreHint:      { fontSize: "1rem", color: "#555" },
  errorInline:    { color: "#dc2626", background: "#fef2f2", padding: "0.4rem 0.75rem", borderRadius: "4px", marginBottom: "0.5rem", fontSize: "0.88rem" },
  docBtn:         { display: "inline-block", marginTop: "0.5rem", color: "#2563eb", fontSize: "0.85rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0" },
  noAttachment:   { marginTop: "0.5rem", fontSize: "0.85rem", color: "#888" },
  errorStyle:     { color: "#dc2626", background: "#fef2f2", padding: "0.6rem 0.9rem", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.9rem" },
  infoBanner:     { background: "#f0f9ff", border: "1px solid #93c5fd", color: "#1e40af", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.9rem" },
  submittedBadge: { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: "20px", padding: "0.2rem 0.75rem", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.75rem" },
  scoreBlock:     { display: "inline-block", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem 1.5rem", marginBottom: "0.5rem" },
  scoreNumber:    { fontSize: "2rem", fontWeight: "bold", color: "#16a34a" },
  scoreMax:       { fontSize: "1rem", color: "#555" },
  buttons:        { display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" },
  btn:            { padding: "0.65rem 2.5rem", fontSize: "0.9rem", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em", border: "none" },
  btnGreen:       { background: "#16a34a", color: "#fff" },
  btnOrange:      { background: "#ea580c", color: "#fff" },
  btnWhite:       { background: "#fff", color: "#333", border: "1px solid #ccc" },
  backLink:       { background: "none", border: "none", color: "#2563eb", fontSize: "0.9rem", cursor: "pointer", padding: 0, textDecoration: "underline" },
  checkboxRow:    { display: "flex", alignItems: "flex-start", gap: "0.6rem", margin: "1.5rem 0 0.5rem", padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "6px" },
  checkbox:       { marginTop: "2px", accentColor: "#16a34a", width: "16px", height: "16px", flexShrink: 0, cursor: "pointer" },
  checkboxLabel:  { fontSize: "0.9rem", fontWeight: "bold", color: "#166534", cursor: "pointer" },
  checkboxNote:   { fontWeight: "normal", color: "#4b7c5e", fontSize: "0.85rem" },
  statusBadge: (status) => ({
    display: "inline-block", padding: "0.3rem 1rem", borderRadius: "20px", fontWeight: "bold", fontSize: "0.85rem", marginBottom: "1rem",
    background: status === "open" ? "#fef9c3" : status === "submitted" ? "#dbeafe" : status === "evaluated" ? "#f0fdf4" : "#f3f4f6",
    color:      status === "open" ? "#854d0e" : status === "submitted" ? "#1e40af" : status === "evaluated" ? "#166534" : "#374151",
    border:     status === "open" ? "1px solid #fde047" : status === "submitted" ? "1px solid #93c5fd" : status === "evaluated" ? "1px solid #86efac" : "1px solid #d1d5db",
  }),
};
