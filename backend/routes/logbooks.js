const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateJWT = require("../middleware/authenticateJWT");
const { getLogbooksByInternship, getLogbookDetail } = require("../controllers/logbookController");

// =========================
// STUDENT ROUTES
// =========================

router.get("/", authenticateJWT, async (req, res) => {
  const studentId = req.user.id;
  try {
    const [results] = await db.query(
      "SELECT * FROM logbooks WHERE created_by_student_id = ? ORDER BY week DESC",
      [studentId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logbooks" });
  }
});

router.get("/:id", authenticateJWT, async (req, res) => {
  const studentId = req.user.id;
  try {
    const [results] = await db.query(
      "SELECT * FROM logbooks WHERE id = ? AND created_by_student_id = ?",
      [req.params.id, studentId]
    );
    if (results.length === 0) return res.status(404).json({ message: "Logbook not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logbook" });
  }
});

// =========================
// DOCENT ROUTES
// =========================

router.get("/internship/:internshipId", authenticateJWT, getLogbooksByInternship);
router.get("/detail/:id", authenticateJWT, getLogbookDetail);

// =========================
// CREATE
// =========================

router.post("/", authenticateJWT, async (req, res) => {
  const studentId = req.user.id;
  const { week, tasks, reflection, problems, internship_id } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT id FROM logbooks WHERE created_by_student_id = ? AND week = ?",
      [studentId, week]
    );
    if (existing.length > 0) return res.status(409).json({ message: "Logbook already exists for this week" });

    const [result] = await db.query(
      `INSERT INTO logbooks (week, tasks, reflection, problems, feedback, status, internship_id, created_by_student_id) 
       VALUES (?, ?, ?, ?, '', 'open', ?, ?)`,
      [week, tasks, reflection, problems || "", internship_id, studentId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error creating logbook" });
  }
});

// =========================
// UPDATE
// =========================

router.put("/:id/save", authenticateJWT, async (req, res) => {
  const studentId = req.user.id;
  const { tasks, reflection, problems } = req.body;
  try {
    await db.query(
      `UPDATE logbooks SET tasks = ?, reflection = ?, problems = ? 
       WHERE id = ? AND created_by_student_id = ? AND status != 'approved'`,
      [tasks, reflection, problems || "", req.params.id, studentId]
    );
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving logbook" });
  }
});

router.put("/:id/feedback", authenticateJWT, async (req, res) => {
  const { feedback, status } = req.body;
  try {
    await db.query(
      "UPDATE logbooks SET feedback = ?, status = ? WHERE id = ?",
      [feedback, status, req.params.id]
    );
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving feedback" });
  }
});

router.put("/:id/submit", authenticateJWT, async (req, res) => {
  const studentId = req.user.id;
  const { tasks, reflection, problems } = req.body;
  try {
    await db.query(
      `UPDATE logbooks SET tasks = ?, reflection = ?, problems = ?, status = 'submitted' 
       WHERE id = ? AND created_by_student_id = ? AND status != 'approved'`,
      [tasks, reflection, problems || "", req.params.id, studentId]
    );
    res.json({ message: "Submitted" });
  } catch (err) {
    res.status(500).json({ message: "Error submitting logbook" });
  }
});

module.exports = router;