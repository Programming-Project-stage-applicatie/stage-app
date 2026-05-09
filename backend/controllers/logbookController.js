const db = require("../db");

exports.getLogbooksByInternship = (req, res) => {
  const internshipId = req.params.internshipId;

  console.log("Fetch logbooks for internship:", internshipId);

  db.query(
    `
    SELECT 
      id,
      week,
      status
    FROM logbooks
    WHERE internship_id = ?
    ORDER BY week ASC
    `,
    [internshipId],
    (err, results) => {
      if (err) {
        console.error("Fetch logbooks failed:", err);
        return res.status(500).json({
          message: "Error fetching logbooks"
        });
      }

      console.log("Results:", results);
      res.json(results);
    }
  );
};

exports.getLogbookDetail = (req, res) => {
  const logbookId = req.params.id;

  db.query(
    `
    SELECT 
      id,
      week,
      tasks,
      reflection,
      problems,
      feedback,
      status
    FROM logbooks
    WHERE id = ?
    `,
    [logbookId],
    (err, results) => {
      if (err) {
        console.error("Fetch logbook detail failed:", err);
        return res.status(500).json({
          message: "Error fetching logbook detail"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Logbook not found"
        });
      }

      res.json(results[0]);
    }
  );
};