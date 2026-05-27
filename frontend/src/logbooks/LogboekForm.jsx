import { useState } from "react";
import { t } from "../i18n/translations";

export default function LogboekForm({ logbook, internshipId, onTerug, existingWeeks = [] }) {
  const [savedLogbook, setSavedLogbook] = useState(logbook || null); // ← state local
  const isNieuw = !savedLogbook;                                      // ← basé sur state, pas prop

  const [week, setWeek] = useState(logbook?.week || "");
  const [tasks, setTasks] = useState(logbook?.tasks || "");
  const [reflection, setReflection] = useState(logbook?.reflection || "");
  const [problems, setProblems] = useState(logbook?.problems || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const readOnly = savedLogbook && savedLogbook.status !== "open" && savedLogbook.status !== "adjustment_required";
  const weekExists = isNieuw && existingWeeks.includes(Number(week));

  const handleSave = async () => {
    if (weekExists) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      let res;
      if (isNieuw) {
        res = await fetch("http://localhost:3000/api/logbooks", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ week, tasks, reflection, problems, internship_id: internshipId }),
        });
        if (!res.ok) throw new Error("Opslaan mislukt");
        const nieuwLogbook = await res.json();
        setSavedLogbook(nieuwLogbook); // ← reste sur le formulaire, bouton Indienen apparaît
      } else {
        res = await fetch(`http://localhost:3000/api/logbooks/${savedLogbook.id}/save`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tasks, reflection, problems }),
        });
        if (!res.ok) throw new Error("Opslaan mislukt");
        onTerug();
      }
    } catch (err) {
      setError(t("logbooks.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:3000/api/logbooks/${savedLogbook?.id}/submit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tasks, reflection, problems }),
      });
      if (!res.ok) throw new Error("Indienen mislukt");
      onTerug();
    } catch (err) {
      setError(t("logbooks.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (disabled) => ({
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: disabled ? "#f3f4f6" : "white",
  });

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "32px" }}>

        <h2 style={{ marginTop: 0 }}>
          {isNieuw ? t("logbooks.newLogbook") : `${t("logbooks.week")} ${savedLogbook.week}`}
        </h2>

        {isNieuw && (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
              {t("logbooks.weekNumber")}
            </label>
            <input
              type="number"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder={t("logbooks.weekPlaceholder")}
              style={{ ...inputStyle(false), borderColor: weekExists ? "#ef4444" : "#ccc" }}
            />
            {weekExists && (
              <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px" }}>
                {t("logbooks.weekExists")} {week}.
              </p>
            )}
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "4px" }}>{t("logbooks.tasks")}</h3>
          <p style={{ color: "#6b7280", marginBottom: "8px" }}>{t("logbooks.tasksDescription")}</p>
          <textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            disabled={readOnly}
            placeholder={t("logbooks.tasksPlaceholder")}
            rows={5}
            style={{ ...inputStyle(readOnly), resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "4px" }}>{t("logbooks.reflection")}</h3>
          <p style={{ color: "#6b7280", marginBottom: "8px" }}>{t("logbooks.reflectionDescription")}</p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            disabled={readOnly}
            placeholder={t("logbooks.reflectionPlaceholder")}
            rows={5}
            style={{ ...inputStyle(readOnly), resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ marginBottom: "4px" }}>{t("logbooks.problems")}</h3>
          <p style={{ color: "#6b7280", marginBottom: "8px" }}>{t("logbooks.problemsDescription")}</p>
          <textarea
            value={problems}
            onChange={(e) => setProblems(e.target.value)}
            disabled={readOnly}
            placeholder={t("logbooks.problemsPlaceholder")}
            rows={4}
            style={{ ...inputStyle(readOnly), resize: "vertical" }}
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>}

        {!readOnly && (
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleSave}
              disabled={loading || weekExists}
              style={{
                backgroundColor: weekExists ? "#d1d5db" : "#3b82f6",
                color: weekExists ? "#9ca3af" : "white",
                border: "none", padding: "10px 24px", borderRadius: "6px",
                cursor: weekExists ? "not-allowed" : "pointer",
                fontWeight: "bold", fontSize: "15px"
              }}
            >
              {loading ? t("logbooks.saving") : t("logbooks.save")}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={loading}
              style={{ backgroundColor: "#22c55e", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
            >
              {loading ? t("logbooks.saving") : t("logbooks.submit")}
            </button>
            <button
              onClick={onTerug}
              style={{ backgroundColor: "white", color: "black", border: "1px solid #ccc", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}
            >
              {t("logbooks.back")}
            </button>
          </div>
        )}

        {readOnly && (
          <button
            onClick={onTerug}
            style={{ backgroundColor: "white", color: "black", border: "1px solid #ccc", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}
          >
            {t("logbooks.back")}
          </button>
        )}
      </div>

      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", borderRadius: "10px", padding: "32px",
            maxWidth: "420px", width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginTop: 0 }}>{t("logbooks.confirmTitle")}</h3>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {t("logbooks.confirmText")}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSubmitConfirm}
                style={{ backgroundColor: "#22c55e", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
              >
                {t("logbooks.confirmYes")}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ backgroundColor: "white", color: "black", border: "1px solid #ccc", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}
              >
                {t("logbooks.confirmCancel")}
              </button>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}