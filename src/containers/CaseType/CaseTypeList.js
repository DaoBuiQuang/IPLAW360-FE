import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import callAPI from "../../utils/api";
import { useSelector } from 'react-redux';
import { Modal } from "antd";
function CaseTypeList() {
  const role = useSelector((state) => state.auth.role);
  const [casetypes, setCaseTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [casetypeToDelete, setCaseTypeToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchCaseTypes = async (searchValue) => {
    try {
      const response = await callAPI({
        method: "post",
        endpoint: "/casetype/list",
        data: { search: searchValue },
      });
      setCaseTypes(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu loại nghề nghiệp:", error);
    }
  };

  useEffect(() => {
    fetchCaseTypes("");
  }, []);
  const handleDeleteCasetype = async () => {
    try {
      await callAPI({
        method: "post",
        endpoint: "/casetype/delete",
        data: { maLoaiVuViec: casetypeToDelete },
      });
      setShowDeleteModal(false);
      setCaseTypeToDelete(null);
      fetchCaseTypes(searchTerm);
    } catch (error) {
      console.error("Lỗi khi xóa loại vụ việc:", error);
    }
  };
  return (
    <div className="p-1 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">📌 Danh sách loại vụ việc</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchCaseTypes(searchTerm);
              }
            }}
            placeholder="🔍 Nhập loại vụ việc"
            className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 search-input"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchCaseTypes(searchTerm)}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => navigate("/casetypeadd")}
              className="bg-[#009999] hover:bg-[#007a7a] text-white px-5 py-3 rounded-lg shadow-md transition"
            >
              ➕ Thêm mới
            </button>
          </div>
        </div>


      </div>
      <table className="w-full border-collapse bg-white text-sm mt-4 overflow-hidden rounded-lg border shadow">
        <thead>
          <tr className=" text-[#667085] text-center font-normal">
            <th className="p-2 text-table">STT</th>
            <th className="p-2 text-table">Mã loại vụ việc</th>
            <th className="p-2 text-table">Tên loại vụ việc</th>
            <th className="p-2 text-table">Mô tả</th>
            <th className="p-2 text-center text-table"></th>
          </tr>
        </thead>
        <tbody>
          {casetypes.map((casetype, index) => (
            <tr
              key={casetype.id}
              className="group hover:bg-gray-100 text-center border-b relative"
            >
              <td className="p-2 text-table">{index + 1}</td>
              <td
                className="p-2 text-table text-blue-500 cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/casetypedetail/${casetype.maLoaiVuViec}`);
                }}
              >
                {casetype.maLoaiVuViec}
              </td>
              <td className="p-2 text-table">{casetype.tenLoaiVuViec}</td>
              <td className="p-2 text-table">{casetype.moTa}</td>
              <td className="p-2 relative">
                {(role === 'admin' || role === 'staff') && (
                  <div className="hidden group-hover:flex gap-2 absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1 rounded shadow-md z-10">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      onClick={() => navigate(`/casetypeedit/${casetype.maLoaiVuViec}`)}
                    >
                      📝
                    </button>
                    <button className="px-3 py-1 bg-red-200 text-red-600 rounded-md hover:bg-red-300"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setCaseTypeToDelete(casetype.maLoaiVuViec);
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
      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onOk={handleDeleteCasetype}
        onCancel={() => setShowDeleteModal(false)}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 text-white",
        }}
      >
        <p>Bạn có chắc chắn muốn xóa loại vụ việc này không?</p>
      </Modal>
    </div>
  );
}

export default CaseTypeList;
