const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../db");

router.get("/teacher/logbooks", authenticateJWT, (req, res) => {
  const query = `
    SELECT 
      u.id,
      CONCAT(u.firstname, ' ', u.lastname) AS name,
      lb.week AS last_week,
      lb.status,
      (SELECT internship_id FROM logbooks WHERE created_by_student_id = u.id LIMIT 1) AS internship_id
    FROM users u
    LEFT JOIN logbooks lb ON lb.id = (
      SELECT id FROM logbooks 
      WHERE created_by_student_id = u.id AND status != 'open'
      ORDER BY week DESC LIMIT 1
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
      WHERE created_by_student_id = u.id AND status != 'open'
      ORDER BY week DESC LIMIT 1
    )
    WHERE u.role = 'student' AND i.mentor_id = ?
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

router.get("/students/:id/logbooks", authenticateJWT, (req, res) => {
  const studentId = req.params.id;
  const query = `
    SELECT id, week, status 
    FROM logbooks 
    WHERE created_by_student_id = ?
    ORDER BY week DESC
  `;
  db.query(query, [studentId], (err, logbooks) => {
    if (err) return res.status(500).json({ message: "Fout bij ophalen logboeken" });

    db.query(
      `SELECT CONCAT(u.firstname, ' ', u.lastname) AS student_name 
       FROM users u WHERE u.id = ?`,
      [studentId],
      (err2, userResult) => {
        if (err2) return res.status(500).json({ message: "Fout bij ophalen student" });
        res.json({
          data: {
            student_name: userResult[0]?.student_name || "",
            logbooks
          }
        });
      }
    );
  });
});

router.get("/logbooks/:id/detail", authenticateJWT, (req, res) => {
  db.query(
    "SELECT * FROM logbooks WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Fout bij ophalen logboek" });
      if (results.length === 0) return res.status(404).json({ message: "Niet gevonden" });
      res.json(results[0]);
    }
  );
});

router.post("/logbooks/:id/feedback", authenticateJWT, (req, res) => {
  const { feedback, status } = req.body;
  db.query(
    "UPDATE logbooks SET feedback = ?, status = ? WHERE id = ?",
    [feedback, status || "adjustment_required", req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Fout bij opslaan feedback" });
      res.json({ message: "Feedback opgeslagen" });
    }
  );
});

module.exports = router;