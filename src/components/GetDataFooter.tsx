"use client";

import { Check, Download, FileJson, FileText, Link } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toast } from "./Toast";

export default function DataDownloadBar() {
  const [showDownloadOptions, setShowDownloadOptions] =
    useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);
  const [showDownloadToast, setShowDownloadToast] = useState<boolean>(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string>("");
  const downloadRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        downloadRef.current &&
        !downloadRef.current.contains(event.target as Node)
      ) {
        setShowDownloadOptions(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDownloadOptions(false);
      }
    };

    if (showDownloadOptions) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showDownloadOptions]);

  const handleCopyLink = (format: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFormat(format);
    setShowCopiedToast(true);

    // Reset after animation
    setTimeout(() => {
      setCopiedFormat(null);
    }, 2000);

    setTimeout(() => {
      setShowCopiedToast(false);
    }, 2000);
  };

  const handleDownload = (format: string) => {
    setDownloadedFormat(format);
    setShowDownloadToast(true);

    // Reset after animation
    setTimeout(() => {
      setShowDownloadToast(false);
    }, 2000);
  };

  return (
    <div className="w-full bg-white">
      <div className="w-full max-w-7xl mx-auto py-6 px-3 sm:px-4 lg:px-6">
        <div className="flex items-start gap-2 text-base">
          <p className="text-gray-600">As of October 2025</p>
          <span className="text-gray-400">|</span>
          <div className="relative" ref={downloadRef}>
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="text-un-blue hover:underline font-medium transition-all cursor-pointer flex items-center gap-1.5"
              aria-label="Download entity data in JSON or CSV format"
              aria-expanded={showDownloadOptions}
            >
              Get data
              <Download size={16} />
            </button>
            {showDownloadOptions && (
              <div className="absolute bottom-full -left-1 mb-1 bg-white rounded-lg shadow-lg py-1.5 px-1.5 z-10 min-w-[140px]">
                <div className="flex items-stretch mb-1">
                  <a
                    href="/un-entities.json"
                    download={`${
                      new Date().toISOString().split("T")[0]
                    }_un-entities.json`}
                    onClick={() => handleDownload("JSON")}
                    className="flex items-center gap-2 pl-2 pr-1 py-2 text-sm text-gray-600 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg flex-1"
                    title="Download JSON"
                  >
                    <FileJson size={16} />
                    JSON
                  </a>
                  <button
                    onClick={() =>
                      handleCopyLink(
                        "json",
                        `${window.location.origin}/un-entities.json`
                      )
                    }
                    className="w-8 flex items-center justify-center text-gray-600 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg outline-none focus:outline-none"
                    title="Copy link to JSON"
                    aria-label="Copy link to JSON file"
                  >
                    {copiedFormat === "json" ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Link size={14} />
                    )}
                  </button>
                </div>
                <div className="flex items-stretch">
                  <a
                    href="/un-entities.csv"
                    download={`${
                      new Date().toISOString().split("T")[0]
                    }_un-entities.csv`}
                    onClick={() => handleDownload("CSV")}
                    className="flex items-center gap-2 pl-2 pr-1 py-2 text-sm text-gray-600 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg flex-1"
                    title="Download CSV"
                  >
                    <FileText size={16} />
                    CSV
                  </a>
                  <button
                    onClick={() =>
                      handleCopyLink(
                        "csv",
                        `${window.location.origin}/un-entities.csv`
                      )
                    }
                    className="w-8 flex items-center justify-center text-gray-600 hover:text-un-blue hover:bg-gray-50 transition-all rounded-lg outline-none focus:outline-none"
                    title="Copy link to CSV"
                    aria-label="Copy link to CSV file"
                  >
                    {copiedFormat === "csv" ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Link size={14} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Toast notifications */}
            <Toast message="Link copied to clipboard." show={showCopiedToast} />
            <Toast
              message={`${downloadedFormat} downloaded.`}
              show={showDownloadToast}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
