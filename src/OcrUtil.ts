// ocrUtils.ts
import { GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Tesseract from "tesseract.js";

GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Extract full OCR text from a PDF File.
 */
export async function extractPdfText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const pdfData = await file.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist");
  const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

  let fullText = "";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas, intent: "print" })
      .promise;

    const result = await Tesseract.recognize(canvas, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pageProgress = (i - 1) / pdfDoc.numPages;
          const currentPageProgress = m.progress / pdfDoc.numPages;
          const overallProgress = (pageProgress + currentPageProgress) * 100;
          onProgress?.(Math.round(overallProgress));
        }
      },
    });
    fullText += result.data.text + "\n";
  }

  onProgress?.(100);

  return fullText;
}

/**
 * Check whether specific text exists inside OCR content.
 */
export function checkTextContains(fullText: string, keyword: string): boolean {
  return fullText.toLowerCase().includes(keyword.toLowerCase());
}

function normalizeText(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^\w\s]/g, "") // remove punctuations
    .replace(/\s+/g, " ")
    .trim(); // normalize spaces
}

export function checkApplicantName(
  fullText: string,
  applicantName: string,
): boolean {
  const match = fullText.match(
    /APPLICANT'?S?\s*NAME\s*:?\s*(.+?)(?=\n[A-Z\s]+:|\n|$)/i,
  );
  return (
    !!match && normalizeText(match[1]).includes(normalizeText(applicantName))
  );
}
