import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

function getUserFromStorage() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try { return JSON.parse(storedUser); } catch { return null; }
}

export default function MentorDashboard() {
  const navigate = useNavigate();
  const user = getUserFromStorage();

  return (
    <div className="dashboard-page">
      <h1>{user ? `Welkom, ${user.firstname || user.username}` : t("dashboards.mentor")}</h1>
      <button
        onClick={() => navigate("/mentor/studenten")}
        style={{
          marginTop: "1.5rem", padding: "0.75rem 2rem",
          background: "#16a34a", color: "#fff", border: "none",
          borderRadius: "6px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer",
        }}
      >
        Overzicht studenten
      </button>
    </div>
  );
}
