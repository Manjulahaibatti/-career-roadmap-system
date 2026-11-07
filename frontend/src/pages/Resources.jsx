import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resourcesAPI, careersAPI, progressAPI } from "../services/api";
import { useAuth } from "../context/useAuth";
import { QUIZ_PASSING_SCORE, QUIZ_QUESTION_COUNT } from "../../../shared/lessonContent.js";
import { createCareerRoadmap } from "../../../shared/careerCatalog.js";
import { createCareerCourseResources } from "../../../shared/careerCourseResources.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Resources.css";

const EXPANDED_RESOURCE_CATEGORIES = new Set(["Articles", "Books", "Practice", "Projects"]);
const RESOURCE_CATEGORY_DISPLAY_LIMIT = 15;

const RESOURCE_CAREER_TYPES = [
  { value: "All", label: "All Resources" },
  { value: "Technical", label: "💻 Technical" },
  { value: "Non-Technical", label: "📚 Non-Technical" },
  { value: "Government", label: "🏛️ Government" },
  { value: "Private", label: "🏢 Private" },
  { value: "Competitive Exam", label: "🎓 Competitive Exams" },
];

const careerMatchesType = (career, careerType) => {
  if (careerType === "All") return true;
  if (careerType === "Private") return career.sector === "Private";
  return career.careerType === careerType;
};

const getResourceIdentity = (resource) => {
  if (resource.isCareerResource && resource.careerSlug && resource.stepNumber) {
    return `${resource.category}:${resource.careerSlug}:${resource.stepNumber}`;
  }
  return `title:${String(resource.title || "").trim().toLowerCase()}`;
};

const uniqueResources = (resources) => [
  ...new Map(resources.map((resource) => [getResourceIdentity(resource), resource])).values(),
];

const Resources = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCareer = searchParams.get("careerSlug") || "all";

  const [resources, setResources] = useState([]);
  const [allCareers, setAllCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCareer, setSelectedCareer] = useState(initialCareer);
  const [careerProgress, setCareerProgress] = useState({ careerSlug: "", completedSteps: [] });
  const [careerTypeFilter, setCareerTypeFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const visibleCareers = allCareers.filter((career) =>
    careerMatchesType(career, careerTypeFilter)
  );
  const searchCareer = allCareers.find(
    (career) =>
      searchTerm.trim() &&
      career.name.trim().toLowerCase() === searchTerm.trim().toLowerCase()
  );
  const resourceCareerSlug = selectedCareer !== "all"
    ? selectedCareer
    : searchCareer?.slug;
  const resourceSearchTerm = searchCareer ? undefined : searchTerm || undefined;

  const categories = [
    "All",
    "Courses",
    "Articles",
    "Books",
    "Practice",
    "Projects",
  ];

  const handleCareerTypeChange = (careerType) => {
    setCareerTypeFilter(careerType);
    setSearchTerm("");
    setSelectedCareer("all");
    setTechFilter(
      careerType === "Technical"
        ? "Technical"
        : careerType === "Non-Technical"
          ? "Non-Technical"
          : "All"
    );
    setSearchParams({});
  };

  // Load careers for filter dropdown
  useEffect(() => {
    careersAPI
      .getAll()
      .then((data) => setAllCareers(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const isTechParam =
          techFilter === "Technical"
            ? "true"
            : techFilter === "Non-Technical"
            ? "false"
            : undefined;

        const data = await resourcesAPI.getAll({
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          careerSlug: resourceCareerSlug,
          isTechnical: isTechParam,
          search: resourceSearchTerm,
        });
        if (
          !EXPANDED_RESOURCE_CATEGORIES.has(selectedCategory) ||
          resourceCareerSlug ||
          resourceSearchTerm
        ) {
          setResources(
            EXPANDED_RESOURCE_CATEGORIES.has(selectedCategory)
              ? uniqueResources(data).slice(0, RESOURCE_CATEGORY_DISPLAY_LIMIT)
              : data
          );
          return;
        }

        const mergedResources = new Map(
          uniqueResources(data).map((resource) => [getResourceIdentity(resource), resource])
        );
        const candidateCareers = allCareers
          .filter((career) => careerMatchesType(career, careerTypeFilter))
          .filter((career) =>
            techFilter === "All" ||
            career.isTechnical === (techFilter === "Technical")
          );
        for (const career of candidateCareers) {
          const careerResources = createCareerCourseResources(
            career,
            createCareerRoadmap(career)
          );
          for (const resource of careerResources) {
            if (
              resource.category !== selectedCategory ||
              (techFilter !== "All" && resource.isTechnical !== (techFilter === "Technical"))
            ) {
              continue;
            }
            const identity = getResourceIdentity(resource);
            if (!mergedResources.has(identity)) mergedResources.set(identity, resource);
            if (mergedResources.size >= RESOURCE_CATEGORY_DISPLAY_LIMIT) break;
          }
          if (mergedResources.size >= RESOURCE_CATEGORY_DISPLAY_LIMIT) break;
        }

        setResources(
          Array.from(mergedResources.values()).slice(0, RESOURCE_CATEGORY_DISPLAY_LIMIT)
        );
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResources, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, resourceCareerSlug, resourceSearchTerm, techFilter, careerTypeFilter, allCareers]);

  useEffect(() => {
    let isCurrentRequest = true;

    if (selectedCareer === "all") {
      return () => {
        isCurrentRequest = false;
      };
    }

    progressAPI.getByCareer(token, selectedCareer)
      .then((progress) => {
        if (!isCurrentRequest) return;
        const verifiedSteps = (progress.courseProgress || [])
          .filter((lesson) =>
            lesson.readingCompleted &&
            lesson.quizPassed &&
            lesson.quizAnswers?.length === QUIZ_QUESTION_COUNT &&
            lesson.quizScore >= QUIZ_PASSING_SCORE &&
            Boolean(lesson.subjectiveResponse?.trim()) &&
            lesson.assignmentCompleted
          )
          .map((lesson) => lesson.stepNumber);
        setCareerProgress({
          careerSlug: selectedCareer,
          completedSteps: [
            ...new Set([...(progress.completedMilestones || []), ...verifiedSteps]),
          ],
        });
      })
      .catch((error) => {
        console.error("Error loading completed career steps:", error);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedCareer, token]);

  const completedSteps =
    careerProgress.careerSlug === selectedCareer
      ? careerProgress.completedSteps
      : [];

  return (
    <div className="resources-page">
      <Navbar />

      <main className="resources-container">
        {/* HERO SECTION */}
        <section className="resources-hero" style={{ textAlign: "center", alignItems: "center" }}>
          <div className="resources-tag" style={{ textAlign: "center" }}>✦ Knowledge Vault</div>
          <h1 style={{ textAlign: "center", width: "100%" }}>
            Curated <span>Learning Resources</span>
          </h1>
          <p style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
            Explore learning materials for technical, non-technical, government, private-sector,
            and competitive-exam pathways. Choose a career to see resources from its complete roadmap.
          </p>

          {/* CAREER TYPE FILTERS */}
          <div className="resources-type-tabs" aria-label="Filter resources by career type">
            {RESOURCE_CAREER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`resources-type-tab ${careerTypeFilter === value ? "active" : ""}`}
                aria-pressed={careerTypeFilter === value}
                onClick={() => handleCareerTypeChange(value)}
              >
                {value === "All" ? `${label} (${resources.length})` : label}
              </button>
            ))}
          </div>

          {/* SEARCH & FILTERS */}
          <div className="resources-search-bar">
            <div className="res-input-wrapper">
              <span className="res-search-icon">🔍</span>
              <input
                id="resource-search"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="res-search-input"
              />
              {searchTerm && (
                <button
                  className="res-clear-btn"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="res-career-controls">
              <select
                value={selectedCareer}
                onChange={(e) => {
                  const careerSlug = e.target.value;
                  const career = allCareers.find((item) => item.slug === careerSlug);
                  setSelectedCareer(careerSlug);
                  setSearchTerm("");
                  setTechFilter(
                    careerSlug === "all"
                      ? careerTypeFilter === "Technical"
                        ? "Technical"
                        : careerTypeFilter === "Non-Technical"
                          ? "Non-Technical"
                          : "All"
                      : career?.isTechnical
                        ? "Technical"
                        : "Non-Technical"
                  );
                  setSearchParams(careerSlug === "all" ? {} : { careerSlug });
                }}
                className="res-career-select"
              >
                <option value="all">
                  {careerTypeFilter === "All" ? "All Career Paths" : `All ${careerTypeFilter} Paths`}
                </option>
                {visibleCareers.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSelectedCareer("all");
                  setSelectedCategory("All");
                  setCareerTypeFilter("All");
                  setTechFilter("All");
                  setSearchTerm("");
                  setSearchParams({});
                }}
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* RESOURCE CARDS GRID */}
        {loading ? (
          <div className="resources-loading">
            <div className="mini-spinner"></div>
            <span>Fetching curated resources...</span>
          </div>
        ) : resources.length === 0 ? (
          <div className="resources-empty">
            <h3>No resources found</h3>
            <p>Try a different search term. Every selected career includes courses, articles, books, practice labs, and projects.</p>
          </div>
        ) : (
          <>
            <div className="resource-results-bar">
              <div>
                <span className="results-kicker">Learning library</span>
                <strong>{resources.length} curated resources</strong>
              </div>
              <span className="results-context">
                {selectedCategory === "All" ? "All formats" : selectedCategory}
                {resourceCareerSlug
                  ? ` · ${allCareers.find((career) => career.slug === resourceCareerSlug)?.name || "Career"} resources`
                  : " · Search or select a career to see its complete roadmap resources"}
              </span>
            </div>
            {selectedCareer !== "all" && resources.some((item) => item.isCareerResource) && (
              <p className="roadmap-resource-note">
                Includes {resources.filter((item) => item.isCareerResource).length} career-specific resources
                in this view. Open a course, article, book guide, practice lab, or project for the full content.
              </p>
            )}

            <section className="resources-grid">
              {resources.map((item) => (
                <article
                  key={item._id || item.id || item.title}
                  className={`resource-card ${
                    item.isCareerResource && completedSteps.includes(item.stepNumber)
                      ? "resource-card-completed"
                      : ""
                  }`}
                >
                <div className="res-card-top">
                  <span className="res-category-badge">{item.category}</span>
                  {item.isCareerResource && completedSteps.includes(item.stepNumber) ? (
                    <span className="resource-completion-badge">✓ Step {item.stepNumber} Completed</span>
                  ) : (
                    <span className="res-provider-badge">
                      {item.provider || "Open Community"}
                    </span>
                  )}
                </div>

                <h3 className="res-title">{item.title}</h3>

                <p className="res-description">{item.description}</p>

                {item.courseContent && (
                  <details className="resource-learning-details">
                    <summary>Open full step learning content</summary>
                    <p>{item.courseContent.introduction}</p>
                    <h4>Core definition</h4>
                    <p>{item.courseContent.definition}</p>
                    <h4>Why this matters</h4>
                    <p>{item.courseContent.importance}</p>
                    <h4>Key ideas</h4>
                    {item.courseContent.keyIdeas.map((idea) => (
                      <div className="course-resource-idea" key={idea.title}>
                        <strong>{idea.title}</strong>
                        <p>{idea.explanation}</p>
                      </div>
                    ))}
                    <h4>Worked example</h4>
                    <p>{item.courseContent.workedExample.context}</p>
                    <ol>
                      {item.courseContent.workedExample.approach.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <p>{item.courseContent.workedExample.result}</p>
                    <h4>Learning objectives</h4>
                    <ul>
                      {item.learningOutcomes.map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                    <h4>Practice plan</h4>
                    <ol>
                      {item.courseContent.applicationSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <h4>Common mistakes to avoid</h4>
                    <ul>
                      {item.courseContent.commonMistakes.map((mistake) => (
                        <li key={mistake}>{mistake}</li>
                      ))}
                    </ul>
                    <h4>Knowledge check</h4>
                    <ul>
                      {item.courseContent.knowledgeCheck.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                    <h4>Written assessment</h4>
                    <p>{item.courseContent.writtenAssessment}</p>
                    <h4>Step assignment</h4>
                    <p>{item.courseContent.assignment}</p>
                  </details>
                )}

                {item.resourceContent && (
                  <details className="resource-learning-details">
                    <summary>Open full {item.category.toLowerCase()} content</summary>
                    <p>{item.resourceContent.overview}</p>
                    {item.resourceContent.readingTime && (
                      <p className="resource-content-meta">Reading time: {item.resourceContent.readingTime}</p>
                    )}
                    {item.resourceContent.scenario && (
                      <>
                        <h4>Scenario</h4>
                        <p>{item.resourceContent.scenario}</p>
                      </>
                    )}
                    {item.resourceContent.brief && (
                      <>
                        <h4>Project brief</h4>
                        <p>{item.resourceContent.brief}</p>
                      </>
                    )}
                    {item.resourceContent.environment && (
                      <>
                        <h4>Safe practice environment</h4>
                        <p>{item.resourceContent.environment}</p>
                      </>
                    )}
                    {item.resourceContent.sections?.map((section) => (
                      <section className="resource-content-section" key={section.heading}>
                        <h4>{section.heading}</h4>
                        <p>{section.body}</p>
                        {section.points?.length > 0 && (
                          <ol>
                            {section.points.map((point) => <li key={point}>{point}</li>)}
                          </ol>
                        )}
                      </section>
                    ))}
                    {item.resourceContent.chapters?.map((chapter) => (
                      <section className="resource-content-section" key={chapter.title}>
                        <h4>{chapter.title}</h4>
                        <p>{chapter.summary}</p>
                        <p><strong>Reading prompt:</strong> {chapter.prompt}</p>
                      </section>
                    ))}
                    {[
                      ["Materials and tools", item.resourceContent.materials],
                      ["Instructions", item.resourceContent.instructions],
                      ["Project requirements", item.resourceContent.requirements],
                      ["Milestones", item.resourceContent.milestones],
                      ["Reading plan", item.resourceContent.readingPlan],
                      ["Deliverables", item.resourceContent.deliverables],
                      ["Validation checklist", item.resourceContent.validation],
                      ["Acceptance criteria", item.resourceContent.acceptanceCriteria],
                      ["Discussion questions", item.resourceContent.discussionQuestions],
                      ["Key takeaways", item.resourceContent.takeaways],
                    ].map(([heading, entries]) => entries?.length > 0 && (
                      <div key={heading}>
                        <h4>{heading}</h4>
                        <ul>
                          {entries.map((entry) => <li key={entry}>{entry}</li>)}
                        </ul>
                      </div>
                    ))}
                    {item.resourceContent.reviewRubric?.length > 0 && (
                      <>
                        <h4>Review rubric</h4>
                        <ul>
                          {item.resourceContent.reviewRubric.map((itemRubric) => (
                            <li key={itemRubric.criterion}>
                              <strong>{itemRubric.criterion}:</strong> {itemRubric.description}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {item.resourceContent.reflection && (
                      <>
                        <h4>Reflection prompt</h4>
                        <p>{item.resourceContent.reflection}</p>
                      </>
                    )}
                    {item.resourceContent.stretchGoal && (
                      <>
                        <h4>Stretch goal</h4>
                        <p>{item.resourceContent.stretchGoal}</p>
                      </>
                    )}
                  </details>
                )}

                {!item.courseContent && (item.learningOutcomes?.length > 0 || item.studyPlan?.length > 0) && (
                  <details className="resource-learning-details">
                    <summary>Explore learning outcomes and study plan</summary>
                    {item.learningOutcomes?.length > 0 && (
                      <div>
                        <h4>What you will learn</h4>
                        <ul>
                          {item.learningOutcomes.map((outcome) => (
                            <li key={outcome}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.studyPlan?.length > 0 && (
                      <div>
                        <h4>Suggested study plan</h4>
                        <ol>
                          {item.studyPlan.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </details>
                )}

                <div className="res-meta-chips">
                  {item.duration && (
                    <span className="res-chip">⏱ {item.duration}</span>
                  )}
                  {item.rating && (
                    <span className="res-chip rating">⭐ {item.rating}</span>
                  )}
                  <span className="res-chip diff">{item.difficulty}</span>
                </div>

                {item.tags?.length > 0 && (
                  <div className="res-tags">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="res-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="res-card-footer">
                  {item.isCareerResource ? (
                    <Link to={item.link} className="res-action-btn">
                      <span>Open Step {item.stepNumber} in Roadmap</span>
                      <span className="res-arrow">→</span>
                    </Link>
                  ) : (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="res-action-btn"
                    >
                      <span>Access Course / Resource</span>
                      <span className="res-arrow">↗</span>
                    </a>
                  )}
                </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
