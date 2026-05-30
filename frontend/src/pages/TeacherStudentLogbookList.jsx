import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  submitted:           { label: 'ingediend',            bg: '#e8a818', color: '#fff' },
  approved:            { label: 'goedgekeurd',          bg: '#3a9e4f', color: '#fff' },
  adjustment_required: { label: 'aanpassingen vereist', bg: '#e05a1a', color: '#fff' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return (
    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#e5e7eb', color: '#6b7280', whiteSpace: 'nowrap' }}>
      nog geen logboeken
    </span>
  );
  return (
    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
}

function StatCard({ count, label, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 8, padding: '12px 20px', minWidth: 90, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', letterSpacing: '0.5px', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function TeacherStudentLogbookList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
const isMentor = user.role === "mentor";

const res = await fetch(
  `http://localhost:3000/api/supervisor/${isMentor ? "mentor" : "teacher"}/logbooks`,
  { headers: { Authorization: `Bearer ${token}` } }
);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setStudents(json.data || []);
      } catch {
        setError("Fout bij het laden van studenten.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const counts = {
    submitted:           students.filter(s => s.status === 'submitted').length,
    approved:            students.filter(s => s.status === 'approved').length,
    adjustment_required: students.filter(s => s.status === 'adjustment_required').length,
  };

  const filtered = filter === 'all'
    ? students
    : filter === 'geen'
    ? students.filter(s => !s.status)
    : students.filter(s => s.status === filter);

  return (
    <div style={s.page}>

      <button style={s.backBtn} onClick={() => navigate(-1)}>← Terug</button>

      <div style={{ margin: '16px 0 20px' }}>
        <h1 style={s.title}>Logboek opvolging</h1>
        <p style={s.subtitle}>Overzicht van alle studenten</p>
      </div>

      <div style={s.statsRow}>
        <StatCard count={counts.submitted}           label="INGEDIEND"            bg="#e8a818" />
        <StatCard count={counts.approved}            label="GOEDGEKEURD"          bg="#3a9e4f" />
        <StatCard count={counts.adjustment_required} label="AANPASSINGEN VEREIST" bg="#e05a1a" />
        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <select style={s.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">filter</option>
            <option value="submitted">ingediend</option>
            <option value="approved">goedgekeurd</option>
            <option value="adjustment_required">aanpassingen vereist</option>
            <option value="geen">nog geen logboeken</option>
          </select>
        </div>
      </div>

      {loading && <p style={s.info}>Laden...</p>}
      {error   && <p style={{ ...s.info, color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Student</th>
                <th style={s.th}>Bedrijf</th>
                <th style={s.th}>laatste week</th>
                <th style={s.th}></th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...s.td, color: '#9ca3af', textAlign: 'center' }}>
                    Geen studenten gevonden
                  </td>
                </tr>
              )}
              {filtered.map((student, i) => (
                <tr key={student.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={s.td}>{student.name}</td>
                  <td style={s.td}>{student.company ?? '-'}</td>
                  <td style={s.td}>{student.last_week ? `Week ${student.last_week}` : '-'}</td>
                  <td style={s.td}><StatusBadge status={student.status} /></td>
                  <td style={s.td}>
                    <button style={s.btn} onClick={() => navigate(`/supervisor/students/${student.id}/logbooks`)}>
                      Bekijk overzicht
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
  title:     { fontSize: 26, fontWeight: 800, margin: '0 0 2px', color: '#111827' },
  subtitle:  { fontSize: 14, color: '#6b7280', margin: 0 },
  statsRow:  { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  select:    { fontSize: 13, padding: '6px 28px 6px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' },
  info:      { textAlign: 'center', color: '#9ca3af', padding: 32 },
  tableWrap: { borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:        { padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#111827', background: '#fff', borderBottom: '1.5px solid #e5e7eb' },
  td:        { padding: '13px 16px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', color: '#374151' },
  btn:       { padding: '7px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' },
  backBtn:   { padding: '7px 16px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' },
};