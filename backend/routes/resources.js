import express from "express";
import Resource from "../models/Resource.js";
import Career from "../models/Career.js";
import Roadmap from "../models/Roadmap.js";
import { createCareerRoadmap, findGeneratedCareer } from "../../shared/careerCatalog.js";
import {
  createCareerCourseResources,
  matchesCareerCourseResourceSearch,
} from "../../shared/careerCourseResources.js";

const router = express.Router();

// @route   GET /api/resources
// @desc    Get resources with optional filtering
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, careerSlug, difficulty, isTechnical, search } = req.query;
    const hasCareerFilter = careerSlug && careerSlug !== "all";
    if (category === "Videos") {
      return res.json([]);
    }
    const filter = {};
    filter.category = { $ne: "Videos" };

    if (category && category !== "All") {
      filter.category = category;
    }
    if (hasCareerFilter) {
      filter.careerSlug = careerSlug.toLowerCase();
    } else {
      filter.isCareerResource = { $ne: true };
    }
    if (isTechnical !== undefined && isTechnical !== "All") {
      filter.isTechnical = isTechnical === "true";
    }
    if (difficulty && difficulty !== "All") {
      filter.difficulty = difficulty;
    }
    if (search && !hasCareerFilter) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { learningOutcomes: { $regex: search, $options: "i" } },
        { studyPlan: { $regex: search, $options: "i" } },
      ];
    }

    const fetchedResources = await Resource.find(filter).sort({ createdAt: -1 }).lean();
    const resources = search && hasCareerFilter
      ? fetchedResources.filter((resource) => matchesCareerCourseResourceSearch(resource, search))
      : fetchedResources;
    const career = careerSlug
      ? await Career.findOne({ slug: careerSlug.toLowerCase() }).lean() || findGeneratedCareer(careerSlug.toLowerCase())
      : null;
    if (!career || resources.some((resource) => resource.isCareerResource)) {
      return res.json(resources);
    }

    const savedRoadmap = await Roadmap.findOne({ careerSlug: career.slug }).lean();
    const roadmap = savedRoadmap || createCareerRoadmap(career);
    const courseResources = createCareerCourseResources(career, roadmap);
    return res.json([
      ...resources,
      ...courseResources.filter((resource) => {
        if (category && category !== "All" && resource.category !== category) return false;
        if (isTechnical !== undefined && resource.isTechnical !== (isTechnical === "true")) return false;
        if (difficulty && difficulty !== "All" && resource.difficulty !== difficulty) return false;
        if (!matchesCareerCourseResourceSearch(resource, search)) return false;
        return true;
      }),
    ]);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching resources" });
  }
});

// @route   GET /api/resources/categories
// @desc    Get available resource categories
// @access  Public
router.get("/categories", (req, res) => {
  const categories = [
    "Courses",
    "Articles",
    "Books",
    "Practice",
    "Projects",
  ];
  return res.json(categories);
});

export default router;
