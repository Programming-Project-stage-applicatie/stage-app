const express = require("express");
const router = express.Router();

// Controller voor status‑updates
const internshipRequestsController = require("../controllers/internshipRequestsController");

// Helper: check of datum geldig is
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// ------------------------------------------------------------
// GET internship requests (student ziet enkel eigen aanvragen)
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
            return res.status(403).json({ error: "Onvoldoende rechten" });
        }

        res.json(results);

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// ------------------------------------------------------------
// NEW: GET detail van één stageaanvraag
// ------------------------------------------------------------
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const role = req.user.role;

        const [rows] = await req.db.query(
            "SELECT * FROM internship_requests WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Aanvraag niet gevonden" });
        }

        const request = rows[0];

        // Student mag enkel zijn eigen aanvraag zien
        if (role === "student" && request.student_id !== userId) {
            return res.status(403).json({ error: "Geen toegang tot deze aanvraag" });
        }

        // Commissie mag alles zien
        if (role === "internship_committee") {
            return res.json(request);
        }

        // Andere rollen niet toegestaan
        if (role !== "student") {
            return res.status(403).json({ error: "Onvoldoende rechten" });
        }

        res.json(request);

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

    if (!student_id || !company || !description || !start_date || !end_date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isValidDate(start_date) || !isValidDate(end_date)) {
        return res.status(400).json({ error: "Invalid date format" });
    }

    if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({
            error: "Start date must be before end date"
        });
    }

    try {
        const [student] = await req.db.query(
            "SELECT * FROM users WHERE id = ?",
            [student_id]
        );

        if (student.length === 0) {
            return res.status(404).json({ error: "Student does not exist" });
        }

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
// NEW: PATCH student update (alleen bij adjustment_required)
// ------------------------------------------------------------
router.patch("/:id", internshipRequestsController.updateByStudent);

// ------------------------------------------------------------
// PATCH: update status + feedback + koppeling committee
// ------------------------------------------------------------
router.patch("/:id/status", internshipRequestsController.updateStatus);

module.exports = router;
