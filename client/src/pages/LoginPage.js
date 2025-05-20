import { Link } from "react-router-dom";
import "../styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.post(
        "https://expense-tracker-ai-ci4w.onrender.com/login",
        formData
      );
      console.log("user login successful", response.data);
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid credentials");
        setTimeout(() => {
          setErrorMessage("");
        }, 1500);
      } else {
        setErrorMessage("An error occurred");
        setTimeout(() => {
          setErrorMessage("");
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
    console.log(formData);
  };

  return (
    <div className="loginpage">
      {loading && <Spinner />}
      {errorMessage && !loading && (
        <div className="error-message">{errorMessage}</div>
      )}
      {!loading && !errorMessage && (
        <>
          <header className="header">
            <div className="logo-container">
              <i class="fa-solid fa-hurricane logo-icon"></i>
              <h1 className="logo">SpendSmart</h1>
            </div>

            <nav>
              <ul className="nav-links">
                <li>
                  <Link to="/" className="firstlink">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="secondlink">
                    Sign up
                  </Link>
                </li>
              </ul>
            </nav>
          </header>

          <div className="login">
            <div className="login-container">
              <h2>Welcome Back</h2>
              <p>Log in to your SpendSmart account</p>
              <form onSubmit={handleSubmit}>
                <div className="email-container">
                  {" "}
                  <label className="login-label" for="email">
                    Email Address
                  </label>
                  <input
                    className="login-input"
                    name="email"
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="password-container">
                  <label className="login-label" for="password">
                    Password
                  </label>
                  <input
                    className="login-input"
                    name="password"
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <span className="forgot-password">Forgot password?</span>
                <button type="submit">Login</button>
              </form>
            </div>
          </div>
          <footer className="login-footer">
            <div className="login-footer-content">
              <p>&copy; 2023 SpendSmart. All rights reserved.</p>
              <div className="login-footer-links">
                <a href="/about">About Us</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy Policy</a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
