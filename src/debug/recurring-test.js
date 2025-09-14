// Test script để debug vấn đề recurring events

const testRecurringLogic = () => {
  console.log('=== TESTING RECURRING LOGIC ===');
  
  // Giả lập event với repeat_end_date là 15/09/2025
  const testEvent = {
    _id: 'test-event',
    title: 'Test Event',
    start_time: new Date('2025-09-13T10:00:00'),
    end_time: new Date('2025-09-13T11:00:00'),
    repeat_type: 'daily',
    repeat_interval: 1,
    repeat_end_type: 'on',
    repeat_end_date: new Date('2025-09-15T23:59:59'), // Kết thúc vào 15/09
    exclusion_dates: []
  };
  
  console.log('Test event:', testEvent);
  console.log('Start date:', testEvent.start_time.toISOString().split('T')[0]);
  console.log('End date:', testEvent.repeat_end_date.toISOString().split('T')[0]);
  
  // Giả lập logic generateRecurringInstances
  const instances = [];
  let currentDate = new Date(testEvent.start_time);
  let occurrenceCount = 0;
  const maxOccurrences = 50;
  
  // Bắt đầu từ ngày tiếp theo
  currentDate.setDate(currentDate.getDate() + 1);
  
  while (occurrenceCount < maxOccurrences) {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const repeatEndDateStr = testEvent.repeat_end_date.toISOString().split('T')[0];
    
    console.log(`Instance ${occurrenceCount + 1}:`, {
      currentDate: currentDateStr,
      repeatEndDate: repeatEndDateStr,
      shouldStop: currentDateStr > repeatEndDateStr
    });
    
    if (currentDateStr > repeatEndDateStr) {
      console.log('Stopping - reached end date');
      break;
    }
    
    instances.push({
      date: currentDateStr,
      instance: occurrenceCount + 1
    });
    
    occurrenceCount++;
    currentDate.setDate(currentDate.getDate() + 1); // Daily increment
  }
  
  console.log('Generated instances:', instances);
  console.log('Total instances:', instances.length);
  
  return instances;
};

// Chạy test
if (typeof window !== 'undefined') {
  window.testRecurringLogic = testRecurringLogic;
  console.log('Test function available as window.testRecurringLogic()');
} else {
  testRecurringLogic();
}