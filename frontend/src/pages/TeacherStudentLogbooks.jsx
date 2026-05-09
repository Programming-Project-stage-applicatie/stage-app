import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { t } from "../i18n/translations";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TeacherStudentLogbooks() {
  const { internshipId } = useParams();

  const [logbooks, setLogbooks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogbooks = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/api/logbooks/internship/${internshipId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setLogbooks(data);

      } catch (e) {
        console.error("FETCH ERROR:", e);
        console.error(e);
        setError(t("logbook.errors.load"));
      }
    };

    fetchLogbooks();
  }, [internshipId]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{t("logbook.title")}</h1>

      {error && <p className="error">{error}</p>}

      {logbooks.length === 0 ? (
        <p>{t("logbook.none")}</p>
      ) : (
        <ul>
          {logbooks.map((log) => (
            <li key={log.id}>
              <Link to={`/logbook/detail/${log.id}`}>
                {t("logbook.week")} {log.week} —{" "}
                {t(`logbook.statuses.${log.status}`)}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/dashboard/teacher">
        ← {t("logbook.back")}
      </Link>
    </div>
  );
}