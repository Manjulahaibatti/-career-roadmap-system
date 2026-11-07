import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { careersAPI } from "../services/api";
import { getGeneratedCareerCategoryCounts } from "../../../shared/careerCatalog.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Careers.css";

const careerCategoryCounts = getGeneratedCareerCategoryCounts();

const Careers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [careerType, setCareerType] = useState("All");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFitLab, setShowFitLab] = useState(false);
  const [fitCareerSlug, setFitCareerSlug] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [experienceLevel, setExperienceLevel] = useState("Starting fresh");
  const navigate = useNavigate();

  useEffect(() => {
    const loadCareers = async () => {
      setLoading(true);
      try {
        const data = await careersAPI.getAll({
          search: searchTerm || undefined,
          domain: selectedDomain !== "All" ? selectedDomain : undefined,
          difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
          careerType: careerType !== "All" ? careerType : undefined,
        });
        setCareers(data);
        setCurrentPage(1);
        setFitCareerSlug((currentSlug) =>
          !data.some((career) => career.slug === currentSlug) && data.length > 0
            ? data[0].slug
            : currentSlug
        );
      } catch (err) {
        console.error("Error loading careers:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadCareers();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, careerType, selectedDomain, selectedDifficulty]);

  const fitCareer = careers.find((career) => career.slug === fitCareerSlug) || careers[0];
  const experienceFactor = {
    "Starting fresh": 1.15,
    "Some related skills": 0.95,
    "Already working in tech": 0.78,
  }[experienceLevel];
  const difficultyFactor = {
    Beginner: 0.9,
    Intermediate: 1,
    Advanced: 1.15,
  }[fitCareer?.difficulty] || 1;
  const monthsMatch = fitCareer?.learningTime?.match(/\d+/);
  const baseMonths = Number(monthsMatch?.[0]) || 6;
  const estimatedWeeks = Math.max(
    4,
    Math.round((baseMonths * 4.3 * (8 / weeklyHours) * experienceFactor * difficultyFactor) / 1.2)
  );
  const readinessScore = Math.min(
    96,
    Math.round(48 + weeklyHours * 2.2 + (1.15 - experienceFactor) * 30 - (difficultyFactor - 1) * 20)
  );
  const firstMove = fitCareer?.skills?.[0]
    ? fitCareer.careerType === "Competitive Exam"
      ? `Study ${fitCareer.skills[0]} and practice previous exam questions`
      : fitCareer.careerType === "Government"
        ? `Review eligibility and learn the basics of ${fitCareer.skills[0]}`
        : fitCareer.careerType === "Non-Technical" || fitCareer.careerType === "Private"
          ? `Create a work sample that demonstrates ${fitCareer.skills[0]}`
          : `Build one small project using ${fitCareer.skills[0]}`
    : "Complete the first roadmap milestone";
  const pageSize = 30;
  const totalPages = Math.ceil(careers.length / pageSize);
  const visibleCareers = careers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const domains = [
    "All",
    "Software & Engineering",
    "Data & AI",
    "Design & Creative",
    "Security & DevOps",
    "Product & Management",
    "Marketing & Growth",
  ];

  return (
    <div className="careers-page">
      <Navbar />

      <main className="careers-container">
        {/* HERO SECTION */}
        <section className="careers-hero" style={{ textAlign: "center", alignItems: "center" }}>
          <div className="careers-tag" style={{ textAlign: "center" }}>✦ Explore Modern Trajectories</div>
          <h1 style={{ textAlign: "center", width: "100%" }}>
            Discover Your Next <span>Career Direction</span>
          </h1>
          <p style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
            Explore high-growth technical and business trajectories, inspect core skill requirements, and follow
            battle-tested milestone roadmaps.
          </p>

          {/* CAREER CATEGORY FILTERS */}
          <div className="tech-filter-tabs">
            <button
              className={`tech-tab ${careerType === "All" ? "active" : ""}`}
              onClick={() => {
                setCareerType("All");
                setSelectedDomain("All");
              }}
            >
              All Paths ({careerCategoryCounts.All})
            </button>
            {["Technical", "Non-Technical", "Government", "Private", "Competitive Exam"].map((type) => (
              <button
                key={type}
                className={`tech-tab ${careerType === type ? "active" : ""}`}
                onClick={() => {
                  setCareerType(type);
                  setSelectedDomain("All");
                }}
              >
                {type === "Technical" ? "💻 " : type === "Government" ? "🏛️ " : type === "Competitive Exam" ? "🎓 " : ""}
                {type === "Competitive Exam" ? "Competitive Exams" : type} ({careerCategoryCounts[type]})
              </button>
            ))}
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="careers-filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search careers, skills, or roles (e.g. React, Python, Cloud, Product, Marketing)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="career-search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-selects">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="difficulty-select"
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* DOMAIN PILLS */}
          <div className="category-pills">
            {domains.map((dom) => (
              <button
                key={dom}
                className={`category-pill ${
                  selectedDomain === dom ? "active" : ""
                }`}
                onClick={() => setSelectedDomain(dom)}
              >
                {dom}
              </button>
            ))}
          </div>
        </section>

        {/* CAREER FIT LAB */}
        <section className={`career-fit-lab ${showFitLab ? "is-open" : ""}`}>
          <div className="fit-lab-header">
            <div>
              <span className="fit-lab-kicker">✦ Career Fit Lab</span>
              <h2>Choose a career path and plan your first move.</h2>
              <p>Set your starting point and weekly learning time for a practical next step.</p>
            </div>
            <button
              type="button"
              className="fit-lab-toggle"
              onClick={() => setShowFitLab((open) => !open)}
            >
              {showFitLab ? "Close Lab" : "Try the Lab"}
              <span>{showFitLab ? "↑" : "→"}</span>
            </button>
          </div>

          {showFitLab && fitCareer && (
            <div className="fit-lab-content">
              <div className="fit-lab-controls">
                <label>
                  Target career
                  <select value={fitCareerSlug} onChange={(e) => setFitCareerSlug(e.target.value)}>
                    {careers.map((career) => (
                      <option key={career.slug} value={career.slug}>{career.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Your starting point
                  <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                    <option>Starting fresh</option>
                    <option>Some related skills</option>
                    <option>Already working in tech</option>
                  </select>
                </label>

                <label className="hours-control">
                  <span>Weekly learning time <strong>{weeklyHours} hrs</strong></span>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  />
                </label>
              </div>

              <div className="fit-lab-results">
                <div className="fit-result-main">
                  <span className="fit-result-label">First milestone estimate</span>
                  <strong>{estimatedWeeks} weeks</strong>
                  <p>at {weeklyHours} focused hours each week</p>
                </div>
                <div className="fit-result-score">
                  <span>Readiness signal</span>
                  <strong>{readinessScore}%</strong>
                  <div className="fit-score-track"><i style={{ width: `${readinessScore}%` }} /></div>
                </div>
                <div className="fit-result-next">
                  <span>Best first move</span>
                  <strong>{firstMove}</strong>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/roadmap/${fitCareer.slug}?level=${encodeURIComponent(experienceLevel)}&hours=${weeklyHours}`
                      )
                    }
                  >
                    Open roadmap <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CAREERS CARDS GRID */}
        {loading ? (
          <div className="careers-loading">
            <div className="mini-spinner"></div>
            <span>Loading career paths...</span>
          </div>
        ) : careers.length === 0 ? (
          <div className="careers-empty">
            <h3>No matching careers found</h3>
            <p>Try adjusting your search criteria or filter options.</p>
            <button
              className="reset-filter-btn"
              onClick={() => {
                setSearchTerm("");
                setCareerType("All");
                setSelectedDomain("All");
                setSelectedDifficulty("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <section className="careers-grid">
            {visibleCareers.map((career) => (
              <Link
                key={career.slug}
                to={`/roadmap/${career.slug}`}
                className="career-card"
              >
                <div className="career-card-top">
                  <div className="career-icon-box">{career.icon || "💼"}</div>
                  <div className="career-badges">
                    <span className={`diff-badge ${career.difficulty?.toLowerCase()}`}>
                      {career.difficulty}
                    </span>
                    <span className="domain-badge">
                      {career.careerType || (career.isTechnical ? "Technical" : "Non-Technical")}
                    </span>
                    {career.industry && <span className="domain-badge">{career.industry}</span>}
                    <span className="domain-badge">{career.domain || "Technology"}</span>
                  </div>
                </div>

                <h3 className="career-name">{career.name}</h3>

                <p className="career-desc">{career.description}</p>

                <div className="career-skills-section">
                  <span className="skills-label">Core Skills:</span>
                  <div className="skills-tags">
                    {career.skills?.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {career.skills?.length > 5 && (
                      <span className="skill-more">
                        +{career.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="career-meta-row">
                  <div className="meta-item">
                    <span className="meta-label">Est. Time</span>
                    <span className="meta-value">{career.learningTime}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Est. Salary</span>
                    <span className="meta-value">{career.averageSalary}</span>
                  </div>
                </div>

                <div className="career-card-action">
                  <span className="view-roadmap-btn">
                    <span>View Roadmap</span>
                    <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </section>
        )}
        {!loading && careers.length > 0 && (
          <nav className="career-pagination" aria-label="Career pages">
            <span>
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, careers.length)} of {careers.length} career paths
            </span>
            <div>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
