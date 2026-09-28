import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import {
  AlertTriangle,
  FileText,
  Users,
  User,
  Search,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import KpiSummaryBar from "./KpiSummaryBar";
import TimesheetMyTime from "./TimesheetMyTime";
import callAPI from "../../utils/api";
import dayjs from "dayjs";

const money = (v) => Number(v || 0).toLocaleString("vi-VN");

/**
 * TimesheetMyOffice — Dành cho CEO / Admin
 * - KPI tổng quan toàn công ty (Tổng giờ, Tỷ lệ KPI, Doanh thu, Time records)
 * - Tùy chọn xem: "Hiệu suất từng Team" (Manager → Nhân viên) HOẶC "Hiệu suất toàn bộ nhân viên"
 * - Khi công ty chưa có Team/Manager: Tự động hiển thị toàn bộ nhân viên và hiệu suất công ty
 * - Sidebar: Chuyển đổi linh hoạt giữa cây Cơ cấu Team và Danh sách toàn bộ nhân sự
 * - Click vào bất kỳ Manager / Nhân sự nào để xem MYTIME chi tiết
 */
export default function TimesheetMyOffice() {
  const navigate = useNavigate();

  // ── KPI tổng công ty từ API ──
  const [officeSummary, setOfficeSummary] = useState({});
  const [fallbackStaff, setFallbackStaff] = useState([]);
  const [officeLoading, setOfficeLoading] = useState(false);
  const [kpiPeriod, setKpiPeriod] = useState("month");
  const [kpiParams, setKpiParams] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
    week: Math.ceil(dayjs().date() / 7),
    quarter: Math.ceil((dayjs().month() + 1) / 3),
  });

  // ── Cảnh báo hồ sơ > 100% toàn công ty ──
  const [officeOverContributed, setOfficeOverContributed] = useState([]);

  // ── Chế độ xem: "team" (Theo từng Team) hoặc "all_staff" (Toàn bộ nhân viên) ──
  const [viewMode, setViewMode] = useState("team");
  const [userChoseMode, setUserChoseMode] = useState(false);

  // ── Filter & Search & Sort ──
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [sortBy, setSortBy] = useState("hours_desc"); // "hours_desc" | "kpi_desc" | "amount_desc" | "name_asc"

  // ── Sidebar navigation & Target MYTIME ──
  const [expandedManager, setExpandedManager] = useState(null);
  const [viewingTarget, setViewingTarget] = useState(null); // { code, name, type: "manager"|"staff" }

  const fetchOfficeSummary = useCallback(async (period, params) => {
    setOfficeLoading(true);
    try {
      const [res, sumRes, staffRes] = await Promise.all([
        callAPI({
          method: "post",
          endpoint: "/timesheet/office-summary",
          data: { period, ...params },
        }),
        callAPI({
          method: "post",
          endpoint: "/timesheet/summary",
          data: { status: "APPROVED" },
        }),
        callAPI({
          method: "post",
          endpoint: "/staff/list",
          data: {},
        }).catch(() => null),
      ]);

      const summaryData = res?.officeSummary || {};
      setOfficeSummary(summaryData);
      setOfficeOverContributed(sumRes?.summary?.overContributedCases || []);

      if (staffRes) {
        setFallbackStaff(Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
      }
    } catch {
      setOfficeSummary({});
      setOfficeOverContributed([]);
    } finally {
      setOfficeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficeSummary(kpiPeriod, kpiParams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKpiPeriodChange = (p, params) => {
    setKpiPeriod(p);
    setKpiParams(params);
    fetchOfficeSummary(p, params);
  };

  const teams = useMemo(() => officeSummary.teams || [], [officeSummary]);
  const hasTeams = teams.length > 0;

  // Tự động fallback: nếu không có team nào thì mặc định xem "all_staff"
  const currentMode = (!hasTeams && !userChoseMode) ? "all_staff" : viewMode;

  // Danh sách toàn bộ nhân viên công ty:
  // 1. Ưu tiên officeSummary.allStaff trả về từ BE
  // 2. Nếu BE chưa có allStaff, trích xuất từ teams hoặc fallbackStaff
  const allStaffList = useMemo(() => {
    if (officeSummary.allStaff && Array.isArray(officeSummary.allStaff) && officeSummary.allStaff.length > 0) {
      return officeSummary.allStaff;
    }

    const staffMap = {};

    // Nạp từ fallbackStaff nếu có
    (fallbackStaff || []).forEach((s) => {
      const code = s.maNhanSu || s.employeeCode;
      if (code) {
        staffMap[code] = {
          employeeCode: code,
          hoTen: s.hoTen,
          chucVu: s.chucVu,
          phongBan: s.phongBan,
          Role: s.Role || "staff",
          isManager: s.Role === "manager",
          totalHours: 0,
          targetHours: (officeSummary.workingDays || 22) * 8,
          completionRate: 0,
          totalAmount: 0,
          recordCount: 0,
        };
      }
    });

    // Bổ sung dữ liệu từ teams nếu có
    teams.forEach((t) => {
      if (t.managerCode) {
        if (!staffMap[t.managerCode]) {
          staffMap[t.managerCode] = {
            employeeCode: t.managerCode,
            hoTen: t.managerName,
            isManager: true,
            Role: "manager",
            totalHours: 0,
            completionRate: 0,
            totalAmount: 0,
            recordCount: 0,
          };
        } else {
          staffMap[t.managerCode].isManager = true;
        }
      }

      (t.members || []).forEach((m) => {
        const code = m.employeeCode || m.maNhanSu;
        if (code) {
          if (!staffMap[code]) {
            staffMap[code] = {
              employeeCode: code,
              hoTen: m.hoTen,
              isManager: false,
              Role: "staff",
              totalHours: Number(m.totalHours || 0),
              completionRate: Number(m.completionRate || 0),
              totalAmount: Number(m.totalAmount || 0),
              recordCount: Number(m.recordCount || 0),
            };
          } else {
            staffMap[code].totalHours = Number(m.totalHours || staffMap[code].totalHours || 0);
            staffMap[code].completionRate = Number(m.completionRate || staffMap[code].completionRate || 0);
            staffMap[code].totalAmount = Number(m.totalAmount || staffMap[code].totalAmount || 0);
            staffMap[code].recordCount = Number(m.recordCount || staffMap[code].recordCount || 0);
          }
        }
      });
    });

    return Object.values(staffMap);
  }, [officeSummary, fallbackStaff, teams]);

  // Lọc và sắp xếp danh sách nhân viên
  const filteredStaff = useMemo(() => {
    let list = [...allStaffList];
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.hoTen || "").toLowerCase().includes(q) ||
          (s.employeeCode || "").toLowerCase().includes(q) ||
          (s.chucVu || "").toLowerCase().includes(q) ||
          (s.phongBan || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "hours_desc") return Number(b.totalHours || 0) - Number(a.totalHours || 0);
      if (sortBy === "kpi_desc") return Number(b.completionRate || 0) - Number(a.completionRate || 0);
      if (sortBy === "amount_desc") return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      if (sortBy === "name_asc") return (a.hoTen || "").localeCompare(b.hoTen || "", "vi");
      return 0;
    });

    return list;
  }, [allStaffList, tableSearch, sortBy]);

  // Lọc teams theo sidebar search
  const filteredTeams = useMemo(() => {
    if (!sidebarSearch.trim()) return teams;
    const q = sidebarSearch.toLowerCase().trim();
    return teams.filter(
      (t) =>
        (t.managerName || "").toLowerCase().includes(q) ||
        (t.managerCode || "").toLowerCase().includes(q) ||
        (t.members || []).some(
          (m) =>
            (m.hoTen || "").toLowerCase().includes(q) ||
            (m.employeeCode || "").toLowerCase().includes(q)
        )
    );
  }, [teams, sidebarSearch]);

  // Lọc staff theo sidebar search
  const sidebarFilteredStaff = useMemo(() => {
    if (!sidebarSearch.trim()) return allStaffList;
    const q = sidebarSearch.toLowerCase().trim();
    return allStaffList.filter(
      (s) =>
        (s.hoTen || "").toLowerCase().includes(q) ||
        (s.employeeCode || "").toLowerCase().includes(q) ||
        (s.chucVu || "").toLowerCase().includes(q)
    );
  }, [allStaffList, sidebarSearch]);

  // ── KPI tổng hợp dạng flat cho KpiSummaryBar ──
  const officeKpi = useMemo(() => {
    const isTeamMode = currentMode === "team" && hasTeams;

    const breakdown = isTeamMode
      ? teams.map((t) => ({
          employeeCode: t.managerCode,
          hoTen: `[Team] ${t.managerName}`,
          totalHours: t.teamTotalHours,
          completionRate: t.teamCompletionRate,
          totalAmount: t.teamTotalAmount,
        }))
      : allStaffList.map((s) => ({
          employeeCode: s.employeeCode || s.maNhanSu,
          hoTen: s.hoTen,
          totalHours: s.totalHours,
          completionRate: s.completionRate,
          totalAmount: s.totalAmount,
        }));

    return {
      totalHours: officeSummary.totalHours,
      targetHours: officeSummary.targetHours,
      completionRate: officeSummary.completionRate,
      totalAmount: officeSummary.totalAmount,
      recordCount:
        officeSummary.recordCount ??
        allStaffList.reduce((acc, item) => acc + (Number(item.recordCount) || 0), 0),
      breakdown,
    };
  }, [officeSummary, teams, allStaffList, currentMode, hasTeams]);

  // Xử lý khi click vào item trong breakdown của KpiSummaryBar
  const handleBreakdownClick = (code) => {
    if (currentMode === "team" && hasTeams) {
      const team = teams.find((t) => t.managerCode === code);
      if (team) {
        setViewingTarget({ code, name: team.managerName, type: "manager" });
        return;
      }
    }
    const staff = allStaffList.find((s) => (s.employeeCode || s.maNhanSu) === code);
    if (staff) {
      setViewingTarget({
        code,
        name: staff.hoTen,
        type: staff.isManager ? "manager" : "staff",
      });
    }
  };

  const handleSelectMode = (mode) => {
    setUserChoseMode(true);
    setViewMode(mode);
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen flex gap-4">
      {/* ══════════════════════════════════════
           SIDEBAR TRÁI (Cơ cấu công ty & Nhân sự)
          ══════════════════════════════════════ */}
      <div className="w-72 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 sticky top-4">
          <div className="px-4 py-3 bg-[#009999] text-white flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <span>🏢</span> Cơ cấu công ty
            </h3>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              CEO / Admin
            </span>
          </div>

          <Spin spinning={officeLoading}>
            <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
              {/* Mục "Tổng quan toàn công ty" */}
              <button
                onClick={() => {
                  setViewingTarget(null);
                  setExpandedManager(null);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition cursor-pointer border-b border-gray-100 ${
                  !viewingTarget
                    ? "bg-[#009999]/10 text-[#009999] font-bold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-base">📊</span>
                <div className="text-left">
                  <p className="font-semibold leading-tight">Tổng quan toàn công ty</p>
                  <p className="text-[11px] text-gray-400">Xem KPI tổng hợp & hiệu suất</p>
                </div>
              </button>

              {/* Sub-header Sidebar: Switcher hoặc Tiêu đề */}
              <div className="p-2.5 bg-gray-50/80 border-b border-gray-100">
                <div className="flex rounded-lg bg-gray-200/80 p-0.5 text-xs font-medium">
                  <button
                    onClick={() => handleSelectMode("team")}
                    disabled={!hasTeams}
                    className={`flex-1 py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                      currentMode === "team" && hasTeams
                        ? "bg-white text-[#009999] shadow-xs font-bold"
                        : hasTeams
                        ? "text-gray-600 hover:text-gray-900"
                        : "text-gray-400 cursor-not-allowed opacity-60"
                    }`}
                    title={!hasTeams ? "Chưa có team nào được thiết lập" : "Xem theo Team"}
                  >
                    <span>🏢 Theo Team</span>
                    {hasTeams && <span className="text-[10px] opacity-75">({teams.length})</span>}
                  </button>
                  <button
                    onClick={() => handleSelectMode("all_staff")}
                    className={`flex-1 py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                      currentMode === "all_staff" || !hasTeams
                        ? "bg-white text-[#009999] shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span>👥 Toàn bộ NV</span>
                    <span className="text-[10px] opacity-75">({allStaffList.length})</span>
                  </button>
                </div>

                {/* Ô tìm kiếm nhanh trong sidebar */}
                <div className="relative mt-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={currentMode === "team" && hasTeams ? "Tìm team / quản lý..." : "Tìm nhân sự..."}
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-[#009999]"
                  />
                </div>
              </div>

              {/* ── CÂY DANH SÁCH: THEO TỪNG TEAM ── */}
              {currentMode === "team" && hasTeams && (
                <div>
                  {filteredTeams.map((team) => (
                    <div key={team.managerCode} className="border-b border-gray-50">
                      {/* Manager Row */}
                      <button
                        onClick={() => {
                          setExpandedManager(expandedManager === team.managerCode ? null : team.managerCode);
                          setViewingTarget({
                            code: team.managerCode,
                            name: team.managerName,
                            type: "manager",
                          });
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer ${
                          viewingTarget?.code === team.managerCode
                            ? "bg-[#009999]/10 text-[#009999] font-bold"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-sm">👔</span>
                          <span className="truncate">{team.managerName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({team.managerCode})</span>
                        </div>
                        <span className="text-gray-400 text-[10px] flex-shrink-0">
                          {expandedManager === team.managerCode ? "▲" : "▼"}
                        </span>
                      </button>

                      {/* Thành viên trong team */}
                      {expandedManager === team.managerCode && (
                        <div className="bg-gray-50/70 border-t border-gray-100 py-1">
                          {(team.members || []).map((member) => (
                            <button
                              key={member.employeeCode}
                              onClick={() => {
                                setViewingTarget({
                                  code: member.employeeCode,
                                  name: member.hoTen,
                                  type: "staff",
                                });
                              }}
                              className={`w-full flex items-center gap-1.5 pl-7 pr-3 py-1.5 text-xs transition cursor-pointer ${
                                viewingTarget?.code === member.employeeCode
                                  ? "bg-[#009999]/15 text-[#009999] font-bold"
                                  : "hover:bg-white text-gray-600"
                              }`}
                            >
                              <span className="text-gray-300">└</span>
                              <span className="truncate">{member.hoTen}</span>
                            </button>
                          ))}
                          {(team.members || []).length === 0 && (
                            <p className="pl-7 pr-3 py-1 text-[11px] text-gray-400 italic">Chưa có thành viên</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredTeams.length === 0 && (
                    <p className="p-4 text-xs text-gray-400 text-center">Không tìm thấy team phù hợp.</p>
                  )}
                </div>
              )}

              {/* ── CÂY DANH SÁCH: TOÀN BỘ NHÂN VIÊN (Hoặc khi không có team) ── */}
              {(currentMode === "all_staff" || !hasTeams) && (
                <div className="divide-y divide-gray-50">
                  {sidebarFilteredStaff.map((staff) => {
                    const isSelected = viewingTarget?.code === (staff.employeeCode || staff.maNhanSu);
                    return (
                      <button
                        key={staff.employeeCode || staff.maNhanSu}
                        onClick={() =>
                          setViewingTarget({
                            code: staff.employeeCode || staff.maNhanSu,
                            name: staff.hoTen,
                            type: staff.isManager ? "manager" : "staff",
                          })
                        }
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer text-left ${
                          isSelected
                            ? "bg-[#009999]/10 text-[#009999] font-bold"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm">
                            {staff.isManager ? "👔" : "👤"}
                          </span>
                          <div className="truncate">
                            <p className="truncate font-medium">{staff.hoTen}</p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {staff.employeeCode || staff.maNhanSu}
                              {staff.chucVu ? ` • ${staff.chucVu}` : ""}
                            </p>
                          </div>
                        </div>
                        {staff.isManager && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-semibold flex-shrink-0">
                            Manager
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {sidebarFilteredStaff.length === 0 && !officeLoading && (
                    <p className="p-4 text-xs text-gray-400 text-center">
                      Chưa có dữ liệu nhân sự.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Spin>
        </div>
      </div>

      {/* ══════════════════════════════════════
           NỘI DUNG CHÍNH (Main Workspace)
          ══════════════════════════════════════ */}
      <div className="flex-1 min-w-0">
        {/* ── CHẾ ĐỘ XEM TỔNG QUAN CÔNG TY ── */}
        {!viewingTarget && (
          <>
            {/* Header Tổng quan & Chuyển hướng OFFICEWORK */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span>🏢</span> MYOFFICE — Tổng quan công ty
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {currentMode === "team" && hasTeams
                    ? "Theo dõi hiệu suất toàn công ty phân bổ theo từng Team & Manager"
                    : "Theo dõi thống kê & hiệu suất toàn bộ nhân viên trong công ty"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/timesheet/officework")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#009999] hover:bg-[#007a7a] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <FileText size={15} />
                  <span>📋 Bảng OFFICEWORK →</span>
                </button>
              </div>
            </div>

            {/* ── CẢNH BÁO TỈ LỆ ĐÓNG GÓP HỒ SƠ > 100% TOÀN CÔNG TY (GIỮ NGUYÊN) ── */}
            {officeOverContributed.length > 0 && (
              <div className="mb-4 p-4 bg-red-50/90 border-l-4 border-red-500 rounded-2xl shadow-sm border border-red-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-red-100 text-red-700 rounded-xl flex-shrink-0">
                    <AlertTriangle size={20} />
                  </span>
                  <div>
                    <h4 className="font-bold text-red-900 text-sm flex items-center gap-2">
                      <span>Cảnh báo quản trị: Phát hiện {officeOverContributed.length} hồ sơ có tỉ lệ đóng góp vượt 100%</span>
                    </h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      Một số hồ sơ đang có tổng tỉ lệ đóng góp của các nhân sự vượt quá 100%. Quản trị viên vui lòng kiểm tra và xử lý:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {officeOverContributed.map((item) => (
                        <span
                          key={item.caseCode}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white text-red-800 text-xs font-medium border border-red-200 shadow-2xs"
                        >
                          📁 <strong>{item.caseCode}</strong>: Tổng{" "}
                          <span className="text-red-600 font-bold">{item.totalContribution}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/timesheet/officework")}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex-shrink-0"
                >
                  Kiểm tra ngay →
                </button>
              </div>
            )}

            {/* ── KPI TỔNG HỢP TOÀN CÔNG TY ── */}
            <KpiSummaryBar
              kpi={officeKpi}
              loading={officeLoading}
              period={kpiPeriod}
              onPeriodChange={handleKpiPeriodChange}
              showBreakdown={true}
              breakdown={officeKpi.breakdown}
              onStaffClick={handleBreakdownClick}
            />

            {/* ── BẢNG DỮ LIỆU HIỆU SUẤT (TÙY CHỌN XEM: TEAM HOẶC TOÀN BỘ NHÂN VIÊN) ── */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              {/* Header của bảng: Segmented Switch + Search & Sort */}
              <div className="p-4 bg-gray-50/90 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Bộ chuyển đổi Option xem (Option Switcher) */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex bg-gray-200/80 p-1 rounded-xl text-xs font-medium">
                    <button
                      onClick={() => handleSelectMode("team")}
                      disabled={!hasTeams}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                        currentMode === "team" && hasTeams
                          ? "bg-white text-[#009999] shadow-xs font-bold"
                          : hasTeams
                          ? "text-gray-600 hover:text-gray-900"
                          : "text-gray-400 cursor-not-allowed opacity-60"
                      }`}
                      title={!hasTeams ? "Công ty chưa có team nào (0 team)" : "Xem hiệu suất từng team"}
                    >
                      <span>🏢 Hiệu suất từng Team</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        hasTeams ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-400"
                      }`}>
                        {teams.length}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectMode("all_staff")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                        currentMode === "all_staff" || !hasTeams
                          ? "bg-white text-[#009999] shadow-xs font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span>👥 Hiệu suất toàn bộ nhân viên</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800">
                        {allStaffList.length}
                      </span>
                    </button>
                  </div>

                  {!hasTeams && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                      ⚠️ Hiện tại công ty chưa phân chia Team. Đang hiển thị danh sách toàn bộ nhân viên.
                    </span>
                  )}
                </div>

                {/* Search & Sort Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={currentMode === "team" && hasTeams ? "Tìm Manager / Team..." : "Tìm nhân viên, mã, chức vụ..."}
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#009999] w-48 md:w-56"
                    />
                  </div>

                  {currentMode === "all_staff" && (
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 text-xs cursor-pointer focus:outline-none focus:border-[#009999]"
                    >
                      <option value="hours_desc">⏱️ Giờ giảm dần</option>
                      <option value="kpi_desc">🎯 KPI % giảm dần</option>
                      <option value="amount_desc">💰 Doanh thu giảm dần</option>
                      <option value="name_asc">🔤 Tên A-Z</option>
                    </select>
                  )}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                   BẢNG 1: HIỆU SUẤT THEO TỪNG TEAM (Khi có team & chọn team)
                  ───────────────────────────────────────────────────────────── */}
              {currentMode === "team" && hasTeams && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#009999] text-white">
                      <tr className="text-white text-xs">
                        <th className="px-4 py-3 text-left font-semibold text-white">Manager / Team</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">Số NV</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">Tổng giờ</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">KPI %</th>
                        <th className="px-4 py-3 text-right font-semibold text-white">Doanh thu</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officeLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                            <Spin size="small" /> <span className="ml-2">Đang tải dữ liệu...</span>
                          </td>
                        </tr>
                      ) : filteredTeams.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                            Không tìm thấy Team nào phù hợp với từ khóa tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredTeams.map((t) => {
                          const rate = Number(t.teamCompletionRate ?? 0);
                          const badgeCls =
                            rate > 100
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : rate >= 100
                              ? "bg-green-100 text-green-700 border-green-300"
                              : rate >= 50
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : "bg-red-100 text-red-700 border-red-300";
                          const isExpanded = expandedManager === t.managerCode;

                          return (
                            <React.Fragment key={t.managerCode}>
                              <tr
                                onClick={() => setExpandedManager(isExpanded ? null : t.managerCode)}
                                className={`border-b transition cursor-pointer ${
                                  isExpanded ? "bg-teal-50/40" : "hover:bg-gray-50"
                                }`}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{isExpanded ? "▼" : "▶"}</span>
                                    <div>
                                      <p className="font-semibold text-gray-800">{t.managerName}</p>
                                      <p className="text-xs text-gray-400 font-mono">{t.managerCode}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600 font-medium">
                                  {(t.members || []).length}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-orange-600">
                                  {Number(t.teamTotalHours || 0).toFixed(1)}h
                                  {t.teamTargetHours ? (
                                    <span className="text-xs text-gray-400 font-normal"> / {t.teamTargetHours}h</span>
                                  ) : null}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeCls}`}>
                                    {rate.toFixed(0)}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-indigo-600 font-semibold">
                                  {money(t.teamTotalAmount)}đ
                                </td>
                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() =>
                                        setViewingTarget({
                                          code: t.managerCode,
                                          name: t.managerName,
                                          type: "manager",
                                        })
                                      }
                                      className="px-2.5 py-1 bg-[#009999]/10 hover:bg-[#009999] hover:text-white text-[#009999] rounded-lg text-xs font-medium transition cursor-pointer"
                                      title="Xem timesheet của Manager"
                                    >
                                      MYTIME →
                                    </button>
                                    <button
                                      onClick={() => setExpandedManager(isExpanded ? null : t.managerCode)}
                                      className="px-2 py-1 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg text-xs transition cursor-pointer"
                                    >
                                      {isExpanded ? "Thu gọn" : "Chi tiết"}
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Bảng con: Thành viên trong team */}
                              {isExpanded && (
                                <tr className="bg-gray-50/70 border-b">
                                  <td colSpan={6} className="px-6 py-3">
                                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs">
                                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                        <span className="text-xs font-semibold text-gray-600">
                                          Thành viên trong team của {t.managerName}:
                                        </span>
                                        <button
                                          onClick={() =>
                                            window.open(`/timesheet/myteam?managerCode=${t.managerCode}`, "_blank")
                                          }
                                          className="text-xs text-[#009999] hover:underline"
                                        >
                                          Mở trang MYTEAM ↗
                                        </button>
                                      </div>
                                      {(t.members || []).length === 0 ? (
                                        <p className="text-xs text-gray-400 py-2 text-center">Chưa có thành viên nào.</p>
                                      ) : (
                                        <table className="w-full text-xs text-gray-600">
                                          <thead className="bg-[#009999] text-white">
                                            <tr className="text-white">
                                              <th className="px-3 py-2 text-left font-semibold text-white rounded-l-lg">
                                                Nhân viên
                                              </th>
                                              <th className="px-3 py-2 text-center font-semibold text-white">
                                                Tổng giờ
                                              </th>
                                              <th className="px-3 py-2 text-center font-semibold text-white">
                                                KPI %
                                              </th>
                                              <th className="px-3 py-2 text-right font-semibold text-white">
                                                Doanh thu
                                              </th>
                                              <th className="px-3 py-2 text-right font-semibold text-white rounded-r-lg">
                                                Hành động
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-50">
                                            {(t.members || []).map((m) => (
                                              <tr key={m.employeeCode} className="hover:bg-gray-50 transition">
                                                <td className="py-2">
                                                  <span className="font-semibold text-gray-800">{m.hoTen}</span>
                                                  <span className="text-gray-400 font-mono ml-1.5">
                                                    ({m.employeeCode})
                                                  </span>
                                                </td>
                                                <td className="py-2 text-center font-medium text-orange-600">
                                                  {Number(m.totalHours || 0).toFixed(1)}h
                                                </td>
                                                <td className="py-2 text-center">
                                                  <span className="font-semibold text-teal-700">
                                                    {Number(m.completionRate || 0).toFixed(0)}%
                                                  </span>
                                                </td>
                                                <td className="py-2 text-right text-indigo-600 font-medium">
                                                  {money(m.totalAmount)}đ
                                                </td>
                                                <td className="py-2 text-right">
                                                  <button
                                                    onClick={() =>
                                                      setViewingTarget({
                                                        code: m.employeeCode,
                                                        name: m.hoTen,
                                                        type: "staff",
                                                      })
                                                    }
                                                    className="px-2 py-0.5 bg-teal-50 hover:bg-[#009999] hover:text-white text-[#009999] rounded text-[11px] font-medium transition cursor-pointer"
                                                  >
                                                    Xem MYTIME
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                   BẢNG 2: HIỆU SUẤT TOÀN BỘ NHÂN VIÊN (Toàn công ty)
                  ───────────────────────────────────────────────────────────── */}
              {(currentMode === "all_staff" || !hasTeams) && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#009999] text-white">
                      <tr className="text-white text-xs">
                        <th className="px-4 py-3 text-left font-semibold text-white">Nhân viên</th>
                        <th className="px-4 py-3 text-left font-semibold text-white">Chức vụ / Phòng ban</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">Số records</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">Tổng giờ</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">KPI %</th>
                        <th className="px-4 py-3 text-right font-semibold text-white">Doanh thu</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officeLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                            <Spin size="small" /> <span className="ml-2">Đang tải dữ liệu...</span>
                          </td>
                        </tr>
                      ) : filteredStaff.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                            Chưa có dữ liệu nhân viên trong kỳ này.
                          </td>
                        </tr>
                      ) : (
                        filteredStaff.map((staff) => {
                          const rate = Number(staff.completionRate || 0);
                          const badgeCls =
                            rate > 100
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : rate >= 100
                              ? "bg-green-100 text-green-700 border-green-300"
                              : rate >= 50
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : "bg-red-100 text-red-700 border-red-300";

                          const isManager = staff.isManager || staff.Role === "manager";
                          const isDirector = staff.Role === "admin" || staff.Role === "ceo";

                          return (
                            <tr
                              key={staff.employeeCode || staff.maNhanSu}
                              className="border-b hover:bg-teal-50/20 transition cursor-pointer"
                              onClick={() =>
                                setViewingTarget({
                                  code: staff.employeeCode || staff.maNhanSu,
                                  name: staff.hoTen,
                                  type: isManager ? "manager" : "staff",
                                })
                              }
                            >
                              {/* Cột 1: Thông tin nhân sự */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#009999]/10 text-[#009999] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {(staff.hoTen || "N").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-semibold text-gray-800 leading-tight">{staff.hoTen}</p>
                                      {isDirector ? (
                                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                          Ban Giám đốc
                                        </span>
                                      ) : isManager ? (
                                        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                                          Trưởng nhóm
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 text-[10px] rounded">
                                          Nhân viên
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono">
                                      {staff.employeeCode || staff.maNhanSu}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Cột 2: Chức vụ / Phòng ban */}
                              <td className="px-4 py-3 text-xs text-gray-600">
                                <p className="font-medium text-gray-700">{staff.chucVu || "—"}</p>
                                {staff.phongBan && (
                                  <p className="text-gray-400 text-[11px]">{staff.phongBan}</p>
                                )}
                              </td>

                              {/* Cột 3: Số records */}
                              <td className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                                {staff.recordCount ?? "—"}
                              </td>

                              {/* Cột 4: Tổng giờ */}
                              <td className="px-4 py-3 text-center font-semibold text-orange-600 text-xs">
                                {Number(staff.totalHours || 0).toFixed(1)}h
                                {staff.targetHours ? (
                                  <span className="text-gray-400 font-normal"> / {staff.targetHours}h</span>
                                ) : null}
                              </td>

                              {/* Cột 5: KPI % */}
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeCls}`}>
                                  {rate.toFixed(0)}%
                                </span>
                              </td>

                              {/* Cột 6: Doanh thu */}
                              <td className="px-4 py-3 text-right text-indigo-600 font-semibold text-xs">
                                {money(staff.totalAmount)}đ
                              </td>

                              {/* Cột 7: Thao tác */}
                              <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() =>
                                    setViewingTarget({
                                      code: staff.employeeCode || staff.maNhanSu,
                                      name: staff.hoTen,
                                      type: isManager ? "manager" : "staff",
                                    })
                                  }
                                  className="px-2.5 py-1 bg-[#009999]/10 hover:bg-[#009999] hover:text-white text-[#009999] rounded-lg text-xs font-medium transition cursor-pointer"
                                  title="Xem timesheet của nhân sự này"
                                >
                                  MYTIME →
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── CHẾ ĐỘ XEM MYTIME CỦA 1 NHÂN VIÊN / MANAGER (READ-ONLY) ── */}
        {viewingTarget && (
          <>
            <div className="bg-white px-4 py-3 rounded-lg shadow-md mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewingTarget(null)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition cursor-pointer flex items-center gap-1 font-medium"
                >
                  ← Quay lại tổng quan
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">
                  {viewingTarget.type === "manager" ? "👔 Manager / Trưởng nhóm:" : "👤 Nhân viên:"}{" "}
                  <strong className="text-[#009999]">{viewingTarget.name}</strong>{" "}
                  <span className="text-xs text-gray-400 font-mono">({viewingTarget.code})</span>
                </span>
              </div>

              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                Chế độ xem quản trị (Read-only)
              </span>
            </div>

            <TimesheetMyTime
              viewMode="other"
              targetEmployeeCode={viewingTarget.code}
            />
          </>
        )}
      </div>
    </div>
  );
}
