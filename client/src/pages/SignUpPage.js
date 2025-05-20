import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/SignUpPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "https://expense-tracker-ai-ci4w.onrender.com/register",
        formData
      );
      console.log(`Successfully registered ${response.data}`);
      setSuccessMessage("User registered successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setSuccessMessage("User already exists");
        setTimeout(() => {
          setSuccessMessage("");
        }, 1500);
      }
      if (error.response && error.response.status === 400) {
        setSuccessMessage("Invalid email, password or name");
        setTimeout(() => {
          setSuccessMessage("");
        }, 1500);
      }
      if (error.response && error.response.status === 402) {
        setSuccessMessage("Passwords do not match");
        setTimeout(() => {
          setSuccessMessage("");
        }, 1500);
      } else {
        setSuccessMessage("An error occurred");
        setTimeout(() => {
          setSuccessMessage("");
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
    console.log("Form submitted:", formData);
  };

  return (
    <div className="signup-page">
      {loading && <Spinner />}
      {successMessage && !loading && (
        <div className="success-message">{successMessage}</div>
      )}
      {!successMessage && !loading && (
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
                  <Link to="/login" className="secondlink">
                    Log In
                  </Link>
                </li>
              </ul>
            </nav>
          </header>

          <div className="signup">
            <div className="signup-container">
              <h2>Create Your Account</h2>
              <p>Start your financial journey with SpendSmart</p>
              <form onSubmit={handleSubmit}>
                <div className="name-container">
                  {" "}
                  <label className="signup-label" for="name">
                    Full Name
                  </label>
                  <input
                    className="login-input"
                    name="fullname"
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="email-container">
                  <label className="signup-label" for="email">
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

                <div className="-container">
                  <label className="signup-label" for="password">
                    Password
                  </label>
                  <input
                    className="login-input"
                    name="password"
                    type="password"
                    id="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="password-container">
                  <label className="signup-label" for="password">
                    Confirm Password
                  </label>
                  <input
                    className="login-input"
                    name="confirmPassword"
                    type="password"
                    id="password"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit">Sign Up</button>
              </form>
            </div>
          </div>
          <footer className="signup-footer">
            <div className="signup-footer-content">
              <p>&copy; 2023 SpendSmart. All rights reserved.</p>
              <div className="signup-footer-links">
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
