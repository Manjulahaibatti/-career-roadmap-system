import { createLessonContent } from "./lessonContent.js";

const toSearchableText = (value) => {
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (Array.isArray(value)) return value.flatMap(toSearchableText);
  if (value && typeof value === "object") return Object.values(value).flatMap(toSearchableText);
  return [];
};

export const matchesCareerCourseResourceSearch = (resource, search) => {
  const query = String(search || "").trim().toLowerCase();
  if (!query) return true;

  return [
    resource.title,
    resource.description,
    resource.provider,
    ...(resource.learningOutcomes || []),
    ...(resource.studyPlan || []),
    ...(resource.tags || []),
    resource.courseContent,
    resource.resourceContent,
  ]
    .flatMap(toSearchableText)
    .some((value) => value.toLowerCase().includes(query));
};

const createResource = (career, step, category, content, lesson, suffix) => {
  const topic = step.topics?.[0] || step.title;
  const stepLink = `/roadmap/${career.slug}?step=${step.stepNumber}`;

  return {
    id: `roadmap-${career.slug}-${step.stepNumber}-${suffix}`,
    title: content.title,
    category,
    isTechnical: Boolean(career.isTechnical),
    provider: "Career Roadmap System",
    duration: content.duration || `${step.estimatedWeeks || 1} weeks`,
    isFree: true,
    description: content.description,
    learningOutcomes: content.learningOutcomes || lesson.reading.objectives,
    studyPlan: content.studyPlan || lesson.reading.applicationSteps,
    courseContent: category === "Courses"
      ? {
          introduction: lesson.reading.introduction,
          definition: lesson.reading.definition,
          importance: lesson.reading.importance,
          keyIdeas: lesson.reading.keyIdeas,
          workedExample: lesson.reading.workedExample,
          applicationSteps: lesson.reading.applicationSteps,
          commonMistakes: lesson.reading.commonMistakes,
          knowledgeCheck: lesson.reading.knowledgeCheck,
          writtenAssessment: lesson.subjectivePrompt,
          assignment: lesson.assignment,
        }
      : undefined,
    resourceContent: category === "Courses" ? undefined : content.details,
    difficulty: career.difficulty || "All Levels",
    link: stepLink,
    careerSlug: career.slug,
    tags: [...new Set([...(step.topics || []), career.name, topic])],
    isRoadmapLesson: category === "Courses",
    isCareerResource: true,
    stepNumber: step.stepNumber,
  };
};

const createStepResources = (career, step) => {
  const lesson = createLessonContent(career, step, "Intermediate");
  const reading = lesson.reading;
  const stepTopics = step.topics?.length ? step.topics : [step.title];
  const firstTopic = stepTopics[0];
  const secondTopic = stepTopics[1] || "professional communication";
  const thirdTopic = stepTopics[2] || "quality review";
  const articleTopic = firstTopic;
  const bookTopic = secondTopic;
  const practiceTopic = thirdTopic;
  const projectTopic = stepTopics[3] || career.skills?.[0] || step.title;
  const careerContext = career.industry || career.domain || career.sector || "the professional workplace";
  const skills = (career.skills || []).slice(0, 5);
  const tools = skills.length ? skills : ["research", "documentation", "review"];
  const stepSummary = step.description || `Build practical capability in ${step.title}.`;

  const course = createResource(
    career,
    step,
    "Courses",
    {
      title: `${career.name}: Step ${step.stepNumber} — ${step.title}`,
      description: `${stepSummary} ${reading.introduction} ${reading.importance}`,
    },
    lesson,
    "course",
  );

  const article = createResource(
    career,
    step,
    "Articles",
    {
      title: `${articleTopic} in practice: a ${career.name} field guide`,
      description: `An applied article on how ${career.name} professionals use ${articleTopic}, make sound decisions, and verify work in ${careerContext}.`,
      details: {
        overview: `An analytical field guide to ${articleTopic}: how it is used in ${careerContext}, the trade-offs it creates, and the evidence that helps evaluate its results.`,
        readingTime: "8–12 minutes",
        sections: [
          { heading: "Where it is useful", body: `In ${careerContext}, ${career.name} professionals use ${articleTopic} when a task requires a clear, repeatable way to reach a result. Begin by identifying the need, the people affected, and the constraints that shape a suitable approach.` },
          { heading: "Trade-offs to examine", body: `${secondTopic} and ${thirdTopic} can change the cost, quality, and reliability of work involving ${articleTopic}. Compare options against the same criteria instead of assuming one method is best in every situation.` },
          { heading: "Signals of a weak result", body: `Warning signs include unclear assumptions, results that cannot be checked, and decisions that do not address the original need. For work involving ${articleTopic}, record what was checked and what remains uncertain.` },
          { heading: "A decision to analyze", body: `Imagine a ${career.name} team choosing how to apply ${articleTopic} under a limited time or resource budget. Identify two plausible approaches, the evidence needed to compare them, and the risk each approach leaves unresolved.` },
          { heading: "Recommendation", body: `A useful recommendation names its audience, explains the chosen approach to ${articleTopic}, acknowledges a trade-off, and proposes a measurable follow-up.` },
        ],
        takeaways: [
          `Describe a situation where ${articleTopic} is useful to a ${career.name}.`,
          `Compare approaches to ${articleTopic} using constraints relevant to ${careerContext}.`,
          `Identify evidence and limitations before recommending a decision about ${articleTopic}.`,
        ],
        reflection: `Where could you apply ${articleTopic} in a real ${career.name} task, and what evidence would show that the result helped?`,
      },
    },
    lesson,
    "article",
  );
  article.learningOutcomes = [
    `Explain the role of ${articleTopic} in a ${career.name} workflow.`,
    `Compare two approaches to ${articleTopic} using relevant constraints.`,
    `Recognize weak evidence when evaluating ${articleTopic} and describe how to validate a result.`,
    `Write a concise recommendation about ${articleTopic} that makes trade-offs visible.`,
  ];
  article.studyPlan = [
    `Choose a real or fictional ${careerContext} scenario involving ${articleTopic}.`,
    `Compare two approaches and note how ${secondTopic} affects the decision.`,
    `List evidence that would support or challenge each approach to ${articleTopic}.`,
    `Write a recommendation about ${articleTopic} with one limitation and a follow-up measure.`,
  ];

  const book = createResource(
    career,
    step,
    "Books",
    {
      title: `${bookTopic}: a ${career.name} reading guide`,
      description: `An original, chapter-based study guide to ${bookTopic}. Use it as a structured reading resource; it is not a commercial book or a substitute for the official standards and references used in your workplace.`,
      duration: "4 short chapters",
      details: {
        overview: `Use this reading guide to understand ${bookTopic}, connect it to the responsibilities of a ${career.name}, and reflect on its application in ${careerContext}.`,
        chapters: [
          { title: `Chapter 1 — The ${bookTopic} mental model`, summary: `Build a clear vocabulary for ${bookTopic}. Separate its core concepts from the tools or procedures that implement them, and note how the ideas relate to ${career.name} work.`, prompt: `Write a short glossary for ${bookTopic} and connect each term to a practical example.` },
          { title: "Chapter 2 — Boundaries and context", summary: `The right interpretation of ${bookTopic} depends on users, constraints, and the surrounding ${careerContext} environment. Identify what the concept does not cover as carefully as what it does.`, prompt: `List the assumptions behind an example of ${bookTopic} and explain which changed conditions would invalidate it.` },
          { title: `Chapter 3 — Connections to ${thirdTopic}`, summary: `${bookTopic} becomes more useful when considered alongside ${thirdTopic}. Map where the two ideas reinforce one another and where they answer different questions.`, prompt: `Create a comparison table showing when to use ${bookTopic}, ${thirdTopic}, or both.` },
          { title: "Chapter 4 — Synthesis notes", summary: `Turn the reading on ${bookTopic} into a reference you can reuse: summarize the central idea, preserve an example, and record an open question about applying it as a ${career.name}.`, prompt: `Write a one-page study note on ${bookTopic} with a summary, example, limitation, and question for further reading.` },
        ],
        readingPlan: [
          `Read the section on ${bookTopic} and build a glossary in your own words.`,
          `Complete the chapter comparison involving ${thirdTopic}.`,
          `Write a synthesis note on ${bookTopic} with one example and one limitation.`,
          `Revisit the notes before applying ${bookTopic} in a ${career.name} task.`,
        ],
        discussionQuestions: [
          `Which part of ${bookTopic} is easiest to misinterpret, and why?`,
          `How does ${thirdTopic} change or complement your understanding?`,
          `What additional reference would help deepen your knowledge of ${bookTopic}?`,
        ],
      },
      learningOutcomes: [
        `Summarize the main concepts behind ${bookTopic} in your own words.`,
        `Connect ${bookTopic} to ${thirdTopic} without conflating their purposes.`,
        `Build a reusable glossary of ${bookTopic} and a focused reading note.`,
        `Identify a limitation of ${bookTopic} and a question for further study.`,
      ],
      studyPlan: [
        `Read and annotate a reference on ${bookTopic}.`,
        `Create a glossary of ${bookTopic} and compare it with ${thirdTopic}.`,
        `Write a short synthesis note on ${bookTopic} with an example and limitation.`,
        `Record a follow-up question about ${bookTopic} and locate an authoritative reference.`,
      ],
    },
    lesson,
    "book",
  );

  const practice = createResource(
    career,
    step,
    "Practice",
    {
      title: `${practiceTopic}: a hands-on ${career.name} lab`,
      description: `A guided, repeatable lab for practicing ${practiceTopic} with realistic constraints, documented decisions, and a reviewable outcome.`,
      duration: "2–4 hours",
      details: {
        overview: `Practice a ${career.name} workflow centered on ${practiceTopic}. Use a sample or authorized environment and adapt the work to ${careerContext}.`,
        scenario: `A team needs help with a task involving ${practiceTopic}. The initial request is incomplete, the available resources include ${tools.slice(0, 3).join(", ")}, and a reviewer must be able to understand how you reached your result.`,
        environment: career.isTechnical
          ? `Work locally with sample data, a sandbox, or a system you own or are explicitly authorized to use for ${practiceTopic}. Do not use production credentials, real personal data, or systems outside your approved scope.`
          : `Use a written case brief and fictional or public information for ${practiceTopic}. Do not include confidential employer, client, employee, patient, or customer data in your practice artifacts.`,
        materials: tools.map((tool) => `${practiceTopic}: ${tool}`),
        instructions: [
          `Write the goal, intended audience, and success criteria for the ${practiceTopic} task.`,
          `Map where ${firstTopic} and ${secondTopic} affect the work; note assumptions and dependencies.`,
          `Create a first-pass ${practiceTopic} work product and keep a decision log explaining the important choices.`,
          `Review the ${practiceTopic} work against its criteria, correct gaps, and ask a peer to challenge one assumption.`,
          `Prepare a concise ${practiceTopic} handoff that states the outcome, evidence, limitations, and next action.`,
        ],
        deliverables: [
          `One-page ${practiceTopic} task brief with scope, audience, constraints, and measurable success criteria.`,
          `A completed ${practiceTopic} work sample or documented workflow, with sensitive details removed.`,
          `A ${practiceTopic} validation checklist and decision log.`,
          `A short ${practiceTopic} reflection describing one revision made after review.`,
        ],
        validation: [
          `Every ${practiceTopic} requirement has a result or an explicit reason it could not be met.`,
          `A reviewer can follow the ${practiceTopic} reasoning and inspect the important checks.`,
          `Assumptions, risks, and limitations in the ${practiceTopic} exercise are visible.`,
        ],
      },
      learningOutcomes: [
        `Complete a controlled exercise involving ${practiceTopic}.`,
        `Record observations from the ${practiceTopic} exercise and distinguish them from assumptions.`,
        `Use a ${practiceTopic} checklist to find and correct errors.`,
        `Summarize what the ${practiceTopic} exercise does and does not demonstrate.`,
      ],
      studyPlan: [
        `Prepare a sample environment and define a task using ${practiceTopic}.`,
        `Run the ${practiceTopic} exercise once and record the initial result.`,
        `Check the ${practiceTopic} result against the stated criteria and revise one issue.`,
        `Write a short ${practiceTopic} lab note with evidence, limitations, and next steps.`,
      ],
    },
    lesson,
    "practice",
  );

  const project = createResource(
    career,
    step,
    "Projects",
    {
      title: `${projectTopic}: a ${career.name} portfolio project`,
      description: `A portfolio-ready project brief that turns ${projectTopic} into a realistic deliverable for a ${careerContext} team.`,
      duration: "1–2 weeks",
      details: {
        overview: `Demonstrate ${projectTopic} by delivering a small but complete piece of work. Treat the brief as a realistic ${careerContext} engagement: clarify scope, communicate progress, and show how the result will be evaluated.`,
        brief: `A ${careerContext} team has identified a need related to ${projectTopic}. They want a practical recommendation or work product that uses ${projectTopic}, takes ${firstTopic} into account, and includes a quality review. Your task is to propose and deliver a scoped solution without claiming access to information or systems you do not have.`,
        requirements: [
          `Identify the target user or stakeholder for ${projectTopic} and define the problem in plain language.`,
          `Use at least one method related to ${projectTopic} and explain why it fits.`,
          `Document ${projectTopic} scope, assumptions, constraints, and relevant ethical, privacy, accessibility, safety, or compliance considerations.`,
          `Include a ${projectTopic} review step and show how feedback or evidence changed the work.`,
          `Present the ${projectTopic} result in a format that a teammate could understand and continue.`,
        ],
        milestones: [
          `Discovery: clarify the ${projectTopic} brief, stakeholders, inputs, and success measures.`,
          `Plan: outline the ${projectTopic} approach, risks, dependencies, and review points.`,
          `Build: create the ${projectTopic} work product and maintain a concise decision log.`,
          `Validate: check the ${projectTopic} result against requirements and incorporate review feedback.`,
          `Present: prepare the ${projectTopic} deliverable, evidence, limitations, and next steps.`,
        ],
        deliverables: [
          `A concise problem statement and scope for ${projectTopic}.`,
          `A documented ${projectTopic} work product, prototype, analysis, plan, or other role-appropriate artifact.`,
          `A ${projectTopic} validation record showing criteria, evidence, and changes made.`,
          `A short ${projectTopic} portfolio case study explaining context, contribution, decisions, and outcome.`,
        ],
        acceptanceCriteria: [
          `The ${projectTopic} deliverables directly address the stated problem and intended audience.`,
          `The ${projectTopic} work is complete enough for a reviewer to inspect, with assumptions and limitations disclosed.`,
          `Key ${projectTopic} decisions are supported by evidence or an explicit rationale.`,
          `The ${projectTopic} handoff includes a clear next step and does not expose confidential information.`,
        ],
        reviewRubric: [
          { criterion: "Problem framing", description: `The need, audience, scope, and success measures for ${projectTopic} are clear.` },
          { criterion: "Role-specific practice", description: `The work demonstrates thoughtful application of ${projectTopic} and relevant skills.` },
          { criterion: "Quality and evidence", description: `${projectTopic} checks are appropriate, findings are traceable, and feedback is addressed.` },
          { criterion: "Communication", description: `The ${projectTopic} handoff is concise, accessible, and honest about limitations.` },
        ],
        stretchGoal: `Ask a peer acting as a stakeholder to change one constraint. Record how the change affects your approach to ${projectTopic} and revise the deliverable.`,
      },
      learningOutcomes: [
        `Scope a portfolio deliverable that demonstrates ${projectTopic}.`,
        `Translate stakeholder needs for ${projectTopic} into verifiable acceptance criteria.`,
        `Present a completed ${projectTopic} artifact with decisions and evidence.`,
        `Explain limitations of the ${projectTopic} project and propose a realistic next iteration.`,
      ],
      studyPlan: [
        `Draft a project brief for a ${careerContext} scenario involving ${projectTopic}.`,
        `Define the ${projectTopic} scope, acceptance criteria, and review plan before building.`,
        `Complete the ${projectTopic} deliverable and keep a concise decision log.`,
        `Present the ${projectTopic} artifact, evidence, limitations, and next iteration.`,
      ],
    },
    lesson,
    "project",
  );

  return [course, article, book, practice, project];
};

export const createCareerCourseResources = (career, roadmap) =>
  roadmap.steps.flatMap((step) => createStepResources(career, step));
