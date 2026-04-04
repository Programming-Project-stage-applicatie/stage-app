const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connectie (MOET boven de middleware staan)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test connectie
db.connect((err) => {
  if (err) {
    console.log("MySQL fout:", err);
    return;
  }
  console.log("Verbonden met MySQL database");
});

// Database beschikbaar maken voor routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Routes
const internshipRequestsRoutes = require("./routes/internship_requests");
app.use("/internship-requests", internshipRequestsRoutes);

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend werkt");
});

app.listen(3000, () => {
  console.log("Server draait op http://localhost:3000");
});


