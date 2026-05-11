import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/studentRequestDetail.css";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("nl-BE");

// ⭐ Mapping backend → Nederlands
const statusMapping = {
  submitted: "Ingediend – wacht op goedkeuring",
  approved: "Goedgekeurd",
  rejected: "Afgekeurd",
  adjustment_required: "Aanpassingen vereist",
};

export default function StudentRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    mentor_firstName: "",
    mentor_lastName: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const token = localStorage.getItem("token");

  /* ============================================================
     FETCH REQUEST
  ============================================================ */
  useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(
          `http://localhost:3000/internship-requests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Kon stageaanvraag niet ophalen");
        }

        const data = await res.json();
        setRequest(data);

        // ⭐ Editmodus enkel bij adjustment_required
        if (data.status === "adjustment_required") {
          setIsEditing(true);
          setFormData({
            company: data.company || "",
            mentor_firstName: data.mentor_firstName || "",
            mentor_lastName: data.mentor_lastName || "",
            description: data.description || "",
            start_date: data.start_date || "",
            end_date: data.end_date || "",
          });
        } else {
          setIsEditing(false);
        }
      } catch (err) {
        console.error(err);
        setError("Kon stageaanvraag niet ophalen");
      }
    }

    fetchRequest();
  }, [id, token]);

  /* ============================================================
     HANDLE FORM INPUT
  ============================================================ */
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  /* ============================================================
     HANDLE SUBMIT (PATCH)
  ============================================================ */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validatie
    if (!formData.company || !formData.description || !formData.start_date || !formData.end_date) {
      setError("Gelieve alle verplichte velden in te vullen.");
      return;
    }

    if (formData.start_date >= formData.end_date) {
      setError("Startdatum moet vóór einddatum liggen.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/internship-requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kon aanvraag niet bijwerken");
      }

      setSuccess("Aanvraag succesvol opnieuw ingediend!");

      // ⭐ FRONTEND FIX:
      // - editmodus sluiten
      // - status lokaal updaten
      // - read-only tonen
      setIsEditing(false);
      setRequest((prev) => ({
        ...prev,
        ...formData,
        status: "submitted",
      }));

      // ⭐ Snelle redirect naar read-only pagina
      setTimeout(() => {
        navigate(`/student/request/${id}`);
      }, 800);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // ❗ FIX: geen early return meer bij error
  if (!request) return <p>Bezig met laden...</p>;

  /* ============================================================
     READ-ONLY MODE
  ============================================================ */
  if (!isEditing) {
    return (
      <div className="student-request-container">
        <h2 className="student-request-title">Stageaanvraag</h2>

        <div className="student-request-section">
          <div className="student-request-row">
            <span className="student-request-label">Status:</span>
            <span className="student-request-value">
              {statusMapping[request.status] || "Onbekende status"}
            </span>
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

        <div className="student-request-section">
          <span className="student-request-label">Opdracht:</span>
          <div className="student-request-description">
            {request.description}
          </div>
        </div>

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

        <Link className="student-request-back" to="/dashboard/student">
          ← Terug naar dashboard
        </Link>
      </div>
    );
  }

  /* ============================================================
     EDIT MODE (adjustment_required)
  ============================================================ */
  return (
    <div className="student-request-container">
      <h2 className="student-request-title">Aanpassingen vereist</h2>

      {request.feedbackSC && (
        <div className="student-request-warning">
          <strong>Feedback van de stagecommissie:</strong>
          <p>{request.feedbackSC}</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form className="student-request-form" onSubmit={handleSubmit}>
        <label>
          Bedrijf *
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </label>

        <label>
          Mentor voornaam
          <input
            type="text"
            name="mentor_firstName"
            value={formData.mentor_firstName}
            onChange={handleChange}
          />
        </label>

        <label>
          Mentor achternaam
          <input
            type="text"
            name="mentor_lastName"
            value={formData.mentor_lastName}
            onChange={handleChange}
          />
        </label>

        <label>
          Opdracht *
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Startdatum *
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </label>

        <label>
          Einddatum *
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </label>

        <button className="student-request-submit" type="submit">
          Opnieuw indienen
        </button>
      </form>

      <Link className="student-request-back" to="/dashboard/student">
        Annuleren
      </Link>
    </div>
  );
}
