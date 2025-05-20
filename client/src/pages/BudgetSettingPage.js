import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/BudgetSettingPage.css";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  defaults,
  BarElement,
} from "chart.js";

defaults.responsive = true;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function BudgetSettingPage() {
  const [activeLink, setActiveLink] = useState("");
  const [totalBudget, setTotalBudget] = useState(0);
  const [categorySpending, setCategorySpending] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [categories, setCategories] = useState([
    { name: "Food", budgetAmount: 0, spent: 0 },
    { name: "Transportation", budgetAmount: 0, spent: 0 },
    { name: "Entertainment", budgetAmount: 0, spent: 0 },
  ]);

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        if (!token) {
          console.log("No token found. User is not authenticated.");
          return;
        }
        const response = await axios.get("http://localhost:3001/budget/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTotalBudget(response.data.totalBudget);
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching budget data:", error);
      }
    };
    fetchData();
  }, []);

  // fetch user expense for current month
  useEffect(() => {
    const expenseData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/expense/monthly",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        //sum up all categories
        const CategorySpending = response.data.reduce((acc, item) => {
          const cat = item.category;
          if (!acc[cat]) {
            acc[cat] = item.amount;
          } else {
            acc[cat] += item.amount;
          }
          return acc;
        }, {});
        console.log(CategorySpending);
        setCategorySpending(CategorySpending);
      } catch (error) {
        console.error("Error fetching expense data:", error);
      }
    };
    expenseData();
  }, []);
  // graph data
  const categoryNames = () => Object.keys(categorySpending);
  const budgetData = categories.map((cat) => cat.budgetAmount);
  const spentData = () => Object.values(categorySpending);

  // graph data
  const data = {
    labels: categoryNames(),
    datasets: [
      {
        label: "Budget",
        data: budgetData,
        backgroundColor: "rgba(54, 162, 235, 0.7)", // Blue
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
      {
        label: "Spent",
        data: spentData(),
        backgroundColor: "rgba(255, 99, 132, 0.7)", // Red
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  const option = {
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleCategoryChange = (index, newValue) => {
    const newBudgetValue = Number(newValue);

    const currentTotal = categories.reduce((sum, cat, i) => {
      return sum + (i === index ? newBudgetValue : cat.budgetAmount);
    }, 0);

    if (currentTotal > totalBudget) {
      setErrorMsg("New budget amount exceeds total budget.");
      return;
    }
    setErrorMsg(""); // clear error if valid

    const updatedCategories = [...categories];
    updatedCategories[index].budgetAmount = newBudgetValue;
    setCategories(updatedCategories);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthToUse = selectedMonth || currentMonth;

      const response = await axios.post(
        "http://localhost:3001/budget/save",
        { totalBudget, categories, month: monthToUse },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Budget saved successfully!", response.data);
    } catch (e) {
      console.error("Error saving budget:", e);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login"); 
  };

  return (
    <div className="BudgetSettingPage">
      <header className="BudgetSetting-header">
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

      <div className="BudgetSetting-content">
        <div className="BudgetSetting-sidebar">
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

        <main className="budgetSetting-main">
          <h1>Budget Settings</h1>
          <p>Set your monthly budget and track spending.</p>
          <div className="monthly-budget">
            <h2>Set Monthly Budget</h2>
            <p>Total Monthly Budget</p>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
            <input
              type="number"
              name="monthly-budget"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
            <button onClick={handleSaveBudget}>Save Budget</button>
          </div>

          <div className="category-budget">
            <h2>Category Budget</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Remaining</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => {
                  return (
                    <tr key={index}>
                      <td>{category.name}</td>
                      <td>
                        <input
                          className="category-input"
                          type="number"
                          value={category.budgetAmount}
                          onChange={(e) =>
                            handleCategoryChange(index, e.target.value)
                          }
                        />
                        {errorMsg && (
                          <p className="CategoryError-message">{errorMsg}</p>
                        )}
                      </td>
                      <td>{category.budgetAmount - category.spent}</td>
                      <button
                        className="category-save"
                        onClick={handleSaveBudget}
                      >
                        Save
                      </button>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="budget-graph">
            <h2>Budget vs Expense</h2>
            <Bar data={data} options={option}></Bar>
          </div>

          <div className="budget-alert">
            <h2>Budget Alerts</h2>
            <p>No Alerts Available</p>
          </div>
        </main>
      </div>
    </div>
  );
}
