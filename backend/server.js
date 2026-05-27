const express = require("express");
const cors = require("cors");

const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------------------------------------------------
   DATABASE CONNECTIE (POOL - AANBEVOLEN)
   ⭐ FIX: dateStrings voorkomt timezone shifts
--------------------------------------------------------- */
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
app.use("/users", userRoutes);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);


const finaleEvaluatieRoutes = require("./routes/finale_evaluatie");
app.use("/api/finale-evaluatie", authenticateJWT, finaleEvaluatieRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});


const logbookRoutes = require("./routes/logbooks");
app.use("/api/logbooks", logbookRoutes);
const supervisorLogbookRoutes = require("./routes/supervisorLogbooks");
app.use("/api/supervisor", supervisorLogbookRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


