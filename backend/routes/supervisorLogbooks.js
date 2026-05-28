const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../db");

router.get("/teacher/logbooks", authenticateJWT, async (req, res) => {
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
  try {
    const [results] = await db.query(query);
    res.json({ data: results });
  } catch (err) {
    console.error("Error fetching teacher logbooks:", err);
    res.status(500).json({ message: "Error fetching logbooks" });
  }
});

router.get("/mentor/logbooks", authenticateJWT, async (req, res) => {
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
  try {
    const [results] = await db.query(query, [mentorId]);
    res.json({ data: results });
  } catch (err) {
    console.error("Error fetching mentor logbooks:", err);
    res.status(500).json({ message: "Error fetching logbooks" });
  }
});

module.exports = router;