const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

// =========================
// GET ALL USERS (ADMIN)
// =========================
exports.getAllUsers = (req, res) => {
  const role = req.query.role;

  userModel.getAllUsers(role, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
};

// =========================
// GET LOGGED-IN USER (STUDENT / ANY ROLE)
// =========================
exports.getMe = async (req, res) => {
  const pool = req.db;
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        u.id,
        u.firstname,
        u.lastname,
        u.email,
        u.username,
        u.role,
        u.status,
        s.studyprogram
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      WHERE u.id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

// =========================
// CREATE USER (ADMIN)
// =========================
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
    !status ||
    (role === "student" && !studyprogram)
  ) {
    return res.status(400).json({
      code: "REQUIRED_FIELDS"
    });
  }

  try {
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
          [userId, studyprogram]
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

      default:
        await connection.rollback();
        return res.status(400).json({
          message: "Invalid role"
        });
    }

    await connection.commit();

    return res.status(201).json({
      message: "User created successfully",
      userId
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create user failed:", error);
    return res.status(500).json({
      message: "Failed to create user"
    });

  } finally {
    if (connection) connection.release();
  }
};

// =========================
// UPDATE USER (ADMIN)
// =========================
exports.updateUser = async (req, res) => {
  const pool = req.db;
  const userId = req.params.id;

  const {
    firstname,
    lastname,
    email,
    username,
    role,
    status,
    studyprogram
  } = req.body;

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

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    if (role === "student" && !studyprogram) {
      await connection.rollback();
      return res.status(400).json({
        code: "STUDYPROGRAM_REQUIRED"
      });
    }

    await connection.execute(
      `
      UPDATE users
      SET firstname = ?, lastname = ?, email = ?, username = ?, role = ?, status = ?
      WHERE id = ?
      `,
      [
        firstname,
        lastname,
        email,
        username,
        role,
        status,
        userId
      ]
    );

    if (role === "student") {
      const [studentRows] = await connection.execute(
        "SELECT user_id FROM students WHERE user_id = ?",
        [userId]
      );

      if (studentRows.length === 0) {
        await connection.execute(
          "INSERT INTO students (user_id, studyprogram) VALUES (?, ?)",
          [userId, studyprogram]
        );
      } else {
        await connection.execute(
          "UPDATE students SET studyprogram = ? WHERE user_id = ?",
          [studyprogram, userId]
        );
      }
    }

    await connection.commit();

    return res.status(200).json({
      message: "User updated successfully"
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Update user failed:", error);
    return res.status(500).json({
      message: "Failed to update user"
    });

  } finally {
    if (connection) connection.release();
  }
};

// =========================
// DELETE USER (ADMIN)
// =========================
exports.deleteUser = async (req, res) => {
  const pool = req.db;
  const userId = req.params.id;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const role = rows[0].role;

    switch (role) {
      case "admin":
        await connection.execute("DELETE FROM admins WHERE user_id = ?", [userId]);
        break;
      case "student":
        await connection.execute("DELETE FROM students WHERE user_id = ?", [userId]);
        break;
      case "teacher":
        await connection.execute("DELETE FROM teachers WHERE user_id = ?", [userId]);
        break;
      case "mentor":
        await connection.execute("DELETE FROM mentors WHERE user_id = ?", [userId]);
        break;
      case "internship_committee":
        await connection.execute(
          "DELETE FROM internship_committees WHERE user_id = ?",
          [userId]
        );
        break;
    }

    await connection.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    await connection.commit();

    return res.json({ message: "User deleted successfully" });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Delete user failed:", error);
    return res.status(500).json({
      message: "Failed to delete user"
    });

  } finally {
    if (connection) connection.release();
  }
};

// =========================
// RESET PASSWORD (ADMIN)
// =========================
exports.resetPassword = async (req, res) => {
  const pool = req.db;
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      code: "PASSWORD_REQUIRED"
    });
  }

  let connection;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    connection = await pool.getConnection();

    await connection.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    return res.status(200).json({
      message: "Password updated"
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Failed to reset password"
    });

  } finally {
    if (connection) connection.release();
  }
};
