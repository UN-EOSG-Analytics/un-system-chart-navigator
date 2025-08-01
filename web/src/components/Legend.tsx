interface LegendProps {
  groupStyles: Record<string, { bgColor: string; textColor: string; order: number; label: string }>;
}

export default function Legend({ groupStyles }: LegendProps) {
  return (
    <div className="mb-10 mt-6 pb-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl">
        {Object.entries(groupStyles).map(([group, styles]) => (
          <div key={group} className="flex items-center gap-3 p-2">
            <div className={`${styles.bgColor} w-5 h-5 rounded flex-shrink-0`}></div>
            <span className="text-base font-medium">{styles.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
