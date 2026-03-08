"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ReportData {
  score: number;
  breakdown: {
    keywordMatch: number;
    skillMatch: number;
    experienceRelevance: number;
    formatting: number;
    structure: number;
  };
  keywords: {
    matched: string[];
    missing: string[];
    recommended: string[];
  };
  skills: {
    matched: string[];
    missing: string[];
    matchPercentage: number;
  };
  suggestions: {
    type: string;
    priority: string;
    title: string;
    description: string;
  }[];
}

interface ReportActionsProps {
  suggestions: { title: string; description: string }[];
  report?: ReportData;
  reportRef: React.RefObject<HTMLDivElement | null>;
  onReset: () => void;
}

export default function ReportActions({
  suggestions,
  report,
  reportRef,
  onReset,
}: ReportActionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    const text = suggestions
      .map((s, i) => `${i + 1}. ${s.title}\n   ${s.description}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;

      const addText = (
        text: string,
        x: number,
        fontSize: number,
        style: "normal" | "bold" = "normal",
        color: [number, number, number] = [30, 30, 30],
      ) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", style);
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, pageWidth - x - 15);
        const lineHeight = fontSize * 0.5;
        for (const line of lines) {
          if (y > 275) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(line, x, y);
          y += lineHeight;
        }
      };

      const addSpacer = (height: number) => {
        y += height;
      };

      // Title
      addText("ATS Resume Report", 15, 22, "bold", [79, 70, 229]);
      addSpacer(4);
      addText(
        `Generated on ${new Date().toLocaleDateString()}`,
        15,
        9,
        "normal",
        [120, 120, 120],
      );
      addSpacer(8);

      // Score
      if (report) {
        addText(`ATS Score: ${report.score}/100`, 15, 18, "bold", [30, 30, 30]);
        addSpacer(6);

        // Breakdown
        addText("Score Breakdown", 15, 13, "bold", [79, 70, 229]);
        addSpacer(2);
        addText(`• Keyword Match: ${report.breakdown.keywordMatch}%`, 18, 10);
        addText(`• Skill Match: ${report.breakdown.skillMatch}%`, 18, 10);
        addText(
          `• Experience Relevance: ${report.breakdown.experienceRelevance}%`,
          18,
          10,
        );
        addText(`• Formatting: ${report.breakdown.formatting}%`, 18, 10);
        addText(`• Structure: ${report.breakdown.structure}%`, 18, 10);
        addSpacer(6);

        // Keywords
        if (report.keywords.matched.length > 0) {
          addText("Matched Keywords", 15, 13, "bold", [16, 185, 129]);
          addSpacer(2);
          addText(
            report.keywords.matched.join(", "),
            18,
            9,
            "normal",
            [60, 60, 60],
          );
          addSpacer(4);
        }

        if (report.keywords.missing.length > 0) {
          addText("Missing Keywords", 15, 13, "bold", [239, 68, 68]);
          addSpacer(2);
          addText(
            report.keywords.missing.join(", "),
            18,
            9,
            "normal",
            [60, 60, 60],
          );
          addSpacer(4);
        }

        if (report.keywords.recommended.length > 0) {
          addText(
            "Recommended Keywords to Add",
            15,
            13,
            "bold",
            [245, 158, 11],
          );
          addSpacer(2);
          addText(
            report.keywords.recommended.join(", "),
            18,
            9,
            "normal",
            [60, 60, 60],
          );
          addSpacer(4);
        }

        // Skills
        if (report.skills.matched.length > 0) {
          addText(
            `Matched Skills (${report.skills.matchPercentage}%)`,
            15,
            13,
            "bold",
            [16, 185, 129],
          );
          addSpacer(2);
          addText(
            report.skills.matched.join(", "),
            18,
            9,
            "normal",
            [60, 60, 60],
          );
          addSpacer(4);
        }

        if (report.skills.missing.length > 0) {
          addText("Missing Skills", 15, 13, "bold", [239, 68, 68]);
          addSpacer(2);
          addText(
            report.skills.missing.join(", "),
            18,
            9,
            "normal",
            [60, 60, 60],
          );
          addSpacer(6);
        }
      }

      // Suggestions
      if (suggestions.length > 0) {
        addText("Improvement Suggestions", 15, 14, "bold", [79, 70, 229]);
        addSpacer(3);

        suggestions.forEach((s, i) => {
          addText(`${i + 1}. ${s.title}`, 18, 11, "bold");
          addText(s.description, 22, 9, "normal", [80, 80, 80]);
          addSpacer(3);
        });
      }

      pdf.save("ATS-Resume-Report.pdf");
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Keep reportRef for potential future use
  void reportRef;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {/* Copy suggestions */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all cursor-pointer"
      >
        {copied ? (
          <>
            <svg
              className="w-4 h-4 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Suggestions
          </>
        )}
      </motion.button>

      {/* Download PDF */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-sm font-medium text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
      >
        {downloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Report
          </>
        )}
      </motion.button>

      {/* Reset */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 shadow-sm transition-all cursor-pointer"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Reset
      </motion.button>
    </motion.div>
  );
}
