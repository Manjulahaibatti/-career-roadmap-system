import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  topics: {
    type: [String],
    default: [],
  },
  estimatedWeeks: {
    type: Number,
    default: 4,
  },
  resources: [
    {
      title: String,
      type: {
        type: String,
        default: "Course",
      },
      link: String,
    },
  ],
});

const roadmapSchema = new mongoose.Schema(
  {
    careerSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    careerName: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      default: "",
    },
    steps: [stepSchema],
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
