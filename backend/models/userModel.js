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
  },

  
  getUserByEmailExceptId(email, id, callback) {
    db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id],
      callback
    );
  },

  
  getUserByUsernameExceptId(username, id, callback) {
    db.query(
      "SELECT id FROM users WHERE username = ? AND id != ?",
      [username, id],
      callback
    );
  },

  deleteUser(id, callback) {
    db.query(
      "DELETE FROM users WHERE id = ?",
      [id],
      callback
    );
  },

  updateUser(id, user, callback) {
  
    db.query(
      `
        UPDATE users
        SET firstname = ?,
            lastname = ?,
            email = ?,
            username = ?,
            role = ?,
            status = ?
          WHERE id = ?
      `,
      [
        user.firstname,
        user.lastname,
        user.email,
        user.username,
        user.role,
        user.status,
        id],
      callback
    );
 },

  updatePassword(id, hashedPassword, callback) {
    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id],
      callback
    );
  }
};

