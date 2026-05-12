import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export default function TeacherLogbookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [logbook, setLogbook] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("submitted");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/logbooks/detail/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setLogbook(data);
        setFeedback(data.feedback || "");
        setStatus(data.status);
      } catch {
        setError(t("logbook.errors.load"));
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/logbooks/${id}/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ feedback, status })
      });
      if (!res.ok) throw new Error();
      alert(t("logbook.feedbackSaved"));
      navigate(-1);
    } catch {
      alert(t("logbook.errors.save"));
    }
  };

  if (loading) return <p>{t("logbook.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!logbook) return null;

  return (
    <div style={s.page}>
      <h1 style={s.title}>Logboek — Week {logbook.week}</h1>

      <div style={s.card}>
        <h3 style={s.cardTitle}>{t("logbook.tasks")}</h3>
        <p style={s.cardText}>{logbook.tasks || "-"}</p>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>{t("logbook.reflection")}</h3>
        <p style={s.cardText}>{logbook.reflection || "-"}</p>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>{t("logbook.problems")}</h3>
        <p style={s.cardText}>{logbook.problems || "-"}</p>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>{t("logbook.feedback")}</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          style={s.textarea}
          placeholder="Geef feedback op dit logboek..."
        />
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>{t("logbook.status")}</h3>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={s.select}>
          <option value="approved">{t("logbook.statuses.approved")}</option>
          <option value="adjustment_required">{t("logbook.statuses.adjustment_required")}</option>
        </select>
      </div>

      <div style={s.actions}>
        <button style={s.saveBtn} onClick={handleSave}>{t("logbook.save")}</button>
        <button style={s.cancelBtn} onClick={() => navigate(-1)}>{t("logbook.back")}</button>
      </div>
    </div>
  );
}

const s = {
  page:      { maxWidth: 800, margin: "0 auto", padding: "2rem", fontFamily: "'Segoe UI', sans-serif" },
  title:     { fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#111827" },
  card:      { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px", marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 },
  cardText:  { fontSize: 14, color: "#374151", margin: 0 },
  textarea:  { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" },
  select:    { padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14 },
  actions:   { display: "flex", gap: 10, marginTop: 20 },
  saveBtn:   { background: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
  cancelBtn: { background: "#e5e7eb", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
};