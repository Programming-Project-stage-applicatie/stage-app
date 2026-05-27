import { useState, useEffect } from "react";
import StudentLogbooks from "../logbooks/StudentLogbooks";

export default function StudentLogbooksPage() {
  const [logbooks, setLogbooks] = useState([]);
  const [internshipId, setInternshipId] = useState(null);

  const fetchLogbooks = () => {
    const token = localStorage.getItem("token");
  fetch("http://localhost:3000/api/logbooks",  {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLogbooks(data);
        if (data.length > 0) setInternshipId(data[0].internship_id);
      })
      .catch((err) => console.error("Fout bij ophalen logbooks:", err));
  };

  useEffect(() => { fetchLogbooks(); }, []);

  return (
    <StudentLogbooks
      logbooks={logbooks}
      internshipId={internshipId}
      onRefresh={fetchLogbooks}
    />
  );
}