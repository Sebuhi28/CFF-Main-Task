import { useState } from "react";
import "../components_css/LoginPage.css";
import logo from "../assets/logo.png";
import brain from "../assets/brain.png";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignInClick = (e) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);

    let userData = {
      email: email,
      password: password
    };

    localStorage.setItem("userData", JSON.stringify(userData));
  };

  return (
    <>
      <header className="home-header">
        <Link to="/" className="link-logo-div">
          <div className="logo-div">
            <img src={logo} alt="Logo" className="logo" />
            <h1 className="app-name">QuizMaster</h1>
          </div>
        </Link>
        <div className="home-buttons-div">
          <Link to="/signup" className="signup-button">Sign Up</Link>
        </div>
      </header>

      <main className="login-page">
        <div className="login-card">
          <div className="login-card-top">
            <div className="login-icon-shell">
              <img src={brain} alt="Logo" className="login-card-logo" />
            </div>
          </div>

          <div className="login-card-content">
            <h1>Welcome Back</h1>
            <p>Sign in to track your progress and earn badges!</p>
          </div>

          <form className="login-form" onSubmit={handleSignInClick}>
            <label className="login-field">
              <span>Email Address</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="login-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <p className="login-hint">For this demo, any password will work.</p>
            <button type="submit" className="login-submit">Log In →</button>
          </form>
        </div>
      </main>

      <footer className="logo-footer">
        <p>&copy; 2026 QuizMaster. All rights reserved.</p>
      </footer>
    </>
  );
}