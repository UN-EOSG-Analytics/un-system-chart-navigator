import ContributeForm from "@/components/ContributeForm";
import { featureFlags } from "@/lib/constants";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function ContributePage() {
  if (!featureFlags.contribute) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex h-full w-full items-center justify-center">
          <div className="text-gray-500">Loading form...</div>
        </div>
      }
    >
      <ContributeForm />
    </Suspense>
  );
}
