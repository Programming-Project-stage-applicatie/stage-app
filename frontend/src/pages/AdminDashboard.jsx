import { Link } from "react-router-dom";
import { t } from "../i18n/translations";

export default function AdminDashboard() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>{t("dashboards.admin")}</h1>

      <p>
        <Link to="/admin/users">
          → {t("adminUsers.title")}
        </Link>
      </p>
    </div>
  );
}