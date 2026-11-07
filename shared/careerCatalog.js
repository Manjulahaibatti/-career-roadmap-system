const privateIndustries = [
  "Healthcare",
  "Financial Services",
  "Education",
  "Retail and E-commerce",
  "Media and Entertainment",
];

const technicalRoles = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full-Stack Developer",
  "Mobile Application Developer", "iOS Developer", "Android Developer", "Game Developer",
  "Embedded Software Engineer", "Firmware Engineer", "Systems Programmer", "Database Developer",
  "API Developer", "Platform Engineer", "Integration Engineer", "Web Application Developer",
  "Desktop Application Developer", "Enterprise Application Developer", "Low-Code Developer",
  "Accessibility Engineer", "Data Analyst", "Business Intelligence Developer", "Data Engineer",
  "Analytics Engineer", "Data Scientist", "Machine Learning Engineer", "AI Research Engineer",
  "Natural Language Processing Engineer", "Computer Vision Engineer", "Robotics Software Engineer",
  "MLOps Engineer", "Decision Scientist", "Quantitative Developer", "Data Visualization Engineer",
  "Geospatial Data Engineer", "Cybersecurity Analyst", "Application Security Engineer",
  "Cloud Security Engineer", "Network Security Engineer", "Security Operations Analyst",
  "Penetration Tester", "Digital Forensics Analyst", "Identity and Access Engineer",
  "Security Architect", "Threat Intelligence Analyst", "Privacy Engineer", "Incident Response Engineer",
  "Cloud Engineer", "Cloud Architect", "DevOps Engineer", "Site Reliability Engineer",
  "Infrastructure Engineer", "Network Engineer", "Systems Administrator", "Linux Engineer",
  "Kubernetes Engineer", "Database Administrator", "Release Engineer", "Build and Automation Engineer",
  "IT Support Engineer", "Technical Support Specialist", "Help Desk Analyst", "IT Administrator",
  "IT Systems Analyst", "IT Auditor", "IT Asset Manager", "Service Desk Manager",
  "Quality Assurance Engineer", "Software Test Engineer", "Automation Test Engineer",
  "Performance Test Engineer", "Reliability Engineer", "Hardware Engineer", "Electrical Engineer",
  "Electronics Engineer", "Computer Hardware Engineer", "VLSI Design Engineer", "ASIC Design Engineer",
  "FPGA Engineer", "Semiconductor Process Engineer", "Telecommunications Engineer",
  "Wireless Communications Engineer", "Radio Frequency Engineer", "Control Systems Engineer",
  "Mechatronics Engineer", "Autonomous Systems Engineer", "Industrial Automation Engineer",
  "Manufacturing Systems Engineer", "Power Systems Engineer", "Renewable Energy Engineer",
  "Biomedical Engineer", "Medical Device Engineer", "Chemical Process Engineer",
  "Environmental Engineer", "Civil Infrastructure Engineer", "Structural Engineer",
  "Transportation Systems Engineer", "Aerospace Systems Engineer", "Avionics Engineer",
  "Automotive Software Engineer", "Electric Vehicle Engineer", "Battery Systems Engineer",
  "GIS Analyst", "Geospatial Software Developer", "Scientific Programmer", "Research Software Engineer",
  "Technical Writer", "Developer Advocate", "Solutions Architect", "Technical Product Specialist",
  "Blockchain Developer", "Smart Contract Engineer", "AR and VR Developer", "Computer Graphics Engineer",
  "Search Engineer", "Recommendation Systems Engineer", "Storage Engineer", "Distributed Systems Engineer",
  "Data Center Engineer", "Mainframe Developer", "ERP Technical Consultant", "CRM Developer",
];

const nonTechnicalRoles = [
  "Product Manager", "Project Manager", "Program Manager", "Operations Manager",
  "Business Analyst", "Management Consultant", "Strategy Analyst", "Business Operations Analyst",
  "Financial Analyst", "Investment Analyst", "Risk Analyst", "Credit Analyst",
  "Accountant", "Auditor", "Tax Consultant", "Payroll Specialist",
  "Human Resources Manager", "Recruiter", "Talent Acquisition Specialist", "Learning and Development Manager",
  "Employee Relations Specialist", "Compensation Analyst", "Organizational Development Consultant",
  "Marketing Manager", "Digital Marketing Specialist", "Content Strategist", "SEO Specialist",
  "Social Media Manager", "Brand Manager", "Market Research Analyst", "Public Relations Specialist",
  "Communications Manager", "Copywriter", "Technical Editor", "Corporate Trainer",
  "Instructional Designer", "Curriculum Developer", "Academic Advisor", "Education Program Manager",
  "Healthcare Administrator", "Clinical Operations Coordinator", "Health Information Manager",
  "Medical Billing Specialist", "Patient Experience Manager", "Healthcare Recruiter",
  "Supply Chain Analyst", "Logistics Manager", "Procurement Specialist", "Inventory Planner",
  "Quality Manager", "Compliance Officer", "Regulatory Affairs Specialist", "Customer Success Manager",
  "Account Manager", "Sales Representative", "Business Development Manager", "Customer Experience Analyst",
  "Retail Store Manager", "E-commerce Merchandiser", "Event Planner", "Hospitality Manager",
  "Interior Designer", "Graphic Designer", "UX Researcher", "Visual Designer",
  "Fashion Designer", "Architect", "Real Estate Analyst", "Property Manager",
  "Environmental Policy Analyst", "Sustainability Consultant", "Nonprofit Program Manager",
  "Grant Writer", "Legal Assistant", "Contract Administrator", "Paralegal",
  "Insurance Underwriter", "Claims Adjuster", "Actuarial Analyst", "Bank Relationship Manager",
  "Content Producer", "Journalist", "Translator", "Executive Assistant",
];

const privateRoles = [
  "Clinical Research Coordinator",
  "Medical Laboratory Technologist",
  "Pharmaceutical Quality Specialist",
  "Insurance Claims Specialist",
  "Retail Buyer",
  "E-commerce Operations Specialist",
  "Restaurant General Manager",
  "Hotel Revenue Manager",
  "Banking Operations Specialist",
  "Wealth Management Associate",
  "School Admissions Counselor",
  "Private Tutor and Learning Coach",
  "Film Production Coordinator",
  "Music Licensing Coordinator",
  "Fashion Merchandiser",
  "Real Estate Broker",
  "Legal Operations Specialist",
  "Supply Chain Planner",
  "Customer Support Manager",
  "Corporate Partnerships Manager",
];

const governmentRoles = [
  "Administrative Officer", "Policy Analyst", "Public Finance Analyst", "Government Accountant",
  "Public Health Officer", "Health Inspector", "Education Officer", "Urban Planner",
  "Civil Engineer", "Environmental Officer", "Agriculture Officer", "Forest Officer",
  "Labour Inspector", "Tax Officer", "Customs Officer", "Legal Officer",
  "Public Relations Officer", "Social Welfare Officer", "Data Analyst", "IT Officer",
  "Cybersecurity Analyst", "Research Scientist", "Procurement Officer", "Transport Planner",
  "Disaster Management Officer",
];

const governmentOrganizations = [
  "Central Government",
  "State Government",
  "Municipal Government",
  "Public Sector Undertaking",
];

const competitiveTracks = [
  ["IAS Officer", "UPSC Civil Services Examination", ["General studies", "Indian polity", "Public administration"]],
  ["IPS Officer", "UPSC Civil Services Examination", ["General studies", "Indian polity", "Internal security"]],
  ["Indian Foreign Service Officer", "UPSC Civil Services Examination", ["International relations", "Indian polity", "Diplomacy"]],
  ["Indian Revenue Service Officer", "UPSC Civil Services Examination", ["Economics", "Taxation", "Indian polity"]],
  ["Indian Audit and Accounts Service Officer", "UPSC Civil Services Examination", ["Public finance", "Accounting", "Indian polity"]],
  ["Assistant Section Officer", "SSC CGL", ["Quantitative aptitude", "Reasoning", "English"]],
  ["Income Tax Inspector", "SSC CGL", ["Quantitative aptitude", "Reasoning", "Taxation"]],
  ["Central Excise Inspector", "SSC CGL", ["Quantitative aptitude", "Reasoning", "General awareness"]],
  ["Auditor", "SSC CGL", ["Accounting", "Quantitative aptitude", "English"]],
  ["Junior Statistical Officer", "SSC CGL", ["Statistics", "Quantitative aptitude", "Data interpretation"]],
  ["Assistant Audit Officer", "SSC CGL", ["Accounting", "Public finance", "Reasoning"]],
  ["Section Controller", "SSC CGL", ["General awareness", "Reasoning", "English"]],
  ["Probationary Officer", "IBPS PO", ["Banking awareness", "Quantitative aptitude", "Reasoning"]],
  ["Clerk", "IBPS Clerk", ["Banking awareness", "Numerical ability", "English"]],
  ["Probationary Officer", "SBI PO", ["Banking awareness", "Data analysis", "Reasoning"]],
  ["Junior Associate", "SBI Clerk", ["Banking awareness", "Numerical ability", "English"]],
  ["Officer Scale I", "IBPS RRB", ["Rural banking", "Quantitative aptitude", "Reasoning"]],
  ["Grade B Officer", "RBI Grade B", ["Economics", "Finance", "Current affairs"]],
  ["Assistant", "RBI Assistant", ["Numerical ability", "Reasoning", "English"]],
  ["Development Assistant", "NABARD", ["Agriculture", "Rural development", "Economics"]],
  ["Assistant Manager", "SEBI Grade A", ["Finance", "Securities markets", "Reasoning"]],
  ["Assistant Commandant", "UPSC CAPF", ["General ability", "Indian polity", "Essay writing"]],
  ["Sub-Inspector", "SSC CPO", ["General awareness", "Reasoning", "Physical fitness"]],
  ["Constable", "SSC GD", ["General awareness", "Reasoning", "Physical fitness"]],
  ["Junior Engineer", "SSC JE", ["Civil engineering", "Technical aptitude", "Reasoning"]],
  ["Engineering Services Officer", "UPSC Engineering Services Examination", ["Engineering fundamentals", "Technical aptitude", "General studies"]],
  ["Research Fellow", "CSIR UGC NET", ["Subject specialization", "Research methods", "Reasoning"]],
  ["Assistant Professor", "UGC NET", ["Subject specialization", "Teaching aptitude", "Research methods"]],
  ["Scientist", "GATE", ["Engineering fundamentals", "Technical aptitude", "Problem solving"]],
  ["Public Sector Engineer", "GATE PSU Recruitment", ["Engineering fundamentals", "Technical aptitude", "Interview preparation"]],
  ["Navy Officer", "NDA and Naval Academy Examination", ["Mathematics", "General ability", "Physical fitness"]],
  ["Army Officer", "NDA Examination", ["Mathematics", "General ability", "Physical fitness"]],
  ["Air Force Officer", "AFCAT", ["General awareness", "Verbal ability", "Numerical ability"]],
  ["Commissioned Officer", "CDS Examination", ["English", "General knowledge", "Mathematics"]],
  ["Railway Station Master", "RRB NTPC", ["General awareness", "Mathematics", "Reasoning"]],
  ["Railway Junior Engineer", "RRB JE", ["Technical subject", "Mathematics", "General awareness"]],
  ["Railway Technician", "RRB Technician", ["Technical subject", "Mathematics", "Reasoning"]],
  ["Medical Officer", "NEET PG and Government Medical Recruitment", ["Clinical medicine", "Medical ethics", "Specialty knowledge"]],
  ["Government Medical Student", "NEET UG", ["Biology", "Chemistry", "Physics"]],
  ["Government Engineering Student", "JEE Main and Advanced", ["Mathematics", "Physics", "Chemistry"]],
  ["Judicial Magistrate", "State Judicial Services Examination", ["Constitutional law", "Civil law", "Criminal law"]],
  ["Civil Judge", "State Public Service Commission", ["State administration", "Constitutional law", "General studies"]],
  ["State Police Officer", "State Police Service Examination", ["State administration", "Law", "Physical fitness"]],
  ["Government School Teacher", "CTET and State TET", ["Teaching methods", "Child development", "Subject knowledge"]],
  ["Postgraduate Teacher", "KVS and State Teacher Recruitment", ["Subject specialization", "Teaching methods", "Education policy"]],
  ["Postal Assistant", "SSC and India Post Recruitment", ["General awareness", "Numerical ability", "English"]],
  ["Insurance Administrative Officer", "LIC AAO", ["Insurance", "Finance", "Reasoning"]],
  ["Insurance Assistant", "LIC Assistant", ["Insurance", "Numerical ability", "English"]],
  ["Public Sector Bank Specialist Officer", "IBPS SO", ["Banking", "Specialist subject", "Reasoning"]],
  ["Food Safety Officer", "State Public Service Commission", ["Food science", "Public health", "State general studies"]],
  ["Assistant Conservator of Forests", "State Forest Service Examination", ["Forestry", "Environmental science", "General studies"]],
  ["Indian Forest Service Officer", "UPSC Indian Forest Service Examination", ["Forestry", "Environmental science", "General studies"]],
  ["Medical Officer", "UPSC Combined Medical Services Examination", ["Clinical medicine", "Public health", "Medical ethics"]],
  ["Super-Specialty Medical Student", "NEET Super Specialty Examination", ["Clinical specialty", "Medical sciences", "Clinical reasoning"]],
  ["Geologist", "UPSC Combined Geo-Scientist Examination", ["Geology", "Earth science", "Analytical reasoning"]],
  ["Economic Service Officer", "UPSC Indian Economic Service Examination", ["Economics", "Statistics", "Public policy"]],
  ["Statistical Service Officer", "UPSC Indian Statistical Service Examination", ["Statistics", "Probability", "Data analysis"]],
  ["Enforcement Officer", "UPSC EPFO Enforcement Officer Examination", ["Labour laws", "Social security", "General studies"]],
  ["Assistant Provident Fund Commissioner", "UPSC EPFO APFC Examination", ["Social security", "Public administration", "Labour laws"]],
  ["Multi-Tasking Staff", "SSC MTS", ["General awareness", "Numerical ability", "Reasoning"]],
  ["Higher Secondary Level Assistant", "SSC CHSL", ["Quantitative aptitude", "English", "General awareness"]],
  ["Stenographer Grade C and D", "SSC Stenographer Examination", ["English", "Transcription", "General awareness"]],
  ["Assistant Loco Pilot", "RRB Assistant Loco Pilot Examination", ["Technical aptitude", "Mathematics", "Reasoning"]],
  ["Railway Group D Associate", "RRB Group D Examination", ["General science", "Mathematics", "Reasoning"]],
  ["Railway Protection Force Sub-Inspector", "RPF Sub-Inspector Examination", ["General awareness", "Reasoning", "Physical fitness"]],
  ["Railway Protection Force Constable", "RPF Constable Examination", ["General awareness", "Reasoning", "Physical fitness"]],
  ["Deputy Collector", "UPPSC Provincial Civil Services Examination", ["State administration", "Constitutional law", "General studies"]],
  ["Deputy Superintendent of Police", "UPPSC Provincial Civil Services Examination", ["Law", "Public administration", "Physical fitness"]],
  ["State Tax Officer", "UPPSC Provincial Civil Services Examination", ["Taxation", "Public finance", "General studies"]],
  ["Assistant Commissioner", "BPSC Combined Competitive Examination", ["State administration", "Indian polity", "General studies"]],
  ["Deputy Collector", "MPSC State Services Examination", ["State administration", "Indian polity", "General studies"]],
  ["Deputy Superintendent of Police", "MPSC State Services Examination", ["Law", "Public administration", "Physical fitness"]],
  ["Deputy Collector", "RPSC Rajasthan Administrative Services Examination", ["State administration", "Rajasthan studies", "General studies"]],
  ["State Administrative Service Officer", "MPPSC State Service Examination", ["State administration", "Indian polity", "General studies"]],
  ["Deputy Collector", "TNPSC Group I Examination", ["State administration", "Tamil Nadu history", "General studies"]],
  ["Deputy Superintendent of Police", "TNPSC Group I Examination", ["Law", "Public administration", "Physical fitness"]],
  ["Deputy Collector", "KPSC Karnataka Administrative Services Examination", ["State administration", "Kannada language", "General studies"]],
  ["State Civil Service Officer", "WBPSC WBCS Examination", ["State administration", "West Bengal history", "General studies"]],
  ["Deputy Collector", "OPSC Odisha Civil Services Examination", ["State administration", "Odisha history", "General studies"]],
  ["Group I Administrative Officer", "APPSC Group I Services Examination", ["State administration", "Andhra Pradesh history", "General studies"]],
  ["Group I Administrative Officer", "TSPSC Group I Services Examination", ["State administration", "Telangana history", "General studies"]],
  ["State Civil Service Officer", "Kerala Administrative Service Examination", ["State administration", "Kerala history", "General studies"]],
  ["Civil Services Officer", "GPSC Class 1 and 2 Examination", ["State administration", "Gujarati language", "General studies"]],
  ["State Administrative Service Officer", "HPSC Haryana Civil Services Examination", ["State administration", "Haryana history", "General studies"]],
  ["State Civil Service Officer", "JPSC Combined Civil Services Examination", ["State administration", "Jharkhand history", "General studies"]],
  ["State Civil Service Officer", "CGPSC State Service Examination", ["State administration", "Chhattisgarh history", "General studies"]],
  ["State Administrative Officer", "UKPSC Provincial Civil Services Examination", ["State administration", "Uttarakhand history", "General studies"]],
  ["State Administrative Officer", "HPPSC Himachal Administrative Services Examination", ["State administration", "Himachal history", "General studies"]],
  ["State Administrative Officer", "JKPSC Combined Competitive Examination", ["State administration", "Regional studies", "General studies"]],
  ["Regional Rural Bank Officer Scale II", "IBPS RRB Officer Scale II Examination", ["Rural banking", "Specialist subject", "Reasoning"]],
  ["Regional Rural Bank Officer Scale III", "IBPS RRB Officer Scale III Examination", ["Rural banking", "Financial management", "Leadership"]],
  ["Circle Based Officer", "SBI Circle Based Officer Examination", ["Banking awareness", "Customer service", "Reasoning"]],
  ["Assistant Manager", "IRDAI Assistant Manager Examination", ["Insurance", "Finance", "Regulatory awareness"]],
  ["Grade A Officer", "PFRDA Grade A Examination", ["Pension systems", "Finance", "Reasoning"]],
  ["Grade A Officer", "IFSCA Grade A Examination", ["Financial markets", "International finance", "Reasoning"]],
  ["Administrative Officer", "NIACL Administrative Officer Examination", ["Insurance", "Finance", "Reasoning"]],
  ["Administrative Officer", "UIIC Administrative Officer Examination", ["Insurance", "Finance", "Reasoning"]],
  ["Assistant Manager", "GIC Assistant Manager Examination", ["Insurance", "Risk management", "Finance"]],
  ["Trained Graduate Teacher", "DSSSB TGT Recruitment Examination", ["Teaching methods", "Subject knowledge", "Child development"]],
  ["Assistant Engineer", "State Public Service Commission Engineering Examination", ["Engineering fundamentals", "Technical aptitude", "General studies"]],
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getDomain = (role) => {
  const normalized = role.toLowerCase();
  if (/data|machine learning|intelligence|research scientist|statistics|analytics/.test(normalized)) {
    return "Data & AI";
  }
  if (/security|cloud|devops|network|infrastructure|it officer|systems administrator/.test(normalized)) {
    return "Security & DevOps";
  }
  if (/designer|architect|content|journalist|communications|writer|editor/.test(normalized)) {
    return "Design & Creative";
  }
  if (/product|project|program|business|policy|administrative|operations|management|analyst|officer/.test(normalized)) {
    return "Product & Management";
  }
  if (/marketing|sales|brand|public relations|customer|account manager/.test(normalized)) {
    return "Marketing & Growth";
  }
  return "Software & Engineering";
};

const getSkills = (role, careerType, industry) => {
  const text = role.toLowerCase();
  if (careerType === "Competitive Exam") {
    const track = competitiveTracks.find(([name, exam]) =>
      role === `${name} (${exam})`
    );
    return track?.[2] || ["Exam syllabus", "Current affairs", "Practice tests"];
  }
  if (careerType === "Government") {
    return ["Public administration", "Policy and regulation", "Data analysis", "Communication"];
  }
  if (/data|analytics|statistics/.test(text)) return ["SQL", "Data analysis", "Statistics", "Visualization"];
  if (/security|forensics|threat/.test(text)) return ["Security fundamentals", "Risk assessment", "Incident response", "Linux"];
  if (/cloud|devops|site reliability|infrastructure|network/.test(text)) return ["Linux", "Cloud platforms", "Networking", "Automation"];
  if (/engineer|developer|programmer|software|robotics/.test(text)) return ["Programming", "System design", "Testing", "Version control"];
  if (/finance|account|tax|audit|investment|credit|risk|actuarial/.test(text)) return ["Financial analysis", "Excel", "Reporting", "Regulatory knowledge"];
  if (/marketing|brand|seo|public relations|content|journalist|copywriter/.test(text)) return ["Research", "Content strategy", "Analytics", "Communication"];
  if (/design|architect|visual|interior/.test(text)) return ["User research", "Design tools", "Prototyping", "Portfolio development"];
  if (/human resources|recruit|talent|learning and development/.test(text)) return ["Talent management", "Communication", "People analytics", "Employment policy"];
  if (/project|program|product|operations|manager/.test(text)) return ["Planning", "Stakeholder management", "Risk management", "Reporting"];
  if (/health|medical|clinical|patient/.test(text)) return ["Healthcare operations", "Compliance", "Communication", "Data management"];
  return [industry, "Communication", "Problem solving", "Professional practice"];
};

const getRoleIcon = (role) => {
  const text = role.toLowerCase();
  if (/security|forensics|threat/.test(text)) return "🛡️";
  if (/data|analytics|statistics|machine learning|intelligence/.test(text)) return "📊";
  if (/cloud/.test(text)) return "☁️";
  if (/network|telecommunications|wireless|radio frequency/.test(text)) return "📡";
  if (/mobile|ios|android/.test(text)) return "📱";
  if (/database|storage/.test(text)) return "🗄️";
  if (/hardware|electronics|vlsi|semiconductor|electrical/.test(text)) return "🔌";
  if (/quality|test|reliability/.test(text)) return "🧪";
  if (/design|visual|interior/.test(text)) return "🎨";
  if (/finance|financial|account|audit|tax|investment|credit|actuarial/.test(text)) return "💰";
  if (/marketing|brand|seo|social media|public relations/.test(text)) return "📣";
  if (/human resources|recruit|talent|employee relations/.test(text)) return "👥";
  if (/health|medical|clinical|patient/.test(text)) return "🩺";
  if (/education|academic|teacher|training|curriculum|instructional/.test(text)) return "📚";
  if (/supply chain|logistics|procurement|inventory/.test(text)) return "📦";
  if (/legal|contract|paralegal|judicial/.test(text)) return "⚖️";
  if (/sales|account manager|customer success|customer experience/.test(text)) return "🤝";
  if (/writer|writing|journalist|editor|content|communications/.test(text)) return "✍️";
  if (/product|project|program|business|operations|analyst|manager|consultant/.test(text)) return "📈";
  if (/engineer|developer|programmer|software|robotics/.test(text)) return "⚙️";
  return "🧭";
};

const getIndustryIcon = (industry) => {
  if (/healthcare/i.test(industry)) return "🏥";
  if (/financial/i.test(industry)) return "🏦";
  if (/education/i.test(industry)) return "🏫";
  if (/retail/i.test(industry)) return "🛍️";
  if (/media/i.test(industry)) return "🎬";
  return "🏢";
};

const makeCareer = ({ name, role, careerType, industry, sector, icon, difficulty }) => {
  const isTechnical = careerType === "Technical";
  const examName = careerType === "Competitive Exam"
    ? name.slice(name.lastIndexOf("(") + 1, -1)
    : "";
  const roleName = careerType === "Competitive Exam"
    ? name.slice(0, name.lastIndexOf("(")).trim()
    : role;
  const description = careerType === "Competitive Exam"
    ? `Prepare for the ${examName} selection process for a career as a ${roleName}. Study the official syllabus, practice exam-style assessments, and check the latest recruitment notification.`
    : careerType === "Government"
      ? `Serve the public as a ${role.toLowerCase()} with the ${industry}. Learn public-service procedures, policy, and the official recruitment requirements for this role.`
      : `${isTechnical ? "Design, build, test, operate, or secure" : "Plan, lead, analyze, support, or deliver"} ${role.toLowerCase()} work in the ${industry} sector. Build relevant subject knowledge, practical skills, and evidence of experience for this pathway.`;
  const learningTime = careerType === "Competitive Exam"
    ? "12-24 Months"
    : careerType === "Government"
      ? "6-18 Months"
      : isTechnical
        ? "6-12 Months"
        : "4-10 Months";

  return {
    name,
    slug: slugify(name),
    description,
    skills: getSkills(role, careerType, industry),
    difficulty: difficulty || (careerType === "Competitive Exam" ? "Advanced" : "Intermediate"),
    learningTime,
    category: careerType === "Competitive Exam" ? "Competitive Examination" : careerType,
    careerType,
    sector,
    industry: industry || "",
    isTechnical,
    domain: getDomain(role),
    icon,
    demand: careerType === "Government" || careerType === "Competitive Exam" ? "Recruitment varies by notification" : "Varies by location and experience",
    averageSalary: careerType === "Government" || careerType === "Competitive Exam" ? "Set by role and official pay scale" : "Varies by location and experience",
  };
};

let generatedCatalog;

export const getGeneratedCareerCatalog = () => {
  if (generatedCatalog) return generatedCatalog;

  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const technicalCareers = technicalRoles.flatMap((role, roleIndex) =>
    privateIndustries.map((industry) =>
      makeCareer({
        name: `${industry} ${role}`,
        role,
        careerType: "Technical",
        industry,
        sector: "Private",
        icon: `${getIndustryIcon(industry)}${getRoleIcon(role)}`,
        difficulty: difficulties[roleIndex % difficulties.length],
      })
    )
  ).slice(0, 100);
  const nonTechnicalCareers = nonTechnicalRoles.flatMap((role, roleIndex) =>
    privateIndustries.map((industry) =>
      makeCareer({
        name: `${industry} ${role}`,
        role,
        careerType: "Non-Technical",
        industry,
        sector: "Private",
        icon: `${getIndustryIcon(industry)}${getRoleIcon(role)}`,
        difficulty: difficulties[(roleIndex + 1) % difficulties.length],
      })
    )
  ).slice(0, 100);
  const privateCareers = privateRoles.flatMap((role, roleIndex) =>
    privateIndustries.map((industry) =>
      makeCareer({
        name: `${industry} ${role}`,
        role,
        careerType: "Private",
        industry,
        sector: "Private",
        icon: `${getIndustryIcon(industry)}${getRoleIcon(role)}`,
        difficulty: difficulties[(roleIndex + 1) % difficulties.length],
      })
    )
  );
  const publicCareers = governmentRoles.flatMap((role, roleIndex) =>
    governmentOrganizations.map((organization) =>
      makeCareer({
        name: `${role} - ${organization}`,
        role,
        careerType: "Government",
        industry: organization,
        sector: "Government",
        icon: `🏛️${getRoleIcon(role)}`,
        difficulty: difficulties[(roleIndex + 2) % difficulties.length],
      })
    )
  );
  const examCareers = competitiveTracks.map(([role, exam], trackIndex) =>
    makeCareer({
      name: `${role} (${exam})`,
      role: `${role} (${exam})`,
      careerType: "Competitive Exam",
      industry: "India",
      sector: "Competitive Exam",
      icon: `🎓${getRoleIcon(role)}`,
      difficulty: difficulties[trackIndex % difficulties.length],
    })
  ).slice(0, 100);

  generatedCatalog = [
    ...technicalCareers,
    ...nonTechnicalCareers,
    ...privateCareers,
    ...publicCareers,
    ...examCareers,
  ];
  return generatedCatalog;
};

export const getGeneratedCareerCategoryCounts = () => {
  const catalog = getGeneratedCareerCatalog();
  return {
    All: catalog.length,
    Technical: catalog.filter((career) => career.careerType === "Technical").length,
    "Non-Technical": catalog.filter((career) => career.careerType === "Non-Technical").length,
    Government: catalog.filter((career) => career.careerType === "Government").length,
    Private: catalog.filter((career) => career.careerType === "Private").length,
    "Competitive Exam": catalog.filter((career) => career.careerType === "Competitive Exam").length,
  };
};

export const findGeneratedCareer = (slug) =>
  getGeneratedCareerCatalog().find((career) => career.slug === slug);

export const createCareerRoadmap = (career) => {
  const skills = career.skills?.length ? career.skills : ["Career fundamentals", "Communication", "Problem solving"];
  const examPath = career.careerType === "Competitive Exam";
  const governmentPath = career.careerType === "Government";
  const stages = examPath
    ? [
        ["Understand the examination", "Map eligibility, stages, syllabus, and official notifications.", ["Eligibility and exam pattern", "Syllabus breakdown", "Study schedule"]],
        ["Build subject foundations", `Study the core subjects for ${career.name}.`, skills],
        ["Practice and recall", "Use timed practice, active recall, and error logs to strengthen retention.", ["Topic-wise practice", "Revision cycles", "Error analysis"]],
        ["Apply knowledge", "Connect concepts to exam-style questions and current developments.", ["Previous papers", "Current affairs", "Answer structure"]],
        ["Take full mock exams", "Simulate exam conditions and use results to target weak areas.", ["Timed mock tests", "Score analysis", "Weak-topic review"]],
        ["Complete the selection process", "Prepare for the next official selection stage and verify all requirements.", ["Application documents", "Interview or physical assessment", "Official result and joining steps"]],
      ]
    : [
        ["Build foundations", `Learn the essential concepts and professional context for ${career.name}.`, skills.slice(0, 3)],
        ["Develop core skills", "Practice the tools, methods, and standards used in this field.", skills],
        ["Learn the sector", `Understand how this work operates in ${career.industry || career.sector || "your chosen sector"}.`, ["Industry structure", "Professional standards", "Ethics and compliance"]],
        ["Create proof of work", "Complete a realistic project or work sample that demonstrates your capability.", ["Choose a practical brief", "Document your process", "Present measurable outcomes"]],
        ["Gain applied experience", "Use supervised practice, volunteering, internships, or entry-level assignments to build experience.", ["Workplace communication", "Team collaboration", "Feedback and iteration"]],
        ["Prepare for opportunities", "Build an evidence-based application and practice role-specific interviews or assessments.", ["Resume and portfolio", "Interview practice", "Job and recruitment research"]],
      ];

  return {
    careerSlug: career.slug,
    careerName: career.name,
    overview: `A practical, six-stage learning path for ${career.name}, with milestones tailored to its skills, sector, and entry route.`,
    steps: stages.map(([title, description, topics], index) => ({
      stepNumber: index + 1,
      title,
      description,
      topics,
      estimatedWeeks: examPath ? [4, 16, 12, 12, 8, 4][index] : [4, 6, 4, 6, 6, 3][index],
    })),
    governmentPath,
  };
};
