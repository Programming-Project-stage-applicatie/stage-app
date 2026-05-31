import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
// Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import FinalEvaluationOverview from "./pages/FinalEvaluationOverviewTeacher";
import MentorDashboard from "./pages/MentorDashboard";
import FinaleEvaluatieMentor from "./pages/FinaleEvaluatieMentor";
import InternshipCommitteeDashboard from "./pages/InternshipCommitteeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FinalEvaluationOverviewAdmin from "./pages/FinalEvaluationOverviewAdmin";
import FinaleEvaluatieAdmin from "./pages/FinaleEvaluatieAdmin";


import FinaleEvaluatieDocent from "./pages/FinaleEvaluatieDocent";
import FinaleEvaluatie from "./pages/FinaleEvaluatieStudent";
// Admin pages
import AdminUsers from "./pages/AdminUsers";
import AdminInternshipDetail from "./pages/AdminInternshipDetail";


import TeacherStudentLogbookList from "./pages/TeacherStudentLogbookList";
import TeacherLogbookDetail from "./pages/TeacherLogbookDetail";
import LogbookDetailView from "./pages/LogbookDetailView";
import SupervisorStudentLogbooks from "./pages/SupervisorStudentLogbooks";

import NewInternshipRequest from "./pages/NewInternshipRequest";
import StudentRequestDetail from "./pages/StudentRequestDetail";
import StudentInternshipDetail from "./pages/StudentInternshipDetail";
import StudentLogbooksPage from "./pages/StudentLogbooksPage";

import InternshipCommitteeOverview from "./pages/InternshipCommitteeOverview";
import InternshipCommitteeRequestDetail from "./pages/InternshipCommitteeRequestDetail";
import FinalEvaluationOverviewMentor from "./pages/FinalEvaluationOverviewMentor";

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
        {/* Mentor pages */}
        <Route path="/mentor/studenten" element={<FinalEvaluationOverviewMentor />} />
        <Route path="/mentor/finale-evaluatie" element={<FinaleEvaluatieMentor />} />
        <Route path="/mentor/finale-evaluatie/:studentId" element={<FinaleEvaluatieMentor />} />
      <Route path="/mentor/logbooks" element={<TeacherStudentLogbookList />} />
      <Route path="/supervisor/internship/:internshipId/logbooks" element={<SupervisorStudentLogbooks />} /> {/*voor beide docent en mentor*/}
   
        {/* Teacher pages */}
        <Route path="/teacher/internships/:id/evaluation" element={<FinaleEvaluatieDocent />} />
        <Route path="/teacher/final-evaluation-overview" element={<FinalEvaluationOverview />} />
         <Route path="/teacher/logbooks" element={<TeacherStudentLogbookList />} />
        {/* Student pages */}
        <Route path="/finale-evaluatie" element={<FinaleEvaluatie />} />
        <Route path="/student/new-request" element={<NewInternshipRequest />} />
        <Route path="/student/request/:id" element={<StudentRequestDetail />} />
        <Route path="/student/internships/:id" element={<StudentInternshipDetail />} />
        <Route path="/student/logbooks" element={<StudentLogbooksPage />} />
        <Route path="/student/logbooks/:internshipId" element={<StudentLogbooksPage />} />
        {/* Admin pages */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/internships/:id" element={<AdminInternshipDetail />} />


        <Route path="/logbooks/internship/:internshipId" element={<TeacherStudentLogbookList />}/>

        <Route path="/logbook/detail/:id" element={<TeacherLogbookDetail />}/>
        
<Route path="/supervisor/logbook/:id" element={<LogbookDetailView />} />

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
