const express = require("express");
const router = express.Router();

async function getInternshipId(db, studentId) {
  const [rows] = await db.query(
    `SELECT internships.id 
     FROM internships 
     JOIN internship_requests ON internships.internship_request_id = internship_requests.id
     WHERE internship_requests.student_id = ?`,
    [studentId]
  );
  return rows.length > 0 ? rows[0].id : null;
}

router.get("/student/:studentId", async (req, res) => {
  const db = req.db;
  const { studentId } = req.params;
  try {
    const internshipId = await getInternshipId(db, studentId);
    if (!internshipId) {
      return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
    }
    const [rows] = await db.query(
      `SELECT 
        fe.*,
        CONCAT(student.firstname, ' ', student.lastname) AS student_naam,
        ir.company AS bedrijf,
        CONCAT(mentor.firstname, ' ', mentor.lastname) AS mentor_naam,
        CONCAT(teacher.firstname, ' ', teacher.lastname) AS docent_naam
       FROM final_evaluations fe
       JOIN internships i ON fe.internship_id = i.id
       JOIN internship_requests ir ON i.internship_request_id = ir.id
       JOIN users AS student ON ir.student_id = student.id
       LEFT JOIN users AS mentor ON i.mentor_id = mentor.id
       LEFT JOIN users AS teacher ON i.teacher_id = teacher.id
       WHERE fe.internship_id = ?`,
      [internshipId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("FOUT:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/student/:studentId/mentor-motivatie", async (req, res) => {
  const db = req.db;
  const { studentId } = req.params;
  const { mentor_motivatie, mentor_id } = req.body;
  if (!mentor_motivatie || mentor_motivatie.trim() === "") {
    return res.status(400).json({ error: "Eindmotivatie is verplicht." });
  }
  try {
    const internshipId = await getInternshipId(db, studentId);
    if (!internshipId) {
      return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
    }
    const [rows] = await db.query(
      "SELECT id, status FROM final_evaluations WHERE internship_id = ?",
      [internshipId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    }
    const record = rows[0];
    if (record.status !== "submitted") {
      return res.status(400).json({
        error: `Eindmotivatie kan enkel ingegeven worden als de status 'submitted' is (huidige status: '${record.status}').`,
      });
    }
    await db.query(
      `UPDATE final_evaluations SET mentor_feedback = ?, mentor_id = ? WHERE id = ?`,
      [mentor_motivatie.trim(), mentor_id ?? null, record.id]
    );
    res.json({ message: "Eindmotivatie opgeslagen.", status: record.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
