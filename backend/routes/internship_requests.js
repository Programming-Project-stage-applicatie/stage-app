const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");

const internshipRequestsController = require("../controllers/internshipRequestsController");

// Helper: check if date is valid
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// ------------------------------------------------------------
// Alle routes hieronder vereisen JWT
// ------------------------------------------------------------
router.use(authenticateJWT);

// ------------------------------------------------------------
// GET /internship-requests/me  → student ziet eigen aanvragen
// ------------------------------------------------------------
router.get("/me", async (req, res) => {
    try {
        const studentId = req.user.id;

        const [rows] = await req.db.query(
            "SELECT * FROM internship_requests WHERE student_id = ? ORDER BY id DESC",
            [studentId]
        );

        res.json(rows);

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/* ============================================================
   GET: lijst van aanvragen
   - student ziet enkel eigen aanvragen
   - commissie ziet alles
============================================================ */
router.get("/", async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        let results;

        if (role === "student") {
            [results] = await req.db.query(
                "SELECT * FROM internship_requests WHERE student_id = ? ORDER BY id DESC",
                [userId]
            );
        } else if (role === "internship_committee") {
            [results] = await req.db.query(
                "SELECT * FROM internship_requests ORDER BY id DESC"
            );
        } else {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        res.json(results);

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/* ============================================================
   GET: detail van één aanvraag
============================================================ */
router.get("/:id", internshipRequestsController.getById);

/* ============================================================
   POST: nieuwe stageaanvraag door student
============================================================ */
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

/* ============================================================
   PATCH: student past aanvraag aan (alleen bij adjustment_required)
============================================================ */
router.patch("/:id", internshipRequestsController.updateByStudent);

/* ============================================================
   PATCH: commissie wijzigt status + feedback
   (auto‑internship‑aanmaak gebeurt in controller)
============================================================ */
router.patch("/:id/status", internshipRequestsController.updateStatus);

module.exports = router;
