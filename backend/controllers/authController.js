const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { username, password } = req.body;


  if (!username || !password) {
    return res.status(400).json({
      message: "Username en password are required"
    });
  }



  userModel.getUserByUsername(username, async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }



    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const user = results[0];


    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive"
      });
    }

    // Password check
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // 6. JWT token 
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // login response
    res.json({
      message: "Login succesful",
      token: token,
      role: user.role,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email
      }
    });
  });
};