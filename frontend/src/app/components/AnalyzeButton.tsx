"use client";

import { motion } from "framer-motion";

interface AnalyzeButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function AnalyzeButton({
  onClick,
  loading,
  disabled,
}: AnalyzeButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex justify-center"
    >
      <motion.button
        whileHover={
          !disabled
            ? {
                scale: 1.03,
                boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.4)",
              }
            : {}
        }
        whileTap={!disabled ? { scale: 0.97 } : {}}
        onClick={onClick}
        disabled={disabled || loading}
        className={`relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-semibold text-white
          transition-all duration-300 cursor-pointer
          ${
            disabled
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          }
        `}
      >
        {loading ? (
          <>
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
              />
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              />
            </div>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Analyze Resume
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
