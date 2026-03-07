"use client";

import { motion } from "framer-motion";

interface SkillMatchProps {
  jdSkills: string[];
  resumeSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
}

export default function SkillMatch({
  jdSkills,
  resumeSkills,
  matchedSkills,
  missingSkills,
  matchPercentage,
}: SkillMatchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-sm">
          🎯
        </span>
        Skill Match
      </h3>

      {/* Match percentage bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Skill Match Rate
          </span>
          <span
            className={`text-xl font-bold ${
              matchPercentage >= 70
                ? "text-emerald-500"
                : matchPercentage >= 40
                  ? "text-amber-500"
                  : "text-red-500"
            }`}
          >
            {matchPercentage}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                matchPercentage >= 70
                  ? "linear-gradient(90deg, #10b981, #6ee7b7)"
                  : matchPercentage >= 40
                    ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
                    : "linear-gradient(90deg, #ef4444, #fca5a5)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${matchPercentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched skills */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-1.5">
            ✅ Matched Skills
            <span className="ml-auto text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
              {matchedSkills.length}
            </span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                No matching skills found
              </p>
            ) : (
              matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="keyword-tag keyword-matched text-xs"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Missing skills */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1.5">
            ❌ Missing Skills
            <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
              {missingSkills.length}
            </span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                Great! No missing skills
              </p>
            ) : (
              missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="keyword-tag keyword-missing text-xs"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* JD vs Resume skill count */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-indigo-400" />
          JD Skills:{" "}
          <span className="font-semibold text-gray-800">{jdSkills.length}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-violet-400" />
          Resume Skills:{" "}
          <span className="font-semibold text-gray-800">
            {resumeSkills.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
