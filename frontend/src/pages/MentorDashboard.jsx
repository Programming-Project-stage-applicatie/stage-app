import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export default function MentorDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>{t("dashboards.mentor")}</h1>
      <button
        onClick={() => navigate("/mentor/logbooks")}
        style={{ backgroundColor: "#a855f7", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
      >
        Logboek overzicht
      </button>
    </div>
  );
}