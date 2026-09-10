import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { DatePicker, Modal, Pagination, Spin } from "antd";
import CaseCodeSelect from "./CaseCodeSelect";
import callAPI from "../../utils/api";

const statusMap = { APPROVED: "Đã duyệt" };
const money = (value) => Number(value || 0).toLocaleString("vi-VN");

export default function TimesheetList() {
  const navigate = useNavigate();
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
  useEffect(() => {
    Promise.all([
      callAPI({ method: "post", endpoint: "/staff/basiclist", data: {} }),
      fetchRows(1, 20),
    ])
      .then(([staff]) => setStaffs(staff || []))
      .catch(() => setStaffs([]));
  }, []);
  const deleteRow = async () => {
    await callAPI({
      method: "delete",
      endpoint: "/timesheet/delete",
      data: { id: deleting.id },
    });
    setDeleting(null);
    fetchRows();
  };
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            📌 Danh sách Log time
          </h2>
          <button
            onClick={() => navigate("/timesheetadd")}
            className="bg-[#009999] text-white px-4 py-2 rounded-lg"
          >
            Thêm log time
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
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
              className="border w-full focus:outline-none focus:ring-2 search-input rounded-lg p-2 text-sm"
              placeholder="Nhập hoạt động"
              value={filters.activity}
              onChange={(e) => setFilter("activity", e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => fetchRows(1, pagination.pageSize)}
          className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
        >
          Tìm kiếm
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="bg-white p-3 rounded-lg shadow">
          <p className="text-sm text-gray-500">Tổng số logtime</p>
          <strong>{summary.totalItems || 0}</strong>
        </div>
        <div className="bg-white p-3 rounded-lg shadow">
          <p className="text-sm text-gray-500">Tổng số giờ</p>
          <strong>{Number(summary.totalHours || 0)}</strong>
        </div>
        <div className="bg-white p-3 rounded-lg shadow">
          <p className="text-sm text-gray-500">Tổng chi phí</p>
          <strong>{money(summary.totalAmount)}</strong>
        </div>
      </div>
      <div className="overflow-x-auto mt-4 rounded-lg border shadow">
        <Spin spinning={loading}>
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="text-[#667085] text-center">
                <th className="p-2">Ngày</th>
                <th className="p-2">Mã hồ sơ</th>
                <th className="p-2">Nhân sự</th>
                <th className="p-2">Hoạt động</th>
                <th className="p-2">Nội dung</th>
                <th className="p-2">Số giờ</th>
                <th className="p-2">Đơn giá/giờ</th>
                <th className="p-2">Thành tiền</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="text-center border-b hover:bg-gray-50"
                  >
                    <td className="p-2">{row.workDate}</td>
                    <td className="p-2">{row.caseCode}</td>
                    <td className="p-2">
                      {row.employee?.hoTen || row.employeeCode}
                    </td>
                    <td className="p-2">{row.activity}</td>
                    <td className="p-2">{row.description || "-"}</td>
                    <td className="p-2">{Number(row.hours || 0)}</td>
                    <td className="p-2">{money(row.hourlyRate)}</td>
                    <td className="p-2">{money(row.totalAmount)}</td>
                    <td className="p-2">Đã duyệt</td>
                    <td className="p-2">
                      <button
                        onClick={() => navigate(`/timesheetdetail/${row.id}`)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded mr-1"
                      >
                        Xem
                      </button>
                      {!["APPROVED", "LOCKED"].includes(row.status) && (
                        <>
                          <button
                            onClick={() => navigate(`/timesheetedit/${row.id}`)}
                            className="px-2 py-1 bg-gray-200 rounded mr-1"
                          >
                            📝
                          </button>
                          <button
                            onClick={() => setDeleting(row)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-500">
                    Không có bản ghi nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Spin>
      </div>
      <div className="mt-4 flex justify-center">
        <Pagination
          current={pagination.pageIndex}
          total={pagination.totalItems}
          pageSize={pagination.pageSize}
          showSizeChanger
          pageSizeOptions={["20", "50", "100"]}
          onChange={(page, size) => fetchRows(page, Math.min(size, 100))}
        />
      </div>
      <Modal
        title="Xác nhận xóa"
        open={Boolean(deleting)}
        onOk={deleteRow}
        onCancel={() => setDeleting(null)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc muốn xóa timesheet này không?</p>
      </Modal>
    </div>
  );
}
