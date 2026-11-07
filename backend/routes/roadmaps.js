import express from "express";
import Roadmap from "../models/Roadmap.js";
import { createCareerRoadmap, findGeneratedCareer } from "../../shared/careerCatalog.js";

const router = express.Router();

// @route   GET /api/roadmaps
// @desc    Get all roadmaps summary
// @access  Public
router.get("/", async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().select("careerSlug careerName overview");
    return res.json(roadmaps);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching roadmaps" });
  }
});

// @route   GET /api/roadmaps/:careerSlug
// @desc    Get roadmap for specific career
// @access  Public
router.get("/:careerSlug", async (req, res) => {
  try {
    const slug = req.params.careerSlug.toLowerCase();
    const roadmap = await Roadmap.findOne({ careerSlug: slug });
    if (!roadmap) {
      const career = findGeneratedCareer(slug);
      if (!career) {
        return res.status(404).json({ message: "Roadmap not found for this career" });
      }
      return res.json(createCareerRoadmap(career));
    }
    return res.json(roadmap);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching roadmap details" });
  }
});

export default router;
