const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");


const authenticateJWT = require("../middleware/authenticateJWT");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/", authenticateJWT, requireAdmin, userController.getAllUsers);
router.post("/", authenticateJWT, requireAdmin, userController.createUser);
router.delete("/:id", userController.deleteUser);
router.put("/:id", userController.updateUser);
router.put("/:id/password", userController.resetPassword);

module.exports = router;