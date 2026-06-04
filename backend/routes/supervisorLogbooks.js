const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../db").promise();

router.get("/teacher/logbooks", authenticateJWT, async (req, res) => {
  const teacherId = req.user.id;
  const query = `
    SELECT
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
      WHERE internship_id = i.id
      ORDER BY week DESC LIMIT 1
    )
    WHERE u.role = 'student' AND i.teacher_id = ?
    GROUP BY u.id, i.id, ir.company, lb.week, lb.status
    ORDER BY u.firstname ASC
  `;
  try {
    const [results] = await db.query(query, [teacherId]);
    res.json({ data: results });
  } catch (err) {
    console.error("Error fetching teacher logbooks:", err);
    res.status(500).json({ message: "Error fetching logbooks" });
  }
});

router.get("/mentor/logbooks", authenticateJWT, async (req, res) => {
  const mentorId = req.user.id;
  const query = `
    SELECT
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
      WHERE internship_id = i.id
      ORDER BY week DESC LIMIT 1
    )
    WHERE u.role = 'student' AND i.mentor_id = ?
    GROUP BY u.id, i.id, ir.company, lb.week, lb.status
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

router.get("/logbooks/:id/detail", authenticateJWT, async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT l.*, CONCAT(u.firstname, ' ', u.lastname) AS student_name
       FROM logbooks l
       INNER JOIN users u ON u.id = l.created_by_student_id
       WHERE l.id = ?`,
      [req.params.id]
    );
    if (results.length === 0) return res.status(404).json({ message: "Niet gevonden" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: "Fout bij ophalen logboek" });
  }
});

router.post("/logbooks/:id/feedback", authenticateJWT, async (req, res) => {
  const { feedback, status } = req.body;
  const isMentor = req.user.role === "mentor";
  const column = isMentor ? "mentor_feedback" : "teacher_feedback";
  try {
    if (isMentor) {
      await db.query(
        `UPDATE logbooks SET ${column} = ?, status = ? WHERE id = ?`,
        [feedback, status || "adjustment_required", req.params.id]
      );
    } else {
      await db.query(
        `UPDATE logbooks SET ${column} = ? WHERE id = ?`,
        [feedback, req.params.id]
      );
    }
    res.json({ message: "Feedback opgeslagen" });
  } catch (err) {
    res.status(500).json({ message: "Fout bij opslaan feedback" });
  }
});

router.get("/internship/:internshipId/logbooks", authenticateJWT, async (req, res) => {
  const internshipId = req.params.internshipId;
  try {
    const [logbooks] = await db.query(
      `SELECT id, week, status FROM logbooks WHERE internship_id = ? AND status != 'open' ORDER BY week DESC`,
      [internshipId]
    );
    const [info] = await db.query(
      `SELECT CONCAT(u.firstname, ' ', u.lastname) AS student_name
       FROM internships i
       INNER JOIN internship_requests ir ON ir.id = i.internship_request_id
       INNER JOIN users u ON u.id = ir.student_id
       WHERE i.id = ?`,
      [internshipId]
    );
    res.json({
      data: {
        student_name: info[0]?.student_name || "",
        logbooks
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Fout bij ophalen logboeken" });
  }
});

module.exports = router;