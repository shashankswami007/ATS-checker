"use client";

import { motion } from "framer-motion";

interface CompatibilityChecksProps {
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
  breakdown: {
    keywordMatch: number;
    formatting: number;
    structure: number;
  };
}

interface CheckItem {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export default function CompatibilityChecks({
  formatting,
  structure,
  breakdown,
}: CompatibilityChecksProps) {
  const checks: CheckItem[] = [
    {
      label: "Formatting Compatibility",
      status: formatting.isCompatible ? "pass" : "fail",
      detail: formatting.isCompatible
        ? `Found ${formatting.foundSections.length} ATS-friendly sections`
        : `Only ${formatting.foundSections.length} section heading(s) found. Add more standard headings.`,
    },
    {
      label: "Section Headings",
      status:
        formatting.foundSections.length >= 4
          ? "pass"
          : formatting.foundSections.length >= 2
            ? "warn"
            : "fail",
      detail:
        formatting.foundSections.length > 0
          ? `Detected: ${formatting.foundSections.join(", ")}`
          : "No standard section headings detected.",
    },
    {
      label: "Keyword Density",
      status:
        breakdown.keywordMatch >= 50
          ? "pass"
          : breakdown.keywordMatch >= 25
            ? "warn"
            : "fail",
      detail: `${breakdown.keywordMatch}% keyword match with job description`,
    },
    {
      label: "Resume Length",
      status: structure.isOptimalLength ? "pass" : "warn",
      detail: `${structure.wordCount} words (optimal: 300–1200)`,
    },
    {
      label: "Bullet Point Structure",
      status:
        structure.bulletRatio >= 20
          ? "pass"
          : structure.bulletRatio >= 10
            ? "warn"
            : "fail",
      detail: `${structure.bulletCount} bullet points across ${structure.totalLines} lines (${structure.bulletRatio}%)`,
    },
  ];

  const statusConfig = {
    pass: {
      icon: (
        <svg
          className="w-4 h-4 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    warn: {
      icon: (
        <svg
          className="w-4 h-4 text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    fail: {
      icon: (
        <svg
          className="w-4 h-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      bg: "bg-red-50",
      border: "border-red-200",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">
          🔍
        </span>
        ATS Compatibility Checks
      </h3>

      <div className="space-y-3">
        {checks.map((check, i) => {
          const config = statusConfig[check.status];
          return (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`flex items-start gap-3 rounded-xl p-3.5 border ${config.bg} ${config.border}`}
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                {config.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {check.label}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{check.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
