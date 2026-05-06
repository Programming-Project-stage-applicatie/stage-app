import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { t } from "../i18n/translations";
import "../styles/studentDashboard.css";

function getUserFromStorage() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("nl-BE");
};



export default function StudentDashboard() {
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = getUserFromStorage();


  const fetchStudentInternships = async () => {
    try {
      const res = await fetch("http://localhost:3000/internships/student", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error();
      setInternships(await res.json());
    } catch {
      setError(t("studentInternships.fetchError"));
    }
  };

  useEffect(() => {
    fetchStudentInternships();
  }, []);

  return (
    <div className="student-dashboard-container">
    <h1>      
      {user
        ? `${t("studentDashboard.welcome")}, ${user.firstname || user.username}`
        : t("studentDashboard.welcome")}
    </h1>

      <h2>{t("studentDashboard.title")}</h2>

      {error && <p className="error">{error}</p>}

      {internships.length === 0 ? (
        <p>{t("studentInternships.none")}</p>
      ) : (
        <table className="student-stages-table">
          <thead>
            <tr>
              <th>{t("studentInternships.period")}</th>
              <th className="stage-col">{t("studentInternships.stage")}</th>
              <th>{t("studentInternships.logbooks")}</th>
              <th>{t("studentInternships.evaluation")}</th>
            </tr>
          </thead>

          <tbody>
            {internships.map((internship) => (
              <tr key={internship.id}>
                <td>
                  {formatDate(internship.start_date)} –{" "}
                  {formatDate(internship.end_date)}
                </td>
                <td className="stage-col">
                  <Link to={`/student/internships/${internship.id}`}>
                    {t("studentInternships.open")}
                  </Link>
                </td>
                <td>-</td>
                <td>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}