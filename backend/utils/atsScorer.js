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

/**
 * Check formatting: count recognized section headings
 */
function checkFormatting(resumeText) {
  const lower = resumeText.toLowerCase();
  const foundSections = SECTION_HEADINGS.filter((h) => {
    const regex = new RegExp(`(^|\\n)\\s*${h}[:\\s]*`, "i");
    return regex.test(lower);
  });

  // Ideal: at least 4 sections
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
function checkStructure(resumeText, keywordMatchRatio) {
  const lines = resumeText.split("\n").filter((l) => l.trim().length > 0);
  const words = resumeText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Bullet point detection
  const bulletLines = lines.filter((l) =>
    /^\s*[•\-\*\u2022\u2023\u25E6\u2043\u2219]/.test(l),
  );
  const bulletRatio = lines.length > 0 ? bulletLines.length / lines.length : 0;
  const bulletScore = Math.min(bulletRatio / 0.3, 1); // 30%+ bullet usage = perfect

  // Resume length: optimal 300–1200 words
  let lengthScore = 1;
  if (wordCount < 150) lengthScore = 0.3;
  else if (wordCount < 300) lengthScore = 0.6;
  else if (wordCount > 1500) lengthScore = 0.7;
  else if (wordCount > 1200) lengthScore = 0.85;

  // Keyword density (from match ratio)
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
function generateSuggestions(nlpResult, formatting, structure) {
  const suggestions = [];

  // Missing keywords
  if (nlpResult.missingKeywords.length > 5) {
    suggestions.push({
      type: "keywords",
      priority: "high",
      title: "Add Missing Keywords",
      description: `Your resume is missing ${nlpResult.missingKeywords.length} important keywords from the job description. Consider adding: ${nlpResult.missingKeywords.slice(0, 8).join(", ")}.`,
    });
  }

  // Missing skills
  if (nlpResult.missingSkills.length > 0) {
    suggestions.push({
      type: "skills",
      priority: "high",
      title: "Include Missing Skills",
      description: `The JD mentions these skills not found in your resume: ${nlpResult.missingSkills.join(", ")}. Add them if you have experience with them.`,
    });
  }

  // Formatting
  if (formatting.foundSections.length < 3) {
    suggestions.push({
      type: "formatting",
      priority: "medium",
      title: "Add Standard Section Headings",
      description:
        'Your resume should include clear section headings like "Experience", "Education", "Skills", and "Projects" for better ATS parsing.',
    });
  }

  // Bullet points
  if (structure.bulletRatio < 15) {
    suggestions.push({
      type: "structure",
      priority: "medium",
      title: "Use More Bullet Points",
      description:
        "ATS systems parse bullet points more effectively. Use bullet points to list your achievements and responsibilities.",
    });
  }

  // Resume length
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

  // Measurable achievements
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

  // Low similarity
  if (nlpResult.cosineSimilarity < 0.2) {
    suggestions.push({
      type: "relevance",
      priority: "high",
      title: "Improve Relevance to Job Description",
      description:
        "Your resume has low overall similarity to the job description. Tailor your experience descriptions to better match the JD language and requirements.",
    });
  }

  // Always add a positive tip
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
function calculateATSScore(nlpResult, resumeText) {
  const formatting = checkFormatting(resumeText);
  const structure = checkStructure(resumeText, nlpResult.keywordMatchRatio);

  const keywordScore = nlpResult.keywordMatchRatio; // 0–1
  const skillScore = nlpResult.skillMatchRatio; // 0–1
  const experienceScore = nlpResult.cosineSimilarity; // 0–1
  const formattingScore = formatting.score; // 0–1
  const structureScore = structure.score; // 0–1

  // Weighted sum
  const rawScore =
    keywordScore * 0.4 +
    skillScore * 0.2 +
    experienceScore * 0.2 +
    formattingScore * 0.1 +
    structureScore * 0.1;

  // Scale to 0–100
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

module.exports = { calculateATSScore, checkFormatting, checkStructure };
