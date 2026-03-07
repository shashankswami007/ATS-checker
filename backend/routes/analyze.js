const express = require("express");
const multer = require("multer");
const { parseResume } = require("../utils/parseResume");
const { analyzeTexts } = require("../utils/nlpEngine");
const { calculateATSScore } = require("../utils/atsScorer");

const router = express.Router();

// Multer config: store file in memory (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith(".txt")) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Please upload PDF, DOCX, or TXT."));
    }
  },
});

/**
 * POST /api/analyze
 * Body (multipart/form-data):
 *   - resume: File (PDF / DOCX / TXT)
 *   - jobDescription: string
 */
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Please upload a resume file." });
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res
        .status(400)
        .json({
          error: "Please provide a job description (at least 20 characters).",
        });
    }

    // 1. Parse resume
    const resumeText = await parseResume(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    if (!resumeText || resumeText.trim().length < 10) {
      return res
        .status(400)
        .json({
          error:
            "Could not extract text from the resume. Please try a different file.",
        });
    }

    // 2. NLP analysis
    const nlpResult = analyzeTexts(jobDescription, resumeText);

    // 3. ATS scoring
    const atsReport = calculateATSScore(nlpResult, resumeText);

    // 4. Return full report
    res.json({
      success: true,
      report: {
        ...atsReport,
        keywords: {
          matched: nlpResult.matchedKeywords,
          missing: nlpResult.missingKeywords,
          recommended: nlpResult.recommendedKeywords,
        },
        skills: {
          jd: nlpResult.jdSkills,
          resume: nlpResult.resumeSkills,
          matched: nlpResult.matchedSkills,
          missing: nlpResult.missingSkills,
          matchPercentage: Math.round(nlpResult.skillMatchRatio * 100),
        },
      },
    });
  } catch (err) {
    console.error("Analysis error:", err);
    res
      .status(500)
      .json({ error: err.message || "Internal server error during analysis." });
  }
});

module.exports = router;
