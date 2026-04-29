const express = require("express");
const router = express.Router();

// Helper: check of datum geldig is
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// GET all internship requests
router.get("/", async (req, res) => {
    try {
        const [results] = await req.db.query("SELECT * FROM internship_requests");
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// POST new internship request (student)
router.post("/", async (req, res) => {
    const {
        student_id,
        company,
        mentor_firstName,
        mentor_lastName,
        description,
        start_date,
        end_date
        // ⚠️ internship_committee_id wordt hier NIET meer toegelaten
    } = req.body;

    // 1. Verplichte velden controleren
    if (!student_id || !company || !description || !start_date || !end_date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Datumformaat controleren
    if (!isValidDate(start_date) || !isValidDate(end_date)) {
        return res.status(400).json({ error: "Invalid date format" });
    }

    // 3. start_date < end_date
    if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({
            error: "Start date must be before end date"
        });
    }

    try {
        // 4. Check of student bestaat
        const [student] = await req.db.query(
            "SELECT * FROM users WHERE id = ?",
            [student_id]
        );

        if (student.length === 0) {
            return res.status(404).json({ error: "Student does not exist" });
        }

        // 5. Insert: committee_id is ALTIJD NULL bij aanmaak
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

module.exports = router;