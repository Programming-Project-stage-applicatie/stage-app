import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/studentRequestDetail.css";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("nl-BE");

export default function StudentRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(
          `http://localhost:3000/internship-requests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          throw new Error("Kon stageaanvraag niet ophalen");
        }

        const data = await res.json();
        setRequest(data);
      } catch (err) {
        console.error(err);
        setError("Kon stageaanvraag niet ophalen");
      }
    }

    fetchRequest();
  }, [id, token]);

  if (error) return <p className="error-message">{error}</p>;
  if (!request) return <p>Bezig met laden...</p>;

  return (
    <div className="student-request-container">
      <h2 className="student-request-title">
        Stageaanvraag
      </h2>

      {/* ===== Status, bedrijf, periode ===== */}
      <div className="student-request-section">
        <div className="student-request-row">
          <span className="student-request-label">Status:</span>
          <span className="student-request-value">{request.status}</span>
        </div>

        <div className="student-request-row">
          <span className="student-request-label">Bedrijf:</span>
          <span className="student-request-value">{request.company}</span>
        </div>

        <div className="student-request-row">
          <span className="student-request-label">Periode:</span>
          <span className="student-request-value">
            {formatDate(request.start_date)} – {formatDate(request.end_date)}
          </span>
        </div>
      </div>

      {/* ===== Opdracht ===== */}
      <div className="student-request-section">
        <span className="student-request-label">Opdracht:</span>
        <div className="student-request-description">
          {request.description}
        </div>
      </div>

      {/* ===== Feedback stagecommissie ===== */}
      {request.feedbackSC && (
        <div className="student-request-section">
          <span className="student-request-label">
            Feedback stagecommissie:
          </span>
          <div className="student-request-description">
            {request.feedbackSC}
          </div>
        </div>
      )}

      {/* ===== Terug naar dashboard ===== */}
      <Link className="student-request-back" to="/dashboard/student">
        ← Terug naar dashboard
      </Link>
    </div>
  );
}
