const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------------------------------------------------
   DATABASE CONNECTIE (POOL - AANBEVOLEN)
   ⭐ FIX TOEGEVOEGD: dateStrings: true
--------------------------------------------------------- */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,          // <-- BELANGRIJK: voorkomt timezone shift
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* ---------------------------------------------------------
   DATABASE BESCHIKBAAR MAKEN IN REQUEST
--------------------------------------------------------- */
app.use((req, res, next) => {
  req.db = db;
  next();
});

/* ---------------------------------------------------------
   AUTH ROUTES (GEEN JWT NODIG)
--------------------------------------------------------- */
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

/* ---------------------------------------------------------
   JWT AUTHENTICATIE (VANAF HIER VERPLICHT)
--------------------------------------------------------- */
const authenticateJWT = require("./middleware/authenticateJWT");
app.use(authenticateJWT);

/* ---------------------------------------------------------
   BEVEILIGDE ROUTES
--------------------------------------------------------- */
const internshipRequestsRoutes = require("./routes/internship_requests");
app.use("/internship-requests", internshipRequestsRoutes);

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

/* ---------------------------------------------------------
   TEST ROUTE
--------------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* ---------------------------------------------------------
   SERVER STARTEN
--------------------------------------------------------- */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
