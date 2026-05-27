const express = require("express");
const router = express.Router();

async function getInternshipId(db, studentId) {
  const [rows] = await db.query(
    `SELECT internships.id 
     FROM internships 
     JOIN internship_requests ON internships.internship_request_id = internship_requests.id
     WHERE internship_requests.student_id = ?`,
    [studentId]
  );
  return rows.length > 0 ? rows[0].id : null;
}

router.get("/student/:studentId", async (req, res) => {
  const db = req.db;
  const { studentId } = req.params;
  try {
    const internshipId = await getInternshipId(db, studentId);
    if (!internshipId) {
      return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
    }
    const [rows] = await db.query(
      `SELECT 
        fe.*,
        CONCAT(student.firstname, ' ', student.lastname) AS student_naam,
        ir.company AS bedrijf,
        CONCAT(mentor.firstname, ' ', mentor.lastname) AS mentor_naam,
        CONCAT(teacher.firstname, ' ', teacher.lastname) AS docent_naam
       FROM final_evaluations fe
       JOIN internships i ON fe.internship_id = i.id
       JOIN internship_requests ir ON i.internship_request_id = ir.id
       JOIN users AS student ON ir.student_id = student.id
       LEFT JOIN users AS mentor ON i.mentor_id = mentor.id
       LEFT JOIN users AS teacher ON i.teacher_id = teacher.id
       WHERE fe.internship_id = ?`,
      [internshipId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("FOUT:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/student/:studentId/mentor-motivatie", async (req, res) => {
  const db = req.db;
  const { studentId } = req.params;
  const { mentor_motivatie, mentor_id } = req.body;
  if (!mentor_motivatie || mentor_motivatie.trim() === "") {
    return res.status(400).json({ error: "Eindmotivatie is verplicht." });
  }
  try {
    const internshipId = await getInternshipId(db, studentId);
    if (!internshipId) {
      return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
    }
    const [rows] = await db.query(
      "SELECT id, status FROM final_evaluations WHERE internship_id = ?",
      [internshipId]
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
    await db.query(
      `UPDATE final_evaluations SET mentor_feedback = ?, mentor_id = ? WHERE id = ?`,
      [mentor_motivatie.trim(), mentor_id ?? null, record.id]
    );
    res.json({ message: "Eindmotivatie opgeslagen.", status: record.status });
    
  } catch (err) {
    console.error("VOLLEDIGE FOUT:", err); // ← volledige fout in terminal
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
      return res.status(400).json({ error: `Kan niet indienen: status is al '${record.status}'.` });
    }
    if (!record.presentation || record.presentation.trim() === "") {
      return res.status(400).json({ error: "Omschrijving is verplicht om in te dienen." });
    }
    await db.query("UPDATE final_evaluations SET status = 'submitted' WHERE id = ?", [record.id]);
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
    await db.query("UPDATE final_evaluations SET status = 'open' WHERE id = ?", [rows[0].id]);
    res.json({ message: "Annulering geslaagd!", status: "open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/finale-evaluatie/internship/:internshipId/docent ───────────────
router.get("/internship/:internshipId/docent", async (req, res) => {
  const pool = req.db;
  const { internshipId } = req.params;
  try {
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
    `, [internshipId]);

    if (rows.length > 0) {
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
    `, [internshipId]);

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

// ─── POST /api/finale-evaluatie/internship/:internshipId/docent ──────────────
router.post("/internship/:internshipId/docent", async (req, res) => {
  const pool = req.db;
  const { internshipId } = req.params;
  const { final_score, feedback_docent, beëindigd } = req.body;
  const score = final_score != null ? Number(final_score) : null;
  if (score !== null && (isNaN(score) || score < 0 || score > 20)) {
    return res.status(400).json({ error: "Vul een geldige score in (0–20)." });
  }
  try {
    const [rows] = await pool.query(
      "SELECT id, status FROM final_evaluations WHERE internship_id = ?",
      [internshipId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Geen finale evaluatie gevonden." });
    const record = rows[0];
    if (record.status === "open") return res.status(400).json({ error: "De student heeft de eindpresentatie nog niet ingediend." });
    const nieuweStatus = beëindigd === true ? "evaluated" : record.status;
    await pool.query(
      `UPDATE final_evaluations SET final_score = ?, teacher_feedback = ?, status = ? WHERE id = ?`,
      [score, feedback_docent ?? null, nieuweStatus, record.id]
    );
    res.json({ message: "Opgeslagen.", status: nieuweStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ─── GET /api/finale-evaluatie/document/:internshipId ───────────────────────
router.get("/document/:internshipId", async (req, res) => {
  const pool = req.db;
  const { internshipId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT document FROM final_evaluations WHERE internship_id = ?",
      [internshipId]
    );
    if (!rows[0]?.document) {
      return res.status(404).json({ error: "Geen document gevonden." });
    }
    // document is opgeslagen als "/uploads/finale_evaluatie/bestand.pdf"
    const bestandspad = path.join(__dirname, "..", rows[0].document);
    if (!fs.existsSync(bestandspad)) {
      return res.status(404).json({ error: "Bestand niet gevonden op schijf." });
    }
    res.sendFile(bestandspad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
