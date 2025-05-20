import "./App.css";
import HomePage from "./pages/HomePage";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import AIInsightsPage from "./pages/AIinsightsPage";
import ProfilePage from "./pages/ProfilePage";
import AddExpensePage from "./pages/AddExpensePage";
import BudgetSettingPage from "./pages/BudgetSettingPage";
import PrivateRoute from "./components/PrivateRoutes";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai-insights" element={<AIInsightsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard/add-expense" element={<AddExpensePage />} />
          <Route
            path="/dashboard/budget-settings"
            element={<BudgetSettingPage />}
          />
        </Route>
         <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </div>
  );
}

export default App;
