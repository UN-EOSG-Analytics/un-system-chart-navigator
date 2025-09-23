import EntitiesGrid from '@/components/EntitiesGrid';

export default function Home() {
    return (
        <main className="min-h-screen w-full p-4">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
                <h1 className="text-4xl font-bold text-left mt-4">
                    UN System Chart
                    <sup className="text-lg text-gray-500 font-normal ml-1.5">alpha</sup>
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed -mt-2">
                    Interactive overview of United Nations System entities. For informational purposes only and subject to official review. You can find the print version <a href="https://www.un.org/en/delegate/page/un-system-chart" target="_blank" rel="noopener noreferrer" className="text-un-blue hover:font-bold underline">here</a>.
                </p>
                <EntitiesGrid />
            </div>
        </main>
    );
}
