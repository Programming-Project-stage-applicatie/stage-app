const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getAllUsers = (req, res) => {
  userModel.getAllUsers((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.createUser = (req, res) => {
  const {
    firstname,
    lastname,
    email,
    username,
    password,
    role,
    status
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

  userModel.getUserByEmail(email, (err, emailResult) => {
    if (err) {
      console.error("EMAIL CHECK ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (emailResult.length > 0) {
      return res.status(400).json({
        code: "EMAIL_TAKEN"
      });
    }

    userModel.getUserByUsername(username, (err, usernameResult) => {
      if (err) {
        console.error("USERNAME CHECK ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (usernameResult.length > 0) {
        return res.status(400).json({
          code: "USERNAME_TAKEN"
        });
      }

      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error("BCRYPT ERROR:", hashErr);
          return res.status(500).json({
            message: "Password hashing failed"
          });
        }

        const user = {
          firstname,
          lastname,
          email,
          username,
          password: hashedPassword,
          role,
          status
        };

        userModel.createUser(user, (err, result) => {
          if (err) {
            console.error("CREATE USER ERROR:", err);
            return res.status(500).json({
              message: "Failed to create user"
            });
          }

          return res.status(201).json({
            message: "User created successfully",
            userId: result.insertId
          });
        });
      });
    });
  });
};



exports.deleteUser = (req, res) => {
  const { id } = req.params;

  userModel.deleteUser(id, (err, result) => {
    if (err) {
      console.error("DELETE USER ERROR:", err);
      return res.status(500).json({
        message: "Failed to delete user"
      });
    }

    // result.affectedRows === 0 → user bestond niet
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(204).send();
  });

};




exports.updateUser = (req, res) => {
  const { id } = req.params;
  const {
    firstname,
    lastname,
    email,
    username,
    role,
    status
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

  userModel.getUserByEmailExceptId(email, id, (err, emailResult) => {
    if (err) {
      console.error("EMAIL CHECK ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (emailResult.length > 0) {
      return res.status(400).json({
        code: "EMAIL_TAKEN"
      });
    }

    userModel.getUserByUsernameExceptId(username, id, (err, usernameResult) => {
      if (err) {
        console.error("USERNAME CHECK ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (usernameResult.length > 0) {
        return res.status(400).json({
          code: "USERNAME_TAKEN"
        });
      }

      const user = {
        firstname,
        lastname,
        email,
        username,
        role,
        status
      };

      userModel.updateUser(id, user, (err, result) => {
        if (err) {
          console.error("UPDATE USER ERROR:", err);
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
      });
    });
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
        console.error("RESET PASSWORD ERROR:", err);
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
    console.error("BCRYPT ERROR:", error);
    return res.status(500).json({
      message: "Password hashing failed"
    });
  }
};

