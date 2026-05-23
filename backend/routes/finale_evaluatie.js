const express = require("express");
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

// ─── GET student view ────────────────────────────────────────────────────────
router.get("/student/:studentId", async (req, res) => {
  const pool = req.db;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM final_evaluations WHERE internship_id = ?",
      [req.params.studentId]
    );
    res.json(rows[0] ?? { internship_id: req.params.studentId, status: "open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST opslaan (student) ───────────────────────────────────────────────────
router.post("/student/:studentId/opslaan", (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: `Upload fout: ${err.message}` });
    else if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const pool = req.db;
  const { studentId } = req.params;
  const { omschrijving } = req.body;
  const document = req.file ? `/${req.file.path}` : null;
  try {
    const [existing] = await pool.query("SELECT id, status FROM final_evaluations WHERE internship_id = ?", [studentId]);
    if (existing.length > 0) {
      if (existing[0].status !== "open") return res.status(400).json({ error: `Finale evaluatie kan niet meer bewerkt worden (status: ${existing[0].status}).` });
      const updates = ["presentation = ?"];
      const values = [omschrijving];
      if (document) { updates.push("document = ?"); values.push(document); }
      values.push(existing[0].id);
      await pool.query(`UPDATE final_evaluations SET ${updates.join(", ")} WHERE id = ?`, values);
      return res.json({ message: "Opgeslagen", status: "open" });
    }
    const [result] = await pool.query(
      `INSERT INTO final_evaluations (internship_id, presentation, document, status, teacher_id, mentor_id) VALUES (?, ?, ?, 'open', 1, 1)`,
      [studentId, omschrijving ?? null, document]
    );
    res.status(201).json({ id: result.insertId, message: "Opgeslagen", status: "open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST indienen (student) ──────────────────────────────────────────────────
router.post("/student/:studentId/indienen", async (req, res) => {
  const pool = req.db;
  const { studentId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM final_evaluations WHERE internship_id = ?", [studentId]);
    if (rows.length === 0) return res.status(404).json({ error: "Geen finale evaluatie gevonden om in te dienen." });
    const record = rows[0];
    if (record.status !== "open") return res.status(400).json({ error: `Kan niet indienen: status is al '${record.status}'.` });
    if (!record.presentation || record.presentation.trim() === "") return res.status(400).json({ error: "Omschrijving is verplicht om in te dienen." });
    await pool.query("UPDATE final_evaluations SET status = 'submitted' WHERE id = ?", [record.id]);
    res.json({ message: "Eindpresentatie ingediend!", status: "submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST annuleren (student) ─────────────────────────────────────────────────
router.post("/student/:studentId/annuleren", async (req, res) => {
  const pool = req.db;
  const { studentId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM final_evaluations WHERE internship_id = ?", [studentId]);
    if (rows.length === 0) return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    if (rows[0].status !== "submitted") return res.status(400).json({ error: "Kan alleen annuleren als status 'submitted' is." });
    await pool.query("UPDATE final_evaluations SET status = 'open' WHERE id = ?", [rows[0].id]);
    res.json({ message: "Annulering geslaagd!", status: "open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST mentor motivatie ────────────────────────────────────────────────────
router.post("/student/:studentId/mentor-motivatie", async (req, res) => {
  const pool = req.db;
  const { studentId } = req.params;
  const { mentor_motivatie, mentor_id } = req.body;
  if (!mentor_motivatie || mentor_motivatie.trim() === "") return res.status(400).json({ error: "Eindmotivatie is verplicht." });
  try {
    const [rows] = await pool.query("SELECT id, status FROM final_evaluations WHERE internship_id = ?", [studentId]);
    if (rows.length === 0) return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    const record = rows[0];
    if (record.status !== "submitted") return res.status(400).json({ error: `Eindmotivatie kan enkel ingegeven worden als de status 'submitted' is (huidige status: '${record.status}').` });
    await pool.query(`UPDATE final_evaluations SET mentor_feedback = ?, mentor_id = ? WHERE id = ?`, [mentor_motivatie.trim(), mentor_id ?? null, record.id]);
    res.json({ message: "Eindmotivatie opgeslagen.", status: record.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET docent view ──────────────────────────────────────────────────────────
// FIX: Bij status "open" is er nog geen rij in final_evaluations.
//      We halen de studentinfo dan op via de internship rechtstreeks.
router.get("/student/:studentId/docent", async (req, res) => {
  const pool = req.db;
  const { studentId } = req.params;
  try {
    // Probeer eerst een bestaand evaluatierecord op te halen met alle info
    const [rows] = await pool.query(`
      SELECT
        fe.*,
        CONCAT(su.firstName, ' ', su.lastName) AS student_naam,
        ir.company                             AS bedrijf,
        CONCAT(mu.firstName, ' ', mu.lastName) AS mentor_naam
      FROM final_evaluations fe
      JOIN internships i               ON fe.internship_id        = i.id
      JOIN internship_requests ir      ON i.internship_request_id = ir.id
      JOIN users su                    ON ir.student_id           = su.id
      LEFT JOIN users mu               ON i.mentor_id             = mu.id
      WHERE fe.internship_id = ?
    `, [studentId]);

    if (rows.length > 0) {
      // Record bestaat — stuur volledige data terug
      const r = rows[0];
      return res.json({
        status:           r.status,
        student_naam:     r.student_naam     ?? null,
        bedrijf:          r.bedrijf          ?? null,
        mentor_naam:      r.mentor_naam      ?? null,
        presentation:     r.presentation     ?? null,
        document:         r.document         ?? null,
        mentor_motivatie: r.mentor_feedback  ?? null,
        final_score:      r.final_score      ?? null,
        feedback_docent:  r.teacher_feedback ?? null,
      });
    }

    // Geen evaluatierecord → status is "open", maar haal studentinfo toch op
    // via de internship zelf (studentId = internship id)
    const [infoRows] = await pool.query(`
      SELECT
        CONCAT(su.firstName, ' ', su.lastName) AS student_naam,
        ir.company                             AS bedrijf,
        CONCAT(mu.firstName, ' ', mu.lastName) AS mentor_naam
      FROM internships i
      JOIN internship_requests ir ON i.internship_request_id = ir.id
      JOIN users su               ON ir.student_id           = su.id
      LEFT JOIN users mu          ON i.mentor_id             = mu.id
      WHERE i.id = ?
    `, [studentId]);

    const info = infoRows[0] ?? {};
    return res.json({
      status:           "open",
      student_naam:     info.student_naam ?? null,
      bedrijf:          info.bedrijf      ?? null,
      mentor_naam:      info.mentor_naam  ?? null,
      presentation:     null,
      document:         null,
      mentor_motivatie: null,
      final_score:      null,
      feedback_docent:  null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST docent beoordeling ──────────────────────────────────────────────────
router.post("/student/:studentId/docent", async (req, res) => {
  const pool = req.db;
  const { studentId } = req.params;
  const { final_score, feedback_docent, beëindigd } = req.body;
  const score = final_score !== null && final_score !== undefined ? Number(final_score) : null;
  if (score !== null && (isNaN(score) || score < 0 || score > 20)) {
    return res.status(400).json({ error: "Vul een geldige score in (0–20)." });
  }
  try {
    const [rows] = await pool.query("SELECT id, status FROM final_evaluations WHERE internship_id = ?", [studentId]);
    if (rows.length === 0) return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    const record = rows[0];
    if (record.status === "open") return res.status(400).json({ error: "De student heeft de eindpresentatie nog niet ingediend." });
    const nieuweStatus = beëindigd === true
      ? "evaluated"
      : beëindigd === false && record.status === "evaluated"
        ? "submitted"
        : record.status;
    await pool.query(
      `UPDATE final_evaluations SET final_score = ?, teacher_feedback = ?, status = ? WHERE id = ?`,
      [score, feedback_docent ?? null, nieuweStatus, record.id]
    );
    res.json({
      message: beëindigd ? "Evaluatie beëindigd en opgeslagen." : "Score en feedback opgeslagen.",
      status: nieuweStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET bijlage downloaden ───────────────────────────────────────────────────
// FIX: Aparte route om bestanden veilig te serveren met auth-check.
//      Pad formaat in DB: /uploads/finale_evaluatie/student_X_timestamp.pdf
router.get("/document/:studentId", async (req, res) => {
  const pool = req.db;
  const { studentId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT document FROM final_evaluations WHERE internship_id = ?",
      [studentId]
    );
    if (rows.length === 0 || !rows[0].document) {
      return res.status(404).json({ error: "Geen document gevonden." });
    }

    // Pad in DB is bv. "/uploads/finale_evaluatie/student_5_1234.pdf"
    // Verwijder leading slash en bouw absoluut pad
    const relativePath = rows[0].document.replace(/^\//, "");
    const absPath = path.join(__dirname, "..", relativePath);

    // Veiligheidscheck: bestand moet binnen de uploadDir liggen
    const absUploadDir = path.resolve(uploadDir);
    if (!absPath.startsWith(absUploadDir)) {
      return res.status(403).json({ error: "Toegang geweigerd." });
    }

    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ error: "Bestand niet gevonden op server." });
    }
const ext = path.extname(absPath).toLowerCase();
if (ext === ".pdf") {
  res.setHeader("Content-Disposition", "inline");
} else {
  res.setHeader("Content-Disposition", `attachment; filename="${path.basename(absPath)}"`);
}

res.sendFile(absPath);
    res.sendFile(absPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
