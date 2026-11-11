
export const initialContent = {
  // ==========================================
  // 01. PROFILE
  // ==========================================
  profile: {
    name: "Aditya Pratap Singh",
    initials: "APS",
    role: "Developer · Builder · Problem Solver",
    headline: "Building digital experiences that matter.",
    intro:
      "I'm a Computer Science Engineering student who enjoys building real-world web applications, solving problems and exploring AI/ML-driven solutions.",
    about:
      "I enjoy turning ideas into useful products. My interests include full-stack development, Java, data structures and algorithms, AI/ML, automation and hardware projects. I value consistency, clean interfaces and learning by building.",
    location: "Greater Noida, Uttar Pradesh, India",
    college: "KCC Institute of Technology and Management",
    degree: "B.Tech — Computer Science & Engineering",
    graduation: "2028",
    cgpa: "7.2",
    email: "singhaditya4560@gmail.com",
    github: "https://github.com/Adityahub404singh",
    linkedin: "https://www.linkedin.com/in/aditya-singh-47b218321",
    leetcode: "https://leetcode.com/",
    resumeUrl: "/resume.pdf",
    availability: "Open to internships and opportunities"
  },

  // ==========================================
  // 02. PORTFOLIO STATISTICS
  // ==========================================
  stats: {
    projects: 5,
    achievements: 0,
    certificates: 0,
    dsaSolved: 0
  },

  // ==========================================
  // 03. TECHNICAL SKILLS
  // ==========================================
  skills: [
    {
      id: "s1",
      name: "Java",
      group: "Languages",
      level: 78,
      detail: "OOP · Collections · Streams"
    },
    {
      id: "s2",
      name: "JavaScript",
      group: "Languages",
      level: 76,
      detail: "ES6+ · Async · DOM"
    },
    {
      id: "s3",
      name: "Python",
      group: "Languages",
      level: 58,
      detail: "Scripting · Data analysis"
    },
    {
      id: "s4",
      name: "React",
      group: "Frontend",
      level: 70,
      detail: "Hooks · Components · Routing"
    },
    {
      id: "s5",
      name: "HTML & CSS",
      group: "Frontend",
      level: 85,
      detail: "Responsive · Accessible UI"
    },
    {
      id: "s6",
      name: "DSA",
      group: "Core CS",
      level: 68,
      detail: "Arrays · Lists · Trees · Graphs"
    },
    {
      id: "s7",
      name: "SQL",
      group: "Backend & Data",
      level: 55,
      detail: "Queries · Joins · Aggregation"
    },
    {
      id: "s8",
      name: "Git & GitHub",
      group: "Tools",
      level: 72,
      detail: "Version control · Collaboration"
    }
  ],

  // ==========================================
  // 04. PROJECTS
  // IMPORTANT:
  // Do not use duplicate screenshots.
  // Add only genuine project images.
  // ==========================================
  projects: [
    {
      id: "p1",
      name: "SkillSwap",
      category: "Web App",
      status: "Live",
      description:
        "A peer-to-peer platform where people can exchange skills, learn from one another and grow through collaboration.",
      stack: ["React", "JavaScript", "Vercel"],
      liveUrl: "https://skillswap-fawn-mu.vercel.app/",
      githubUrl: "https://github.com/Adityahub404singh",
      image: "",
      featured: true
    },

    {
      id: "p2",
      name: "Automation AI",
      category: "AI Product",
      status: "In progress",
      description:
        "An AI-powered content automation concept focused on simplifying creator workflows and repetitive tasks.",
      stack: ["AI", "Automation", "React"],
      liveUrl: "https://youtubeautoaiproductdesign5.vercel.app/",
      githubUrl: "",
      image: "",
      featured: true
    },

    {
      id: "p3",
      name: "TutorMitra",
      category: "EdTech",
      status: "Concept",
      description:
        "An education platform concept designed to connect learners with tutors and make personalized learning easier.",
      stack: ["HTML", "CSS", "JavaScript"],
      liveUrl: "",
      githubUrl: "https://github.com/Adityahub404singh",
      image: "",
      featured: true
    },

    {
      id: "p4",
      name: "Auto Fire Fighting Robot",
      category: "IoT / Hardware",
      status: "Built",
      description:
        "An Arduino-based prototype designed to detect fire and trigger an extinguishing mechanism.",
      stack: ["Arduino", "C++", "Sensors", "IoT"],
      liveUrl: "",
      githubUrl: "https://github.com/Adityahub404singh",
      image: "/images/fire-robot.jpg",
      featured: true
    },

    {
      id: "p5",
      name: "AI/ML Data Analysis",
      category: "AI / Data",
      status: "Learning project",
      description:
        "A data analysis and machine-learning exploration using Python libraries and structured datasets.",
      stack: ["Python", "Pandas", "Scikit-learn"],
      liveUrl: "",
      githubUrl: "https://github.com/Adityahub404singh",
      image: "",
      featured: false
    }
  ],

  // ==========================================
  // 05. DSA PROGRESS
  // ==========================================
  dsa: [],

  leetcode: {
    username: "",
    rating: 0,
    streak: 0
  },

  // ==========================================
  // 06. CERTIFICATES & ACHIEVEMENTS
  // ==========================================
  certificates: [],
  achievements: [],

  // ==========================================
  // 07. EDUCATION & CAREER TIMELINE
  // ==========================================
  timeline: [
    {
      id: "t1",
      date: "2024",
      title: "Started B.Tech CSE",
      detail:
        "Began the Computer Science Engineering journey at KCC ITM."
    },
    {
      id: "t2",
      date: "2024 — 2025",
      title: "Built development foundations",
      detail:
        "Practised programming, web fundamentals and core computer science."
    },
    {
      id: "t3",
      date: "2025 — 2026",
      title: "Focused on projects and DSA",
      detail:
        "Built practical projects and continued structured problem-solving practice."
    },
    {
      id: "t4",
      date: "2026 — 2028",
      title: "Internship and placement goals",
      detail:
        "Strengthening engineering skills and preparing for professional opportunities."
    }
  ],

  // ==========================================
  // 08. DAILY UPDATES & NOTES
  // ==========================================
  dailyUpdates: [],
  notes: [],

  // ==========================================
  // 09. PERSONAL GOALS
  // ==========================================
  goals: [
    {
      id: "g1",
      title: "Build 3 polished portfolio projects",
      current: 1,
      target: 3
    },
    {
      id: "g2",
      title: "Maintain consistent DSA practice",
      current: 0,
      target: 100
    },
    {
      id: "g3",
      title: "Complete a professional internship",
      current: 0,
      target: 1
    }
  ],

  // ==========================================
  // 10. WEBSITE SETTINGS
  // ==========================================
  settings: {
    portfolioTitle: "Aditya Pratap Singh — Developer Portfolio"
  }
};
