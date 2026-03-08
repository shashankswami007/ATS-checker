/**
 * NLP Engine — client-side TF-IDF keyword extraction and text analysis
 * Replaces the Node.js `natural` library with pure TypeScript implementations.
 */

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
 * Simple word tokenizer — replaces natural.WordTokenizer
 * Splits on non-word characters and returns lowercase tokens.
 */
function tokenizeWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}

/**
 * Tokenize and clean text: lowercase, remove stopwords, remove short tokens
 */
export function tokenize(text: string): string[] {
  const tokens = tokenizeWords(text);
  return tokens.filter(
    (t) => t.length > 1 && !STOPWORDS.has(t) && !/^\d+$/.test(t),
  );
}

// ---------- Simple TF-IDF Implementation ----------

interface TermScore {
  term: string;
  tfidf: number;
}

/**
 * Compute term frequency for a document (array of tokens).
 */
function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/**
 * Compute TF-IDF for one or more documents.
 * Returns an array of TermScore arrays (one per document).
 */
function computeTfIdf(documents: string[]): TermScore[][] {
  const tokenized = documents.map((doc) => tokenizeWords(doc));
  const N = documents.length;

  // Document frequency: how many documents each term appears in
  const df = new Map<string, number>();
  for (const tokens of tokenized) {
    const unique = new Set(tokens);
    for (const t of unique) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }

  // Compute TF-IDF for each document
  return tokenized.map((tokens) => {
    const tf = computeTF(tokens);
    const scores: TermScore[] = [];
    for (const [term, tfVal] of tf) {
      const idf = Math.log(1 + N / (df.get(term) || 1));
      scores.push({ term, tfidf: tfVal * idf });
    }
    scores.sort((a, b) => b.tfidf - a.tfidf);
    return scores;
  });
}

/**
 * Extract keyword phrases and single keywords from text using TF-IDF
 */
export function extractKeywords(text: string): TermScore[] {
  const [scores] = computeTfIdf([text.toLowerCase()]);
  const keywords = scores.filter(
    (item) =>
      item.term.length > 2 &&
      !STOPWORDS.has(item.term) &&
      !/^\d+$/.test(item.term),
  );
  return keywords.slice(0, 80);
}

/**
 * Extract recognized skills from text
 */
export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const pattern of SKILL_PATTERNS) {
    const regex = new RegExp(`\\b${pattern}\\b`, "i");
    if (regex.test(lower)) {
      const match = lower.match(regex);
      found.push(match ? match[0] : pattern);
    }
  }
  return [...new Set(found)];
}

/**
 * Compute cosine similarity between two texts using TF-IDF vectors
 */
export function computeCosineSimilarity(text1: string, text2: string): number {
  const [scores1, scores2] = computeTfIdf([
    text1.toLowerCase(),
    text2.toLowerCase(),
  ]);

  // Build combined vocab
  const vocab = new Set<string>();
  scores1.forEach((t) => vocab.add(t.term));
  scores2.forEach((t) => vocab.add(t.term));

  const terms = [...vocab];
  const map1 = new Map(scores1.map((s) => [s.term, s.tfidf]));
  const map2 = new Map(scores2.map((s) => [s.term, s.tfidf]));

  let dot = 0,
    mag1 = 0,
    mag2 = 0;
  for (const term of terms) {
    const v1 = map1.get(term) || 0;
    const v2 = map2.get(term) || 0;
    dot += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (mag1 * mag2);
}

/**
 * Main NLP analysis: compare JD vs resume
 */
export interface NLPResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedKeywords: string[];
  keywordMatchRatio: number;
  jdSkills: string[];
  resumeSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  skillMatchRatio: number;
  cosineSimilarity: number;
}

export function analyzeTexts(jdText: string, resumeText: string): NLPResult {
  const jdKeywords = extractKeywords(jdText);
  const resumeKeywords = extractKeywords(resumeText);

  const jdTerms = new Set(jdKeywords.map((k) => k.term));
  const resumeTerms = new Set(resumeKeywords.map((k) => k.term));

  const matchedKeywords = [...jdTerms].filter((t) => resumeTerms.has(t));
  const missingKeywords = [...jdTerms].filter((t) => !resumeTerms.has(t));

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

  const cosineSim = computeCosineSimilarity(jdText, resumeText);

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
    cosineSimilarity: cosineSim,
  };
}
