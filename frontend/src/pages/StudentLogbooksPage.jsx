import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StudentLogbooks from "../logbooks/StudentLogbooks";

export default function StudentLogbooksPage() {
  const { internshipId: urlInternshipId } = useParams();
  const [logbooks, setLogbooks] = useState([]);
  const [internshipId, setInternshipId] = useState(urlInternshipId || null);
  const [internshipInfo, setInternshipInfo] = useState(null);

  const fetchLogbooks = () => {
    const token = localStorage.getItem("token");
    const url = urlInternshipId
      ? `http://localhost:3000/api/logbooks?internship_id=${urlInternshipId}`
      : `http://localhost:3000/api/logbooks`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLogbooks(data);
        if (!urlInternshipId && data.length > 0) setInternshipId(data[0].internship_id);
      })
      .catch((err) => console.error("Fout bij ophalen logbooks:", err));
  };

  const fetchInternship = async () => {
    const token = localStorage.getItem("token");
    if (urlInternshipId) {
      const res = await fetch(`http://localhost:3000/internships/student/${urlInternshipId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInternshipInfo(data);
      }
    } else {
      const res = await fetch("http://localhost:3000/internships/student", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setInternshipId(data[0].id);
      }
    }
  };

  useEffect(() => {
    fetchLogbooks();
    fetchInternship();
  }, []);

  return (
    <StudentLogbooks
      logbooks={logbooks}
      internshipId={internshipId || urlInternshipId}
      internshipInfo={internshipInfo}
      onRefresh={fetchLogbooks}
    />
  );
}