const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");


router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.delete("/:id", userController.deleteUser);
router.put("/:id", userController.updateUser);
router.put("/:id/password", userController.resetPassword);


module.exports = router;