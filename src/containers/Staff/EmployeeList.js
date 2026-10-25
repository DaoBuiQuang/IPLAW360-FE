import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

function EmployeeList() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchEmployees = async (searchValue) => {
    setLoading(true);
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/staff/list",
        data: {
          hoTen: searchValue,
        },
      });

      const rawList = Array.isArray(response) ? response : response?.data || [];
      // Chỉ chứa thông tin các nhân viên không thuộc phòng ban CNTT
      const nonItStaff = rawList.filter((s) => {
        const dept = (s.phongBan || "").trim().toUpperCase();
        return dept !== "CNTT";
      });

      // Sắp xếp theo phòng ban và theo họ tên
      nonItStaff.sort((a, b) => {
        const deptCompare = (a.phongBan || "").localeCompare(b.phongBan || "", "vi", { sensitivity: "base" });
        if (deptCompare !== 0) return deptCompare;
        return (a.hoTen || "").localeCompare(b.hoTen || "", "vi", { sensitivity: "base" });
      });

      setEmployees(nonItStaff);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/staff/delete",
        data: { maNhanSu: staffToDelete },
      });
      toast.success("Xóa nhân viên thành công");
      setShowDeleteModal(false);
      setStaffToDelete(null);
      fetchEmployees(searchTerm);
    } catch (error) {
      console.error("Lỗi khi xóa nhân sự:", error);
      toast.error("Lỗi khi xóa nhân viên");
    }
  };

  useEffect(() => {
    fetchEmployees("");
  }, []);

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">📌 Danh sách nhân viên</h2>
          <span className="text-xs bg-teal-50 text-[#009999] border border-teal-200 px-3 py-1 rounded-full font-medium">
            Tổng số: {employees.length} nhân viên
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchEmployees(searchTerm);
              }
            }}
            placeholder={`🔍 ${t("enterEmployeeName") || "Nhập tên nhân viên hoặc mã..."}`}
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchEmployees(searchTerm)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition cursor-pointer"
            >
              {t("search") || "Tìm kiếm"}
            </button>
            <button
              onClick={() => navigate("/staffadd")}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition cursor-pointer"
            >
              + {t("addNew") || "Thêm mới"}
            </button>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
        <thead className="bg-[#009999] text-white">
          <tr className="text-white text-center font-semibold">
            <th className="p-2 text-white font-semibold w-12">{t("no") || "STT"}</th>
            <th className="p-2 text-white font-semibold text-left">{t("fullName") || "Họ và tên"}</th>
            <th className="p-2 text-white font-semibold">{t("position") || "Chức vụ"}</th>
            <th className="p-2 text-white font-semibold">{t("department") || "Phòng ban"}</th>
            <th className="p-2 text-white font-semibold">{t("phoneNumber") || "Số điện thoại"}</th>
            <th className="p-2 text-white font-semibold">{t("email") || "Email"}</th>
            <th className="p-2 text-white font-semibold">Đơn giá/ giờ</th>
            <th className="p-2 text-center w-28">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-gray-400">
                Đang tải danh sách nhân viên...
              </td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-gray-400">
                Không tìm thấy nhân viên nào phù hợp.
              </td>
            </tr>
          ) : (
            employees.map((staff, index) => (
              <tr key={staff.maNhanSu} className="group relative hover:bg-teal-50/20 text-center border-b transition">
                <td className="p-2 text-table text-gray-500">{index + 1}</td>
                <td className="p-2 text-table text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                      onClick={() => navigate(`/staffdetail/${staff.maNhanSu}`)}
                      title="Bấm để xem chi tiết"
                    >
                      {staff.hoTen}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">({staff.maNhanSu})</span>
                  </div>
                </td>
                <td className="p-2 text-table">{staff.chucVu || "—"}</td>
                <td className="p-2 text-table">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {staff.phongBan || "—"}
                  </span>
                </td>
                <td className="p-2 text-table">{staff.sdt || "—"}</td>
                <td className="p-2 text-table text-gray-600">{staff.email || "—"}</td>
                <td className="p-2 text-table font-semibold text-teal-800">
                  {Number(staff.hourlyRate || 0).toLocaleString("vi-VN")} đ
                </td>
                <td className="p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition cursor-pointer text-xs"
                      onClick={() => navigate(`/staffedit/${staff.maNhanSu}`)}
                      title="Chỉnh sửa thông tin"
                    >
                      📝 Sửa
                    </button>
                    <button
                      className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition cursor-pointer text-xs"
                      onClick={() => {
                        setStaffToDelete(staff.maNhanSu);
                        setShowDeleteModal(true);
                      }}
                      title="Xóa nhân viên"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal
        title={t("confirmDeleteTitle") || "Xác nhận xóa"}
        open={showDeleteModal}
        onOk={handleDeleteStaff}
        onCancel={() => setShowDeleteModal(false)}
        okText={t("confirmDeleteTitle") || "Xác nhận"}
        cancelText={t("cancel") || "Hủy bỏ"}
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>{t("confirmDelete") || "Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?"}</p>
      </Modal>
    </div>
  );
}

export default EmployeeList;
