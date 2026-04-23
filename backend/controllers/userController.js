const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getAllUsers = (req, res) => {
  userModel.getAllUsers((err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch users"
      });
    }
    res.status(200).json(results);
  });
};

const VALID_ROLES = [
  "admin",
  "student",
  "teacher",
  "mentor",
  "internship_committee"
];

const VALID_STATUS = ["active", "inactive"];

exports.createUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      username,
      password,
      role,
      status
    } = req.body;

    if (!firstname || !lastname || !email || !username || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const userStatus = status || "active";
    if (!VALID_STATUS.includes(userStatus)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    userModel.getUserByEmail(email, async (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to check existing user"
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          message: "User with this email already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        firstname,
        lastname,
        email,
        username,
        password: hashedPassword,
        role,
        status: userStatus
      };

      userModel.createUser(user, (err, results) => {
        if (err) {

          // Duplicate key (extra veiligheid)
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              message: "User with this email already exists"
            });
          }

          if (
            err.code === "ER_DATA_TRUNCATED" ||
            err.code === "ER_BAD_NULL_ERROR"
          ) {
            return res.status(400).json({
              message: "Invalid user data"
            });
          }

          // Echte serverfout
          return res.status(500).json({
            message: "Failed to create user"
          });
        }

        res.status(201).json({
          message: "User created successfully",
          userId: results.insertId
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected server error"
    });
  }
};