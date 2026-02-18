"use client";

import Anniversary from "@/components/Anniversary";
import EntitiesGrid from "@/components/EntityGrid";
import ExplainerText from "@/components/ExplainerText";
import GetDataFooter from "@/components/GetDataFooter";
import Header from "@/components/Header";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Anniversary />
      <main className="w-full grow pt-2 pb-3 sm:pt-3 sm:pb-4 md:pt-4 md:pb-6 lg:pt-5 lg:pb-8 xl:pt-6 xl:pb-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-3">
            <Header />
            <ExplainerText />
          </div>
          <Suspense fallback={<div className="min-h-screen"></div>}>
            <EntitiesGrid />
          </Suspense>
        </div>
      </main>
      <GetDataFooter />
    </>
  );
}
