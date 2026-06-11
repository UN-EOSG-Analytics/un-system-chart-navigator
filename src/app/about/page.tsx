import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the UN System Chart Navigator — its purpose and the context of UN system reform under the UN80 Initiative.",
};

export default function AboutPage() {
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
        About
      </h1>
      <p className="mb-10 text-base text-slate-500">
        What this navigator is and why it exists.
      </p>

      <div className="space-y-10 text-slate-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Purpose
          </h2>
          <p className="leading-relaxed">
            The UN System Chart Navigator is an interactive way to explore the
            entities that make up the United Nations system — their place within
            the principal organs and how they relate to one
            another. It is designed to make a complex landscape easier to
            understand for delegates, staff, researchers, and the public.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Context</h2>
          <p className="mb-4 leading-relaxed">
            As part of the UN80 Initiative to build a more efficient and
            effective Organization, the General Assembly adopted resolution{" "}
            <a
              href="https://docs.un.org/A/RES/80/251"
              target="_blank"
              rel="noopener noreferrer"
              className="text-un-blue hover:underline"
            >
              A/RES/80/251
            </a>{" "}
            on 31 March 2026. It requests the development of &ldquo;digital tools
            and portals … to support a system-wide perspective and enhance
            coherence across the United Nations system.&rdquo;
          </p>
          <p className="leading-relaxed">
            This navigator is offered in that spirit: a clear, navigable view of
            the UN system to help users see how its many parts fit together.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Learn more
          </h2>
          <p className="leading-relaxed">
            For details on how entity data is sourced and classified, see the{" "}
            <Link href="/methodology" className="text-un-blue hover:underline">
              Methodology
            </Link>{" "}
            page. To report an error or omission, you are welcome to{" "}
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
