const ALLOWED_STATUSES = [
  "submitted",
  "approved",
  "adjustment_required",
  "rejected"
];

/* ============================================================
   Helper: valideer YYYY-MM-DD formaat
============================================================ */
function isValidDateString(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

/* ============================================================
   GET: detail van één stageaanvraag (MET JOIN STUDENT)
============================================================ */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await req.db.query(
      `
      SELECT 
        ir.id,
        ir.student_id,
        ir.internship_committee_id,
        ir.company,
        ir.description,
        DATE_FORMAT(ir.request_date, '%Y-%m-%d') AS request_date,
        DATE_FORMAT(ir.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(ir.end_date, '%Y-%m-%d') AS end_date,
        ir.status,
        ir.mentor_firstName,
        ir.mentor_lastName,
        ir.feedbackSC,
        u.firstName AS student_firstname,
        u.lastName AS student_lastname
      FROM internship_requests ir
      JOIN users u ON u.id = ir.student_id
      WHERE ir.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Internship request not found" });
    }

    const request = rows[0];

    if (role === "student" && request.student_id !== userId) {
      return res.status(403).json({ error: "No access to this request" });
    }

    if (role === "internship_committee") {
      return res.json(request);
    }

    if (role !== "student") {
      return res.status(403).json({ error: "Insufficient rights" });
    }

    return res.json(request);

  } catch (err) {
    console.error("Error fetching internship request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* ============================================================
   GET ALL: overzicht (MET JOIN STUDENT)
============================================================ */
async function getAll(req, res) {
  try {
    const [rows] = await req.db.query(
      `
      SELECT 
        ir.id,
        ir.student_id,
        ir.company,
        ir.description,
        DATE_FORMAT(ir.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(ir.end_date, '%Y-%m-%d') AS end_date,
        ir.status,
        u.firstName AS student_firstname,
        u.lastName AS student_lastname
      FROM internship_requests ir
      JOIN users u ON u.id = ir.student_id
      ORDER BY ir.request_date DESC
      `
    );

    return res.json(rows);

  } catch (err) {
    console.error("Error fetching internship requests:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* ============================================================
   PATCH: student past aanvraag aan
============================================================ */
async function updateByStudent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await req.db.query(
      "SELECT * FROM internship_requests WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Internship request not found" });
    }

    const request = rows[0];

    if (request.student_id !== userId) {
      return res.status(403).json({ error: "No access to this request" });
    }

    if (request.status !== "adjustment_required") {
      return res.status(403).json({
        error: "Request cannot be modified unless status = adjustment_required"
      });
    }

    const {
      company,
      description,
      start_date,
      end_date,
      mentor_firstName,
      mentor_lastName
    } = req.body;

    if (!company || !description || !start_date || !end_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isValidDateString(start_date) || !isValidDateString(end_date)) {
      return res.status(400).json({ error: "Invalid date format (expected YYYY-MM-DD)" });
    }

    if (start_date >= end_date) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }

    await req.db.query(
      `
      UPDATE internship_requests
      SET 
        company = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        mentor_firstName = ?,
        mentor_lastName = ?,
        status = 'submitted'
      WHERE id = ?
      `,
      [
        company,
        description,
        start_date,
        end_date,
        mentor_firstName || null,
        mentor_lastName || null,
        id
      ]
    );

    const [updated] = await req.db.query(
      `
      SELECT 
        ir.id,
        ir.student_id,
        ir.internship_committee_id,
        ir.company,
        ir.description,
        DATE_FORMAT(ir.request_date, '%Y-%m-%d') AS request_date,
        DATE_FORMAT(ir.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(ir.end_date, '%Y-%m-%d') AS end_date,
        ir.status,
        ir.mentor_firstName,
        ir.mentor_lastName,
        ir.feedbackSC,
        u.firstName AS student_firstname,
        u.lastName AS student_lastname
      FROM internship_requests ir
      JOIN users u ON u.id = ir.student_id
      WHERE ir.id = ?
      `,
      [id]
    );

    return res.status(200).json(updated[0]);

  } catch (err) {
    console.error("Error updating internship request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* ============================================================
   PATCH: commissie wijzigt status + feedback
============================================================ */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, feedbackSC } = req.body;

  const committeeMemberId = req.user?.id;
  const userRole = req.user?.role;

  if (!committeeMemberId || userRole !== "internship_committee") {
    return res.status(403).json({ error: "Only internship committee members can update the status" });
  }

  if (!status) {
    return res.status(400).json({ error: "Status is mandatory" });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  if ((status === "adjustment_required" || status === "rejected") && !feedbackSC) {
    return res.status(400).json({
      error: "Feedback is mandatory when the status is adjustment_required or rejected"
    });
  }

  try {
    const [rows] = await req.db.query(
      "SELECT * FROM internship_requests WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Internship request not found" });
    }

    const existing = rows[0];

    await req.db.query(
      `
      UPDATE internship_requests
      SET status = ?, feedbackSC = ?, internship_committee_id = ?
      WHERE id = ?
      `,
      [status, feedbackSC || null, committeeMemberId, id]
    );

    // ⭐ Automatische internship-aanmaak bij approved
    if (status === "approved") {
      const [existingInternship] = await req.db.query(
        "SELECT * FROM internships WHERE internship_request_id = ?",
        [id]
      );

      if (existingInternship.length === 0) {
        await req.db.query(
          `
          INSERT INTO internships 
          (internship_request_id, start_date, end_date, mentor_id, teacher_id)
          VALUES (?, ?, ?, NULL, NULL)
          `,
          [
            existing.id,
            existing.start_date,
            existing.end_date
          ]
        );
      }
    }

    const [updated] = await req.db.query(
      `
      SELECT 
        ir.id,
        ir.student_id,
        ir.internship_committee_id,
        ir.company,
        ir.description,
        DATE_FORMAT(ir.request_date, '%Y-%m-%d') AS request_date,
        DATE_FORMAT(ir.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(ir.end_date, '%Y-%m-%d') AS end_date,
        ir.status,
        ir.mentor_firstName,
        ir.mentor_lastName,
        ir.feedbackSC,
        u.firstName AS student_firstname,
        u.lastName AS student_lastname
      FROM internship_requests ir
      JOIN users u ON u.id = ir.student_id
      WHERE ir.id = ?
      `,
      [id]
    );

    return res.status(200).json(updated[0]);

  } catch (err) {
    console.error("Error updating internship request status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getById,
  getAll,
  updateByStudent,
  updateStatus
};
