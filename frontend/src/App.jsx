import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
// Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import FinaleEvaluatieMentor from "./pages/FinaleEvaluatieMentor";
import InternshipCommitteeDashboard from "./pages/InternshipCommitteeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FinaleEvaluatie from "./pages/FinaleEvaluatieStudent";
// Admin pages
import AdminUsers from "./pages/AdminUsers";
import AdminInternshipDetail from "./pages/AdminInternshipDetail";
// Student pages
import NewInternshipRequest from "./pages/NewInternshipRequest";
import StudentRequestDetail from "./pages/StudentRequestDetail";
import StudentInternshipDetail from "./pages/StudentInternshipDetail";
// Commissie pages (M10 + M11)
import InternshipCommitteeOverview from "./pages/InternshipCommitteeOverview";
import InternshipCommitteeRequestDetail from "./pages/InternshipCommitteeRequestDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/mentor" element={<MentorDashboard />} />
        <Route path="/mentor/finale-evaluatie" element={<FinaleEvaluatieMentor />} />
        <Route path="/dashboard/internship-committee" element={<InternshipCommitteeDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/finale-evaluatie" element={<FinaleEvaluatie />} />
        <Route path="/student/new-request" element={<NewInternshipRequest />} />
        <Route path="/student/request/:id" element={<StudentRequestDetail />} />
        <Route path="/student/internships/:id" element={<StudentInternshipDetail />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/internships/:id" element={<AdminInternshipDetail />} />
        <Route path="/committee/overview" element={<InternshipCommitteeOverview />} />
        <Route path="/committee/requests/:id/overview" element={<InternshipCommitteeRequestDetail />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
