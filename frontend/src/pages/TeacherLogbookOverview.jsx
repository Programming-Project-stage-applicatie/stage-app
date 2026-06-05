import { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000";

const STATUS_STYLES = {
  submitted: { background: "#EF9F27", color: "#412402", label: "ingediend" },
  approved:  { background: "#639922", color: "#EAF3DE", label: "goedgekeurd" },
  rejected:  { background: "#D85A30", color: "#FAECE7", label: "aanpassingen vereist" },
  open:      { background: "#D3D1C7", color: "#444441", label: "nog geen logboeken" },
};

const STAT_CARDS = [
  { key: "submitted", label: "INGEDIEND",            bg: "#EF9F27", numColor: "#412402", labelColor: "#633806" },
  { key: "approved",  label: "GOEDGEKEURD",          bg: "#639922", numColor: "#EAF3DE", labelColor: "#C0DD97" },
  { key: "rejected",  label: "AANPASSINGEN VEREIST", bg: "#D85A30", numColor: "#FAECE7", labelColor: "#F5C4B3" },
];

const FILTER_OPTIONS = [
  { value: "all",       label: "filter" },
  { value: "rejected",  label: "aanpassingen vereist" },
  { value: "approved",  label: "goedgekeurd" },
  { value: "submitted", label: "ingediend" },
  { value: "open",      label: "nog geen logboeken" },
];

export default function LogboekOpvolging({ onBekijkOverzicht }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/logbooks/supervisor/teacher/logbooks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setStudents(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const counts = STAT_CARDS.reduce((acc, card) => {
    acc[card.key] = students.filter((s) => s.status === card.key).length;
    return acc;
  }, {});

  const filtered =
    filter === "all" ? students : students.filter((s) => s.status === filter);

  if (loading) return <div style={{ padding: "2rem", color: "#888" }}>Logboeken laden...</div>;
  if (error)   return <div style={{ padding: "2rem", color: "#D85A30" }}>Fout: {error}</div>;

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 760, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Logboek opvolging</h1>
      <p style={{ fontSize: 13, color: "#888", margin: "0 0 1.5rem" }}>Overzicht van alle studenten</p>

      {/* Stat cards + filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            onClick={() => setFilter(filter === card.key ? "all" : card.key)}
            style={{
              background: card.bg,
              borderRadius: 8,
              padding: "14px 20px",
              minWidth: 90,
              textAlign: "center",
              cursor: "pointer",
              outline: filter === card.key ? "3px solid rgba(0,0,0,0.2)" : "none",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 500, color: card.numColor }}>{counts[card.key] ?? 0}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: card.labelColor, letterSpacing: "0.04em", marginTop: 2 }}>
              {card.label}
            </div>
          </div>
        ))}

        <div style={{ marginLeft: "auto" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid #ccc", cursor: "pointer" }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ borderTop: "0.5px solid #e0e0e0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 2fr 1.5fr", padding: "10px 0 8px", borderBottom: "0.5px solid #e0e0e0" }}>
          {["Student", "Bedrijf", "Laatste week", "", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 13, fontWeight: 500 }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "1.5rem 0", fontSize: 14, color: "#888" }}>Geen studenten gevonden.</div>
        )}

        {filtered.map((student) => {
          const st = STATUS_STYLES[student.status] || STATUS_STYLES["open"];
          return (
            <div
              key={student.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1.2fr 2fr 1.5fr",
                padding: "12px 0",
                borderBottom: "0.5px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14 }}>{student.name}</span>
              <span style={{ fontSize: 14, color: "#666" }}>{student.company}</span>
              <span style={{ fontSize: 14, color: "#666" }}>{student.last_week ? `Week ${student.last_week}` : "-"}</span>
              <span>
                <span style={{
                  display: "inline-block",
                  background: st.background,
                  color: st.color,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 6,
                }}>
                  {st.label}
                </span>
              </span>
              <span>
                <button
                  onClick={() => onBekijkOverzicht?.(student.id)}
                  style={{
                    fontSize: 12,
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "0.5px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Bekijk overzicht
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}