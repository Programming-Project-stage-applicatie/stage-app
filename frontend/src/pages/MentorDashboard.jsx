import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export default function MentorDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "620px", margin: "2rem auto", padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>
      <h1>{t("dashboards.mentor")}</h1>

      <button
        onClick={() => navigate("/mentor/finale-evaluatie")}
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 2rem",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Finale Evaluatie
      </button>
    </div>
  );
}
