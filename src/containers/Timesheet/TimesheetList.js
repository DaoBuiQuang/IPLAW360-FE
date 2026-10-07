import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";
import { DatePicker, Modal, Pagination, Spin } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
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

export default function TimesheetList() {
  const navigate = useNavigate();

  // ── Phân quyền ──
  const role = useSelector((state) => state.auth.role);
  const currentMaNhanSu = localStorage.getItem("maNhanSu") || "";
  const isStaff = role === "staff" || role === "trainee";
  const isManager = role === "manager";
  const isAdmin = role === "admin" || role === "ceo";

  // Chỉ cho phép xem, sửa, xóa với timerecord của bản thân; timerecord của nhân viên khác chỉ được xem
  const canEditDelete = (record) =>
    Boolean(record?.employeeCode && record.employeeCode === currentMaNhanSu);

  // ── Bảng dữ liệu (có phân trang) ──
  const [rows, setRows] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const currentStaff = staffs.find((staff) => staff.maNhanSu === currentMaNhanSu);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeCode: "",
    caseCode: "",
    customerCode: "",
    partnerCode: "",
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

  // ── Helpers ──
  const setFilter = (key, value) =>
    setFilters((old) => ({ ...old, [key]: value }));

  const getFilterPayload = () => ({
    employeeCode: isStaff
      ? currentMaNhanSu
      : (filters.employeeCode || undefined),
    caseCode: filters.caseCode || undefined,
    customerCode: filters.customerCode || undefined,
    partnerCode: filters.partnerCode || undefined,
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
    } catch {
      setDeleting(null);
    }
  };

  // ── Init ──
  useEffect(() => {
    const loadStaffs = async () => {
      try {
        if (isManager) {
          // Manager: lấy danh sách thành viên trong team của mình
          const res = await callAPI({ method: "post", endpoint: "/staff/myteam", data: {} });
          const members = res?.members || res?.data || (Array.isArray(res) ? res : []);
          setStaffs(members);
        } else {
          // Admin hoặc Staff: lấy basiclist
          const res = await callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} });
          setStaffs(Array.isArray(res) ? res : res?.data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân sự:", err);
        setStaffs([]);
      }
    };

    loadStaffs();
    fetchRows(1, 20);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Giám sát tỉ lệ đóng góp theo từng mã hồ sơ (nếu tổng đóng góp > 100%) ──
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

        {/* Bộ lọc hỗ trợ gõ 1 từ mở droplist & nhấn Enter để tìm kiếm */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRows(1, pagination.pageSize);
          }}
          className="flex flex-wrap items-end gap-3 mb-4"
        >
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
                label: `${s.maNhanSu} - ${s.hoTen || s.chucVu || ""}`,
              }))}
              value={isStaff
                ? { value: currentMaNhanSu, label: currentStaff?.hoTen ? `${currentMaNhanSu} - ${currentStaff.hoTen}` : currentMaNhanSu }
                : (filters.employeeCode ? { value: filters.employeeCode, label: filters.employeeCode } : null)}
              onChange={(o) => setFilter("employeeCode", o?.value || "")}
              placeholder={isStaff ? "Nhân sự của tôi" : isManager ? "Tất cả team" : "Chọn nhân sự"}
              isClearable={!isStaff}
              isDisabled={isStaff}
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Mã hồ sơ
            </label>
            <CaseCodeSelect
              value={filters.caseCode}
              onChange={(value) => setFilter("caseCode", value)}
              allowCustom
              placeholder="Chọn hoặc nhập mã hồ sơ"
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Hoạt động
            </label>
            <ActivitySelect
              value={filters.activity}
              onChange={(actVal) => setFilter("activity", actVal || "")}
              placeholder="Chọn hoạt động"
              className="text-left"
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Mã KH
            </label>
            <input
              type="text"
              placeholder="Mã khách hàng"
              value={filters.customerCode}
              onChange={(e) => setFilter("customerCode", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-[#009999] focus:outline-none h-[38px]"
            />
          </div>
          <div className="w-full md:w-1/6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Mã đối tác
            </label>
            <input
              type="text"
              placeholder="Mã đối tác"
              value={filters.partnerCode}
              onChange={(e) => setFilter("partnerCode", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-[#009999] focus:outline-none h-[38px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-2 rounded-lg shadow-md transition font-medium h-[38px] flex items-center justify-center cursor-pointer"
            >
              Tìm kiếm
            </button>
            {(filters.employeeCode || filters.caseCode || filters.customerCode || filters.partnerCode || filters.activity || filters.fromDate || filters.toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    employeeCode: "",
                    caseCode: "",
                    customerCode: "",
                    partnerCode: "",
                    activity: "",
                    status: "",
                    fromDate: "",
                    toDate: "",
                  });
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium h-[38px] transition cursor-pointer"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </form>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-[#009999]">
            <p className="text-sm text-gray-500">Tổng số time record</p>
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
            <p className="text-sm text-gray-500">Tổng doanh thu</p>
            <strong className="text-xl text-indigo-600">
              {money(summary.totalAmount)} đ
            </strong>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════
           TABLE VIEW & MANAGER MONITORING
          ══════════════════════════════ */}
      {/* Banner cảnh báo Manager nếu có hồ sơ vượt quá 100% tỉ lệ đóng góp */}
      {(role === "admin" || role === "manager") && overContributedCases.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 border-l-4 border-red-500 rounded-r-lg shadow-sm text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-800 text-sm">
                Cảnh báo giám sát tỉ lệ đóng góp hồ sơ
              </h4>
              <p className="text-xs text-red-700 mt-1">
                Phát hiện <strong>{overContributedCases.length}</strong> hồ sơ có tổng tỉ lệ đóng góp của các nhân sự vượt quá 100%. Quản lý vui lòng yêu cầu nhân sự liên quan xem xét và điều chỉnh lại:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {overContributedCases.map(([code, data]) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-red-700 text-xs font-medium border border-red-200 shadow-sm"
                  >
                    📁 <strong>{code}</strong>: Tổng <span className="text-red-600 font-bold">{data.total}%</span> (Nhân sự: {Array.from(data.employees).join(", ")})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto mt-4 rounded-lg border shadow bg-white">
        <Spin spinning={loading}>
          <table className="w-full border-collapse bg-white text-sm">
            <thead className="bg-[#009999] text-white">
              <tr className="text-white text-center">
                <th className="p-3 text-xs font-semibold text-white">Ngày</th>
                <th className="p-3 text-xs font-semibold text-white">Mã hồ sơ</th>
                <th className="p-3 text-xs font-semibold text-white">Nhân sự</th>
                <th className="p-3 text-xs font-semibold text-left text-white">Hoạt động</th>
                <th className="p-3 text-xs font-semibold text-left text-white">Nội dung</th>
                <th className="p-3 text-xs font-semibold text-white">Số giờ</th>
                <th className="p-3 text-xs font-semibold text-white">Đóng góp (%)</th>
                <th className="p-3 text-xs font-semibold text-white">Đơn giá/giờ</th>
                <th className="p-3 text-xs font-semibold text-white">Thành tiền</th>
                <th className="p-3 text-xs font-semibold text-white">Trạng thái</th>
                <th className="p-3 text-xs font-semibold text-white">Thao tác</th>
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
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span>{row.caseCode || "-"}</span>
                        {row.caseCode && caseContributions[row.caseCode]?.total > 100 && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 text-[11px] font-bold"
                            title={`Tổng tỉ lệ đóng góp của hồ sơ "${row.caseCode}" đang là ${caseContributions[row.caseCode].total}% (> 100%). Cần xem xét lại!`}
                          >
                            ⚠️ &gt;100%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-table text-gray-700">
                      {row.employee?.hoTen || row.employeeCode}
                    </td>
                    <td className="p-3 text-table text-left font-medium text-indigo-600">
                      {row.activity}
                    </td>
                    <td className="p-3 text-table text-left text-gray-600 max-w-xs truncate" title={row.description}>
                      {row.description || "-"}
                    </td>
                    <td className="p-3 text-table font-semibold text-orange-600">
                      {Number(row.hours || 0)}
                    </td>
                    <td className="p-3 text-table">
                      {(() => {
                        const val = row.contributionPercentage ?? row.contributionRate ?? 100;
                        const num = Number(val);
                        return (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
                      {canEditDelete(row) && (
                        <>
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
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-gray-500">
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
    </div>
  );
}
