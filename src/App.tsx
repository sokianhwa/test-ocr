import React, { useState } from "react";
import {
  checkApplicantName,
  checkTextContains,
  extractPdfText,
} from "./OcrUtil";
import Timer from "./timer";

function PdfOcrChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [scannedText, setScannedText] = useState("");
  const [isValidName, setIsValidName] = useState(false);
  const [found, setFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTimer, setStartTimer] = useState(false);
  const [progress, setProgress] = useState(0);

  const specificWord = "Appendix 1A";
  const applicantName = "azam jaya";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setScannedText("");
      setFound(false);
      setProgress(0);
    }
  };

  const handleCheck = async () => {
    if (!file) return;
    setLoading(true);
    setStartTimer(true);

    const extractedText = await extractPdfText(file, (percent) => {
      setProgress(percent);
    });
    setScannedText(extractedText);

    const result = checkTextContains(extractedText, specificWord);
    setFound(result);

    const isValid = checkApplicantName(
      extractedText /*"Applicant's Name: King? Solution.",*/,
      applicantName,
    );
    setIsValidName(isValid);

    setStartTimer(false);
    setLoading(false);
  };

  return (
    <div
      style={{
        width: "100%",
        gap: "20px",
      }}
    >
      <h3>PDF OCR Word Checker</h3>
      <p>Time used: </p>
      <Timer shouldStart={startTimer} />
      <p>
        Words to find: <strong>{specificWord}</strong>
        <br />
        Name to check: <strong>{applicantName}</strong>
      </p>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      <button onClick={handleCheck} disabled={loading}>
        {loading ? "Processing..." : "Check PDF"}
      </button>
      {loading && (
        <>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="progress-text">OCR Processing... {progress}%</div>
        </>
      )}

      {scannedText && (
        <>
          <hr />
          <h4>OCR Result:</h4>
          <p>
            Word <strong>{specificWord}</strong>{" "}
            {found ? "found ✅" : "not found ❌"} <br />
            Name <strong>{applicantName}</strong>{" "}
            {isValidName ? "valid ✅" : "not valid ❌"}
          </p>
          <p>Scanned Text:</p>
          <textarea>{scannedText}</textarea>
        </>
      )}
    </div>
  );
}

export default PdfOcrChecker;
