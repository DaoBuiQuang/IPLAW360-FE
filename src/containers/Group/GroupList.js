import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Modal, Pagination } from "antd";

function GroupList() {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);

  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  // ✅ Lấy danh sách nhóm khách hàng
  const fetchGroups = async (searchValue = "", page = 1, size = 10) => {
    try {
      localStorage.setItem("groupListPage", page);
      const response = await callAPI({
        method: "post",
        endpoint: "/group/list",
        data: {
          tenNhomKhachHang: searchValue,
          pageIndex: page,
          pageSize: size,
        },
      });
      setGroups(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setPageIndex(response.pagination?.pageIndex || 1);
      setPageSize(response.pagination?.pageSize || 10);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách nhóm khách hàng:", error);
    }
  };

  // ✅ Khởi tạo khi load trang
  useEffect(() => {
    const savedPage = parseInt(localStorage.getItem("groupListPage") || "1", 10);
    fetchGroups("", savedPage, pageSize);
    localStorage.setItem("groupListPage", "1");
  }, []);

  // ✅ Xử lý xóa nhóm khách hàng
  const handleDeleteGroup = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/group/delete",
        data: { id: groupToDelete },
      });
      setShowDeleteModal(false);
      setGroupToDelete(null);
      fetchGroups(searchTerm, pageIndex, pageSize);
    } catch (error) {
      console.error("❌ Lỗi khi xóa nhóm khách hàng:", error);
    }
  };

  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          🏢 Danh sách nhóm khách hàng
        </h2>

        {/* Ô tìm kiếm và nút thêm */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchGroups(searchTerm, 1, pageSize);
            }}
            placeholder="🔍 Nhập tên nhóm khách hàng"
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchGroups(searchTerm, 1, pageSize)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => navigate("/groupadd")}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Thêm mới
            </button>
          </div>
        </div>
      </div>

      {/* Tổng số bản ghi */}
      <div className="mb-2 text-left text-gray-600 text-xl">
        {t("Tìm thấy")} <b className="text-blue-600">{totalItems}</b> {t("kết quả")}
      </div>

      {/* Bảng danh sách */}
      <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
        <thead>
          <tr className="text-[#667085] text-center font-normal">
            <th className="p-2">STT</th>
             <th className="p-2">Mã nhóm</th>
            <th className="p-2">Tên nhóm</th>
            <th className="p-2">Mô tả</th>
            <th className="p-2">Ngày cập nhật</th>
            <th className="p-2 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, index) => (
            <tr key={group.id} className="group hover:bg-gray-100 text-center border-b relative">
              <td className="p-2">{index + 1 + (pageIndex - 1) * pageSize}</td>
              <td className="p-2">{group.maNhom}</td>
              <td
                className="p-2 text-blue-500 cursor-pointer hover:underline"
                onClick={() => navigate(`/group/detail/${group.id}`)}
              >
                {group.tenNhom}
              </td>
              <td className="p-2">{group.moTa || ""}</td>
              <td className="p-2">
                {group.ngayCapNhat ? new Date(group.ngayCapNhat).toLocaleDateString() : ""}
              </td>

              <td className="p-2 relative">
                {(role === "admin" || role === "staff") && (
                  <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      onClick={() => navigate(`/groupedit/${group.id}`)}
                    >
                      📝
                    </button>
                    <button
                      className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                      onClick={() => {
                        setGroupToDelete(group.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="mt-4 flex flex-col items-center space-y-2">
        {totalItems > 0 && (
          <div className="text-sm text-gray-500 text-center">
            <span className="font-medium text-gray-800">
              {(pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, totalItems)}
            </span>
            <span className="mx-1"> / </span>
            <span className="font-medium text-gray-800">{totalItems}</span>
          </div>
        )}
        <Pagination
          current={pageIndex}
          total={totalItems}
          pageSize={pageSize}
          onChange={(page, size) => {
            setPageIndex(page);
            setPageSize(size);
            fetchGroups(searchTerm, page, size);
          }}
          showSizeChanger
          pageSizeOptions={["5", "10", "20", "50"]}
          locale={{ items_per_page: t("bản ghi") }}
        />
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onOk={handleDeleteGroup}
        onCancel={() => setShowDeleteModal(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>Bạn có chắc chắn muốn xóa nhóm khách hàng này không?</p>
      </Modal>
    </div>
  );
}

export default GroupList;
