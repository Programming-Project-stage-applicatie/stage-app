import { t } from "../i18n/translations";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Docent dashboard</h1>

      {/* TEST KNOP */}
      <button
        onClick={() => navigate("/logbooks/internship/4")}
        style={{
          marginTop: "20px",
          padding: "12px 18px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Bekijk logboeken (test)
      </button>
    </div>
  );
}