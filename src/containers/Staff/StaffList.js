import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
function StaffList() {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const [staffs, setStaffs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchStaffs = async (searchValue) => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/staff/list",
        data: {
          hoTen: searchValue
        },
      });
      setStaffs(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
    }
  };
  const handleDeleteStaff = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/staff/delete",
        data: { maNhanSu: staffToDelete },
      });
      setShowDeleteModal(false);
      setStaffToDelete(null);
      fetchStaffs(searchTerm); // load lại danh sách
    } catch (error) {
      console.error("Lỗi khi xóa đối tác:", error);
    }
  };
  useEffect(() => {
    fetchStaffs("");
  }, []);

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌{t("personnelList")}</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchStaffs(searchTerm);
              }
            }}
            placeholder={`🔍 ${t("enterEmployeeName")}`}
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchStaffs(searchTerm)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              {t("search")}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/staffadd")}
                className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
              >
                {t("addNew")}
              </button>
            </div>
          </div>

        </div>
      </div>

      <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
        <thead>
          <tr className=" text-[#667085] text-center font-normal">
            <th className="p-2 text-table">{t("no")}</th>
            <th className="p-2 text-table">{t("employeeCode")}</th>
            <th className="p-2 text-table">{t("fullName")}</th>
            <th className="p-2 text-table">{t("position")}</th>
            <th className="p-2 text-table">{t("department")}</th>
            <th className="p-2 text-table">{t("phoneNumber")}</th>
            <th className="p-2 text-table">{t("email")}</th>
            <th className="p-2 text-table">{t("username")}</th>
            <th className="p-2 text-table">{t("role")}</th>
            <th className="p-2 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff, index) => (
            <tr key={staff.maNhanSu} className="group relative hover:bg-gray-100 text-center border-b">
              <td className="p-2 text-table">{index + 1}</td>
              <td className="p-2 text-table text-blue-500 cursor-pointer hover:underline" onClick={(e) => {
                e.stopPropagation();
                navigate(`/staffdetail/${staff.maNhanSu}`);
              }}>{staff.maNhanSu}</td>
              <td className="p-2 text-table">{staff.hoTen}</td>
              <td className="p-2 text-table">{staff.chucVu}</td>
              <td className="p-2 text-table">{staff.phongBan}</td>
              <td className="p-2 text-table">{staff.sdt}</td>
              <td className="p-2 text-table">{staff.email}</td>
              <td className="p-2 text-table">
                {staff.Username ? staff.Username : "Chưa có tài khoản"}
              </td>
              <td className="p-2 text-table">
                {staff.Role
                  ? staff.Role === "staff"
                    ? "Nhân viên"
                    : staff.Role === "admin"
                      ? "Quản trị viên"
                      : staff.Role
                  : "Chưa có tài khoản"}
              </td>


              <td className="p-2 relative">
                <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                    onClick={() => navigate(`/staffedit/${staff.maNhanSu}`)}
                  >
                    📝
                  </button>
                  <button className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                    onClick={() => {
                      setStaffToDelete(staff.maNhanSu);
                      setShowDeleteModal(true);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        title={`${t("confirmDeleteTitle")}`}
        open={showDeleteModal}
        onOk={handleDeleteStaff}
        onCancel={() => setShowDeleteModal(false)}
        okText={`${t("confirmDeleteTitle")}`}
        cancelText={`${t("cancel")}`}
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>{t("confirmDelete")}</p>
      </Modal>
    </div>
  );
}

export default StaffList;