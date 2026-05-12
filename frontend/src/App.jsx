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
import TeacherLogbookOverview from "./pages/TeacherLogbookOverview";
import TeacherStudentLogbooks from "./pages/TeacherStudentLogbooks";
import TeacherLogbookDetail from "./pages/TeacherLogbookDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/student/new-request" element={<NewInternshipRequest />} />
        <Route path="/student/internships/:id" element={<StudentInternshipDetail />} />

        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        {/* ✅ Overzicht van alle studenten */}
        <Route path="/teacher/logbooks" element={<TeacherLogbookOverview />} />
        {/* ✅ Logboeken van één student */}
        <Route path="/logbooks/internship/:internshipId" element={<TeacherStudentLogbooks />} />
        {/* ✅ Detail van één logboek */}
        <Route path="/logbook/detail/:id" element={<TeacherLogbookDetail />} />

        <Route path="/dashboard/mentor" element={<MentorDashboard />} />
        <Route path="/dashboard/internship-committee" element={<InternshipCommitteeDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/internships/:id" element={<AdminInternshipDetail />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;