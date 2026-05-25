import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function getUserFromStorage() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try { return JSON.parse(storedUser); } catch { return null; }
}

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("nl-BE");

export default function MentorStudentenOverzicht() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3000/internships/mentor", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setInternships)
      .catch(() => setError("Kon stages niet ophalen."));
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Mijn studenten</h1>
      {error && <p className="error">{error}</p>}
      {internships.length === 0 ? (
        <p>Geen stages gevonden.</p>
      ) : (
        <table className="student-stages-table">
          <thead>
            <tr>
              <th>Student</th><th>Bedrijf</th><th>Periode</th><th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((internship) => (
              <tr key={internship.id}>
                <td>{internship.student_firstname} {internship.student_lastname}</td>
                <td>{internship.company}</td>
                <td>{formatDate(internship.start_date)} – {formatDate(internship.end_date)}</td>
                <td>
                  <button onClick={() => navigate(`/mentor/finale-evaluatie/${internship.student_id}`)}>
                    Finale Evaluatie
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}