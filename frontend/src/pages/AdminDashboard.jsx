import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { t } from "../i18n/translations";

export default function AdminDashboard() {
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

  useEffect(() => {
    fetchInternships();
  }, []);

  const internshipsWithoutMentor = internships.filter(
    (i) => i.mentor_id === null
  );

  const internshipsWithoutTeacher = internships.filter(
    (i) => i.teacher_id === null
  );

  const internshipsWithoutBoth = internships.filter(
    (i) => i.mentor_id === null && i.teacher_id === null
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{t("dashboards.admin")}</h1>

      <p>
        <Link to="/admin/users">
          → {t("adminUsers.title")}
        </Link>
      </p>

      {error && <p className="error">{error}</p>}

      <h2>{t("adminInternships.withoutMentor")}</h2>
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

      <h2>{t("adminInternships.withoutTeacher")}</h2>
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

      <h2>{t("adminInternships.withoutBoth")}</h2>
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
  );
}