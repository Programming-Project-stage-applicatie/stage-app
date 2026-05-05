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

exports.createUser = async (req, res) => {
  const pool = req.db;
  let connection;

  const {
    firstname,
    lastname,
    email,
    username,
    password,
    role,
    status,
    studyprogram
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !username ||
    !password ||
    !role ||
    !status
  ) {
    return res.status(400).json({
      code: "REQUIRED_FIELDS"
    });
  }

  try {
    // ✅ checks uit develop
    userModel.getUserByEmail(email, async (err, emailResult) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (emailResult.length > 0) {
        return res.status(400).json({ code: "EMAIL_TAKEN" });
      }

      userModel.getUserByUsername(username, async (err, usernameResult) => {
        if (err) {
          return res.status(500).json({ message: "Server error" });
        }

        if (usernameResult.length > 0) {
          return res.status(400).json({ code: "USERNAME_TAKEN" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [userResult] = await connection.execute(
          `
          INSERT INTO users
          (firstname, lastname, email, username, password, role, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            firstname,
            lastname,
            email,
            username,
            hashedPassword,
            role,
            status
          ]
        );

        const userId = userResult.insertId;

        // ✅ ENIGE TOEVOEGING VAN DEZE FEATURE
        switch (role) {
          case "admin":
            await connection.execute(
              "INSERT INTO admins (user_id) VALUES (?)",
              [userId]
            );
            break;

          case "student":
            await connection.execute(
              "INSERT INTO students (user_id, studyprogram) VALUES (?, ?)",
              [userId, studyprogram || "Onbekend"]
            );
            break;

          case "teacher":
            await connection.execute(
              "INSERT INTO teachers (user_id) VALUES (?)",
              [userId]
            );
            break;

          case "mentor":
            await connection.execute(
              "INSERT INTO mentors (user_id) VALUES (?)",
              [userId]
            );
            break;

          case "internship_committee":
            await connection.execute(
              "INSERT INTO internship_committees (user_id) VALUES (?)",
              [userId]
            );
            break;
        }

        await connection.commit();

        res.status(201).json({
          message: "User created successfully",
          userId
        });
      });
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create user failed:", error);
    res.status(500).json({
      message: "Failed to create user"
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, username, role, status } = req.body;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !username ||
    !role ||
    !status
  ) {
    return res.status(400).json({
      code: "REQUIRED_FIELDS"
    });
  }

  userModel.getUserByEmailExceptId(email, id, (err, emailResult) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (emailResult.length > 0) {
      return res.status(400).json({ code: "EMAIL_TAKEN" });
    }

    userModel.getUserByUsernameExceptId(username, id, (err, usernameResult) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (usernameResult.length > 0) {
        return res.status(400).json({ code: "USERNAME_TAKEN" });
      }

      userModel.updateUser(
        id,
        { firstname, lastname, email, username, role, status },
        (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Failed to update user"
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: "User not found"
            });
          }

          return res.status(200).json({
            message: "User updated"
          });
        }
      );
    });
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  userModel.deleteUser(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete user"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(204).send();
  });
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      code: "PASSWORD_REQUIRED"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    userModel.updatePassword(id, hashedPassword, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to reset password"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      return res.status(200).json({
        message: "Password updated"
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Password hashing failed"
    });
  }
};