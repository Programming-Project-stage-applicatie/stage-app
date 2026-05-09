const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateJWT = require("../middleware/authenticateJWT");
const logbookController = require("../controllers/logbookController");

const {
  getLogbooksByInternship,
  getLogbookDetail
} = require("../controllers/logbookController");

// =========================
// STUDENT ROUTES
// =========================

// Alle logboeken van ingelogde student
router.get("/", authenticateJWT, (req, res) => {
  const studentId = req.user.id;

  db.query(
    "SELECT * FROM logbooks WHERE created_by_student_id = ? ORDER BY week DESC",
    [studentId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching logbooks" });
      }

      res.json(results);
    }
  );
});


// Eén logboek ophalen (student)
router.get("/:id", authenticateJWT, (req, res) => {
  const studentId = req.user.id;

  db.query(
    "SELECT * FROM logbooks WHERE id = ? AND created_by_student_id = ?",
    [req.params.id, studentId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching logbook" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Logbook not found" });
      }

      res.json(results[0]);
    }
  );
});


// =========================
// DOCENT ROUTES
// =========================

router.get(
  "/internship/:internshipId",
  authenticateJWT,
  getLogbooksByInternship
);

router.get(
  "/detail/:id",
  authenticateJWT,
  getLogbookDetail
);


// =========================
// CREATE
// =========================

// Nieuw logboek aanmaken
router.post("/", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  const { week, tasks, reflection, problems, internship_id } = req.body;

  db.query(
    "SELECT id FROM logbooks WHERE created_by_student_id = ? AND week = ?",
    [studentId, week],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ message: "Error checking logbook" });
      }

      if (existing.length > 0) {
        return res.status(409).json({
          message: "Logbook already exists for this week",
        });
      }

      db.query(
        `INSERT INTO logbooks 
        (week, tasks, reflection, problems, feedback, status, internship_id, created_by_student_id) 
        VALUES (?, ?, ?, ?, '', 'open', ?, ?)`,
        [week, tasks, reflection, problems || "", internship_id, studentId],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: "Error creating logbook" });
          }

          res.status(201).json({ id: result.insertId });
        }
      );
    }
  );
});


// =========================
// UPDATE
// =========================

// Opslaan (draft)
router.put("/:id/save", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  const { tasks, reflection, problems } = req.body;

  db.query(
    `UPDATE logbooks 
     SET tasks = ?, reflection = ?, problems = ? 
     WHERE id = ? 
     AND created_by_student_id = ? 
     AND status != 'approved'`,
    [tasks, reflection, problems || "", req.params.id, studentId],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving logbook" });
      }

      res.json({ message: "Saved" });
    }
  );
});

router.put("/:id/feedback", authenticateJWT, (req, res) => {
  const { feedback, status } = req.body;

  db.query(
    "UPDATE logbooks SET feedback = ?, status = ? WHERE id = ?",
    [feedback, status, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving feedback" });
      }

      res.json({ message: "Saved" });
    }
  );
});

// Indienen (submit)
router.put("/:id/submit", authenticateJWT, (req, res) => {
  const studentId = req.user.id;
  const { tasks, reflection, problems } = req.body;

  db.query(
    `UPDATE logbooks 
     SET tasks = ?, reflection = ?, problems = ?, status = 'submitted' 
     WHERE id = ? 
     AND created_by_student_id = ? 
     AND status != 'approved'`,
    [tasks, reflection, problems || "", req.params.id, studentId],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Error submitting logbook" });
      }

      res.json({ message: "Submitted" });
    }
  );
});


module.exports = router;
