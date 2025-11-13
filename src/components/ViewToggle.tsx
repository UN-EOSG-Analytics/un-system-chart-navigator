import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewToggleProps {
  value: "system" | "principal-organ";
  onValueChange: (value: "system" | "principal-organ") => void;
  className?: string;
}

export default function ViewToggle({
  value,
  onValueChange,
  className = "",
}: ViewToggleProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(val) =>
        onValueChange(val as "system" | "principal-organ")
      }
    >
      <TabsList
        className={`grid h-10 w-full grid-cols-2 gap-0.5 border border-gray-200 bg-white sm:w-80 ${className}`}
      >
        <TabsTrigger
          value="system"
          className="rounded-md border border-transparent text-sm text-gray-500 transition-colors hover:text-un-blue data-[state=active]:border-un-blue data-[state=active]:bg-un-blue/10 data-[state=active]:text-un-blue"
        >
          By System Group
        </TabsTrigger>
        <TabsTrigger
          value="principal-organ"
          className="rounded-md border border-transparent text-sm text-gray-500 transition-colors hover:text-un-blue data-[state=active]:border-un-blue data-[state=active]:bg-un-blue/10 data-[state=active]:text-un-blue"
        >
          By Principal Organ
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
