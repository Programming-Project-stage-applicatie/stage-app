import { t } from "../i18n/translations";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <h1>{t("dashboards.teacher")}</h1>
<button onClick={() => navigate("/teacher/final-evaluation-overview")}>
  Finale evaluaties
</button>
<button onClick={() => navigate("/teacher/logbooks")}>
   Logboeken
</button>
    </div>
  );
}
//van docent login naar hier M3 >> en dan knop naar overzicht finale evaluaties M18
