const ALLOWED_STATUSES = [
  'submitted',
  'approved',
  'adjustment_required',
  'rejected'
];

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, feedbackSC } = req.body;

  const committeeMemberId = req.user?.id;
  const userRole = req.user?.role;

  // 1. Enkel internship_committee mag dit doen
  if (!committeeMemberId || userRole !== 'internship_committee') {
    return res.status(403).json({ error: 'Only internship committee members can update the status' });
  }

  // 2. Basisvalidatie status
  if (!status) {
    return res.status(400).json({ error: 'Status is mandatory' });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // 3. Feedback verplicht bij adjustment_required / rejected
  if ((status === 'adjustment_required' || status === 'rejected') && !feedbackSC) {
    return res.status(400).json({
      error: 'Feedback is mandatory when the status is adjustment_required or rejected'
    });
  }

  try {
    // 4. Bestaat de stageaanvraag?
    const [rows] = await req.db.query(
      'SELECT * FROM internship_requests WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Internship request not found' });
    }

    // 5. Update uitvoeren + koppeling met committee-lid
    await req.db.query(
      `
      UPDATE internship_requests
      SET status = ?, feedbackSC = ?, internship_committee_id = ?
      WHERE id = ?
      `,
      [status, feedbackSC || null, committeeMemberId, id]
    );

    // 6. Gewijzigde aanvraag ophalen
    const [updated] = await req.db.query(
      'SELECT * FROM internship_requests WHERE id = ?',
      [id]
    );

    // ⭐ 7. NIEUW: automatisch internship aanmaken bij approved
    if (status === "approved") {

      // 7.1 Check of er al een internship bestaat
      const [existing] = await req.db.query(
        "SELECT * FROM internships WHERE internship_request_id = ?",
        [id]
      );

      // 7.2 Als er nog geen internship bestaat → aanmaken
      if (existing.length === 0) {
        await req.db.query(
          `
          INSERT INTO internships (internship_request_id, start_date, end_date, mentor_id, teacher_id)
          VALUES (?, ?, ?, NULL, NULL)
          `,
          [
            updated[0].id,
            updated[0].start_date,
            updated[0].end_date
          ]
        );
      }
    }

    // 8. Response teruggeven
    return res.status(200).json(updated[0]);

  } catch (err) {
    console.error('Error updating internship request status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  updateStatus
};
