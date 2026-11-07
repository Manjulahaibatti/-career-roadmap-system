import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.png";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import "./Home.css";

const AnimatedNumber = ({ value, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId;
    const startedAt = performance.now();
    const duration = 900;

    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <>{displayValue}{suffix}</>;
};

function Home() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (target, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      openAuthModal("Create an account or login to access your personalized career tracking.");
      return;
    }
    navigate(target);
  };

  return (
    <div className="home">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="hero">
        {/* CAREER ROADMAP HERO IMAGE */}
        <img
          src={heroImage}
          alt="Career roadmap"
          className="hero-background"
        />

        {/* LIGHT OVERLAY */}
        <div className="hero-overlay"></div>

        {/* TEXT */}
        <div className="hero-content">
          <p className="tagline">
            <span className="plan-word">PLAN</span>. <span className="learn-word">LEARN</span>. <span className="achieve-word">ACHIEVE</span>.
          </p>

          <h1>
            Your Path.
            <br />
            <span>Your Future.</span>
          </h1>

          <p className="description">
            Personalized roadmaps, expert resources, and progress
            <br />
            tracking to guide you every step of the way.
          </p>

          <div className="hero-buttons">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="primary-btn"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Free"}</span>
              <span className="btn-arrow">→</span>
            </Link>

            <Link to="/careers" className="secondary-btn">
              <span>Explore Careers</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div
          className="stat"
          onClick={() => navigate("/about")}
          title="Start planning your career for free"
        >
          <div className="stat-icon">🎓</div>
          <div>
            <strong>Start Free</strong>
            <p>Career Planning</p>
          </div>
        </div>

        <div
          className="stat"
          onClick={() => navigate("/careers")}
          title="Explore comprehensive career directions"
        >
          <div className="stat-icon">🛣️</div>
          <div>
            <strong><AnimatedNumber value={500} suffix="+" /></strong>
            <p>Career Paths</p>
          </div>
        </div>

        <div
          className="stat"
          onClick={() => navigate("/resources")}
          title="Access curated high quality learning materials"
        >
          <div className="stat-icon">📚</div>
          <div>
            <strong><AnimatedNumber value={30} suffix="+" /></strong>
            <p>Resources</p>
          </div>
        </div>

        <div
          className="stat"
          onClick={() => navigate("/about")}
          title="Consistently rated highest by career switchers"
        >
          <div className="stat-icon">🏆</div>
          <div>
            <strong><AnimatedNumber value={95} suffix="%" /></strong>
            <p>Satisfaction</p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-section">
        <div className="section-title">
          <div></div>
          <h2>
            Why Choose <span>Career Roadmap System?</span>
          </h2>
          <div></div>
        </div>

        <div className="cards">
          <div
            className="card"
            onClick={() => handleFeatureClick("/roadmap")}
            title="Click to view personalized roadmaps"
          >
            <div className="card-icon purple">⌘</div>
            <div>
              <h3>Personalized Roadmaps</h3>
              <p>
                Get a step-by-step learning path tailored to your goals.
              </p>
            </div>
          </div>

          <div
            className="card"
            onClick={() => handleFeatureClick("/careers")}
            title="Click to view career options"
          >
            <div className="card-icon green">💼</div>
            <div>
              <h3>Multiple Career Options</h3>
              <p>
                Explore a wide range of career paths across different domains.
              </p>
            </div>
          </div>

          <div
            className="card"
            onClick={() => handleFeatureClick("/resources")}
            title="Click to explore curated resources"
          >
            <div className="card-icon orange">▱</div>
            <div>
              <h3>Curated Resources</h3>
              <p>
                Access handpicked courses, articles, videos, and practice materials.
              </p>
            </div>
          </div>

          <div
            className="card"
            onClick={() => handleFeatureClick("/dashboard", true)}
            title="Click to track your progress"
          >
            <div className="card-icon blue">↗</div>
            <div>
              <h3>Progress Tracking</h3>
              <p>
                Track your progress, complete milestones, and stay motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Home;