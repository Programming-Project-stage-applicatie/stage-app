import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { t } from "../i18n/translations";
import { useNavigate } from "react-router-dom";
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

const statusMapping = {
  submitted: "Ingediend – wacht op goedkeuring",
  approved: "Goedgekeurd",
  rejected: "Afgekeurd",
  adjustment_required: "Aanpassingen vereist",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = getUserFromStorage();

  const fetchStudentInternships = async () => {
    try {
      const res = await fetch("http://localhost:3000/internships/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setInternships(await res.json());
    } catch {
      setError(t("studentInternships.fetchError"));
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:3000/internship-requests/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setRequests(await res.json());
    } catch {
      setError("Kon stageaanvragen niet ophalen.");
    }
  };

  useEffect(() => {
    fetchStudentInternships();
    fetchRequests();
  }, []);

  return (
    <div className="student-dashboard-container">

      <h1>
        {user
          ? `${t("studentDashboard.welcome")}, ${user.firstname || user.username}`
          : t("studentDashboard.welcome")}
      </h1>

     <Link className="dashboard-button" to="/student/new-request">
        Nieuwe stageaanvraag
      </Link>

      <button className="dashboard-button" onClick={() => navigate("/finale-evaluatie")}>
        Finale Evaluatie
      </button>

      <h2>Mijn stageaanvragen</h2>
      {requests.length === 0 ? (
        <p>Je hebt nog geen stageaanvragen ingediend.</p>
      ) : (
        <table className="student-stages-table">
          <thead>
            <tr>
              <th>Bedrijf</th>
              <th>Periode</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.company}</td>
                <td>{formatDate(req.start_date)} – {formatDate(req.end_date)}</td>
                <td>{statusMapping[req.status] || "Onbekende status"}</td>
                <td><Link to={`/student/request/${req.id}`}>Bekijk aanvraag</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
                <td>{formatDate(internship.start_date)} – {formatDate(internship.end_date)}</td>
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