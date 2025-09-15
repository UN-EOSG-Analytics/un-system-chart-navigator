import EntitiesGrid from '@/components/EntitiesGrid';

export default function Home() {
    return (
        <main className="min-h-screen w-full p-4">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
                <h1 className="text-4xl font-bold text-left mt-4">
                    UN System Chart
                </h1>
                <EntitiesGrid />
            </div>
        </main>
    );
}
