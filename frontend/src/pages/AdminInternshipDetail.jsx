import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { t } from "../i18n/translations";
import "../styles/adminInternshipDetail.css";

export default function AdminInternshipDetail() {
  const { id } = useParams();

  const [internship, setInternship] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const sortByName = (a, b) => {
    const ln = a.lastname.localeCompare(b.lastname);
    return ln !== 0 ? ln : a.firstname.localeCompare(b.firstname);
  };

  const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("nl-BE");
  };

  const fetchInternship = async () => {
    try {
      const res = await fetch(`http://localhost:3000/internships/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      setInternship(await res.json());
    } catch {
      setError(t("adminInternships.detailFetchError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    const res = await fetch("http://localhost:3000/users?role=mentor", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMentors(await res.json());
  };

  const fetchTeachers = async () => {
    const res = await fetch("http://localhost:3000/users?role=teacher", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTeachers(await res.json());
  };

  useEffect(() => {
    fetchInternship();
    fetchMentors();
    fetchTeachers();
  }, [id]);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    try {
      if (selectedMentor) {
        const res = await fetch(
          `http://localhost:3000/internships/${id}/mentor`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ mentor_id: selectedMentor })
          }
        );
        if (!res.ok) throw new Error();
      }

      if (selectedTeacher) {
        const res = await fetch(
          `http://localhost:3000/internships/${id}/teacher`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ teacher_id: selectedTeacher })
          }
        );
        if (!res.ok) throw new Error();
      }

      setSelectedMentor("");
      setSelectedTeacher("");
      setSuccess(t("adminInternships.saved"));
      fetchInternship();

    } catch {
      setError(t("adminInternships.saveError"));
    }
  };

  if (loading) return <p>{t("adminInternships.loading")}</p>;
  
  if (!internship) return null;

  return (
    <div className="admin-detail-container">

      <Link to="/dashboard/admin" className="admin-detail-back">
        ← {t("adminInternships.backToDashboard")}
      </Link>

      <div className="admin-detail-card">

        <h1 className="admin-detail-title">
          {t("adminInternships.detailTitle")}
        </h1>

        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}

        <div className="admin-detail-section">
          <div className="admin-detail-row">
            <div className="admin-detail-label">
              {t("adminInternships.company")}
            </div>
            <div className="admin-detail-value">
              {internship.company}
            </div>
          </div>

          <div className="admin-detail-row">
            <div className="admin-detail-label">
              {t("adminInternships.student")}
            </div>
            <div className="admin-detail-value">
              {internship.student_lastname} {internship.student_firstname}
              {internship.studyprogram && ` (${internship.studyprogram})`}
            </div>
          </div>

          <div className="admin-detail-row">
            <div className="admin-detail-label">
              {t("adminInternships.period")}
            </div>
            <div className="admin-detail-value">
              {formatDate(internship.start_date)} → {formatDate(internship.end_date)}
            </div>
          </div>

          <div className="admin-detail-row">
            <div className="admin-detail-label">
              {t("adminInternships.status")}
            </div>
            <div className="admin-detail-value">
              {t(`status_${internship.status}`) || internship.status}
            </div>
          </div>
        </div>

        <div className="admin-detail-section">
          <div className="admin-detail-label">
            {t("adminInternships.description")}
          </div>
          <div className="admin-detail-description">
            {internship.description}
          </div>
        </div>

        <div className="admin-detail-section">
          <div className="admin-detail-row">
            <div className="admin-detail-label">
              {t("adminInternships.mentor")}
            </div>
            <div className="admin-detail-value">
              {internship.mentor_firstname ? (
                `${internship.mentor_lastname} ${internship.mentor_firstname}`
              ) : (
                <select
                  className="admin-detail-select"
                  value={selectedMentor || internship.mentor_id || ""}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                >
                  <option value="">
                    {t("adminInternships.selectMentor")}
                  </option>
                  {mentors
                    .slice()
                    .sort(sortByName)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.lastname} {m.firstname}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          <div className="admin-detail-row">
            <div className="admin-detail-label">
              {t("adminInternships.teacher")}
            </div>
            <div className="admin-detail-value">
              {internship.teacher_firstname ? (
                `${internship.teacher_lastname} ${internship.teacher_firstname}`
              ) : (
                <select
                  className="admin-detail-select"
                  value={selectedTeacher || internship.teacher_id || ""}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">
                    {t("adminInternships.selectTeacher")}
                  </option>
                  {teachers
                    .slice()
                    .sort(sortByName)
                    .map((tch) => (
                      <option key={tch.id} value={tch.id}>
                        {tch.lastname} {tch.firstname}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="admin-detail-actions">
          <button
            type="button"
            className="primary"
            onClick={handleSave}
            disabled={!selectedMentor && !selectedTeacher}
          >
            {t("adminInternships.save")}
          </button>
        </div>



      </div>
    </div>
  );
}
