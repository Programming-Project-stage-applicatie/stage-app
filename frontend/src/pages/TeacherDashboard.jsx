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
          display: "flex",
          flexDirection:'row',
          marginTop: "20px",
          padding: "12px 18px",
          background: "#aa3bff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
           boxShadow: "rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px",
          transition: "opacity 0.15s",
        }}
      >
        Bekijk logboeken
      </button>
    </div>
  );
}