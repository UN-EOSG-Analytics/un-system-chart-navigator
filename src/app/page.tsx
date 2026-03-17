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
      <main className="w-full grow pt-2 pb-3 sm:pt-2 sm:pb-4 md:pt-3 md:pb-5 lg:pt-4 lg:pb-6 xl:pt-5 xl:pb-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-2.5">
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
