const db = require("../db");

module.exports = {
  getAllUsers(callback) {
    db.query(
      "SELECT id, firstname, lastname, email, username, role, status FROM users",
      callback
    );
  },

  createUser(user, callback) {
    db.query(
      "INSERT INTO users (firstname, lastname, email, username, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user.firstname,
        user.lastname,
        user.email,
        user.username,
        user.password,
        user.role,
        user.status
      ],
      callback
    );
  },

  getUserByEmail(email, callback) {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
  },

  getUserByUsername(username, callback) {
    db.query("SELECT * FROM users WHERE username = ?", [username], callback);
  }
};
