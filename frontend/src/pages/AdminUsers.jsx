import { useEffect, useState, Fragment } from "react";
import { t } from "../i18n/translations";
import { useNavigate } from "react-router-dom";
import "../styles/adminUsers.css";


export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState("");

  const [editUserId, setEditUserId] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    role: "student",
    status: "active",
    studyprogram: ""
  });

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      setError(t("adminUsers.messages.genericError"));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

 useEffect(() => { 
    setError("");
  }, [editUserId, isCreating, resetUserId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
}, [error]);




  const updateNewUser = (field, value) =>
    setNewUser((prev) => ({ ...prev, [field]: value }));

  const handleCreateUser = async () => {
   setError("");
   if (
    !newUser.firstname ||
    !newUser.lastname ||
    !newUser.email ||
    !newUser.username ||
    !newUser.password ||
    !newUser.role ||
    !newUser.status ||
    (newUser.role === "student" && !newUser.studyprogram)
    )  {
      setError(t("adminUsers.allFieldsRequired"));
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "EMAIL_TAKEN") {
          setError(t("adminUsers.errors.emailTaken"));
          return;
        }

        if (data.code === "USERNAME_TAKEN") {
          setError(t("adminUsers.errors.usernameTaken"));
          return;
        }

        throw new Error();
      }

      setIsCreating(false);
      setNewUser({
        firstname: "",
        lastname: "",
        email: "",
        username: "",
        password: "",
        role: "student",
        status: "active",
        studyprogram: ""

      });
      fetchUsers();
    } catch {
      setError(t("adminUsers.messages.genericError"));
    }
  };

  const handleResetPassword = async (userId) => {
    setError("");
    if (!resetPassword) {
      setError(t("adminUsers.passwordRequired"));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: resetPassword }),
      });

      if (!response.ok) {
        throw new Error();
      }
      setError(t("adminUsers.passwordResetSuccess"));

      setTimeout(() => {
        setError("");
      }, 3000);

      setResetUserId(null);
      setResetPassword("");
    } catch {
      setError(t("adminUsers.errors.generic"));
    }
  };

  const handleDeleteUser = async (userId) => {
    setError("");

    const confirmed = window.confirm(
        t("adminUsers.confirmDelete")
    );

    if (!confirmed) {
        return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        
        const data = await response.json();

        if (data.code === "USER_IN_USE") {
          setError(t("adminUsers.errors.userInUse"));
          return;
        }
        throw new Error();
      }
      setResetUserId(null);
      await fetchUsers();
    } catch {
      setError(t("adminUsers.messages.genericError"));
    }
  };

  const handleUpdateUser = async (user) => {
  setError("");
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:3000/users/${user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      }
    );

    if (!response.ok) {
        
  const data = await response.json();

      if (data.code === "STUDYPROGRAM_REQUIRED") {
        setError(t("adminUsers.errors.requiredFields"));
        return;
    }

    if (data.code === "REQUIRED_FIELDS") {
        setError(t("adminUsers.errors.requiredFields"));
        return;
    }

    



    if (data.code === "EMAIL_TAKEN") {
        setError(t("adminUsers.errors.emailTaken"));
        return;
    }

    if (data.code === "USERNAME_TAKEN") {
        setError(t("adminUsers.errors.usernameTaken"));
        return;
    }
      throw new Error();
    }

    setEditUserId(null);
    setEditUser(null);
    fetchUsers();
  } catch {
    setError(t("adminUsers.messages.genericError"));
  }
 };

  return (
    <div className="admin-users-page">
        
    <button className="secondary back-button" onClick={() => navigate("/dashboard/admin")}>
    ← {t("adminUsers.backToDashboard")}
    </button>

      <h1>{t("adminUsers.title")}</h1>

      {error && <p className="error">{error}</p>}

      <table className="users-table">
        <thead>
          <tr>
            <th>{t("adminUsers.fields.firstname")}</th>
            <th>{t("adminUsers.fields.lastname")}</th>
            <th>{t("adminUsers.fields.email")}</th>
            <th>{t("adminUsers.fields.username")}</th>
            {isCreating && <th>{t("adminUsers.fields.password")}</th>}
            <th>{t("adminUsers.fields.role")}</th>
            <th>{t("adminUsers.fields.studyprogram")}</th>
            <th>{t("adminUsers.fields.status")}</th>
            <th>{t("adminUsers.actions")}</th>
          </tr>
        </thead>

        <tbody>
          {isCreating && (
            <tr>
              <td><input onChange={(e) => { setError(""); updateNewUser("firstname", e.target.value)}}/></td>
              <td><input onChange={(e) => { setError(""); updateNewUser("lastname", e.target.value)}} /></td>
              <td><input onChange={(e) => { setError(""); updateNewUser("email", e.target.value)}} /></td>
              <td><input onChange={(e) => { setError(""); updateNewUser("username", e.target.value)}} /></td>
              <td><input type="password" onChange={(e) => { setError(""); updateNewUser("password", e.target.value)}} /></td>
              <td>
                <select onChange={(e) => { setError(""); updateNewUser("role", e.target.value)}}>
                  <option value="student">{t("adminUsers.roles.student")}</option>
                  <option value="teacher">{t("adminUsers.roles.teacher")}</option>
                  <option value="mentor">{t("adminUsers.roles.mentor")}</option>
                  <option value="admin">{t("adminUsers.roles.admin")}</option>
                  <option value="internship_committee">{t("adminUsers.roles.internship_committee")}</option>
                </select>
              </td>
              <td>
                {newUser.role === "student" ? (
                    <input
                    value={newUser.studyprogram}
                    onChange={(e) => { setError(""); updateNewUser("studyprogram", e.target.value)}}
                    placeholder={t("adminUsers.fields.studyprogram")}
                    />
                    ) : (
                <span>-</span>
                )}
              </td>
              <td>
                <select onChange={(e) => { setError(""); updateNewUser("status", e.target.value)}}>
                  <option value="active">{t("adminUsers.status.active")}</option>
                  <option value="inactive">{t("adminUsers.status.inactive")}</option>
                </select>
              </td>
              <td>
                <button onClick={handleCreateUser}>{t("adminUsers.save")}</button>
                <button onClick={() => {setError(""); setIsCreating(false);}}>{t("adminUsers.cancel")}</button>
              </td>
            </tr>
          )}

{users.map((user) => (
  <Fragment key={user.id}>
    {editUserId === user.id ? (

      <tr>
        <td>
          <input
            value={editUser.firstname}
            
            
          onChange={(e) => {
          setError(""); 
          setEditUser({ ...editUser, firstname: e.target.value });
          }}


          />
        </td>

        <td>
          <input
            value={editUser.lastname}
            onChange={(e) => {
            setError(""); 
              setEditUser({ ...editUser, lastname: e.target.value })
            }}
          />
        </td>

        <td>
          <input
            value={editUser.email}
            onChange={(e) => {
              setError(""); 
              setEditUser({ ...editUser, email: e.target.value })
            }}
          />
        </td>

        <td>
          <input
            value={editUser.username}
            onChange={(e) => {
              setError(""); 
              setEditUser({ ...editUser, username: e.target.value })
            }}
          />
        </td>

        <td>
          <select
            value={editUser.role}
            onChange={(e) => {
              setError(""); 
              setEditUser({ ...editUser, role: e.target.value })
            }}
          >
            <option value="student">{t("adminUsers.roles.student")}</option>
            <option value="teacher">{t("adminUsers.roles.teacher")}</option>
            <option value="mentor">{t("adminUsers.roles.mentor")}</option>
            <option value="internship_committee">
              {t("adminUsers.roles.internship_committee")}
            </option>
            <option value="admin">{t("adminUsers.roles.admin")}</option>
          </select>
        </td>
        <td>
            {editUser.role === "student" ? (
                <input
                    value={editUser.studyprogram || ""}
                    onChange={(e) => {
                        setError(""); 
                        setEditUser({
                        ...editUser,
                        studyprogram: e.target.value
                        })
                    }}
                    placeholder={t("adminUsers.fields.studyprogram")}
                />
            ) : (
                <span>-</span>
            )}
        </td>

        <td>
          <select
            value={editUser.status}
            onChange={(e) => {
              setError(""); 
              setEditUser({ ...editUser, status: e.target.value })
            }}
          >
            <option value="active">{t("adminUsers.status.active")}</option>
            <option value="inactive">{t("adminUsers.status.inactive")}</option>
          </select>
        </td>

        <td>
          <button
            className="primary"
            onClick={() => handleUpdateUser(editUser)}
          >
            {t("adminUsers.save")}
          </button>

          <button
            className="secondary"
            onClick={() => {
              setError("");
              setEditUserId(null);
              setEditUser(null);
            }}
            style={{ marginLeft: "8px" }}
          >
            {t("adminUsers.cancel")}
          </button>
        </td>
      </tr>
    ) : (

      <tr>
        <td>{user.firstname}</td>
        <td>{user.lastname}</td>
        <td>{user.email}</td>
        <td>{user.username}</td>
        <td>{t(`adminUsers.roles.${user.role}`)}</td>
        <td>
            {user.role === "student" && user.studyprogram
            ? user.studyprogram
            : "-"}
        </td>
        <td>{t(`adminUsers.status.${user.status}`)}</td>
        <td>
          <button
            className="secondary"
            onClick={() => {
              setEditUserId(user.id);
              setEditUser({ ...user });
            }}
          >
            {t("adminUsers.edit")}
          </button>

          <button
            className="secondary"
            onClick={() => setResetUserId(user.id)}
            style={{ marginLeft: "8px" }}
          >
            {t("adminUsers.resetPassword")}
          </button>

          <button
            className="danger"
            onClick={() => handleDeleteUser(user.id)}
            style={{ marginLeft: "8px" }}
          >
            {t("adminUsers.delete")}
          </button>
        </td>
      </tr>
    )}


    {resetUserId === user.id && editUserId !== user.id && (
      <tr>
        <td colSpan={isCreating ? 9 : 8}>
          <input
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          <button onClick={() => handleResetPassword(user.id)}>
            {t("adminUsers.save")}
          </button>
          <button onClick={() => { setError(""); setResetUserId(null);}}>
            {t("adminUsers.cancel")}
          </button>
        </td>
      </tr>
    )}
  </Fragment>
))}
        </tbody>
      </table>

      {!isCreating && (
        <button className="new-row-button" onClick={() => setIsCreating(true)}>
          {t("adminUsers.newRow")}
        </button>
      )}
    </div>
  );
}