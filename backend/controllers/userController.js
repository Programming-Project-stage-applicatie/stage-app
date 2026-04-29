const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");


exports.getAllUsers = (req, res) => {
  userModel.getAllUsers((err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
};

exports.createUser = async (req, res) => {
  const pool = req.db;
  let connection;

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    connection = await pool.getConnection();


    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      `
      INSERT INTO users
      (firstname, lastname, email, username, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        req.body.username,
        hashedPassword,
        req.body.role,
        req.body.status || "active"
      ]
    );

    const userId = userResult.insertId;

    switch (req.body.role) {
      case "admin":
        await connection.execute(
          "INSERT INTO admins (user_id) VALUES (?)",
          [userId]
        );
        break;

      case "student":
        await connection.execute(
          "INSERT INTO students (user_id, studyprogram) VALUES (?, ?)",
          [userId, req.body.studyprogram || "Onbekend"]
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
        throw new Error("Invalid role");
    }


    await connection.commit();

    res.status(201).json({
      message: "User created successfully",
      userId
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Create user failed:", error);

    res.status(500).json({
      message: "Failed to create user"
    });

  } finally {

    if (connection) connection.release();
  }
};