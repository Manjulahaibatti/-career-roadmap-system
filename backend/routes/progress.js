import express from "express";
import { randomUUID } from "crypto";
import Progress from "../models/Progress.js";
import Roadmap from "../models/Roadmap.js";
import Career from "../models/Career.js";
import { protect } from "../middleware/auth.js";
import { createCareerRoadmap, findGeneratedCareer } from "../../shared/careerCatalog.js";
import {
  createLessonContent,
  QUIZ_PASSING_SCORE,
  QUIZ_QUESTION_COUNT,
} from "../../shared/lessonContent.js";

const router = express.Router();

const lessonIsComplete = (lesson) =>
  lesson.readingCompleted &&
  lesson.quizPassed &&
  lesson.quizAnswers?.length === QUIZ_QUESTION_COUNT &&
  lesson.quizScore >= QUIZ_PASSING_SCORE &&
  Boolean(lesson.subjectiveResponse) &&
  lesson.assignmentCompleted;

const syncVerifiedMilestones = (progress, totalSteps) => {
  const verifiedMilestones = [
    ...new Set(
      progress.courseProgress
        .filter(lessonIsComplete)
        .map((lesson) => lesson.stepNumber)
        .filter((stepNumber) => Number.isInteger(stepNumber) && stepNumber > 0 && stepNumber <= totalSteps)
    ),
  ].sort((first, second) => first - second);
  progress.completedMilestones = verifiedMilestones;
  progress.progressPercentage = Math.min(
    100,
    Math.round((verifiedMilestones.length / Math.max(1, totalSteps)) * 100)
  );
};

// @route   GET /api/progress
// @desc    Get all progress records for the authenticated user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const progressList = await Progress.find({ userId: req.user._id });
    return res.json(progressList);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user progress" });
  }
});

// @route   GET /api/progress/:careerSlug
// @desc    Get user progress for a specific career
// @access  Private
router.get("/:careerSlug", protect, async (req, res) => {
  try {
    const slug = req.params.careerSlug.toLowerCase();
    let progress = await Progress.findOne({
      userId: req.user._id,
      careerSlug: slug,
    });

    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id,
        careerSlug: slug,
        completedMilestones: [],
        progressPercentage: 0,
      });
    }

    const savedRoadmap = await Roadmap.findOne({ careerSlug: slug }).lean();
    const career = await Career.findOne({ slug }).lean() || findGeneratedCareer(slug);
    const roadmap = savedRoadmap || (career ? createCareerRoadmap(career) : null);
    const totalSteps = roadmap?.steps?.length || 6;
    syncVerifiedMilestones(progress, totalSteps);
    await progress.save();

    return res.json(progress);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching career progress" });
  }
});

// @route   POST /api/progress/toggle
// @desc    Toggle milestone step completion for user
// @access  Private
router.post("/:careerSlug/lesson", protect, async (req, res) => {
  try {
    const slug = req.params.careerSlug.toLowerCase();
    const stepNumber = Number(req.body.stepNumber);
    const { action } = req.body;

    if (!Number.isInteger(stepNumber) || stepNumber < 1) {
      return res.status(400).json({ message: "A valid step number is required." });
    }

    const career = await Career.findOne({ slug }).lean() || findGeneratedCareer(slug);
    if (!career) {
      return res.status(404).json({ message: "Career not found." });
    }

    const savedRoadmap = await Roadmap.findOne({ careerSlug: slug }).lean();
    const roadmap = savedRoadmap || createCareerRoadmap(career);
    if (stepNumber > roadmap.steps.length) {
      return res.status(400).json({ message: "That roadmap step does not exist." });
    }

    let progress = await Progress.findOne({
      userId: req.user._id,
      careerSlug: slug,
    });
    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        careerSlug: slug,
        completedMilestones: [],
        courseProgress: [],
      });
    }

    syncVerifiedMilestones(progress, roadmap.steps.length);

    if (stepNumber > 1 && !progress.completedMilestones.includes(stepNumber - 1)) {
      return res.status(409).json({ message: "Complete the previous step before starting this one." });
    }

    let lesson = progress.courseProgress.find((item) => item.stepNumber === stepNumber);
    if (!lesson) {
      progress.courseProgress.push({ stepNumber });
      lesson = progress.courseProgress.find((item) => item.stepNumber === stepNumber);
    }
    progress.activeStepNumber = stepNumber;

    const step = roadmap.steps.find((item) => item.stepNumber === stepNumber);
    const lessonContent = createLessonContent(career, step);

    if (action === "read") {
      lesson.readingCompleted = true;
    } else if (action === "draft") {
      const { quizAnswerDraft, subjectiveResponseDraft, assignmentResponseDraft, activeStepNumber } = req.body;
      if (
        quizAnswerDraft !== undefined &&
        (!Array.isArray(quizAnswerDraft) ||
          quizAnswerDraft.length !== QUIZ_QUESTION_COUNT ||
          quizAnswerDraft.some((answer) => !Number.isInteger(answer) || answer < -1 || answer > 3))
      ) {
        return res.status(400).json({ message: "The saved quiz answers have an invalid format." });
      }
      if (
        subjectiveResponseDraft !== undefined &&
        (typeof subjectiveResponseDraft !== "string" || subjectiveResponseDraft.length > 4000)
      ) {
        return res.status(400).json({ message: "The written assessment draft must be 4,000 characters or fewer." });
      }
      if (
        assignmentResponseDraft !== undefined &&
        (typeof assignmentResponseDraft !== "string" || assignmentResponseDraft.length > 4000)
      ) {
        return res.status(400).json({ message: "The assignment draft must be 4,000 characters or fewer." });
      }
      if (
        activeStepNumber !== undefined &&
        (!Number.isInteger(activeStepNumber) ||
          activeStepNumber !== stepNumber ||
          activeStepNumber < 1 ||
          activeStepNumber > roadmap.steps.length)
      ) {
        return res.status(400).json({ message: "The active roadmap step is invalid." });
      }
      if (quizAnswerDraft !== undefined) lesson.quizAnswerDraft = quizAnswerDraft;
      if (subjectiveResponseDraft !== undefined) lesson.subjectiveResponseDraft = subjectiveResponseDraft;
      if (assignmentResponseDraft !== undefined) lesson.assignmentResponseDraft = assignmentResponseDraft;
    } else if (action === "quiz") {
      if (!lesson.readingCompleted) {
        return res.status(409).json({ message: "Finish the reading before taking the quiz." });
      }
      const answers = req.body.answers;
      if (
        !Array.isArray(answers) ||
        answers.length !== QUIZ_QUESTION_COUNT ||
        answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)
      ) {
        return res.status(400).json({
          message: `Answer all ${QUIZ_QUESTION_COUNT} questions before submitting the assessment.`,
        });
      }
      lesson.quizAnswers = answers;
      lesson.quizScore = answers.reduce(
        (score, answer, index) => score + Number(answer === lessonContent.questions[index].correctAnswer),
        0
      );
      lesson.quizPassed = lesson.quizScore >= QUIZ_PASSING_SCORE;
    } else if (action === "subjective") {
      const response = String(req.body.response || "").trim();
      if (!lesson.quizPassed) {
        return res.status(409).json({ message: "Pass the multiple-choice quiz before submitting your written assessment." });
      }
      if (!response) {
        return res.status(400).json({ message: "Submit a written assessment response." });
      }
      if (response.length > 4000) {
        return res.status(400).json({ message: "The written assessment must be 4,000 characters or fewer." });
      }
      lesson.subjectiveResponse = response;
    } else if (action === "assignment") {
      if (
        !lesson.quizPassed ||
        lesson.quizAnswers?.length !== QUIZ_QUESTION_COUNT ||
        lesson.quizScore < QUIZ_PASSING_SCORE ||
        !lesson.subjectiveResponse
      ) {
        return res.status(409).json({ message: "Pass both assessments before completing the assignment." });
      }
      const response = String(req.body.response || "").trim();
      if (response.length < 40) {
        return res.status(400).json({ message: "Submit at least 40 characters of assignment work." });
      }
      if (response.length > 4000) {
        return res.status(400).json({ message: "The assignment response must be 4,000 characters or fewer." });
      }
      lesson.assignmentResponse = response;
      lesson.assignmentCompleted = true;
    } else {
      return res.status(400).json({ message: "Choose a valid lesson action." });
    }

    const isComplete = lessonIsComplete(lesson);
    if (isComplete && !progress.completedMilestones.includes(stepNumber)) {
      lesson.completedAt = new Date();
      lesson.certificateId = `CRS-${randomUUID()}`;
      progress.completedMilestones.push(stepNumber);
    }

    progress.progressPercentage = Math.min(
      100,
      Math.round((progress.completedMilestones.length / roadmap.steps.length) * 100)
    );
    await progress.save();

    return res.json({
      message: isComplete
        ? "Lesson completed and milestone certificate issued."
        : action === "quiz"
          ? lesson.quizPassed
            ? `Assessment passed: ${lesson.quizScore}/${QUIZ_QUESTION_COUNT}.`
            : `Assessment score: ${lesson.quizScore}/${QUIZ_QUESTION_COUNT}. You need at least ${QUIZ_PASSING_SCORE} correct answers; review and try again.`
          : "Lesson progress saved.",
      progress,
    });
  } catch (error) {
    console.error("Error saving lesson progress:", error);
    return res.status(500).json({ message: "Error saving lesson progress." });
  }
});

router.post("/toggle", protect, (req, res) =>
  res.status(409).json({
      message: "Milestones are awarded after finishing the reading, assessment, written response, and assignment.",
  })
);

export default router;
