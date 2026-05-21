const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateJWT = require("../middleware/authenticateJWT");
const requireAdmin = require("../middleware/requireAdmin");

// ⭐ Student / ingelogde gebruiker
router.get("/me", authenticateJWT, userController.getMe);

// ⭐ Admin-only routes
router.get("/", authenticateJWT, requireAdmin, userController.getAllUsers);
router.post("/", authenticateJWT, requireAdmin, userController.createUser);

router.delete("/:id", authenticateJWT, requireAdmin, userController.deleteUser);
router.put("/:id", authenticateJWT, requireAdmin, userController.updateUser);
router.put("/:id/password", authenticateJWT, requireAdmin, userController.resetPassword);

module.exports = router;