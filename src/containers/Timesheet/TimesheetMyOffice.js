import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { AlertTriangle, FileText } from "lucide-react";
import KpiSummaryBar from "./KpiSummaryBar";
import TimesheetMyTime from "./TimesheetMyTime";
import callAPI from "../../utils/api";
import dayjs from "dayjs";

const money = (v) => Number(v || 0).toLocaleString("vi-VN");

/**
 * TimesheetMyOffice — Chỉ hiển thị cho CEO/Admin
 * - KPI tổng quan toàn công ty
 * - Sidebar: danh sách Manager → NV trong team
 * - Click vào Manager / NV → xem MYTIME (read-only)
 */
export default function TimesheetMyOffice() {
  const navigate = useNavigate();

  // ── KPI tổng công ty ──
  const [officeSummary, setOfficeSummary] = useState({});
  const [officeLoading, setOfficeLoading] = useState(false);
  const [kpiPeriod, setKpiPeriod] = useState("month");
  const [kpiParams, setKpiParams] = useState({
    year: dayjs().year(), month: dayjs().month() + 1,
    week: Math.ceil(dayjs().date() / 7), quarter: Math.ceil((dayjs().month() + 1) / 3),
  });

  // ── Cảnh báo hồ sơ > 100% toàn công ty ──
  const [officeOverContributed, setOfficeOverContributed] = useState([]);

  // ── Sidebar navigation ──
  const [selectedManager, setSelectedManager] = useState(null);
  const [expandedManager, setExpandedManager] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [viewingTarget, setViewingTarget] = useState(null); // { code, name, type: "manager"|"staff" }

  const fetchOfficeSummary = useCallback(async (period, params) => {
    setOfficeLoading(true);
    try {
      const [res, sumRes] = await Promise.all([
        callAPI({
          method: "post", endpoint: "/timesheet/office-summary",
          data: { period, ...params },
        }),
        callAPI({
          method: "post", endpoint: "/timesheet/summary",
          data: { status: "APPROVED" },
        }),
      ]);
      setOfficeSummary(res?.officeSummary || {});
      setOfficeOverContributed(sumRes?.summary?.overContributedCases || []);
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

  const teams = officeSummary.teams || [];

  // ── KPI office tổng dạng flat để KpiSummaryBar dùng ──
  const officeKpi = {
    totalHours: officeSummary.totalHours,
    targetHours: officeSummary.targetHours,
    completionRate: officeSummary.completionRate,
    totalAmount: officeSummary.totalAmount,
    recordCount: officeSummary.recordCount,
    // breakdown: từng team hiển thị như NV
    breakdown: teams.map((t) => ({
      employeeCode: t.managerCode,
      hoTen: `[Team] ${t.managerName}`,
      totalHours: t.teamTotalHours,
      completionRate: t.teamCompletionRate,
      totalAmount: t.teamTotalAmount,
    })),
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen flex gap-4">
      {/* ══════════════════════
           SIDEBAR TRÁI (Manager list)
          ══════════════════════ */}
      <div className="w-72 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 sticky top-4">
          <div className="px-4 py-3 bg-[#009999] text-white">
            <h3 className="font-bold text-sm">🏢 Cơ cấu công ty</h3>
          </div>
          <Spin spinning={officeLoading}>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Mục "Tổng quan" */}
              <button
                onClick={() => { setViewingTarget(null); setSelectedManager(null); setSelectedStaff(null); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition cursor-pointer ${
                  !viewingTarget ? "bg-[#009999]/10 text-[#009999] font-semibold" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span>📊</span> Tổng quan toàn công ty
              </button>

              <div className="border-t border-gray-100" />

              {teams.map((team) => (
                <div key={team.managerCode}>
                  {/* Manager row */}
                  <button
                    onClick={() => {
                      setExpandedManager(expandedManager === team.managerCode ? null : team.managerCode);
                      setViewingTarget({ code: team.managerCode, name: team.managerName, type: "manager" });
                      setSelectedStaff(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition cursor-pointer ${
                      viewingTarget?.code === team.managerCode && viewingTarget?.type === "manager"
                        ? "bg-[#009999]/10 text-[#009999] font-semibold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>{team.managerName}</span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {expandedManager === team.managerCode ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* NV trong team (expandable) */}
                  {expandedManager === team.managerCode && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {(team.members || []).map((member) => (
                        <button
                          key={member.employeeCode}
                          onClick={() => {
                            setViewingTarget({ code: member.employeeCode, name: member.hoTen, type: "staff" });
                          }}
                          className={`w-full flex items-center gap-2 pl-8 pr-4 py-2 text-xs transition cursor-pointer ${
                            viewingTarget?.code === member.employeeCode && viewingTarget?.type === "staff"
                              ? "bg-[#009999]/10 text-[#009999] font-semibold"
                              : "hover:bg-white text-gray-600"
                          }`}
                        >
                          <span>└─</span>
                          <span>{member.hoTen}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {teams.length === 0 && !officeLoading && (
                <p className="p-4 text-xs text-gray-400 text-center">
                  Chưa có dữ liệu. Vui lòng kiểm tra API /timesheet/office-summary.
                </p>
              )}
            </div>
          </Spin>
        </div>
      </div>

      {/* ══════════════════════
           NỘI DUNG CHÍNH
          ══════════════════════ */}
      <div className="flex-1 min-w-0">
        {/* Tổng quan công ty */}
        {!viewingTarget && (
          <>
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-gray-700">🏢 MYOFFICE — Tổng quan công ty</h2>
                <p className="text-sm text-gray-500 mt-1">Hiệu suất toàn công ty theo từng team</p>
              </div>
              <button
                onClick={() => navigate("/timesheet/officework")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#009999] hover:bg-[#007a7a] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer self-start md:self-auto"
              >
                <FileText size={15} />
                <span>📋 Bảng OFFICEWORK →</span>
              </button>
            </div>

            {/* ── CẢNH BÁO TỈ LỆ ĐÓNG GÓP HỒ SƠ > 100% TOÀN CÔNG TY ── */}
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

            <KpiSummaryBar
              kpi={officeKpi}
              loading={officeLoading}
              period={kpiPeriod}
              onPeriodChange={handleKpiPeriodChange}
              showBreakdown={true}
              breakdown={officeKpi.breakdown}
              onStaffClick={(code) => {
                const team = teams.find((t) => t.managerCode === code);
                if (team) setViewingTarget({ code, name: team.managerName, type: "manager" });
              }}
            />

            {/* Bảng tổng quan từng team dạng expandable */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm">📋 Hiệu suất từng team (Nhấn để xem chi tiết thành viên)</h3>
                <span className="text-xs text-gray-400">{teams.length} teams</span>
              </div>
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
                    {teams.map((t) => {
                      const rate = Number(t.teamCompletionRate ?? 0);
                      const badgeCls = rate > 100 ? "bg-blue-100 text-blue-700 border-blue-300"
                        : rate >= 100 ? "bg-green-100 text-green-700 border-green-300"
                        : rate >= 50 ? "bg-yellow-100 text-yellow-700 border-yellow-300"
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
                            <td className="px-4 py-3 text-center text-gray-600">{(t.members || []).length}</td>
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
                                  onClick={() => setViewingTarget({ code: t.managerCode, name: t.managerName, type: "manager" })}
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

                          {/* Expandable breakdown table for team members */}
                          {isExpanded && (
                            <tr className="bg-gray-50/70 border-b">
                              <td colSpan={6} className="px-6 py-3">
                                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs">
                                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                    <span className="text-xs font-semibold text-gray-600">
                                      Thành viên trong team của {t.managerName}:
                                    </span>
                                    <button
                                      onClick={() => window.open(`/timesheet/myteam?managerCode=${t.managerCode}`, "_blank")}
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
                                          <th className="px-3 py-2 text-left font-semibold text-white rounded-l-lg">Nhân viên</th>
                                          <th className="px-3 py-2 text-center font-semibold text-white">Tổng giờ</th>
                                          <th className="px-3 py-2 text-center font-semibold text-white">KPI %</th>
                                          <th className="px-3 py-2 text-right font-semibold text-white">Doanh thu</th>
                                          <th className="px-3 py-2 text-right font-semibold text-white rounded-r-lg">Hành động</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-50">
                                        {(t.members || []).map((m) => (
                                          <tr key={m.employeeCode} className="hover:bg-gray-50 transition">
                                            <td className="py-2">
                                              <span className="font-semibold text-gray-800">{m.hoTen}</span>
                                              <span className="text-gray-400 font-mono ml-1.5">({m.employeeCode})</span>
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
                    })}
                    {teams.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Xem MYTIME của Manager hoặc NV */}
        {viewingTarget && (
          <>
            <div className="bg-white px-4 py-3 rounded-lg shadow-md mb-4 flex items-center gap-3">
              <button
                onClick={() => setViewingTarget(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition cursor-pointer"
              >
                ← Quay lại tổng quan
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500">
                {viewingTarget.type === "manager" ? "👔 Manager:" : "👤 Nhân viên:"}
                {" "}<strong className="text-[#009999]">{viewingTarget.name}</strong>
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
