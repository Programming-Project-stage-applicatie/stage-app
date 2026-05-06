import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";

import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import InternshipCommitteeDashboard from "./pages/InternshipCommitteeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminInternshipDetail from "./pages/AdminInternshipDetail";
import StudentInternshipDetail from "./pages/StudentInternshipDetail";

// ⭐ Nieuwe import voor jouw nieuwe pagina
import NewInternshipRequest from "./pages/NewInternshipRequest";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard/student" element={<StudentDashboard />} />
        
        {/* ⭐ Nieuwe route voor nieuwe stageaanvraag */}
        <Route path="/student/new-request" element={<NewInternshipRequest />} />

        <Route path="/student/internships/:id" element={<StudentInternshipDetail />} />

        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/mentor" element={<MentorDashboard />} />
        <Route
          path="/dashboard/internship-committee"
          element={<InternshipCommitteeDashboard />}
        />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/internships/:id" element={<AdminInternshipDetail />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
