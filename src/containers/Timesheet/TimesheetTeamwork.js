import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DatePicker, Modal, Pagination, Spin, Select } from "antd";
import { toast } from "react-toastify";
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  ArrowLeft,
  RefreshCw,
  Eye,
} from "lucide-react";
import CaseCodeSelect from "./CaseCodeSelect";
import ActivitySelect from "./ActivitySelect";
import callAPI from "../../utils/api";

const statusMap = { APPROVED: "Đã duyệt" };
const money = (value) => Number(value || 0).toLocaleString("vi-VN");
const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export default function TimesheetTeamwork() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useSelector((state) => state.auth.role);
  const currentMaNhanSu = localStorage.getItem("maNhanSu") || "";

  const isAdmin = role === "admin" || role === "ceo";
  const isManager = role === "manager";

  // URL param managerCode (nếu admin truyền) hoặc mã của chính user
  const paramManagerCode = searchParams.get("managerCode");
  const [selectedManagerCode, setSelectedManagerCode] = useState(
    paramManagerCode || (isAdmin ? "" : currentMaNhanSu)
  );
  const activeManagerCode = selectedManagerCode || currentMaNhanSu;

  // ── Danh sách Manager để Admin chọn team ──
  const [managersList, setManagersList] = useState([]);

  // ── Danh sách thành viên team ──
  const [teamInfo, setTeamInfo] = useState({ manager: null, members: [] });
  const [teamMembersList, setTeamMembersList] = useState([]);

  // ── Bảng dữ liệu ──
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeCode: "",
    caseCode: "",
    customerCode: "",
    partnerCode: "",
    activity: "",
    searchText: "",
    fromDate: "",
    toDate: "",
  });
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalItems: 0,
  });
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalHours: 0,
    totalAmount: 0,
  });

  // Modal chi tiết record
  const [viewingRecord, setViewingRecord] = useState(null);

  // ── Helpers ──
  const setFilter = (key, value) =>
    setFilters((old) => ({ ...old, [key]: value }));

  // ── Fetch danh sách Manager (cho Admin) ──
  useEffect(() => {
    if (isAdmin) {
      callAPI({ method: "post", endpoint: "/team/list", data: { pageSize: 100 } })
        .then((res) => {
          const tList = res?.teams || [];
          const mgrs = tList.map((t) => ({
            value: t.managerCode,
            label: `${t.managerCode} - ${t.managerName} (${(t.members || []).length} TV)`,
          }));
          setManagersList(mgrs);
          if (!selectedManagerCode && mgrs.length > 0) {
            setSelectedManagerCode(mgrs[0].value);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch thông tin team và danh sách thành viên ──
  const fetchTeamMembers = useCallback(async (mgrCode = activeManagerCode) => {
    try {
      const payload = isAdmin && mgrCode ? { managerCode: mgrCode } : {};
      const res = await callAPI({
        method: "post",
        endpoint: "/staff/myteam",
        data: payload,
      });
      const members = res?.members || res?.data || (Array.isArray(res) ? res : []);
      setTeamInfo({ manager: res?.manager || null, members });
      setTeamMembersList(members);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách team:", err);
      setTeamMembersList([]);
    }
  }, [isAdmin, activeManagerCode]);

  useEffect(() => {
    if (activeManagerCode) {
      fetchTeamMembers(activeManagerCode);
    }
  }, [activeManagerCode, fetchTeamMembers]);

  // ── Tạo payload filter ──
  const getFilterPayload = useCallback(() => {
    const payload = {
      status: "APPROVED",
      caseCode: filters.caseCode || undefined,
      customerCode: filters.customerCode || undefined,
      partnerCode: filters.partnerCode || undefined,
      activity: filters.activity || undefined,
      searchText: filters.searchText || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    };

    if (filters.employeeCode) {
      payload.employeeCode = filters.employeeCode;
    } else if (isAdmin && activeManagerCode) {
      // Admin filter theo team của manager cụ thể
      // Fallback: nếu BE chưa hỗ trợ teamManagerCode trực tiếp, truyền employeeCodes của cả team
      payload.teamManagerCode = activeManagerCode;
    }

    return payload;
  }, [filters, isAdmin, activeManagerCode]);

  // ── Fetch danh sách time records của team ──
  const fetchRows = useCallback(
    async (pageIndex = pagination.pageIndex, pageSize = pagination.pageSize) => {
      setLoading(true);
      try {
        const payload = getFilterPayload();

        // Với Manager: BE listTimeSheets tự động lọc theo team nếu không truyền employeeCode
        // Với Admin: gửi teamManagerCode
        const [response, summaryResponse] = await Promise.all([
          callAPI({
            method: "post",
            endpoint: "/timesheet/list",
            data: { ...payload, pageIndex, pageSize },
          }),
          callAPI({
            method: "post",
            endpoint: "/timesheet/summary",
            data: payload,
          }),
        ]);

        const rawData = response?.data || [];
        setRows(rawData);
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
          }
        );
      } catch (err) {
        console.error("Lỗi khi tải bảng time records của team:", err);
      } finally {
        setLoading(false);
      }
    },
    [getFilterPayload, pagination.pageIndex, pagination.pageSize]
  );

  useEffect(() => {
    fetchRows(1, pagination.pageSize);
  }, [activeManagerCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Giám sát tỉ lệ đóng góp theo từng mã hồ sơ (> 100%) ──
  const caseContributions = rows.reduce((acc, row) => {
    if (!row.caseCode) return acc;
    const rate = Number(row.contributionPercentage ?? row.contributionRate ?? 100);
    if (!acc[row.caseCode]) {
      acc[row.caseCode] = { total: 0, employees: new Set() };
    }
    acc[row.caseCode].total += rate;
    const empName = row.employee?.hoTen || row.employeeCode;
    if (empName) acc[row.caseCode].employees.add(empName);
    return acc;
  }, {});

  const overContributedCases = Object.entries(caseContributions).filter(
    ([, data]) => data.total > 100
  );

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {/* ══════════════════════════════════
           PAGE HEADER & NAVIGATION
          ══════════════════════════════════ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/timesheet/myteam${isAdmin && activeManagerCode ? `?managerCode=${activeManagerCode}` : ""}`)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition cursor-pointer"
              title="Quay lại MYTEAM"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="p-2 bg-[#009999]/10 text-[#009999] rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                TEAMWORK — Nhật ký công việc nhóm
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {teamInfo.manager
                  ? `Nhóm phụ trách bởi: ${teamInfo.manager.hoTen} (${teamInfo.manager.maNhanSu}) — ${teamMembersList.length} thành viên`
                  : "Bảng tổng hợp chi tiết time record của tất cả thành viên trong nhóm"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown chọn Team cho Admin */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Chọn Team:</span>
              <Select
                className="w-60"
                value={activeManagerCode}
                onChange={(val) => {
                  setSelectedManagerCode(val);
                  setSearchParams({ managerCode: val });
                }}
                options={managersList}
                placeholder="Chọn trưởng nhóm..."
              />
            </div>
          )}

          <button
            onClick={() => fetchRows(1, pagination.pageSize)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition cursor-pointer text-xs font-medium"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════
           CẢNH BÁO TỈ LỆ ĐÓNG GÓP HỒ SƠ > 100%
          ══════════════════════════════════ */}
      {overContributedCases.length > 0 && (
        <div className="mb-4 p-4 bg-red-50/90 border-l-4 border-red-500 rounded-2xl shadow-sm text-left border border-red-100">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-red-100 text-red-700 rounded-xl">
              <AlertTriangle size={20} />
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-sm flex items-center gap-2">
                <span>Cảnh báo quản lý: Phát hiện tỉ lệ đóng góp hồ sơ vượt quá 100%</span>
                <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-xs font-extrabold">
                  {overContributedCases.length} hồ sơ vi phạm
                </span>
              </h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Có hồ sơ có tổng tỉ lệ đóng góp của các nhân sự trong nhóm vượt quá 100%. Quản lý vui lòng rà soát lại và yêu cầu nhân viên điều chỉnh để tránh sai lệch doanh thu:
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {overContributedCases.map(([code, data]) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-red-800 text-xs font-medium border border-red-200 shadow-2xs"
                  >
                    📁 <strong className="text-gray-900">{code}</strong>: Tổng{" "}
                    <span className="text-red-600 font-bold">{data.total}%</span>{" "}
                    <span className="text-gray-400">({Array.from(data.employees).join(", ")})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
           BỘ LỌC TÌM KIẾM
          ══════════════════════════════════ */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRows(1, pagination.pageSize);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          {/* Lọc nhân sự trong team */}
          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nhân sự trong team
            </label>
            <Select
              className="w-full text-left"
              allowClear
              placeholder="Tất cả team"
              value={filters.employeeCode || undefined}
              onChange={(val) => setFilter("employeeCode", val || "")}
              options={teamMembersList.map((m) => ({
                value: m.maNhanSu,
                label: `${m.maNhanSu} - ${m.hoTen} (${m.chucVu || "TV"})`,
              }))}
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
            <DatePicker
              className="w-full"
              placeholder="Từ ngày"
              format="DD/MM/YYYY"
              onChange={(date) =>
                setFilter("fromDate", date?.format("YYYY-MM-DD") || "")
              }
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
            <DatePicker
              className="w-full"
              placeholder="Đến ngày"
              format="DD/MM/YYYY"
              onChange={(date) =>
                setFilter("toDate", date?.format("YYYY-MM-DD") || "")
              }
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Mã hồ sơ</label>
            <CaseCodeSelect
              value={filters.caseCode}
              onChange={(v) => setFilter("caseCode", v)}
              allowCustom
              placeholder="Chọn hoặc nhập mã HS"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Hoạt động</label>
            <ActivitySelect
              value={filters.activity}
              onChange={(v) => setFilter("activity", v || "")}
              placeholder="Chọn hoạt động"
              className="text-left"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Mã KH</label>
            <input
              type="text"
              placeholder="Mã khách hàng"
              value={filters.customerCode}
              onChange={(e) => setFilter("customerCode", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#009999] focus:outline-none h-[32px]"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Mã đối tác</label>
            <input
              type="text"
              placeholder="Mã đối tác"
              value={filters.partnerCode}
              onChange={(e) => setFilter("partnerCode", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#009999] focus:outline-none h-[32px]"
            />
          </div>

          <div className="w-full sm:w-1/2 md:w-1/6">
            <label className="block text-xs font-medium text-gray-700 mb-1">Tìm nội dung</label>
            <input
              type="text"
              placeholder="Từ khóa..."
              value={filters.searchText}
              onChange={(e) => setFilter("searchText", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#009999] focus:outline-none h-[32px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-4 py-1.5 rounded-lg shadow-xs transition font-semibold text-xs h-[32px] flex items-center gap-1.5 cursor-pointer"
            >
              <Search size={14} />
              <span>Tìm kiếm</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({
                  employeeCode: "",
                  caseCode: "",
                  customerCode: "",
                  partnerCode: "",
                  activity: "",
                  searchText: "",
                  fromDate: "",
                  toDate: "",
                });
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium h-[32px] transition cursor-pointer"
            >
              Xóa lọc
            </button>
          </div>
        </form>

        {/* ── Mini Summary Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-700 font-medium">Tổng số time record</p>
              <strong className="text-xl text-teal-800 font-bold">{summary.totalItems || 0}</strong>
            </div>
            <span className="p-2 bg-white text-teal-600 rounded-lg shadow-2xs">
              <Clock size={20} />
            </span>
          </div>

          <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-700 font-medium">Tổng số giờ làm việc</p>
              <strong className="text-xl text-orange-800 font-bold">
                {Number(summary.totalHours || 0).toFixed(1)}h
              </strong>
            </div>
            <span className="p-2 bg-white text-orange-600 rounded-lg shadow-2xs">
              <Calendar size={20} />
            </span>
          </div>

          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-700 font-medium">Tổng doanh thu</p>
              <strong className="text-xl text-indigo-800 font-bold">
                {money(summary.totalAmount)} đ
              </strong>
            </div>
            <span className="p-2 bg-white text-indigo-600 rounded-lg shadow-2xs">
              <DollarSign size={20} />
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
           BẢNG TIME RECORDS CỦA TEAM
          ══════════════════════════════════ */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <Spin spinning={loading}>
          <table className="w-full border-collapse bg-white text-xs min-w-[950px]">
            <thead className="bg-[#009999] text-white">
              <tr className="text-white text-center">
                <th className="p-3 font-semibold text-white">Ngày</th>
                <th className="p-3 font-semibold text-white">Mã hồ sơ</th>
                <th className="p-3 font-semibold text-left text-white">Nhân sự</th>
                <th className="p-3 font-semibold text-left text-white">Hoạt động</th>
                <th className="p-3 font-semibold text-left text-white">Nội dung</th>
                <th className="p-3 font-semibold text-white">Số giờ</th>
                <th className="p-3 font-semibold text-white">Đóng góp (%)</th>
                <th className="p-3 font-semibold text-white">Đơn giá/h</th>
                <th className="p-3 font-semibold text-white">Thành tiền</th>
                <th className="p-3 font-semibold text-white">Trạng thái</th>
                <th className="p-3 font-semibold text-center text-white">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="text-center hover:bg-teal-50/30 transition">
                    <td className="p-3 text-gray-600 whitespace-nowrap">{formatDate(row.workDate)}</td>
                    <td className="p-3 font-medium text-[#009999]">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span>{row.caseCode || "-"}</span>
                        {row.caseCode && caseContributions[row.caseCode]?.total > 100 && (
                          <span
                            className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 text-[10px] font-bold"
                            title={`Tổng tỉ lệ đóng góp của hồ sơ "${row.caseCode}" là ${caseContributions[row.caseCode].total}% (> 100%). Cần điều chỉnh!`}
                          >
                            ⚠️ &gt;100%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-left">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {row.employee?.hoTen || row.employeeCode}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400">{row.employeeCode}</p>
                      </div>
                    </td>
                    <td className="p-3 text-left font-medium text-indigo-600">{row.activity}</td>
                    <td className="p-3 text-left text-gray-600 max-w-xs truncate" title={row.description}>
                      {row.description || "-"}
                    </td>
                    <td className="p-3 font-semibold text-orange-600">
                      {Number(row.hours || 0).toFixed(1)}
                    </td>
                    <td className="p-3">
                      {(() => {
                        const val = row.contributionPercentage ?? row.contributionRate ?? 100;
                        const num = Number(val);
                        return (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              num > 100
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {num}%
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-3">{money(row.hourlyRate)}</td>
                    <td className="p-3 font-semibold text-[#009999]">{money(row.totalAmount)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
                        {statusMap[row.status] || "Đã duyệt"}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setViewingRecord(row)}
                        className="px-2.5 py-1 bg-[#009999]/10 hover:bg-[#009999] hover:text-white text-[#009999] rounded-lg transition text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-gray-400">
                    Không tìm thấy time record nào của nhóm trong kỳ này.
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

      {/* ══════════════════════════════════
           MODAL XEM CHI TIẾT TIME RECORD
          ══════════════════════════════════ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <FileText size={18} className="text-[#009999]" />
            <span>Chi tiết Time Record</span>
          </div>
        }
        open={Boolean(viewingRecord)}
        onCancel={() => setViewingRecord(null)}
        footer={[
          <button
            key="close"
            onClick={() => setViewingRecord(null)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium cursor-pointer"
          >
            Đóng
          </button>,
        ]}
        width={520}
      >
        {viewingRecord && (
          <div className="py-2 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
              <div>
                <span className="text-gray-400">Nhân sự:</span>
                <p className="font-semibold text-gray-800 text-sm">
                  {viewingRecord.employee?.hoTen || viewingRecord.employeeCode}
                </p>
                <p className="font-mono text-gray-400">{viewingRecord.employeeCode}</p>
              </div>
              <div>
                <span className="text-gray-400">Ngày làm việc:</span>
                <p className="font-semibold text-gray-800">{formatDate(viewingRecord.workDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-400">Hoạt động:</span>
                <p className="font-semibold text-indigo-600">{viewingRecord.activity}</p>
              </div>
              <div>
                <span className="text-gray-400">Mã hồ sơ:</span>
                <p className="font-semibold text-[#009999]">{viewingRecord.caseCode || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
              <div>
                <span className="text-teal-700">Số giờ:</span>
                <p className="text-base font-bold text-orange-600">{viewingRecord.hours}h</p>
              </div>
              <div>
                <span className="text-teal-700">Đóng góp:</span>
                <p className="text-base font-bold text-blue-600">
                  {viewingRecord.contributionPercentage ?? 100}%
                </p>
              </div>
              <div>
                <span className="text-teal-700">Thành tiền:</span>
                <p className="text-base font-bold text-teal-800">{money(viewingRecord.totalAmount)}đ</p>
              </div>
            </div>

            {viewingRecord.description && (
              <div>
                <span className="text-gray-400">Nội dung công việc:</span>
                <p className="p-2.5 bg-gray-50 rounded-xl text-gray-700 mt-1 leading-relaxed">
                  {viewingRecord.description}
                </p>
              </div>
            )}

            {viewingRecord.notes && (
              <div>
                <span className="text-gray-400">Ghi chú:</span>
                <p className="p-2.5 bg-amber-50 rounded-xl text-amber-800 mt-1 border border-amber-100">
                  {viewingRecord.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
