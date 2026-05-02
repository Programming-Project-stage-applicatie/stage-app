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
    return res.status(400).json({ error: 'Status is verplicht' });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Ongeldige status' });
  }

  // 3. Feedback verplicht bij adjustment_required / rejected
  if ((status === 'adjustment_required' || status === 'rejected') && !feedbackSC) {
    return res.status(400).json({
      error: 'Feedback is verplicht wanneer de status adjustment_required of rejected is'
    });
  }

  try {
    // 4. Bestaat de stageaanvraag?
    const [rows] = await req.db.query(
      'SELECT * FROM internship_requests WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stageaanvraag niet gevonden' });
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

    // 6. Gewijzigde aanvraag teruggeven
    const [updated] = await req.db.query(
      'SELECT * FROM internship_requests WHERE id = ?',
      [id]
    );

    return res.status(200).json(updated[0]);
  } catch (err) {
    console.error('Error updating internship request status:', err);
    return res.status(500).json({ error: 'Interne serverfout' });
  }
}

module.exports = {
  updateStatus
};
