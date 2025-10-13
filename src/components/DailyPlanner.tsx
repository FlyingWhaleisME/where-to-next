// ADVANCED TECHNIQUE 48: COMPLEX COMPONENT INTERFACE WITH OPTIONAL PROPERTIES
// TypeScript interface with optional properties and callback functions for data flow
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeSlot } from '../types';

interface DailyPlannerProps {
  startDate: string;
  endDate: string;
  accommodationOptions: string[];
  mealOptions: string[];
  activityOptions: string[];
  planningStyle: number;
  onTimeSlotUpdate: (timeSlots: TimeSlot[]) => void; // Callback function for parent communication
  readOnly?: boolean; // Optional property for shared document mode
  initialTimeSlots?: TimeSlot[]; // Optional property for data persistence
}

// TimeSlot interface is imported from '../types'

interface DayData {
  date: string;
  timeSlots: TimeSlot[];
}

interface TimePickerModal {
  isOpen: boolean;
  hour: number;
  type: string;
  option: string;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({
  startDate,
  endDate,
  accommodationOptions,
  mealOptions,
  activityOptions,
  planningStyle,
  onTimeSlotUpdate,
  readOnly = false,
  initialTimeSlots = []
}) => {
  const [currentDate, setCurrentDate] = useState<string>(startDate);
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [draggedItem, setDraggedItem] = useState<{type: string, option: string} | null>(null);
  const [timePickerModal, setTimePickerModal] = useState<TimePickerModal>({
    isOpen: false,
    hour: 9,
    type: '',
    option: ''
  });
  const [customTimes, setCustomTimes] = useState<{startTime: string, endTime: string}>({
    startTime: '09:00',
    endTime: '10:00'
  });
  const [hasTimeConflict, setHasTimeConflict] = useState<boolean>(false);

  // ADVANCED TECHNIQUE 49: DATE RANGE GENERATION WITH ITERATIVE ALGORITHM
  // Complex date manipulation and iteration to generate day-by-day data structures
  useEffect(() => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: DayData[] = [];
    
    // ADVANCED TECHNIQUE 50: DATE ITERATION WITH MUTATION AND ISO STRING PARSING
    // Loop through date range with date mutation and ISO string extraction
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayDate = d.toISOString().split('T')[0];
      
      // For now, we'll initialize with empty time slots
      // The initialTimeSlots will be handled separately
      const dayTimeSlots: TimeSlot[] = [];
      
      days.push({
        date: dayDate,
        timeSlots: dayTimeSlots
      });
    }
    
    setDaysData(days);
    setCurrentDate(startDate);
  }, [startDate, endDate]);

  // ADVANCED TECHNIQUE 51: DATA GROUPING AND MERGING WITH FUNCTIONAL PROGRAMMING
  // Complex data transformation using reduce, map, and spread operators for state updates
  useEffect(() => {
    if (initialTimeSlots.length > 0 && daysData.length > 0) {
      // ADVANCED TECHNIQUE 52: OBJECT GROUPING WITH DYNAMIC KEY CREATION
      // Group time slots by date using dynamic object keys and array accumulation
      const slotsByDate: { [date: string]: TimeSlot[] } = {};
      initialTimeSlots.forEach(slot => {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }
        slotsByDate[slot.date].push(slot);
      });

      // ADVANCED TECHNIQUE 53: FUNCTIONAL STATE UPDATE WITH SPREAD OPERATORS
      // Complex state update using functional setState with map and spread operators
      setDaysData(prevDays => {
        return prevDays.map(day => ({
          ...day,
          timeSlots: slotsByDate[day.date] || []
        }));
      });
    }
  }, [initialTimeSlots, daysData.length]);

  // Get current day data
  const currentDayData = daysData.find(day => day.date === currentDate);

  // Helper function to collect all time slots from all days
  const getAllTimeSlots = () => {
    return daysData.flatMap(day => day.timeSlots);
  };

  // Check for time conflicts when times change
  useEffect(() => {
    if (timePickerModal.isOpen && customTimes.startTime && customTimes.endTime) {
      const hasConflict = checkForOverlaps(customTimes.startTime, customTimes.endTime);
      setHasTimeConflict(hasConflict);
    }
  }, [customTimes, timePickerModal.isOpen, currentDayData]);

  // Generate hourly slots (6 AM to 11 PM)
  const hourlySlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return {
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      label: hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`
    };
  });

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const currentIndex = daysData.findIndex(day => day.date === currentDate);
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentDate(daysData[currentIndex - 1].date);
    } else if (direction === 'next' && currentIndex < daysData.length - 1) {
      setCurrentDate(daysData[currentIndex + 1].date);
    }
  };

  const handleDragStart = (type: string, option: string) => {
    setDraggedItem({ type, option });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // Set default times based on the hour
    const defaultStartTime = `${hour.toString().padStart(2, '0')}:00`;
    const defaultEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    setCustomTimes({
      startTime: defaultStartTime,
      endTime: defaultEndTime
    });

    setTimePickerModal({
      isOpen: true,
      hour,
      type: draggedItem.type,
      option: draggedItem.option
    });

    setDraggedItem(null);
  };

  const handleDeleteTimeSlot = (slotId: string) => {
    const updatedDays = daysData.map(day => {
      if (day.date === currentDate) {
        return {
          ...day,
          timeSlots: day.timeSlots.filter(slot => slot.id !== slotId)
        };
      }
      return day;
    });

    setDaysData(updatedDays);
    
    // Get updated days data to pass all time slots
    const updatedDaysData = updatedDays.map(day => 
      day.date === currentDate ? { ...day, timeSlots: updatedDays.find(d => d.date === currentDate)?.timeSlots || [] } : day
    );
    onTimeSlotUpdate(updatedDaysData.flatMap(day => day.timeSlots));
  };

  const handleConfirmTimeSlot = () => {
    if (!timePickerModal.isOpen || !customTimes.startTime || !customTimes.endTime) return;

    // Validate that end time is after start time
    if (customTimes.startTime >= customTimes.endTime) {
      alert('End time must be after start time');
      return;
    }

    // Check for overlaps with existing time slots
    const hasOverlap = checkForOverlaps(customTimes.startTime, customTimes.endTime);
    if (hasOverlap) {
      alert('This time slot overlaps with an existing activity. Please choose a different time.');
      return;
    }

    // Calculate duration from start and end time
    const startMinutes = parseInt(customTimes.startTime.split(':')[0]) * 60 + parseInt(customTimes.startTime.split(':')[1]);
    const endMinutes = parseInt(customTimes.endTime.split(':')[0]) * 60 + parseInt(customTimes.endTime.split(':')[1]);
    const durationMinutes = endMinutes - startMinutes;
    const durationHours = Math.floor(durationMinutes / 60);
    const durationMins = durationMinutes % 60;
    const durationString = durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`;

    const newTimeSlot: TimeSlot = {
      id: `${Date.now()}-${Math.random()}`,
      date: currentDate,
      startTime: customTimes.startTime,
      duration: durationString,
      activity: timePickerModal.option,
      description: `${timePickerModal.option} from ${customTimes.startTime} to ${customTimes.endTime}`,
      type: timePickerModal.type as 'accommodation' | 'meal' | 'activity'
    };

    // Update current day's time slots
    const updatedDays = daysData.map(day => {
      if (day.date === currentDate) {
        return {
          ...day,
          timeSlots: [...day.timeSlots, newTimeSlot]
        };
      }
      return day;
    });

    setDaysData(updatedDays);
    
    // Get updated days data to pass all time slots
    const updatedDaysData = updatedDays.map(day => 
      day.date === currentDate ? { ...day, timeSlots: updatedDays.find(d => d.date === currentDate)?.timeSlots || [] } : day
    );
    onTimeSlotUpdate(updatedDaysData.flatMap(day => day.timeSlots));
    
    // Close modal
    setTimePickerModal({
      isOpen: false,
      hour: 9,
      type: '',
      option: ''
    });
  };

  const checkForOverlaps = (startTime: string, endTime: string): boolean => {
    if (!currentDayData?.timeSlots) return false;

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    return currentDayData.timeSlots.some(existingSlot => {
      const existingStart = timeToMinutes(existingSlot.startTime);
      // Calculate end time from start time and duration
      const existingEnd = existingStart + durationToMinutes(existingSlot.duration);

      // Check if the new time slot overlaps with any existing slot
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const durationToMinutes = (durationString: string): number => {
    // Parse duration string like "2h 30m" or "45m"
    const match = durationString.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    return hours * 60 + minutes;
  };

  const handleCancelTimeSlot = () => {
    setTimePickerModal({
      isOpen: false,
      hour: 9,
      type: '',
      option: ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear()
    };
  };

  const currentDateFormatted = formatDate(currentDate);

  // Check if user can delete time slots (Very Organized planning style)
  const canDeleteTimeSlots = planningStyle > 75;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header with date navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => handleDateNavigation('prev')}
          disabled={daysData.findIndex(day => day.date === currentDate) === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {currentDateFormatted.month} {currentDateFormatted.date}, {currentDateFormatted.year}
          </div>
          <div className="text-sm text-gray-500">
            {currentDateFormatted.day} {currentDateFormatted.date}
          </div>
        </div>

        <button
          onClick={() => handleDateNavigation('next')}
          disabled={daysData.findIndex(day => day.date === currentDate) === daysData.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Draggable Options */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {readOnly ? 'Available Options (View Only)' : 'Drag options to time slots:'}
          </h3>
          {readOnly && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full border border-yellow-200">
              👁️ View Only
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* Accommodation Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">🏨 Accommodation</h4>
            {accommodationOptions.map((option, index) => (
              <div
                key={`accommodation-${index}`}
                draggable={!readOnly}
                onDragStart={readOnly ? undefined : () => handleDragStart('accommodation', option)}
                className={`p-2 bg-blue-50 border border-blue-200 rounded-lg transition-colors ${
                  readOnly ? 'cursor-default opacity-60' : 'cursor-move hover:bg-blue-100'
                }`}
              >
                <span className="text-sm text-blue-800">{option}</span>
              </div>
            ))}
          </div>

          {/* Meal Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">🍽️ Meals</h4>
            {mealOptions.map((option, index) => (
              <div
                key={`meal-${index}`}
                draggable={!readOnly}
                onDragStart={readOnly ? undefined : () => handleDragStart('meal', option)}
                className={`p-2 bg-green-50 border border-green-200 rounded-lg transition-colors ${
                  readOnly ? 'cursor-default opacity-60' : 'cursor-move hover:bg-green-100'
                }`}
              >
                <span className="text-sm text-green-800">{option}</span>
              </div>
            ))}
          </div>

          {/* Activity Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">🎯 Activities</h4>
            {activityOptions.map((option, index) => (
              <div
                key={`activity-${index}`}
                draggable={!readOnly}
                onDragStart={readOnly ? undefined : () => handleDragStart('activity', option)}
                className={`p-2 bg-purple-50 border border-purple-200 rounded-lg transition-colors ${
                  readOnly ? 'cursor-default opacity-60' : 'cursor-move hover:bg-purple-100'
                }`}
              >
                <span className="text-sm text-purple-800">{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Schedule Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-2" style={{ gridTemplateColumns: '80px 1fr' }}>
          {/* Time Labels */}
          <div className="bg-gray-50">
            {hourlySlots.map((slot) => (
              <div
                key={slot.hour}
                className="h-16 border-b border-gray-200 flex items-center justify-center text-sm text-gray-600"
              >
                {slot.label}
              </div>
            ))}
          </div>

          {/* Schedule Area */}
          <div className="relative">
            {hourlySlots.map((slot) => (
              <div
                key={slot.hour}
                className={`h-16 border-b border-gray-200 relative transition-colors ${
                  readOnly ? '' : 'hover:bg-gray-50'
                }`}
                onDragOver={readOnly ? undefined : handleDragOver}
                onDrop={readOnly ? undefined : (e) => handleDrop(e, slot.hour)}
              >
                {/* Existing time slots */}
                {currentDayData?.timeSlots
                  .filter(timeSlot => {
                    const slotHour = parseInt(timeSlot.startTime.split(':')[0]);
                    return slotHour === slot.hour;
                  })
                  .map((timeSlot) => {
                    // Calculate position and height based on start time and duration
                    const startMinutes = parseInt(timeSlot.startTime.split(':')[1]);
                    const startHour = parseInt(timeSlot.startTime.split(':')[0]);
                    const durationInMinutes = durationToMinutes(timeSlot.duration);
                    const startTimeInMinutes = startHour * 60 + startMinutes;
                    const endTimeInMinutes = startTimeInMinutes + durationInMinutes;
                    const endHour = Math.floor(endTimeInMinutes / 60);
                    const endMinutes = endTimeInMinutes % 60;
                    
                    // Calculate position within the hour slot
                    const topPosition = (startMinutes / 60) * 100;
                    const durationInHours = (endHour - startHour) + (endMinutes - startMinutes) / 60;
                    const height = Math.max((durationInHours / 1) * 100, 20); // Minimum 20% height
                    
                    return (
                      <motion.div
                        key={timeSlot.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute rounded-lg p-2 text-xs font-medium ${
                          (timeSlot as any).type === 'accommodation' ? 'bg-blue-50 border-2 border-blue-400 text-blue-800' :
                          (timeSlot as any).type === 'meal' ? 'bg-green-50 border-2 border-green-400 text-green-800' :
                          'bg-purple-50 border-2 border-purple-400 text-purple-800'
                        }`}
                        style={{
                          top: `${topPosition}%`,
                          height: `${height}%`,
                          left: '4px',
                          right: '4px',
                          zIndex: 10
                        }}
                      >
                        <div className="truncate flex items-center gap-1">
                          <span>
                            {(timeSlot as any).type === 'accommodation' ? '🏨' :
                             (timeSlot as any).type === 'meal' ? '🍽️' : '🎯'}
                          </span>
                          {timeSlot.activity}
                        </div>
                        <div className="text-xs opacity-90">
                          {timeSlot.startTime} ({timeSlot.duration})
                        </div>
                        {canDeleteTimeSlots && !readOnly && (
                          <button
                            onClick={() => handleDeleteTimeSlot(timeSlot.id)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planning Style Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          {planningStyle <= 25 ? (
            "Lazy Planning: Drag options to create spontaneous time slots as needed."
          ) : planningStyle > 75 ? (
            "Very Organized: You can delete time slots and rearrange options for unexpected situations."
          ) : (
            "Balanced/Organized: Drag options to plan your day with flexibility."
          )}
        </p>
      </div>

      {/* Time Picker Modal */}
      {timePickerModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Set Activity Duration
            </h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Activity:</span> {timePickerModal.option}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Type:</span> {timePickerModal.type}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={customTimes.startTime}
                  onChange={(e) => setCustomTimes(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                    hasTimeConflict 
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={customTimes.endTime}
                  onChange={(e) => setCustomTimes(prev => ({ ...prev, endTime: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                    hasTimeConflict 
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Conflict Warning */}
              {hasTimeConflict && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-700 font-medium">
                      Time conflict detected! This overlaps with an existing activity.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelTimeSlot}
                disabled={readOnly}
                className={`px-4 py-2 transition-colors ${
                  readOnly ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTimeSlot}
                disabled={readOnly || !customTimes.startTime || !customTimes.endTime || customTimes.startTime >= customTimes.endTime || hasTimeConflict}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DailyPlanner;
