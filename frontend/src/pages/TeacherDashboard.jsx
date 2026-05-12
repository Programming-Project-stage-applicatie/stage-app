import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Docent dashboard</h1>
      <button
        onClick={() => navigate("/teacher/logbooks")}
        style={{
          marginTop: "20px",
          padding: "12px 18px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        Logboek overzicht
      </button>
    </div>
  );
}