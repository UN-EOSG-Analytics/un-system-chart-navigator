import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the UN System Chart Navigator is built — data sources, classification criteria, and editorial decisions.",
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-24 pb-16 sm:px-6">
      <div className="mb-10">
        <Link
          href="/"
          className="text-sm font-medium text-un-blue hover:underline"
        >
          ← Back to Chart
        </Link>
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-950">
        Methodology
      </h1>
      <p className="mb-10 text-base text-slate-500">
        How the UN System Chart Navigator is built and maintained.
      </p>

      <div className="space-y-10 text-slate-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Data Sources
          </h2>
          <p className="mb-4 leading-relaxed">
            Entity data is compiled from a set of official United Nations
            sources and updated periodically to reflect changes in the UN
            system, including new entities, leadership changes, and
            reorganizations.
          </p>
          <ul className="space-y-2">
            {[
              {
                label: "UN System page",
                href: "https://www.un.org/en/about-us/un-system",
              },
              {
                label: "Leadership by entity",
                href: "https://www.un.org/sg/en/content/global-leadership",
              },
              {
                label: "UN System Chart PDF",
                href: "https://www.un.org/en/delegate/page/un-system-chart",
              },
              {
                label: "Proposed programme budget 2026",
                href: "https://www.un.org/en/ga/fifth/80/ppb2026.shtml",
              },
              {
                label: "United Nations Peace Operations",
                href: "https://www.unmissions.org/en",
              },
            ].map(({ label, href }) => (
              <li key={href} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-un-blue hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Classification
          </h2>
          <p className="leading-relaxed">
            Entities are organized by their relationship to one or more of the
            six{" "}
            <a
              href="https://www.un.org/en/about-us/main-bodies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-un-blue hover:underline"
            >
              principal organs
            </a>{" "}
            of the United Nations — the General Assembly, Security Council,
            Economic and Social Council, Trusteeship Council, International
            Court of Justice, and Secretariat. Within each organ, entities are
            grouped by category and subcategory as they appear on the official
            chart, in the programme budget, or on existing Secretariat websites.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Scope &amp; Limitations
          </h2>
          <p className="leading-relaxed">
            This navigator is intended for informational and exploratory
            purposes only. It is not an authoritative or exhaustive listing of
            all United Nations bodies and entities. Entity details, links, and
            classifications reflect the best available information at the time
            of the most recent data update.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Updates</h2>
          <p className="leading-relaxed">
            Data is reviewed and updated periodically. If you notice an error or
            omission, you are welcome to{" "}
            <a
              href="mailto:support@eosg.dev"
              className="text-un-blue hover:underline"
            >
              get in touch
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
