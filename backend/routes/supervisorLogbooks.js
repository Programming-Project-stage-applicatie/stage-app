const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../db");

// ── TEACHER: all students + their most recent non-open logbook + company ──────
router.get("/teacher/logbooks", authenticateJWT, (req, res) => {
  const query = `
    SELECT 
      u.id,
      CONCAT(u.firstname, ' ', u.lastname) AS name,
      (SELECT company FROM internship_requests WHERE student_id = u.id ORDER BY id DESC LIMIT 1) AS company,
      lb.week AS last_week,
      lb.status
    FROM users u
    LEFT JOIN logbooks lb ON lb.id = (
      SELECT id FROM logbooks 
      WHERE created_by_student_id = u.id
        AND status != 'open'
      ORDER BY week DESC 
      LIMIT 1
    )
    WHERE u.role = 'student'
    ORDER BY u.firstname ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching teacher logbooks:", err);
      return res.status(500).json({ message: "Error fetching logbooks" });
    }
    res.json({ data: results });
  });
});

// ── MENTOR: own students + their most recent non-open logbook ─────────────────
router.get("/mentor/logbooks", authenticateJWT, (req, res) => {
  const mentorId = req.user.id;
  const query = `
    SELECT DISTINCT
      u.id,
      u.firstname,
      CONCAT(u.firstname, ' ', u.lastname) AS name,
      ir.company,
      lb.week AS last_week,
      lb.status
    FROM users u
    INNER JOIN internship_requests ir ON ir.student_id = u.id
    INNER JOIN internships i ON i.internship_request_id = ir.id
    LEFT JOIN logbooks lb ON lb.id = (
      SELECT id FROM logbooks 
      WHERE created_by_student_id = u.id
        AND status != 'open'
      ORDER BY week DESC 
      LIMIT 1
    )
    WHERE u.role = 'student'
      AND i.mentor_id = ?
    ORDER BY u.firstname ASC
  `;
  db.query(query, [mentorId], (err, results) => {
    if (err) {
      console.error("Error fetching mentor logbooks:", err);
      return res.status(500).json({ message: "Error fetching logbooks" });
    }
    res.json({ data: { students: results, company: '' } });
  });
});

// ── STUDENT LOGBOOKS: alle logboeken van één student (geen open) ──────────────
router.get("/students/:id/logbooks", authenticateJWT, (req, res) => {
  const studentId = req.params.id;
  db.query(
    "SELECT CONCAT(firstname, ' ', lastname) AS student_name FROM users WHERE id = ?",
    [studentId],
    (err, userResult) => {
      if (err || userResult.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }
      const studentName = userResult[0].student_name;
      db.query(
        "SELECT * FROM logbooks WHERE created_by_student_id = ? AND status != 'open' ORDER BY week ASC",
        [studentId],
        (err2, logbooks) => {
          if (err2) {
            console.error("Error fetching student logbooks:", err2);
            return res.status(500).json({ message: "Error fetching logbooks" });
          }
          res.json({ data: { student_name: studentName, logbooks } });
        }
      );
    }
  );
});

// ── LOGBOOK DETAIL: één logboek met student naam en bedrijf ──────────────────
router.get("/logbooks/:id/detail", authenticateJWT, (req, res) => {
  const logbookId = req.params.id;
  db.query(
    `SELECT 
      l.*,
      CONCAT(u.firstname, ' ', u.lastname) AS student_name,
      ir.company
     FROM logbooks l
     LEFT JOIN users u ON u.id = l.created_by_student_id
     LEFT JOIN internship_requests ir ON ir.student_id = l.created_by_student_id
     WHERE l.id = ?
     LIMIT 1`,
    [logbookId],
    (err, results) => {
      if (err) {
        console.error("Error fetching logbook detail:", err);
        return res.status(500).json({ message: "Error fetching logbook" });
      }
      if (results.length === 0) return res.status(404).json({ message: "Niet gevonden" });
      res.json(results[0]);
    }
  );
});

// ── FEEDBACK: docent/mentor geeft feedback op een logboek ────────────────────
router.post("/logbooks/:id/feedback", authenticateJWT, (req, res) => {
  const { feedback } = req.body;
  const logbookId = req.params.id;
  db.query(
    "UPDATE logbooks SET feedback = ? WHERE id = ?",
    [feedback, logbookId],
    (err) => {
      if (err) {
        console.error("Error saving feedback:", err);
        return res.status(500).json({ message: "Error saving feedback" });
      }
      res.json({ message: "Feedback saved" });
    }
  );
});

module.exports = router;