import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/internshipCommitteeRequestDetail.css";

export default function InternshipCommitteeRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [decision, setDecision] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  // ============================
  // FETCH REQUEST DETAILS
  // ============================
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/internship-requests/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to load request");

        const data = await res.json();
        setRequest(data);

        // Prefill read-only values
        setDecision(data.status || "");
        setFeedback(data.feedbackSC || "");
      } catch (err) {
        setError("Kon aanvraag niet laden.");
      }
    };

    fetchRequest();
  }, [id]);

  // ============================
  // HANDLE SUBMIT
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (decision === "rejected" || decision === "adjustment_required") &&
      feedback.trim() === ""
    ) {
      setError("Feedback is verplicht bij afkeuring of aanpassingen vereist.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/internship-requests/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: decision,
            feedbackSC: feedback,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      navigate("/committee/overview");
    } catch (err) {
      setError("Kon beslissing niet opslaan.");
    }
  };

  if (!request) return <div className="loading">Aanvraag laden...</div>;

  // ============================
  // HELPERS
  // ============================
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("nl-BE");
  };

  const translateStatus = (status) => {
    switch (status) {
      case "approved":
        return "Goedgekeurd";
      case "rejected":
        return "Afgekeurd";
      case "adjustment_required":
        return "Aanpassingen vereist";
      case "submitted":
        return "Ingediend – wacht op goedkeuring";
      default:
        return status;
    }
  };

  const isEditable = request.status === "submitted";

  return (
    <div className="m11-container">
      <h1 className="m11-title">
        Stageaanvraag – {request.student_firstname} {request.student_lastname}
      </h1>

      {error && <p className="error">{error}</p>}

      {/* ============================
          DETAILS
      ============================ */}
      <div className="m11-section">
        <label>Bedrijf:</label>
        <span>{request.company}</span>
      </div>

      <div className="m11-section">
        <label>Mentor:</label>
        <span>
          {request.mentor_firstName || ""} {request.mentor_lastName || ""}
        </span>
      </div>

      <div className="m11-section">
        <label>Opleiding:</label>
        <span>Postgraduaat Coding</span>
      </div>

      <div className="m11-section">
        <label>Periode:</label>
        <span>
          {formatDate(request.start_date)} – {formatDate(request.end_date)}
        </span>
      </div>

      <div className="m11-section">
        <label>Stageopdracht:</label>
        <div className="m11-textbox">{request.description}</div>
      </div>

      {/* ============================
          READ-ONLY BESLISSING
      ============================ */}
      {!isEditable && (
        <>
          <h2>Beslissing</h2>
          <div className="readonly-box">
            <strong>{translateStatus(request.status)}</strong>
          </div>

          <h2>Feedback</h2>
          <div className="readonly-box">
            {request.feedbackSC || "Geen feedback beschikbaar."}
          </div>

          <button
            className="m11-cancel"
            onClick={() => navigate("/committee/overview")}
          >
            TERUG
          </button>
        </>
      )}

      {/* ============================
          EDITABLE FORM (submitted)
      ============================ */}
      {isEditable && (
        <form onSubmit={handleSubmit} className="m11-form">
          <h2>Beslissing</h2>

          <div className="m11-radio-group">
            <label>
              <input
                type="radio"
                name="decision"
                value="approved"
                onChange={(e) => setDecision(e.target.value)}
              />
              goedgekeurd
            </label>

            <label>
              <input
                type="radio"
                name="decision"
                value="rejected"
                onChange={(e) => setDecision(e.target.value)}
              />
              afgekeurd
            </label>

            <label>
              <input
                type="radio"
                name="decision"
                value="adjustment_required"
                onChange={(e) => setDecision(e.target.value)}
              />
              aanpassingen vereist
            </label>
          </div>

          <h2>Feedback</h2>
          <textarea
            className="m11-feedback"
            rows="6"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Gelieve feedback in te vullen bij afkeuring of wanneer aanpassingen vereist zijn."
          />

          <div className="m11-buttons">
            <button type="submit" className="m11-submit">
              INDIENEN
            </button>
            <button
              type="button"
              className="m11-cancel"
              onClick={() => navigate("/committee/overview")}
            >
              ANNULEREN
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
