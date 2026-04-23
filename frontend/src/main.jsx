import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import FinaleEvaluatie from "./pages/FinaleEvaluatie.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/finale-evaluatie" />} />
        <Route path="/finale-evaluatie" element={<FinaleEvaluatie />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);