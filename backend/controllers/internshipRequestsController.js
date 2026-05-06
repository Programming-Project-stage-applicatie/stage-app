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
   GET: detail van één stageaanvraag (met DATE_FORMAT)
   ============================================================ */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await req.db.query(
      `
      SELECT 
        id,
        student_id,
        internship_committee_id,
        company,
        description,
        DATE_FORMAT(request_date, '%Y-%m-%d') AS request_date,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        status,
        mentor_firstName,
        mentor_lastName,
        feedbackSC
      FROM internship_requests
      WHERE id = ?
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
   PATCH: student past aanvraag aan (met DATE_FORMAT)
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
        id,
        student_id,
        internship_committee_id,
        company,
        description,
        DATE_FORMAT(request_date, '%Y-%m-%d') AS request_date,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        status,
        mentor_firstName,
        mentor_lastName,
        feedbackSC
      FROM internship_requests
      WHERE id = ?
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
   PATCH: commissie wijzigt status + feedback (met DATE_FORMAT)
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

    await req.db.query(
      `
      UPDATE internship_requests
      SET status = ?, feedbackSC = ?, internship_committee_id = ?
      WHERE id = ?
      `,
      [status, feedbackSC || null, committeeMemberId, id]
    );

    const [updated] = await req.db.query(
      `
      SELECT 
        id,
        student_id,
        internship_committee_id,
        company,
        description,
        DATE_FORMAT(request_date, '%Y-%m-%d') AS request_date,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        status,
        mentor_firstName,
        mentor_lastName,
        feedbackSC
      FROM internship_requests
      WHERE id = ?
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
  updateByStudent,
  updateStatus
};
