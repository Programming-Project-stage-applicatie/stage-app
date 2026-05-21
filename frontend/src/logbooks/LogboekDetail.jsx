import { t } from "../i18n/translations";

export default function LogboekDetail({ logbook, onTerug, onAanpassen }) {
  const statusConfig = {
    submitted:           { label: t("logbooks.status.submitted"), color: "#eab308" },
    approved:            { label: t("logbooks.status.approved"),  color: "#22c55e" },
    adjustment_required: { label: t("logbooks.status.adjustment_required"), color: "#f97316" },
    open:                { label: t("logbooks.status.open"),      color: "#3b82f6" },
  };
  const config = statusConfig[logbook.status] || { label: logbook.status, color: "#6b7280" };
  const canEdit = logbook.status === "open" || logbook.status === "adjustment_required";

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "32px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "8px" }}>{t("logbooks.week")} {logbook.week}</h2>
        <p style={{ color: "#6b7280", marginBottom: "8px" }}>Status: <strong>{config.label}</strong></p>
        <hr style={{ margin: "20px 0" }} />
        <h3>{t("logbooks.tasks")}</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{logbook.tasks || "—"}</p>
        <h3>{t("logbooks.reflection")}</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{logbook.reflection || "—"}</p>
        <h3>{t("logbooks.mentorFeedback")}</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{logbook.feedback || "—"}</p>
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          {canEdit && (
            <button
              onClick={onAanpassen}
              style={{ backgroundColor: "#f97316", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
              {t("logbooks.edit")}
            </button>
          )}
          <button
            onClick={onTerug}
            style={{ backgroundColor: "white", color: "black", border: "1px solid #ccc", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}
          >
            {t("logbooks.back")}
          </button>
        </div>
      </div>
    </div>
  );
}