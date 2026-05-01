exports.getAllInternships = async (req, res) => {
  const pool = req.db;
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute(`
      SELECT
        internships.id,
        internships.mentor_id,
        internships.teacher_id,

        internship_requests.company,

        student.firstname AS student_firstname,
        student.lastname AS student_lastname,

        students.studyprogram

      FROM internships

      JOIN internship_requests
        ON internships.internship_request_id = internship_requests.id

      JOIN users AS student
        ON internship_requests.student_id = student.id

      LEFT JOIN students
        ON students.user_id = student.id
    `);

    return res.json(rows);

  } catch (error) {
    console.error("Fetch internships failed:", error);

    return res.status(500).json({
      message: "Failed to fetch internships"
    });

  } finally {
    if (connection) connection.release();
  }
};

exports.assignMentor = async (req, res) => {
  const pool = req.db;
  const internshipId = req.params.id;
  const { mentor_id } = req.body;

  if (!mentor_id) {
    return res.status(400).json({
      code: "MENTOR_REQUIRED"
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();


    const [internships] = await connection.execute(
      "SELECT id FROM internships WHERE id = ?",
      [internshipId]
    );

    if (internships.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Internship not found"
      });
    }


    const [mentors] = await connection.execute(
      "SELECT id FROM users WHERE id = ? AND role = 'mentor'",
      [mentor_id]
    );

    if (mentors.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        code: "INVALID_MENTOR"
      });
    }


    await connection.execute(
      "UPDATE internships SET mentor_id = ? WHERE id = ?",
      [mentor_id, internshipId]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Mentor assigned successfully"
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Assign mentor failed:", error);

    return res.status(500).json({
      message: "Failed to assign mentor"
    });

  } finally {
    if (connection) connection.release();
  }
};

exports.assignTeacher = async (req, res) => {
  const pool = req.db;
  const internshipId = req.params.id;
  const { teacher_id } = req.body;

  if (!teacher_id) {
    return res.status(400).json({
      code: "TEACHER_REQUIRED"
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [internships] = await connection.execute(
      "SELECT id FROM internships WHERE id = ?",
      [internshipId]
    );

    if (internships.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Internship not found"
      });
    }

    const [teachers] = await connection.execute(
      "SELECT id FROM users WHERE id = ? AND role = 'teacher'",
      [teacher_id]
    );

    if (teachers.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        code: "INVALID_TEACHER"
      });
    }

    await connection.execute(
      "UPDATE internships SET teacher_id = ? WHERE id = ?",
      [teacher_id, internshipId]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Teacher assigned successfully"
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Assign teacher failed:", error);

    return res.status(500).json({
      message: "Failed to assign teacher"
    });

  } finally {
    if (connection) connection.release();
  }
};

exports.getInternshipById = async (req, res) => {
  const pool = req.db;
  const internshipId = req.params.id;
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute(
      `
      SELECT
        internships.id,
        internships.mentor_id,
        internships.teacher_id,
        internships.start_date,
        internships.end_date,

        internship_requests.company,
        internship_requests.description,
        internship_requests.status,

        student.firstname AS student_firstname,
        student.lastname AS student_lastname,

        students.studyprogram,

        mentor.firstname AS mentor_firstname,
        mentor.lastname AS mentor_lastname,

        teacher.firstname AS teacher_firstname,
        teacher.lastname AS teacher_lastname

      FROM internships

      JOIN internship_requests
        ON internships.internship_request_id = internship_requests.id

      JOIN users AS student
        ON internship_requests.student_id = student.id

      LEFT JOIN students
        ON students.user_id = student.id

      LEFT JOIN users AS mentor
        ON internships.mentor_id = mentor.id

      LEFT JOIN users AS teacher
        ON internships.teacher_id = teacher.id

      WHERE internships.id = ?
      `,
      [internshipId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Internship not found"
      });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error("Fetch internship detail failed:", error);

    return res.status(500).json({
      message: "Failed to fetch internship"
    });

  } finally {
    if (connection) connection.release();
  }
};