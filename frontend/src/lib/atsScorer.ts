/**
 * ATS Scorer — computes a weighted ATS compatibility score
 *
 * Components:
 *   Keyword match       → 40%
 *   Skills match        → 20%
 *   Experience relevance→ 20%  (cosine similarity)
 *   Formatting          → 10%
 *   Resume structure    → 10%
 */

import type { NLPResult } from "./nlpEngine";

const SECTION_HEADINGS = [
  "education",
  "experience",
  "work experience",
  "professional experience",
  "skills",
  "technical skills",
  "projects",
  "certifications",
  "summary",
  "professional summary",
  "objective",
  "career objective",
  "achievements",
  "awards",
  "publications",
  "references",
  "volunteer",
  "interests",
  "languages",
  "profile",
  "about",
  "contact",
];

interface FormattingResult {
  score: number;
  foundSections: string[];
  totalChecked: number;
}

interface StructureResult {
  score: number;
  wordCount: number;
  bulletCount: number;
  totalLines: number;
  bulletRatio: number;
  lengthScore: number;
  bulletScore: number;
  densityScore: number;
}

export interface Suggestion {
  type: string;
  priority: string;
  title: string;
  description: string;
}

export interface ATSScoreResult {
  score: number;
  breakdown: {
    keywordMatch: number;
    skillMatch: number;
    experienceRelevance: number;
    formatting: number;
    structure: number;
  };
  formatting: {
    foundSections: string[];
    isCompatible: boolean;
  };
  structure: {
    wordCount: number;
    bulletCount: number;
    totalLines: number;
    bulletRatio: number;
    isOptimalLength: boolean;
  };
  suggestions: Suggestion[];
}

/**
 * Check formatting: count recognized section headings
 */
function checkFormatting(resumeText: string): FormattingResult {
  const lower = resumeText.toLowerCase();
  const foundSections = SECTION_HEADINGS.filter((h) => {
    const regex = new RegExp(`(^|\\n)\\s*${h}[:\\s]*`, "i");
    return regex.test(lower);
  });

  const score = Math.min(foundSections.length / 4, 1);
  return {
    score,
    foundSections,
    totalChecked: SECTION_HEADINGS.length,
  };
}

/**
 * Check resume structure: bullet points, length, keyword density
 */
function checkStructure(
  resumeText: string,
  keywordMatchRatio: number,
): StructureResult {
  const lines = resumeText.split("\n").filter((l) => l.trim().length > 0);
  const words = resumeText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  const bulletLines = lines.filter((l) =>
    /^\s*[•\-\*\u2022\u2023\u25E6\u2043\u2219]/.test(l),
  );
  const bulletRatio = lines.length > 0 ? bulletLines.length / lines.length : 0;
  const bulletScore = Math.min(bulletRatio / 0.3, 1);

  let lengthScore = 1;
  if (wordCount < 150) lengthScore = 0.3;
  else if (wordCount < 300) lengthScore = 0.6;
  else if (wordCount > 1500) lengthScore = 0.7;
  else if (wordCount > 1200) lengthScore = 0.85;

  const densityScore = Math.min(keywordMatchRatio * 1.5, 1);

  const score = bulletScore * 0.35 + lengthScore * 0.35 + densityScore * 0.3;

  return {
    score,
    wordCount,
    bulletCount: bulletLines.length,
    totalLines: lines.length,
    bulletRatio: Math.round(bulletRatio * 100),
    lengthScore,
    bulletScore,
    densityScore,
  };
}

/**
 * Generate improvement suggestions based on analysis
 */
function generateSuggestions(
  nlpResult: NLPResult & { resumeText: string },
  formatting: FormattingResult,
  structure: StructureResult,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (nlpResult.missingKeywords.length > 5) {
    suggestions.push({
      type: "keywords",
      priority: "high",
      title: "Add Missing Keywords",
      description: `Your resume is missing ${nlpResult.missingKeywords.length} important keywords from the job description. Consider adding: ${nlpResult.missingKeywords.slice(0, 8).join(", ")}.`,
    });
  }

  if (nlpResult.missingSkills.length > 0) {
    suggestions.push({
      type: "skills",
      priority: "high",
      title: "Include Missing Skills",
      description: `The JD mentions these skills not found in your resume: ${nlpResult.missingSkills.join(", ")}. Add them if you have experience with them.`,
    });
  }

  if (formatting.foundSections.length < 3) {
    suggestions.push({
      type: "formatting",
      priority: "medium",
      title: "Add Standard Section Headings",
      description:
        'Your resume should include clear section headings like "Experience", "Education", "Skills", and "Projects" for better ATS parsing.',
    });
  }

  if (structure.bulletRatio < 15) {
    suggestions.push({
      type: "structure",
      priority: "medium",
      title: "Use More Bullet Points",
      description:
        "ATS systems parse bullet points more effectively. Use bullet points to list your achievements and responsibilities.",
    });
  }

  if (structure.wordCount < 300) {
    suggestions.push({
      type: "structure",
      priority: "medium",
      title: "Expand Your Resume",
      description: `Your resume is only ${structure.wordCount} words. Most effective resumes are 400–800 words. Add more detail about your experience and achievements.`,
    });
  } else if (structure.wordCount > 1200) {
    suggestions.push({
      type: "structure",
      priority: "low",
      title: "Consider Shortening Your Resume",
      description: `Your resume is ${structure.wordCount} words. Consider trimming to 600–1000 words for optimal ATS scanning.`,
    });
  }

  const hasNumbers =
    /\d+%|\$\d+|\d+\s*(users|customers|clients|projects|team|members|people)/i.test(
      nlpResult.resumeText || "",
    );
  if (!hasNumbers) {
    suggestions.push({
      type: "content",
      priority: "medium",
      title: "Add Measurable Achievements",
      description:
        'Include quantifiable results like "Increased sales by 25%" or "Managed a team of 10" to strengthen your resume.',
    });
  }

  if (nlpResult.cosineSimilarity < 0.2) {
    suggestions.push({
      type: "relevance",
      priority: "high",
      title: "Improve Relevance to Job Description",
      description:
        "Your resume has low overall similarity to the job description. Tailor your experience descriptions to better match the JD language and requirements.",
    });
  }

  if (nlpResult.keywordMatchRatio > 0.5) {
    suggestions.push({
      type: "positive",
      priority: "info",
      title: "Good Keyword Coverage",
      description: `Your resume matches ${Math.round(nlpResult.keywordMatchRatio * 100)}% of the JD keywords. Keep refining to improve further.`,
    });
  }

  return suggestions;
}

/**
 * Calculate the final ATS score
 */
export function calculateATSScore(
  nlpResult: NLPResult,
  resumeText: string,
): ATSScoreResult {
  const formatting = checkFormatting(resumeText);
  const structure = checkStructure(resumeText, nlpResult.keywordMatchRatio);

  const keywordScore = nlpResult.keywordMatchRatio;
  const skillScore = nlpResult.skillMatchRatio;
  const experienceScore = nlpResult.cosineSimilarity;
  const formattingScore = formatting.score;
  const structureScore = structure.score;

  const rawScore =
    keywordScore * 0.4 +
    skillScore * 0.2 +
    experienceScore * 0.2 +
    formattingScore * 0.1 +
    structureScore * 0.1;

  const atsScore = Math.round(Math.min(rawScore * 100, 100));

  const suggestions = generateSuggestions(
    { ...nlpResult, resumeText },
    formatting,
    structure,
  );

  return {
    score: atsScore,
    breakdown: {
      keywordMatch: Math.round(keywordScore * 100),
      skillMatch: Math.round(skillScore * 100),
      experienceRelevance: Math.round(experienceScore * 100),
      formatting: Math.round(formattingScore * 100),
      structure: Math.round(structureScore * 100),
    },
    formatting: {
      foundSections: formatting.foundSections,
      isCompatible: formatting.score >= 0.5,
    },
    structure: {
      wordCount: structure.wordCount,
      bulletCount: structure.bulletCount,
      totalLines: structure.totalLines,
      bulletRatio: structure.bulletRatio,
      isOptimalLength:
        structure.wordCount >= 300 && structure.wordCount <= 1200,
    },
    suggestions,
  };
}
