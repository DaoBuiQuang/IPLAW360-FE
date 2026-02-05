import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from "react-redux";
import { Modal, message } from "antd";

function ContactPersonList() {
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactIdToDelete, setContactIdToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async (searchValue = "") => {
    try {
      setLoading(true);
      const response = await callAPI({
        method: "post",
        endpoint: "/contacts/list",
        data: { search: searchValue },
      });

      // Backend có thể trả về mảng hoặc { items, pagination }
      const items = Array.isArray(response) ? response : response?.items || [];
      setContacts(items);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người liên hệ:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts("");
  }, []);

  const handleDeleteContact = async () => {
    if (!contactIdToDelete) return;
    try {
      await callAPI({
        method: "post",
        endpoint: "/contacts/delete",
        data: { id: contactIdToDelete },
      });
      message.success("Xóa người liên hệ thành công");
      setShowDeleteModal(false);
      setContactIdToDelete(null);
      fetchContacts(searchTerm);
    } catch (error) {
      console.error("Lỗi khi xóa người liên hệ:", error);
      message.error("Xóa người liên hệ thất bại");
    }
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📇 Danh sách người liên hệ
        </h2>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchContacts(searchTerm);
            }}
            placeholder="🔍 Tìm theo tên / SĐT / địa chỉ / ghi chú"
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchContacts(searchTerm)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Tìm kiếm"}
            </button>
            <button
              onClick={() => navigate("/contactpersonadd")}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              ➕ Thêm mới
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <table className="w-full border-collapse bg-white text-sm overflow-hidden rounded-lg border shadow">
          <thead>
            <tr className="text-[#667085] text-center font-normal">
              <th className="p-2 text-table">STT</th>
              <th className="p-2 text-table">Tên người liên hệ</th>
              <th className="p-2 text-table">Số điện thoại</th>
              <th className="p-2 text-table">Địa chỉ</th>
              <th className="p-2 text-table">Ghi chú</th>
              <th className="p-2 text-center text-table"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  {loading ? "Đang tải dữ liệu..." : "Không có người liên hệ nào"}
                </td>
              </tr>
            ) : (
              contacts.map((c, index) => (
                <tr
                  key={c.id}
                  className="group hover:bg-gray-100 text-center border-b relative"
                >
                  <td className="p-2 text-table">{index + 1}</td>

                  {/* <td
                    className="p-2 text-table text-blue-500 cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/contact/detail/${c.id}`);
                    }}
                    title="Xem chi tiết"
                  >
                    {c.tenNguoiLienHe}
                  </td> */}
                  <td className="p-2 text-table">{c.tenNguoiLienHe || "-"}</td>
                  <td className="p-2 text-table">{c.sdt || "-"}</td>
                  <td className="p-2 text-table">{c.diaChi || "-"}</td>
                  <td className="p-2 text-table">{c.ghiChu || "-"}</td>

                  <td className="p-2 relative">
                    {(role === "admin" || role === "staff") && (
                      <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                        <button
                          className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                          onClick={() => navigate(`/contactpersonedit/${c.id}`)}
                          title="Chỉnh sửa"
                        >
                          📝
                        </button>
                        <button
                          className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                          onClick={() => {
                            setShowDeleteModal(true);
                            setContactIdToDelete(c.id);
                          }}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onOk={handleDeleteContact}
        onCancel={() => setShowDeleteModal(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-red-500 hover:bg-red-600 text-white" }}
      >
        <p>Bạn có chắc chắn muốn xóa người liên hệ này không?</p>
      </Modal>
    </div>
  );
}

export default ContactPersonList;
