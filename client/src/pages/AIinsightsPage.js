import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/aiinsightPage.css";
import { Line, Bar } from "react-chartjs-2";
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

export default function AIinsightsPage() {
  const [activeLink, setActiveLink] = useState("dashboard");
  const [allExpenses, setAllExpenses] = useState([]);
  const [MonthlySpending, setMonthlySpending] = useState({});
  const [userExpense, setUserExpense] = useState([]);
  const [userBudget, setUserBudget] = useState();
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);
  const [SummaryJson, setSummaryJson] = useState({});
  const [aiInsights, setAiInsights] = useState(null);
  const [parsedInsight, setParsedInsight] = useState(null);

  const navigate = useNavigate();

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  console.log("Monthly Spending:", MonthlySpending);
  // get all user expenses
  useEffect(() => {
    const fetchAllExpenses = async () => {
      try {
        const response = await axios.get(
          "https://expense-tracker-ai-ci4w.onrender.com/expense",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAllExpenses(response.data);
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

  //get user expenses this month
  // This effect fetches user expenses for the current month
  useEffect(() => {
    const fetchUserExpenses = async () => {
      try {
        const response = await axios.get(
          "https://expense-tracker-ai-ci4w.onrender.com/expense/monthly",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserExpense(response.data);
        console.log("Fetched expenses:", response.data);

        // Calculate total spending
        const total = response.data.reduce(
          (acc, expense) => acc + expense.amount,
          0
        );
        setTotalSpending(total);
      } catch (error) {
        console.error("Error fetching user expenses:", error);
      }
    };
    fetchUserExpenses();
  }, []);

  //get user budget
  useEffect(() => {
    const fetchUserBudget = async () => {
      try {
        const response = await axios.get(
          "https://expense-tracker-ai-ci4w.onrender.com/budget/user",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserBudget(response.data);
        setTotalBudget(response.data.totalBudget);
        console.log("Fetched budget:", response.data);
      } catch (error) {
        console.error("Error fetching user budget:", error);
      }
    };
    fetchUserBudget();
  }, []);

  useEffect(() => {
    if (userBudget && userExpense.length > 0) {
      const categoryBudgetMap = {};
      const categorySpendingMap = {};

      // Create a map for each category budget
      userBudget.categories.forEach((cat) => {
        categoryBudgetMap[cat.name.toLowerCase()] = cat.budgetAmount;
      });

      // Sum expenses per category
      userExpense.forEach((exp) => {
        const cat = exp.category.toLowerCase();
        if (!categorySpendingMap[cat]) {
          categorySpendingMap[cat] = 0;
        }
        categorySpendingMap[cat] += exp.amount;
      });

      // Format the string
      const parts = {};
      parts["summary"] = [];

      for (const category in categoryBudgetMap) {
        const budgetAmount = categoryBudgetMap[category] || 0;
        const spentAmount = categorySpendingMap[category] || 0;
        parts["summary"].push({
          category: capitalize(category),
          spent: spentAmount,
          budget: budgetAmount,
        });
      }

      parts["Total Monthly Budget"] = userBudget.totalBudget;
      setSummaryJson(parts);
    }
  }, [userBudget, userExpense]);
  console.log("Summary String:", SummaryJson);

  // Capitalize the first letter of each word
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // ai-insights
  // Fetch AI insights only after SummaryJson is set
  useEffect(() => {
    if (!SummaryJson) return; // Don't run if SummaryJson is not set
    const fetchAIInsights = async () => {
      try {
        const response = await axios.post(
          "https://expense-tracker-ai-ci4w.onrender.com/ai",
          {
            summary: SummaryJson,
          }
        );
        setAiInsights(response.data.insight);
      } catch (err) {
        console.error("Error fetching AI insights:", err);
      }
    };

    fetchAIInsights();
  }, [SummaryJson]); // This effect will run when SummaryJson changes

  //parse the aiInsight
  useEffect(() => {
    if (!aiInsights) return;

    const arrayOnly = aiInsights.match(/\[.*\]/s)?.[0]; // `s` flag allows multiline match
    if (arrayOnly) {
      try {
        const parsed = JSON.parse(arrayOnly);
        setParsedInsight(parsed);
        console.log("parsed success", parsed);
      } catch (e) {
        console.error("Failed to parse AI insights:", e.message);
      }
    } else {
      console.error("No array found in the input string");
    }
  }, [aiInsights]);

  // ARRAY
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0 = January, 4 = May,

  const monthsInYear = Array.from({ length: currentMonthIndex + 1 }, (_, i) => {
    const date = new Date(currentYear, i);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  });

  const Monthlyarray = [];
  const foodArray = [];
  const transportArray = [];
  const entertainmentArray = [];

  // array for monthly spending comparison chart
  monthsInYear.forEach((data) => {
    if (!MonthlySpending[data]) {
      Monthlyarray.push(0);
    } else {
      Monthlyarray.push(MonthlySpending[data].total);
    }
  });

  //array for the food category monthly
  monthsInYear.forEach((data) => {
    if (!MonthlySpending[data]) {
      foodArray.push(0);
    } else if (!MonthlySpending[data].food) {
      foodArray.push(0);
    } else {
      foodArray.push(MonthlySpending[data].food);
    }
  });

  // array for the transport category monthly
  monthsInYear.forEach((data) => {
    if (!MonthlySpending[data]) {
      transportArray.push(0);
    } else if (!MonthlySpending[data].transportation) {
      transportArray.push(0);
    } else {
      transportArray.push(MonthlySpending[data].transportation);
    }
  });

  // array for the entertainment category monthly
  monthsInYear.forEach((data) => {
    if (!MonthlySpending[data]) {
      entertainmentArray.push(0);
    } else if (!MonthlySpending[data].entertainment) {
      entertainmentArray.push(0);
    } else {
      entertainmentArray.push(MonthlySpending[data].entertainment);
    }
  });

  const data1 = {
    labels: monthsInYear,
    datasets: [
      {
        label: "Transport",
        data: transportArray,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: "Food",
        data: foodArray,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
      {
        label: "Entertainment",
        data: entertainmentArray,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const option1 = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const data2 = {
    labels: monthsInYear,
    datasets: [
      {
        label: "Monthly Spending",
        data: Monthlyarray,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)", // Jan
          "rgba(54, 162, 235, 0.7)", // Feb
          "rgba(255, 206, 86, 0.7)", // Mar
          "rgba(75, 192, 192, 0.7)", // Apr
          "rgba(153, 102, 255, 0.7)", // May
          "rgba(255, 159, 64, 0.7)", // Jun
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const option2 = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="ai-insights-page">
      <header className="ai-insights-header">
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

      <main className="ai-insights-main">
        <div className="ai-insights-sidebar">
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
              <Link to="/dashboard" className="sidebar-link">
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

        <div className="ai-insights-content">
          <h1>Your Personalized Finicial Advice</h1>
          <section className="top-section">
            <h2>Monthly Budget Overview</h2>
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
          </section>

          <section className="recommendation-section">
            <h2>AI Insights</h2>
            <div className="card-container">
              {parsedInsight ? (
                (() => {
                  try {
                    return parsedInsight.map((cat, index) => (
                      <div className="advice-card" key={index}>
                        <div className="advice-icon">💡</div>
                        <h3>{cat.category}</h3>
                        <p>{cat.advice}</p>
                      </div>
                    ));
                  } catch (e) {
                    console.error("Failed to parse AI insights:", e.message);
                    return <p>Something went wrong while parsing insights.</p>;
                  }
                })()
              ) : (
                <div className="advice-card">
                  <div className="advice-icon">💡</div>
                  <p>BE PATIENT WHILE WE ANALYZE YOUR SPENDING HABITS...</p>
                </div>
              )}
            </div>
          </section>

          <section className="trends-section">
            <h2>Spending Trends</h2>
            <div className="spending-trends">
              <div className="trend-card">
                <h3>Category Spending</h3>
                <Line data={data1} options={option1} />
              </div>

              <div className="trend-card">
                <h3>Monthly Spending Comparison</h3>
                <Bar data={data2} options={option2} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
