import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/translations';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_CONFIG = {
  submitted: { label: t('logbooks.status.submitted'), bg: '#fde68a', color: '#78350f' },
  approved:  { label: t('logbooks.status.approved'),  bg: '#86efac', color: '#14532d' },
  revision:  { label: t('logbooks.status.adjustment_required'), bg: '#fb923c', color: '#fff' },
  open:      { label: t('logbooks.status.open'),      bg: '#bfdbfe', color: '#1e3a5f' },
  none:      { label: t('logbooks.status.none'),      bg: '#e5e7eb', color: '#6b7280' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 14px', borderRadius: 6,
      fontSize: 13, fontWeight: 600, background: cfg.bg, color: cfg.color, minWidth: 110, textAlign: 'center',
    }}>
      {cfg.label}
    </span>
  );
}

export default function MentorLogboekOverzicht() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  useEffect(() => {
    fetch(`${API_BASE}/api/mentor/logbooks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        setStudents(json.data.students || []);
        setCompany(json.data.company || '');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={s.page}>
      <div style={s.date}>{today}</div>
      <h1 style={s.title}>{t('logbooks.supervisorOverview')}</h1>
      <p style={s.subtitle}>{company} — {t('logbooks.supervisorInterns')}</p>

      {loading && <p style={s.info}>{t('logbooks.loading')}</p>}
      {error   && <p style={{ ...s.info, color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={s.tableWrap}>
          <p style={s.sectionLabel}>{t('logbooks.interns')}</p>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Student</th>
                <th style={s.th}>{t('logbooks.lastWeek')}</th>
                <th style={s.th}>Status</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...s.td, color: '#9ca3af', textAlign: 'center' }}>
                    {t('logbooks.noInterns')}
                  </td>
                </tr>
              )}
              {students.map((student, i) => (
  <tr key={`${student.id}-${i}`} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={s.td}>{student.name}</td>
                  <td style={s.td}>{student.last_week ? `${t('logbooks.week')} ${student.last_week}` : '—'}</td>
                  <td style={s.td}><StatusBadge status={student.status || 'none'} /></td>
                  <td style={s.td}>
                    <button style={s.btn} onClick={() => navigate(`/mentor/student/${student.id}/logbooks`)}>
                      {t('logbooks.viewOverview')}
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
  page:         { padding: '28px 32px', maxWidth: 700, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  date:         { textAlign: 'center', fontSize: 13, color: '#6b7280', marginBottom: 16 },
  title:        { fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: '#111827' },
  subtitle:     { fontSize: 14, color: '#6b7280', margin: '0 0 24px' },
  sectionLabel: { fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 },
  info:         { textAlign: 'center', color: '#9ca3af', padding: 32 },
  tableWrap:    { borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:           { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:           { padding: '13px 16px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  btn:          { padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' },
};