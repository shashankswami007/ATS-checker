"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_JD = `We are looking for a Senior Full-Stack Developer to join our engineering team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with Next.js, Tailwind CSS, and REST APIs
- Familiarity with cloud services (AWS, GCP, or Azure)
- Experience with databases like PostgreSQL and MongoDB
- Understanding of CI/CD pipelines and Docker
- Strong problem-solving and communication skills
- Experience with Agile/Scrum methodologies
- Knowledge of Git and version control best practices

Nice to have:
- Experience with GraphQL
- Knowledge of microservices architecture
- Experience with Kubernetes
- Contributions to open-source projects`;

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function JDInput({ value, onChange, disabled }: JDInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = value.length;
  const maxChars = 10000;

  const handleClear = () => {
    onChange("");
    textareaRef.current?.focus();
  };

  const handleAutofill = () => {
    onChange(EXAMPLE_JD);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Paste Job Description
            </h2>
            <p className="text-sm text-gray-500">
              Paste the full JD you want to match against
            </p>
          </div>
        </div>
      </div>

      <div
        className={`relative rounded-xl border-2 transition-all duration-300 ${
          isFocused
            ? "border-indigo-400 shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Paste the job description here..."
          className="w-full h-48 md:h-56 p-4 bg-transparent resize-none text-sm md:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-50 rounded-xl"
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAutofill}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Example JD
          </motion.button>

          <AnimatePresence>
            {value.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <span
          className={`text-xs font-medium transition-colors ${
            charCount > maxChars * 0.9 ? "text-red-500" : "text-gray-400"
          }`}
        >
          {charCount.toLocaleString()} / {maxChars.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
