import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboardPage.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
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
} from "chart.js";

// defaults.maintainAspectRatio = true;
defaults.responsive = true;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashBoardPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [MonthlySpending, setMonthlySpending] = useState({});
  const [editingExpense, setEditingExpense] = useState(null);
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [modelData, setModelData] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const navigate = useNavigate();

  // get user expenses
  // This effect fetches user expenses for the current month
  useEffect(() => {
    const fetchAllExpenses = async () => {
      try {
        const response = await axios.get("http://localhost:3001/expense", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Fetched all expenses:", response.data);
        const MonthlySpending = response.data.reduce((acc, expense) => {
          const date = new Date(expense.date);
          const monthYear = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });

          // Initialize the month if it doesn't exist
          if (!acc[monthYear]) {
            acc[monthYear] = { total: 0 };
          }

          // Add to total
          acc[monthYear].total += expense.amount;

          // Add to category (e.g., food, transportation)
          const category = expense.category;
          if (!acc[monthYear][category]) {
            acc[monthYear][category] = 0;
          }

          acc[monthYear][category] += expense.amount;

          return acc;
        }, {});
        setMonthlySpending(MonthlySpending);
      } catch (error) {
        console.error("Error fetching all expenses:", error);
      }
    };
    fetchAllExpenses();
  }, []);

  // get user expense
  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();

        // Format date in local timezone as YYYY-MM-DD
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const firstDay = formatDate(
          new Date(now.getFullYear(), now.getMonth(), 1)
        );
        const lastDay = formatDate(
          new Date(now.getFullYear(), now.getMonth() + 1, 0)
        );

        console.log("First Day:", firstDay); // Should now be "2025-05-01" if it's May

        setFromDate(firstDay);
        setToDate(lastDay);

        const response = await axios.get(
          "http://localhost:3001/expense/filter",
          {
            params: {
              from: firstDay,
              to: lastDay,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setExpenses(response.data);

        // Calculate total spending
        const total = response.data.reduce(
          (acc, expense) => acc + expense.amount,
          0
        );
        setTotalSpending(total);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  //get user budget
  useEffect(() => {
    const fetchUserBudget = async () => {
      try {
        const response = await axios.get("http://localhost:3001/budget/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTotalBudget(response.data.totalBudget);
        console.log("Fetched budget:", response.data);
      } catch (error) {
        console.error("Error fetching user budget:", error);
      }
    };
    fetchUserBudget();
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login"); 
  };
  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModelData({ ...modelData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        // Update existing expense
        const response = await axios.put(
          `http://localhost:3001/expense/update/${editingExpense._id}`,
          modelData
        );
        setExpenses((prevExpenses) =>
          prevExpenses.map((exp) =>
            exp._id === editingExpense._id ? response.data : exp
          )
        );
      } else {
        // Create a new expense
        const response = await axios.post(
          "http://localhost:3001/expense/save",
          modelData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setExpenses((prevExpenses) => [...prevExpenses, response.data]);
      }

      setShowModal(false);
      setModelData({ amount: "", category: "", description: "", date: "" });
      setEditingExpense(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setModelData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/expense/delete/${id}`);
      // Update expenses state immediately after a successful deletion
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleClose2 = (e) => {
    if (e.target.classList.contains("modal-container")) {
      setShowModal(false);
      setModelData({ amount: "", category: "", description: "", date: "" });
    }
  };

  const handleClose1 = () => {
    setShowModal(false);
    setModelData({ amount: "", category: "", description: "", date: "" });
  };
  const category = ["food", "transportation", "entertainment"];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0 = January, 4 = May,

  const monthsInYear = Array.from({ length: currentMonthIndex + 1 }, (_, i) => {
    const date = new Date(currentYear, i);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  });

  // current month
  const now = new Date();
  const monthYear = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const Monthlyarray = [];

  // array for monthly spending comparison chart
  monthsInYear.forEach((data) => {
    if (!MonthlySpending[data]) {
      Monthlyarray.push(0);
    } else {
      Monthlyarray.push(MonthlySpending[data].total);
    }
  });

  // array for category spending comparison chart
  const categoryArray = () => {
    const categorySpending = [];
    category.forEach((cat) => {
      categorySpending.push(MonthlySpending[monthYear]?.[cat] || 0);
    });
    return categorySpending;
  };

  console.log(categoryArray());

  const data1 = {
    labels: monthsInYear,
    datasets: [
      {
        label: "Sales",
        data: Monthlyarray,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.5)",
        fill: true,
      },
    ],
  };

  const options1 = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const data2 = {
    labels: ["food", "Transport", "Entertainment", "Utilities", "Housing"],
    datasets: [
      {
        label: "Expenses",
        data: categoryArray(),
        backgroundColor: ["red", "blue", "green", "yellow", "purple"],
        hoverOffset: 4,
      },
    ],
  };

  const options2 = {
    plugins: {
      legend: {
        position: "bottom", // Moves the labels below the chart
      },
    },
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:3001/expense/filter", {
        params: {
          from: fromDate,
          to: toDate,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setExpenses(response.data); // update your table data
    } catch (err) {
      console.error("Failed to filter expenses", err);
    }
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className="dashboardpage">
      <header className="dashboard-header">
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

      <div className="dashboard-content">
        <div className="sidebar">
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

        <div className="main-content">
          <section className="top-section">
            <h1>Monthly Budget Overview</h1>
            <div className="budget-cards">
              <div className="budget-card">
                <h2>Total Spending</h2>
                <p>{`$${totalSpending}`}</p>
              </div>
              <div className="budget-card">
                <h2>Remaining Budget</h2>
                <p>{`$${totalBudget - totalSpending}`}</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)}>Add Expense</button>
            {showModal && (
              <div className="modal-container" onClick={handleClose2}>
                <div className="modall">
                  <div className="close-modal" onClick={handleClose1}>
                    <i class="fa-solid fa-xmark"></i>
                  </div>
                  <h2>Add Expense</h2>
                  <form onSubmit={handleSubmit}>
                    <p>Amount</p>
                    <input
                      type="number"
                      name="amount"
                      onChange={handleInputChange}
                      value={modelData.amount}
                    />
                    <p>Category</p>
                    <select
                      name="category"
                      onChange={handleInputChange}
                      value={modelData.category}
                    >
                      <option value="" disabled>
                        -- Select an option --
                      </option>
                      <option value="food">Food</option>
                      <option value="transportation">Transportation</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="utilities">Utilities</option>
                      <option value="housing">Housing</option>
                    </select>
                    <p>Description</p>
                    <input
                      type="text"
                      name="description"
                      onChange={handleInputChange}
                      value={modelData.description}
                    />
                    <p>Date</p>
                    <input
                      type="date"
                      name="date"
                      onChange={handleInputChange}
                      value={modelData.date}
                    />
                    <button type="submit">Save Expense</button>
                  </form>
                </div>
              </div>
            )}
          </section>

          <section className="chart-section">
            <div className="category-spending">
              <h2>Category Spending</h2>
              <Pie data={data2} options={options2} />
            </div>
            <div className="spending-overtime">
              <h2>Spending Over Time</h2>
              <Line data={data1} options={options1} />
            </div>
          </section>

          <section className="recent-transactions">
            <form className="filter-form" onSubmit={handleFilter}>
              <label>From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <label>To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <button type="submit">Filter</button>
            </form>

            <h2>Recent Expenses</h2>
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  return (
                    <tr key={expense._id}>
                      <td>{expense.amount}</td>
                      <td>{expense.category}</td>
                      <td>{expense.description}</td>
                      <td>{expense.date}</td>
                      <td className="table-buttons">
                        <button onClick={() => handleEdit(expense)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(expense._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
