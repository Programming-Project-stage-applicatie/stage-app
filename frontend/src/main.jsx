import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FinaleEvaluatie from "./pages/FinaleEvaluatieMentor.jsx";
import FinaleEvaluatieDocent from "./pages/FinaleEvaluatieDocent.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
     <Route path="/" element={<Navigate to="/finale-evaluatie-docent" />} />
        <Route path="/finale-evaluatie" element={<FinaleEvaluatie />} />
        <Route path="/finale-evaluatie-docent" element={<FinaleEvaluatieDocent />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);