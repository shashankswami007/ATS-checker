"use client";

import { motion } from "framer-motion";

interface Suggestion {
  type: string;
  priority: string;
  title: string;
  description: string;
}

interface SuggestionsProps {
  suggestions: Suggestion[];
}

const PRIORITY_STYLES: Record<
  string,
  { bg: string; border: string; icon: string; badge: string }
> = {
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "🔴",
    badge: "bg-red-100 text-red-700",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "🟡",
    badge: "bg-amber-100 text-amber-700",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "🔵",
    badge: "bg-blue-100 text-blue-700",
  },
  info: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "🟢",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

export default function Suggestions({ suggestions }: SuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-sm">
          💡
        </span>
        Improvement Suggestions
      </h3>

      <div className="space-y-3">
        {suggestions.map((sug, i) => {
          const style = PRIORITY_STYLES[sug.priority] || PRIORITY_STYLES.info;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`rounded-xl p-4 border ${style.bg} ${style.border}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-800">
                      {sug.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${style.badge}`}
                    >
                      {sug.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {sug.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
