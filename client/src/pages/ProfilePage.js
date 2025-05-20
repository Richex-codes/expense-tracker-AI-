import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/profilePage.css";
import avatarImg from "../images/avatar-default-icon-2048x2048-h6w375ur.png";
import axios from "axios";

export default function profilePage() {
  const [activeLink, setActiveLink] = useState("dashboard");
  const [userData, setUserData] = useState({});
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate()

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const response = await axios.put(
        `http://localhost:3001/user/${userData._id}`,
        formData
      );
      setFormData({
        fullname: "",
        email: "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
      console.log("User data updated:", response.data);
    } catch (err) {
      console.log("Error updating user data:", err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from storage
        if (!token) {
          console.log("No token found. User is not authenticated.");
          return;
        }

        const response = await axios.get("http://localhost:3001/user", {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        });
        console.log("User data:", response.data);
        setUserData(response.data);
      } catch (error) {
        console.log(
          "Error fetching user data:",
          error.response?.data || error.message
        );
      }
    };
    fetchUserData();
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login"); 
  };


  return (
    <div className="profile-page">
      <header className="add-expense-header">
        <div className="logo-container">
          <i className="fa-solid fa-hurricane logo-icon"></i>
          <h1 className="logo">SpendSmart</h1>
        </div>

        <nav className="nav-links-container">
          <ul className="nav-links">
            <li>
              <Link
                to="/dashboard"
                className={`firstlink ${
                  activeLink === "dashboard" ? "active" : ""
                }`}
                onClick={() => handleLinkClick("dashboard")}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/add-expense"
                className={`secondlink1 ${
                  activeLink === "Add Expense" ? "active" : ""
                }`}
                onClick={() => handleLinkClick("Add Expense")}
              >
                Add Expense
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className={`thirdlink ${
                  activeLink === "profile" ? "active" : ""
                }`}
                onClick={() => handleLinkClick("profile")}
              >
                Profile
              </Link>
            </li>
          </ul>
        </nav>

        {/* Separate logout container */}
        <div className="logout-container">
          <Link onClick={handleLogOut} to="" className="fourthlink">
            Log out
          </Link>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-sidebar">
          <ul className="sidebar-links">
            <li>
              <Link to="/dashboard" className="sidebar-link">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/dashboard/add-expense" className="sidebar-link">
                Add Expense
              </Link>
            </li>
            <li>
              <Link to="/dashboard/budget-settings" className="sidebar-link">
                Budget Settings
              </Link>
            </li>
            <li>
              <Link to="/ai-insights" className="sidebar-link">
                AI Insights
              </Link>
            </li>
          </ul>
        </div>

        <div className="profile-content">
          <h1>Profile Settings</h1>
          <div className="profile-form">
            <section>
              <div className="profile-info">
                <img className="avatar" src={avatarImg} alt="avatar" />
                <div className="user-details">
                  <h3>{userData.fullname}</h3>
                  <p>{userData.email}</p>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label for="name">Full Name</label>
                  <input
                    name="fullname"
                    type="text"
                    id="name"
                    required
                    onChange={handleChange}
                    value={formData.fullname}
                  />
                </div>
                <div className="form-group">
                  <label for="email">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    id="email"
                    required
                    onChange={handleChange}
                    value={formData.email}
                  />
                </div>
                <div className="form-group">
                  <label for="name">Current Password</label>
                  <input
                    name="currentPassword"
                    type="text"
                    id="name"
                    required
                    onChange={handleChange}
                    value={formData.currentPassword}
                  />
                </div>
                <div className="form-group">
                  <label for="password">Password</label>
                  <input
                    name="password"
                    type="password"
                    id="password"
                    required
                    onChange={handleChange}
                    value={formData.password}
                  />
                </div>
                <div className="form-group">
                  <label for="confirmPassword">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    id="confirmPassword"
                    required
                    onChange={handleChange}
                    value={formData.confirmPassword}
                  />
                </div>
                <button type="submit">Update Profile</button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
