import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ─── Multer config (uploads/finale_evaluatie/) ──────────────────────────────
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
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".docx", ".doc", ".zip"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Alleen PDF, DOCX, DOC of ZIP bestanden zijn toegestaan."));
  },
});

// ─── GET /api/finale-evaluatie/student/:studentId ───────────────────────────
// Haal de finale evaluatie op van een student (of null als nog niet bestaat)
router.get("/student/:studentId", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM finale_evaluatie WHERE student_id = ?",
      [req.params.studentId]
    );
    // Stuur het record terug of een leeg object met status Open
    res.json(rows[0] ?? { student_id: req.params.studentId, status: "Open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/finale-evaluatie/student/:studentId/opslaan ──────────────────
// Sla omschrijving + optioneel document op (status blijft Open)
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
    const document_url = req.file ? `/${req.file.path}` : null;

    try {
      // Check of er al een record bestaat
      const [existing] = await db.query(
        "SELECT id, status FROM finale_evaluatie WHERE student_id = ?",
        [studentId]
      );

      if (existing.length > 0) {
        // Mag enkel bewerkt worden als status = Open
        if (existing[0].status !== "Open") {
          return res.status(400).json({
            error: `Finale evaluatie kan niet meer bewerkt worden (status: ${existing[0].status}).`,
          });
        }

        // Update bestaand record
        const updates = ["omschrijving = ?", "updated_at = NOW()"];
        const values = [omschrijving];

        if (document_url) {
          updates.push("document_url = ?");
          values.push(document_url);
        }
        values.push(existing[0].id);

        await db.query(
          `UPDATE finale_evaluatie SET ${updates.join(", ")} WHERE id = ?`,
          values
        );
        return res.json({ message: "Opgeslagen", status: "Open" });
      }

      // Nieuw record aanmaken
      const [result] = await db.query(
        `INSERT INTO finale_evaluatie (student_id, omschrijving, document_url, status)
         VALUES (?, ?, ?, 'Open')`,
        [studentId, omschrijving ?? null, document_url]
      );
      res.status(201).json({ id: result.insertId, message: "Opgeslagen", status: "Open" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/finale-evaluatie/student/:studentId/indienen ─────────────────
// Zet status op Ingediend — omschrijving is dan verplicht
router.post("/student/:studentId/indienen", async (req, res) => {
  const { studentId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM finale_evaluatie WHERE student_id = ?",
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Geen finale evaluatie gevonden om in te dienen." });
    }

    const record = rows[0];

    if (record.status !== "Open") {
      return res.status(400).json({
        error: `Kan niet indienen: status is al '${record.status}'.`,
      });
    }

    if (!record.omschrijving || record.omschrijving.trim() === "") {
      return res.status(400).json({ error: "Omschrijving is verplicht om in te dienen." });
    }

    await db.query(
      "UPDATE finale_evaluatie SET status = 'Ingediend', updated_at = NOW() WHERE id = ?",
      [record.id]
    );

    res.json({ message: "Eindpresentatie ingediend!", status: "Ingediend" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
