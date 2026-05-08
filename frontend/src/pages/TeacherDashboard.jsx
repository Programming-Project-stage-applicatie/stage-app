import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>{t("dashboards.teacher")}</h1>
      <button
        onClick={() => navigate("/teacher/logbooks")}
        style={{ backgroundColor: "#a855f7", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
      >
        Logboek overzicht
      </button>
    </div>
  );
}