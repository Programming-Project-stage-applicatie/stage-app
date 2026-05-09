import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/internshipCommitteeOverview.css";

export default function InternshipCommitteeOverview() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/internship-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load requests");

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError("Kon stageaanvragen niet laden.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <p style={{ padding: "32px" }}>Aanvragen laden...</p>;
  }

  // Datum formatteren naar dd/mm/yyyy
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("nl-BE");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "submitted":
        return "Ingediend – wacht op goedkeuring";
      case "approved":
        return "Goedgekeurd";
      case "rejected":
        return "Afgekeurd";
      case "adjustment_required":
        return "Aanpassingen vereist";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    if (status === "submitted") return "status-submitted";
    return "status-default";
  };

  return (
    <div className="overview-container">
      <h1 className="overview-title">Stageaanvragen — Overzicht</h1>

      {/* Terug naar dashboard */}
      <p style={{ marginBottom: "16px" }}>
        <Link to="/dashboard/internship-committee" className="back-link">
          ← Terug naar dashboard
        </Link>
      </p>

      {error && <p className="error">{error}</p>}

      <table className="overview-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Bedrijf</th>
            <th>Opleiding</th>
            <th>Periode</th>
            <th>Status</th>
            <th>Actie</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              {/* Studentnaam uit backend JOIN */}
              <td>
                {req.student_firstname} {req.student_lastname}
              </td>

              <td>{req.company}</td>

              <td>Postgraduaat Coding</td>

              <td>
                {formatDate(req.start_date)} – {formatDate(req.end_date)}
              </td>

              <td className={getStatusClass(req.status)}>
                {getStatusLabel(req.status)}
              </td>

              <td>
                <Link
                  to={`/committee/requests/${req.id}/overview`}
                  className="open-button"
                >
                  OPEN
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
