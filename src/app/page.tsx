import Anniversary from "@/components/Anniversary";
import EntitiesGrid from "@/components/EntityGrid";
import GetDataFooter from "@/components/GetDataFooter";
import Header from "@/components/Header";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Header />
      <Anniversary />
      <main className="w-full grow pt-34 pb-3 sm:pb-4 md:pb-5 lg:pb-6 xl:pb-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2.5 sm:gap-3.5">
          <Suspense fallback={<div className="min-h-screen"></div>}>
            <EntitiesGrid />
          </Suspense>
        </div>
      </main>
      <GetDataFooter />
    </>
  );
}
