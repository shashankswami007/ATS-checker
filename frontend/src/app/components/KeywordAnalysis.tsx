"use client";

import { motion } from "framer-motion";

interface KeywordAnalysisProps {
  matched: string[];
  missing: string[];
  recommended: string[];
}

export default function KeywordAnalysis({
  matched,
  missing,
  recommended,
}: KeywordAnalysisProps) {
  const sections = [
    {
      title: "Matched Keywords",
      icon: "✅",
      keywords: matched,
      tagClass: "keyword-matched",
      emptyText: "No matching keywords found",
      bgClass: "bg-emerald-50",
      countColor: "text-emerald-600",
    },
    {
      title: "Missing Keywords",
      icon: "❌",
      keywords: missing,
      tagClass: "keyword-missing",
      emptyText: "Great! No major missing keywords",
      bgClass: "bg-red-50",
      countColor: "text-red-600",
    },
    {
      title: "Recommended",
      icon: "💡",
      keywords: recommended,
      tagClass: "keyword-recommended",
      emptyText: "No additional recommendations",
      bgClass: "bg-blue-50",
      countColor: "text-blue-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm">
          🔑
        </span>
        Keyword Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section, sIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sIdx * 0.1 }}
            className={`rounded-xl p-4 ${section.bgClass} border border-opacity-20`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <span>{section.icon}</span>
                {section.title}
              </h4>
              <span
                className={`text-xs font-bold ${section.countColor} px-2 py-0.5 rounded-full bg-white`}
              >
                {section.keywords.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {section.keywords.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  {section.emptyText}
                </p>
              ) : (
                section.keywords.map((keyword, kIdx) => (
                  <motion.span
                    key={keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + kIdx * 0.02 }}
                    className={`keyword-tag ${section.tagClass}`}
                  >
                    {keyword}
                  </motion.span>
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
