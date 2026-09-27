import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Shield } from "lucide-react";

function StaffList() {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const [staffs, setStaffs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // ── State đổi vai trò / thăng cấp ──
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [staffToUpdateRole, setStaffToUpdateRole] = useState(null);
  const [newRole, setNewRole] = useState("staff");
  const [updatingRole, setUpdatingRole] = useState(false);

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

  const handleOpenRoleModal = (staff) => {
    if (!staff.Username) {
      toast.info(`Nhân sự ${staff.hoTen} chưa có tài khoản. Đang chuyển tới trang tạo tài khoản...`);
      navigate(`/registerstaff/${staff.maNhanSu}`);
      return;
    }
    setStaffToUpdateRole(staff);
    setNewRole(staff.Role || "staff");
    setRoleModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!staffToUpdateRole) return;
    setUpdatingRole(true);
    try {
      const res = await callAPI({
        method: "post",
        endpoint: "/staff/update-role",
        data: {
          maNhanSu: staffToUpdateRole.maNhanSu,
          role: newRole,
        },
      });
      toast.success(res?.message || `Cập nhật vai trò cho ${staffToUpdateRole.hoTen} thành công!`);
      setRoleModalOpen(false);
      setStaffToUpdateRole(null);
      fetchStaffs(searchTerm);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật vai trò nhân sự. Vui lòng kiểm tra API Backend /staff/update-role.");
    } finally {
      setUpdatingRole(false);
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
      console.error("Lỗi khi xóa nhân sự:", error);
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
        <thead className="bg-[#009999] text-white">
          <tr className="text-white text-center font-semibold">
            <th className="p-2 text-white font-semibold">{t("no")}</th>
            <th className="p-2 text-white font-semibold">{t("employeeCode")}</th>
            <th className="p-2 text-white font-semibold">{t("fullName")}</th>
            <th className="p-2 text-white font-semibold">{t("position")}</th>
            <th className="p-2 text-white font-semibold">{t("department")}</th>
            <th className="p-2 text-white font-semibold">{t("phoneNumber")}</th>
            <th className="p-2 text-white font-semibold">{t("email")}</th>
            <th className="p-2 text-white font-semibold">Đơn giá/giờ</th>
            <th className="p-2 text-white font-semibold">{t("username")}</th>
            <th className="p-2 text-white font-semibold">{t("role")}</th>
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
              <td className="p-2 text-table">{Number(staff.hourlyRate || 0).toLocaleString("vi-VN")}</td>
              <td className="p-2 text-table">
                {staff.Username ? staff.Username : "Chưa có tài khoản"}
              </td>
              <td className="p-2 text-table">
                {staff.Role ? (
                  <button
                    onClick={() => handleOpenRoleModal(staff)}
                    className="cursor-pointer group/role inline-flex items-center gap-1"
                    title="Bấm để đổi vai trò"
                  >
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                        staff.Role === "manager"
                          ? "bg-purple-50 text-purple-700 border-purple-200 group-hover/role:bg-purple-100"
                          : staff.Role === "admin"
                          ? "bg-blue-50 text-blue-700 border-blue-200 group-hover/role:bg-blue-100"
                          : staff.Role === "trainee"
                          ? "bg-amber-50 text-amber-700 border-amber-200 group-hover/role:bg-amber-100"
                          : "bg-teal-50 text-teal-700 border-teal-200 group-hover/role:bg-teal-100"
                      }`}
                    >
                      {staff.Role === "manager"
                        ? "Trưởng nhóm"
                        : staff.Role === "admin"
                        ? "Quản trị viên"
                        : staff.Role === "trainee"
                        ? "Thực tập sinh"
                        : "Nhân viên"}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/registerstaff/${staff.maNhanSu}`)}
                    className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
                  >
                    + Tạo tài khoản
                  </button>
                )}
              </td>


              <td className="p-2 relative">
                <div className="hidden group-hover:flex gap-1.5 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                  {staff.Username && (
                    <button
                      className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-1 text-xs font-medium cursor-pointer"
                      onClick={() => handleOpenRoleModal(staff)}
                      title="Phân quyền / Đổi vai trò"
                    >
                      <Shield size={13} />
                      <span>Vai trò</span>
                    </button>
                  )}
                  <button
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                    onClick={() => navigate(`/staffedit/${staff.maNhanSu}`)}
                    title="Chỉnh sửa thông tin"
                  >
                    📝
                  </button>
                  <button className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300 cursor-pointer"
                    onClick={() => {
                      setStaffToDelete(staff.maNhanSu);
                      setShowDeleteModal(true);
                    }}
                    title="Xóa nhân sự"
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

      {/* ══ Modal Phân quyền / Đổi vai trò ══ */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <Shield size={18} className="text-[#009999]" />
            <span>Phân quyền & Đổi vai trò nhân sự</span>
          </div>
        }
        open={roleModalOpen}
        onOk={handleUpdateRole}
        onCancel={() => {
          setRoleModalOpen(false);
          setStaffToUpdateRole(null);
        }}
        confirmLoading={updatingRole}
        okText="Lưu vai trò mới"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-[#009999] hover:bg-[#007a7a] cursor-pointer" }}
        width={480}
      >
        <div className="py-3 space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
            <p>Nhân sự: <strong className="text-gray-900">{staffToUpdateRole?.hoTen}</strong> ({staffToUpdateRole?.maNhanSu})</p>
            <p>Tài khoản đăng nhập: <strong className="text-gray-900">{staffToUpdateRole?.Username}</strong></p>
            <p>Vai trò hiện tại: <strong className="text-[#009999] uppercase">{staffToUpdateRole?.Role || "Chưa có"}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chọn vai trò mới <span className="text-red-500">*</span>
            </label>
            <Select
              className="w-full"
              value={newRole}
              onChange={(val) => setNewRole(val)}
              options={[
                { value: "staff", label: "Nhân viên (staff) — Xem & Báo cáo time cá nhân" },
                { value: "manager", label: "Trưởng nhóm (manager) — Quản lý team & xem KPI team" },
                { value: "admin", label: "Quản trị viên (admin) — Toàn quyền hệ thống & Office Summary" },
                { value: "trainee", label: "Thực tập sinh (trainee) — Báo cáo thử việc" },
              ]}
            />
          </div>

          {newRole === "manager" && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-800 leading-relaxed">
              ⭐ <strong>Thăng cấp lên Trưởng nhóm (Manager):</strong> Nhân sự này sẽ có thể quản lý nhóm nhân sự trực thuộc, xem báo cáo KPI của nhóm mình và theo dõi time record của các thành viên trong team.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default StaffList;
