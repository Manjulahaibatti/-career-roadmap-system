import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: true,
    },
    readingCompleted: {
      type: Boolean,
      default: false,
    },
    quizPassed: {
      type: Boolean,
      default: false,
    },
    quizAnswers: {
      type: [Number],
      default: [],
    },
    quizAnswerDraft: {
      type: [Number],
      default: [],
    },
    quizScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    subjectiveResponseDraft: {
      type: String,
      default: "",
      maxlength: 4000,
    },
    subjectiveResponse: {
      type: String,
      default: "",
    },
    assignmentResponseDraft: {
      type: String,
      default: "",
      maxlength: 4000,
    },
    assignmentResponse: {
      type: String,
      default: "",
      maxlength: 4000,
    },
    assignmentCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    certificateId: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    careerSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    completedMilestones: {
      type: [Number],
      default: [],
    },
    courseProgress: {
      type: [lessonProgressSchema],
      default: [],
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    activeStepNumber: {
      type: Number,
      min: 1,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a user only has one progress record per career
progressSchema.index({ userId: 1, careerSlug: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
