import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n/translations";
import { getDashboardRouteByRole } from "../utils/roleRedirect";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError(t("requiredFields"));
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("invalidCredentials"));
        return;
      }

      localStorage.setItem("token", data.token);

      const role = data.role;
      const targetRoute = getDashboardRouteByRole(role);
      navigate(targetRoute);

    } catch {
      setError(t("serverError"));
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>{t("loginTitle")}</h1>

        <form onSubmit={handleSubmit}>
          <label>{t("usernameLabel")}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>{t("passwordLabel")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">{t("loginButton")}</button>
        </form>

        <p className="login-help">{t("noAccountHelp")}</p>
      </div>
    </div>
  );
}

export default Login;