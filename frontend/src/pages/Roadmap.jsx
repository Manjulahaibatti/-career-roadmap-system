import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { roadmapsAPI, careersAPI, progressAPI } from "../services/api";
import { degreeCatalog } from "../../../shared/degreeCatalog.js";
import {
  createLessonContent,
  QUIZ_PASSING_SCORE,
  QUIZ_QUESTION_COUNT,
} from "../../../shared/lessonContent.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Roadmap.css";

const LockIcon = () => (
  <svg className="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12v10H6z" />
    <circle cx="12" cy="15" r="1" />
  </svg>
);

const escapeSvgText = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);

const wrapSvgText = (value, maxCharacters) => {
  const words = String(value || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const wordParts = word.match(new RegExp(`.{1,${maxCharacters}}`, "g")) || [word];
    wordParts.forEach((part) => {
      const candidate = line ? `${line} ${part}` : part;
      if (candidate.length > maxCharacters && line) {
        lines.push(line);
        line = part;
      } else {
        line = candidate;
      }
    });
  });

  if (line) lines.push(line);
  return lines;
};

const createRoadmapSvg = (careerName, roadmap) => {
  const steps = roadmap.steps || [];
  const width = 1080;
  const centerX = width / 2;
  const overviewLines = wrapSvgText(roadmap.overview || "A step-by-step path to your career goal.", 120);
  const milestonesY = 99 + overviewLines.length * 13;
  const top = Math.max(198, milestonesY + 86);
  const rowGap = 18;
  const stepRows = steps.map((step, index) => {
    const titleLines = wrapSvgText(step.title, 42);
    const descriptionLines = wrapSvgText(step.description, 48);
    const topicLines = wrapSvgText((step.topics || []).join(" · "), 48);
    const textHeight =
      titleLines.length * 18 +
      descriptionLines.length * 14 +
      topicLines.length * 12 + 12;
    return {
      step,
      index,
      titleLines,
      descriptionLines,
      topicLines,
      textHeight,
      height: Math.max(150, textHeight + 36),
    };
  });
  const contentHeight = stepRows.reduce((total, row) => total + row.height, 0) +
    Math.max(0, stepRows.length - 1) * rowGap;
  const height = Math.ceil(Math.max(width, top + contentHeight + 100) / 100) * 100;
  let currentY = top + Math.max(0, (height - top - contentHeight - 100) / 2);
  const layout = stepRows.map((row) => {
    const { step, index, titleLines, descriptionLines, topicLines, textHeight } = row;
    const nodeX = centerX + (index % 2 === 0 ? -42 : 42);
    const nodeY = currentY + row.height / 2;
    const isLeft = index % 2 === 0;
    const textX = isLeft ? centerX - 92 : centerX + 92;
    const textAnchor = isLeft ? "end" : "start";
    const titleLineHeight = 18;
    const descriptionLineHeight = 14;
    const topicsLineHeight = 12;
    const startY = nodeY - textHeight / 2 + titleLineHeight;
    const tspans = (lines, y, lineHeight) =>
      lines.map((line, lineIndex) =>
        `<tspan x="${textX}" y="${y + lineIndex * lineHeight}">${escapeSvgText(line)}</tspan>`
      ).join("");
    const titleY = startY;
    const descriptionY = titleY + titleLines.length * titleLineHeight + 5;
    const topicsY = descriptionY + descriptionLines.length * descriptionLineHeight + 7;
    const stepNumber = step.stepNumber || index + 1;
    const markup = `
      <text x="${textX}" y="${titleY}" text-anchor="${textAnchor}" fill="#c084fc" font-size="15" font-weight="800">${tspans(titleLines, titleY, titleLineHeight)}</text>
      <text x="${textX}" y="${descriptionY}" text-anchor="${textAnchor}" fill="#d0cbd8" font-size="10.5">${tspans(descriptionLines, descriptionY, descriptionLineHeight)}</text>
      ${topicLines.length ? `<text x="${textX}" y="${topicsY}" text-anchor="${textAnchor}" fill="#a78bfa" font-size="9">${tspans(topicLines, topicsY, topicsLineHeight)}</text>` : ""}
      <circle cx="${nodeX}" cy="${nodeY}" r="15" fill="#a855f7" fill-opacity=".16"/>
      <circle cx="${nodeX}" cy="${nodeY}" r="6" fill="#c084fc"/>
      <text x="${nodeX}" y="${nodeY + 3}" text-anchor="middle" fill="#ffffff" font-size="7" font-weight="800">${String(stepNumber).padStart(2, "0")}</text>
    `;
    currentY += row.height + rowGap;
    return { markup, nodeX, nodeY };
  });
  const roadPath = layout.length
    ? `M ${centerX} ${top - 34} ${layout.map(({ nodeX, nodeY }, index) => {
      if (index === 0) return `L ${nodeX} ${nodeY}`;
      const previous = layout[index - 1];
      const middleY = (previous.nodeY + nodeY) / 2;
      return `C ${previous.nodeX} ${middleY}, ${nodeX} ${middleY}, ${nodeX} ${nodeY}`;
    }).join(" ")}`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="roadmap-title roadmap-description">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080b18"/><stop offset=".52" stop-color="#11152b"/><stop offset="1" stop-color="#080b19"/></linearGradient>
      <radialGradient id="violetGlow" gradientUnits="userSpaceOnUse" cx="150" cy="170" r="620"><stop stop-color="#8b5cf6" stop-opacity=".25"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
      <radialGradient id="blueGlow" gradientUnits="userSpaceOnUse" cx="960" cy="${Math.round(height * 0.48)}" r="520"><stop stop-color="#38bdf8" stop-opacity=".12"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
      <radialGradient id="lowerGlow" gradientUnits="userSpaceOnUse" cx="${centerX}" cy="${height}" r="540"><stop stop-color="#7c3aed" stop-opacity=".12"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
      <pattern id="backgroundTexture" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#c4b5fd" fill-opacity=".2"/></pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#background)"/>
    <rect width="${width}" height="${height}" fill="url(#violetGlow)"/>
    <rect width="${width}" height="${height}" fill="url(#blueGlow)"/>
    <rect width="${width}" height="${height}" fill="url(#lowerGlow)"/>
    <rect width="${width}" height="${height}" fill="url(#backgroundTexture)" opacity=".42"/>
    <path d="M -50 300 C 110 150 210 140 390 260 S 650 365 790 230 S 930 170 1130 260" fill="none" stroke="#a78bfa" stroke-opacity=".035" stroke-width="42"/>
    <text id="roadmap-title" x="${centerX}" y="54" text-anchor="middle" fill="#f7f2fc" font-size="25" font-weight="800">The ${escapeSvgText(careerName)} Roadmap</text>
    <text id="roadmap-description" text-anchor="middle" fill="#a9a1b3" font-size="10">${overviewLines.map((line, index) => `<tspan x="${centerX}" y="${82 + index * 13}">${escapeSvgText(line)}</tspan>`).join("")}</text>
    <text x="${centerX}" y="${milestonesY}" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="700" letter-spacing="2">${steps.length} LEARNING MILESTONES</text>
    ${roadPath ? `<path d="${roadPath}" fill="none" stroke="#a855f7" stroke-opacity=".28" stroke-width="2" stroke-dasharray="3 8" stroke-linecap="round"/>` : ""}
    ${layout.map(({ markup }) => markup).join("")}
  </svg>`;
};

const createLessonDraftPayload = (stepNumber, draft) => {
  const payload = { activeStepNumber: stepNumber };
  if (Object.prototype.hasOwnProperty.call(draft, "quizAnswers")) {
    payload.quizAnswerDraft = Array.from(
      { length: QUIZ_QUESTION_COUNT },
      (_, index) => {
        const answer = draft.quizAnswers[index];
        return answer === undefined ? -1 : Number(answer);
      }
    );
  }
  if (Object.prototype.hasOwnProperty.call(draft, "subjectiveResponse")) {
    payload.subjectiveResponseDraft = draft.subjectiveResponse;
  }
  if (Object.prototype.hasOwnProperty.call(draft, "assignmentResponse")) {
    payload.assignmentResponseDraft = draft.assignmentResponse;
  }
  return payload;
};

const Roadmap = () => {
  const { careerSlug: routeSlug } = useParams();
  const { user, token, isAuthenticated, openAuthModal, updateUserCareer, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedStepNumber = Number(searchParams.get("step"));
  const learnerLevel = searchParams.get("level") || "Standard pace";
  const weeklyHours = Number(searchParams.get("hours")) || 8;
  const paceFactor = {
    "Starting fresh": 1.2,
    "Some related skills": 1,
    "Already working in tech": 0.82,
  }[learnerLevel] || 1;

  const selectedSlug =
    routeSlug ||
    user?.currentCareer ||
    user?.roadmapPreferences?.targetCareerSlug ||
    "software-developer";
  const [allCareers, setAllCareers] = useState([]);
  const [career, setCareer] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [lessonMessage, setLessonMessage] = useState("");
  const [activeStepTab, setActiveStepTab] = useState(null);
  const [lessonDrafts, setLessonDrafts] = useState({});
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planSaveMessage, setPlanSaveMessage] = useState("");
  const [visualRoadmapSvg, setVisualRoadmapSvg] = useState("");
  const [visualRoadmapError, setVisualRoadmapError] = useState("");
  const [isVisualRoadmapZoomed, setIsVisualRoadmapZoomed] = useState(false);
  const [generatorForm, setGeneratorForm] = useState(() => {
    const defaults = {
      learnerName: "",
      degreeCourse: "",
      targetRole: "",
      level: "Beginner",
      weeklyHours: 8,
      focus: "Job-ready portfolio",
    };
    const savedProfile = localStorage.getItem("crs_learner_profile");
    if (!savedProfile) return defaults;
    try {
      return { ...defaults, ...JSON.parse(savedProfile) };
    } catch (error) {
      console.error("Unable to load the saved learner profile:", error);
      return defaults;
    }
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const persistedPreferencesKey = user?.id && user?.roadmapPreferences
    ? `${user.id}:${JSON.stringify(user.roadmapPreferences)}`
    : "";
  const [appliedPreferencesKey, setAppliedPreferencesKey] = useState("");
  if (persistedPreferencesKey && persistedPreferencesKey !== appliedPreferencesKey) {
    setAppliedPreferencesKey(persistedPreferencesKey);
    setGeneratorForm((current) => ({
      ...current,
      ...user.roadmapPreferences,
      targetRole:
        allCareers.find(
          (careerOption) =>
            careerOption.slug === user.roadmapPreferences.targetCareerSlug
        )?.name || current.targetRole,
    }));
  }

  // Load all careers for selector
  useEffect(() => {
    careersAPI
      .getAll()
      .then((data) => setAllCareers(data))
      .catch((err) => console.error(err));
  }, []);

  // Load roadmap and user progress
  useEffect(() => {
    let isCurrentRequest = true;

    const loadRoadmapAndProgress = async () => {
      setLoading(true);
      setLoadError("");
      setCareer(null);
      setRoadmap(null);
      setCompletedMilestones([]);
      setCourseProgress([]);
      setProgressPercentage(0);
      setLessonDrafts({});
      setVisualRoadmapSvg("");
      setVisualRoadmapError("");
      setIsLessonOpen(false);

      try {
        const [careerData, rmData] = await Promise.all([
          careersAPI.getBySlug(selectedSlug),
          roadmapsAPI.getBySlug(selectedSlug),
        ]);
        if (!isCurrentRequest) return;
        setCareer(careerData);
        setRoadmap(rmData);
        setGeneratorForm((current) => ({ ...current, targetRole: careerData.name }));

        try {
          const progData = await progressAPI.getByCareer(token, selectedSlug);
          if (isCurrentRequest && progData) {
            const completedSteps = progData.completedMilestones || [];
            const savedLessons = progData.courseProgress || [];
            const requestedStep = rmData.steps?.find(
              (step) => step.stepNumber === requestedStepNumber
            );
            const savedActiveStep = rmData.steps?.find(
              (step) => step.stepNumber === progData.activeStepNumber
            );
            const resumeStep = requestedStep || savedActiveStep || rmData.steps?.[0];
            const restoredDrafts = Object.fromEntries(savedLessons.map((lesson) => {
              const draft = {};
              if (lesson.quizAnswerDraft?.length) {
                draft.quizAnswers = Object.fromEntries(
                  lesson.quizAnswerDraft
                    .map((answer, index) => [index, answer])
                    .filter(([, answer]) => answer >= 0)
                    .map(([index, answer]) => [index, String(answer)])
                );
              }
              if (lesson.subjectiveResponseDraft) {
                draft.subjectiveResponse = lesson.subjectiveResponseDraft;
              }
              if (lesson.assignmentResponseDraft) {
                draft.assignmentResponse = lesson.assignmentResponseDraft;
              }
              return [lesson.stepNumber, draft];
            }));
            setCompletedMilestones(completedSteps);
            setCourseProgress(savedLessons);
            setLessonDrafts(restoredDrafts);
            setProgressPercentage(progData.progressPercentage || 0);
            setActiveStepTab(resumeStep?.stepNumber || null);
            setIsLessonOpen(Boolean(
              requestedStep ||
              (savedActiveStep && !completedSteps.includes(savedActiveStep.stepNumber))
            ));
          }
        } catch (err) {
          console.error("Error loading roadmap progress:", err);
        }
      } catch (err) {
        console.error("Error loading roadmap data:", err);
        if (isCurrentRequest) {
          setLoadError(err.message || "Unable to load this career roadmap.");
        }
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    };

    loadRoadmapAndProgress();

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedSlug, isAuthenticated, token, requestedStepNumber]);

  const handleCareerChange = (e) => {
    const newSlug = e.target.value;
    const selected = allCareers.find((item) => item.slug === newSlug);
    if (selected) {
      setGeneratorForm((current) => ({ ...current, targetRole: selected.name }));
      setGeneratedPlan(null);
    }
    setVisualRoadmapSvg("");
    setVisualRoadmapError("");
    navigate(`/roadmap/${newSlug}`);
  };

  const saveLessonAction = async (stepNumber, action, payload = {}) => {
    if (!token) {
      openAuthModal("Sign in to save your reading, assessments, assignments, and course progress to your account.");
      return null;
    }
    try {
      setLessonMessage("");
      setSaveStatus("Saving lesson progress to your account...");
      const res = await progressAPI.updateLessonProgress(
        token,
        selectedSlug,
        stepNumber,
        action,
        payload
      );
      if (res?.progress) {
        setCompletedMilestones(res.progress.completedMilestones || []);
        setCourseProgress(res.progress.courseProgress || []);
        setProgressPercentage(res.progress.progressPercentage || 0);
        setSaveStatus(res.message || "Progress saved.");
      }
      return res;
    } catch (err) {
      setLessonMessage(err.message || "Unable to save lesson progress.");
      setSaveStatus("");
      return null;
    }
  };

  const rememberActiveStep = (stepNumber) => {
    progressAPI
      .updateLessonProgress(token, selectedSlug, stepNumber, "draft", {
        activeStepNumber: stepNumber,
      })
      .then((result) => {
        setSaveStatus(result.message || "Your place was saved.");
      })
      .catch((error) => {
        console.error("Unable to save the active lesson step:", error);
        setLessonMessage(error.message || "Unable to save your active lesson step.");
      });
  };

  const scrollToLessonSection = (sectionId) => {
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const downloadCertificate = (stepNumber, isFinal = false) => {
    const milestone = courseProgress.find((item) => item.stepNumber === stepNumber);
    const title = isFinal ? "Career Roadmap Completion Certificate" : "Step Completion Certificate";
    const milestoneName = isFinal
      ? `All ${totalMilestones} learning steps completed`
      : `Step ${stepNumber}: ${roadmap.steps.find((step) => step.stepNumber === stepNumber)?.title || ""}`;
    const certificateId = isFinal
      ? `CRS-FINAL-${selectedSlug}-${courseProgress
          .filter((item) => item.certificateId)
          .map((item) => item.certificateId.slice(-6))
          .join("-")}`
      : milestone?.certificateId || `CRS-${selectedSlug}-STEP-${stepNumber}`;
    const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (character) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    }[character]));
    try {
      const completedDate = new Date().toLocaleDateString();
      const completionStatement = isFinal
        ? `All ${totalMilestones} steps in the ${selectedCareer?.name || roadmap.careerName} career roadmap have been completed.`
        : "All learning activities for this step have been completed.";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6d35c5"/>
      <stop offset="1" stop-color="#9b42ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="820" fill="#ffffff"/>
  <rect x="28" y="28" width="1144" height="764" rx="8" fill="none" stroke="#d9d2e3" stroke-width="2"/>
  <rect x="44" y="44" width="1112" height="732" rx="4" fill="none" stroke="#eeeaf3" stroke-width="1"/>
  <rect x="28" y="28" width="1144" height="8" fill="url(#accent)"/>
  <circle cx="600" cy="112" r="32" fill="#f7f3fc" stroke="#7b36e8" stroke-width="2"/>
  <text x="600" y="122" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26">🚀</text>
  <text x="600" y="172" text-anchor="middle" fill="#282332" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">Career Roadmap System</text>
  <text x="600" y="197" text-anchor="middle" fill="#6d35c5" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="2">PLAN. LEARN. ACHIEVE.</text>
  <text x="600" y="264" text-anchor="middle" fill="#51465e" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="600" letter-spacing="1">${escapeXml(title.toUpperCase())}</text>
  <text x="600" y="294" text-anchor="middle" fill="#51465e" font-family="Arial, Helvetica, sans-serif" font-size="14">IS PROUDLY PRESENTED TO</text>
  <text x="600" y="359" text-anchor="middle" fill="#25212c" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="700">${escapeXml(generatorForm.learnerName.trim() || "Learner")}</text>
  <path d="M330 381H870" stroke="#d7d1df" stroke-width="1.5"/>
  <text x="600" y="419" text-anchor="middle" fill="#51465e" font-family="Arial, Helvetica, sans-serif" font-size="15">for successfully completing</text>
  <text x="600" y="467" text-anchor="middle" fill="#6035a0" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" textLength="900" lengthAdjust="spacingAndGlyphs">${escapeXml(milestoneName)}</text>
  <text x="600" y="501" text-anchor="middle" fill="#51465e" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="500">${escapeXml(selectedCareer?.name || roadmap.careerName)} career roadmap</text>
  <text x="600" y="535" text-anchor="middle" fill="#51465e" font-family="Arial, Helvetica, sans-serif" font-size="14">${escapeXml(completionStatement)}</text>
  <text x="600" y="579" text-anchor="middle" fill="#51465e" font-family="Arial, Helvetica, sans-serif" font-size="14">Issued on ${escapeXml(completedDate)}</text>
  <text x="600" y="632" text-anchor="middle" fill="#51465e" font-family="Arial, Helvetica, sans-serif" font-size="13">Issued by</text>
  <path d="M470 645H730" stroke="#d7d1df" stroke-width="1"/>
  <text x="600" y="673" text-anchor="middle" fill="#282332" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700">Career Roadmap System</text>
  <text x="600" y="707" text-anchor="middle" fill="#6d35c5" font-family="Arial, Helvetica, sans-serif" font-size="12">Certificate ID: ${escapeXml(certificateId)}</text>
  <text x="600" y="748" text-anchor="middle" fill="#756f7c" font-family="Arial, Helvetica, sans-serif" font-size="10">A record of learning progress; not an accredited academic qualification.</text>
</svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedSlug}-${isFinal ? "course" : `step-${stepNumber}`}-certificate.svg`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Unable to download the certificate:", error);
      setLessonMessage(error.message || "Unable to download the certificate.");
    }
  };

  const handleSetAsCurrentGoal = async () => {
    if (!isAuthenticated) {
      openAuthModal("Login to set this career as your active goal in your Dashboard.");
      return;
    }
    try {
      await updateUserCareer(selectedSlug);
      setSaveStatus("Set as primary career goal!");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch (error) {
      setLessonMessage(error.message || "Unable to update your career goal.");
    }
  };

  const totalMilestones = roadmap?.steps?.length || 7;
  const completedCount = completedMilestones.length;
  const selectedCareer = career || allCareers.find((item) => item.slug === selectedSlug);
  const activeRoadmapStep = roadmap?.steps?.find((step) => step.stepNumber === activeStepTab) || roadmap?.steps?.[0];
  const lessonProgress = courseProgress.find((item) => item.stepNumber === activeRoadmapStep?.stepNumber);
  const activeLessonDraft = lessonDrafts[activeRoadmapStep?.stepNumber] || {};
  const selectedQuizAnswers = activeLessonDraft.quizAnswers || Object.fromEntries(
    (lessonProgress?.quizAnswers || []).map((answer, index) => [index, String(answer)])
  );
  const subjectiveResponse = activeLessonDraft.subjectiveResponse ?? lessonProgress?.subjectiveResponse ?? "";
  const assignmentResponse = activeLessonDraft.assignmentResponse ?? lessonProgress?.assignmentResponse ?? "";
  const lessonContent = activeRoadmapStep && selectedCareer
    ? createLessonContent(
        selectedCareer,
        activeRoadmapStep,
        generatedPlan?.level || generatorForm.level,
        generatedPlan?.focus || generatorForm.focus
      )
    : null;

  useEffect(() => {
    if (loading || !isLessonOpen || !activeRoadmapStep) return undefined;
    const stepNumber = activeRoadmapStep.stepNumber;
    const draft = lessonDrafts[stepNumber] || {};
    const payload = createLessonDraftPayload(stepNumber, draft);

    const timeoutId = window.setTimeout(async () => {
      try {
        setSaveStatus("Saving your place...");
        const result = await progressAPI.updateLessonProgress(
          token,
          selectedSlug,
          stepNumber,
          "draft",
          payload
        );
        if (result?.progress) {
          setCourseProgress(result.progress.courseProgress || []);
          setProgressPercentage(result.progress.progressPercentage || 0);
        }
        setSaveStatus("Your place is saved; you can resume here.");
      } catch (error) {
        console.error("Unable to save the lesson draft:", error);
        setSaveStatus("Your place could not be saved. Please try again.");
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [activeRoadmapStep, isLessonOpen, lessonDrafts, loading, selectedSlug, token]);

  useEffect(() => {
    if (!isLessonOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLessonOpen]);

  useEffect(() => {
    if (!isVisualRoadmapZoomed) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsVisualRoadmapZoomed(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isVisualRoadmapZoomed]);

  const getPersonalizedWeeks = (weeks) => {
    const plannedHours = Number(generatedPlan?.weeklyHours || generatorForm.weeklyHours) || 8;
    const plannedLevelFactor = {
      Beginner: 1.2,
      Intermediate: 1,
      Advanced: 0.82,
    }[generatedPlan?.level || generatorForm.level] || 1;
    const activePace = searchParams.has("level") ? paceFactor : plannedLevelFactor;
    const activeHours = searchParams.has("hours") ? weeklyHours : plannedHours;
    return Math.max(1, Math.round(((weeks || 4) * activePace * 8) / activeHours));
  };

  const updateActiveLessonDraft = (updates) => {
    const stepNumber = activeRoadmapStep?.stepNumber;
    if (!stepNumber) return;
    setLessonDrafts((drafts) => ({
      ...drafts,
      [stepNumber]: { ...drafts[stepNumber], ...updates },
    }));
  };

  const generatorPace = {
    Beginner: 1.2,
    Intermediate: 1,
    Advanced: 0.78,
  }[generatorForm.level];

  const generatePersonalPlan = async (event) => {
    event.preventDefault();
    if (!roadmap?.steps?.length) {
      console.error("Cannot generate a career plan without roadmap steps.");
      return;
    }
    setIsGeneratingPlan(true);
    setPlanSaveMessage("");
    const careerName = selectedCareer?.name || roadmap?.careerName || generatorForm.targetRole || "Your target career";
    const courseName = generatorForm.degreeCourse.trim() || "Self-directed pathway";
    const weeklyHours = Math.max(1, Number(generatorForm.weeklyHours) || 8);
    const stages = roadmap.steps.map((step, index) => ({
      stepNumber: step.stepNumber || index + 1,
      title: step.title,
      detail: step.description,
      output: step.topics?.length
        ? step.topics.join(" · ")
        : "Practice and demonstrate this skill",
      estimatedWeeks: Math.max(
        1,
        Math.round(((step.estimatedWeeks || 4) * generatorPace * 8) / weeklyHours)
      ),
    }));
    const totalWeeks = stages.reduce((total, step) => total + step.estimatedWeeks, 0);
    const savedPreferences = {
      learnerName: generatorForm.learnerName.trim(),
      degreeCourse: generatorForm.degreeCourse.trim(),
      targetCareerSlug: selectedSlug,
      level: generatorForm.level,
      weeklyHours,
      focus: generatorForm.focus,
    };
    const savedProfile = {
      ...generatorForm,
      targetRole: careerName,
      targetCareerSlug: selectedSlug,
    };

    try {
      localStorage.setItem("crs_learner_profile", JSON.stringify(savedProfile));
      if (token) {
        await updateUserProfile({
          currentCareer: selectedSlug,
          roadmapPreferences: savedPreferences,
        });
        setPlanSaveMessage("Your learning-plan preferences were saved to your account.");
      } else {
        setPlanSaveMessage("Your learning-plan preferences were saved on this device. Sign in to sync them to your account.");
      }
      setGeneratedPlan({
        ...generatorForm,
        careerName,
        courseName,
        totalWeeks,
        stages,
      });
    } catch (error) {
      console.error("Unable to save roadmap preferences:", error);
      setPlanSaveMessage(error.message || "Unable to save your learning-plan preferences.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const downloadGeneratedImage = () => {
    if (!generatedPlan) return;
    const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (char) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    }[char]));
    const wrapText = (value, maxCharacters) => {
      const words = String(value || "").split(/\s+/).filter(Boolean);
      const lines = [];
      let line = "";
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > maxCharacters && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      if (line) lines.push(line);
      return lines;
    };
    const width = 900;
    const centerX = width / 2;
    let currentY = 205;
    const stages = generatedPlan.stages.map((stage, index) => {
      const titleLines = wrapText(stage.title, 30);
      const detailLines = wrapText(stage.detail, 38);
      const outputLines = wrapText(`Output: ${stage.output}`, 38);
      const rowHeight = Math.max(
        150,
        72 + titleLines.length * 21 + detailLines.length * 16 + outputLines.length * 16
      );
      const nodeY = currentY + rowHeight / 2;
      const nodeX = centerX + (index % 2 === 0 ? -38 : 38);
      const isLeft = index % 2 === 0;
      const textX = isLeft ? 335 : 565;
      const textAnchor = isLeft ? "end" : "start";
      const titleY = currentY + 47;
      const detailY = titleY + titleLines.length * 21 + 8;
      const outputY = detailY + detailLines.length * 16 + 10;
      const tspans = (lines, y, lineHeight) => lines.map((line, lineIndex) =>
        `<tspan x="${textX}" y="${y + lineIndex * lineHeight}">${escapeXml(line)}</tspan>`
      ).join("");
      const number = stage.stepNumber || index + 1;
      const markup = `
        <path d="M ${nodeX} ${nodeY} ${isLeft ? `C ${nodeX - 18} ${nodeY}, 356 ${nodeY - 3}, 342 ${nodeY - 10}` : `C ${nodeX + 18} ${nodeY}, 544 ${nodeY - 3}, 558 ${nodeY - 10}`}" fill="none" stroke="#a855f7" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="2 5"/>
        <text x="${textX}" y="${currentY + 26}" text-anchor="${textAnchor}" fill="#f4f0fa" font-size="13" font-weight="800">${String(number).padStart(2, "0")}</text>
        <text text-anchor="${textAnchor}" fill="#c084fc" font-size="17" font-weight="800">${tspans(titleLines, titleY, 21)}</text>
        <text text-anchor="${textAnchor}" fill="#d0cbd8" font-size="11">${tspans(detailLines, detailY, 16)}</text>
        <text text-anchor="${textAnchor}" fill="#a78bfa" font-size="10">${tspans(outputLines, outputY, 16)}</text>
        <circle cx="${nodeX}" cy="${nodeY}" r="13" fill="#a855f7" fill-opacity=".13"/>
        <circle cx="${nodeX}" cy="${nodeY}" r="5" fill="#c084fc"/>
      `;
      currentY += rowHeight;
      return { markup, nodeX, nodeY };
    });
    const height = currentY + 45;
    const routePath = stages.length
      ? `M ${stages[0].nodeX} 155 ${stages.map(({ nodeX, nodeY }, index) => {
        if (index === 0) return `L ${nodeX} ${nodeY}`;
        const previous = stages[index - 1];
        const middleY = (previous.nodeY + nodeY) / 2;
        return `C ${previous.nodeX} ${middleY}, ${nodeX} ${middleY}, ${nodeX} ${nodeY}`;
      }).join(" ")} L ${stages[stages.length - 1].nodeX} ${height - 20}`
      : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#09080d"/><stop offset="1" stop-color="#17131e"/></linearGradient>
        <radialGradient id="glow"><stop stop-color="#a855f7" stop-opacity=".15"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#background)"/>
      <circle cx="450" cy="205" r="270" fill="url(#glow)"/>
      <path d="M -50 300 C 110 150 210 140 330 240 S 560 370 710 230 S 850 170 950 260" fill="none" stroke="#a78bfa" stroke-opacity=".035" stroke-width="42"/>
      <text x="450" y="54" text-anchor="middle" fill="#f7f2fc" font-size="25" font-weight="800">The ${escapeXml(generatedPlan.careerName)} Roadmap</text>
      <text x="450" y="82" text-anchor="middle" fill="#a9a1b3" font-size="10">${escapeXml(generatedPlan.courseName)} · ${escapeXml(generatedPlan.level)} · ${generatedPlan.weeklyHours} hrs/week · ${generatedPlan.totalWeeks} weeks</text>
      <text x="450" y="112" text-anchor="middle" fill="#c084fc" font-size="9" font-weight="700" letter-spacing="2">${generatedPlan.stages.length} CAREER-SPECIFIC LEARNING STEPS</text>
      <path d="${routePath}" fill="none" stroke="#a855f7" stroke-opacity=".28" stroke-width="2" stroke-dasharray="3 8" stroke-linecap="round"/>
      ${stages.map(({ markup }) => markup).join("")}
    </svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generatedPlan.careerName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-roadmap.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="roadmap-page">
      <Navbar />

      <main className="roadmap-container">
        {/* HEADER & SELECTOR */}
        <section className="roadmap-header">
          <div className="roadmap-header-left">
            <div className="roadmap-pill">✦ Career Roadmap</div>
            <h1>
              Career: <span>{selectedCareer?.name || roadmap?.careerName || "Loading career..."}</span>
            </h1>
            <p className="roadmap-overview">
              {roadmap?.overview ||
                selectedCareer?.description ||
                loadError ||
                "Loading career details..."}
            </p>
            {career && (
              <div className="roadmap-career-details">
                <p>{career.description}</p>
                <div className="roadmap-career-facts">
                  <span><strong>Learning time:</strong> {career.learningTime}</span>
                  <span><strong>Average salary:</strong> {career.averageSalary}</span>
                  <span><strong>Demand:</strong> {career.demand}</span>
                </div>
                {!!career.skills?.length && (
                  <div className="roadmap-career-skills">
                    <strong>Core skills:</strong>
                    {career.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {searchParams.has("level") && (
              <div className="personalized-roadmap-badge">
                ✦ Built for {learnerLevel} · {weeklyHours} hrs/week
              </div>
            )}
          </div>

          <div className="roadmap-header-right">
            <div className="selector-group">
              <label htmlFor="careerSelect">Select Career Roadmap</label>
              <select
                id="careerSelect"
                value={selectedSlug}
                onChange={handleCareerChange}
                className="roadmap-career-dropdown"
              >
                {allCareers.map((career) => (
                  <option key={career.slug} value={career.slug}>
                    {career.icon} {career.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="goal-action-btn-row">
              <button
                className="set-goal-btn"
                onClick={handleSetAsCurrentGoal}
                title="Make this your active career in Dashboard"
              >
                ⭐ Set as Active Goal
              </button>
            </div>
          </div>
        </section>

        <section className="roadmap-design-panel" aria-labelledby="roadmap-design-heading">
          <div className="roadmap-design-copy">
            <span className="roadmap-design-kicker">VISUAL LEARNING PLAN</span>
            <h2 id="roadmap-design-heading">Explore your roadmap visually</h2>
            <p>
              Generate a visual plan from the learning steps, descriptions, and topics for this career.
            </p>
          </div>
          <button
            type="button"
            className="roadmap-design-button"
            disabled={loading || !roadmap?.steps?.length}
            onClick={() => {
              if (!roadmap?.steps?.length) {
                setVisualRoadmapError("This career does not have any roadmap steps to display.");
                return;
              }
              setVisualRoadmapError("");
              setVisualRoadmapSvg(createRoadmapSvg(
                selectedCareer?.name || roadmap.careerName || "Career",
                roadmap
              ));
            }}
          >
            {loading ? "Loading roadmap..." : `✦ Generate ${selectedCareer?.name || "career"} roadmap`}
          </button>
          {visualRoadmapError && (
            <p className="roadmap-design-error" role="alert">{visualRoadmapError}</p>
          )}
          {visualRoadmapSvg && roadmap?.steps?.length > 0 && (
            <div className="roadmap-design-result">
              <div className="roadmap-design-actions">
                <h3>{selectedCareer?.name || roadmap.careerName} roadmap</h3>
                <a
                  className="roadmap-download-button"
                  href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(visualRoadmapSvg)}`}
                  download={`${selectedSlug}-roadmap.svg`}
                >
                  Download image
                </a>
              </div>
              <button
                type="button"
                className="roadmap-design-image-button"
                aria-label="Zoom in on the roadmap image"
                onClick={() => setIsVisualRoadmapZoomed(true)}
              >
                <img
                  className="roadmap-design-image"
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(visualRoadmapSvg)}`}
                  alt={`${selectedCareer?.name || "Career"} roadmap with ${roadmap.steps.length} steps`}
                />
                <span>Click to zoom</span>
              </button>
              <details className="roadmap-design-content" open>
                <summary>Roadmap content · {roadmap.steps.length} steps</summary>
                {roadmap.overview && <p>{roadmap.overview}</p>}
                <ol>
                  {roadmap.steps.map((step, index) => (
                    <li key={`${step.stepNumber || index + 1}-${step.title}`}>
                      <strong>Step {step.stepNumber || index + 1}: {step.title}</strong>
                      {step.description && <p>{step.description}</p>}
                      {step.topics?.length > 0 && <p><span>Topics: </span>{step.topics.join(", ")}</p>}
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          )}
        </section>

        {isVisualRoadmapZoomed && visualRoadmapSvg && (
          <div
            className="roadmap-image-zoom-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedCareer?.name || "Career"} roadmap enlarged`}
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsVisualRoadmapZoomed(false);
            }}
          >
            <button
              type="button"
              className="roadmap-image-zoom-close"
              aria-label="Close enlarged roadmap"
              onClick={() => setIsVisualRoadmapZoomed(false)}
            >
              ×
            </button>
            <img
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(visualRoadmapSvg)}`}
              alt={`${selectedCareer?.name || "Career"} roadmap with ${roadmap?.steps?.length || 0} steps`}
            />
          </div>
        )}

        <section className="roadmap-studio">
          <div className="studio-intro">
            <div>
              <span className="studio-kicker">✦ Roadmap Studio</span>
              <h2>Build your personal career learning plan.</h2>
              <p>Choose your degree, career target, current level, weekly hours, and the outcome you want to achieve.</p>
            </div>
            {generatedPlan && (
              <button type="button" className="studio-download-btn" onClick={downloadGeneratedImage}>
                Download roadmap image ↗
              </button>
            )}
          </div>

          <form className="studio-form" onSubmit={generatePersonalPlan}>
            <label>
              Learner name
              <input
                value={generatorForm.learnerName}
                onChange={(event) => setGeneratorForm({ ...generatorForm, learnerName: event.target.value })}
                placeholder="Optional"
              />
            </label>
            <label>
              Degree or course
              <input
                list="degree-course-options"
                autoComplete="off"
                value={generatorForm.degreeCourse}
                onChange={(event) => setGeneratorForm({ ...generatorForm, degreeCourse: event.target.value })}
                placeholder="Search MBBS, B.Tech, MBA, international degrees..."
                required
              />
            </label>
            <datalist id="degree-course-options">
              {degreeCatalog.map((degree) => (
                <option key={degree} value={degree} />
              ))}
            </datalist>
            <label>
              Target career
              <select value={selectedSlug} onChange={handleCareerChange} required>
                {allCareers.map((careerOption) => (
                  <option key={careerOption.slug} value={careerOption.slug}>
                    {careerOption.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Current level
              <select value={generatorForm.level} onChange={(event) => setGeneratorForm({ ...generatorForm, level: event.target.value })}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label>
              Weekly hours
              <input
                type="number"
                min="2"
                max="40"
                value={generatorForm.weeklyHours}
                onChange={(event) => setGeneratorForm({ ...generatorForm, weeklyHours: Number(event.target.value) })}
              />
            </label>
            <label>
              Main outcome
              <select value={generatorForm.focus} onChange={(event) => setGeneratorForm({ ...generatorForm, focus: event.target.value })}>
                <option>Job-ready portfolio</option>
                <option>Career switch</option>
                <option>Freelance launch</option>
                <option>Interview preparation</option>
              </select>
            </label>
            <button type="submit" className="studio-generate-btn" disabled={!roadmap?.steps?.length || isGeneratingPlan}>
              {isGeneratingPlan ? "Saving your preferences..." : roadmap?.steps?.length ? "Generate my roadmap" : "Loading career roadmap..."} <span>→</span>
            </button>
          </form>

          {planSaveMessage && (
            <p className="roadmap-design-error" role={token ? "status" : "alert"}>
              {planSaveMessage}
            </p>
          )}

          {generatedPlan && (
            <div className="generated-roadmap" aria-live="polite">
              <div className="generated-summary">
                <span className="generated-label">{generatedPlan.learnerName || "Your learner profile"}</span>
                <h3>{generatedPlan.careerName}</h3>
                <p>{generatedPlan.courseName} · {generatedPlan.level} · {generatedPlan.weeklyHours} hrs/week</p>
                <strong>{generatedPlan.totalWeeks} estimated weeks · {generatedPlan.focus}</strong>
              </div>
              <div className="generated-track">
                {generatedPlan.stages.map((stage, index) => (
                  <div className="generated-stage" key={`${stage.stepNumber || index + 1}-${stage.title}`}>
                    <div className="stage-marker">{stage.stepNumber || index + 1}</div>
                    <h4>{stage.title}</h4>
                    <p>{stage.detail}</p>
                    {stage.estimatedWeeks && <span className="stage-duration">{stage.estimatedWeeks} weeks</span>}
                    <span>{stage.output}</span>
                  </div>
                ))}
              </div>
              <div className="studio-unique-features">
                <span>✓ Adaptive pacing</span>
                <span>✓ Portfolio proof points</span>
                <span>✓ Outcome-based milestones</span>
              </div>
            </div>
          )}
        </section>

        {/* PROGRESS TRACKER BAR */}
        <section className="roadmap-progress-panel">
          <div className="progress-panel-top">
            <div className="progress-info">
              <h3>Interactive Milestone Progress</h3>
              <span className="milestone-counter">
                {completedCount} of {totalMilestones} Steps Completed
              </span>
            </div>

            <div className="progress-status-container">
              {saveStatus && <span className="save-indicator">{saveStatus}</span>}
              <span className="percent-display">{progressPercentage}%</span>
            </div>
          </div>

          <div className="roadmap-meter">
            <div
              className="roadmap-meter-fill roadmap-meter-fill-green"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {!isAuthenticated && (
            <div className="auth-roadmap-notice">
              <span>Progress is saved on this device. Sign in to sync it to your account.</span>
              <Link className="inline-auth-btn" to="/login">Sign in to sync</Link>
            </div>
          )}
          {completedCount === totalMilestones && totalMilestones > 0 && (
            <button
              type="button"
              className="course-certificate-btn"
              onClick={() => downloadCertificate(totalMilestones, true)}
            >
              Download course completion certificate
            </button>
          )}
          {completedMilestones.length > 0 && roadmap?.steps && (
            <div className="earned-certificates">
              {completedMilestones.map((stepNumber) => (
                <button
                  key={stepNumber}
                  type="button"
                  onClick={() => downloadCertificate(stepNumber)}
                >
                  Download Step {stepNumber} certificate
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ROADMAP TIMELINE & STEPS */}
        {loading ? (
          <div className="roadmap-loading">
            <div className="mini-spinner"></div>
            <span>Loading roadmap milestones...</span>
          </div>
        ) : loadError ? (
          <div className="roadmap-empty" role="alert">{loadError}</div>
        ) : !roadmap?.steps?.length ? (
          <div className="roadmap-empty">No roadmap steps found for this career.</div>
        ) : (
          <>
            <div className="roadmap-section-heading">
              <div>
                <span className="roadmap-section-kicker">Your learning path</span>
                <h2>Milestones in sequence</h2>
              </div>
              <div className="roadmap-status-legend" aria-label="Milestone status legend">
                <span><i className="legend-dot completed-dot" /> Completed</span>
                <span><i className="legend-dot progress-dot" /> In progress</span>
                <span><LockIcon /> Locked</span>
              </div>
            </div>

            {lessonMessage && !isLessonOpen && (
              <p className="lesson-message roadmap-lock-message" role="status">{lessonMessage}</p>
            )}

            <div className="roadmap-layout">
            {/* TIMELINE COLUMN */}
            <div className="timeline-steps">
              {roadmap.steps.map((step, stepIndex) => {
                const isDone = completedMilestones.includes(step.stepNumber);
                const isUnlocked = stepIndex === 0 || completedMilestones.includes(step.stepNumber - 1);
                const isFocused = activeStepTab === step.stepNumber;
                const stepStatus = isDone ? "completed" : isUnlocked ? "in-progress" : "locked";

                return (
                  <div
                    key={step.stepNumber}
                    className={`step-item ${stepStatus} ${isFocused ? "focused" : ""}`}
                    onClick={() => {
                      if (!isUnlocked) {
                        setLessonMessage("Complete the current step's reading, assessment, written response, and assignment to unlock this step.");
                        return;
                      }
                      setLessonMessage("");
                      rememberActiveStep(step.stepNumber);
                      setActiveStepTab(step.stepNumber);
                      setIsLessonOpen(true);
                    }}
                  >
                    <div className="step-left">
                      <button
                        type="button"
                        className={`step-checkbox-btn ${stepStatus}`}
                        disabled={!isDone}
                        title={
                          isDone
                            ? "Milestone complete"
                            : isUnlocked
                              ? "Complete the lesson activities to earn this milestone"
                              : "Locked until the previous milestone is complete"
                        }
                      >
                        {isDone ? "✓" : isUnlocked ? "•" : (
                          <LockIcon />
                        )}
                      </button>

                      <div className="step-number-badge">
                        Step {step.stepNumber}
                      </div>
                    </div>

                    <div className="step-center">
                      <h3 className="step-heading">{step.title}</h3>
                      <p className="step-short-desc">{step.description}</p>
                      <div className="step-meta-chips">
                        <span className="meta-weeks">
                          ⏱ {getPersonalizedWeeks(step.estimatedWeeks)} Weeks
                        </span>
                        <span className="meta-topics-count">
                          📚 {step.topics?.length || 0} Key Topics
                        </span>
                        <span className={`step-badge-status ${stepStatus}`}>
                          {isDone ? "✓ Completed" : isUnlocked ? "● In progress" : (
                            <><LockIcon /> Locked</>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="step-right">
                      <span className="expand-indicator">
                        {isFocused ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STEP DETAIL SIDEBAR */}
            {isLessonOpen && <div className="step-detail-sidebar" role="dialog" aria-modal="true" aria-labelledby="active-lesson-title">
              {(() => {
                const currentStepObj = activeRoadmapStep || roadmap.steps[0];
                const isStepDone = completedMilestones.includes(currentStepObj.stepNumber);
                const readingDone = Boolean(lessonProgress?.readingCompleted);
                const quizDone = Boolean(
                  lessonProgress?.quizPassed &&
                  lessonProgress.quizAnswers?.length === QUIZ_QUESTION_COUNT &&
                  lessonProgress.quizScore >= QUIZ_PASSING_SCORE
                );
                const subjectiveDone = Boolean(lessonProgress?.subjectiveResponse);
                const assignmentDone = Boolean(lessonProgress?.assignmentCompleted);

                return (
                  <div className="step-detail-card">
                    <div className="lesson-fullscreen-header">
                      <button
                        type="button"
                        className="lesson-back-btn"
                        onClick={() => setIsLessonOpen(false)}
                      >
                        ← All roadmap steps
                      </button>
                      <span>{selectedCareer?.name || roadmap.careerName} · Step {currentStepObj.stepNumber} of {totalMilestones}</span>
                    </div>

                    <div className="detail-step-badge">
                      Step {currentStepObj.stepNumber} of {totalMilestones}
                    </div>

                    <h2 id="active-lesson-title">{currentStepObj.title}</h2>
                    <p className="detail-desc">{currentStepObj.description}</p>

                    <div className="lesson-checklist" aria-label="Lesson completion checklist">
                      <span className={readingDone ? "lesson-check-done" : ""}>{readingDone ? "✓" : "○"} Read</span>
                      <span className={quizDone ? "lesson-check-done" : ""}>{quizDone ? "✓" : "○"} MCQ</span>
                      <span className={subjectiveDone ? "lesson-check-done" : ""}>{subjectiveDone ? "✓" : "○"} Written</span>
                      <span className={assignmentDone ? "lesson-check-done" : ""}>{assignmentDone ? "✓" : "○"} Assignment</span>
                    </div>

                    {lessonMessage && <p className="lesson-message" role="status">{lessonMessage}</p>}
                    {saveStatus && <p className="lesson-save-status" role="status">{saveStatus}</p>}

                    <section className="lesson-section">
                      <h3>1. Read the lesson</h3>
                      <p className="lesson-section-note">Study the chapter and use the review prompts to check your understanding before taking the assessment.</p>
                      <article className="lesson-reading" aria-label={`${currentStepObj.title} lesson`}>
                        <p className="lesson-reading-intro">{lessonContent?.reading.introduction}</p>

                        <section className="lesson-reading-block">
                          <h4>Core definition</h4>
                          <p>{lessonContent?.reading.definition}</p>
                        </section>

                        <section className="lesson-reading-block">
                          <h4>Learning objectives</h4>
                          <p>By the end of this chapter, you should be able to:</p>
                          <ul>
                            {lessonContent?.reading.objectives.map((objective) => (
                              <li key={objective}>{objective}</li>
                            ))}
                          </ul>
                        </section>

                        <section className="lesson-reading-block">
                          <h4>Why this matters in the profession</h4>
                          <p>{lessonContent?.reading.importance}</p>
                        </section>

                        <section className="lesson-reading-block">
                          <h4>Key ideas</h4>
                          {lessonContent?.reading.keyIdeas.map((idea) => (
                            <div className="lesson-reading-idea" key={idea.title}>
                              <h5>{idea.title}</h5>
                              <p>{idea.explanation}</p>
                            </div>
                          ))}
                        </section>

                        <section className="lesson-reading-block lesson-worked-example">
                          <h4>Worked example</h4>
                          <p>{lessonContent?.reading.workedExample.context}</p>
                          <ol>
                            {lessonContent?.reading.workedExample.approach.map((action) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ol>
                          <p><strong>What a good result looks like:</strong> {lessonContent?.reading.workedExample.result}</p>
                        </section>

                        <section className="lesson-reading-block">
                          <h4>A repeatable way to apply the lesson</h4>
                          <ol>
                            {lessonContent?.reading.applicationSteps.map((action) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ol>
                        </section>

                        <section className="lesson-reading-block">
                          <h4>Common mistakes to avoid</h4>
                          <ul>
                            {lessonContent?.reading.commonMistakes.map((mistake) => (
                              <li key={mistake}>{mistake}</li>
                            ))}
                          </ul>
                        </section>

                        <section className="lesson-reading-block lesson-review">
                          <h4>Review before moving on</h4>
                          <ol>
                            {lessonContent?.reading.knowledgeCheck.map((question) => (
                              <li key={question}>{question}</li>
                            ))}
                          </ol>
                        </section>

                        <p className="lesson-reading-guidance">
                          <strong>Study guidance:</strong> {lessonContent?.reading.levelGuidance}{" "}
                          {lessonContent?.reading.outcomeGuidance}
                        </p>
                      </article>
                      {!readingDone ? (
                        <button
                          type="button"
                          className="lesson-primary-btn"
                          onClick={() => saveLessonAction(currentStepObj.stepNumber, "read")}
                        >
                          I have finished reading
                        </button>
                      ) : (
                        <p className="lesson-completion-mark">✓ Reading complete</p>
                      )}
                    </section>

                    <section className="lesson-section">
                      <h3>2. Check your understanding</h3>
                      {readingDone ? (
                        <>
                              <p className="lesson-section-note">
                                Answer all {QUIZ_QUESTION_COUNT} questions. You need at least {QUIZ_PASSING_SCORE} correct answers to pass and unlock the written question.
                              </p>
                              {lessonProgress?.quizAnswers?.length === QUIZ_QUESTION_COUNT && !quizDone && (
                                <p className="lesson-message" role="status">
                                  Assessment score: {lessonProgress.quizScore}/{QUIZ_QUESTION_COUNT}. You need at least {QUIZ_PASSING_SCORE} correct answers; review and try again.
                                </p>
                              )}
                              {!quizDone ? (
                                <form onSubmit={async (event) => {
                                  event.preventDefault();
                                  const answers = lessonContent.questions.map((_, index) => selectedQuizAnswers[index]);
                                  if (answers.some((answer) => answer === undefined)) {
                                    setLessonMessage(`Answer all ${QUIZ_QUESTION_COUNT} questions before submitting the assessment.`);
                                    return;
                                  }
                                  const result = await saveLessonAction(
                                    currentStepObj.stepNumber,
                                    "quiz",
                                    { answers: answers.map(Number) }
                                  );
                                  const savedLesson = result?.progress?.courseProgress?.find(
                                    (lesson) => lesson.stepNumber === currentStepObj.stepNumber
                                  );
                                  if (savedLesson?.quizPassed) {
                                    scrollToLessonSection(`written-assessment-${currentStepObj.stepNumber}`);
                                  }
                                }}>
                                  {lessonContent?.questions.map((question, questionIndex) => (
                                    <div className="lesson-question-card" key={`${currentStepObj.stepNumber}-${questionIndex}`}>
                                      <h4>{questionIndex + 1}. {question.prompt}</h4>
                                      <div className="lesson-quiz-options">
                                        {question.options.map((option, optionIndex) => (
                                          <label
                                            key={option}
                                            className={selectedQuizAnswers[questionIndex] === String(optionIndex) ? "selected" : ""}
                                          >
                                            <input
                                              type="radio"
                                              name={`lesson-quiz-${currentStepObj.stepNumber}-${questionIndex}`}
                                              value={optionIndex}
                                              checked={selectedQuizAnswers[questionIndex] === String(optionIndex)}
                                              onChange={(event) => updateActiveLessonDraft({ quizAnswers: {
                                                ...selectedQuizAnswers,
                                                [questionIndex]: event.target.value,
                                              } })}
                                            />
                                            {option}
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  <button type="submit" className="lesson-primary-btn">
                                    Submit
                                  </button>
                                </form>
                              ) : (
                                <p className="lesson-completion-mark">
                                  ✓ Assessment passed: {lessonProgress.quizScore}/{QUIZ_QUESTION_COUNT}. You need at least {QUIZ_PASSING_SCORE} correct answers.
                                </p>
                              )}

                          {quizDone && (
                            <div
                              className="written-assessment"
                              id={`written-assessment-${currentStepObj.stepNumber}`}
                            >
                              <h4>Written assessment</h4>
                              <p>{lessonContent?.subjectivePrompt}</p>
                              <textarea
                                value={subjectiveResponse}
                                onChange={(event) => updateActiveLessonDraft({ subjectiveResponse: event.target.value })}
                                maxLength={4000}
                                rows={5}
                                disabled={subjectiveDone}
                                placeholder="Write your answer in your own words."
                              />
                              <span>{subjectiveResponse.trim().length}/4000 characters</span>
                              {!quizDone || !subjectiveDone ? (
                                <button
                                  type="button"
                                  className="lesson-primary-btn"
                                  disabled={!subjectiveResponse.trim()}
                                  onClick={async () => {
                                    const result = await saveLessonAction(
                                      currentStepObj.stepNumber,
                                      "subjective",
                                      { response: subjectiveResponse }
                                    );
                                    const savedLesson = result?.progress?.courseProgress?.find(
                                      (lesson) => lesson.stepNumber === currentStepObj.stepNumber
                                    );
                                    if (savedLesson?.subjectiveResponse) {
                                      scrollToLessonSection(`assignment-${currentStepObj.stepNumber}`);
                                    }
                                  }}
                                >
                                  Submit written assessment
                                </button>
                              ) : (
                                <p className="lesson-completion-mark">✓ Written assessment submitted</p>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="lesson-lock-note"><LockIcon /> Finish the reading to unlock the assessment.</p>
                      )}
                    </section>

                    <section
                      id={`assignment-${currentStepObj.stepNumber}`}
                      className={`lesson-section ${!quizDone || !subjectiveDone ? "lesson-locked" : ""}`}
                    >
                      <h3>3. Complete the assignment</h3>
                      {!subjectiveDone ? (
                        <p className="lesson-lock-note"><LockIcon /> Submit both assessments before starting the assignment.</p>
                      ) : (
                        <>
                          <p>{lessonContent?.assignment}</p>
                          <textarea
                            className="assignment-response"
                            aria-label="Your assignment work"
                            value={assignmentResponse}
                            onChange={(event) => updateActiveLessonDraft({ assignmentResponse: event.target.value })}
                            minLength={40}
                            maxLength={4000}
                            rows={7}
                            disabled={assignmentDone}
                            placeholder="Complete the assignment above. Describe your work, steps, and result (at least 40 characters)."
                          />
                          <span className="assignment-response-count">
                            {assignmentResponse.trim().length}/4000 characters (minimum 40)
                          </span>
                          {!assignmentDone ? (
                            <button
                              type="button"
                              className="lesson-primary-btn"
                              disabled={assignmentResponse.trim().length < 40}
                              onClick={async () => {
                                const result = await saveLessonAction(
                                  currentStepObj.stepNumber,
                                  "assignment",
                                  { response: assignmentResponse }
                                );
                                if (result?.progress?.completedMilestones?.includes(currentStepObj.stepNumber)) {
                                  scrollToLessonSection(`milestone-certificate-${currentStepObj.stepNumber}`);
                                }
                              }}
                            >
                              Submit assignment and complete step
                            </button>
                          ) : (
                            <>
                              <p className="lesson-completion-mark">✓ Assignment submitted</p>
                              <details className="assignment-submission">
                                <summary>View your submitted work</summary>
                                <p>{lessonProgress?.assignmentResponse}</p>
                              </details>
                            </>
                          )}
                        </>
                      )}
                    </section>

                    {isStepDone && (
                      <section
                        id={`milestone-certificate-${currentStepObj.stepNumber}`}
                        className="milestone-award"
                      >
                        <h3>🎉 Step {currentStepObj.stepNumber} completion certificate</h3>
                        <p>You finished the reading, assessment, written response, and assignment. Your milestone certificate is ready.</p>
                        <button
                          type="button"
                          className="lesson-primary-btn"
                          onClick={() => downloadCertificate(currentStepObj.stepNumber)}
                        >
                          Download Step {currentStepObj.stepNumber} certificate
                        </button>
                        {currentStepObj.stepNumber < totalMilestones ? (
                          <button
                            type="button"
                            className="lesson-primary-btn"
                            onClick={() => {
                              setLessonMessage("");
                              rememberActiveStep(currentStepObj.stepNumber + 1);
                              setActiveStepTab(currentStepObj.stepNumber + 1);
                            }}
                          >
                            Continue to Step {currentStepObj.stepNumber + 1} →
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="lesson-primary-btn"
                            onClick={() => setIsLessonOpen(false)}
                          >
                            Return to all roadmap steps
                          </button>
                        )}
                      </section>
                    )}

                    <div className="detail-action-box">
                      <Link
                        to={`/resources?careerSlug=${selectedSlug}`}
                        className="resources-step-link"
                      >
                        View Recommended Resources ↗
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Roadmap;
