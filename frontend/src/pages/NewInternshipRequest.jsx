import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/newInternshipRequest.css";

function NewInternshipRequest() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  const [company, setCompany] = useState("");
  const [mentorFirstName, setMentorFirstName] = useState("");
  const [mentorLastName, setMentorLastName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchStudent() {
      try {
        const response = await fetch("http://localhost:3000/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        setStudent(data);
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    }

    fetchStudent();
  }, []);

  function validateForm() {
    const newErrors = {};

    if (!company.trim()) {
      newErrors.company = "Gelieve een bedrijf in te vullen.";
    }

    if (!description.trim()) {
      newErrors.description = "Gelieve een opdracht in te vullen.";
    }

    if (!startDate || !endDate) {
      newErrors.period = "Gelieve een geldige periode te selecteren.";
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.period = "De startdatum moet vóór de einddatum liggen.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // Stop submit
    }

    const body = {
      student_id: student.id,
      company,
      mentor_firstName: mentorFirstName,
      mentor_lastName: mentorLastName,
      description,
      start_date: startDate,
      end_date: endDate,
    };

    try {
      const response = await fetch("http://localhost:3000/internship-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Er ging iets mis bij het indienen." });
        return;
      }

      navigate("/student/request/" + data.request_id);
    } catch (err) {
      console.error("Error submitting request:", err);
      setErrors({ general: "Er ging iets mis bij het indienen." });
    }
  }

  if (!student) return <p>Loading...</p>;

  return (
    <div className="request-container">
      <h2 className="request-title">Nieuwe Stageaanvraag</h2>

      <p className="request-info">
        <strong>Student:</strong> {student.firstname} {student.lastname}
      </p>
      <p className="request-info">
        <strong>Opleiding:</strong> {student.studyprogram}
      </p>

      {errors.general && <p className="error-message">{errors.general}</p>}

      <form className="request-form" noValidate onSubmit={handleSubmit}>

        <div className="request-field">
          <label>Bedrijf *</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          {errors.company && <p className="error-message">{errors.company}</p>}
        </div>

        <div className="request-field">
          <label>Mentor voornaam (optioneel)</label>
          <input
            type="text"
            value={mentorFirstName}
            onChange={(e) => setMentorFirstName(e.target.value)}
          />
        </div>

        <div className="request-field">
          <label>Mentor achternaam (optioneel)</label>
          <input
            type="text"
            value={mentorLastName}
            onChange={(e) => setMentorLastName(e.target.value)}
          />
        </div>

        <div className="request-field">
          <label>Opdracht *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
          {errors.description && <p className="error-message">{errors.description}</p>}
        </div>

        <div className="request-field">
          <label>Startdatum *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="request-field">
          <label>Einddatum *</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.period && <p className="error-message">{errors.period}</p>}
        </div>

        <div className="request-buttons">
          <button className="request-submit" type="submit">
            Indienen
          </button>

          <button
            type="button"
            className="request-cancel"
            onClick={() => navigate("/dashboard/student")}
          >
            Annuleren
          </button>
        </div>

      </form>
    </div>
  );
}

export default NewInternshipRequest;
