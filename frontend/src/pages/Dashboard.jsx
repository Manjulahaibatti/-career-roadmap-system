import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { progressAPI, careersAPI, roadmapsAPI, resourcesAPI } from "../services/api";
import { QUIZ_PASSING_SCORE, QUIZ_QUESTION_COUNT } from "../../../shared/lessonContent.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Dashboard.css";

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId;
    const startedAt = performance.now();
    const duration = 700;

    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setDisplayValue(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return displayValue;
};

const Dashboard = () => {
  const { user, token, updateUserCareer, dataSyncNotice } = useAuth();
  const navigate = useNavigate();

  const [careerSlugOverride, setCareerSlugOverride] = useState(null);
  const activeCareerSlug = careerSlugOverride || user?.currentCareer || "software-developer";
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [progressData, setProgressData] = useState({
    completedMilestones: [],
    progressPercentage: 0,
  });
  const [allCareers, setAllCareers] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [careerGoalError, setCareerGoalError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    let isCurrentRequest = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setCurrentRoadmap(null);
      setProgressData({
        completedMilestones: [],
        progressPercentage: 0,
      });
      try {
        const [careers, roadmap, progressRes, resources] = await Promise.all([
          careersAPI.getAll(),
          roadmapsAPI.getBySlug(activeCareerSlug).catch(() => null),
          progressAPI.getByCareer(token, activeCareerSlug).catch(() => null),
          resourcesAPI.getAll({ careerSlug: activeCareerSlug }).catch(() => []),
        ]);
        if (!isCurrentRequest) return;
        setAllCareers(careers);
        setCurrentRoadmap(roadmap);
        setProgressData(progressRes || { completedMilestones: [], progressPercentage: 0 });
        setRecommendedResources(resources.slice(0, 3));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isCurrentRequest = false;
    };
  }, [activeCareerSlug, token]);

  const handleCareerChange = async (slug) => {
    setCareerGoalError("");
    try {
      await updateUserCareer(slug);
      setCareerSlugOverride(slug);
    } catch (error) {
      setCareerGoalError(error.message || "Unable to save your career goal.");
    }
  };

  const totalSteps = currentRoadmap?.steps?.length || 0;
  const completedStepNumbers = new Set([
    ...(progressData.completedMilestones || []),
    ...(progressData.courseProgress || [])
      .filter((lesson) =>
        lesson.readingCompleted &&
        lesson.quizPassed &&
        lesson.quizAnswers?.length === QUIZ_QUESTION_COUNT &&
        lesson.quizScore >= QUIZ_PASSING_SCORE &&
        Boolean(lesson.subjectiveResponse?.trim()) &&
        lesson.assignmentCompleted
      )
      .map((lesson) => lesson.stepNumber),
  ].filter(
    (stepNumber) =>
      Number.isInteger(stepNumber) && stepNumber > 0 && stepNumber <= totalSteps
  ));
  const completedCount = completedStepNumbers.size;
  const progressPercent = totalSteps
    ? Math.round((completedCount / totalSteps) * 100)
    : 0;

  // Selected career display details
  const activeCareerObj = allCareers.find((c) => c.slug === activeCareerSlug) || {
    name: "Software Developer",
    difficulty: "Intermediate",
    learningTime: "6-9 Months",
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        {/* WELCOME BANNER */}
        <section className="welcome-banner">
          <div className="welcome-text">
            <div className="welcome-badge">✦ Career Hub</div>
            <h1>
              Welcome back, <span>{user?.name || "Learner"}</span>!
            </h1>
            <p>
              Track your trajectory, complete learning milestones, and elevate your tech career.
            </p>
          </div>

          <div className="career-goal-card">
            <div className="goal-label">Current Career Focus</div>
            {careerGoalError && <p role="alert">{careerGoalError}</p>}
            <div className="goal-select-wrapper">
              <select
                value={activeCareerSlug}
                onChange={(e) => handleCareerChange(e.target.value)}
                className="career-select"
              >
                {allCareers.map((career) => (
                  <option key={career.slug} value={career.slug}>
                    {career.icon} {career.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="goal-meta">
              {activeCareerObj.difficulty} • {activeCareerObj.learningTime}
            </span>
          </div>
        </section>

        {dataSyncNotice && (
          <div className="data-sync-notice" role="status">
            {dataSyncNotice}
          </div>
        )}

        {/* PROGRESS OVERVIEW & QUICK ACTIONS */}
        <div className="dashboard-grid">
          {/* MAIN PROGRESS CARD */}
          <section className="dashboard-card progress-overview-card">
            <div className="card-header">
              <div>
                <h2>Your Career Progress</h2>
                <p>
                  {completedCount} of {totalSteps} roadmap steps completed for {activeCareerObj.name}
                </p>
              </div>
              <div className="progress-badge progress-badge-green">{progressPercent}% Completed</div>
            </div>

            {/* PROGRESS BAR */}
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill progress-bar-fill-green"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="progress-bar-glow"></div>
              </div>
            </div>

            <div className="progress-stats-row">
              <div className="p-stat">
                <span className="p-stat-number completed-stat-number"><AnimatedNumber value={completedCount} /></span>
                <span className="p-stat-label">Milestones Completed</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-number"><AnimatedNumber value={totalSteps - completedCount} /></span>
                <span className="p-stat-label">Remaining Steps</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-number"><AnimatedNumber value={totalSteps} /></span>
                <span className="p-stat-label">Total Milestones</span>
              </div>
            </div>

            {/* MILESTONES PREVIEW */}
            <div className="roadmap-preview-box">
              <div className="box-header">
                <h3>Milestone Checklist</h3>
                {totalSteps > 0 && completedCount === totalSteps ? (
                  <span className="roadmap-completed-label">✓ Completed</span>
                ) : (
                  <Link to={`/roadmap/${activeCareerSlug}`} className="box-link">
                    Open Interactive Roadmap →
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="loading-state">Loading milestones...</div>
              ) : currentRoadmap?.steps?.length ? (
                <div className="milestones-compact-list">
                  {currentRoadmap.steps.map((step) => {
                    const isCompleted = completedStepNumbers.has(step.stepNumber);
                    return (
                      <div
                        key={step.stepNumber}
                        className={`compact-milestone-item ${
                          isCompleted ? "done" : ""
                        }`}
                        onClick={() => navigate(`/roadmap/${activeCareerSlug}`)}
                      >
                        <span className="check-indicator">
                          {isCompleted ? "✓" : "○"}
                        </span>
                        <div className="milestone-info">
                          <span className="step-tag">Step {step.stepNumber}</span>
                          <span className="step-title">{step.title}</span>
                        </div>
                        <span className="step-status">
                          {isCompleted ? "Completed" : "In Progress"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">No roadmap steps found.</div>
              )}
            </div>
          </section>

          {/* SIDEBAR: QUICK ACTIONS & RECOMMENDED PATHS */}
          <div className="dashboard-sidebar">
            {/* QUICK ACTIONS */}
            <section className="dashboard-card quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="actions-list">
                <Link to="/careers" className="action-item">
                  <div className="action-icon">💼</div>
                  <div className="action-info">
                    <strong>Explore Careers</strong>
                    <span>Browse all career paths</span>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to={`/roadmap/${activeCareerSlug}`} className="action-item">
                  <div className="action-icon">🛣️</div>
                  <div className="action-info">
                    <strong>Build Roadmap</strong>
                    <span>Step-by-step learning breakdown</span>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to={`/roadmap/${activeCareerSlug}`} className="action-item">
                  <div className="action-icon">↗</div>
                  <div className="action-info">
                    <strong>Track Progress</strong>
                    <span>Mark milestones as complete</span>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to="/resources" className="action-item">
                  <div className="action-icon">📚</div>
                  <div className="action-info">
                    <strong>View Resources</strong>
                    <span>Courses, articles, and practice</span>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>
              </div>
            </section>

            {/* RECOMMENDED CAREER PATHS */}
            <section className="dashboard-card recommended-card">
              <h3>Recommended Career Paths</h3>
              <div className="rec-career-list">
                {[
                  { name: "Software Developer", slug: "software-developer", icon: "💻" },
                  { name: "Data Analyst", slug: "data-analyst", icon: "📊" },
                  { name: "UI/UX Designer", slug: "ui-ux-designer", icon: "🎨" },
                  { name: "Cybersecurity Analyst", slug: "cybersecurity-analyst", icon: "🛡️" },
                ].map((c) => (
                  <div
                    key={c.slug}
                    className={`rec-career-item ${
                      activeCareerSlug === c.slug ? "selected" : ""
                    }`}
                    onClick={() => handleCareerChange(c.slug)}
                  >
                    <div className="rec-career-left">
                      <span className="rec-icon">{c.icon}</span>
                      <span className="rec-name">{c.name}</span>
                    </div>
                    {activeCareerSlug === c.slug ? (
                      <span className="active-tag">Active</span>
                    ) : (
                      <button className="switch-btn">Switch</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* RECOMMENDED RESOURCES SECTION */}
        <section className="dashboard-resources-section">
          <div className="section-head">
            <div>
              <h2>Recommended Resources for {activeCareerObj.name}</h2>
              <p>Curated learning materials to help you complete your next milestone</p>
            </div>
            <Link to="/resources" className="view-all-link">
              View All Resources →
            </Link>
          </div>

          <div className="resources-grid-dashboard">
            {recommendedResources.map((res) => (
              <div key={res._id || res.title} className="dash-res-card">
                <div className="dash-res-category">{res.category}</div>
                <h4>{res.title}</h4>
                <p>{res.description}</p>
                <div className="dash-res-footer">
                  <span className="dash-res-diff">{res.difficulty}</span>
                  <a
                    href={res.link}
                    target="_blank"
                    rel="noreferrer"
                    className="dash-res-btn"
                  >
                    Explore ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
