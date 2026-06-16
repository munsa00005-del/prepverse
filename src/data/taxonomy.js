// ───────────────────────────────────────────────────────────────
// Taxonomy: exams → subjects → syllabus chapters.
// Topics are DERIVED from the question bank at runtime (see store),
// so navigation always reflects what is actually answerable while
// still showing the full syllabus chapter list with honest counts.
// ───────────────────────────────────────────────────────────────

export const EXAMS = [
  {
    id: "jee-main",
    name: "JEE Main",
    short: "JEE Main",
    blurb: "NTA · National engineering entrance",
    accent: "violet",
    subjects: ["physics", "chemistry", "maths"],
  },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    short: "JEE Adv",
    blurb: "IIT · For the top JEE Main qualifiers",
    accent: "fuchsia",
    subjects: ["physics", "chemistry", "maths"],
  },
  {
    id: "neet",
    name: "NEET",
    short: "NEET",
    blurb: "NTA · National medical entrance",
    accent: "mint",
    subjects: ["physics", "chemistry", "biology"],
  },
];

export const SUBJECTS = {
  physics: { id: "physics", name: "Physics", icon: "Atom" },
  chemistry: { id: "chemistry", name: "Chemistry", icon: "Flask" },
  maths: { id: "maths", name: "Mathematics", icon: "MathOperations" },
  biology: { id: "biology", name: "Biology", icon: "Plant" },
};

// Full syllabus chapter list per subject (shared across exams that use them).
export const CHAPTERS = {
  physics: [
    "Units & Measurements",
    "Kinematics",
    "Laws of Motion",
    "Work, Energy & Power",
    "Rotational Motion",
    "Gravitation",
    "Properties of Matter",
    "Thermodynamics",
    "Kinetic Theory of Gases",
    "Oscillations & SHM",
    "Waves & Sound",
    "Electrostatics",
    "Current Electricity",
    "Moving Charges & Magnetism",
    "Electromagnetic Induction & AC",
    "Electromagnetic Waves",
    "Ray Optics",
    "Wave Optics",
    "Modern Physics",
    "Semiconductor Electronics",
  ],
  chemistry: [
    "Some Basic Concepts",
    "Atomic Structure",
    "Periodic Classification",
    "Chemical Bonding",
    "Chemical Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Coordination Compounds",
    "p-Block Elements",
    "d- & f-Block Elements",
    "General Organic Chemistry",
    "Hydrocarbons",
    "Haloalkanes & Haloarenes",
    "Alcohols, Phenols & Ethers",
    "Aldehydes, Ketones & Acids",
    "Amines",
    "Biomolecules",
  ],
  maths: [
    "Sets, Relations & Functions",
    "Complex Numbers",
    "Quadratic Equations",
    "Sequences & Series",
    "Permutations & Combinations",
    "Binomial Theorem",
    "Matrices & Determinants",
    "Trigonometry",
    "Straight Lines",
    "Circles",
    "Conic Sections",
    "Limits, Continuity & Differentiability",
    "Application of Derivatives",
    "Indefinite Integration",
    "Definite Integration & Area",
    "Differential Equations",
    "Vector & 3D Geometry",
    "Probability",
    "Statistics",
  ],
  biology: [
    "Cell: Structure & Function",
    "Biomolecules",
    "Plant Physiology",
    "Human Physiology",
    "Genetics & Evolution",
    "Reproduction",
    "Biology in Human Welfare",
    "Biotechnology",
    "Ecology & Environment",
    "Morphology of Plants",
    "Animal Kingdom",
    "Plant Kingdom",
  ],
};

export const DIFFICULTY = {
  easy: { label: "Easy", color: "var(--color-mint-400)" },
  medium: { label: "Medium", color: "var(--color-amber-400)" },
  hard: { label: "Hard", color: "var(--color-rose-400)" },
};

export const YEAR_MIN = 2000;
export const YEAR_MAX = 2026;

export function examById(id) {
  return EXAMS.find((e) => e.id === id);
}
