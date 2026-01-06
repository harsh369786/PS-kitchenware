'use client';

import * as React from 'react';
import { format, subDays } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
    value?: DateRange;
    onChange: (date: DateRange | undefined) => void;
    className?: string;
}

export function DateRangePicker({ value, onChange, className }: Props) {
    const [open, setOpen] = React.useState(false);
    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(value);

    const presets = [
        { label: 'Last 7 days', value: { from: subDays(new Date(), 6), to: new Date() } },
        { label: 'Last 30 days', value: { from: subDays(new Date(), 29), to: new Date() } },
        { label: 'Last 90 days', value: { from: subDays(new Date(), 89), to: new Date() } },
    ];

    React.useEffect(() => {
        if (open) setTempDate(value);
    }, [open, value]);

    const handlePresetClick = (presetValue: DateRange) => {
        setTempDate(presetValue);
        onChange(presetValue);
        setOpen(false);
    };

    const handleApply = () => {
        onChange(tempDate);
        setOpen(false);
    };

    const handleClear = () => {
        setTempDate(undefined);
        onChange(undefined);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                        {value?.from ? (
                            value.to ? (
                                `${format(value.from, 'MMM dd')} - ${format(value.to, 'MMM dd, y')}`
                            ) : (
                                format(value.from, 'MMM dd, y')
                            )
                        ) : (
                            'Pick date range'
                        )}
                    </span>
                    {value && (
                        <X
                            className="ml-auto h-4 w-4 flex-shrink-0 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" sideOffset={4}>
                <div className="flex">
                    {/* Presets Sidebar */}
                    <div className="border-r bg-muted/50 p-2 w-[130px]">
                        <p className="text-xs font-medium mb-2 px-2">Quick Select</p>
                        <div className="space-y-1">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs h-8"
                                    onClick={() => handlePresetClick(preset.value)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="p-3">
                        <Calendar
                            mode="range"
                            selected={tempDate}
                            onSelect={setTempDate}
                            numberOfMonths={1}
                            defaultMonth={tempDate?.from || new Date()}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-3 border-t mt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleApply}
                                disabled={!tempDate?.from}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
