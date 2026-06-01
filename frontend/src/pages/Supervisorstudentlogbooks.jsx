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

export default function SupervisorStudentLogbooks() {
const { internshipId: id } = useParams();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [logbooks, setLogbooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
    
      try {
        const token = localStorage.getItem("token");
      const res = await fetch(
  `http://localhost:3000/api/supervisor/internship/${id}/logbooks`,
  { headers: { Authorization: `Bearer ${token}` } }
);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setStudentName(json.data.student_name || "");
        setLogbooks(json.data.logbooks || []);
      } catch {
        setError("Fout bij het laden van logboeken.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => navigate(-1)}>← Terug</button>

      <div style={{ margin: '16px 0 24px' }}>
        <h1 style={s.title}>LOGBOEK OVERZICHT{studentName ? ` - ${studentName}` : ''}</h1>
      </div>

      {loading && <p style={s.info}>Laden...</p>}
      {error   && <p style={{ ...s.info, color: '#dc2626' }}>{error}</p>}

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
                <tr>
                  <td colSpan={3} style={{ ...s.td, color: '#9ca3af', textAlign: 'center' }}>
                    Geen logboeken gevonden
                  </td>
                </tr>
              )}
              {logbooks.map((log, i) => (
                <tr key={log.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}>Week {log.week}</td>
                  <td style={s.td}><StatusBadge status={log.status} /></td>
                  <td style={s.td}>
                    <button
                      style={s.btn}
                   onClick={() => navigate(`/supervisor/logbook/${log.id}`)}
                    >
                      Bekijken
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page:      { padding: '28px 32px', maxWidth: 900, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  title:     { fontSize: 20, fontWeight: 800, margin: 0, color: '#111827' },
  info:      { textAlign: 'center', color: '#9ca3af', padding: 32 },
  tableWrap: { borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:        { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:        { padding: '13px 16px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', color: '#374151' },
  btn:       { padding: '7px 16px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' },
  backBtn:   { padding: '7px 16px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' },
};