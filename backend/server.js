const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

let db;

<<<<<<< HEAD
// MySQL connectie (promise-based)
async function initDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log("Verbonden met MySQL database");
  } catch (err) {
    console.error("MySQL fout:", err);
  }
}

initDB();

// Database beschikbaar maken voor routes
app.use((req, res, next) => {
  req.db = db;
  next();
=======
// Test connectie
db.connect((err) => {
  if (err) {
    console.log("MySQL error:", err);
    return;
  }
  console.log("Connected to MySQL database");
>>>>>>> 554fa7c2852acaff956bfe8d8ad920bbe85eb9c0
});

// Routes
const internshipRequestsRoutes = require("./routes/internship_requests");
app.use("/internship-requests", internshipRequestsRoutes);

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3000, () => {
<<<<<<< HEAD
  console.log("Server draait op http://localhost:3000");
});
=======
  console.log("Server running on http://localhost:3000");
});


>>>>>>> 554fa7c2852acaff956bfe8d8ad920bbe85eb9c0
