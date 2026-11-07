const normalize = (value) => String(value || "").trim();

export const QUIZ_QUESTION_COUNT = 10;
export const QUIZ_PASSING_SCORE = 7;

export const createLessonContent = (career, step, learnerLevel = "Beginner", outcome = "Job-ready portfolio") => {
  const careerName = career?.name || "your selected career";
  const topics = step?.topics?.length ? step.topics : ["Career fundamentals", "Professional practice"];
  const firstTopic = topics[0];
  const secondTopic = topics[1] || firstTopic;
  const thirdTopic = topics[2] || secondTopic;
  const levelGuidance = {
    Beginner: "Start with plain-language definitions and small, guided examples.",
    Intermediate: "Connect the fundamentals to realistic workflows and compare possible approaches.",
    Advanced: "Evaluate trade-offs, edge cases, professional standards, and how to improve outcomes.",
  }[learnerLevel] || "Build a practical understanding before moving to application.";
  const outcomeGuidance = {
    "Job-ready portfolio": "Save your work sample and explain the decisions behind it in a portfolio.",
    "Career switch": "Relate the new skill to experience you already have and document the transition.",
    "Freelance launch": "Turn the result into a clear client deliverable with scope and acceptance criteria.",
    "Interview preparation": "Practice explaining your reasoning and evidence in a concise interview response.",
  }[outcome] || "Apply what you learn in a practical, reviewable work sample.";

  const description = normalize(step?.description);
  const reading = {
    introduction: `This chapter introduces ${firstTopic} in the context of ${careerName}. It connects the idea to ${description || "the practical work and professional decisions involved in this career"} and shows how to turn understanding into work that can be reviewed and improved.`,
    definition: `A useful working definition of ${firstTopic} is the knowledge, methods, and judgment a professional uses to ${description ? description.charAt(0).toLowerCase() + description.slice(1) : `complete relevant work in ${careerName}`}. It is more than memorizing terminology: you should be able to explain the purpose, choose an appropriate approach, and judge whether the result meets the need.`,
    objectives: [
      `Explain ${firstTopic} in your own words and identify the problem it helps address.`,
      `Describe how ${secondTopic} and ${thirdTopic} support or extend the main idea.`,
      `Apply the ideas to a realistic ${careerName} task and check the quality of your result.`,
      "Communicate your reasoning, evidence, and any limitations clearly.",
    ],
    importance: `${careerName} professionals use this kind of knowledge to make decisions that are consistent rather than accidental. A clear goal helps you avoid doing work that looks complete but does not solve the actual problem. A repeatable method makes it easier to explain your choices, receive useful feedback, and improve the next attempt. The exact tools may change from one workplace to another; the habit of connecting a requirement to a checked result remains valuable.`,
    keyIdeas: [
      {
        title: firstTopic,
        explanation: `Treat this as the central concept of the chapter. Begin with the need it addresses, identify the information or constraints that matter, and choose a method that fits the situation. A good explanation includes both what you did and why that approach was suitable.`,
      },
      {
        title: secondTopic,
        explanation: `This topic provides a related perspective. In practice, connect it to the main idea by asking what it changes, enables, or helps you verify. Do not assume two topics are interchangeable just because they appear in the same roadmap step.`,
      },
      {
        title: thirdTopic,
        explanation: `Use this topic to broaden or complete your understanding. Consider where it fits in the work, what depends on it, and what evidence would show that it has been applied appropriately.`,
      },
    ],
    workedExample: {
      context: `Imagine a team asks you to complete a small ${careerName} task related to ${firstTopic}. The request is not yet specific enough to act on: different people may have different ideas about what “finished” means.`,
      approach: [
        "Clarify the intended outcome, the people who will use it, any constraints, and how success will be judged.",
        `Break the task into manageable parts. Use ${firstTopic} as the main approach, and bring in ${secondTopic} or ${thirdTopic} only where they help meet the stated need.`,
        "Create a first version, then compare it with the agreed criteria. Check important details rather than relying on appearance or assumptions.",
        "Record any uncertainty, limitation, or decision that could affect the result. Ask for review when the impact or requirement is unclear.",
      ],
      result: `A strong handoff explains the original need, the approach you selected, the checks you completed, and any remaining limitation. This makes the work easier for another person to understand and gives you specific feedback to use in a revision.`,
    },
    applicationSteps: [
      "Define the task: write one sentence describing the problem and the desired result.",
      "Gather context: list the relevant requirements, resources, constraints, and people affected.",
      "Choose a method: compare suitable approaches and explain why your choice fits this task.",
      "Do and check the work: follow a clear sequence, inspect the result against the requirements, and correct gaps.",
      "Reflect and communicate: summarize the evidence, note what you would improve, and share the result with the right audience.",
    ],
    commonMistakes: [
      "Starting with a tool or solution before understanding the goal.",
      "Treating a topic name as proof of competence instead of demonstrating it in a relevant task.",
      "Checking only whether the work is finished, not whether it meets the agreed criteria.",
      "Ignoring feedback, uncertainty, or limitations that could change how someone uses the result.",
    ],
    knowledgeCheck: [
      `How would you define ${firstTopic} without repeating the lesson wording?`,
      `When would ${secondTopic} or ${thirdTopic} change the approach you choose?`,
      "What evidence would convince a reviewer that your result meets the original need?",
    ],
    levelGuidance,
    outcomeGuidance,
  };

  const questionTemplates = [
    {
      prompt: `When a ${careerName} task involves ${firstTopic}, what should you clarify first?`,
      correct: "The goal, the people affected, and what a successful result must demonstrate.",
      distractors: ["The fastest tool to use, before understanding the task.", "A solution copied from a different situation without checking fit.", "How to finish without recording or reviewing the result."],
    },
    {
      prompt: `How should a professional connect ${firstTopic} with ${secondTopic}?`,
      correct: "Choose the connection that supports the task goal, then explain how the two ideas work together.",
      distractors: ["Treat them as unrelated even when the task needs both.", "Use both automatically, without considering the context.", "Replace evidence with a guess about how they relate."],
    },
    {
      prompt: `You are planning work involving ${thirdTopic}. Which plan is most reliable?`,
      correct: "Break the work into clear steps, identify dependencies, and decide how to check each result.",
      distractors: ["Start every part at once and check only at the end.", "Skip planning because experienced professionals never need it.", "Choose steps based only on convenience, not the desired outcome."],
    },
    {
      prompt: `How should you decide which method or tool to use for ${firstTopic}?`,
      correct: "Compare suitable options against the requirements, constraints, and expected outcome.",
      distractors: ["Always choose the newest option, regardless of the task.", "Use whichever option requires the least explanation.", "Select a familiar tool even if it cannot meet the requirements."],
    },
    {
      prompt: `What is the best way to check work related to ${secondTopic}?`,
      correct: "Use relevant criteria or evidence and investigate any gap between the result and the goal.",
      distractors: ["Assume it is correct if it looks finished.", "Ask only whether it was completed quickly.", "Ignore unexpected results if the main task appears done."],
    },
    {
      prompt: `A risk or unexpected issue appears while applying ${firstTopic}. What should you do?`,
      correct: "Assess its impact, follow relevant professional or safety guidance, and document the response.",
      distractors: ["Hide it so the work appears to be progressing.", "Continue unchanged even if people or outcomes may be affected.", "Make an irreversible change before checking the consequences."],
    },
    {
      prompt: `A reviewer gives constructive feedback on your use of ${thirdTopic}. What is the strongest response?`,
      correct: "Understand the evidence behind the feedback, revise where appropriate, and verify the improvement.",
      distractors: ["Reject it immediately because your first attempt is always best.", "Make every suggested change without checking its relevance.", "Avoid asking questions or recording what you learned."],
    },
    {
      prompt: `How should you explain a result involving ${firstTopic} to a colleague or client?`,
      correct: "Summarize the goal, your reasoning, the evidence, and any important limitations.",
      distractors: ["Use unexplained jargon so the work sounds more advanced.", "Share only the conclusion and omit relevant uncertainty.", "Describe every detail without connecting it to the audience's needs."],
    },
    {
      prompt: `Which professional practice should guide work involving ${secondTopic}?`,
      correct: "Protect people and information, follow applicable standards, and be honest about the work and its limits.",
      distractors: ["Use any information available, even if access is not authorized.", "Prioritize convenience over safety, privacy, or fairness.", "Claim certainty even when the evidence is incomplete."],
    },
    {
      prompt: `How can you demonstrate progress in ${careerName} after studying ${firstTopic}?`,
      correct: "Create a relevant work sample, check it against clear criteria, and explain what you would improve.",
      distractors: ["List the topic on a resume without showing how you applied it.", "Keep the result private and avoid feedback or review.", "Focus on activity completed rather than evidence of learning."],
    },
  ];

  const questions = questionTemplates.map((template, questionIndex) => {
    const correctAnswer = (questionIndex * 3 + 1) % 4;
    const options = [];
    options[correctAnswer] = template.correct;
    template.distractors.forEach((option, distractorIndex) => {
      const optionIndex = (correctAnswer + distractorIndex + 1) % 4;
      options[optionIndex] = option;
    });
    return {
      prompt: template.prompt,
      options,
      correctAnswer,
      explanation: template.correct,
    };
  });

  const assignment = outcome === "Interview preparation"
    ? `Write a concise interview response describing how you would use ${firstTopic} in a ${careerName} task. Include your approach, one check, and the result you would aim for.`
    : outcome === "Freelance launch"
      ? `Create a one-page client deliverable applying ${firstTopic} to a realistic ${careerName} brief. Include scope, steps, and acceptance criteria.`
      : outcome === "Career switch"
        ? `Create a work sample that applies ${firstTopic} to a ${careerName} scenario, then note how one skill from your previous experience transfers to it.`
        : `Create a portfolio-ready work sample applying ${firstTopic} to a realistic ${careerName} scenario. Add a short explanation of your process and how you checked the result.`;

  return {
    reading,
    conclusion: `You have studied ${firstTopic}, connected it to ${secondTopic}, and considered how to apply both in ${careerName}. Use the assignment to produce evidence, then test your understanding before unlocking the next step.`,
    questions,
    subjectivePrompt: `In your own words, describe how you would apply ${firstTopic} to a realistic task in ${careerName}. Explain your steps, one challenge you may face, and how you would judge whether the result is successful.`,
    assignment,
  };
};
