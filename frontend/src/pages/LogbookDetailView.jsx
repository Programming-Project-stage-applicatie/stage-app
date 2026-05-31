import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  submitted:           { label: 'Ingediend',            bg: '#e8a818', color: '#fff' },
  approved:            { label: 'Goedgekeurd',          bg: '#3a9e4f', color: '#fff' },
  adjustment_required: { label: 'Aanpassingen vereist', bg: '#e05a1a', color: '#fff' },
  open:                { label: 'Open',                 bg: '#e5e7eb', color: '#6b7280' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 6,
      fontSize: 12, fontWeight: 500, background: cfg.bg, color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

export default function LogbookDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logbook, setLogbook] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
 const [loading, setLoading] = useState(true);
const token = localStorage.getItem("token");
const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
const isMentor = payload.role === "mentor";

  useEffect(() => {
    const fetchLogbook = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3000/api/supervisor/logbooks/${id}/detail`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setLogbook(data);
        setFeedback(data.feedback || "");
      } catch {
        setError("Fout bij het laden van het logboek.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogbook();
  }, [id]);

const handleSubmitFeedback = async (status) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/api/supervisor/logbooks/${id}/feedback`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ feedback, status }),
        }
      );
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      alert("Fout bij het opslaan van feedback.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Laden...</p>;
  if (error)   return <p style={{ textAlign: 'center', padding: 32, color: '#dc2626' }}>{error}</p>;
  if (!logbook) return null;

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => navigate(-1)}>terug</button>

      <div style={s.headerRow}>
        <h1 style={s.title}>
          {logbook.student_name || 'Student'} &nbsp;
          {logbook.company || ''}
        </h1>
        <StatusBadge status={logbook.status} />
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Uitgevoerde taken</h2>
        <p style={s.sectionText}>{logbook.tasks || '-'}</p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Reflectie</h2>
        <p style={s.sectionText}>{logbook.reflection || '-'}</p>
      </div>

      {logbook.problems && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Problemen</h2>
          <p style={s.sectionText}>{logbook.problems}</p>
        </div>
      )}

      {logbook.feedback && (
        <div style={s.feedbackBox}>
          <h2 style={s.sectionTitle}>Feedback van mentor</h2>
          <p style={s.sectionText}>{logbook.feedback}</p>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Jouw feedback (optioneel)</h2>
        <textarea
          style={{ ...s.textarea, background: saved ? '#f9fafb' : '#fff' }}
          rows={4}
          placeholder="geef feedback op dit logboek"
          value={feedback}
          onChange={e => { if (!saved) setFeedback(e.target.value); }}
          readOnly={saved}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {saved ? (
          <>
            <button style={s.savedBtn} disabled>✓ Opgeslagen</button>
            <button style={s.cancelBtn} onClick={() => setSaved(false)}>Wijzigen</button>
          </>
        ) : (
          <>
           {isMentor ? (
  <>
    <button style={s.submitBtn} onClick={() => handleSubmitFeedback("approved")} disabled={saving}>
      {saving ? 'Opslaan...' : 'Goedkeuren'}
    </button>
    <button style={{ ...s.submitBtn, background: '#e05a1a' }} onClick={() => handleSubmitFeedback("adjustment_required")} disabled={saving}>
      {saving ? 'Opslaan...' : 'Aanpassingen vereist'}
    </button>
  </>
) : (
  <button style={s.submitBtn} onClick={() => handleSubmitFeedback("submitted")} disabled={saving}>
    {saving ? 'Opslaan...' : 'indienen'}
  </button>
)}
<button style={s.cancelBtn} onClick={() => navigate(-1)}>annuleren</button>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page:         { padding: '28px 32px', maxWidth: 860, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  backBtn:      { padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151', marginBottom: 20 },
  headerRow:    { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  title:        { fontSize: 24, fontWeight: 800, margin: 0, color: '#111827' },
  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: '#111827' },
  sectionText:  { fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 },
  feedbackBox:  { background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 18px', marginBottom: 20 },
  textarea:     { width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 8, border: '1px solid #d1d5db', resize: 'vertical', fontFamily: "'Segoe UI', sans-serif", color: '#374151', boxSizing: 'border-box' },
  submitBtn:    { padding: '9px 22px', fontSize: 14, fontWeight: 600, borderRadius: 8, border: 'none', background: '#3a9e4f', color: '#fff', cursor: 'pointer' },
  savedBtn:     { padding: '9px 22px', fontSize: 14, fontWeight: 600, borderRadius: 8, border: 'none', background: '#9ca3af', color: '#fff', cursor: 'default' },
  cancelBtn:    { padding: '9px 22px', fontSize: 14, fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' },
};