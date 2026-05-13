<<<<<<< HEAD
import { t } from "../i18n/translations";
export default function InternshipCommitteeDashboard() {
  return (
    <div className="dashboard-page">
      <h1>{t("dashboards.internship_committee")}</h1>
    </div>
  );
}
=======
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/internshipCommitteeDashboard.css";

export default function InternshipCommitteeDashboard() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        // User ophalen
        const userRes = await fetch("http://localhost:3000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error("Kon gebruiker niet laden");
        const userData = await userRes.json();
        setUser(userData);

        // Requests ophalen
        const reqRes = await fetch("http://localhost:3000/internship-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!reqRes.ok) throw new Error("Kon stageaanvragen niet laden");
        const reqData = await reqRes.json();
        setRequests(reqData);

      } catch (err) {
        console.error(err);
        setError("Er ging iets mis bij het laden van de gegevens.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ============================
     LOADING STATE
  ============================ */
  if (loading) {
    return (
      <div className="committee-page">
        <div className="committee-header">
          <div className="header-left">Logo school</div>
          <div className="header-center">Stagecommissie</div>
          <div className="header-right">Profiel</div>
        </div>

        <div className="committee-container">
          <h1 className="committee-title">Welkom...</h1>
          <p>Aanvragen laden...</p>
        </div>
      </div>
    );
  }

  /* ============================
     ERROR STATE
  ============================ */
  if (error) {
    return (
      <div className="committee-page">
        <div className="committee-header">
          <div className="header-left">Logo school</div>
          <div className="header-center">Stagecommissie</div>
          <div className="header-right">Profiel</div>
        </div>

        <div className="committee-container">
          <h1 className="committee-title">Dashboard stagecommissie</h1>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  /* ============================
     DATA
  ============================ */
  const firstName = user.firstname;

  const countSubmitted = requests.filter((r) => r.status === "submitted").length;
  const countApproved = requests.filter((r) => r.status === "approved").length;
  const countRejected = requests.filter((r) => r.status === "rejected").length;
  const countAdjust = requests.filter((r) => r.status === "adjustment_required").length;

  /* ============================
     MAIN RENDER
  ============================ */
  return (
    <div className="committee-page">

      {/* ⭐ Tiffany-style top menu */}
      <div className="committee-header">
        <div className="header-left">Logo school</div>
        <div className="header-center">Stagecommissie</div>
        <div className="header-right">Profiel</div>
      </div>

      <div className="committee-container">

        <h1 className="committee-title">Welkom, {firstName}</h1>
        <hr className="committee-divider" />

        <h2 className="committee-subtitle">Stageaanvragen</h2>

        <div className="status-grid">

          <div className="status-card status-yellow">
            <span className="status-label">Ingediend</span>
            <span className="status-count">{countSubmitted}</span>
          </div>

          <div className="status-card status-green">
            <span className="status-label">Goedgekeurd</span>
            <span className="status-count">{countApproved}</span>
          </div>

          <div className="status-card status-red">
            <span className="status-label">Afgekeurd</span>
            <span className="status-count">{countRejected}</span>
          </div>

          <div className="status-card status-orange">
            <span className="status-label">Aanpassingen vereist</span>
            <span className="status-count">{countAdjust}</span>
          </div>

        </div>

        <div className="overview-button-container">
          <Link to="/committee/overview" className="overview-button">
            Ga naar overzicht
          </Link>
        </div>

      </div>
    </div>
  );
}
>>>>>>> origin/develop
