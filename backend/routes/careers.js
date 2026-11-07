import express from "express";
import Career from "../models/Career.js";
import {
  findGeneratedCareer,
  getGeneratedCareerCatalog,
} from "../../shared/careerCatalog.js";

const router = express.Router();

// @route   GET /api/careers
// @desc    Get all careers
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, difficulty, domain, isTechnical, search, careerType, sector } = req.query;
    const catalog = getGeneratedCareerCatalog();
    const savedCareers = await Career.find({
      slug: { $in: catalog.map((career) => career.slug) },
    }).lean();
    const savedCareersBySlug = new Map(savedCareers.map((career) => [career.slug, career]));
    const allCareers = catalog.map((career) => ({
      ...career,
      ...savedCareersBySlug.get(career.slug),
      careerType: career.careerType,
      sector: career.sector,
    }));
    const searchTerm = search?.toLowerCase();
    const careers = allCareers.filter((career) => {
      if (category && category !== "All" && career.category !== category) return false;
      if (domain && domain !== "All" && career.domain !== domain) return false;
      if (difficulty && difficulty !== "All" && career.difficulty !== difficulty) return false;
      if (isTechnical !== undefined && isTechnical !== "All" &&
          career.isTechnical !== (isTechnical === "true")) return false;
      if (careerType && careerType !== "All" &&
          career.careerType !== careerType) return false;
      if (sector && sector !== "All" && career.sector !== sector) return false;
      if (searchTerm && ![
        career.name,
        career.description,
        career.industry,
        ...(career.skills || []),
      ].some((value) => value?.toLowerCase().includes(searchTerm))) return false;
      return true;
    });
    return res.json(careers);
  } catch (error) {
    console.error("Error fetching careers:", error);
    return res.status(500).json({ message: "Error fetching careers" });
  }
});

// @route   GET /api/careers/:slug
// @desc    Get single career details
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const career = await Career.findOne({ slug: req.params.slug.toLowerCase() });
    if (!career) {
      const generatedCareer = findGeneratedCareer(req.params.slug.toLowerCase());
      if (!generatedCareer) {
        return res.status(404).json({ message: "Career not found" });
      }
      return res.json(generatedCareer);
    }
    return res.json(career);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching career details" });
  }
});

export default router;
