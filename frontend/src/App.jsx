import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
// Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import FinalEvaluationOverview from "./pages/FinalEvaluationOverviewTeacher";
import MentorDashboard from "./pages/MentorDashboard";
import InternshipCommitteeDashboard from "./pages/InternshipCommitteeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FinalEvaluationOverviewAdmin from "./pages/FinalEvaluationOverviewAdmin";
import FinaleEvaluatieAdmin from "./pages/FinaleEvaluatieAdmin";


import FinaleEvaluatieDocent from "./pages/FinaleEvaluatieDocent";
import FinaleEvaluatie from "./pages/FinaleEvaluatieStudent";


import AdminUsers from "./pages/AdminUsers";
import AdminInternshipDetail from "./pages/AdminInternshipDetail";


import NewInternshipRequest from "./pages/NewInternshipRequest";
import StudentRequestDetail from "./pages/StudentRequestDetail";
import StudentInternshipDetail from "./pages/StudentInternshipDetail";


import InternshipCommitteeOverview from "./pages/InternshipCommitteeOverview";
import InternshipCommitteeRequestDetail from "./pages/InternshipCommitteeRequestDetail";

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
        <Route path="/dashboard/internship-committee" element={<InternshipCommitteeDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        {/* Teacher pages */}
        <Route path="/teacher/internships/:id/evaluation" element={<FinaleEvaluatieDocent />} />
        <Route path="/teacher/final-evaluation-overview" element={<FinalEvaluationOverview />} />
        <Route path="/finale-evaluatie" element={<FinaleEvaluatie />} />
        {/* Student pages */}
        <Route path="/student/new-request" element={<NewInternshipRequest />} />
        <Route path="/student/request/:id" element={<StudentRequestDetail />} />
        <Route path="/student/internships/:id" element={<StudentInternshipDetail />} />
        {/* Admin pages */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/internships/:id" element={<AdminInternshipDetail />} />
        <Route path="/admin/final-evaluation-overview" element={<FinalEvaluationOverviewAdmin />} />
<Route path="/admin/internships/:id/evaluation" element={<FinaleEvaluatieAdmin />} />
        {/* Commissie pages */}
        <Route path="/committee/overview" element={<InternshipCommitteeOverview />} />
        <Route path="/committee/requests/:id/overview" element={<InternshipCommitteeRequestDetail />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
