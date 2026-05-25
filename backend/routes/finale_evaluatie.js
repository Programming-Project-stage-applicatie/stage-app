const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ─── Multer config ──────────────────────────────────────────────────────────
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

// ─── Hulpfunctie: zoek internship id via student id ─────────────────────────
async function getInternshipId(db, studentId) {
  const [rows] = await db.query(
    `SELECT internships.id 
     FROM internships 
     JOIN internship_requests ON internships.internship_request_id = internship_requests.id
     WHERE internship_requests.student_id = ?`,
    [studentId]
  );
  return rows[0]?.id ?? null;
}

// ─── GET /api/finale-evaluatie/student/:studentId ───────────────────────────
router.get("/student/:studentId", async (req, res) => {
  const db = req.db;
  try {
    const internshipId = await getInternshipId(db, req.params.studentId);
    if (!internshipId) return res.json({ status: "open" });

    const [rows] = await db.query(
      "SELECT * FROM final_evaluations WHERE internship_id = ?",
      [internshipId]
    );
    res.json(rows[0] ?? { status: "open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/finale-evaluatie/student/:studentId/opslaan ──────────────────
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
    const db = req.db;
    const { studentId } = req.params;
    const { omschrijving } = req.body;
    const document = req.file ? `/${req.file.path}` : null;

    try {
      const internshipId = await getInternshipId(db, studentId);
      if (!internshipId) {
        return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
      }

      const [existing] = await db.query(
        "SELECT id, status FROM final_evaluations WHERE internship_id = ?",
        [internshipId]
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
        await db.query(
          `UPDATE final_evaluations SET ${updates.join(", ")} WHERE id = ?`,
          values
        );
        return res.json({ message: "Opgeslagen", status: "open" });
      }

      // Haal teacher_id en mentor_id op uit de internship
      const [internshipRows] = await db.query(
        "SELECT teacher_id, mentor_id FROM internships WHERE id = ?",
        [internshipId]
      );
      const teacherId = internshipRows[0]?.teacher_id ?? null;
      const mentorId  = internshipRows[0]?.mentor_id  ?? null;

      const [result] = await db.query(
        `INSERT INTO final_evaluations (internship_id, presentation, document, status, teacher_id, mentor_id)
         VALUES (?, ?, ?, 'open', ?, ?)`,
        [internshipId, omschrijving ?? null, document, teacherId, mentorId]
      );

      res.status(201).json({ id: result.insertId, message: "Opgeslagen", status: "open" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/finale-evaluatie/student/:studentId/indienen ─────────────────
router.post("/student/:studentId/indienen", async (req, res) => {
  const db = req.db;
  const { studentId } = req.params;

  try {
    const internshipId = await getInternshipId(db, studentId);
    if (!internshipId) {
      return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
    }

    const [rows] = await db.query(
      "SELECT * FROM final_evaluations WHERE internship_id = ?",
      [internshipId]
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

    await db.query(
      "UPDATE final_evaluations SET status = 'submitted' WHERE id = ?",
      [record.id]
    );

    res.json({ message: "Eindpresentatie ingediend!", status: "submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/finale-evaluatie/student/:studentId/annuleren ────────────────
router.post("/student/:studentId/annuleren", async (req, res) => {
  const db = req.db;
  const { studentId } = req.params;

  try {
    const internshipId = await getInternshipId(db, studentId);
    if (!internshipId) {
      return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
    }

    const [rows] = await db.query(
      "SELECT * FROM final_evaluations WHERE internship_id = ?",
      [internshipId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    }

    if (rows[0].status !== "submitted") {
      return res.status(400).json({ error: "Kan alleen annuleren als status 'submitted' is." });
    }

    await db.query(
      "UPDATE final_evaluations SET status = 'open' WHERE id = ?",
      [rows[0].id]
    );

    res.json({ message: "Annulering geslaagd!", status: "open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
