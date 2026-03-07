const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Common English stopwords
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "he",
  "him",
  "his",
  "she",
  "her",
  "they",
  "them",
  "their",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "about",
  "above",
  "after",
  "again",
  "also",
  "as",
  "because",
  "before",
  "between",
  "during",
  "if",
  "into",
  "through",
  "under",
  "until",
  "up",
  "able",
  "etc",
  "using",
  "used",
  "use",
  "work",
  "working",
  "well",
  "including",
  "experience",
  "strong",
  "must",
  "new",
  "role",
  "team",
  "etc",
  "join",
  "looking",
  "responsibilities",
  "requirements",
  "qualifications",
  "preferred",
  "required",
  "years",
  "year",
  "company",
  "position",
  "job",
  "candidate",
  "applicant",
  "ideal",
  "opportunity",
  "currently",
  "across",
  "within",
  "ensure",
  "develop",
  "support",
  "provide",
  "manage",
  "create",
  "build",
  "make",
  "will",
  "need",
  "like",
  "good",
  "great",
  "excellent",
  "knowledge",
  "understanding",
  "ability",
  "skills",
  "skill",
]);

// Common technical/professional skills to recognize
const SKILL_PATTERNS = [
  // Programming languages
  "javascript",
  "typescript",
  "python",
  "java",
  "c\\+\\+",
  "c#",
  "ruby",
  "go",
  "golang",
  "rust",
  "swift",
  "kotlin",
  "php",
  "scala",
  "r",
  "matlab",
  "perl",
  "dart",
  "lua",
  // Frontend
  "react",
  "angular",
  "vue",
  "vue\\.js",
  "next\\.js",
  "nextjs",
  "nuxt",
  "svelte",
  "html",
  "css",
  "sass",
  "scss",
  "less",
  "tailwind",
  "bootstrap",
  "jquery",
  "webpack",
  "vite",
  "redux",
  "mobx",
  "graphql",
  "rest",
  "restful",
  // Backend
  "node\\.js",
  "nodejs",
  "express",
  "express\\.js",
  "django",
  "flask",
  "fastapi",
  "spring",
  "spring boot",
  "asp\\.net",
  "\\.net",
  "rails",
  "laravel",
  "nestjs",
  // Databases
  "sql",
  "mysql",
  "postgresql",
  "postgres",
  "mongodb",
  "redis",
  "elasticsearch",
  "dynamodb",
  "cassandra",
  "oracle",
  "sqlite",
  "firebase",
  "firestore",
  // Cloud & DevOps
  "aws",
  "azure",
  "gcp",
  "google cloud",
  "docker",
  "kubernetes",
  "k8s",
  "terraform",
  "jenkins",
  "ci/cd",
  "ci cd",
  "github actions",
  "gitlab",
  "circleci",
  "ansible",
  // Data & ML
  "machine learning",
  "deep learning",
  "nlp",
  "natural language processing",
  "tensorflow",
  "pytorch",
  "keras",
  "scikit-learn",
  "pandas",
  "numpy",
  "spark",
  "hadoop",
  "data science",
  "data engineering",
  "data analysis",
  "etl",
  "tableau",
  "power bi",
  "bigquery",
  // Tools & Methods
  "git",
  "jira",
  "confluence",
  "figma",
  "sketch",
  "agile",
  "scrum",
  "kanban",
  "microservices",
  "api",
  "apis",
  "linux",
  "unix",
  "bash",
  "powershell",
  "testing",
  "unit testing",
  "integration testing",
  "selenium",
  "cypress",
  "jest",
  "mocha",
  "automation",
  "devops",
  "sre",
  // Soft skills
  "leadership",
  "communication",
  "problem solving",
  "problem-solving",
  "collaboration",
  "project management",
  "analytical",
  "critical thinking",
  "mentoring",
  "presentation",
];

/**
 * Tokenize and clean text: lowercase, remove stopwords, remove short tokens
 */
function tokenize(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return tokens.filter(
    (t) => t.length > 1 && !STOPWORDS.has(t) && !/^\d+$/.test(t),
  );
}

/**
 * Extract keyword phrases and single keywords from text
 */
function extractKeywords(text) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text.toLowerCase());

  const keywords = [];
  tfidf.listTerms(0).forEach((item) => {
    if (
      item.term.length > 2 &&
      !STOPWORDS.has(item.term) &&
      !/^\d+$/.test(item.term)
    ) {
      keywords.push({ term: item.term, tfidf: item.tfidf });
    }
  });

  // Sort by TF-IDF weight and take top terms
  keywords.sort((a, b) => b.tfidf - a.tfidf);
  return keywords.slice(0, 80);
}

/**
 * Extract recognized skills from text
 */
function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = [];

  for (const pattern of SKILL_PATTERNS) {
    const regex = new RegExp(`\\b${pattern}\\b`, "i");
    if (regex.test(lower)) {
      // Get the matched term with original casing
      const match = lower.match(regex);
      found.push(match ? match[0] : pattern);
    }
  }
  return [...new Set(found)];
}

/**
 * Compute cosine similarity between two texts using TF-IDF vectors
 */
function computeCosineSimilarity(text1, text2) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text1.toLowerCase());
  tfidf.addDocument(text2.toLowerCase());

  // Build combined vocab
  const vocab = new Set();
  tfidf.listTerms(0).forEach((t) => vocab.add(t.term));
  tfidf.listTerms(1).forEach((t) => vocab.add(t.term));

  const terms = [...vocab];
  const vec1 = terms.map((term) => {
    const found = tfidf.listTerms(0).find((t) => t.term === term);
    return found ? found.tfidf : 0;
  });
  const vec2 = terms.map((term) => {
    const found = tfidf.listTerms(1).find((t) => t.term === term);
    return found ? found.tfidf : 0;
  });

  // Dot product
  let dot = 0,
    mag1 = 0,
    mag2 = 0;
  for (let i = 0; i < terms.length; i++) {
    dot += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (mag1 * mag2);
}

/**
 * Main NLP analysis: compare JD vs resume
 */
function analyzeTexts(jdText, resumeText) {
  const jdKeywords = extractKeywords(jdText);
  const resumeKeywords = extractKeywords(resumeText);

  const jdTerms = new Set(jdKeywords.map((k) => k.term));
  const resumeTerms = new Set(resumeKeywords.map((k) => k.term));

  const matchedKeywords = [...jdTerms].filter((t) => resumeTerms.has(t));
  const missingKeywords = [...jdTerms].filter((t) => !resumeTerms.has(t));

  // Recommended = high-TF-IDF JD terms not in resume (top missing)
  const recommendedKeywords = jdKeywords
    .filter((k) => !resumeTerms.has(k.term))
    .slice(0, 15)
    .map((k) => k.term);

  const jdSkills = extractSkills(jdText);
  const resumeSkills = extractSkills(resumeText);
  const matchedSkills = jdSkills.filter((s) => resumeSkills.includes(s));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.includes(s));

  const keywordMatchRatio =
    jdTerms.size > 0 ? matchedKeywords.length / jdTerms.size : 0;

  const skillMatchRatio =
    jdSkills.length > 0 ? matchedSkills.length / jdSkills.length : 0;

  const cosineSimilarity = computeCosineSimilarity(jdText, resumeText);

  return {
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 25),
    recommendedKeywords,
    keywordMatchRatio,
    jdSkills,
    resumeSkills,
    matchedSkills,
    missingSkills,
    skillMatchRatio,
    cosineSimilarity,
  };
}

module.exports = { analyzeTexts, extractKeywords, extractSkills, tokenize };
