import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-icon" aria-hidden="true">🚀</div>
            <span>Career Roadmap System</span>
          </div>
          <p className="footer-desc">
            Empowering students, developers, and tech professionals to discover
            their trajectory, master in-demand skills, and achieve their career goals.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/careers">Explore Careers</Link>
            <Link to="/roadmap">Career Roadmaps</Link>
            <Link to="/resources">Curated Resources</Link>
            <Link to="/dashboard">User Dashboard</Link>
          </div>

          <div className="footer-col">
            <h4>Popular Paths</h4>
            <Link to="/roadmap/software-developer">Software Developer</Link>
            <Link to="/roadmap/data-analyst">Data Analyst</Link>
            <Link to="/roadmap/ui-ux-designer">UI/UX Designer</Link>
            <Link to="/roadmap/cybersecurity-analyst">Cybersecurity Analyst</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/login">Account Login</Link>
            <Link to="/register">Create Account</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Career Roadmap System. All rights reserved.</p>
        <p className="footer-tag">PLAN. LEARN. ACHIEVE.</p>
      </div>
    </footer>
  );
};

export default Footer;
