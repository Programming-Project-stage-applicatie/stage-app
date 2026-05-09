import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";

export default function TeacherLogbookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [logbook, setLogbook] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("submitted");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/api/logbooks/detail/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        setLogbook(data);
        setFeedback(data.feedback || "");
        setStatus(data.status);

      } catch {
        setError(t("logbook.errors.load"));
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // Save feedback + status
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/api/logbooks/${id}/feedback`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            feedback,
            status
          })
        }
      );

      if (!res.ok) throw new Error();

      alert(t("logbook.feedbackSaved"));
      navigate(-1);

    } catch {
      alert(t("logbook.errors.save"));
    }
  };

  if (loading) return <p>{t("logbook.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!logbook) return null;

  return (
    <div style={s.page}>
      <h1>{t("logbook.title")} — {t("logbook.week")} {logbook.week}</h1>

      <div style={s.card}>
        <h3>{t("logbook.tasks")}</h3>
        <p>{logbook.tasks || "-"}</p>
      </div>

      <div style={s.card}>
        <h3>{t("logbook.reflection")}</h3>
        <p>{logbook.reflection || "-"}</p>
      </div>

      <div style={s.card}>
        <h3>{t("logbook.problems")}</h3>
        <p>{logbook.problems || "-"}</p>
      </div>

      <div style={s.card}>
        <h3>{t("logbook.feedback")}</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          style={s.textarea}
        />
      </div>

      <div style={s.card}>
        <h3>{t("logbook.status")}</h3>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={s.select}
        >
          <option value="submitted">
            {t("logbook.statuses.submitted")}
          </option>
          <option value="approved">
            {t("logbook.statuses.approved")}
          </option>
          <option value="adjustment_required">
            {t("logbook.statuses.adjustment_required")}
          </option>
        </select>
      </div>

      <div style={s.actions}>
        <button style={s.saveBtn} onClick={handleSave}>
          {t("logbook.save")}
        </button>

        <button style={s.cancelBtn} onClick={() => navigate(-1)}>
          {t("logbook.back")}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "Segoe UI"
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "16px",
    marginBottom: 16
  },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db"
  },
  select: {
    padding: 8,
    borderRadius: 6
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 20
  },
  saveBtn: {
    background: "#2563eb",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  cancelBtn: {
    background: "#e5e7eb",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};


