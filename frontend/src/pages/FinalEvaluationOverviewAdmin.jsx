import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

function getUserFromStorage() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try { return JSON.parse(storedUser); } catch { return null; }
}

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("nl-BE");

export default function FinalEvaluationOverviewAdmin() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = getUserFromStorage();

  useEffect(() => {
    fetch("http://localhost:3000/internships", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(async (data) => {
        const metEvaluatie = await Promise.all(
          data.map(async (internship) => {
            try {
              const res = await fetch(
                `http://localhost:3000/api/finale-evaluatie/internship/${internship.id}/docent`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (!res.ok) return { ...internship, ev_status: "—", final_score: null };
              const ev = await res.json();
              return { ...internship, ev_status: ev.status, final_score: ev.final_score };
            } catch {
              return { ...internship, ev_status: "—", final_score: null };
            }
          })
        );
        const alleenGevalueerd = metEvaluatie.filter(i => i.ev_status === "evaluated");
setInternships(alleenGevalueerd);
      })
      .catch(() => setError("Kon stages niet ophalen."));
  }, []);

  function vertaalStatus(status) {
    const vertalingen = {
      open:      "Open",
      submitted: "Ingediend",
      evaluated: "Geëvalueerd",
    };
    return vertalingen[status] || status || "—";
  }

  return (
    <div className="teacher-dashboard-container">
      <h1>{user ? `Welkom, ${user.firstname || user.username}` : t("dashboards.admin")}</h1>
      <h2>Geëvalueerde stages</h2>
      {error && <p className="error">{error}</p>}
      {internships.length === 0 ? (
        <p>Geen stages gevonden.</p>
      ) : (
        <table className="student-stages-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Bedrijf</th>
              <th>Periode</th>
              <th>Status</th>
              <th>Score</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((internship) => (
              <tr key={internship.id}>
                <td>{internship.student_firstname} {internship.student_lastname}</td>
                <td>{internship.company}</td>
                <td>{formatDate(internship.start_date)} – {formatDate(internship.end_date)}</td>
                <td>{vertaalStatus(internship.ev_status)}</td>
                <td>{internship.final_score != null ? `${internship.final_score}/20` : "—"}</td>
                <td>
                  <button onClick={() => navigate(`/admin/internships/${internship.id}/evaluation`)}>
                    Finale evaluatie
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
)}
      <p
        onClick={() => navigate("/dashboard/admin")}
        style={{ color: "#6fa8dc", cursor: "pointer", marginTop: "24px" }}
      >
        ← Terug naar dashboard
      </p>
    </div>
  );
}