/**
 * GUIDE: TimePickerInput Component
 * ================================
 * 
 * Component này được tạo để thay thế TimePickerDropdown cũ
 * với khả năng nhập trực tiếp giá trị thời gian và filter dropdown theo input.
 * 
 * TÍNH NĂNG CHÍNH:
 * ================
 * 1. ✅ Nhập trực tiếp: Người dùng có thể gõ giá trị thời gian (vd: 4:30, 14:30, 4:30pm)
 * 2. ✅ Dropdown tự động filter: Khi gõ, dropdown tự động lọc danh sách thời gian
 * 3. ✅ Tính toán duration: Hiển thị thời lượng giữa start time và end time
 * 4. ✅ Gợi ý smart: Highlight thời gian 1 giờ (default duration)
 * 5. ✅ Chạy search luôn: Tự động trigger event khi chọn thời gian
 * 6. ✅ Hỗ trợ 24h và 12h format
 * 
 * CÁCH SỬ DỤNG:
 * ==============
 * 
 * Basic usage:
 * -----------
 * <TimePickerInput
 *   selectedTime="14:30"
 *   onTimeSelect={(time) => console.log(time)}
 *   placeholder="HH:mm"
 * />
 * 
 * 
 * Với end time picker (hiển thị duration):
 * ----------------------------------------
 * <TimePickerInput
 *   selectedTime="15:30"
 *   onTimeSelect={(time) => setEndTime(time)}
 *   label="End Time"
 *   format24h={true}
 *   startTime="14:30"
 *   isEndTime={true}
 * />
 * 
 * Điều này sẽ:
 * - Nhập direct value vào input
 * - Dropdown auto-filter khi gõ
 * - Hiển thị duration dưới input (1 hr, 30 mins, etc.)
 * - Highlight thời gian 1 giờ sau start time
 * - Trigger onTimeSelect ngay khi blur input hoặc Enter
 * 
 * 
 * PROPS:
 * ======
 * interface TimePickerInputProps {
 *   selectedTime?: string;        // Giá trị hiện tại (HH:mm hoặc H:mm AM/PM)
 *   onTimeSelect?: (time: string) => void;  // Callback khi chọn thời gian
 *   className?: string;           // CSS classes
 *   format24h?: boolean;          // Định dạng 24 giờ hay 12 giờ (default: true)
 *   placeholder?: string;         // Placeholder text (default: "HH:mm")
 *   label?: string;               // Label hiển thị trên input
 *   startTime?: string;           // Thời gian bắt đầu (để tính duration)
 *   isEndTime?: boolean;          // Có phải end time không? (default: false)
 * }
 * 
 * 
 * SỰ KIỆN VÀ TƯƠNG TÁC:
 * =====================
 * 1. Người dùng gõ thời gian:
 *    - Input value thay đổi
 *    - Dropdown auto-filter kết quả
 *    - Validate format (HH:mm)
 *    - Hiển thị error nếu format sai
 * 
 * 2. Người dùng Enter hoặc blur:
 *    - Validate format
 *    - Gọi onTimeSelect(time)
 *    - Đóng dropdown
 *    - Reset input
 * 
 * 3. Người dùng click option trong dropdown:
 *    - Gọi onTimeSelect(time)
 *    - Đóng dropdown
 *    - Reset input
 * 
 * 4. Người dùng click bên ngoài:
 *    - Đóng dropdown
 *    - Reset input
 * 
 * 
 * SO SÁNH VỚI TIMEPICKERDROPDOWN CŨ:
 * ==================================
 * 
 * TimePickerDropdown (cũ):
 * - Chỉ có dropdown danh sách
 * - Phải click để chọn
 * - Không support nhập trực tiếp
 * - Phải nhập format 12h (vd: 4:30pm)
 * 
 * TimePickerInput (mới):
 * - Có input field cho nhập trực tiếp
 * - Auto-filter dropdown theo input
 * - Support 24h format (HH:mm)
 * - Tự động trigger event khi chọn
 * - Hiển thị duration cho end time
 * - Smart suggestions (highlight 1 hr)
 * - Better UX khi edit thời gian
 * 
 * 
 * MIGRATION GUIDE:
 * ================
 * Thay từ:
 * 
 *   <TimePickerDropdown
 *     selectedTime={formatTimeToHHmm(end_time)}
 *     onTimeSelect={(time) => {
 *       const [hours, minutes] = time.split(':').map(Number);
 *       const baseDate = end_time ? new Date(end_time) : new Date();
 *       baseDate.setHours(hours, minutes, 0, 0);
 *       setEndTime(new Date(baseDate));
 *       setShowEndTimePicker(false);
 *     }}
 *     isOpen={showEndTimePicker}
 *     onClose={() => setShowEndTimePicker(false)}
 *     format24h={true}
 *   />
 * 
 * Thành:
 * 
 *   <TimePickerInput
 *     selectedTime={formatTimeToHHmm(end_time)}
 *     onTimeSelect={(time) => {
 *       const [hours, minutes] = time.split(':').map(Number);
 *       const baseDate = end_time ? new Date(end_time) : new Date();
 *       baseDate.setHours(hours, minutes, 0, 0);
 *       setEndTime(new Date(baseDate));
 *     }}
 *     label="End Time"
 *     format24h={true}
 *     startTime={start_time ? formatTimeToHHmm(start_time) : ''}
 *     isEndTime={true}
 *   />
 * 
 * 
 * KHÁC BIỆT CHÍNH:
 * - Không cần state showEndTimePicker nữa
 * - Không cần onClose callback
 * - Không cần isOpen prop
 * - Thêm label, startTime, isEndTime props
 * - Tự động handle click outside
 * - Tự động trigger event khi blur/Enter
 * 
 * 
 * FILES ĐƯỢC CẬP NHẬT:
 * ====================
 * 1. webapp/src/components/task-event/TimePickerInput.component.tsx (NEW)
 * 2. webapp/src/components/task-event/DateTimePickerInput.component.tsx (NEW)
 * 3. webapp/src/components/task-event/ColorOption.component.tsx (NEW)
 * 4. webapp/src/hooks/task-events/useTimePickerInput.hook.ts (NEW)
 * 5. webapp/src/pages/Task/CreateTaskForm.screen.tsx (UPDATED)
 * 6. webapp/src/pages/Task/EditTaskForm.screen.tsx (UPDATED)
 * 7. webapp/src/pages/TaskEvents/TaskEventModal.screen.tsx (UPDATED)
 * 
 */
