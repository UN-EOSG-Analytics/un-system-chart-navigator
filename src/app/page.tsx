"use client";

import EntitiesGrid from "@/components/EntitiesGrid";
import Footer from "@/components/Footer";
import GetDataFooter from "@/components/GetDataFooter";
import Header from "@/components/Header";
import ExplainerText from "@/components/ExplainerText";
import { Suspense, useRef } from "react";

export default function Home() {
  const entitiesGridRef = useRef<{
    handleReset: () => void;
    toggleGroup: (groupKey: string) => void;
  }>(null);

  const handleTitleClick = () => {
    entitiesGridRef.current?.handleReset();
  };

  return (
    <>
      <main className="w-full flex-grow py-3 sm:py-4 md:py-6 lg:py-8 xl:py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-3 sm:mt-2">
            <Header onTitleClick={handleTitleClick} />
            <ExplainerText />
          </div>
          <Suspense fallback={<div className="min-h-screen"></div>}>
            <EntitiesGrid ref={entitiesGridRef} />
          </Suspense>
        </div>
      </main>
      <GetDataFooter />
      <Footer />
    </>
  );
}
