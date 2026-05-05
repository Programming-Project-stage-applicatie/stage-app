const ALLOWED_STATUSES = [
  "submitted",
  "approved",
  "adjustment_required",
  "rejected"
];

/* ============================================================
   GET: detail van één stageaanvraag
   ============================================================ */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await req.db.query(
      "SELECT * FROM internship_requests WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Internship request not found" });
    }

    const request = rows[0];

    // Student mag enkel zijn eigen aanvraag zien
    if (role === "student" && request.student_id !== userId) {
      return res.status(403).json({ error: "No access to this request" });
    }

    // Commissie mag alles zien
    if (role === "internship_committee") {
      return res.json(request);
    }

    // Andere rollen niet toegestaan
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
   PATCH: student past aanvraag aan (alleen bij adjustment_required)
   ============================================================ */
async function updateByStudent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Bestaat de aanvraag?
    const [rows] = await req.db.query(
      "SELECT * FROM internship_requests WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Internship request not found" });
    }

    const request = rows[0];

    // 2. Student moet eigenaar zijn
    if (request.student_id !== userId) {
      return res.status(403).json({ error: "No access to this request" });
    }

    // 3. Status moet adjustment_required zijn
    if (request.status !== "adjustment_required") {
      return res.status(403).json({
        error: "Request cannot be modified unless status = adjustment_required"
      });
    }

    // 4. Velden uit body
    const {
      company,
      description,
      start_date,
      end_date,
      mentor_firstName,
      mentor_lastName
    } = req.body;

    // 5. Validatie verplichte velden
    if (!company || !description || !start_date || !end_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 6. Datumvalidatie
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }

    // 7. Update uitvoeren (zonder teacher velden)
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

    // 8. Gewijzigde aanvraag teruggeven
    const [updated] = await req.db.query(
      "SELECT * FROM internship_requests WHERE id = ?",
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

    await req.db.query(
      `
      UPDATE internship_requests
      SET status = ?, feedbackSC = ?, internship_committee_id = ?
      WHERE id = ?
      `,
      [status, feedbackSC || null, committeeMemberId, id]
    );

    const [updated] = await req.db.query(
      "SELECT * FROM internship_requests WHERE id = ?",
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
