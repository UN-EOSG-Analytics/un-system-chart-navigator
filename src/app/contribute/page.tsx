import ContributeForm from "@/components/ContributeForm";
import { featureFlags } from "@/lib/constants";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
