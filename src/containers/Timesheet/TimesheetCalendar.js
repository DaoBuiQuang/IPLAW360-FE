import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/**
 * Trả về mảng các ngày để render lưới tháng.
 * Luôn bắt đầu từ Thứ Hai của tuần chứa ngày 1 của tháng.
 */
function buildCalendarDays(year, month) {
  const firstDay = dayjs(new Date(year, month - 1, 1));
  // dayjs weekday: 0=CN, 1=T2, ..., 6=T7  → cần shift để T2 = 0
  const startOffset = (firstDay.day() + 6) % 7; // số ô trống ở đầu
  const daysInMonth = firstDay.daysInMonth();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const days = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      days.push(null); // ô trống
    } else {
      days.push(dayNum);
    }
  }
  return days;
}

/**
 * Màu sắc ô ngày dựa trên tổng giờ đã log
 */
function getDayStyle(totalHours) {
  if (!totalHours || totalHours <= 0) return { bg: "#f3f4f6", text: "#9ca3af", badge: null };
  if (totalHours >= 8) return { bg: "#dcfce7", text: "#15803d", badge: "#16a34a" };
  return { bg: "#fef9c3", text: "#a16207", badge: "#ca8a04" };
}

export default function TimesheetCalendar({ groupedData = {}, currentMonth, onMonthChange, onDayClick, loading }) {
  const year = currentMonth.year();
  const month = currentMonth.month() + 1; // dayjs month() bắt đầu từ 0
  const days = buildCalendarDays(year, month);
  const todayStr = dayjs().format("YYYY-MM-DD");

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* ===== Header điều hướng tháng ===== */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#009999] to-[#007a7a]">
        <button
          onClick={() => onMonthChange(currentMonth.subtract(1, "month"))}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition font-bold text-lg"
          title="Tháng trước"
        >
          ‹
        </button>

        <div className="text-center">
          <p className="text-white font-bold text-lg tracking-wide">
            Tháng {month}/{year}
          </p>
          <p className="text-white/70 text-xs mt-0.5">
            {loading ? "Đang tải..." : `${Object.keys(groupedData).length} ngày đã log`}
          </p>
        </div>

        <button
          onClick={() => onMonthChange(currentMonth.add(1, "month"))}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition font-bold text-lg"
          title="Tháng sau"
        >
          ›
        </button>
      </div>

      {/* ===== Chú thích màu ===== */}
      <div className="flex items-center gap-4 px-5 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#dcfce7] border border-[#16a34a]" />
          ≥ 8 giờ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#fef9c3] border border-[#ca8a04]" />
          &lt; 8 giờ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-gray-100 border border-gray-300" />
          Chưa log
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="inline-block w-3 h-3 rounded-full bg-[#009999]" />
          Hôm nay
        </span>
      </div>

      {/* ===== Grid Header (T2 → CN) ===== */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-semibold ${
              d === "T7" || d === "CN" ? "text-red-400" : "text-gray-500"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ===== Grid ngày ===== */}
      <div
        className="grid grid-cols-7"
        style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}
      >
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="border-b border-r border-gray-50 min-h-[44px]" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayData = groupedData[dateStr];
          const totalHours = dayData?.totalHours || 0;
          const recordCount = dayData?.records?.length || 0;
          const style = getDayStyle(totalHours);
          const isToday = dateStr === todayStr;
          const isWeekend = idx % 7 === 5 || idx % 7 === 6; // T7 hoặc CN

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              title={totalHours > 0 ? `${totalHours}h – ${recordCount} bản ghi` : "Click để thêm time record"}
              className="relative min-h-[44px] border-b border-r border-gray-100 p-1.5 cursor-pointer transition-all duration-150 group"
              style={{
                backgroundColor: style.bg,
              }}
            >
              {/* Hiệu ứng hover overlay */}
              <div className="absolute inset-0 bg-[#009999]/0 group-hover:bg-[#009999]/8 transition-colors duration-150 rounded-sm" />

              {/* Số ngày */}
              <div className="relative flex items-start justify-between">
                <span
                  className={`text-xs font-semibold leading-none ${
                    isToday
                      ? "w-5 h-5 flex items-center justify-center rounded-full bg-[#009999] text-white text-[11px]"
                      : isWeekend
                      ? "text-red-400"
                      : style.text
                  }`}
                >
                  {day}
                </span>

                {/* Badge số records */}
                {recordCount > 0 && (
                  <span
                    className="text-[9px] font-bold px-1 py-0.5 rounded-full text-white leading-none"
                    style={{ backgroundColor: style.badge }}
                  >
                    {recordCount}
                  </span>
                )}
              </div>

              {/* Tổng giờ */}
              {totalHours > 0 && (
                <div className="relative mt-0.5">
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: style.badge }}
                  >
                    {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h
                  </span>
                </div>
              )}

              {/* Icon "+" khi hover vào ô trống */}
              {totalHours === 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[#009999] text-xl font-light">+</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
