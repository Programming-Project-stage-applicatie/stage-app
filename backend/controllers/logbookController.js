const db = require("../db");

exports.getLogbooksByInternship = async (req, res) => {
  const internshipId = req.params.internshipId;

  try {
    // Logboeken ophalen
    const [logbooks] = await db.query(
      `SELECT id, week, status FROM logbooks WHERE internship_id = ? ORDER BY week ASC`,
      [internshipId]
    );

    // Student + stage info ophalen
    const [internshipInfo] = await db.query(
      `SELECT 
        CONCAT(u.firstname, ' ', u.lastname) AS student_name,
        ir.company,
        ir.start_date,
        ir.end_date
      FROM internships i
      INNER JOIN internship_requests ir ON ir.id = i.internship_request_id
      INNER JOIN users u ON u.id = ir.student_id
      WHERE i.id = ?`,
      [internshipId]
    );

    const info = internshipInfo[0] || null;

    res.json({
      student_name: info?.student_name || null,
      company: info?.company || null,
      start_date: info?.start_date || null,
      end_date: info?.end_date || null,
      logbooks,
    });

  } catch (err) {
    console.error("Fetch logbooks failed:", err);
    res.status(500).json({ message: "Error fetching logbooks" });
  }
};

exports.getLogbookDetail = async (req, res) => {
  const logbookId = req.params.id;

  try {
    const [results] = await db.query(
      `SELECT id, week, tasks, reflection, problems, feedback, status FROM logbooks WHERE id = ?`,
      [logbookId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Logbook not found" });
    }

    res.json(results[0]);

  } catch (err) {
    console.error("Fetch logbook detail failed:", err);
    res.status(500).json({ message: "Error fetching logbook detail" });
  }
};