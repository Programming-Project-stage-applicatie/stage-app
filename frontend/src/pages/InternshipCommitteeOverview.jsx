import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/internshipCommitteeOverview.css";

export default function InternshipCommitteeOverview() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const committeeId = currentUser?.id;

  // ⭐ Status mapping naar Nederlands
  const statusMapping = {
    submitted: "Ingediend – wacht op goedkeuring",
    approved: "Goedgekeurd",
    rejected: "Afgekeurd",
    adjustment_required: "Aanpassingen vereist",
  };

  // ⭐ CSS class per status
  const getStatusClass = (status) => {
    switch (status) {
      case "submitted":
        return "status-submitted";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "adjustment_required":
        return "status-adjustment";
      default:
        return "status-default";
    }
  };

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("http://localhost:3000/internship-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Kon aanvragen niet laden");

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError("Kon stageaanvragen niet laden.");
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [token]);

  if (loading) return <p style={{ padding: "32px" }}>Aanvragen laden...</p>;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("nl-BE");

  /* ============================================================
     FILTERING VOLGENS NIEUW PROCES
  ============================================================ */

  // 1. Nieuwe aanvragen (nog niet toegewezen)
  const newRequests = requests.filter(
    (req) => req.internship_committee_id === null && req.status === "submitted"
  );

  // 2. Mijn toegewezen aanvragen
  const myRequests = requests.filter(
    (req) => req.internship_committee_id === committeeId
  );

  // 3. Filter op status binnen mijn dossiers
  const filteredMyRequests = myRequests.filter((req) =>
    statusFilter === "all" ? true : req.status === statusFilter
  );

  // ⭐ Rij-rendering
  const renderRow = (req) => (
    <tr key={req.id}>
      <td>{req.student_firstname} {req.student_lastname}</td>
      <td>{req.company}</td>
      <td>Postgraduaat Coding</td>
      <td>{formatDate(req.start_date)} – {formatDate(req.end_date)}</td>

      {/* ⭐ Status met CSS class */}
      <td className={getStatusClass(req.status)}>
        {statusMapping[req.status] || req.status}
      </td>

      {/* ⭐ OPEN button afhankelijk van status */}
      <td>
        <Link
          to={`/committee/requests/${req.id}/overview`}
          className={
            req.status === "submitted"
              ? "open-button-active"
              : "open-button-neutral"
          }
        >
          OPEN
        </Link>
      </td>
    </tr>
  );

  return (
    <div className="overview-container">
      <h1 className="overview-title">Stageaanvragen — Overzicht</h1>

      <p style={{ marginBottom: "16px" }}>
        <Link to="/dashboard/internship-committee" className="back-link">
          ← Terug naar dashboard
        </Link>
      </p>

      {error && <p className="error">{error}</p>}

      {/* ============================================================
          SECTIE 1 — NIEUWE AANVRAGEN (NIET TOEGEWEZEN)
      ============================================================ */}
      <h2 className="section-title">Nieuwe aanvragen</h2>

      {newRequests.length === 0 ? (
        <p className="empty-text">Geen nieuwe aanvragen.</p>
      ) : (
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
          <tbody>{newRequests.map(renderRow)}</tbody>
        </table>
      )}

      {/* ============================================================
          SECTIE 2 — MIJN DOSSIERS
      ============================================================ */}
      <h2 className="section-title">Mijn dossiers</h2>

      {/* ⭐ Filterbalk */}
      <div className="filter-bar">
        <button
          className={statusFilter === "all" ? "filter-active" : ""}
          onClick={() => setStatusFilter("all")}
        >
          Alle
        </button>
        <button
          className={statusFilter === "submitted" ? "filter-active" : ""}
          onClick={() => setStatusFilter("submitted")}
        >
          Ingediend
        </button>
        <button
          className={statusFilter === "adjustment_required" ? "filter-active" : ""}
          onClick={() => setStatusFilter("adjustment_required")}
        >
          Aanpassingen vereist
        </button>
        <button
          className={statusFilter === "approved" ? "filter-active" : ""}
          onClick={() => setStatusFilter("approved")}
        >
          Goedgekeurd
        </button>
        <button
          className={statusFilter === "rejected" ? "filter-active" : ""}
          onClick={() => setStatusFilter("rejected")}
        >
          Afgekeurd
        </button>
      </div>

      {/* ⭐ Eén tabel voor al mijn dossiers */}
      {filteredMyRequests.length === 0 ? (
        <p className="empty-text">Geen dossiers gevonden.</p>
      ) : (
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
          <tbody>{filteredMyRequests.map(renderRow)}</tbody>
        </table>
      )}
    </div>
  );
}
