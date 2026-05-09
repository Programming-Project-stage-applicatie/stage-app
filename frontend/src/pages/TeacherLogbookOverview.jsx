import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/translations';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_CONFIG = {
  submitted: { label: t('logbook.statuses.submitted'),           bg: '#fde68a', color: '#78350f' },
  approved:  { label: t('logbook.statuses.approved'),            bg: '#86efac', color: '#14532d' },
  revision:  { label: t('logbook.statuses.adjustment_required'), bg: '#fb923c', color: '#fff'    },
  none:      { label: t('logbook.statuses.none'),                bg: '#e5e7eb', color: '#6b7280' },
};

const FILTER_OPTIONS = [
  { value: 'all',       label: t('logbook.filter.all')        },
  { value: 'submitted', label: t('logbook.statuses.submitted')  },
  { value: 'approved',  label: t('logbook.statuses.approved')   },
  { value: 'revision',  label: t('logbook.statuses.adjustment_required') },
  { value: 'none',      label: t('logbook.statuses.none')       },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 6,
      fontSize: 13, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

function StatCard({ count, label, bg, color }) {
  return (
    <div style={{ background: bg, color, borderRadius: 8, padding: '14px 20px', minWidth: 90, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

export default function DocentLogboekOverzicht() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/supervisor/teacher/logbooks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => setStudents(json.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === 'all'
    ? students
    : students.filter(s => (s.status || 'none') === filter);

  const stats = {
    submitted: students.filter(s => s.status === 'submitted').length,
    approved:  students.filter(s => s.status === 'approved').length,
    revision:  students.filter(s => s.status === 'adjustment_required').length,
  };

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <div>
          <h1 style={s.title}>{t('logbooks.supervisorOverview')}</h1>
          <p style={s.subtitle}>{t('logbooks.supervisorSubtitle')}</p>
        </div>
      </div>

      {!loading && !error && (
        <div style={s.statsRow}>
          <StatCard count={stats.submitted} label={t('logbook.statuses.submitted')}           bg="#fde68a" color="#78350f" />
          <StatCard count={stats.approved}  label={t('logbook.statuses.approved')}            bg="#86efac" color="#14532d" />
          <StatCard count={stats.revision}  label={t('logbook.statuses.adjustment_required')} bg="#fb923c" color="#fff"    />
          <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={s.select}>
              {FILTER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading && <p style={s.info}>{t('logbooks.loading')}</p>}
      {error   && <p style={{ ...s.info, color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={s.tableWrap}>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...s.td, color: '#9ca3af', textAlign: 'center' }}>
                    {t('logbooks.noStudents')}
                  </td>
                </tr>
              )}
              {filtered.map((student, i) => (
                <tr key={student.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={s.td}>{student.name}</td>
                  <td style={s.td}>{student.last_week ? `${t('logbooks.week')} ${student.last_week}` : '—'}</td>
                  <td style={s.td}><StatusBadge status={student.status || 'none'} /></td>
                  <td style={s.td}>
                    <button style={s.btn} onClick={() => navigate(`/logbook/${student.id}`)}>
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
  page:      { padding: '28px 32px', maxWidth: 860, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:     { fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: '#111827' },
  subtitle:  { fontSize: 14, color: '#6b7280', margin: 0 },
  statsRow:  { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  select:    { padding: '7px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#fff', cursor: 'pointer' },
  info:      { textAlign: 'center', color: '#9ca3af', padding: 32 },
  tableWrap: { borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:        { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:        { padding: '13px 16px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  btn:       { padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' },
};