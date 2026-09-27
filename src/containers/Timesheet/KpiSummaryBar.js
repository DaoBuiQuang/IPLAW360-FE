import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

/**
 * completionRate < 50  → đỏ
 * 50 ≤ rate < 100     → vàng
 * rate === 100         → xanh lá
 * rate > 100           → xanh dương
 */
function getKpiColorFixed(rate) {
  if (rate > 100)   return { bg: "bg-blue-50",   border: "border-blue-400",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-800 border-blue-300",   bar: "bg-blue-500"   };
  if (rate >= 100)  return { bg: "bg-green-50",  border: "border-green-400",  text: "text-green-700",  badge: "bg-green-100 text-green-800 border-green-300",  bar: "bg-green-500"  };
  if (rate >= 50)   return { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-800 border-yellow-300",bar: "bg-yellow-500" };
  return             { bg: "bg-red-50",    border: "border-red-400",    text: "text-red-700",    badge: "bg-red-100 text-red-800 border-red-300",      bar: "bg-red-500"    };
}

const PERIOD_OPTIONS = [
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
  { label: "Quý", value: "quarter" },
  { label: "Năm", value: "year" },
];

const money = (v) => Number(v || 0).toLocaleString("vi-VN");

/**
 * KpiSummaryBar — Component tổng hợp KPI dùng chung cho MYTIME, MYTEAM, MYOFFICE
 *
 * Props:
 *  - kpi: { totalHours, targetHours, completionRate, totalAmount, recordCount }
 *  - loading: boolean
 *  - period: "week" | "month" | "quarter" | "year"
 *  - year, month, week, quarter: numbers
 *  - onPeriodChange(period, { year, month, week, quarter })
 *  - showBreakdown: boolean — hiện bảng chi tiết NV (cho Manager/CEO)
 *  - breakdown: [{ employeeCode, hoTen, totalHours, completionRate, totalAmount }]
 *  - onStaffClick(maNhanSu) — callback khi click vào tên NV trong breakdown
 */
export default function KpiSummaryBar({
  kpi = {},
  loading = false,
  period = "month",
  year: propYear,
  month: propMonth,
  week: propWeek,
  quarter: propQuarter,
  onPeriodChange,
  showBreakdown = false,
  breakdown = [],
  onStaffClick,
}) {
  const now = dayjs();
  const [localPeriod, setLocalPeriod] = useState(period);
  const [localYear, setLocalYear] = useState(propYear ?? now.year());
  const [localMonth, setLocalMonth] = useState(propMonth ?? now.month() + 1);
  const [localWeek, setLocalWeek] = useState(propWeek ?? Math.ceil(now.date() / 7));
  const [localQuarter, setLocalQuarter] = useState(propQuarter ?? Math.ceil((now.month() + 1) / 3));

  const completionRate = Number(kpi.completionRate ?? 0);
  const color = getKpiColorFixed(completionRate);

  const triggerChange = (p, y, m, w, q) => {
    setLocalPeriod(p);
    setLocalYear(y);
    setLocalMonth(m);
    setLocalWeek(w);
    setLocalQuarter(q);
    onPeriodChange?.(p, { year: y, month: m, week: w, quarter: q });
  };

  const handleQuickSelect = (p) => {
    const y = now.year();
    const m = now.month() + 1;
    const w = Math.ceil(now.date() / 7);
    const q = Math.ceil(m / 3);
    triggerChange(p, y, m, w, q);
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.year() - 2 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const weekOptions = [1, 2, 3, 4, 5];
  const quarterOptions = [1, 2, 3, 4];

  return (
    <div className={`rounded-xl border-l-4 p-4 mb-4 ${color.bg} ${color.border} transition-all duration-300`}>
      {/* ── Header + quick buttons ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-700">📊 KPI Tổng hợp</span>
          {loading && <span className="text-xs text-gray-400 animate-pulse">Đang tải...</span>}
        </div>
        <div className="flex flex-wrap gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleQuickSelect(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                localPeriod === opt.value
                  ? "bg-[#009999] text-white border-[#009999]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#009999] hover:text-[#009999]"
              }`}
            >
              {opt.label} này
            </button>
          ))}
        </div>
      </div>

      {/* ── Dropdown chọn mốc cụ thể ── */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <select
          value={localYear}
          onChange={(e) => triggerChange(localPeriod, +e.target.value, localMonth, localWeek, localQuarter)}
          className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 text-xs cursor-pointer"
        >
          {yearOptions.map((y) => <option key={y} value={y}>Năm {y}</option>)}
        </select>

        {localPeriod === "quarter" && (
          <select
            value={localQuarter}
            onChange={(e) => triggerChange(localPeriod, localYear, localMonth, localWeek, +e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 text-xs cursor-pointer"
          >
            {quarterOptions.map((q) => <option key={q} value={q}>Quý {q}</option>)}
          </select>
        )}

        {(localPeriod === "month" || localPeriod === "week") && (
          <select
            value={localMonth}
            onChange={(e) => triggerChange(localPeriod, localYear, +e.target.value, localWeek, localQuarter)}
            className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 text-xs cursor-pointer"
          >
            {monthOptions.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
        )}

        {localPeriod === "week" && (
          <select
            value={localWeek}
            onChange={(e) => triggerChange(localPeriod, localYear, localMonth, +e.target.value, localQuarter)}
            className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 text-xs cursor-pointer"
          >
            {weekOptions.map((w) => <option key={w} value={w}>Tuần {w}</option>)}
          </select>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">⏱️ Tổng giờ</p>
          <p className={`text-xl font-bold ${color.text}`}>
            {Number(kpi.totalHours || 0).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}h
          </p>
          {kpi.targetHours > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">/ {Number(kpi.targetHours || 0)}h mục tiêu</p>
          )}
        </div>

        <div className={`rounded-xl p-3 shadow-sm border ${color.badge}`}>
          <p className="text-xs mb-1 opacity-70">🎯 Tỷ lệ hoàn thành KPI</p>
          <p className="text-xl font-bold">{completionRate.toFixed(1)}%</p>
          <div className="mt-1.5 bg-white/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">📝 Số time record</p>
          <p className="text-xl font-bold text-[#009999]">{kpi.recordCount || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">💰 Tổng doanh thu</p>
          <p className="text-xl font-bold text-indigo-600">{money(kpi.totalAmount)}đ</p>
        </div>
      </div>

      {/* ── Breakdown theo NV ── */}
      {showBreakdown && breakdown.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Chi tiết theo nhân sự</p>
          <table className="w-full text-xs bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-[#009999] text-white">
              <tr className="text-white">
                <th className="px-3 py-2 text-left font-semibold text-white">Nhân sự</th>
                <th className="px-3 py-2 text-center font-semibold text-white">Giờ</th>
                <th className="px-3 py-2 text-center font-semibold text-white">KPI</th>
                <th className="px-3 py-2 text-right font-semibold text-white">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item) => {
                const rate = Number(item.completionRate ?? 0);
                const c = getKpiColorFixed(rate);
                return (
                  <tr
                    key={item.employeeCode}
                    className="border-t border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => onStaffClick?.(item.employeeCode)}
                    title={onStaffClick ? `Xem MYTIME của ${item.hoTen}` : undefined}
                  >
                    <td className="px-3 py-2 font-medium text-[#009999] hover:underline">
                      {item.hoTen} <span className="text-gray-400 font-normal">({item.employeeCode})</span>
                    </td>
                    <td className="px-3 py-2 text-center text-orange-600 font-semibold">
                      {Number(item.totalHours || 0).toFixed(1)}h
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.badge}`}>
                        {rate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-indigo-600 font-semibold">
                      {money(item.totalAmount)}đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
