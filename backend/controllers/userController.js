const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getAllUsers = (req, res) => {
  userModel.getAllUsers((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.createUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role,
      status: req.body.status || "actief"
    };

    userModel.createUser(user, (err, results) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Gebruiker toegevoegd!", userId: results.insertId });
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

