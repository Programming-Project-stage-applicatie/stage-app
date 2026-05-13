import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
<<<<<<< HEAD
=======

// Dashboards
>>>>>>> origin/develop
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import InternshipCommitteeDashboard from "./pages/InternshipCommitteeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FinaleEvaluatie from "./pages/FinaleEvaluatie";

// Admin pages
import AdminUsers from "./pages/AdminUsers";
import AdminInternshipDetail from "./pages/AdminInternshipDetail";

// Student pages
import NewInternshipRequest from "./pages/NewInternshipRequest";
import StudentRequestDetail from "./pages/StudentRequestDetail";
import StudentInternshipDetail from "./pages/StudentInternshipDetail";

// Commissie pages (M10 + M11)
import InternshipCommitteeOverview from "./pages/InternshipCommitteeOverview";   // M10
import InternshipCommitteeRequestDetail from "./pages/InternshipCommitteeRequestDetail"; // M11

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
=======

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
>>>>>>> origin/develop
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/mentor" element={<MentorDashboard />} />
        <Route path="/dashboard/internship-committee" element={<InternshipCommitteeDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
<<<<<<< HEAD
        <Route path="/finale-evaluatie" element={<FinaleEvaluatie />} />
=======

        {/* Student pages */}
        <Route path="/student/new-request" element={<NewInternshipRequest />} />
        <Route path="/student/request/:id" element={<StudentRequestDetail />} />
        <Route path="/student/internships/:id" element={<StudentInternshipDetail />} />

        {/* Admin pages */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/internships/:id" element={<AdminInternshipDetail />} />

        {/* Commissie pages */}
        {/* M10 – Overzicht */}
        <Route
          path="/committee/overview"
          element={<InternshipCommitteeOverview />}
        />

        {/* M11 – Detail + beoordeling */}
        <Route
          path="/committee/requests/:id/overview"
          element={<InternshipCommitteeRequestDetail />}
        />

        {/* Catch-all */}
>>>>>>> origin/develop
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}
<<<<<<< HEAD
export default App;
=======

export default App;
>>>>>>> origin/develop
