const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../db");

// ── TEACHER: alle studenten + hun meest recente logboek ──────────────────────
router.get("/teacher/logbooks", authenticateJWT, (req, res) => {
  const query = `
    SELECT 
      u.id,
      CONCAT(u.firstname, ' ', u.lastname) AS name,
      lb.week AS last_week,
      lb.status,
      (
        SELECT internship_id 
        FROM logbooks 
        WHERE created_by_student_id = u.id 
        LIMIT 1
      ) AS internship_id
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

// ── MENTOR: eigen studenten + hun meest recente logboek ──────────────────────
router.get("/mentor/logbooks", authenticateJWT, (req, res) => {
  const mentorId = req.user.id;
  const query = `
    SELECT DISTINCT
      u.id,
      CONCAT(u.firstname, ' ', u.lastname) AS name,
      ir.company,
      lb.week AS last_week,
      lb.status,
      i.id AS internship_id
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
    res.json({ data: results });
  });
});

module.exports = router;