import mongoose from "mongoose";

const careerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    learningTime: {
      type: String,
      required: true,
      default: "6-9 Months",
    },
    category: {
      type: String,
      default: "Technology",
    },
    isTechnical: {
      type: Boolean,
      default: true,
    },
    domain: {
      type: String,
      enum: [
        "Software & Engineering",
        "Data & AI",
        "Design & Creative",
        "Security & DevOps",
        "Product & Management",
        "Marketing & Growth",
        "People & Operations",
      ],
      default: "Software & Engineering",
    },
    icon: {
      type: String,
      default: "💼",
    },
    demand: {
      type: String,
      default: "High Demand",
    },
    averageSalary: {
      type: String,
      default: "$85,000 - $130,000",
    },
  },
  {
    timestamps: true,
  }
);

const Career = mongoose.model("Career", careerSchema);

export default Career;
