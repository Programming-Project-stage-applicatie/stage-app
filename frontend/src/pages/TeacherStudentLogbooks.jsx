import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  submitted:           { label: 'Ingediend',            bg: '#fbbf24', color: '#fff' },
  approved:            { label: 'Goedgekeurd',          bg: '#22c55e', color: '#fff' },
  adjustment_required: { label: 'Aanpassingen vereist', bg: '#f97316', color: '#fff' },
  open:                { label: 'Open',                 bg: '#e5e7eb', color: '#374151' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 6,
      fontSize: 13, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

export default function TeacherStudentLogbooks() {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const [logbooks, setLogbooks] = useState([]);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogbooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `/api/logbooks/internship/${internshipId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setLogbooks(data.logbooks || []);
        setInfo(data);
      } catch (e) {
        setError("Fout bij ophalen logboeken");
      }
    };
    fetchLogbooks();
  }, [internshipId]);

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <div>
          <h1 style={s.title}>Logboek overzicht</h1>
          {info?.student_name && <p style={{ fontSize: 18, fontWeight: 600, margin: '4px 0 0', color: '#374151' }}>{info.student_name}</p>}
          {info && (
            <div style={{ fontSize: 14, color: '#374151', marginTop: 8, display: 'flex', gap: 24 }}>
              <span><strong>Stage:</strong> {info.company || '—'}</span>
              <span><strong>Periode:</strong> {info.start_date} – {info.end_date}</span>
            </div>
          )}
        </div>
        <button style={s.backBtn} onClick={() => navigate('/teacher/logbooks')}>← Terug</button>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

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
            {logbooks.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ ...s.td, textAlign: 'center', color: '#9ca3af' }}>
                  Geen logboeken gevonden
                </td>
              </tr>
            ) : (
              logbooks.map((log, i) => (
                <tr key={log.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={s.td}>Week {log.week}</td>
                  <td style={s.td}><StatusBadge status={log.status} /></td>
                  <td style={s.td}>
                    <button style={s.btn} onClick={() => navigate(`/logbook/detail/${log.id}`)}>
                      Bekijken
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page:      { padding: '28px 32px', maxWidth: 800, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:     { fontSize: 26, fontWeight: 800, margin: 0, color: '#111827' },
  backBtn:   { padding: '7px 16px', fontSize: 13, fontWeight: 600, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' },
  tableWrap: { borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:        { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:        { padding: '13px 16px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  btn:       { padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' },
};