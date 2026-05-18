import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MentorLogbookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [logbooks, setLogbooks] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/students/${id}/logbooks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(json => {
        setLogbooks(json.data.logbooks || []);
        setStudentName(json.data.student_name || "");
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const statusConfig = {
    submitted:           { label: "Ingediend",            bg: "#fde68a", color: "#78350f" },
    approved:            { label: "Goedgekeurd",          bg: "#86efac", color: "#14532d" },
    adjustment_required: { label: "Aanpassing vereist",   bg: "#fb923c", color: "#fff"    },
    open:                { label: "Open",                 bg: "#bfdbfe", color: "#1e3a5f" },
  };

  return (
    <div style={s.page}>
      <button onClick={() => navigate(-1)} style={s.back}>← Terug</button>
      <h1 style={s.title}>Logboek overzicht — {studentName}</h1>

      {loading && <p>Laden...</p>}
      {error   && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Week</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actie</th>
              </tr>
            </thead>
            <tbody>
              {logbooks.length === 0 && (
                <tr><td colSpan={3} style={{ ...s.td, textAlign: "center", color: "#9ca3af" }}>Geen logboeken</td></tr>
              )}
              {logbooks.map((lb, i) => {
                const cfg = statusConfig[lb.status] || { label: lb.status, bg: "#e5e7eb", color: "#6b7280" };
                return (
                  <tr key={`${lb.id}-${i}`} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={s.td}>Week {lb.week}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.btn} onClick={() => navigate(`/mentor/logbook/${lb.id}`)}>
                        Bekijken
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page:     { padding: "28px 32px", maxWidth: 700, margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },
  back:     { background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: 14, marginBottom: 16, padding: 0 },
  title:    { fontSize: 24, fontWeight: 800, marginBottom: 24, color: "#111827" },
  tableWrap:{ borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" },
  table:    { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th:       { padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6b7280", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textTransform: "uppercase" },
  td:       { padding: "13px 16px", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" },
  badge:    { display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600 },
  btn:      { padding: "6px 14px", fontSize: 13, borderRadius: 7, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" },
};