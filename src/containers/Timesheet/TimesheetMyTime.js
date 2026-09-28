import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Select, DatePicker, Modal, Pagination, Spin } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import TimesheetCalendar from "./TimesheetCalendar";
import TimesheetDayDrawer from "./TimesheetDayDrawer";
import KpiSummaryBar from "./KpiSummaryBar";
import CaseCodeSelect from "./CaseCodeSelect";
import ActivitySelect from "./ActivitySelect";
import callAPI from "../../utils/api";

const money = (v) => Number(v || 0).toLocaleString("vi-VN");
const formatDate = (v) => {
  if (!v) return "-";
  const [y, m, d] = String(v).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

// ── Bảng màu đóng góp ──
function ContribBadge({ value }) {
  const n = Number(value ?? 100);
  const cls = n > 100
    ? "bg-red-100 text-red-700 border-red-300"
    : "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {n}%
    </span>
  );
}

export default function TimesheetMyTime({ viewMode = "self", targetEmployeeCode = null }) {
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.role);
  const currentMaNhanSu = localStorage.getItem("maNhanSu") || "";

  // Nếu viewMode="other" (manager/CEO xem NV khác) → dùng targetEmployeeCode
  const employeeCode = viewMode === "other" && targetEmployeeCode
    ? targetEmployeeCode
    : currentMaNhanSu;
  const isReadOnly = viewMode === "other"; // manager/CEO chỉ xem

  // ── Tab ──
  const [activeTab, setActiveTab] = useState("calendar"); // "calendar" | "task"

  // ════════════════════════════════════════
  //  CALENDAR STATE
  // ════════════════════════════════════════
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [groupedData, setGroupedData] = useState({});
  const [monthlyTotalHours, setMonthlyTotalHours] = useState(0);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchCalendarData = useCallback(async (month = calendarMonth) => {
    setCalendarLoading(true);
    try {
      const startDate = month.startOf("month").format("YYYY-MM-DD");
      const endDate   = month.endOf("month").format("YYYY-MM-DD");
      const [response, summaryRes] = await Promise.all([
        callAPI({ method: "post", endpoint: "/timesheet/list",
          data: { employeeCode, status: "APPROVED", fromDate: startDate, toDate: endDate, pageIndex: 1, pageSize: 500 } }),
        callAPI({ method: "post", endpoint: "/timesheet/summary",
          data: { employeeCode, status: "APPROVED", fromDate: startDate, toDate: endDate } }),
      ]);
      const raw = response?.data || [];
      setMonthlyTotalHours(Number(summaryRes?.summary?.totalHours || 0));
      const grouped = raw.reduce((acc, cur) => {
        const dk = String(cur.workDate || "").slice(0, 10);
        if (!dk) return acc;
        if (!acc[dk]) acc[dk] = { totalHours: 0, records: [] };
        acc[dk].totalHours += Number(cur.hours || 0);
        acc[dk].records.push(cur);
        return acc;
      }, {});
      setGroupedData(grouped);
    } catch (e) {
      console.error(e);
    } finally {
      setCalendarLoading(false);
    }
  }, [employeeCode, calendarMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  // ════════════════════════════════════════
  //  TASK (bảng thống kê) STATE
  // ════════════════════════════════════════
  const [rows, setRows] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [filters, setFilters] = useState({
    caseCode: "", activity: "", customerCode: "", partnerCode: "",
    fromDate: "", toDate: "",
  });
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 20, totalItems: 0 });
  const [taskSummary, setTaskSummary] = useState({ totalItems: 0, totalHours: 0, totalAmount: 0 });
  const [deleting, setDeleting] = useState(null);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const getTaskPayload = useCallback(() => ({
    employeeCode,
    status: "APPROVED",
    caseCode: filters.caseCode || undefined,
    activity: filters.activity || undefined,
    customerCode: filters.customerCode || undefined,
    partnerCode: filters.partnerCode || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  }), [employeeCode, filters]);

  const fetchTasks = useCallback(async (pi = pagination.pageIndex, ps = pagination.pageSize) => {
    setTaskLoading(true);
    try {
      const payload = getTaskPayload();
      const [res, sumRes] = await Promise.all([
        callAPI({ method: "post", endpoint: "/timesheet/list", data: { ...payload, pageIndex: pi, pageSize: ps } }),
        callAPI({ method: "post", endpoint: "/timesheet/summary", data: payload }),
      ]);
      setRows(res?.data || []);
      setPagination({ pageIndex: res?.pagination?.pageIndex || pi, pageSize: res?.pagination?.pageSize || ps, totalItems: res?.pagination?.totalItems || 0 });
      setTaskSummary(sumRes?.summary || { totalItems: 0, totalHours: 0, totalAmount: 0 });
    } finally {
      setTaskLoading(false);
    }
  }, [getTaskPayload]); // eslint-disable-line react-hooks/exhaustive-deps

  // ════════════════════════════════════════
  //  KPI STATE
  // ════════════════════════════════════════
  const [kpi, setKpi] = useState({});
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiPeriod, setKpiPeriod] = useState("month");
  const [kpiParams, setKpiParams] = useState({
    year: dayjs().year(), month: dayjs().month() + 1,
    week: Math.ceil(dayjs().date() / 7), quarter: Math.ceil((dayjs().month() + 1) / 3),
  });

  const fetchKpi = useCallback(async (period, params) => {
    setKpiLoading(true);
    try {
      const res = await callAPI({
        method: "post", endpoint: "/timesheet/kpi",
        data: { employeeCode, period, ...params },
      });
      setKpi(res?.kpi || {});
    } catch {
      setKpi({});
    } finally {
      setKpiLoading(false);
    }
  }, [employeeCode]);

  // ── Init ──
  useEffect(() => {
    fetchCalendarData();
    fetchTasks(1, 20);
    fetchKpi(kpiPeriod, kpiParams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKpiPeriodChange = (p, params) => {
    setKpiPeriod(p);
    setKpiParams(params);
    fetchKpi(p, params);
  };

  // Casecontribs (cảnh báo >100%)
  const caseContributions = rows.reduce((acc, row) => {
    if (!row.caseCode) return acc;
    const rate = Number(row.contributionPercentage ?? row.contributionRate ?? 100);
    if (!acc[row.caseCode]) acc[row.caseCode] = { total: 0, employees: new Set() };
    acc[row.caseCode].total += rate;
    const name = row.employee?.hoTen || row.employeeCode;
    if (name) acc[row.caseCode].employees.add(name);
    return acc;
  }, {});

  const deleteRow = async () => {
    if (!deleting) return;
    try {
      await callAPI({ method: "delete", endpoint: "/timesheet/delete", data: { id: deleting.id } });
      toast.success("Xóa Time Record thành công!");
      setDeleting(null);
      fetchTasks();
      if (activeTab === "calendar") fetchCalendarData();
    } catch { setDeleting(null); }
  };

  // ── Tên nhân sự (khi viewMode=other) ──
  const [targetName, setTargetName] = useState("");
  useEffect(() => {
    if (viewMode === "other" && targetEmployeeCode) {
      callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} })
        .then((list) => {
          const found = (list || []).find((s) => s.maNhanSu === targetEmployeeCode);
          setTargetName(found?.hoTen || targetEmployeeCode);
        }).catch(() => {});
    }
  }, [viewMode, targetEmployeeCode]);

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      {/* ── Page header ── */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-700">
            {viewMode === "other"
              ? `👤 MYTIME của ${targetName || targetEmployeeCode}`
              : "📅 MYTIME — Thời gian của tôi"}
          </h2>
          {isReadOnly && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200">
              Chỉ xem
            </span>
          )}
        </div>

        {/* ── Tab buttons ── */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { setActiveTab("calendar"); fetchCalendarData(); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold border transition cursor-pointer ${
              activeTab === "calendar"
                ? "bg-[#009999] text-white border-[#009999]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#009999] hover:text-[#009999]"
            }`}
          >
            📅 CALENDAR
          </button>
          <button
            onClick={() => { setActiveTab("task"); fetchTasks(1, 20); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold border transition cursor-pointer ${
              activeTab === "task"
                ? "bg-[#009999] text-white border-[#009999]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#009999] hover:text-[#009999]"
            }`}
          >
            📋 TASK
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CALENDAR TAB
          ════════════════════════════════════════ */}
      {activeTab === "calendar" && (
        <>
          <TimesheetCalendar
            groupedData={groupedData}
            totalHours={monthlyTotalHours}
            currentMonth={calendarMonth}
            onMonthChange={(m) => { setCalendarMonth(m); fetchCalendarData(m); }}
            onDayClick={(d) => setSelectedDay(d)}
            loading={calendarLoading}
          />

          {/* KPI bên dưới calendar */}
          <div className="mt-4">
            <KpiSummaryBar
              kpi={kpi}
              loading={kpiLoading}
              period={kpiPeriod}
              onPeriodChange={handleKpiPeriodChange}
            />
          </div>

          <TimesheetDayDrawer
            open={!!selectedDay}
            date={selectedDay}
            dateStr={selectedDay}
            onClose={() => setSelectedDay(null)}
            records={selectedDay ? groupedData[selectedDay]?.records || [] : []}
            onRefresh={fetchCalendarData}
            readOnly={isReadOnly}
          />
        </>
      )}

      {/* ════════════════════════════════════════
           TASK TAB
          ════════════════════════════════════════ */}
      {activeTab === "task" && (
        <>
          {/* KPI trên đầu bảng */}
          <KpiSummaryBar
            kpi={kpi}
            loading={kpiLoading}
            period={kpiPeriod}
            onPeriodChange={handleKpiPeriodChange}
          />

          {/* Bộ lọc */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <form
              onSubmit={(e) => { e.preventDefault(); fetchTasks(1, pagination.pageSize); }}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <DatePicker className="w-full" placeholder="Từ ngày" format="DD/MM/YYYY"
                  onChange={(d) => setFilter("fromDate", d?.format("YYYY-MM-DD") || "")} />
              </div>
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <DatePicker className="w-full" placeholder="Đến ngày" format="DD/MM/YYYY"
                  onChange={(d) => setFilter("toDate", d?.format("YYYY-MM-DD") || "")} />
              </div>
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã hồ sơ</label>
                <CaseCodeSelect value={filters.caseCode} onChange={(v) => setFilter("caseCode", v)}
                  allowCustom placeholder="Chọn hoặc nhập mã hồ sơ" />
              </div>
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt động</label>
                <ActivitySelect value={filters.activity} onChange={(v) => setFilter("activity", v || "")}
                  placeholder="Chọn hoạt động" className="text-left" />
              </div>
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã KH</label>
                <input
                  type="text" placeholder="Mã khách hàng"
                  value={filters.customerCode}
                  onChange={(e) => setFilter("customerCode", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#009999] focus:outline-none"
                />
              </div>
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã đối tác</label>
                <input
                  type="text" placeholder="Mã đối tác"
                  value={filters.partnerCode}
                  onChange={(e) => setFilter("partnerCode", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#009999] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-2 rounded-lg shadow-md transition font-medium h-[38px] flex items-center cursor-pointer"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Summary mini-cards */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white p-3 rounded-lg shadow border-l-4 border-[#009999]">
                <p className="text-xs text-gray-500">Tổng lượt ghi nhận</p>
                <strong className="text-lg text-[#009999]">{taskSummary.totalItems || 0}</strong>
              </div>
              <div className="bg-white p-3 rounded-lg shadow border-l-4 border-orange-400">
                <p className="text-xs text-gray-500">Tổng giờ</p>
                <strong className="text-lg text-orange-600">{Number(taskSummary.totalHours || 0).toFixed(1)}</strong>
              </div>
              <div className="bg-white p-3 rounded-lg shadow border-l-4 border-indigo-400">
                <p className="text-xs text-gray-500">Tổng doanh thu</p>
                <strong className="text-lg text-indigo-600">{money(taskSummary.totalAmount)}đ</strong>
              </div>
            </div>
          </div>

          {/* Bảng TASK */}
          <div className="overflow-x-auto rounded-lg border shadow bg-white">
            <Spin spinning={taskLoading}>
              <table className="w-full border-collapse bg-white text-sm min-w-[900px]">
                <thead className="bg-[#009999] text-white">
                  <tr className="text-white text-center">
                    <th className="p-3 text-xs font-semibold text-white">Ngày</th>
                    <th className="p-3 text-xs font-semibold text-white">Mã hồ sơ</th>
                    <th className="p-3 text-xs font-semibold text-white">Mã KH</th>
                    <th className="p-3 text-xs font-semibold text-white">Mã đối tác</th>
                    <th className="p-3 text-xs font-semibold text-left text-white">Hoạt động</th>
                    <th className="p-3 text-xs font-semibold text-left text-white">Nội dung</th>
                    <th className="p-3 text-xs font-semibold text-white">Số giờ</th>
                    <th className="p-3 text-xs font-semibold text-white">Đóng góp</th>
                    <th className="p-3 text-xs font-semibold text-white">Đơn giá/h</th>
                    <th className="p-3 text-xs font-semibold text-white">Thành tiền</th>
                    <th className="p-3 text-xs font-semibold text-white">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? rows.map((row) => (
                    <tr key={row.id} className="text-center border-b hover:bg-[#f0fdfa]">
                      <td className="p-3 text-xs text-gray-600">{formatDate(row.workDate)}</td>
                      <td className="p-3 text-xs font-medium text-[#009999]">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span>{row.caseCode || "-"}</span>
                          {row.caseCode && caseContributions[row.caseCode]?.total > 100 && (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 text-[10px] font-bold"
                              title={`Tổng đóng góp ${caseContributions[row.caseCode].total}% > 100%`}>
                              ⚠️ &gt;100%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-600">{row.customerCode || "-"}</td>
                      <td className="p-3 text-xs text-gray-600">{row.partnerCode || "-"}</td>
                      <td className="p-3 text-xs text-left font-medium text-indigo-600">{row.activity}</td>
                      <td className="p-3 text-xs text-left text-gray-600">{row.description || "-"}</td>
                      <td className="p-3 text-xs font-semibold text-orange-600">{Number(row.hours || 0)}</td>
                      <td className="p-3 text-xs"><ContribBadge value={row.contributionPercentage ?? row.contributionRate ?? 100} /></td>
                      <td className="p-3 text-xs">{money(row.hourlyRate)}</td>
                      <td className="p-3 text-xs font-semibold text-[#009999]">{money(row.totalAmount)}</td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        <button onClick={() => navigate(`/timesheetdetail/${row.id}`)}
                          className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded mr-1 transition text-xs font-medium">
                          Xem
                        </button>
                        {!isReadOnly && row.employeeCode === currentMaNhanSu && (
                          <>
                            <button onClick={() => navigate(`/timesheetedit/${row.id}`)}
                              className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded mr-1 transition text-xs font-medium">
                              Sửa
                            </button>
                            <button onClick={() => setDeleting(row)}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition text-xs font-medium">
                              Xóa
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={11} className="p-8 text-center text-gray-500">Không có bản ghi nào</td></tr>
                  )}
                </tbody>
              </table>
            </Spin>
          </div>

          <div className="mt-4 flex justify-center">
            <Pagination
              current={pagination.pageIndex} total={pagination.totalItems}
              pageSize={pagination.pageSize} showSizeChanger
              pageSizeOptions={["20", "50", "100"]}
              showTotal={(t) => `Tổng ${t} bản ghi`}
              onChange={(p, s) => fetchTasks(p, Math.min(s, 100))}
            />
          </div>
        </>
      )}

      {/* Modal xóa */}
      <Modal title="Xác nhận xóa" open={Boolean(deleting)} onOk={deleteRow} onCancel={() => setDeleting(null)}
        okText="Xóa" cancelText="Hủy" okButtonProps={{ className: "bg-red-500 hover:bg-red-600 text-white" }}>
        <p>Bạn có chắc muốn xóa Time Record ngày <strong>{deleting?.workDate}</strong> ({deleting?.activity}) không?</p>
      </Modal>
    </div>
  );
}
