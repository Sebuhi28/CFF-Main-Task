import { Link } from "react-router-dom";
import brain from "../assets/brain.png";
import "../components_css/SignupPage.css";
import logo from "../assets/logo.png";
import { useState } from "react";

export default function SignupPage() {
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
                <div className="logo-div">
                    <img src={logo} alt="Logo" className="logo" />
                    <h1 className="app-name">QuizMaster</h1>
                </div>
                <div className="home-buttons-div">
                    <Link to="/login" className="login-button">Login</Link>
                </div>
            </header>

            <main className="signup-page">
                <div className="signup-card">
                    <div className="signup-card-top">
                        <div className="signup-icon-shell">
                            <img src={brain} alt="Quiz icon" className="signup-card-logo" />
                        </div>
                    </div>

                    <div className="signup-card-content">
                        <h1>Create your account</h1>
                        <p>Sign up to save progress, challenge friends, and earn rewards.</p>
                    </div>

                    <form className="signup-form">
                        <label className="signup-field">
                            <span>Full Name</span>
                            <input type="text" placeholder="Jane Doe" />
                        </label>
                        <label className="signup-field">
                            <span>Email Address</span>
                            <input type="email" placeholder="you@example.com" />
                        </label>
                        <label className="signup-field">
                            <span>Password</span>
                            <input type="password" placeholder="Create a password" />
                        </label>
                        <label className="signup-field">
                            <span>Confirm Password</span>
                            <input type="password" placeholder="Repeat your password" />
                        </label>
                        <button type="submit" className="signup-submit">Sign Up</button>
                    </form>
                </div>
            </main>

            <footer className="signup-footer">
                <p>&copy; 2024 QuizMaster. All rights reserved.</p>
            </footer>
        </>
    );
}
