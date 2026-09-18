import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { DatePicker, Modal, Pagination, Spin } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import CaseCodeSelect from "./CaseCodeSelect";
import callAPI from "../../utils/api";
import TimesheetCalendar from "./TimesheetCalendar";
import TimesheetDayDrawer from "./TimesheetDayDrawer";

const statusMap = { APPROVED: "Đã duyệt" };
const money = (value) => Number(value || 0).toLocaleString("vi-VN");
const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export default function TimesheetList() {
  const navigate = useNavigate();

  // ── Bảng dữ liệu (có phân trang) ──
  const [rows, setRows] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeCode: "",
    caseCode: "",
    activity: "",
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalItems: 0,
  });
  const [deleting, setDeleting] = useState(null);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalHours: 0,
    totalAmount: 0,
  });

  // ── Calendar state ──
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [groupedData, setGroupedData] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // ── Helpers ──
  const setFilter = (key, value) =>
    setFilters((old) => ({ ...old, [key]: value }));

  const getFilterPayload = () => ({
    employeeCode: filters.employeeCode || undefined,
    caseCode: filters.caseCode || undefined,
    status: "APPROVED",
    activity: filters.activity || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  // ── Fetch bảng thống kê (phân trang) ──
  const fetchRows = async (
    pageIndex = pagination.pageIndex,
    pageSize = pagination.pageSize,
  ) => {
    setLoading(true);
    try {
      const [response, summaryResponse] = await Promise.all([
        callAPI({
          method: "post",
          endpoint: "/timesheet/list",
          data: { ...getFilterPayload(), pageIndex, pageSize },
        }),
        callAPI({
          method: "post",
          endpoint: "/timesheet/summary",
          data: getFilterPayload(),
        }),
      ]);
      setRows(response?.data || []);
      setPagination({
        pageIndex: response?.pagination?.pageIndex || pageIndex,
        pageSize: response?.pagination?.pageSize || pageSize,
        totalItems: response?.pagination?.totalItems || 0,
      });
      setSummary(
        summaryResponse?.summary || {
          totalItems: 0,
          totalHours: 0,
          totalAmount: 0,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch dữ liệu calendar (toàn bộ tháng, không phân trang) ──
  const fetchCalendarData = async (month = calendarMonth) => {
    setCalendarLoading(true);
    try {
      const startDate = month.startOf("month").format("YYYY-MM-DD");
      const endDate = month.endOf("month").format("YYYY-MM-DD");
      const currentEmployeeCode = localStorage.getItem("maNhanSu") || "";

      const response = await callAPI({
        method: "post",
        endpoint: "/timesheet/list",
        data: {
          employeeCode: filters.employeeCode || currentEmployeeCode || undefined,
          status: "APPROVED",
          fromDate: startDate,
          toDate: endDate,
          pageIndex: 1,
          pageSize: 500,
        },
      });

      const rawRecords = response?.data || [];

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
    fetchRows();
  };

  // ── Xóa (từ bảng) ──
  const deleteRow = async () => {
    if (!deleting) return;
    try {
      await callAPI({
        method: "delete",
        endpoint: "/timesheet/delete",
        data: { id: deleting.id },
      });
      toast.success("Xóa Time Report thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      setDeleting(null);
      fetchRows();
      fetchCalendarData();
    } catch {
      setDeleting(null);
    }
  };

  // ── Init ──
  useEffect(() => {
    Promise.all([
      callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} }),
      fetchRows(1, 20),
      fetchCalendarData(),
    ])
      .then(([staff]) => setStaffs(staff || []))
      .catch(() => setStaffs([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-1 bg-gray-100 min-h-screen">

      {/* ══════════════════════════════════
           HEADER + BỘ LỌC + SUMMARY CARDS
          ══════════════════════════════════ */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            📌 Danh sách Time Report
          </h2>
          <button
            onClick={() => navigate("/timesheetadd")}
            className="bg-[#009999] hover:bg-[#007a7a] text-white px-4 py-2 rounded-lg transition shadow"
          >
            + Thêm Time Report
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Từ ngày
            </label>
            <DatePicker
              className="w-full"
              placeholder="Từ ngày"
              format="DD/MM/YYYY"
              onChange={(date) =>
                setFilter("fromDate", date?.format("YYYY-MM-DD") || "")
              }
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Đến ngày
            </label>
            <DatePicker
              className="w-full"
              placeholder="Đến ngày"
              format="DD/MM/YYYY"
              onChange={(date) =>
                setFilter("toDate", date?.format("YYYY-MM-DD") || "")
              }
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Nhân sự
            </label>
            <Select
              className="text-left"
              options={staffs.map((s) => ({
                value: s.maNhanSu,
                label: `${s.maNhanSu} - ${s.hoTen}`,
              }))}
              value={
                filters.employeeCode
                  ? { value: filters.employeeCode, label: filters.employeeCode }
                  : null
              }
              onChange={(o) => setFilter("employeeCode", o?.value || "")}
              placeholder="Chọn nhân sự"
              isClearable
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Mã hồ sơ
            </label>
            <CaseCodeSelect
              value={filters.caseCode}
              onChange={(value) => setFilter("caseCode", value)}
              placeholder="Chọn mã hồ sơ"
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Hoạt động
            </label>
            <input
              className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm h-[32px] mt-auto"
              style={{ height: "32px" }}
              placeholder="Nhập hoạt động"
              value={filters.activity}
              onChange={(e) => setFilter("activity", e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={() => fetchRows(1, pagination.pageSize)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-2 rounded-lg shadow-md transition font-medium h-[32px] flex items-center justify-center"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-[#009999]">
            <p className="text-sm text-gray-500">Tổng số logtime</p>
            <strong className="text-xl text-[#009999]">
              {summary.totalItems || 0}
            </strong>
          </div>
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-orange-400">
            <p className="text-sm text-gray-500">Tổng số giờ</p>
            <strong className="text-xl text-orange-600">
              {Number(summary.totalHours || 0)}
            </strong>
          </div>
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-indigo-400">
            <p className="text-sm text-gray-500">Tổng chi phí</p>
            <strong className="text-xl text-indigo-600">
              {money(summary.totalAmount)} đ
            </strong>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
           CALENDAR VIEW
          ══════════════════════════════ */}
      <div className="mt-4">
        <TimesheetCalendar
          groupedData={groupedData}
          currentMonth={calendarMonth}
          onMonthChange={handleMonthChange}
          onDayClick={(dateStr) => setSelectedDay(dateStr)}
          loading={calendarLoading}
        />
      </div>

      {/* ══════════════════════════════
           TABLE VIEW
          ══════════════════════════════ */}
      <div className="overflow-x-auto mt-4 rounded-lg border shadow bg-white">
        <Spin spinning={loading}>
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="text-[#667085] text-center">
                <th className="p-3 text-table">Ngày</th>
                <th className="p-3 text-table">Mã hồ sơ</th>
                <th className="p-3 text-table">Nhân sự</th>
                <th className="p-3 text-table text-left">Hoạt động</th>
                <th className="p-3 text-table text-left">Nội dung</th>
                <th className="p-3 text-table">Số giờ</th>
                <th className="p-3 text-table">Đơn giá/giờ</th>
                <th className="p-3 text-table">Thành tiền</th>
                <th className="p-3 text-table">Trạng thái</th>
                <th className="p-3 text-table">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="text-center border-b hover:bg-[#f0fdfa]"
                  >
                    <td className="p-3 text-table text-gray-600">{formatDate(row.workDate)}</td>
                    <td className="p-3 text-table font-medium text-[#009999]">
                      {row.caseCode || "-"}
                    </td>
                    <td className="p-3 text-table text-gray-700">
                      {row.employee?.hoTen || row.employeeCode}
                    </td>
                    <td className="p-3 text-table text-left font-medium text-indigo-600">
                      {row.activity}
                    </td>
                    <td className="p-3 text-table text-left text-gray-600">
                      {row.description || "-"}
                    </td>
                    <td className="p-3 text-table font-semibold text-orange-600">
                      {Number(row.hours || 0)}
                    </td>
                    <td className="p-3 text-table">{money(row.hourlyRate)}</td>
                    <td className="p-3 text-table font-semibold text-[#009999]">
                      {money(row.totalAmount)}
                    </td>
                    <td className="p-3 text-table">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {statusMap[row.status] || "Đã duyệt"}
                      </span>
                    </td>
                    <td className="p-3 text-table whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/timesheetdetail/${row.id}`)}
                        className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded mr-1.5 transition text-xs font-medium"
                        title="Xem chi tiết"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => navigate(`/timesheetedit/${row.id}`)}
                        className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded mr-1.5 transition text-xs font-medium"
                        title="Chỉnh sửa"
                      >
                        Sửa 📝
                      </button>
                      <button
                        onClick={() => setDeleting(row)}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition text-xs font-medium"
                        title="Xóa"
                      >
                        Xóa 🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-500">
                    Không có bản ghi nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Spin>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <Pagination
          current={pagination.pageIndex}
          total={pagination.totalItems}
          pageSize={pagination.pageSize}
          showSizeChanger
          pageSizeOptions={["20", "50", "100"]}
          showTotal={(total) => `Tổng ${total} bản ghi`}
          onChange={(page, size) => fetchRows(page, Math.min(size, 100))}
        />
      </div>

      {/* ══ Modal xóa (từ bảng) ══ */}
      <Modal
        title="Xác nhận xóa Time Report"
        open={Boolean(deleting)}
        onOk={deleteRow}
        onCancel={() => setDeleting(null)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-red-500 hover:bg-red-600 text-white" }}
      >
        <p>
          Bạn có chắc muốn xóa Time Report ngày{" "}
          <strong>{deleting?.workDate}</strong> (Hoạt động:{" "}
          <em>{deleting?.activity}</em>) không?
        </p>
      </Modal>

      {/* ══ Drawer ngày (từ Calendar) ══ */}
      <TimesheetDayDrawer
        open={Boolean(selectedDay)}
        date={selectedDay}
        records={selectedDay ? (groupedData[selectedDay]?.records || []) : []}
        onClose={() => setSelectedDay(null)}
        onRefresh={handleDrawerRefresh}
      />
    </div>
  );
}
