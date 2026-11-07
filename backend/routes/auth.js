import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Career from "../models/Career.js";
import { protect } from "../middleware/auth.js";
import { isCuteProfileAvatar } from "../../shared/profileAvatars.js";
import { findGeneratedCareer } from "../../shared/careerCatalog.js";

const router = express.Router();

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "fallback_career_roadmap_secret_2026",
    { expiresIn: "30d" }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate fields presence
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields: name, email, and password.",
      });
    }

    // Validate confirm password if provided
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      currentCareer: "software-developer",
      savedCareers: ["software-developer"],
    });

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentCareer: user.currentCareer,
        savedCareers: user.savedCareers,
        bookmarkedResources: user.bookmarkedResources || [],
        roadmapPreferences: user.roadmapPreferences,
        profileImage: user.profileImage,
        profileAvatar: user.profileAvatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Server error during registration. Please try again later.",
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentCareer: user.currentCareer,
        savedCareers: user.savedCareers,
        bookmarkedResources: user.bookmarkedResources || [],
        roadmapPreferences: user.roadmapPreferences,
        profileImage: user.profileImage,
        profileAvatar: user.profileAvatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error during login. Please try again later.",
      error: error.message,
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    const genericMessage =
      "If an account exists for that email, password reset instructions have been created.";

    if (!normalizedEmail) {
      return res.status(200).json({ message: genericMessage });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordTokenHash = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log(`Password reset link for ${normalizedEmail}: ${resetUrl}`);
      return res.json({ message: genericMessage, resetUrl });
    }

    return res.json({ message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Unable to process the password reset request. Please try again later.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ message: "Email, reset token, and new password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "This password reset link is invalid or expired." });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Unable to reset the password. Please request a new link.",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        currentCareer: req.user.currentCareer,
        savedCareers: req.user.savedCareers,
        bookmarkedResources: req.user.bookmarkedResources || [],
        roadmapPreferences: req.user.roadmapPreferences,
        bio: req.user.bio,
        profileImage: req.user.profileImage,
        profileAvatar: req.user.profileAvatar,
        targetRole: req.user.targetRole,
        experienceLevel: req.user.experienceLevel,
        githubUrl: req.user.githubUrl,
        linkedinUrl: req.user.linkedinUrl,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error fetching user profile.",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile information
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const {
      name,
      bio,
      targetRole,
      experienceLevel,
      githubUrl,
      linkedinUrl,
      profileImage,
      profileAvatar,
      currentCareer,
      roadmapPreferences,
    } = req.body;

    if (name && name.trim().length >= 2) {
      req.user.name = name.trim();
    }
    if (currentCareer !== undefined) {
      if (typeof currentCareer !== "string" || !currentCareer.trim()) {
        return res.status(400).json({ message: "Choose a valid career goal." });
      }
      const careerSlug = currentCareer.trim().toLowerCase();
      const careerExists = await Career.exists({ slug: careerSlug });
      if (!careerExists && !findGeneratedCareer(careerSlug)) {
        return res.status(400).json({ message: "Choose a career that exists in the catalog." });
      }
      req.user.currentCareer = careerSlug;
      if (!req.user.savedCareers.includes(careerSlug)) {
        req.user.savedCareers.push(careerSlug);
      }
      if (roadmapPreferences === undefined) {
        req.user.set("roadmapPreferences.targetCareerSlug", careerSlug);
      }
    }
    if (roadmapPreferences !== undefined) {
      const { learnerName, degreeCourse, targetCareerSlug, level, weeklyHours, focus } =
        roadmapPreferences || {};
      if (
        typeof learnerName !== "string" ||
        learnerName.trim().length > 100 ||
        typeof degreeCourse !== "string" ||
        degreeCourse.trim().length > 120 ||
        typeof targetCareerSlug !== "string" ||
        !["Beginner", "Intermediate", "Advanced"].includes(level) ||
        !Number.isInteger(weeklyHours) ||
        weeklyHours < 2 ||
        weeklyHours > 40 ||
        ![
          "Job-ready portfolio",
          "Career switch",
          "Freelance launch",
          "Interview preparation",
        ].includes(focus)
      ) {
        return res.status(400).json({ message: "Roadmap preferences are invalid." });
      }
      const careerSlug = targetCareerSlug.trim().toLowerCase();
      const careerExists = await Career.exists({ slug: careerSlug });
      if (!careerExists && !findGeneratedCareer(careerSlug)) {
        return res.status(400).json({ message: "Choose a career that exists in the catalog." });
      }
      req.user.roadmapPreferences = {
        learnerName: learnerName.trim(),
        degreeCourse: degreeCourse.trim(),
        targetCareerSlug: careerSlug,
        level,
        weeklyHours,
        focus,
      };
    }
    if (bio !== undefined) {
      req.user.bio = bio.trim().slice(0, 300);
    }
    if (targetRole !== undefined) {
      req.user.targetRole = targetRole.trim();
    }
    if (experienceLevel !== undefined) {
      req.user.experienceLevel = experienceLevel;
    }
    if (githubUrl !== undefined) {
      req.user.githubUrl = githubUrl.trim();
    }
    if (linkedinUrl !== undefined) {
      req.user.linkedinUrl = linkedinUrl.trim();
    }
    if (profileImage !== undefined) {
      if (profileImage === "") {
        req.user.profileImage = "";
        if (profileAvatar === undefined) req.user.profileAvatar = "";
      } else {
        const imageMatch = /^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/.exec(profileImage);
        if (!imageMatch) {
          return res.status(400).json({ message: "Choose a valid JPEG, PNG, WebP, or GIF image." });
        }
        const imageBuffer = Buffer.from(imageMatch[2], "base64");
        if (imageBuffer.length === 0 || imageBuffer.length > 1024 * 1024) {
          return res.status(400).json({ message: "Profile images must be 1 MB or smaller." });
        }
        req.user.profileImage = profileImage;
        req.user.profileAvatar = "";
      }
    }
    if (profileAvatar !== undefined) {
      if (profileAvatar === "") {
        req.user.profileAvatar = "";
      } else if (!isCuteProfileAvatar(profileAvatar)) {
        return res.status(400).json({ message: "Choose one of the available profile avatars." });
      } else {
        req.user.profileAvatar = profileAvatar;
        req.user.profileImage = "";
      }
    }

    await req.user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        currentCareer: req.user.currentCareer,
        savedCareers: req.user.savedCareers || [],
        roadmapPreferences: req.user.roadmapPreferences,
        bookmarkedResources: req.user.bookmarkedResources || [],
        bio: req.user.bio,
        profileImage: req.user.profileImage,
        profileAvatar: req.user.profileAvatar,
        targetRole: req.user.targetRole,
        experienceLevel: req.user.experienceLevel,
        githubUrl: req.user.githubUrl,
        linkedinUrl: req.user.linkedinUrl,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// @route   PUT /api/auth/career-goal
// @desc    Update user's active career goal
// @access  Private
router.put("/career-goal", protect, async (req, res) => {
  try {
    const { currentCareer } = req.body;
    if (!currentCareer) {
      return res.status(400).json({ message: "Career slug is required" });
    }

    if (typeof currentCareer !== "string") {
      return res.status(400).json({ message: "Career slug is invalid" });
    }
    const careerSlug = currentCareer.trim().toLowerCase();
    const careerExists = await Career.exists({ slug: careerSlug });
    if (!careerExists && !findGeneratedCareer(careerSlug)) {
      return res.status(404).json({ message: "Career not found" });
    }

    req.user.currentCareer = careerSlug;
    req.user.set("roadmapPreferences.targetCareerSlug", careerSlug);
    if (!req.user.savedCareers.includes(careerSlug)) {
      req.user.savedCareers.push(careerSlug);
    }
    await req.user.save();

    return res.json({
      message: "Career goal updated",
      currentCareer: req.user.currentCareer,
      savedCareers: req.user.savedCareers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update career goal",
    });
  }
});

// @route   POST /api/auth/bookmarks/toggle
// @desc    Toggle bookmark a resource for user
// @access  Private
router.post("/bookmarks/toggle", protect, async (req, res) => {
  try {
    const { resourceId } = req.body;
    if (!resourceId) {
      return res.status(400).json({ message: "Resource ID is required" });
    }

    if (!req.user.bookmarkedResources) {
      req.user.bookmarkedResources = [];
    }

    const idx = req.user.bookmarkedResources.indexOf(resourceId);
    let isBookmarked = false;
    if (idx > -1) {
      req.user.bookmarkedResources.splice(idx, 1);
      isBookmarked = false;
    } else {
      req.user.bookmarkedResources.push(resourceId);
      isBookmarked = true;
    }

    await req.user.save();

    return res.json({
      message: isBookmarked ? "Resource bookmarked!" : "Bookmark removed",
      isBookmarked,
      bookmarkedResources: req.user.bookmarkedResources,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

// @route   POST /api/auth/saved-careers/toggle
// @desc    Toggle saving a career to user's saved list
// @access  Private
router.post("/saved-careers/toggle", protect, async (req, res) => {
  try {
    const { careerSlug } = req.body;
    if (!careerSlug) {
      return res.status(400).json({ message: "careerSlug is required" });
    }

    if (!req.user.savedCareers) {
      req.user.savedCareers = [];
    }

    const idx = req.user.savedCareers.indexOf(careerSlug);
    let isSaved = false;
    if (idx > -1) {
      req.user.savedCareers.splice(idx, 1);
      isSaved = false;
    } else {
      req.user.savedCareers.push(careerSlug);
      isSaved = true;
    }

    await req.user.save();

    return res.json({
      message: isSaved ? "Career saved to your list!" : "Career removed from saved",
      isSaved,
      savedCareers: req.user.savedCareers,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle saved career" });
  }
});

export default router;
