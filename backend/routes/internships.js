const express = require("express");
const router = express.Router();
const internshipController = require("../controllers/internshipController");
const authenticateJWT = require("../middleware/authenticateJWT");
const requireAdmin = require("../middleware/requireAdmin");


router.get("/student", authenticateJWT, internshipController.getStudentInternships);
router.get("/student/:id", authenticateJWT, internshipController.getStudentInternshipById);
router.get("/mentor", authenticateJWT, internshipController.getMentorInternships);
router.get("/teacher", authenticateJWT, internshipController.getTeacherInternships);
router.get("/", authenticateJWT, requireAdmin, internshipController.getAllInternships);
router.get("/:id", authenticateJWT, requireAdmin, internshipController.getInternshipById);
router.put("/:id/mentor", authenticateJWT, requireAdmin, internshipController.assignMentor);
router.put("/:id/teacher", authenticateJWT, requireAdmin, internshipController.assignTeacher);


module.exports = router;