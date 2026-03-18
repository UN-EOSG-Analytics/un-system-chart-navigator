"use client";

import { useSearchParams } from "next/navigation";

export default function ContributeForm() {
  const searchParams = useSearchParams();

  const buildAirtableUrl = () => {
    const baseUrl =
      "https://airtable.com/embed/appJtP9H7xvsl3yAN/pagDuSV8RUxFhfO1k/form";
    const params = new URLSearchParams();

    searchParams.forEach((value, key) => {
      if (key.startsWith("prefill_")) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return (
    <div className="fixed inset-0 h-full w-full">
      <iframe
        className="airtable-embed"
        src={buildAirtableUrl()}
        frameBorder="0"
        width="100%"
        height="100%"
        style={{ background: "transparent", border: "none" }}
      />
    </div>
  );
}
