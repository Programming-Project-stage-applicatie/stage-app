const express = require("express");
const router = express.Router();

// GET all internship requests
router.get("/", (req, res) => {
    const sql = "SELECT * FROM internship_requests";

    req.db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});



// POST new internship request
router.post("/", (req, res) => {
    const {
        student_id,
        company,
        mentor_firstName,
        mentor_lastName,
        description,
        start_date,
        end_date,
        internship_committee_id
    } = req.body;

    // Verplichte velden controleren
    if (
        !student_id ||
        !company ||
        !description ||
        !start_date ||
        !end_date
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        INSERT INTO internship_requests 
        (student_id, company, mentor_firstName, mentor_lastName, description, start_date, end_date, internship_committee_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
    `;

    const values = [
        student_id,
        company,
        mentor_firstName || null,
        mentor_lastName || null,
        description,
        start_date,
        end_date,
        internship_committee_id|| null
    ];

    req.db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({
            message: "Internship request submitted successfully",
            request_id: result.insertId
        });
    });
});

module.exports = router;