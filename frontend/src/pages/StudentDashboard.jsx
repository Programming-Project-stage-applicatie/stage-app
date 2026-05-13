import { t } from "../i18n/translations";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  return (
    <div className="dashboard-page">
      <h1>{t("dashboards.student")}</h1>
      <button 
        onClick={() => navigate("/finale-evaluatie")}
        style={{
          padding: "12px 24px",
          background: "#aa3bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Finale Evaluatie
      </button>
    </div>
  );
}