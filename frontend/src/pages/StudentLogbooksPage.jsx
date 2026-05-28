import { useState, useEffect } from "react";
import StudentLogbooks from "../logbooks/StudentLogbooks";

export default function StudentLogbooksPage() {
  const [logbooks, setLogbooks] = useState([]);
  const [internshipId, setInternshipId] = useState(null);

  const fetchLogbooks = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/logbooks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLogbooks(data);
        if (data.length > 0) setInternshipId(data[0].internship_id);
      })
      .catch((err) => console.error("Fout bij ophalen logbooks:", err));
  };

  const fetchInternship = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3000/internships/student", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0) setInternshipId(data[0].id);
    }
  };

  useEffect(() => {
    fetchLogbooks();
    fetchInternship();
  }, []);

  return (
    <StudentLogbooks
      logbooks={logbooks}
      internshipId={internshipId}
      onRefresh={fetchLogbooks}
    />
  );
}
