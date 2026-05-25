import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { t } from "../i18n/translations";

function getUserFromStorage() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("nl-BE");

export default function TeacherDashboard() {
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = getUserFromStorage();

  const fetchInternships = async () => {
    try {
      const res = await fetch("http://localhost:3000/internships/teacher", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setInternships(await res.json());
    } catch {
      setError("Kon stages niet ophalen.");
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  return (
    <div className="teacher-dashboard-container">
      <h1>
        {user
          ? `Welkom, ${user.firstname || user.username}`
          : t("dashboards.teacher")}
      </h1>

      <h2>Mijn stages</h2>

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
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((internship) => (
              <tr key={internship.id}>
                <td>{internship.student_firstname} {internship.student_lastname}</td>
                <td>{internship.company}</td>
                <td>
                  {formatDate(internship.start_date)} –{" "}
                  {formatDate(internship.end_date)}
                </td>
                <td>
                  <Link to={`/teacher/internships/${internship.id}/evaluation`}>
                    Finale evaluatie
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
