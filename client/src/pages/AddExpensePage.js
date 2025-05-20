import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/addExpensePage.css";
import axios from "axios";

export default function AddExpensePage() {
  const [activeLink, setActiveLink] = useState("dashboard");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://expense-tracker-ai-ci4w.onrender.com/expense/save",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Expense added successfully!");
      setFormData({ amount: "", category: "", description: "", date: "" });
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="add-expense-page">
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

      <main className="add-expense-main">
        <div className="add-expense-sidebar">
          <ul className="sidebar-links">
            <li>
              <Link to="/dashboard" className="sidebar-link">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/add-expense" className="sidebar-link">
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

        <div className="add-expense-content">
          <h1>Add New Expense</h1>
          <div className="add-expense-container">
            <div className="add-expense">
              <form onSubmit={handleSubmit}>
                <p>Amount</p>
                <input
                  type="number"
                  name="amount"
                  onChange={handleInputChange}
                  value={formData.amount}
                />
                <p>Category</p>
                <select
                  name="category"
                  onChange={handleInputChange}
                  value={formData.category}
                >
                  <option value="" disabled>
                    -- Select an option --
                  </option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="housing">Housing</option>
                </select>
                <p>Description</p>
                <input
                  type="text"
                  name="description"
                  onChange={handleInputChange}
                  value={formData.description}
                />
                <p>Date</p>
                <input
                  type="date"
                  name="date"
                  onChange={handleInputChange}
                  value={formData.date}
                />
                <button type="submit">Save Expense</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
