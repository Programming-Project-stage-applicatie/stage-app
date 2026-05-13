import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";
export default function MentorDashboard() {
  return (
    <div className="dashboard-page">
      <h1>{t("dashboards.mentor")}</h1>
    </div>
  );
}
