import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import financeIMG from "../images/undraw_finance_m6vw.svg";

export default function HomePage() {
  return (
    <div className="homepage">
      <header className="header">
        <div className="logo-container">
          <i class="fa-solid fa-hurricane logo-icon"></i>
          <h1 className="logo">
            SpendSmart
          </h1>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/login" className="firstlink">
                Login
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

      <section className="section1">
        <div className="hero-text">
          <h1>Take Control of Your Finances Today</h1>
          <p>
            Track expenses, set budgets, and get AI-driven insights. Intelligent
            expense tracking and financial insights powered by cutting-edge AI
            technology.
          </p>
          <Link to="/register" className="hero-link">
            Get started
          </Link>
        </div>

        <div className="hero-img">
          <img src={financeIMG} alt="hero-img" />
        </div>
      </section>

      <section className="section2">
        <div className="features">
          <div className="feature-icon">
            {" "}
            <i class="fa-solid fa-check"></i>
          </div>
          <p className="feature-heading">AI-Powered Insights</p>
          <p className="feature-description">
            Real-time financial recommendations <br /> tailored to your spending
            habits.
          </p>
        </div>

        <div className="features">
          <div className="feature-icon">
            {" "}
            <i class="fa-brands fa-nfc-directional"></i>
          </div>
          <p className="feature-heading">Smart Tracking</p>
          <p className="feature-description">
            Automatically categorize and track your <br /> expenses with machine
            learning.
          </p>
        </div>

        <div className="features">
          <div className="feature-icon">
            {" "}
            <i class="fa-solid fa-xmark"></i>
          </div>
          <p className="feature-heading">Budget Protection</p>
          <p className="feature-description">
            Proactive alerts and strategies to keep your <br /> finances on
            track.
          </p>
        </div>
      </section>


            <section className="section3 reviews">
          <h2>What Our Users Say</h2>
          <div className="review">
              <p>"SpendSmart helped me save $500 in my first month!"</p>
          </div>
          <div className="review">
              <p>"The AI insights are incredibly accurate and helpful."</p>
          </div>
      </section>

      <footer className="footer">
          <div className="footer-content">
              <p>&copy; 2023 SpendSmart. All rights reserved.</p>
              <div className="footer-links">
                  <a href="/about">About Us</a>
                  <a href="/contact">Contact</a>
                  <a href="/privacy">Privacy Policy</a>
              </div>
          </div>
      </footer>
    </div>
  );
}
