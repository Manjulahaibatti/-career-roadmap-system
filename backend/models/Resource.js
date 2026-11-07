import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    resourceKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Courses", "Articles", "Videos", "Books", "Practice", "Projects"],
    },
    isTechnical: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: String,
      default: "Open Source / Community",
    },
    duration: {
      type: String,
      default: "Self-paced",
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: true,
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    studyPlan: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "All Levels",
    },
    link: {
      type: String,
      required: true,
      default: "#",
    },
    careerSlug: {
      type: String,
      default: "general",
    },
    tags: {
      type: [String],
      default: [],
    },
    isCareerResource: {
      type: Boolean,
      default: false,
    },
    isRoadmapLesson: {
      type: Boolean,
      default: false,
    },
    stepNumber: {
      type: Number,
    },
    courseContent: {
      type: mongoose.Schema.Types.Mixed,
    },
    resourceContent: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
