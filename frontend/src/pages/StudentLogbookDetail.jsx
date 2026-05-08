// StudentLogbookDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { t } from '../i18n/translations';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_CONFIG = {
  submitted: { label: t('logbooks.status.submitted'), bg: '#fde68a', color: '#78350f' },
  approved:  { label: t('logbooks.status.approved'),  bg: '#86efac', color: '#14532d' },
  revision:  { label: t('logbooks.status.adjustment_required'), bg: '#fb923c', color: '#fff' },
  open:      { label: t('logbooks.status.open'),      bg: '#bfdbfe', color: '#1e3a5f' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#e5e7eb', color: '#6b7280' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 5,
      fontSize: 13, fontWeight: 600, background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

// ── Logboek detail modal ──────────────────────────────────────────────────────
function LogboekModal({ logboek, onClose, onFeedbackSaved }) {
  const token = localStorage.getItem('token');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    setSaving(true);
    fetch(`${API_BASE}/api/supervisor/logbooks/${logboek.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ feedback }),
    })
      .then(r => r.json())
      .then(() => {
        setSaved(true);
        onFeedbackSaved();
        setTimeout(onClose, 1000);
      })
      .catch(() => setSaving(false))
      .finally(() => setSaving(false));
  };

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.header}>
          <div>
            <h2 style={m.title}>{logboek.student_name}</h2>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{t('logbooks.week')} {logboek.week}</span>
          </div>
          <button onClick={onClose} style={m.backBtn}>{t('logbooks.back')}</button>
        </div>

        <div style={m.section}>
          <div style={m.sectionTitle}>{t('logbooks.tasks')}</div>
          <p style={m.text}>{logboek.tasks || <em style={{ color: '#9ca3af' }}>{t('logbooks.notFilled')}</em>}</p>
        </div>

        <div style={m.section}>
          <div style={m.sectionTitle}>{t('logbooks.reflection')}</div>
          <p style={m.text}>{logboek.reflection || <em style={{ color: '#9ca3af' }}>{t('logbooks.notFilled')}</em>}</p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

        {logboek.feedback && (
          <div style={m.feedbackBox}>
            <div style={m.sectionTitle}>{t('logbooks.mentorFeedback')}</div>
            <p style={m.text}>{logboek.feedback}</p>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

        <div style={m.section}>
          <div style={m.sectionTitle}>{t('logbooks.yourFeedback')}</div>
          <textarea
            style={m.textarea}
            placeholder={t('logbooks.feedbackPlaceholder')}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            style={{ ...m.btn, background: saved ? '#86efac' : '#22c55e', color: '#14532d' }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saved ? t('logbooks.saved') : saving ? t('logbooks.saving') : t('logbooks.submitFeedback')}
          </button>
          <button style={{ ...m.btn, background: '#fff', border: '1px solid #d1d5db', color: '#374151' }} onClick={onClose}>
            {t('logbooks.confirmCancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hoofdpagina ───────────────────────────────────────────────────────────────
export default function StudentLogbookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'docent';

  const [logbooks, setLogbooks] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLogbook, setSelectedLogbook] = useState(null);

  const loadLogbooks = () => {
    fetch(`${API_BASE}/api/supervisor/students/${id}/logbooks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        setLogbooks(json.data.logbooks || []);
        setStudentName(json.data.student_name || '');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLogbooks(); }, [id]);

  return (
    <div style={s.page}>
      <div style={s.headerRow}>
        <h1 style={s.title}>{t('logbooks.logbookOverview')} - {studentName}</h1>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← {t('logbooks.backBtn')}</button>
      </div>

      {loading && <p style={s.info}>{t('logbooks.loading')}</p>}
      {error   && <p style={{ ...s.info, color: '#dc2626' }}>{error}</p>}

      {!loading && !error && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t('logbooks.week')}</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>{t('logbooks.action')}</th>
              </tr>
            </thead>
            <tbody>
              {logbooks.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ ...s.td, textAlign: 'center', color: '#9ca3af' }}>
                    {t('logbooks.noLogbooks')}
                  </td>
                </tr>
              )}
              {logbooks.map((lb, i) => (
                <tr key={lb.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={s.td}>{t('logbooks.week')} {lb.week}</td>
                  <td style={s.td}><StatusBadge status={lb.status} /></td>
                  <td style={s.td}>
                    <button
                      style={s.btnBekijken}
                      onClick={() => setSelectedLogbook({ ...lb, student_name: studentName })}
                    >
                      {t('logbooks.view')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLogbook && (
        <LogboekModal
          logboek={selectedLogbook}
          role={role}
          onClose={() => setSelectedLogbook(null)}
          onFeedbackSaved={loadLogbooks}
        />
      )}
    </div>
  );
}

const s = {
  page:       { padding: '28px 32px', maxWidth: 800, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  headerRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:      { fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 },
  backBtn:    { padding: '6px 16px', fontSize: 13, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' },
  info:       { textAlign: 'center', color: '#9ca3af', padding: 32 },
  tableWrap:  { borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:         { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:         { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  btnBekijken:{ padding: '5px 16px', fontSize: 13, fontWeight: 500, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' },
};

const m = {
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal:        { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  title:        { fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 },
  backBtn:      { padding: '5px 14px', fontSize: 13, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' },
  section:      { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 },
  text:         { fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 },
  feedbackBox:  { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 14, marginBottom: 16 },
  textarea:     { width: '100%', minHeight: 100, padding: '10px 12px', fontSize: 14, borderRadius: 8, border: '1px solid #d1d5db', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  btn:          { padding: '8px 20px', fontSize: 14, fontWeight: 600, borderRadius: 7, border: 'none', cursor: 'pointer' },
};