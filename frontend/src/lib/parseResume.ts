/**
 * Parse a resume File object and extract text content.
 * Uses dynamic imports to avoid SSR issues — these libraries
 * only load when actually called in the browser.
 * Supports: PDF, DOCX, TXT
 */
export async function parseResume(file: File): Promise<string> {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return parsePDF(file);
  }

  if (
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return parseDOCX(file);
  }

  if (type === "text/plain" || name.endsWith(".txt")) {
    return parseTXT(file);
  }

  throw new Error(`Unsupported file type: ${type || name}`);
}

async function parsePDF(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  // Disable the web worker — runs on main thread instead.
  // This avoids all CDN/worker fetch issues.
  pdfjs.GlobalWorkerOptions.workerSrc = "";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}

async function parseDOCX(file: File): Promise<string> {
  const mammoth = (await import("mammoth")).default;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}

async function parseTXT(file: File): Promise<string> {
  return file.text();
}
