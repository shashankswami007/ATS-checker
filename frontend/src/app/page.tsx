"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import JDInput from "./components/JDInput";
import ResumeUpload from "./components/ResumeUpload";
import AnalyzeButton from "./components/AnalyzeButton";
import ScoreGauge from "./components/ScoreGauge";
import KeywordAnalysis from "./components/KeywordAnalysis";
import SkillMatch from "./components/SkillMatch";
import Suggestions from "./components/Suggestions";
import CompatibilityChecks from "./components/CompatibilityChecks";
import ReportActions from "./components/ReportActions";
import { parseResume } from "@/lib/parseResume";
import { analyzeTexts } from "@/lib/nlpEngine";
import { calculateATSScore } from "@/lib/atsScorer";

interface ATSReport {
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
  suggestions: {
    type: string;
    priority: string;
    title: string;
    description: string;
  }[];
  keywords: {
    matched: string[];
    missing: string[];
    recommended: string[];
  };
  skills: {
    jd: string[];
    resume: string[];
    matched: string[];
    missing: string[];
    matchPercentage: number;
  };
}

export default function HomePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ATSReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const canAnalyze = jobDescription.trim().length >= 20 && resumeFile !== null;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // 1. Parse resume client-side
      const resumeText = await parseResume(resumeFile!);

      if (!resumeText || resumeText.trim().length < 10) {
        throw new Error(
          "Could not extract text from the resume. Please try a different file.",
        );
      }

      // 2. NLP analysis
      const nlpResult = analyzeTexts(jobDescription, resumeText);

      // 3. ATS scoring
      const atsReport = calculateATSScore(nlpResult, resumeText);

      // 4. Build report
      setReport({
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
      });

      // Scroll to report
      setTimeout(() => {
        reportRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setResumeFile(null);
    setReport(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen pb-16">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JDInput
            value={jobDescription}
            onChange={setJobDescription}
            disabled={loading}
          />
          <ResumeUpload
            file={resumeFile}
            onFileChange={setResumeFile}
            disabled={loading}
          />
        </div>

        {/* Analyze Button */}
        <AnalyzeButton
          onClick={handleAnalyze}
          loading={loading}
          disabled={!canAnalyze}
        />

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-xl p-4 bg-red-50 border border-red-200 rounded-xl text-center"
            >
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Dashboard */}
        <AnimatePresence>
          {report && (
            <motion.div
              ref={reportRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 pt-4"
            >
              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
                  📋 ATS Report
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
              </div>

              {/* Score Gauge */}
              <ScoreGauge score={report.score} breakdown={report.breakdown} />

              {/* Keyword Analysis */}
              <KeywordAnalysis
                matched={report.keywords.matched}
                missing={report.keywords.missing}
                recommended={report.keywords.recommended}
              />

              {/* Skill Match */}
              <SkillMatch
                jdSkills={report.skills.jd}
                resumeSkills={report.skills.resume}
                matchedSkills={report.skills.matched}
                missingSkills={report.skills.missing}
                matchPercentage={report.skills.matchPercentage}
              />

              {/* Suggestions */}
              <Suggestions suggestions={report.suggestions} />

              {/* Compatibility Checks */}
              <CompatibilityChecks
                formatting={report.formatting}
                structure={report.structure}
                breakdown={report.breakdown}
              />

              {/* Actions */}
              <ReportActions
                suggestions={report.suggestions}
                report={report}
                reportRef={reportRef}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-16 pb-8 text-xs text-gray-400"
      >
        ATS Resume Checker — Free &amp; Open · No data stored · Analyze locally
      </motion.footer>
    </main>
  );
}
