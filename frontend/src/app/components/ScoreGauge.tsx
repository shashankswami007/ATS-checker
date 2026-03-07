"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  breakdown: {
    keywordMatch: number;
    skillMatch: number;
    experienceRelevance: number;
    formatting: number;
    structure: number;
  };
}

function getScoreColor(score: number) {
  if (score >= 70)
    return {
      text: "text-emerald-500",
      stroke: "#10b981",
      bg: "bg-emerald-50",
      label: "Good",
    };
  if (score >= 40)
    return {
      text: "text-amber-500",
      stroke: "#f59e0b",
      bg: "bg-amber-50",
      label: "Average",
    };
  return {
    text: "text-red-500",
    stroke: "#ef4444",
    bg: "bg-red-50",
    label: "Needs Work",
  };
}

export default function ScoreGauge({ score, breakdown }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { text, stroke, bg, label } = getScoreColor(score);

  // Circumference for SVG circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let current = 0;
    const step = score / 60; // animate over ~60 frames
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setAnimatedScore(Math.round(current));
    }, 16);
    return () => clearInterval(interval);
  }, [score]);

  const breakdownItems = [
    { label: "Keywords", value: breakdown.keywordMatch, weight: "40%" },
    { label: "Skills", value: breakdown.skillMatch, weight: "20%" },
    {
      label: "Experience",
      value: breakdown.experienceRelevance,
      weight: "20%",
    },
    { label: "Formatting", value: breakdown.formatting, weight: "10%" },
    { label: "Structure", value: breakdown.structure, weight: "10%" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm">
          📊
        </span>
        ATS Score
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="12"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-extrabold ${text}`}>
              {animatedScore}
            </span>
            <span className="text-xs font-medium text-gray-400 mt-1">
              out of 100
            </span>
            <span
              className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${bg} ${text}`}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-3">
          {breakdownItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <span className="text-xs text-gray-400">
                  {item.value}%{" "}
                  <span className="text-gray-300">({item.weight})</span>
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      item.value >= 70
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : item.value >= 40
                          ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                          : "linear-gradient(90deg, #ef4444, #f87171)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.6 + i * 0.1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
