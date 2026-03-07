import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATS Resume Checker — Free ATS Score & Keyword Analysis",
  description:
    "Analyze your resume against any job description. Get your ATS compatibility score, keyword analysis, and actionable improvement suggestions — all for free.",
  keywords: [
    "ATS",
    "resume checker",
    "ATS score",
    "keyword analysis",
    "resume optimization",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
