import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import callAPI from "../../utils/api";
import TimesheetCalendar from "./TimesheetCalendar";
import TimesheetDayDrawer from "./TimesheetDayDrawer";

export default function TimesheetCalendarPage() {
  // ── Calendar state ──
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [groupedData, setGroupedData] = useState({});
  const [monthlyTotalHours, setMonthlyTotalHours] = useState(0);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // ── Fetch dữ liệu calendar (toàn bộ tháng, không phân trang) ──
  const fetchCalendarData = async (month = calendarMonth) => {
    setCalendarLoading(true);
    try {
      const startDate = month.startOf("month").format("YYYY-MM-DD");
      const endDate = month.endOf("month").format("YYYY-MM-DD");
      const currentEmployeeCode = localStorage.getItem("maNhanSu") || "";

      const filterPayload = {
        employeeCode: currentEmployeeCode || undefined,
        status: "APPROVED",
        fromDate: startDate,
        toDate: endDate,
      };
      const [response, summaryResponse] = await Promise.all([
        callAPI({
          method: "post",
          endpoint: "/timesheet/list",
          data: {
            ...filterPayload,
            pageIndex: 1,
            pageSize: 500,
          },
        }),
        callAPI({ method: "post", endpoint: "/timesheet/summary", data: filterPayload }),
      ]);

      const rawRecords = response?.data || [];
      setMonthlyTotalHours(Number(summaryResponse?.summary?.totalHours || 0));

      // Reduce → groupedData: { "YYYY-MM-DD": { totalHours, records[] } }
      const grouped = rawRecords.reduce((acc, curr) => {
        const dateKey = String(curr.workDate || "").slice(0, 10);
        if (!dateKey) return acc;
        if (!acc[dateKey]) acc[dateKey] = { totalHours: 0, records: [] };
        acc[dateKey].totalHours += Number(curr.hours || 0);
        acc[dateKey].records.push(curr);
        return acc;
      }, {});

      setGroupedData(grouped);
    } catch (err) {
      console.error("Lỗi tải dữ liệu calendar:", err);
      setMonthlyTotalHours(0);
    } finally {
      setCalendarLoading(false);
    }
  };

  // ── Chuyển tháng ──
  const handleMonthChange = (newMonth) => {
    setCalendarMonth(newMonth);
    fetchCalendarData(newMonth);
  };

  // ── Refresh sau CRUD trong Drawer ──
  const handleDrawerRefresh = () => {
    fetchCalendarData();
  };

  // ── Init ──
  useEffect(() => {
    fetchCalendarData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-2xl font-semibold text-gray-700 text-left">
          📅 Lịch công việc
        </h2>
      </div>

      <div className="mt-4">
        <TimesheetCalendar
          groupedData={groupedData}
          totalHours={monthlyTotalHours}
          currentMonth={calendarMonth}
          onMonthChange={handleMonthChange}
          onDayClick={(dateStr) => setSelectedDay(dateStr)}
          loading={calendarLoading}
        />
      </div>

      <TimesheetDayDrawer
        open={!!selectedDay}
        date={selectedDay}
        dateStr={selectedDay}
        onClose={() => setSelectedDay(null)}
        records={selectedDay ? groupedData[selectedDay]?.records || [] : []}
        onRefresh={handleDrawerRefresh}
      />
    </div>
  );
}
