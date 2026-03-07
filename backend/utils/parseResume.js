const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Parse resume file buffer based on mimetype
 * Supports: PDF, DOCX, TXT
 */
async function parseResume(buffer, mimetype, originalname) {
  try {
    if (mimetype === "application/pdf") {
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    if (mimetype === "text/plain" || originalname.endsWith(".txt")) {
      return buffer.toString("utf-8");
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
  } catch (err) {
    console.error("Resume parsing error:", err.message);
    throw new Error(`Failed to parse resume: ${err.message}`);
  }
}

module.exports = { parseResume };
