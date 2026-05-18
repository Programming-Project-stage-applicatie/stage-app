const express = require("express");
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = "uploads/finale_evaluatie";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `student_${req.params.studentId}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".docx", ".doc", ".zip"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Alleen PDF, DOCX, DOC of ZIP bestanden zijn toegestaan."));
  },
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT 
        fe.*,
        fe.mentor_feedback   AS mentor_motivatie,
        fe.teacher_feedback  AS feedback_docent,
        CONCAT(u.firstname, ' ', u.lastname) AS student_naam,
        ir.company           AS bedrijf,
        CONCAT(ir.mentor_firstName, ' ', ir.mentor_lastName) AS mentor_naam
      FROM final_evaluations fe
      JOIN internship_requests ir ON fe.internship_id = ir.id
      JOIN users u ON ir.student_id = u.id
      WHERE fe.internship_id = ?`,
      [req.params.studentId]
    );

    if (rows.length === 0) {
      return res.json({ internship_id: req.params.studentId, status: "open" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/student/:studentId/opslaan",
  (req, res, next) => {
    upload.single("document")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload fout: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const { studentId } = req.params;
    const { omschrijving } = req.body;
    const document = req.file ? `/${req.file.path}` : null;

    try {
      const [existing] = await db.promise().query(
        "SELECT id, status FROM final_evaluations WHERE internship_id = ?",
        [studentId]
      );

      if (existing.length > 0) {
        if (existing[0].status !== "open") {
          return res.status(400).json({
            error: `Finale evaluatie kan niet meer bewerkt worden (status: ${existing[0].status}).`,
          });
        }

        const updates = ["presentation = ?"];
        const values = [omschrijving];

        if (document) {
          updates.push("document = ?");
          values.push(document);
        }
        values.push(existing[0].id);

        await db.promise().query(
          `UPDATE final_evaluations SET ${updates.join(", ")} WHERE id = ?`,
          values
        );
        return res.json({ message: "Opgeslagen", status: "open" });
      }

      const [result] = await db.promise().query(
        `INSERT INTO final_evaluations (internship_id, presentation, document, status, teacher_id, mentor_id)
         VALUES (?, ?, ?, 'open', 1, 1)`,
        [studentId, omschrijving ?? null, document]
      );
      res.status(201).json({ id: result.insertId, message: "Opgeslagen", status: "open" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post("/student/:studentId/indienen", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM final_evaluations WHERE internship_id = ?",
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Geen finale evaluatie gevonden om in te dienen." });
    }

    const record = rows[0];

    if (record.status !== "open") {
      return res.status(400).json({
        error: `Kan niet indienen: status is al '${record.status}'.`,
      });
    }

    if (!record.presentation || record.presentation.trim() === "") {
      return res.status(400).json({ error: "Omschrijving is verplicht om in te dienen." });
    }

    await db.promise().query(
      "UPDATE final_evaluations SET status = 'submitted' WHERE id = ?",
      [record.id]
    );

    res.json({ message: "Eindpresentatie ingediend!", status: "submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/student/:studentId/annuleren", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM final_evaluations WHERE internship_id = ?",
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    }

    if (rows[0].status !== "submitted") {
      return res.status(400).json({ error: "Kan alleen annuleren als status 'submitted' is." });
    }

    await db.promise().query(
      "UPDATE final_evaluations SET status = 'open' WHERE id = ?",
      [rows[0].id]
    );

    res.json({ message: "Annulering geslaagd!", status: "open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/student/:studentId/mentor-motivatie", async (req, res) => {
  const { studentId } = req.params;
  const { mentor_motivatie, mentor_id } = req.body;

  if (!mentor_motivatie || mentor_motivatie.trim() === "") {
    return res.status(400).json({ error: "Eindmotivatie is verplicht." });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT id, status FROM final_evaluations WHERE internship_id = ?",
      [studentId]
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

    await db.promise().query(
      `UPDATE final_evaluations SET mentor_feedback = ?, mentor_id = ? WHERE id = ?`,
      [mentor_motivatie.trim(), mentor_id ?? null, record.id]
    );

    res.json({ message: "Eindmotivatie opgeslagen.", status: record.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
