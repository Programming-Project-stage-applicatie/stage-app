import { useEffect, useState } from "react";
import { t } from "../i18n/translations";
import { Link, useNavigate } from "react-router-dom";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");

  const fetchInternships = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/internships", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setInternships(data);
    } catch {
      setError(t("adminInternships.fetchError"));
    }
  };

  const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    setUsers(data);

  } catch {
    setError(t("adminUsers.messages.genericError"));
  }
};

  useEffect(() => {
    fetchInternships();
    fetchUsers();

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

    } catch {
      console.error("Token parsing failed");
    }
}, []);

  const internshipsWithoutBoth = internships.filter(
  (i) => i.mentor_id === null && i.teacher_id === null
  );

  const internshipsWithoutMentor = internships.filter(
    (i) => i.mentor_id === null && i.teacher_id !== null
  );

  const internshipsWithoutTeacher = internships.filter(
    (i) => i.mentor_id !== null && i.teacher_id === null
  );

return (
  <div className="admin-dashboard">

    {error && <p className="error">{error}</p>}

    <div className="dashboard-header">
      <div className="header-left">Logo school</div>
      <div className="header-center">{t("dashboards.admin")}</div>
      <div className="header-right">
        {user && (user.firstname || user.username)}
      </div>
    </div>

    <div className="dashboard-welcome">
      {user && (
        <h2>
          {t("welcome")}, {user.firstname || user.username}
        </h2>
      )}
    </div>

    <hr className="dashboard-divider" />

    

      <div className="dashboard-card">
        <h2>{t("adminUsers.title")}</h2>

        <p>
          Totaal gebruikers: {users.length}
        </p>

        <button
          className="primary"
          onClick={() => navigate("/admin/users")}
        >
          open
        </button>
      </div>

      <div className="dashboard-card">
        <h2>{t("stages")}</h2>

        <div className="dashboard-subsection">
          <h3>{t("adminInternships.withoutMentor")}</h3>

          {internshipsWithoutMentor.length === 0 ? (
            <p>{t("adminInternships.noneWithoutMentor")}</p>
          ) : (
            <ul>
              {internshipsWithoutMentor.map((i) => (
                <li key={i.id}>
                  <Link to={`/admin/internships/${i.id}`}>
                    <strong>{i.company}</strong> —{" "}
                    {i.student_firstname} {i.student_lastname}
                    {i.studyprogram && ` (${i.studyprogram})`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-subsection">
          <h3>{t("adminInternships.withoutTeacher")}</h3>

          {internshipsWithoutTeacher.length === 0 ? (
            <p>{t("adminInternships.noneWithoutTeacher")}</p>
          ) : (
            <ul>
              {internshipsWithoutTeacher.map((i) => (
                <li key={i.id}>
                  <Link to={`/admin/internships/${i.id}`}>
                    <strong>{i.company}</strong> —{" "}
                    {i.student_firstname} {i.student_lastname}
                    {i.studyprogram && ` (${i.studyprogram})`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-subsection">
          <h3>{t("adminInternships.withoutBoth")}</h3>

          {internshipsWithoutBoth.length === 0 ? (
            <p>{t("adminInternships.noneWithoutBoth")}</p>
          ) : (
            <ul>
              {internshipsWithoutBoth.map((i) => (
                <li key={i.id}>
                  <Link to={`/admin/internships/${i.id}`}>
                    <strong>{i.company}</strong> —{" "}
                    {i.student_firstname} {i.student_lastname}
                    {i.studyprogram && ` (${i.studyprogram})`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>


</div>

  );
}

