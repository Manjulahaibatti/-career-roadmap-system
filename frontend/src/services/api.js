import {
  fallbackCareers,
  fallbackRoadmaps,
  fallbackResources,
} from "../data/fallbackData";
import {
  createCareerRoadmap,
  findGeneratedCareer,
  getGeneratedCareerCatalog,
} from "../../../shared/careerCatalog.js";
import {
  QUIZ_PASSING_SCORE,
  QUIZ_QUESTION_COUNT,
} from "../../../shared/lessonContent.js";
import { additionalResources } from "../../../shared/additionalResources.js";
import {
  createCareerCourseResources,
  matchesCareerCourseResourceSearch,
} from "../../../shared/careerCourseResources.js";

// =====================================================
// API BASE
// =====================================================
// Always use the Vite proxy.
// Browser: http://localhost:5173/api/...
// Vite forwards it to: http://localhost:5000/api/...
const API_BASE = "/api";

const lessonIsComplete = (lesson) =>
  lesson.readingCompleted &&
  lesson.quizPassed &&
  lesson.quizAnswers?.length === QUIZ_QUESTION_COUNT &&
  lesson.quizScore >= QUIZ_PASSING_SCORE &&
  Boolean(lesson.subjectiveResponse) &&
  lesson.assignmentCompleted;

const readLocalCareerProgress = (careerSlug) => {
  const stored = localStorage.getItem(`crs_progress_${careerSlug}`);
  const progress = stored
    ? JSON.parse(stored)
    : { careerSlug, completedMilestones: [], courseProgress: [], progressPercentage: 0 };
  const career =
    fallbackCareers.find((item) => item.slug === careerSlug) ||
    findGeneratedCareer(careerSlug);
  const roadmap =
    fallbackRoadmaps.find((item) => item.careerSlug === careerSlug) ||
    (career ? createCareerRoadmap(career) : null);
  const totalSteps = roadmap?.steps?.length || 6;
  progress.completedMilestones = [
    ...new Set(
      (progress.courseProgress || [])
        .filter(lessonIsComplete)
        .map((lesson) => lesson.stepNumber)
        .filter((stepNumber) => Number.isInteger(stepNumber) && stepNumber > 0 && stepNumber <= totalSteps)
    ),
  ].sort((first, second) => first - second);
  progress.progressPercentage = Math.min(
    100,
    Math.round((progress.completedMilestones.length / totalSteps) * 100)
  );
  return progress;
};

// =====================================================
// COMMON REQUEST FUNCTION
// =====================================================
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  if (!options.token) {
    const storedToken = localStorage.getItem("crs_token");
    if (storedToken) options = { ...options, token: storedToken };
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add JWT token when provided
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // token is only used internally and should not be
  // passed to fetch as an unknown option
  delete config.token;

  // Convert JavaScript objects to JSON
  if (
    config.body &&
    typeof config.body === "object" &&
    !(config.body instanceof FormData)
  ) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    const contentType =
      response.headers.get("content-type") || "";

    let data = {};

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      if (text) {
        data = { message: text };
      }
    }

    // HTTP error
    if (!response.ok) {
      const error = new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", {
      url,
      method: config.method || "GET",
      error: error.message,
    });

    throw error;
  }
};

// =====================================================
// AUTH API
// =====================================================

export const authAPI = {
  // Login
  login: async (credentials) => {
    return await request("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  // Register / Create Account
  register: async (userData) => {
    return await request("/auth/register", {
      method: "POST",
      body: userData,
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await request("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  // Reset password
  resetPassword: async (resetData) => {
    return await request("/auth/reset-password", {
      method: "POST",
      body: resetData,
    });
  },

  // Get logged-in user
  getMe: async (token) => {
    return await request("/auth/me", {
      method: "GET",
      token,
    });
  },

  // Update career goal
  updateCareerGoal: async (token, currentCareer) => {
    return await request("/auth/career-goal", {
      method: "PUT",
      token,
      body: {
        currentCareer,
      },
    });
  },

  // Update profile
  updateProfile: async (token, profileData) => {
    return await request("/auth/profile", {
      method: "PUT",
      token,
      body: profileData,
    });
  },

  // Toggle bookmark
  toggleBookmark: async (token, resourceId) => {
    return await request("/auth/bookmarks/toggle", {
      method: "POST",
      token,
      body: {
        resourceId,
      },
    });
  },

  // Toggle saved career
  toggleSavedCareer: async (token, careerSlug) => {
    return await request("/auth/saved-careers/toggle", {
      method: "POST",
      token,
      body: {
        careerSlug,
      },
    });
  },
};

// =====================================================
// CAREERS API
// =====================================================

const getFallbackCareers = (params = {}) => {
  let list = [...getGeneratedCareerCatalog()];

  if (params.search) {
    const search = params.search.toLowerCase();
    list = list.filter(
      (career) =>
        career.name?.toLowerCase().includes(search) ||
        career.description?.toLowerCase().includes(search) ||
        career.skills?.some((skill) => skill.toLowerCase().includes(search)) ||
        career.industry?.toLowerCase().includes(search)
    );
  }

  if (params.careerType && params.careerType !== "All") {
    list = list.filter((career) => career.careerType === params.careerType);
  }

  if (params.sector && params.sector !== "All") {
    list = list.filter((career) => career.sector === params.sector);
  }

  if (params.category && params.category !== "All") {
    list = list.filter((career) => career.category === params.category);
  }

  if (params.domain && params.domain !== "All") {
    list = list.filter((career) => career.domain === params.domain);
  }

  if (params.difficulty && params.difficulty !== "All") {
    list = list.filter((career) => career.difficulty === params.difficulty);
  }

  if (params.isTechnical !== undefined) {
    const isTechnical =
      params.isTechnical === true || params.isTechnical === "true";
    list = list.filter((career) => career.isTechnical === isTechnical);
  }

  return list;
};

export const careersAPI = {
  // Get all careers
  getAll: async (params = {}) => {
    let serverCareers = [];
    try {
      const query = new URLSearchParams(params).toString();
      const careers = await request(
        `/careers${query ? `?${query}` : ""}`
      );

      if (!Array.isArray(careers)) {
        throw new Error("Careers API returned an invalid response.");
      }
      serverCareers = careers;
    } catch {
      console.warn(
        "Careers API unavailable. Using fallback data."
      );
    }

    const filteredFallbackCareers = getFallbackCareers(params);
    const careersBySlug = new Map(
      filteredFallbackCareers.map((career) => [career.slug, career])
    );
    serverCareers.forEach((career) => {
      if (careersBySlug.has(career.slug)) {
        careersBySlug.set(career.slug, {
          ...careersBySlug.get(career.slug),
          ...career,
        });
      }
    });
    return Array.from(careersBySlug.values());
  },

  // Get career by slug
  getBySlug: async (slug) => {
    try {
      return await request(`/careers/${slug}`);
    } catch (error) {
      console.warn(
        "Career API unavailable. Using fallback data."
      );

      const career = fallbackCareers.find(
        (item) => item.slug === slug
      ) || findGeneratedCareer(slug);
      if (!career) {
        throw new Error(`Career not found: ${slug}`, { cause: error });
      }
      return career;
    }
  },
};

// =====================================================
// ROADMAPS API
// =====================================================

export const roadmapsAPI = {
  // Get all roadmaps
  getAll: async () => {
    try {
      return await request("/roadmaps");
    } catch {
      console.warn(
        "Roadmaps API unavailable. Using fallback data."
      );

      return fallbackRoadmaps;
    }
  },

  // Get roadmap by career slug
  getBySlug: async (careerSlug) => {
    try {
      return await request(
        `/roadmaps/${careerSlug}`
      );
    } catch (error) {
      console.warn(
        "Roadmap API unavailable. Using fallback data."
      );

      const roadmap = fallbackRoadmaps.find(
        (item) => item.careerSlug === careerSlug
      ) || createCareerRoadmap(findGeneratedCareer(careerSlug) || {});
      if (!roadmap.careerName) {
        throw new Error(`Roadmap not found for career: ${careerSlug}`, { cause: error });
      }
      return roadmap;
    }
  },
};

// =====================================================
// PROGRESS API
// =====================================================

export const progressAPI = {
  // Get all progress
  getAll: async (token) => {
    if (!token) throw new Error("Sign in to view saved progress.");
    return request("/progress", {
      method: "GET",
      token,
    });
  },

  // Get progress for one career
  getByCareer: async (token, careerSlug) => {
    if (!token) {
      return readLocalCareerProgress(careerSlug);
    }

    const progress = await request(`/progress/${careerSlug}`, {
      method: "GET",
      token,
    });
    return progress;
  },

  migrateLocalProgress: async (token) => {
    if (!token) throw new Error("Sign in before syncing saved progress.");
    const progressKeys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index)
    ).filter((key) => key?.startsWith("crs_progress_"));
    const errors = [];
    let migratedCareers = 0;

    for (const key of progressKeys) {
      const careerSlug = key.slice("crs_progress_".length);
      try {
        const localProgress = JSON.parse(localStorage.getItem(key));
        if (!localProgress || !Array.isArray(localProgress.courseProgress)) {
          throw new Error("Saved progress has an invalid format.");
        }

        let serverProgress = await request(`/progress/${careerSlug}`, {
          method: "GET",
          token,
        });
        const lessons = [...localProgress.courseProgress].sort(
          (first, second) => first.stepNumber - second.stepNumber
        );

        for (const lesson of lessons) {
          if (!Number.isInteger(lesson.stepNumber) || lesson.stepNumber < 1) {
            throw new Error("A saved lesson has an invalid roadmap step number.");
          }
          const existing = serverProgress.courseProgress?.find(
            (item) => item.stepNumber === lesson.stepNumber
          ) || {};
          const submit = async (action, payload = {}) => {
            const result = await request(`/progress/${careerSlug}/lesson`, {
              method: "POST",
              token,
              body: { stepNumber: lesson.stepNumber, action, ...payload },
            });
            serverProgress = result.progress;
            return serverProgress.courseProgress?.find(
              (item) => item.stepNumber === lesson.stepNumber
            ) || {};
          };

          let migratedLesson = existing;
          const draftPayload = {
            ...(lesson.quizAnswerDraft?.length
              ? { quizAnswerDraft: lesson.quizAnswerDraft }
              : {}),
            ...(lesson.subjectiveResponseDraft
              ? { subjectiveResponseDraft: lesson.subjectiveResponseDraft }
              : {}),
            ...(lesson.assignmentResponseDraft
              ? { assignmentResponseDraft: lesson.assignmentResponseDraft }
              : {}),
            ...(localProgress.activeStepNumber === lesson.stepNumber
              ? { activeStepNumber: lesson.stepNumber }
              : {}),
          };
          if (Object.keys(draftPayload).length) {
            migratedLesson = await submit("draft", draftPayload);
          }
          if (lesson.readingCompleted && !migratedLesson.readingCompleted) {
            migratedLesson = await submit("read");
          }
          if (
            lesson.readingCompleted &&
            Array.isArray(lesson.quizAnswers) &&
            lesson.quizAnswers.length === QUIZ_QUESTION_COUNT &&
            !migratedLesson.quizAnswers?.length
          ) {
            migratedLesson = await submit("quiz", { answers: lesson.quizAnswers });
          }
          if (
            lesson.subjectiveResponse?.trim() &&
            migratedLesson.quizPassed &&
            !migratedLesson.subjectiveResponse
          ) {
            migratedLesson = await submit("subjective", {
              response: lesson.subjectiveResponse,
            });
          }
          if (
            lesson.assignmentCompleted &&
            lesson.assignmentResponse?.trim() &&
            !migratedLesson.assignmentCompleted
          ) {
            migratedLesson = await submit("assignment", {
              response: lesson.assignmentResponse,
            });
          }

          if (
            lesson.quizAnswers?.length &&
            lesson.quizAnswers.length !== QUIZ_QUESTION_COUNT
          ) {
            throw new Error(`Step ${lesson.stepNumber} has incomplete quiz answers that need review.`);
          }
          if (lesson.subjectiveResponse?.trim() && !migratedLesson.subjectiveResponse) {
            throw new Error(`Step ${lesson.stepNumber} written assessment could not be synced.`);
          }
          if (
            lesson.assignmentCompleted &&
            (!lesson.assignmentResponse?.trim() || !migratedLesson.assignmentCompleted)
          ) {
            throw new Error(`Step ${lesson.stepNumber} assignment could not be synced.`);
          }
        }

        localStorage.removeItem(key);
        migratedCareers += 1;
      } catch (error) {
        const message = `${careerSlug}: ${error.message || "Unable to sync saved progress."}`;
        console.error("Unable to migrate local career progress:", message);
        errors.push(message);
      }
    }

    return { migratedCareers, errors };
  },

  updateLessonProgress: async (
    token,
    careerSlug,
    stepNumber,
    action,
    payload = {}
  ) => {
    if (!token && action === "draft") {
      const progress = readLocalCareerProgress(careerSlug);
      let lesson = progress.courseProgress.find((item) => item.stepNumber === stepNumber);
      if (!lesson) {
        lesson = { stepNumber };
        progress.courseProgress.push(lesson);
      }
      const { activeStepNumber, ...draftFields } = payload;
      Object.assign(lesson, draftFields);
      if (activeStepNumber !== undefined) {
        progress.activeStepNumber = activeStepNumber;
      }
      localStorage.setItem(`crs_progress_${careerSlug}`, JSON.stringify(progress));
      return { message: "Your place was saved on this device.", progress };
    }
    if (!token) throw new Error("Sign in to save your roadmap progress.");
    return request(`/progress/${careerSlug}/lesson`, {
      method: "POST",
      token,
      body: { stepNumber, action, ...payload },
    });
  },
};

// =====================================================
// RESOURCES API
// =====================================================

const getCareerResourceFallback = (params = {}) => {
  const careerSlug = String(params.careerSlug || "").toLowerCase();
  if (!careerSlug || careerSlug === "all") return [];

  const career =
    fallbackCareers.find((item) => item.slug === careerSlug) ||
    findGeneratedCareer(careerSlug);
  if (!career) return [];

  const roadmap =
    fallbackRoadmaps.find((item) => item.careerSlug === careerSlug) ||
    createCareerRoadmap(career);

  return createCareerCourseResources(career, roadmap).filter((resource) => {
    if (params.category && params.category !== "All" && resource.category !== params.category) {
      return false;
    }
    if (
      params.isTechnical !== undefined &&
      params.isTechnical !== "All" &&
      resource.isTechnical !== (params.isTechnical === true || params.isTechnical === "true")
    ) {
      return false;
    }
    if (params.difficulty && params.difficulty !== "All" && resource.difficulty !== params.difficulty) {
      return false;
    }
    return matchesCareerCourseResourceSearch(resource, params.search);
  });
};

const mergeResourcesByTitle = (...resourceGroups) => {
  const seenTitles = new Set();
  return resourceGroups.flat().filter((resource) => {
    const title = resource.title?.trim().toLowerCase();
    if (!title || seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  });
};

export const resourcesAPI = {
  // Get all resources
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
      ).toString();

      const resources = await request(
        `/resources${query ? `?${query}` : ""}`
      );
      const visibleResources = resources.filter(
        (resource) => resource.category !== "Videos"
      );
      const generatedCareerResources = getCareerResourceFallback(params);
      const combinedResources = mergeResourcesByTitle(visibleResources, generatedCareerResources);
      const knownTitles = new Set(
        combinedResources.map((resource) => resource.title.toLowerCase())
      );
      const search = params.search?.toLowerCase();
      const extraResources = additionalResources.filter((resource) => {
        if (resource.category === "Videos" || knownTitles.has(resource.title.toLowerCase())) {
          return false;
        }
        if (params.category && params.category !== "All" && resource.category !== params.category) {
          return false;
        }
        if (params.careerSlug && params.careerSlug !== "all" && resource.careerSlug !== params.careerSlug) {
          return false;
        }
        if (
          params.isTechnical !== undefined &&
          params.isTechnical !== "All" &&
          resource.isTechnical !== (params.isTechnical === true || params.isTechnical === "true")
        ) {
          return false;
        }
        if (params.difficulty && params.difficulty !== "All" && resource.difficulty !== params.difficulty) {
          return false;
        }
        if (
          search &&
          !matchesCareerCourseResourceSearch(resource, search)
        ) {
          return false;
        }
        return true;
      });
      return mergeResourcesByTitle(combinedResources, extraResources);
    } catch {
      console.warn(
        "Resources API unavailable. Using fallback data."
      );

      let list = mergeResourcesByTitle(
        fallbackResources.filter((resource) => resource.category !== "Videos"),
        additionalResources.filter((resource) => resource.category !== "Videos"),
        getCareerResourceFallback(params),
      );

      // Category
      if (
        params.category &&
        params.category !== "All"
      ) {
        list = list.filter(
          (resource) =>
            resource.category ===
            params.category
        );
      }

      // Career
      if (
        params.careerSlug &&
        params.careerSlug !== "all"
      ) {
        list = list.filter(
          (resource) =>
            resource.careerSlug ===
            params.careerSlug
        );
      }

      // Technical
      if (params.isTechnical !== undefined) {
        const isTechnical =
          params.isTechnical === true ||
          params.isTechnical === "true";

        list = list.filter(
          (resource) =>
            resource.isTechnical ===
            isTechnical
        );
      }

      // Search
      if (params.search) {
        const search =
          params.search.toLowerCase();

        list = list.filter(
          (resource) =>
            resource.title
              ?.toLowerCase()
              .includes(search) ||
            resource.description
              ?.toLowerCase()
              .includes(search) ||
            resource.courseContent?.definition
              ?.toLowerCase()
              .includes(search) ||
            resource.learningOutcomes?.some((outcome) =>
              outcome.toLowerCase().includes(search)
            ) ||
            resource.studyPlan?.some((step) =>
              step.toLowerCase().includes(search)
            ) ||
            matchesCareerCourseResourceSearch(resource, search) ||
            resource.tags?.some((tag) =>
              tag
                .toLowerCase()
                .includes(search)
            )
        );
      }

      return mergeResourcesByTitle(list);
    }
  },

  // Get resource categories
  getCategories: async () => {
    try {
      return await request(
        "/resources/categories"
      );
    } catch {
      console.warn(
        "Resource categories API unavailable. Using defaults."
      );

      return [
        "Courses",
        "Articles",
        "Books",
        "Practice",
        "Projects",
      ];
    }
  },
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default {
  auth: authAPI,
  careers: careersAPI,
  roadmaps: roadmapsAPI,
  progress: progressAPI,
  resources: resourcesAPI,
};