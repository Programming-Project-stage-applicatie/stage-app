const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path"); // ← hier bovenaan
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ← hier na express.json

const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
app.use((req, res, next) => {
  req.db = db;
  next();
});

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const authenticateJWT = require("./middleware/authenticateJWT");

const internshipRequestsRoutes = require("./routes/internship_requests");
app.use("/internship-requests", authenticateJWT, internshipRequestsRoutes);

const userRoutes = require("./routes/users");
app.use("/users", authenticateJWT, userRoutes);

const internshipRoutes = require("./routes/internships");
app.use("/internships", authenticateJWT, internshipRoutes);

const finaleEvaluatieRoutes = require("./routes/finale_evaluatie");
app.use("/api/finale-evaluatie", authenticateJWT, finaleEvaluatieRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
