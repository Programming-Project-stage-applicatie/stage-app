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

import NewInternshipRequest from "./pages/NewInternshipRequest";

// ⭐ Nieuwe import voor jouw eigen detailpagina
import StudentRequestDetail from "./pages/StudentRequestDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/mentor" element={<MentorDashboard />} />
        <Route
          path="/dashboard/internship-committee"
          element={<InternshipCommitteeDashboard />}
        />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        {/* Admin pages */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/internships/:id" element={<AdminInternshipDetail />} />

        {/* Student pages */}
        <Route path="/student/new-request" element={<NewInternshipRequest />} />

        {/* ⭐ Jouw nieuwe detailpagina */}
        <Route path="/student/request/:id" element={<StudentRequestDetail />} />

        {/* Tiffany’s admin/student detailpagina blijft bestaan */}
        <Route path="/student/internships/:id" element={<StudentInternshipDetail />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
