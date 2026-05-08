const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../db");
 
// Alle logboeken van ingelogde student
router.get("/", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  db.query(
    "SELECT * FROM logbooks WHERE created_by_student_id = ? ORDER BY week DESC",
    [studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Fout bij ophalen logbooks" });
      res.json(results);
    }
  );
});
 
// Één logboek ophalen
router.get("/:id", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  db.query(
    "SELECT * FROM logbooks WHERE id = ? AND created_by_student_id = ?",
    [req.params.id, studentId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Fout bij ophalen logbook" });
      if (results.length === 0) return res.status(404).json({ message: "Niet gevonden" });
      res.json(results[0]);
    }
  );
});
 
// Nieuw logboek aanmaken (status = open)
router.post("/", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  const { week, tasks, reflection, problems, internship_id } = req.body;
 
  // Controleer of er al een logboek bestaat voor deze week
  db.query(
    "SELECT id FROM logbooks WHERE created_by_student_id = ? AND week = ?",
    [studentId, week],
    (err, existing) => {
      if (err) return res.status(500).json({ message: "Fout bij aanmaken logbook" });
      if (existing.length > 0) return res.status(409).json({ message: "Er bestaat al een logboek voor deze week" });
 
      db.query(
        "INSERT INTO logbooks (week, tasks, reflection, problems, feedback, status, internship_id, created_by_student_id) VALUES (?, ?, ?, ?, '', 'open', ?, ?)",
        [week, tasks, reflection, problems || "", internship_id, studentId],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Fout bij aanmaken logbook" });
          res.status(201).json({ id: result.insertId });
        }
      );
    }
  );
});
 
// Opslaan (status blijft open)
router.put("/:id/save", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  const { tasks, reflection, problems } = req.body;
  db.query(
    "UPDATE logbooks SET tasks = ?, reflection = ?, problems = ? WHERE id = ? AND created_by_student_id = ? AND status != 'approved'",
    [tasks, reflection, problems || "", req.params.id, studentId],
    (err) => {
      if (err) return res.status(500).json({ message: "Fout bij opslaan" });
      res.json({ message: "Opgeslagen" });
    }
  );
});
 
// Indienen (status wordt submitted)
router.put("/:id/submit", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  const { tasks, reflection, problems } = req.body;
  db.query(
    "UPDATE logbooks SET tasks = ?, reflection = ?, problems = ?, status = 'submitted' WHERE id = ? AND created_by_student_id = ? AND status != 'approved'",
    [tasks, reflection, problems || "", req.params.id, studentId],
    (err) => {
      if (err) return res.status(500).json({ message: "Fout bij indienen" });
      res.json({ message: "Ingediend" });
    }
  );
});
 
module.exports = router;
 
