import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//import usersRouter from "./routes/users.js";
//import logboekRouter from "./routes/logboek.js";
//import studentsRouter from "./routes/students.js";
//import internshipsRouter from "./routes/internships.js";
import finaleEvaluatieRouter from "./routes/finale_evaluatie.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Vite dev server
app.use(express.json());

// Routes
//app.use("/api/users", usersRouter);
//app.use("/api/logboek", logboekRouter);
//app.use("/api/students", studentsRouter);
//app.use("/api/internships", internshipsRouter);
app.use("/api/finale-evaluatie", finaleEvaluatieRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is actief 🚀" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server draait op http://localhost:${PORT}`);
});
