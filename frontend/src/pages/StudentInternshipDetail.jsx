import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { t } from "../i18n/translations";
import "../styles/studentInternshipDetail.css";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("nl-BE");

export default function StudentInternshipDetail() {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchInternship = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/internships/student/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error();
      setInternship(await res.json());
    } catch {
      setError(t("studentInternships.fetchError"));
    }
  };

  useEffect(() => {
    fetchInternship();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!internship) return <p>{t("adminInternships.loading")}</p>;

  return (
    <div className="student-detail-container">
      <h1 className="student-detail-title">
        {t("adminInternships.detailTitle")}
      </h1>

      <div className="student-detail-section">
        <div className="student-detail-row">
          <div className="student-detail-label">
            {t("adminInternships.company")}
          </div>
          <div className="student-detail-value">
            {internship.company}
          </div>
        </div>

        <div className="student-detail-row">
          <div className="student-detail-label">
            {t("adminInternships.period")}
          </div>
          <div className="student-detail-value">
            {formatDate(internship.start_date)} –{" "}
            {formatDate(internship.end_date)}
          </div>
        </div>

        <div className="student-detail-row">
          <div className="student-detail-label">
            {t("adminInternships.status")}
          </div>
          <div className="student-detail-value">
            {internship.status}
          </div>
        </div>
      </div>

      <div className="student-detail-section">
        <div className="student-detail-label">
          {t("adminInternships.description")}
        </div>
        <div className="student-detail-description">
          {internship.description}
        </div>
      </div>

      <div className="student-detail-section">
        <div className="student-detail-row">
          <div className="student-detail-label">
            {t("adminInternships.mentor")}
          </div>
          <div className="student-detail-value">
            {internship.mentor_firstname
              ? `${internship.mentor_firstname} ${internship.mentor_lastname}`
              : t("adminInternships.notAssigned")}
          </div>
        </div>

        <div className="student-detail-row">
          <div className="student-detail-label">
            {t("adminInternships.teacher")}
          </div>
          <div className="student-detail-value">
            {internship.teacher_firstname
              ? `${internship.teacher_firstname} ${internship.teacher_lastname}`
              : t("adminInternships.notAssigned")}
          </div>
        </div>
      </div>

      <Link
        to="/dashboard/student"
        className="student-detail-back"
      >
        ← {t("adminInternships.backToDashboard")}
      </Link>
    </div>
  );
}