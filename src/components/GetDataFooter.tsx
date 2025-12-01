"use client";

import { footnoteDefinitions } from "@/lib/constants";
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
    <div className="w-full bg-white p-3 sm:p-4 lg:p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-start gap-2 text-base">
          <p className="text-gray-600">As of November 2025</p>
          <span className="text-gray-400">|</span>
          <div className="relative" ref={downloadRef}>
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="flex cursor-pointer items-center gap-1.5 font-medium text-un-blue transition-all hover:underline"
              aria-label="Download entity data in JSON or CSV format"
              aria-expanded={showDownloadOptions}
            >
              Get data
              <Download size={16} />
            </button>
            {showDownloadOptions && (
              <div className="absolute bottom-full -left-1 z-10 mb-1 min-w-[140px] rounded-lg bg-white px-1.5 py-1.5 shadow-lg">
                <div className="mb-1 flex items-stretch">
                  <a
                    href="/un-entities.json"
                    download={`${
                      new Date().toISOString().split("T")[0]
                    }_un-entities.json`}
                    onClick={() => handleDownload("JSON")}
                    className="flex flex-1 items-center gap-2 rounded-lg py-2 pr-1 pl-2 text-sm text-gray-600 transition-all hover:bg-gray-50 hover:text-un-blue"
                    title="Download JSON"
                  >
                    <FileJson size={16} />
                    JSON
                  </a>
                  <button
                    onClick={() =>
                      handleCopyLink(
                        "json",
                        `${window.location.origin}/un-entities.json`,
                      )
                    }
                    className="flex w-8 items-center justify-center rounded-lg text-gray-600 transition-all outline-none hover:bg-gray-50 hover:text-un-blue focus:outline-none"
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
                    className="flex flex-1 items-center gap-2 rounded-lg py-2 pr-1 pl-2 text-sm text-gray-600 transition-all hover:bg-gray-50 hover:text-un-blue"
                    title="Download CSV"
                  >
                    <FileText size={16} />
                    CSV
                  </a>
                  <button
                    onClick={() =>
                      handleCopyLink(
                        "csv",
                        `${window.location.origin}/un-entities.csv`,
                      )
                    }
                    className="flex w-8 items-center justify-center rounded-lg text-gray-600 transition-all outline-none hover:bg-gray-50 hover:text-un-blue focus:outline-none"
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
        <p className="mt-2 text-sm leading-tight text-gray-500">
          This Chart is intended to provide a graphical reflection of the
          functional organization of the United Nations system and is for
          informational purposes only. The relevant rules of the organization
          concerned should be consulted in order to establish the legal status,
          functions and reporting lines of each entity shown in this Chart. The
          Chart does not include all offices or entities of the United Nations
          system.
        </p>
        <div className="mt-3 border-t border-gray-200 pt-3">
          <h3 className="mb-1 text-xs font-semibold text-gray-600">Notes:</h3>
          <div className="max-w-5xl space-y-0.5 text-sm leading-tight text-gray-500">
            {Object.entries(footnoteDefinitions)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([num, text]) => (
                <div
                  key={num}
                  className="flex text-xs leading-snug text-gray-500"
                >
                  <strong className="w-3 flex-shrink-0 font-semibold">
                    {num}
                  </strong>
                  <span className="flex-1">{text}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
