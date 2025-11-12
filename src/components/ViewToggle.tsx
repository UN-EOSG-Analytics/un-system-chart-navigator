import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ViewToggleProps {
    value: 'system' | 'principal-organ';
    onValueChange: (value: 'system' | 'principal-organ') => void;
    className?: string;
}

export default function ViewToggle({ value, onValueChange, className = '' }: ViewToggleProps) {
    return (
        <Tabs value={value} onValueChange={(val) => onValueChange(val as 'system' | 'principal-organ')}>
            <TabsList className={`grid w-full sm:w-80 grid-cols-2 gap-0.5 bg-white border border-gray-200 h-10 ${className}`}>
                <TabsTrigger
                    value="system"
                    className="data-[state=active]:bg-un-blue/10 data-[state=active]:text-un-blue data-[state=active]:border-un-blue text-sm text-gray-500 border border-transparent rounded-md transition-colors hover:text-un-blue"
                >
                    By System Group
                </TabsTrigger>
                <TabsTrigger
                    value="principal-organ"
                    className="data-[state=active]:bg-un-blue/10 data-[state=active]:text-un-blue data-[state=active]:border-un-blue text-sm text-gray-500 border border-transparent rounded-md transition-colors hover:text-un-blue"
                >
                    By Principal Organ
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
