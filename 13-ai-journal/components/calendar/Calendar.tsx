'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  journalDates: string[];
  selectedDate?: string;
  onDateSelect: (date: string) => void;
}

export function Calendar({ journalDates, selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay();

  // Fill in empty cells for days before the month starts
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const journalDateSet = new Set(journalDates);
  const today = format(new Date(), 'yyyy-MM-dd');

  function handlePrevMonth() {
    setCurrentMonth(prev => subMonths(prev, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(prev => addMonths(prev, 1));
  }

  function handleDayClick(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    onDateSelect(dateStr);
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3 className="text-xl font-bold">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h3>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells before month starts */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {daysInMonth.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasJournal = journalDateSet.has(dateStr);
          const isToday = dateStr === today;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square p-2 rounded-lg text-sm transition-colors
                ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${!isSelected && hasJournal ? 'bg-blue-100 hover:bg-blue-200' : ''}
                ${!isSelected && !hasJournal ? 'hover:bg-gray-100' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{format(day, 'd')}</span>
                {hasJournal && !isSelected && (
                  <span className="text-xs">📔</span>
                )}
                {isToday && (
                  <span className="text-xs">★</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
