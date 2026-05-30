import { useState } from "react";
import { t } from "../i18n/translations";
import LogboekDetail from "./LogboekDetail";
import LogboekForm from "./LogboekForm";

const statusConfig = {
  submitted:           { label: t("logbooks.status.submitted"),           color: "#eab308" },
  approved:            { label: t("logbooks.status.approved"),            color: "#22c55e" },
  adjustment_required: { label: t("logbooks.status.adjustment_required"), color: "#f97316" },
  open:                { label: t("logbooks.status.open"),                color: "#ADD8E6" },
};

const sortLogbooks = (logbooks) => {
  const priority = { open: 0, adjustment_required: 1 };
  return [...logbooks].sort((a, b) => {
    const pa = priority[a.status] ?? 2;
    const pb = priority[b.status] ?? 2;
    if (pa !== pb) return pa - pb;
    return b.week - a.week;
  });
};

export default function StudentLogbooks({ logbooks = [], internshipId, onRefresh }) {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);

  const handleBekijken = (logbook) => { setSelected(logbook); setView("detail"); };
  const handleInvullen = (logbook) => { setSelected(logbook); setView("form"); };
  const handleNieuw = () => { setSelected(null); setView("new"); };
  const handleTerug = () => { setView("list"); setSelected(null); onRefresh(); };

  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  };

  const currentWeek = getCurrentWeek();
  const existingWeeks = logbooks.map(l => Number(l.week));
  const hasCurrentWeek = existingWeeks.includes(currentWeek);
  const sorted = sortLogbooks(logbooks);

  if (view === "detail") return <LogboekDetail logbook={selected} onTerug={handleTerug} onAanpassen={() => setView("form")} />;
  if (view === "form" || view === "new") return (
    <LogboekForm
      logbook={selected}
      internshipId={internshipId}
      onTerug={handleTerug}
      existingWeeks={existingWeeks}
    />
  );

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
        <h1 style={{ margin: 0 }}>{t("logbooks.title")}</h1>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <button
            onClick={handleNieuw}
            disabled={hasCurrentWeek}
            title={hasCurrentWeek ? `${t("logbooks.weekExists")} ${currentWeek}` : ""}
            style={{
              backgroundColor: hasCurrentWeek ? "#d1d5db" : "#a855f7",
              color: hasCurrentWeek ? "#9ca3af" : "white",
              border: "none", padding: "12px 20px", borderRadius: "8px",
              cursor: hasCurrentWeek ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "15px"
            }}
          >
            {t("logbooks.addButton")}
          </button>
          {hasCurrentWeek && (
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              {t("logbooks.weekExists")} {currentWeek}
            </span>
          )}
        </div>
      </div>

      <h3 style={{ marginBottom: "16px", color: "#6b7280", fontWeight: "normal" }}>{t("logbooks.overview")}</h3>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
        {sorted.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>
            {t("logbooks.noLogbooks")}
          </div>
        ) : (
          sorted.map((logbook, index) => {
            const config = statusConfig[logbook.status] || { label: logbook.status, color: "#6b7280" };
            const canEdit = logbook.status === "open" || logbook.status === "adjustment_required";
            return (
              <div
                key={logbook.id}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: index < sorted.length - 1 ? "1px solid #e5e7eb" : "none",
                  flexWrap: "wrap",
                  gap: "12px",
                  background: canEdit ? "#fffbeb" : "white",
                }}
              >
                <div style={{ fontWeight: "500" }}>{t("logbooks.week")} {logbook.week}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ backgroundColor: config.color, color: "white", padding: "6px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: "bold" }}>
                    {config.label}
                  </span>
                  <button
                   onClick={() => handleBekijken(logbook)}
                    style={{ border: "1px solid black", backgroundColor: "white", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                  >
                    {canEdit ? t("logbooks.fill") : t("logbooks.view")}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}