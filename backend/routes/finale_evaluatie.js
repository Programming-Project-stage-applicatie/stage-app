router.post("/student/:studentId/mentor-motivatie", async (req, res) => {
  const db = req.db;
  const { studentId } = req.params;
  const { mentor_motivatie, mentor_id } = req.body;

  if (!mentor_motivatie || mentor_motivatie.trim() === "") {
    return res.status(400).json({ error: "Eindmotivatie is verplicht." });
  }

  try {
    // Haal internshipId op
    const internshipId = await getInternshipId(db, studentId);
    if (!internshipId) {
      return res.status(404).json({ error: "Geen stage gevonden voor deze student." });
    }

    // ENIGE FIX: internshipId gebruiken
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

    // Update motivatie (NIETS aangepast)
    await db.query(
      `UPDATE final_evaluations 
       SET mentor_feedback = ?, mentor_id = ? 
       WHERE id = ?`,
      [mentor_motivatie.trim(), mentor_id ?? null, record.id]
    );

    res.json({ message: "Eindmotivatie opgeslagen.", status: record.status });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

