import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      minlength: 6,
    },
    currentCareer: {
      type: String,
      default: "software-developer",
    },
    savedCareers: {
      type: [String],
      default: ["software-developer"],
    },
    bio: {
      type: String,
      default: "Passionate tech learner building skills towards my dream career.",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    profileImage: {
      type: String,
      default: "",
      maxlength: [1400000, "Profile image is too large"],
    },
    profileAvatar: {
      type: String,
      default: "",
    },
    targetRole: {
      type: String,
      default: "Software Developer",
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner / Student", "Junior (0-2 yrs)", "Mid-level (2-5 yrs)", "Senior (5+ yrs)", "Career Switcher"],
      default: "Beginner / Student",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    linkedinUrl: {
      type: String,
      default: "",
    },
    bookmarkedResources: {
      type: [String],
      default: [],
    },
    resetPasswordTokenHash: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Never expose passwordHash when converting to JSON or Object
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
