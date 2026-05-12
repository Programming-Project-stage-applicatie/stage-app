import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{t("dashboards.student")}</h1>

      <button
        onClick={() => navigate("/logbooks")}
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
          fontFamily: "var(--sans)",
        }}
      >
        {t("logbooks.title")} →
      </button>
    </div>
  );
}