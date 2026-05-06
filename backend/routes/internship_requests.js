const express = require("express");
const router = express.Router();

// Helper: check if date is valid
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// ------------------------------------------------------------
// GET internship requests (student sees only own requests)
// ------------------------------------------------------------
router.get("/", async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        let results;

        if (role === "student") {
            [results] = await req.db.query(
                "SELECT * FROM internship_requests WHERE student_id = ?",
                [userId]
            );
        } 
        else if (role === "internship_committee") {
            [results] = await req.db.query(
                "SELECT * FROM internship_requests"
            );
        } 
        else {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        res.json(results);

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ------------------------------------------------------------
// POST new internship request (student)
// ------------------------------------------------------------
router.post("/", async (req, res) => {
    const {
        student_id,
        company,
        mentor_firstName,
        mentor_lastName,
        description,
        start_date,
        end_date
    } = req.body;

    // Required fields
    if (!student_id || !company || !description || !start_date || !end_date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Date validation
    if (!isValidDate(start_date) || !isValidDate(end_date)) {
        return res.status(400).json({ error: "Invalid date format" });
    }

    if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({
            error: "Start date must be before end date"
        });
    }

    try {
        // Check if student exists
        const [student] = await req.db.query(
            "SELECT * FROM users WHERE id = ?",
            [student_id]
        );

        if (student.length === 0) {
            return res.status(404).json({ error: "Student does not exist" });
        }

        // Insert new internship request
        const sql = `
            INSERT INTO internship_requests 
            (student_id, company, mentor_firstName, mentor_lastName, description, request_date, start_date, end_date, internship_committee_id, status)
            VALUES (?, ?, ?, ?, ?, CURRENT_DATE(), ?, ?, NULL, 'submitted')
        `;

        const values = [
            student_id,
            company,
            mentor_firstName || null,
            mentor_lastName || null,
            description,
            start_date,
            end_date
        ];

        const [result] = await req.db.query(sql, values);

        res.status(201).json({
            message: "Internship request submitted successfully",
            request_id: result.insertId
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ------------------------------------------------------------
// PATCH: update status + feedback + committee assignment
// LOCK: cannot modify if status is approved OR rejected
// ------------------------------------------------------------
router.patch("/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, feedbackSC } = req.body;
    const committeeId = req.user.id;

    try {
        // 1. Check if request exists
        const [rows] = await req.db.query(
            "SELECT * FROM internship_requests WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Request not found" });
        }

        const existing = rows[0];

        // 2. LOCK: cannot modify finalized requests
        if (existing.status === "approved" || existing.status === "rejected") {
            return res.status(400).json({
                message: "This request has already been finalized and cannot be modified"
            });
        }

        // 3. Update request
        await req.db.query(
            `UPDATE internship_requests 
             SET status = ?, feedbackSC = ?, internship_committee_id = ?
             WHERE id = ?`,
            [status, feedbackSC, committeeId, id]
        );

        // 4. Auto-create internship when approved
        if (status === "approved") {
            const [existingInternship] = await req.db.query(
                "SELECT * FROM internships WHERE internship_request_id = ?",
                [id]
            );

            if (existingInternship.length === 0) {
                await req.db.query(
                    `INSERT INTO internships 
                     (internship_request_id, mentor_id, teacher_id, start_date, end_date)
                     VALUES (?, NULL, NULL, ?, ?)`,
                    [id, existing.start_date, existing.end_date]
                );
            }
        }

        res.json({
            id: existing.id,
            student_id: existing.student_id,
            internship_committee_id: committeeId,
            company: existing.company,
            description: existing.description,
            request_date: existing.request_date,
            start_date: existing.start_date,
            end_date: existing.end_date,
            status,
            mentor_firstName: existing.mentor_firstName,
            mentor_lastName: existing.mentor_lastName,
            feedbackSC
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
