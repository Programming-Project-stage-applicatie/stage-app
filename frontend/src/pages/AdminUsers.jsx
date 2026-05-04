import { useEffect, useState, Fragment } from "react";
import { t } from "../i18n/translations";

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
  });

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

  const updateNewUser = (field, value) =>
    setNewUser((prev) => ({ ...prev, [field]: value }));

  const handleCreateUser = async () => {
    if (Object.values(newUser).some((v) => v === "")) {
      setError(t("adminUsers.allFieldsRequired"));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      setIsCreating(false);
      setNewUser({
        firstname: "",
        lastname: "",
        email: "",
        username: "",
        password: "",
        role: "student",
        status: "active",
      });
      fetchUsers();
    } catch {
      setError(t("adminUsers.messages.genericError"));
    }
  };

  const handleResetPassword = async (userId) => {
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
        throw new Error();
      }
      setResetUserId(null);
      await fetchUsers();
    } catch {
      setError(t("adminUsers.messages.genericError"));
    }
  };

  const handleUpdateUser = async (user) => {
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
            <th>{t("adminUsers.fields.status")}</th>
            <th>{t("adminUsers.actions")}</th>
          </tr>
        </thead>

        <tbody>
          {isCreating && (
            <tr>
              <td><input onChange={(e) => updateNewUser("firstname", e.target.value)} /></td>
              <td><input onChange={(e) => updateNewUser("lastname", e.target.value)} /></td>
              <td><input onChange={(e) => updateNewUser("email", e.target.value)} /></td>
              <td><input onChange={(e) => updateNewUser("username", e.target.value)} /></td>
              <td><input type="password" onChange={(e) => updateNewUser("password", e.target.value)} /></td>
              <td>
                <select onChange={(e) => updateNewUser("role", e.target.value)}>
                  <option value="student">{t("adminUsers.roles.student")}</option>
                  <option value="teacher">{t("adminUsers.roles.teacher")}</option>
                  <option value="mentor">{t("adminUsers.roles.mentor")}</option>
                  <option value="admin">{t("adminUsers.roles.admin")}</option>
                  <option value="internship_committee">{t("adminUsers.roles.internship_committee")}</option>
                </select>
              </td>
              <td>
                <select onChange={(e) => updateNewUser("status", e.target.value)}>
                  <option value="active">{t("adminUsers.status.active")}</option>
                  <option value="inactive">{t("adminUsers.status.inactive")}</option>
                </select>
              </td>
              <td>
                <button onClick={handleCreateUser}>{t("adminUsers.save")}</button>
                <button onClick={() => setIsCreating(false)}>{t("adminUsers.cancel")}</button>
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
            onChange={(e) =>
              setEditUser({ ...editUser, firstname: e.target.value })
            }
          />
        </td>

        <td>
          <input
            value={editUser.lastname}
            onChange={(e) =>
              setEditUser({ ...editUser, lastname: e.target.value })
            }
          />
        </td>

        <td>
          <input
            value={editUser.email}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
          />
        </td>

        <td>
          <input
            value={editUser.username}
            onChange={(e) =>
              setEditUser({ ...editUser, username: e.target.value })
            }
          />
        </td>

        <td>
          <select
            value={editUser.role}
            onChange={(e) =>
              setEditUser({ ...editUser, role: e.target.value })
            }
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
          <select
            value={editUser.status}
            onChange={(e) =>
              setEditUser({ ...editUser, status: e.target.value })
            }
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
        <td colSpan={isCreating ? 8 : 7}>
          <input
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          <button onClick={() => handleResetPassword(user.id)}>
            {t("adminUsers.save")}
          </button>
          <button onClick={() => setResetUserId(null)}>
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