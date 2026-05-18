import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MentorLogbookFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [logbook, setLogbook] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/mentor/logbook/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
  setLogbook(data);
  setFeedback(data.mentor_feedback || "");  // ← nouveau
  setStatus(data.status === "adjustment_required" ? "adjustment_required" : "approved");
})
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/logbooks/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ feedback, status })
      });
      if (!res.ok) throw new Error();
      navigate(-1);
    } catch {
      alert("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: 32 }}>Laden...</p>;
  if (error)   return <p style={{ padding: 32, color: "red" }}>{error}</p>;
  if (!logbook) return null;

  const weekLabel = `Week ${logbook.week}`;

  return (
    <div style={s.page}>
      <button onClick={() => navigate(-1)} style={s.back}>← Terug</button>
      <h1 style={s.title}>{weekLabel}</h1>

      <p style={s.sectionLabel}>Uitgevoerde taken</p>
      <div style={s.box}>{logbook.tasks || "—"}</div>

      <p style={s.sectionLabel}>Reflectie</p>
      <div style={s.box}>{logbook.reflection || "—"}</div>

      <p style={s.sectionLabel}>Feedback docent</p>

<div style={s.box}>{logbook.teacher_feedback || "Nog geen feedback van docent"}</div>


      <p style={s.sectionLabel}>Jouw feedback (mentor)</p>
      <textarea
        style={s.textarea}
        rows={4}
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Geef feedback op dit logboek"
      />

      <div style={s.radioGroup}>
        <label style={s.radio}>
          <input
            type="radio" name="status" value="approved"
            checked={status === "approved"}
            onChange={() => setStatus("approved")}
          />
          goedkeuren
        </label>
        <label style={s.radio}>
          <input
            type="radio" name="status" value="adjustment_required"
            checked={status === "adjustment_required"}
            onChange={() => setStatus("adjustment_required")}
          />
          aanpassingen vereist
        </label>
      </div>

      <button style={s.submitBtn} onClick={handleSubmit} disabled={saving}>
        {saving ? "Opslaan..." : "indienen"}
      </button>
    </div>
  );
}

const s = {
  page:         { maxWidth: 700, margin: "0 auto", padding: "32px", fontFamily: "'Segoe UI', sans-serif" },
  back:         { background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: 14, marginBottom: 24, padding: 0 },
  title:        { fontSize: 32, fontWeight: 800, marginBottom: 28, color: "#111827" },
  sectionLabel: { fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 8, marginTop: 20 },
  box:          { background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, padding: "12px 16px", fontSize: 14, color: "#374151", whiteSpace: "pre-wrap", minHeight: 60 },
  textarea:     { width: "100%", padding: "12px 16px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box", minHeight: 100, resize: "vertical" },
  radioGroup:   { display: "flex", gap: 32, marginTop: 16, fontSize: 14, color: "#374151" },
  radio:        { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  submitBtn:    { marginTop: 24, background: "#15803d", color: "white", border: "none", padding: "12px 28px", borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};