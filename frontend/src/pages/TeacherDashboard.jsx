import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";
import "../styles/teacherDashboard.css";

function getUserFromStorage() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = getUserFromStorage();

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:3000/internships/teacher", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      console.log("Internships data:", data);
      setStudents(data);
    } catch {
      setError("Kon studenten niet ophalen.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div>
      {/* Navbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "2px solid #ccc",
        marginBottom: "16px"
      }}>
        <span>Logo school</span>
        <strong>Dashboard</strong>
        <span>Docent</span>
      </div>

      <div className="student-dashboard-container">
        <h1>
          {user
            ? `Welkom, ${user.firstname || user.username}`
            : "Dashboard - Docent"}
        </h1>

        <hr className="dashboard-divider" />

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Logboeken</h3>
            {/* TODO: logboeken pagina nog niet beschikbaar */}
            <button
              className="dashboard-button-outline"
              disabled
              style={{ cursor: "default", opacity: 0.5 }}
              title="Nog niet beschikbaar"
            >
              open
            </button>
            <small style={{ color: "#aaa", marginTop: "6px" }}>binnenkort beschikbaar</small>
          </div>

          <div className="dashboard-card">
            <h3>Finale evaluaties</h3>
            <button
              className="dashboard-button-outline"
              onClick={() => navigate("/teacher/final-evaluation-overview")}
            >
              open
            </button>
          </div>
        </div>

        <hr className="dashboard-divider" />

        <h2>Studenten overzicht</h2>
        {error && <p className="error">{error}</p>}
        {students.length === 0 ? (
          <p>Geen studenten gevonden.</p>
        ) : (
          <table className="student-stages-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Logboeken</th>
                <th>Finale Evaluatie</th>
              </tr>
            </thead>
            <tbody>
              {students.map((internship) => (
                <tr key={internship.id}>
                  <td>{internship.student_firstname} {internship.student_lastname}</td>
                  <td>
                    {/* TODO: klikbaar maken naar logboeken van student */}
                    <span style={{ fontWeight: "bold" }}>
                      {internship.logbook_count ?? "-"}
                    </span>
                  </td>
                  <td>
                    {/* TODO: klikbaar maken naar finale evaluatie van student */}
                    <span>{internship.finale_evaluatie_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}